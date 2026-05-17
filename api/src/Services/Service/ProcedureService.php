<?php

declare(strict_types=1);

namespace App\Services\Service;

use App\Entity\Service\Service;
use App\Repository\Entity\Service\ServiceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProcedureService
{

    /**
     * @param EntityManagerInterface $entityManager
     * @param ServiceRepository $serviceRepository
     */
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ServiceRepository      $serviceRepository
    ) {}

    /**
     * @param string|null $search
     * @return Service[]
     */
    public function getList(?string $search): array
    {
        return $this->serviceRepository->findBySearch($search);
    }

    /**
     * @param int $id
     * @return Service
     * @throws NotFoundHttpException
     */
    public function getById(int $id): Service
    {
        $service = $this->serviceRepository->find($id);

        if (!$service) {
            throw new NotFoundHttpException('Послугу не знайдено');
        }

        return $service;
    }

    /**
     * @param array<string, mixed> $data
     * @return Service
     */
    public function create(array $data): Service
    {
        $service = new Service();
        $service
            ->setName($data['name'])
            ->setDescription($data['description'] ?? null)
            ->setBasePrice((string)$data['basePrice'])
            ->setDurationMinutes($data['durationMinutes'] ?? null)
            ->setIsActive($data['isActive'] ?? true);

        $this->entityManager->persist($service);
        $this->entityManager->flush();

        return $service;
    }

    /**
     * @param int $id
     * @param array<string, mixed> $data
     * @return Service
     * @throws NotFoundHttpException
     */
    public function update(int $id, array $data): Service
    {
        $service = $this->getById($id);

        if (isset($data['name'])) {
            $service->setName($data['name']);
        }

        if (array_key_exists('description', $data)) {
            $service->setDescription($data['description']);
        }

        if (isset($data['basePrice'])) {
            $service->setBasePrice((string)$data['basePrice']);
        }

        if (array_key_exists('durationMinutes', $data)) {
            $service->setDurationMinutes($data['durationMinutes']);
        }

        if (isset($data['isActive'])) {
            $service->setIsActive((bool)$data['isActive']);
        }

        $this->entityManager->flush();

        return $service;
    }

    /**
     * @param int $id
     * @return void
     * @throws NotFoundHttpException
     */
    public function delete(int $id): void
    {
        $service = $this->getById($id);

        $this->entityManager->remove($service);
        $this->entityManager->flush();
    }

}
