<?php

declare(strict_types=1);

namespace App\Repository\Entity\Client;

use App\Entity\Client\Client;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
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
     * @param int $page
     * @param int $limit
     * @return array{data: Client[], totalItems: int}
     */
    public function findBySearch(?string $search, int $page = 1, int $limit = 50): array
    {
        $queryBuilder = $this->createQueryBuilder('client')
            ->orderBy('client.createdAt', 'DESC');

        if ($search) {
            $queryBuilder
                ->where('client.nickname LIKE :search OR client.name LIKE :search OR client.phone LIKE :search OR client.instagram LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        /** @var int $totalItems */
        $totalItems = (clone $queryBuilder)
            ->select('COUNT(client.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $queryBuilder
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        /** @var Client[] $data */
        $data = $queryBuilder->getQuery()->getResult();

        return [
            'data'       => $data,
            'totalItems' => (int)$totalItems,
        ];
    }

}
