<?php

declare(strict_types=1);

namespace App\Controller\Appointment;

use App\Services\Appointment\AppointmentService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/appointments')]
class AppointmentController extends AbstractController
{

    /**
     * @param AppointmentService $appointmentService
     */
    public function __construct(
        private readonly AppointmentService $appointmentService
    ) {
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    #[Route('', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $clientId = $request->query->get('clientId') ? (int) $request->query->get('clientId') : null;
        $date     = $request->query->get('date');
        $status   = $request->query->get('status');
        $page     = (int) $request->query->get('page', 1);
        $limit    = (int) $request->query->get('limit', 50);

        $result = $this->appointmentService->getList($clientId, $date, $status, $page, $limit);
        $data   = array_map(fn($appointment) => $appointment->toListArray(), $result['data']);

        return $this->json([
            'data'       => $data,
            'totalItems' => $result['totalItems'],
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var array<string, mixed> $data */
        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['clientId'])) {
            return $this->json(['error' => 'clientId є обовʼязковим полем'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (empty($data['serviceId'])) {
            return $this->json(['error' => 'serviceId є обовʼязковим полем'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (empty($data['scheduledAt'])) {
            return $this->json(['error' => 'scheduledAt є обовʼязковим полем'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!isset($data['price'])) {
            return $this->json(['error' => 'price є обовʼязковим полем'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $appointment = $this->appointmentService->create($data);

            return $this->json($appointment->toListArray(), Response::HTTP_CREATED);
        } catch (NotFoundHttpException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        try {
            $appointment = $this->appointmentService->getById($id);

            return $this->json($appointment->toListArray());
        } catch (NotFoundHttpException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * @param Request $request
     * @param int     $id
     * @return JsonResponse
     */
    #[Route('/{id}', methods: ['PATCH'])]
    public function update(Request $request, int $id): JsonResponse
    {
        /** @var array<string, mixed> $data */
        $data = json_decode($request->getContent(), true) ?? [];

        try {
            $appointment = $this->appointmentService->update($id, $data);

            return $this->json($appointment->toListArray());
        } catch (NotFoundHttpException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        try {
            $this->appointmentService->delete($id);

            return $this->json(null, Response::HTTP_NO_CONTENT);
        } catch (NotFoundHttpException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

}
