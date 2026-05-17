<?php

declare(strict_types=1);

namespace App\Controller\Client;

use App\Services\Client\ClientService;
use App\Services\Request\RequestService;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/clients')]
class ClientController extends AbstractController
{

    private const REQUIRED_FIELDS = ['nickname'];

    /**
     * @param ClientService $clientService
     * @param RequestService $requestService
     */
    public function __construct(
        private readonly ClientService  $clientService,
        private readonly RequestService $requestService
    ) {}

    /**
     * @param Request $request
     * @return JsonResponse
     */
    #[Route('', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        /** @var array<string, mixed> $queryParams */
        $queryParams = $request->query->all();

        $search = $queryParams['search'] ?? null;
        $page = (int)($queryParams['page'] ?? 1);
        $limit = (int)($queryParams['limit'] ?? 50);

        $result = $this->clientService->getList($search, $page, $limit);

        $data = array_map(fn($client) => $client->toListArray(), $result['data']);

        return $this->json([
            'data'       => $data,
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
            $client = $this->clientService->create($data);

            return $this->json($client->toDetailArray(), Response::HTTP_CREATED);
        } catch (ConflictHttpException $exception) {
            return $this->json(['error' => $exception->getMessage()], Response::HTTP_CONFLICT);
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
            $client = $this->clientService->getById($id);

            return $this->json($client->toDetailArray());
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
            $client = $this->clientService->update($id, $data);

            return $this->json($client->toDetailArray());
        } catch (NotFoundHttpException $exception) {
            return $this->json(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (ConflictHttpException $exception) {
            return $this->json(['error' => $exception->getMessage()], Response::HTTP_CONFLICT);
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
            $this->clientService->delete($id);

            return $this->json(null, Response::HTTP_NO_CONTENT);
        } catch (NotFoundHttpException $exception) {
            return $this->json(['error' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

}
