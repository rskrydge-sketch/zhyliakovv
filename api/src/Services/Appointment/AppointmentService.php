<?php

declare(strict_types=1);

namespace App\Services\Appointment;

use App\Entity\Appointment\Appointment;
use App\Entity\Service\Service;
use App\Repository\Entity\Appointment\AppointmentRepository;
use App\Services\Client\ClientService;
use App\Services\Google\GoogleCalendarService;
use App\Services\Service\ProcedureService;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AppointmentService
{

    /**
     * @param EntityManagerInterface $entityManager
     * @param AppointmentRepository $appointmentRepository
     * @param ClientService $clientService
     * @param ProcedureService $procedureService
     * @param GoogleCalendarService $googleCalendarService
     */
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly AppointmentRepository  $appointmentRepository,
        private readonly ClientService          $clientService,
        private readonly ProcedureService       $procedureService,
        private readonly GoogleCalendarService  $googleCalendarService
    ) {}

    /**
     * @param int|null $clientId
     * @param string|null $date
     * @param string|null $dateFrom
     * @param string|null $dateTo
     * @param string|null $status
     * @param int $page
     * @param int $limit
     * @return array{data: Appointment[], totalItems: int}
     */
    public function getList(?int $clientId, ?string $date, ?string $dateFrom, ?string $dateTo, ?string $status, int $page, int $limit): array
    {
        return $this->appointmentRepository->findByFilters($clientId, $date, $dateFrom, $dateTo, $status, $page, $limit);
    }

    /**
     * @param int $id
     * @return Appointment
     * @throws NotFoundHttpException
     */
    public function getById(int $id): Appointment
    {
        $appointment = $this->appointmentRepository->find($id);

        if (!$appointment) {
            throw new NotFoundHttpException('Запис не знайдено');
        }

        return $appointment;
    }

    /**
     * @param array<string, mixed> $data
     * @return Appointment
     * @throws Exception
     */
    public function create(array $data): Appointment
    {
        $client = $this->clientService->getById((int)$data['clientId']);
        $service = $this->procedureService->getById((int)$data['serviceId']);

        $scheduledAt = new DateTime($data['scheduledAt'], new \DateTimeZone('Europe/Kiev'));

        // Перевіряємо накладання з існуючими записами
        $this->checkOverlap($scheduledAt, $service);

        $appointment = new Appointment();

        $appointment
            ->setClient($client)
            ->setService($service)
            ->setScheduledAt($scheduledAt)
            ->setPrice((string)$data['price'])
            ->setNotes($data['notes'] ?? null)
            ->setStatus($data['status'] ?? Appointment::STATUS_PLANNED);

        $this->entityManager->persist($appointment);
        $this->entityManager->flush();

        // Синхронізуємо з Google Calendar
        $googleEventId = $this->googleCalendarService->createEvent($appointment);

        if ($googleEventId) {
            $appointment->setGoogleCalendarEventId($googleEventId);

            $this->entityManager->flush();
        }

        return $appointment;
    }

    /**
     * @param int $id
     * @param array<string, mixed> $data
     * @return Appointment
     * @throws NotFoundHttpException|Exception
     */
    public function update(int $id, array $data): Appointment
    {
        $appointment = $this->getById($id);

        if (isset($data['clientId'])) {
            $client = $this->clientService->getById((int)$data['clientId']);
            $appointment->setClient($client);
        }

        if (isset($data['serviceId'])) {
            $service = $this->procedureService->getById((int)$data['serviceId']);
            $appointment->setService($service);
        }

        if (isset($data['scheduledAt'])) {
            $appointment->setScheduledAt(new DateTime($data['scheduledAt'], new \DateTimeZone('Europe/Kiev')));
        }

        // Перевіряємо накладання якщо змінився час або послуга
        if (isset($data['scheduledAt']) || isset($data['serviceId'])) {
            $this->checkOverlap($appointment->getScheduledAt(), $appointment->getService(), $appointment->getId());
        }

        if (isset($data['price'])) {
            $appointment->setPrice((string)$data['price']);
        }

        if (array_key_exists('notes', $data)) {
            $appointment->setNotes($data['notes']);
        }

        if (isset($data['status'])) {
            $appointment->setStatus($data['status']);
        }

        $this->entityManager->flush();

        // Синхронізуємо зміни з Google Calendar
        $this->googleCalendarService->updateEvent($appointment);

        return $appointment;
    }

    /**
     * @param DateTime $scheduledAt
     * @param Service $service
     * @param int|null $excludeId
     * @return void
     * @throws RuntimeException
     */
    private function checkOverlap(DateTime $scheduledAt, Service $service, ?int $excludeId = null): void
    {
        $newStart = $scheduledAt->getTimestamp();
        $newEnd = $newStart + ($service->getDurationMinutes() ?? 0) * 60;

        $overlapping = $this->appointmentRepository->findOverlapping($newStart, $newEnd, $excludeId);

        if (count($overlapping) > 0) {
            throw new RuntimeException('На цей час вже є запис. Оберіть інший час.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    /**
     * @param int $id
     * @return void
     * @throws NotFoundHttpException
     */
    public function delete(int $id): void
    {
        $appointment = $this->getById($id);
        $googleEventId = $appointment->getGoogleCalendarEventId();

        $this->entityManager->remove($appointment);
        $this->entityManager->flush();

        // Видаляємо подію з Google Calendar
        if ($googleEventId) {
            $this->googleCalendarService->deleteEvent($googleEventId);
        }
    }

}
