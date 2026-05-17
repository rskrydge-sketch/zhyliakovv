<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260517154719 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE appointments (id INT AUTO_INCREMENT NOT NULL, scheduled_at DATETIME NOT NULL, price NUMERIC(10, 2) NOT NULL, notes LONGTEXT DEFAULT NULL, status VARCHAR(20) DEFAULT \'planned\' NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, client_id INT NOT NULL, service_id INT NOT NULL, INDEX IDX_6A41727A19EB6921 (client_id), INDEX IDX_6A41727AED5CA9E6 (service_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE clients (id INT AUTO_INCREMENT NOT NULL, nickname VARCHAR(100) NOT NULL, name VARCHAR(255) DEFAULT NULL, phone VARCHAR(30) DEFAULT NULL, instagram VARCHAR(100) DEFAULT NULL, notes LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_C82E74A188FE64 (nickname), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE services (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, base_price NUMERIC(10, 2) NOT NULL, duration_minutes INT DEFAULT NULL, is_active TINYINT DEFAULT 1 NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE users (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_1483A5E9E7927C74 (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE appointments ADD CONSTRAINT FK_6A41727A19EB6921 FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE appointments ADD CONSTRAINT FK_6A41727AED5CA9E6 FOREIGN KEY (service_id) REFERENCES services (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE appointments DROP FOREIGN KEY FK_6A41727A19EB6921');
        $this->addSql('ALTER TABLE appointments DROP FOREIGN KEY FK_6A41727AED5CA9E6');
        $this->addSql('DROP TABLE appointments');
        $this->addSql('DROP TABLE clients');
        $this->addSql('DROP TABLE services');
        $this->addSql('DROP TABLE users');
    }
}
