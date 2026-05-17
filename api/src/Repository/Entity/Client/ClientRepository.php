<?php

declare(strict_types=1);

namespace App\Repository\Entity\Client;

use App\Entity\Client\Client;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Client>
 */
class ClientRepository extends ServiceEntityRepository
{

    /**
     * @param ManagerRegistry $registry
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Client::class);
    }

    /**
     * @param string|null $search
     * @param int         $page
     * @param int         $limit
     * @return array{data: Client[], totalItems: int}
     */
    public function findBySearch(?string $search, int $page = 1, int $limit = 50): array
    {
        $qb = $this->createQueryBuilder('c')
            ->orderBy('c.createdAt', 'DESC');

        if ($search) {
            $qb
                ->where('c.nickname LIKE :search OR c.name LIKE :search OR c.phone LIKE :search OR c.instagram LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        /** @var int $totalItems */
        $totalItems = (clone $qb)
            ->select('COUNT(c.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $qb
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        /** @var Client[] $data */
        $data = $qb->getQuery()->getResult();

        return [
            'data'       => $data,
            'totalItems' => (int) $totalItems,
        ];
    }

}
