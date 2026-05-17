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
     * @param int|null $clientId
     * @param string|null $date
     * @param string|null $status
     * @param int $page
     * @param int $limit
     * @return array{data: Appointment[], totalItems: int}
     */
    public function findByFilters(?int $clientId, ?string $date, ?string $status, int $page = 1, int $limit = 50): array
    {
        $queryBuilder = $this->createQueryBuilder('appointment')
            ->join('appointment.client', 'client')
            ->join('appointment.service', 'service')
            ->orderBy('appointment.scheduledAt', 'DESC');

        if ($clientId) {
            $queryBuilder
                ->andWhere('client.id = :clientId')
                ->setParameter('clientId', $clientId);
        }

        if ($date) {
            $queryBuilder
                ->andWhere('DATE(appointment.scheduledAt) = :date')
                ->setParameter('date', $date);
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
