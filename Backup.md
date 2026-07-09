# Проєкт резервного копіювання MySQL з Rclone

## Опис

Цей проєкт реалізує автоматичне резервне копіювання бази даних MySQL у Docker та передачу дампів у Dropbox за допомогою Rclone. Використовуються два окремі сервісні модулі:

1. **MySQL Backup Module** — контейнер `databack/mysql-backup:1.2.2` для створення дампу бази.
2. **Rclone Module** — контейнер `rclone/rclone:latest` для синхронізації дампів у Dropbox.

Усі дампи зберігаються в локальну папку `./docker/backup` для зручного перегляду та передачі.

---

## Структура проекту

```
├── docker-compose.yml         # Основний файл конфігурації сервісів
├── docker/backup              # Локальна тека для зберігання дампів
└── docker/rclone
    └── rclone.conf            # Конфігураційний файл Rclone (Dropbox remote)
```

---

## 1. MySQL Backup Module

### Опис

Контейнер `backup` підключається до служби MySQL, створює дамп(-и) бази(баз) та зберігає їх у папці `/db` (змонтованій на `./docker/backup`).

### Доступні змінні оточення

* `DB_SERVER` — hostname або IP MySQL без порту (наприклад, `mysql`).
* `DB_PORT` — порт MySQL (наприклад, `3306`). Якщо не вказаний, використовується 3306.
* `DB_USER` — ім'я користувача для підключення.
* `DB_PASS` — пароль користувача.
* `DB_NAMES` — список баз через кому. Якщо не задано — дампляться всі.
* `DB_DUMP_TARGET` — шлях всередині контейнера, куди писати дампи (зазвичай `/db`).
* `DB_DUMP_FREQUENCY` — інтервал між дампами в хвилинах (наприклад, `1440` = щоденно).
* `DB_DUMP_BEGIN` — коли виконати перший дамп:

  * `"HHMM"` — абсолютний час доби (наприклад, `"0100"` = 01:00).
  * `"+N"` — через N хвилин після старту контейнера (наприклад, `"+1"`).
  * `"0"` або відсутній — негайно після старту.
* `DB_DUMP_ONCE` — `"true"` для одноразового дампу та завершення контейнера.
* `DB_DUMP_CRON` — альтернативний cron-вираз замість `DB_DUMP_FREQUENCY` + `DB_DUMP_BEGIN` (наприклад, `"0 1 * * *"`).
* `DB_DUMP_RETENTION` — політика зберігання:

  * `Nd` / `Nh` / `Nw` / `Nm` / `Ny` — зберігати дампи не старші за N днів/годин/тижнів/місяців/років.
  * `Nc` — зберігати останні N файлів (count). Наприклад, `"10c"` — залишає 10 останніх дампів.


### Тестування дампу

* **Запуск одноразового дампу:**

  ```bash
  docker-compose run --rm backup dump
  ```
* **Через існуючий контейнер:**

  ```bash
  docker exec -it ${PROJECT_NAME}-mysql-backup /entrypoint dump
  ```
* **Перевірка файлів:**

  ```bash
  ls ./docker/backup
  ```
* **Перегляд логів:**

  ```bash
  docker logs -f ${PROJECT_NAME}-mysql-backup
  ```

---

## 2. Rclone Module

### Опис

Контейнер `rclone` у нескінченному циклі копіює дампи з папки `/db` до віддаленої папки в Dropbox.

### Підготовка

1. Виконайте `rclone config` на хості і створіть remote (наприклад, `dbdropbox`).
2. Помістіть отриманий `rclone.conf` у папку `./docker/rclone`.
3. Переконайтесь, що `docker/rclone/rclone.conf` має права запису (`rw`), а не лише `ro`.


### Тестування Rclone

* **Перегляд файлів у Dropbox:**

  ```bash
  docker exec -it ${PROJECT_NAME}-rclone \
    rclone ls dbdropbox:mysqldump_backups/ \
      --config /config/rclone/rclone.conf
  ```
* **Dry-run копіювання:**

  ```bash
  docker exec -it ${PROJECT_NAME}-rclone \
    rclone copy /db dbdropbox:test_folder/ \
      --config /config/rclone/rclone.conf \
      --dry-run --verbose
  ```
* **Справжнє копіювання:**

  ```bash
  docker exec -it ${PROJECT_NAME}-rclone \
    rclone copy /db dbdropbox:test_folder/ \
      --config /config/rclone/rclone.conf --verbose
  ```

---

## Корисні поради

* **Права доступу:** директорію `./docker/backup` слід дати групі GID 1005 (або `chmod 777` для тесту), щоб контейнер міг писати файли.
* **Політика retention:** `DB_DUMP_RETENTION` видаляє старі дампи автоматично перед новим дампом.
* **Видалення старих файлів у Dropbox:** використовуйте `rclone sync` замість `copy`, щоб видаляти файли, відсутні локально.
* **Cron-налаштування:** замість `DB_DUMP_FREQUENCY` + `DB_DUMP_BEGIN` можна задавати `DB_DUMP_CRON` з довільним cron-виразом.
* **Оновлення конфігурації:** щоб `entrypoint` застосував зміни в Compose, використовуйте `docker-compose up -d --force-recreate <service>`.

---

Завдяки такій структурі ви отримаєте надійну систему резервного копіювання MySQL з автоматичною передачею в Dropbox і гнучкими налаштуваннями розкладу, зберігання та тестування.
