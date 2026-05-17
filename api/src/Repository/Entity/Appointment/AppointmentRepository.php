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
     * @param int|null    $clientId
     * @param string|null $date
     * @param string|null $status
     * @param int         $page
     * @param int         $limit
     * @return array{data: Appointment[], totalItems: int}
     */
    public function findByFilters(?int $clientId, ?string $date, ?string $status, int $page = 1, int $limit = 50): array
    {
        $qb = $this->createQueryBuilder('a')
            ->join('a.client', 'c')
            ->join('a.service', 's')
            ->orderBy('a.scheduledAt', 'DESC');

        if ($clientId) {
            $qb
                ->andWhere('c.id = :clientId')
                ->setParameter('clientId', $clientId);
        }

        if ($date) {
            $qb
                ->andWhere('DATE(a.scheduledAt) = :date')
                ->setParameter('date', $date);
        }

        if ($status) {
            $qb
                ->andWhere('a.status = :status')
                ->setParameter('status', $status);
        }

        /** @var int $totalItems */
        $totalItems = (clone $qb)
            ->select('COUNT(a.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $qb
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        /** @var Appointment[] $data */
        $data = $qb->getQuery()->getResult();

        return [
            'data'       => $data,
            'totalItems' => (int) $totalItems,
        ];
    }

}
