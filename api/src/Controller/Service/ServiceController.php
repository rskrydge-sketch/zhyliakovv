<?php

declare(strict_types=1);

namespace App\Controller\Service;

use App\Services\Service\ProcedureService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/services')]
class ServiceController extends AbstractController
{

    /**
     * @param ProcedureService $procedureService
     */
    public function __construct(
        private readonly ProcedureService $procedureService
    ) {
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    #[Route('', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $search   = $request->query->get('search');
        $services = $this->procedureService->getList($search);
        $data     = array_map(fn($service) => $service->toArray(), $services);

        return $this->json(['data' => $data]);
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

        if (empty($data['name'])) {
            return $this->json(['error' => 'Назва послуги є обовʼязковим полем'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!isset($data['basePrice']) || $data['basePrice'] < 0) {
            return $this->json(['error' => 'Базова ціна є обовʼязковою і має бути >= 0'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $service = $this->procedureService->create($data);

        return $this->json($service->toArray(), Response::HTTP_CREATED);
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
            $service = $this->procedureService->update($id, $data);

            return $this->json($service->toArray());
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
            $this->procedureService->delete($id);

            return $this->json(null, Response::HTTP_NO_CONTENT);
        } catch (NotFoundHttpException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

}
