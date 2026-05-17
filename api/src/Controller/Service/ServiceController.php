<?php

declare(strict_types=1);

namespace App\Controller\Service;

use App\Services\Request\RequestService;
use App\Services\Service\ProcedureService;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/services')]
class ServiceController extends AbstractController
{

    private const REQUIRED_FIELDS = [
        'name',
        'basePrice'
    ];

    /**
     * @param ProcedureService $procedureService
     * @param RequestService $requestService
     */
    public function __construct(
        private readonly ProcedureService $procedureService,
        private readonly RequestService   $requestService
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

        $search = $queryParams['search'] ?? null;
        $services = $this->procedureService->getList($search);
        $data = array_map(fn($service) => $service->toArray(), $services);

        return $this->json(['data' => $data]);
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

        $service = $this->procedureService->create($data);

        return $this->json($service->toArray(), Response::HTTP_CREATED);
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
            $service = $this->procedureService->update($id, $data);

            return $this->json($service->toArray());
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
            $this->procedureService->delete($id);

            return $this->json(null, Response::HTTP_NO_CONTENT);
        } catch (NotFoundHttpException $exception) {
            return $this->json(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

}
