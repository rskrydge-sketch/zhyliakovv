<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260517161344 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // Очищаємо тестові дані перед зміною типів (DATETIME → INT)
        $this->addSql('SET FOREIGN_KEY_CHECKS=0');
        $this->addSql('TRUNCATE TABLE appointments');
        $this->addSql('TRUNCATE TABLE clients');
        $this->addSql('TRUNCATE TABLE services');
        $this->addSql('TRUNCATE TABLE users');
        $this->addSql('SET FOREIGN_KEY_CHECKS=1');

        $this->addSql('ALTER TABLE appointments CHANGE scheduled_at scheduled_at INT NOT NULL, CHANGE created_at created_at INT NOT NULL, CHANGE updated_at updated_at INT NOT NULL');
        $this->addSql('ALTER TABLE clients CHANGE created_at created_at INT NOT NULL, CHANGE updated_at updated_at INT NOT NULL');
        $this->addSql('ALTER TABLE services CHANGE created_at created_at INT NOT NULL, CHANGE updated_at updated_at INT NOT NULL');
        $this->addSql('ALTER TABLE users CHANGE created_at created_at INT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE appointments CHANGE scheduled_at scheduled_at DATETIME NOT NULL, CHANGE created_at created_at DATETIME NOT NULL, CHANGE updated_at updated_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE clients CHANGE created_at created_at DATETIME NOT NULL, CHANGE updated_at updated_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE services CHANGE created_at created_at DATETIME NOT NULL, CHANGE updated_at updated_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE users CHANGE created_at created_at DATETIME NOT NULL');
    }
}
