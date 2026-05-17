# Архітектура Hair CRM

## Стек

| Шар | Технологія |
|-----|-----------|
| Backend | Symfony 7.2, PHP 8.3 |
| ORM | Doctrine ORM 3, MySQL 8.0 |
| Авторизація | JWT (`lexik/jwt-authentication-bundle`) |
| Frontend | React 18.3, Vite 6 |
| UI | Tailwind CSS v4 (`@tailwindcss/vite`), кастомні компоненти |
| Іконки | Lucide React |
| HTTP клієнт | Axios |
| Роутинг | React Router 6 |
| Сервер | nginx 1.27 |
| Середовища | `local` (dev, Vite HMR) та `prod` |

---

## Структура репозиторію

```
zhyliakovv/
├── api/                        # Symfony backend
│   ├── src/
│   │   ├── Command/            # Console команди (CreateAdminCommand)
│   │   ├── Controller/         # REST контролери (тонкі, делегують у Services)
│   │   │   ├── Appointment/
│   │   │   ├── Client/
│   │   │   └── Service/
│   │   ├── Entity/             # Doctrine entities
│   │   │   ├── Appointment/
│   │   │   ├── Client/
│   │   │   ├── Service/
│   │   │   └── User/
│   │   ├── Repository/         # Doctrine repositories з кастомними запитами
│   │   │   └── Entity/...
│   │   └── Services/           # Бізнес-логіка
│   │       ├── Appointment/
│   │       ├── Client/
│   │       └── Service/
│   ├── config/
│   │   ├── jwt/                # RSA ключі (gitignored)
│   │   └── packages/
│   │       ├── lexik_jwt_authentication.yaml
│   │       └── security.yaml
│   └── migrations/
├── frontend/                   # React SPA
│   └── src/
│       ├── components/
│       │   ├── elements/       # Базові UI-компоненти (Button, Input, Card, Modal...)
│       │   ├── clients/        # ClientFormModal
│       │   ├── appointments/   # AppointmentFormModal
│       │   └── services/       # ServiceFormModal
│       ├── pages/              # Сторінки (route-level)
│       ├── services/           # API-функції (authService, clientService...)
│       └── utils/
│           ├── consts.js       # HTTP статуси, статуси записів
│           └── cn.js           # Tailwind class merger
├── docker/                     # Dockerfile'и та nginx конфіги
├── PROJECT.md
├── ARCHITECTURE.md
└── CLAUDE.md
```

---

## Схема бази даних

```
users
  id            INT PK
  email         VARCHAR(180) UNIQUE
  password      VARCHAR
  roles         JSON
  created_at    DATETIME

clients
  id            INT PK
  nickname      VARCHAR(100) UNIQUE NOT NULL   ← єдине обов'язкове поле
  name          VARCHAR(255) NULL
  phone         VARCHAR(30)  NULL
  instagram     VARCHAR(100) NULL
  notes         TEXT NULL
  created_at    DATETIME
  updated_at    DATETIME

services
  id               INT PK
  name             VARCHAR(255)
  description      TEXT NULL
  base_price       DECIMAL(10,2)
  duration_minutes INT NULL
  is_active        BOOLEAN DEFAULT true
  created_at       DATETIME
  updated_at       DATETIME

appointments
  id            INT PK
  client_id     INT FK → clients (ON DELETE CASCADE)
  service_id    INT FK → services
  scheduled_at  DATETIME
  price         DECIMAL(10,2)              ← індивідуальна ціна запису
  notes         TEXT NULL
  status        ENUM(planned|completed|cancelled) DEFAULT planned
  created_at    DATETIME
  updated_at    DATETIME
```

---

## API endpoints

Всі маршрути під префіксом `/api`. Авторизація через `Authorization: Bearer <JWT>`.

### Auth
| Метод | URL | Доступ |
|-------|-----|--------|
| POST | `/api/auth/login` | Публічний |

Тіло запиту: `{ "email": "...", "password": "..." }`
Відповідь: `{ "token": "<JWT>" }`

### Клієнти
| Метод | URL | Опис |
|-------|-----|------|
| GET | `/api/clients` | Список (параметри: `search`, `page`, `limit`) |
| POST | `/api/clients` | Створити |
| GET | `/api/clients/{id}` | Деталі + всі записи клієнта |
| PATCH | `/api/clients/{id}` | Оновити |
| DELETE | `/api/clients/{id}` | Видалити (каскадно видаляє записи) |

### Послуги
| Метод | URL | Опис |
|-------|-----|------|
| GET | `/api/services` | Список (параметр: `search`) |
| POST | `/api/services` | Створити |
| PATCH | `/api/services/{id}` | Оновити |
| DELETE | `/api/services/{id}` | Видалити |

### Записи
| Метод | URL | Опис |
|-------|-----|------|
| GET | `/api/appointments` | Список (параметри: `date`, `clientId`, `status`, `page`, `limit`) |
| POST | `/api/appointments` | Створити |
| GET | `/api/appointments/{id}` | Деталі запису |
| PATCH | `/api/appointments/{id}` | Оновити (в т.ч. зміна статусу) |
| DELETE | `/api/appointments/{id}` | Видалити |

---

## Авторизація та безпека

- JWT токен живе **24 години** (налаштовується через `token_ttl` в `lexik_jwt_authentication.yaml`)
- Axios interceptor автоматично додає `Authorization: Bearer` заголовок до кожного запиту
- При отриманні `401` — автоматичний редірект на `/login` і очищення токену
- RSA ключова пара зберігається в `api/config/jwt/` і **не включається в git**
- Passphrase ключів зберігається в `api/.env` (змінна `JWT_PASSPHRASE`)

---

## Frontend архітектура

### Навігація (mobile-first)
- Фіксований **bottom navigation** з трьох вкладок: Клієнти / Записи / Послуги
- Sticky header з назвою і кнопкою виходу
- Весь контент з відступом `pb-20` щоб не перекривався навігацією

### Компонентна ієрархія
```
App (Router)
└── PrivateRoute (перевірка JWT)
    └── Layout (header + bottom nav)
        ├── ClientsPage
        │   └── ClientFormModal
        ├── ClientDetailPage
        │   ├── ClientFormModal
        │   └── AppointmentFormModal
        ├── AppointmentsPage
        │   └── AppointmentFormModal
        ├── AppointmentDetailPage
        │   └── AppointmentFormModal
        └── ServicesPage
            └── ServiceFormModal
```

### Стан і дані
- Локальний стан через `useState` / `useCallback` / `useEffect`
- Немає глобального стейт-менеджера (Redux/Zustand) — для одного адміна це надлишково
- Всі API виклики через функції в `src/services/` — завжди повертають `{ success, data, error }` або дефолтні значення, ніколи не кидають виключень в компоненти

---

## Розгортання

### Локально
```bash
docker compose -f docker-compose.yaml -f docker-compose.local.yaml up -d

# Після першого запуску:
docker compose exec api php bin/console doctrine:migrations:migrate
docker compose exec api php bin/console app:create-admin
```

### Env-змінні для кастомізації адміна
```bash
# api/.env або api/.env.local
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=yourpassword
```
