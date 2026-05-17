<?php

declare(strict_types=1);

namespace App\Services\Request;

use RuntimeException;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Validator\Constraints\Collection;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RequestService
{

    /**
     * @param ValidatorInterface $validator
     * @param RequestStack       $requestStack
     */
    public function __construct(
        private readonly ValidatorInterface $validator,
        private readonly RequestStack       $requestStack
    ) {
    }

    /**
     * @param mixed              $content
     * @param array<int, string> $fields
     * @param bool               $checkNullable
     * @return bool
     */
    public function check(mixed $content, array $fields, bool $checkNullable = true): bool
    {
        $errors = '';

        if (!isset($content)) {
            throw new RuntimeException('Контент запиту порожній', Response::HTTP_BAD_REQUEST);
        }

        foreach ($fields as $field) {
            if (!$checkNullable && array_key_exists($field, $content) && $content[$field] == null) {
                continue;
            }

            if (!isset($content[$field])) {
                $errors .= ' ' . $field . ';';
            }
        }

        if ($errors) {
            throw new RuntimeException('Відсутні обовʼязкові поля:' . $errors, Response::HTTP_BAD_REQUEST);
        }

        return true;
    }

    /**
     * @return string
     */
    public function getLocale(): string
    {
        return $this->requestStack->getCurrentRequest()?->getPreferredLanguage(['uk', 'en']) ?? 'uk';
    }

    /**
     * @return string
     */
    public function getUserIp(): string
    {
        $request = $this->requestStack->getCurrentRequest();

        if (!$request) {
            return 'systemIp';
        }

        return $request->getClientIp() ?? 'systemIp';
    }

    /**
     * @param array<string, mixed>|object $data
     * @param array<string, mixed>|null   $constraints
     * @param bool|null                   $removeSquareBracketFromPropertyPath
     * @param bool|null                   $isCustomHandle
     * @return array<string, string>|void
     */
    public function validateRequestDataByConstraints(array|object $data, ?array $constraints = null, ?bool $removeSquareBracketFromPropertyPath = false, ?bool $isCustomHandle = false)
    {
        $errors = $this->validator->validate($data, !empty($constraints) ? new Collection($constraints) : null);

        if (count($errors) === 0) {
            return;
        }

        $validationErrors = [];

        foreach ($errors as $error) {
            $key = str_replace(['[', ']'], ['', ''], $error->getPropertyPath());

            if ($removeSquareBracketFromPropertyPath) {
                $key = preg_replace('/\[.*?\]/', '', $error->getPropertyPath()) ?? $key;
            }

            $validationErrors[$key] = $error->getMessage();
        }

        if ($isCustomHandle) {
            return $validationErrors;
        }

        throw new UnprocessableEntityHttpException(json_encode($validationErrors));
    }

}
