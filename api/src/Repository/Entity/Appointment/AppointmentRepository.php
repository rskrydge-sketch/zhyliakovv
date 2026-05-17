<?php

declare(strict_types=1);

namespace App\Repository\Entity\Appointment;

use App\Entity\Appointment\Appointment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Appointment>
 */
class AppointmentRepository extends ServiceEntityRepository
{

    /**
     * @param ManagerRegistry $registry
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Appointment::class);
    }

    /**
     * @param int $newStart
     * @param int $newEnd
     * @param int|null $excludeId
     * @return Appointment[]
     */
    public function findOverlapping(int $newStart, int $newEnd, ?int $excludeId = null): array
    {
        $queryBuilder = $this->createQueryBuilder('appointment')
            ->join('appointment.service', 'service')
            ->where('appointment.status != :cancelled')
            ->andWhere('appointment.scheduledAt < :newEnd')
            ->andWhere('(appointment.scheduledAt + COALESCE(service.durationMinutes, 0) * 60) > :newStart')
            ->setParameter('cancelled', Appointment::STATUS_CANCELLED)
            ->setParameter('newStart', $newStart)
            ->setParameter('newEnd', $newEnd);

        if ($excludeId !== null) {
            $queryBuilder
                ->andWhere('appointment.id != :excludeId')
                ->setParameter('excludeId', $excludeId);
        }

        /** @var Appointment[] $result */
        $result = $queryBuilder->getQuery()->getResult();

        return $result;
    }

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
    public function findByFilters(?int $clientId, ?string $date, ?string $dateFrom, ?string $dateTo, ?string $status, int $page = 1, int $limit = 50): array
    {
        $queryBuilder = $this->createQueryBuilder('appointment')
            ->join('appointment.client', 'client')
            ->join('appointment.service', 'service')
            ->orderBy('appointment.scheduledAt', 'ASC');

        if ($clientId) {
            $queryBuilder
                ->andWhere('client.id = :clientId')
                ->setParameter('clientId', $clientId);
        }

        if ($date) {
            $dateStart = (new \DateTime($date . ' 00:00:00'))->getTimestamp();
            $dateEnd   = (new \DateTime($date . ' 23:59:59'))->getTimestamp();

            $queryBuilder
                ->andWhere('appointment.scheduledAt >= :dateStart AND appointment.scheduledAt <= :dateEnd')
                ->setParameter('dateStart', $dateStart)
                ->setParameter('dateEnd', $dateEnd);
        } elseif ($dateFrom || $dateTo) {
            if ($dateFrom) {
                $queryBuilder
                    ->andWhere('appointment.scheduledAt >= :dateFrom')
                    ->setParameter('dateFrom', (new \DateTime($dateFrom . ' 00:00:00'))->getTimestamp());
            }
            if ($dateTo) {
                $queryBuilder
                    ->andWhere('appointment.scheduledAt <= :dateTo')
                    ->setParameter('dateTo', (new \DateTime($dateTo . ' 23:59:59'))->getTimestamp());
            }
        }

        if ($status) {
            $queryBuilder
                ->andWhere('appointment.status = :status')
                ->setParameter('status', $status);
        }

        /** @var int $totalItems */
        $totalItems = (clone $queryBuilder)
            ->select('COUNT(appointment.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $queryBuilder
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        /** @var Appointment[] $data */
        $data = $queryBuilder->getQuery()->getResult();

        return [
            'data'       => $data,
            'totalItems' => (int)$totalItems,
        ];
    }

}
