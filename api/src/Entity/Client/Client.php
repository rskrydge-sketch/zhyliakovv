<?php

declare(strict_types=1);

namespace App\Entity\Client;

use App\Entity\Appointment\Appointment;
use App\Repository\Entity\Client\ClientRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Exception;

#[ORM\Entity(repositoryClass: ClientRepository::class)]
#[ORM\Table(name: 'clients')]
#[ORM\HasLifecycleCallbacks]
class Client
{

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::INTEGER)]
    private int $id;

    #[ORM\Column(type: Types::STRING, length: 100, unique: true)]
    private string $nickname;

    #[ORM\Column(type: Types::STRING, length: 255, nullable: true)]
    private ?string $name = null;

    #[ORM\Column(type: Types::STRING, length: 30, nullable: true)]
    private ?string $phone = null;

    #[ORM\Column(type: Types::STRING, length: 100, nullable: true)]
    private ?string $instagram = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notes = null;

    /**
     * @var Collection<int, Appointment>
     */
    #[ORM\OneToMany(targetEntity: Appointment::class, mappedBy: 'client', cascade: ['remove'])]
    #[ORM\OrderBy(['scheduledAt' => 'DESC'])]
    private Collection $appointments;

    #[ORM\Column(type: Types::INTEGER)]
    private int $createdAt;

    #[ORM\Column(type: Types::INTEGER)]
    private int $updatedAt;

    /**
     * Client constructor.
     */
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
    public function getNickname(): string
    {
        return $this->nickname;
    }

    /**
     * @param string $nickname
     * @return $this
     */
    public function setNickname(string $nickname): self
    {
        $this->nickname = $nickname;

        return $this;
    }

    /**
     * @return string|null
     */
    public function getName(): ?string
    {
        return $this->name;
    }

    /**
     * @param string|null $name
     * @return $this
     */
    public function setName(?string $name): self
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return string|null
     */
    public function getPhone(): ?string
    {
        return $this->phone;
    }

    /**
     * @param string|null $phone
     * @return $this
     */
    public function setPhone(?string $phone): self
    {
        $this->phone = $phone;

        return $this;
    }

    /**
     * @return string|null
     */
    public function getInstagram(): ?string
    {
        return $this->instagram;
    }

    /**
     * @param string|null $instagram
     * @return $this
     */
    public function setInstagram(?string $instagram): self
    {
        $this->instagram = $instagram;

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
        return (new \DateTimeImmutable('@' . $this->createdAt))->setTimezone(new \DateTimeZone('Europe/Kiev'));
    }

    /**
     * @return \DateTimeImmutable
     */
    public function getUpdatedAt(): \DateTimeImmutable
    {
        return (new \DateTimeImmutable('@' . $this->updatedAt))->setTimezone(new \DateTimeZone('Europe/Kiev'));
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
    public function toListArray(): array
    {
        return [
            'id'        => $this->getId(),
            'nickname'  => $this->getNickname(),
            'name'      => $this->getName(),
            'phone'     => $this->getPhone(),
            'instagram' => $this->getInstagram(),
            'createdAt' => $this->getCreatedAt()->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * @return array<string, mixed>
     * @throws Exception
     */
    public function toDetailArray(): array
    {
        $appointments = [];
        foreach ($this->getAppointments() as $appointment) {
            $appointments[] = $appointment->toListArray();
        }

        return [
            'id'           => $this->getId(),
            'nickname'     => $this->getNickname(),
            'name'         => $this->getName(),
            'phone'        => $this->getPhone(),
            'instagram'    => $this->getInstagram(),
            'notes'        => $this->getNotes(),
            'appointments' => $appointments,
            'createdAt'    => $this->getCreatedAt()->format('Y-m-d H:i:s'),
            'updatedAt'    => $this->getUpdatedAt()->format('Y-m-d H:i:s'),
        ];
    }

}
