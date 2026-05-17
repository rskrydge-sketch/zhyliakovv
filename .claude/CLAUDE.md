# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## Project Overview

> **To be filled** — describe the project purpose, domain, and key flows here once known.

**Stack:**
- Backend: Symfony 7.2, PHP 8.3, Doctrine ORM (MySQL 8.0)
- Frontend: React 18.3, Vite 6, TypeScript (target), Axios, React Router 6
- nginx 1.27, Node 22
- Environments: `local` (dev mode) and `prod` only

**Domains:** `zhyliakovv.local` (local) / `zhyliakovv.com` (prod)

**Docker:**
```shell
# Local
./local_recreate_docker.sh
docker compose -f docker-compose.yaml -f docker-compose.local.yaml up --build -d

# Prod
./prod_recreate_docker.sh
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up --build -d
```

**Common commands (inside api container):**
```shell
docker compose exec api sh
php bin/console cache:clear
php bin/console doctrine:migrations:migrate
php bin/console doctrine:migrations:diff
php bin/console make:entity
php bin/console make:controller
```

---

## PHP / Symfony Coding Conventions

### PHPDoc

Required on **every** class property, constructor parameter, method, getter, and setter — no exceptions. Include `@throws` when the method can throw. Use inline `/** @var Type $var */` before `foreach` variables and repository results.

```php
/**
 * @var EntityManagerInterface
 */
private EntityManagerInterface $entityManager;

/**
 * @param string $name
 * @return $this
 */
public function setName(string $name): self
```

### Blank line before `return`

Always add a blank line before `return` when there is any other code above it in the method body. Single-statement getters (`return $this->property;`) are the only exception.

```php
// Correct
public function createOrder(array $data): Order
{
    $order = new Order();
    $order->setUser($data['user']);

    return $order;
}

// Exception — single-statement getter, no blank line needed
public function getId(): int
{
    return $this->id;
}
```

### Constructor parameter column alignment

Type hints and variable names are column-aligned with spaces:

```php
public function __construct(
    EntityManagerInterface $entityManager,
    OrderEmailService      $orderEmailService,
    TranslatorInterface    $translator,
    RequestService         $requestService
) {
```

### Setter return type

Setters always return `self`; docblock says `@return $this`.

```php
/**
 * @param string $name
 * @return $this
 */
public function setName(string $name): self
{
    $this->name = $name;

    return $this;
}
```

### Method chaining (3+ calls)

Object on its own line, each method call on a new indented line:

```php
$order
    ->setUser($user)
    ->setPair($pair)
    ->setRate($rate)
    ->setPaymentAmount($paymentAmount);
```

### Class body structure

Empty line after opening `{` and before closing `}` of class body. Traits go first after the opening brace.

```php
class OrderService
{

    use SomeTrait;

    /**
     * @var EntityManagerInterface
     */
    private EntityManagerInterface $entityManager;

    // ...

}
```

### Early return (guard clauses)

Prefer early returns over nested if-else. One condition per guard:

```php
if ($invoice->getType() !== TransactionType::PAYMENT) {
    return;
}

if (!$order = $invoice->getOrder()) {
    return;
}
```

### Array value alignment

When array keys differ in length, align `=>` values with spaces:

```php
return [
    "id"        => $this->getId(),
    "name"      => $this->getName(),
    "updatedAt" => $this->getUpdatedAt(),
];
```

### Comments in methods

Write step-by-step logic comments in **Ukrainian**:

```php
// Перевіряємо авторизованого користувача
$user = $this->checkIfUserExist();

// Перевіряємо мінімальну суму
$this->checkMinAmount($requestData['amount']);
```

### Entity structure

- PHP 8 attributes for ORM mapping (not annotations)
- UUID v4 for primary keys (via `ramsey/uuid-doctrine` when needed)
- Serialization groups: `get:collection:<resource>`, `get:item:<resource>`, `patch:item:<resource>`, `post:collection:<resource>`
- Constants as `public const SNAKE_CASE = "value"`
- `#[ORM\HasLifecycleCallbacks]` when using PrePersist/PreUpdate

```php
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\HasLifecycleCallbacks]
class User
{

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::INTEGER)]
    private int $id;

    #[ORM\Column(type: Types::STRING, length: 255, unique: true)]
    private string $email;

    // ...

}
```

### Directory structure (`src/`)

```
src/
├── Controller/        # REST controllers — thin, delegate to Services
│   └── User/
├── Entity/            # Doctrine entities, grouped by domain
│   └── User/
├── Repository/        # Doctrine repositories
│   └── Entity/User/
├── Services/          # Business logic
│   └── User/
├── EventSubscriber/   # Symfony event subscribers
├── Command/           # Console commands (Cron/)
└── Kernel.php
```

---

## Frontend (React / TypeScript) Conventions

> The current setup uses JSX. Migrate to TypeScript (`.tsx`) as the project grows — follow the conventions below from the start.

### Naming

- Interfaces: `I` prefix — `IUser`, `IOrder`, `IPaginatedResponse`
- Type aliases: `T` prefix — `TProps`, `TSearchParams`
- Component props: `type TProps` (not interface)
- Hooks: `use` prefix — `useDebounce`, `useAuthRedirect`
- Store interfaces: plain name with `Store` suffix — `interface UserStore`

### Component structure

```tsx
type TProps = {
  user: IUser;
  locale: string;
};

const UserCard = ({ user, locale }: TProps) => {
  // ...
};

export default UserCard;
```

- Destructure props directly in the function signature
- Default export always at the bottom
- No named export on the component itself

### Service / fetch function pattern

```ts
import axios from "axios";
import { responseStatus } from "@/utils/consts";

const defaultData = { data: [], totalItems: 0 };

export const fetchUsers = async () => {
  try {
    const response = await axios.get("/api/users");

    if (response.status === responseStatus.HTTP_OK) {
      return response.data;
    }

    return defaultData;
  } catch (error: any) {
    return defaultData;
  }
};

export const updateUser = async (id: string, data: object) => {
  try {
    const response = await axios.patch(`/api/users/${id}`, data);

    if (response.status === responseStatus.HTTP_OK) {
      return response.status;
    }
  } catch (error: any) {
    return responseStatus.HTTP_BAD_REQUEST;
  }
};
```

### Constants file (`src/utils/consts.ts`)

All application-wide constants live here:

```ts
export const responseStatus = {
  HTTP_OK: 200,
  HTTP_CREATED: 201,
  HTTP_NO_CONTENT: 204,
  HTTP_BAD_REQUEST: 400,
  HTTP_UNAUTHORIZED: 401,
  HTTP_FORBIDDEN: 403,
  HTTP_NOT_FOUND: 404,
  HTTP_UNPROCESSABLE_ENTITY: 422,
};

export const roles = {
  ADMIN: "ROLE_ADMIN",
  CLIENT: "ROLE_CLIENT",
};

export const regex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[0-9]{10,15}$/,
};
```

### catch block

Always type error as `any` in catch:

```ts
catch (error: any) {
```

### Directory structure (`frontend/src/`)

```
src/
├── components/        # UI components, grouped by domain
│   └── elements/      # shared/generic elements
├── pages/             # route-level components (or app/ if migrating to Next.js)
├── hooks/             # custom React hooks
├── services/          # API fetch functions, grouped by domain
├── utils/
│   ├── consts.ts      # all app-wide constants
│   ├── types.ts       # shared TypeScript types/interfaces
│   └── ...
├── App.jsx
├── main.jsx
└── index.css
```

---

## API Conventions

- All API routes prefixed with `/api`
- JSON responses
- HTTP status codes from `responseStatus` constants
- Validation errors: `422 Unprocessable Entity`
- Auth errors: `401 Unauthorized`
