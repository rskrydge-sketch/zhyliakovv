<?php

declare(strict_types=1);

namespace App\Entity\Appointment;

use App\Entity\Client\Client;
use App\Entity\Service\Service;
use App\Repository\Entity\Appointment\AppointmentRepository;
use DateTime;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Exception;

#[ORM\Entity(repositoryClass: AppointmentRepository::class)]
#[ORM\Table(name: 'appointments')]
#[ORM\HasLifecycleCallbacks]
class Appointment
{

    public const STATUS_PLANNED   = 'planned';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::INTEGER)]
    private int $id;

    #[ORM\ManyToOne(targetEntity: Client::class, inversedBy: 'appointments')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Client $client;

    #[ORM\ManyToOne(targetEntity: Service::class, inversedBy: 'appointments')]
    #[ORM\JoinColumn(nullable: false)]
    private Service $service;

    #[ORM\Column(type: Types::INTEGER)]
    private int $scheduledAt;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private string $price;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notes = null;

    #[ORM\Column(type: Types::STRING, length: 20, options: ['default' => self::STATUS_PLANNED])]
    private string $status = self::STATUS_PLANNED;

    #[ORM\Column(type: Types::INTEGER)]
    private int $createdAt;

    #[ORM\Column(type: Types::INTEGER)]
    private int $updatedAt;

    /**
     * @return int
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * @return Client
     */
    public function getClient(): Client
    {
        return $this->client;
    }

    /**
     * @param Client $client
     * @return $this
     */
    public function setClient(Client $client): self
    {
        $this->client = $client;

        return $this;
    }

    /**
     * @return Service
     */
    public function getService(): Service
    {
        return $this->service;
    }

    /**
     * @param Service $service
     * @return $this
     */
    public function setService(Service $service): self
    {
        $this->service = $service;

        return $this;
    }

    /**
     * @return DateTime
     * @throws Exception
     */
    public function getScheduledAt(): DateTime
    {
        return (new DateTime('@' . $this->scheduledAt))->setTimezone(new \DateTimeZone('Europe/Kiev'));
    }

    /**
     * @param DateTime $scheduledAt
     * @return $this
     */
    public function setScheduledAt(DateTime $scheduledAt): self
    {
        $this->scheduledAt = $scheduledAt->getTimestamp();

        return $this;
    }

    /**
     * @return string
     */
    public function getPrice(): string
    {
        return $this->price;
    }

    /**
     * @param string $price
     * @return $this
     */
    public function setPrice(string $price): self
    {
        $this->price = $price;

        return $this;
    }

    /**
     * @return string|null
     */
    public function getNotes(): ?string
    {
        return $this->notes;
    }

    /**
     * @param string|null $notes
     * @return $this
     */
    public function setNotes(?string $notes): self
    {
        $this->notes = $notes;

        return $this;
    }

    /**
     * @return string
     */
    public function getStatus(): string
    {
        return $this->status;
    }

    /**
     * @param string $status
     * @return $this
     */
    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }

    /**
     * @return DateTimeImmutable
     * @throws Exception
     */
    public function getCreatedAt(): DateTimeImmutable
    {
        return (new DateTimeImmutable('@' . $this->createdAt))->setTimezone(new \DateTimeZone('Europe/Kiev'));
    }

    /**
     * @return DateTimeImmutable
     * @throws Exception
     */
    public function getUpdatedAt(): DateTimeImmutable
    {
        return (new DateTimeImmutable('@' . $this->updatedAt))->setTimezone(new \DateTimeZone('Europe/Kiev'));
    }

    /**
     * @return void
     */
    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = time();
        $this->updatedAt = time();
    }

    /**
     * @return void
     */
    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = time();
    }

    /**
     * @return array<string, mixed>
     * @throws Exception
     */
    public function toListArray(): array
    {
        return [
            'id'          => $this->getId(),
            'client'      => [
                'id'       => $this->getClient()->getId(),
                'nickname' => $this->getClient()->getNickname(),
                'name'     => $this->getClient()->getName(),
                'phone'    => $this->getClient()->getPhone(),
            ],
            'service'     => [
                'id'              => $this->getService()->getId(),
                'name'            => $this->getService()->getName(),
                'basePrice'       => (float)$this->getService()->getBasePrice(),
                'durationMinutes' => $this->getService()->getDurationMinutes(),
            ],
            'scheduledAt' => $this->getScheduledAt()->format('Y-m-d H:i:s'),
            'price'       => (float)$this->getPrice(),
            'status'      => $this->getStatus(),
            'notes'       => $this->getNotes(),
            'createdAt'   => $this->getCreatedAt()->format('Y-m-d H:i:s'),
        ];
    }

}
