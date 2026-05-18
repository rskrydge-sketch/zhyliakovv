<?php

declare(strict_types=1);

namespace App\Services\Google;

use App\Entity\Appointment\Appointment;
use Exception;
use Google\Client;
use Google\Service\Calendar;
use Google\Service\Calendar\Event;
use Google\Service\Calendar\EventDateTime;
use Psr\Log\LoggerInterface;

class GoogleCalendarService
{

    /**
     * @var Calendar|null
     */
    private ?Calendar $calendar = null;

    /**
     * @param string $serviceAccountPath
     * @param string $calendarId
     * @param LoggerInterface $logger
     */
    public function __construct(
        private readonly string          $serviceAccountPath,
        private readonly string          $calendarId,
        private readonly LoggerInterface $logger
    ) {}

    /**
     * @param Appointment $appointment
     * @return string|null
     */
    public function createEvent(Appointment $appointment): ?string
    {
        try {
            $event = $this->buildEvent($appointment);
            $createdEvent = $this->getCalendar()->events->insert($this->calendarId, $event);

            return $createdEvent->getId();
        } catch (Exception $exception) {
            $this->logger->error('Google Calendar createEvent failed: ' . $exception->getMessage());

            return null;
        }
    }

    /**
     * @param Appointment $appointment
     * @return void
     */
    public function updateEvent(Appointment $appointment): void
    {
        $googleEventId = $appointment->getGoogleCalendarEventId();

        if (!$googleEventId) {
            return;
        }

        try {
            $event = $this->buildEvent($appointment);
            $this->getCalendar()->events->update($this->calendarId, $googleEventId, $event);
        } catch (Exception $exception) {
            $this->logger->error('Google Calendar updateEvent failed: ' . $exception->getMessage());
        }
    }

    /**
     * @param string $googleEventId
     * @return void
     */
    public function deleteEvent(string $googleEventId): void
    {
        try {
            $this->getCalendar()->events->delete($this->calendarId, $googleEventId);
        } catch (Exception $exception) {
            $this->logger->error('Google Calendar deleteEvent failed: ' . $exception->getMessage());
        }
    }

    /**
     * @return Calendar
     * @throws \Google\Exception
     */
    private function getCalendar(): Calendar
    {
        if ($this->calendar === null) {
            $client = new Client();

            $client->setAuthConfig($this->serviceAccountPath);
            $client->addScope(Calendar::CALENDAR_EVENTS);

            $this->calendar = new Calendar($client);
        }

        return $this->calendar;
    }

    /**
     * @param Appointment $appointment
     * @return Event
     * @throws Exception
     */
    private function buildEvent(Appointment $appointment): Event
    {
        $client = $appointment->getClient();
        $service = $appointment->getService();
        $start = $appointment->getScheduledAt();
        $durationMinutes = $service->getDurationMinutes() ?? 60;

        $end = clone $start;
        $end->modify('+' . $durationMinutes . ' minutes');

        // Формуємо заголовок події
        $summary = $client->getNickname();

        if ($client->getName()) {
            $summary .= ' — ' . $client->getName();
        }

        $summary .= ' (' . $service->getName() . ')';

        // Формуємо опис події
        $description = 'Послуга: ' . $service->getName() . "\n";
        $description .= 'Ціна: ' . $appointment->getPrice() . " грн\n";

        if ($client->getPhone()) {
            $description .= 'Телефон: ' . $client->getPhone() . "\n";
        }

        if ($client->getInstagram()) {
            $description .= 'Instagram: ' . $client->getInstagram() . "\n";
        }

        if ($appointment->getNotes()) {
            $description .= 'Нотатки: ' . $appointment->getNotes();
        }

        $startDt = new EventDateTime();

        $startDt->setDateTime($start->format('c'));
        $startDt->setTimeZone('Europe/Kiev');

        $endDt = new EventDateTime();

        $endDt->setDateTime($end->format('c'));
        $endDt->setTimeZone('Europe/Kiev');

        $event = new Event();

        $event->setSummary($summary);
        $event->setDescription(trim($description));
        $event->setStart($startDt);
        $event->setEnd($endDt);

        return $event;
    }

}
