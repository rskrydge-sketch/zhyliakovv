<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Appointment\Appointment;
use App\Repository\Entity\Appointment\AppointmentRepository;
use App\Services\Google\GoogleCalendarService;
use DateTime;
use DateTimeZone;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Throwable;

#[AsCommand(
    name: 'app:appointments:sync-from-google',
    description: 'Синхронізує час записів із Google Calendar (перенесені/видалені події)',
)]
class SyncAppointmentsFromGoogleCommand extends Command
{

    /**
     * @param EntityManagerInterface $entityManager
     * @param AppointmentRepository  $appointmentRepository
     * @param GoogleCalendarService  $googleCalendarService
     * @param LoggerInterface        $logger
     */
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly AppointmentRepository  $appointmentRepository,
        private readonly GoogleCalendarService  $googleCalendarService,
        private readonly LoggerInterface        $logger
    ) {
        parent::__construct();
    }

    /**
     * @param InputInterface  $input
     * @param OutputInterface $output
     * @return int
     * @throws \Exception
     */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Беремо заплановані записи з подією Google від початку сьогоднішнього дня
        $from = (new DateTime('today', new DateTimeZone('Europe/Kiev')))->getTimestamp();
        $appointments = $this->appointmentRepository->findPlannedWithGoogleEvent($from);

        $moved     = 0;
        $cancelled = 0;
        $skipped   = 0;

        foreach ($appointments as $appointment) {
            /** @var Appointment $appointment */
            $googleEventId = $appointment->getGoogleCalendarEventId();

            if (!$googleEventId) {
                continue;
            }

            try {
                $event = $this->googleCalendarService->getEvent($googleEventId);
            } catch (Throwable $exception) {
                // Тимчасова помилка API — не чіпаємо запис, спробуємо наступного разу
                $this->logger->warning('Google sync skip #' . $appointment->getId() . ': ' . $exception->getMessage());
                $io->warning('Пропущено #' . $appointment->getId() . ' (помилка API)');

                $skipped++;

                continue;
            }

            // Подію видалено/скасовано в Google — скасовуємо запис у CRM
            if ($event === null) {
                $appointment->setStatus(Appointment::STATUS_CANCELLED);

                $cancelled++;
                $io->text('Скасовано #' . $appointment->getId() . ' (видалено в Google)');

                continue;
            }

            $googleDateTime = $event->getStart()->getDateTime();

            if (!$googleDateTime) {
                continue;
            }

            $googleTimestamp = (new DateTime($googleDateTime))->getTimestamp();

            // Час у Google не змінився — нічого не робимо
            if ($googleTimestamp === $appointment->getScheduledAt()->getTimestamp()) {
                continue;
            }

            // Переносимо запис у CRM на актуальний час із Google
            $newScheduledAt = (new DateTime('@' . $googleTimestamp))->setTimezone(new DateTimeZone('Europe/Kiev'));

            $oldTime = $appointment->getScheduledAt()->format('Y-m-d H:i');
            $appointment->setScheduledAt($newScheduledAt);

            $moved++;
            $io->text('Перенесено #' . $appointment->getId() . ': ' . $oldTime . ' -> ' . $newScheduledAt->format('Y-m-d H:i'));
        }

        $this->entityManager->flush();

        $io->success(sprintf('Синхронізація завершена. Перенесено: %d, скасовано: %d, пропущено: %d', $moved, $cancelled, $skipped));

        return Command::SUCCESS;
    }

}
