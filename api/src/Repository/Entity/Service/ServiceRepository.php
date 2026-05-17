<?php

declare(strict_types=1);

namespace App\Repository\Entity\Service;

use App\Entity\Service\Service;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Service>
 */
class ServiceRepository extends ServiceEntityRepository
{

    /**
     * @param ManagerRegistry $registry
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Service::class);
    }

    /**
     * @param string|null $search
     * @return Service[]
     */
    public function findBySearch(?string $search): array
    {
        $queryBuilder = $this->createQueryBuilder('service')
            ->orderBy('service.name', 'ASC');

        if ($search) {
            $queryBuilder
                ->where('service.name LIKE :search OR service.description LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        /** @var Service[] $result */
        $result = $queryBuilder->getQuery()->getResult();

        return $result;
    }

}
