<?php

declare(strict_types=1);

namespace App\Controller\Appointment;

use App\Services\Appointment\AppointmentService;
use App\Services\Request\RequestService;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/appointments')]
class AppointmentController extends AbstractController
{

    private const REQUIRED_FIELDS = [
        'clientId',
        'serviceId',
        'scheduledAt',
        'price'
    ];

    /**
     * @param AppointmentService $appointmentService
     * @param RequestService $requestService
     */
    public function __construct(
        private readonly AppointmentService $appointmentService,
        private readonly RequestService     $requestService
    ) {}

    /**
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    #[Route('', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        /** @var array<string, mixed> $queryParams */
        $queryParams = $request->query->all();

        $clientId = isset($queryParams['clientId']) ? (int)$queryParams['clientId'] : null;
        $date     = $queryParams['date']     ?? null;
        $dateFrom = $queryParams['dateFrom'] ?? null;
        $dateTo   = $queryParams['dateTo']   ?? null;
        $status   = $queryParams['status']   ?? null;
        $page     = (int)($queryParams['page']  ?? 1);
        $limit    = (int)($queryParams['limit'] ?? 50);

        $result = $this->appointmentService->getList($clientId, $date, $dateFrom, $dateTo, $status, $page, $limit);
        $data = array_map(fn($appointment) => $appointment->toListArray(), $result['data']);

        return $this->json([
            'data' => $data,
            'totalItems' => $result['totalItems'],
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var array<string, mixed> $data */
        $data = json_decode($request->getContent(), true) ?? [];

        $this->requestService->check($data, self::REQUIRED_FIELDS);

        try {
            $appointment = $this->appointmentService->create($data);

            return $this->json($appointment->toListArray(), Response::HTTP_CREATED);
        } catch (NotFoundHttpException $exception) {
            return $this->json(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * @param int $id
     * @return JsonResponse
     * @throws Exception
     */
    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        try {
            $appointment = $this->appointmentService->getById($id);

            return $this->json($appointment->toListArray());
        } catch (NotFoundHttpException $exception) {
            return $this->json(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     * @throws Exception
     */
    #[Route('/{id}', methods: ['PATCH'])]
    public function update(Request $request, int $id): JsonResponse
    {
        /** @var array<string, mixed> $data */
        $data = json_decode($request->getContent(), true) ?? [];

        try {
            $appointment = $this->appointmentService->update($id, $data);

            return $this->json($appointment->toListArray());
        } catch (NotFoundHttpException $exception) {
            return $this->json(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
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
        } catch (NotFoundHttpException $exception) {
            return $this->json(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

}
