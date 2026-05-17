<?php

declare(strict_types=1);

namespace App\Services\Client;

use App\Entity\Client\Client;
use App\Repository\Entity\Client\ClientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ClientService
{

    /**
     * @param EntityManagerInterface $entityManager
     * @param ClientRepository       $clientRepository
     */
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ClientRepository       $clientRepository
    ) {
    }

    /**
     * @param string|null $search
     * @param int         $page
     * @param int         $limit
     * @return array{data: Client[], totalItems: int}
     */
    public function getList(?string $search, int $page, int $limit): array
    {
        return $this->clientRepository->findBySearch($search, $page, $limit);
    }

    /**
     * @param int $id
     * @return Client
     * @throws NotFoundHttpException
     */
    public function getById(int $id): Client
    {
        $client = $this->clientRepository->find($id);

        if (!$client) {
            throw new NotFoundHttpException('Клієнта не знайдено');
        }

        return $client;
    }

    /**
     * @param array<string, mixed> $data
     * @return Client
     * @throws ConflictHttpException
     */
    public function create(array $data): Client
    {
        // Перевіряємо унікальність нікнейму
        $existing = $this->clientRepository->findOneBy(['nickname' => $data['nickname']]);
        if ($existing) {
            throw new ConflictHttpException('Клієнт з таким нікнеймом вже існує');
        }

        $client = new Client();
        $client
            ->setNickname($data['nickname'])
            ->setName($data['name'] ?? null)
            ->setPhone($data['phone'] ?? null)
            ->setInstagram($data['instagram'] ?? null)
            ->setNotes($data['notes'] ?? null);

        $this->entityManager->persist($client);
        $this->entityManager->flush();

        return $client;
    }

    /**
     * @param int                  $id
     * @param array<string, mixed> $data
     * @return Client
     * @throws NotFoundHttpException
     * @throws ConflictHttpException
     */
    public function update(int $id, array $data): Client
    {
        $client = $this->getById($id);

        // Перевіряємо унікальність нікнейму якщо він змінюється
        if (isset($data['nickname']) && $data['nickname'] !== $client->getNickname()) {
            $existing = $this->clientRepository->findOneBy(['nickname' => $data['nickname']]);
            if ($existing) {
                throw new ConflictHttpException('Клієнт з таким нікнеймом вже існує');
            }
            $client->setNickname($data['nickname']);
        }

        if (array_key_exists('name', $data)) {
            $client->setName($data['name']);
        }

        if (array_key_exists('phone', $data)) {
            $client->setPhone($data['phone']);
        }

        if (array_key_exists('instagram', $data)) {
            $client->setInstagram($data['instagram']);
        }

        if (array_key_exists('notes', $data)) {
            $client->setNotes($data['notes']);
        }

        $this->entityManager->flush();

        return $client;
    }

    /**
     * @param int $id
     * @return void
     * @throws NotFoundHttpException
     */
    public function delete(int $id): void
    {
        $client = $this->getById($id);

        $this->entityManager->remove($client);
        $this->entityManager->flush();
    }

}
