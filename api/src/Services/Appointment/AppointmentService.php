<?php

declare(strict_types=1);

namespace App\Services\Appointment;

use App\Entity\Appointment\Appointment;
use App\Repository\Entity\Appointment\AppointmentRepository;
use App\Services\Client\ClientService;
use App\Services\Service\ProcedureService;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AppointmentService
{

    /**
     * @param EntityManagerInterface $entityManager
     * @param AppointmentRepository $appointmentRepository
     * @param ClientService $clientService
     * @param ProcedureService $procedureService
     */
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly AppointmentRepository  $appointmentRepository,
        private readonly ClientService          $clientService,
        private readonly ProcedureService       $procedureService
    ) {}

    /**
     * @param int|null $clientId
     * @param string|null $date
     * @param string|null $status
     * @param int $page
     * @param int $limit
     * @return array{data: Appointment[], totalItems: int}
     */
    public function getList(?int $clientId, ?string $date, ?string $status, int $page, int $limit): array
    {
        return $this->appointmentRepository->findByFilters($clientId, $date, $status, $page, $limit);
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

        $appointment = new Appointment();
        $appointment
            ->setClient($client)
            ->setService($service)
            ->setScheduledAt(new DateTime($data['scheduledAt']))
            ->setPrice((string)$data['price'])
            ->setNotes($data['notes'] ?? null)
            ->setStatus($data['status'] ?? Appointment::STATUS_PLANNED);

        $this->entityManager->persist($appointment);
        $this->entityManager->flush();

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
            $appointment->setScheduledAt(new DateTime($data['scheduledAt']));
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

        return $appointment;
    }

    /**
     * @param int $id
     * @return void
     * @throws NotFoundHttpException
     */
    public function delete(int $id): void
    {
        $appointment = $this->getById($id);

        $this->entityManager->remove($appointment);
        $this->entityManager->flush();
    }

}
