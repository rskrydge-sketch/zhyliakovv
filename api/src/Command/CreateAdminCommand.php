<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\User\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-admin',
    description: 'Створити адміністратора системи',
)]
class CreateAdminCommand extends Command
{

    /**
     * @param EntityManagerInterface      $entityManager
     * @param UserPasswordHasherInterface $passwordHasher
     */
    public function __construct(
        private readonly EntityManagerInterface      $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    /**
     * @param InputInterface  $input
     * @param OutputInterface $output
     * @return int
     */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $email    = $_ENV['ADMIN_EMAIL'] ?? 'admin@zhyliakovv-hair.pp.ua';
        $password = $_ENV['ADMIN_PASSWORD'] ?? 'admin123';

        // Перевіряємо чи адмін вже існує
        $existing = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existing) {
            $io->warning("Адміністратор з email '$email' вже існує.");

            return Command::SUCCESS;
        }

        // Створюємо нового адміністратора
        $user = new User();
        $user
            ->setEmail($email)
            ->setRoles(['ROLE_ADMIN'])
            ->setPassword($this->passwordHasher->hashPassword($user, $password));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $io->success("Адміністратор '$email' створений успішно!");

        return Command::SUCCESS;
    }

}
