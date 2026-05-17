<?php

declare(strict_types=1);

namespace App\Entity\Service;

use App\Entity\Appointment\Appointment;
use App\Repository\Entity\Service\ServiceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ServiceRepository::class)]
#[ORM\Table(name: 'services')]
#[ORM\HasLifecycleCallbacks]
class Service
{

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::INTEGER)]
    private int $id;

    #[ORM\Column(type: Types::STRING, length: 255)]
    private string $name;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private string $basePrice;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $durationMinutes = null;

    #[ORM\Column(type: Types::BOOLEAN, options: ['default' => true])]
    private bool $isActive = true;

    /**
     * @var Collection<int, Appointment>
     */
    #[ORM\OneToMany(targetEntity: Appointment::class, mappedBy: 'service')]
    private Collection $appointments;

    #[ORM\Column(type: Types::INTEGER)]
    private int $createdAt;

    #[ORM\Column(type: Types::INTEGER)]
    private int $updatedAt;

    public function __construct()
    {
        $this->appointments = new ArrayCollection();
    }

    /**
     * @return int
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @param string $name
     * @return $this
     */
    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return string|null
     */
    public function getDescription(): ?string
    {
        return $this->description;
    }

    /**
     * @param string|null $description
     * @return $this
     */
    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    /**
     * @return string
     */
    public function getBasePrice(): string
    {
        return $this->basePrice;
    }

    /**
     * @param string $basePrice
     * @return $this
     */
    public function setBasePrice(string $basePrice): self
    {
        $this->basePrice = $basePrice;

        return $this;
    }

    /**
     * @return int|null
     */
    public function getDurationMinutes(): ?int
    {
        return $this->durationMinutes;
    }

    /**
     * @param int|null $durationMinutes
     * @return $this
     */
    public function setDurationMinutes(?int $durationMinutes): self
    {
        $this->durationMinutes = $durationMinutes;

        return $this;
    }

    /**
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->isActive;
    }

    /**
     * @param bool $isActive
     * @return $this
     */
    public function setIsActive(bool $isActive): self
    {
        $this->isActive = $isActive;

        return $this;
    }

    /**
     * @return Collection<int, Appointment>
     */
    public function getAppointments(): Collection
    {
        return $this->appointments;
    }

    /**
     * @return \DateTimeImmutable
     */
    public function getCreatedAt(): \DateTimeImmutable
    {
        return new \DateTimeImmutable('@' . $this->createdAt);
    }

    /**
     * @return \DateTimeImmutable
     */
    public function getUpdatedAt(): \DateTimeImmutable
    {
        return new \DateTimeImmutable('@' . $this->updatedAt);
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
     */
    public function toArray(): array
    {
        return [
            'id'              => $this->getId(),
            'name'            => $this->getName(),
            'description'     => $this->getDescription(),
            'basePrice'       => (float) $this->getBasePrice(),
            'durationMinutes' => $this->getDurationMinutes(),
            'isActive'        => $this->isActive(),
            'createdAt'       => $this->getCreatedAt()->format('Y-m-d H:i:s'),
            'updatedAt'       => $this->getUpdatedAt()->format('Y-m-d H:i:s'),
        ];
    }

}
