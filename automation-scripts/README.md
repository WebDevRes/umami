# Автоматизация развертывания Umami на FastPanel

Два скрипта для массового добавления сайтов в Umami и автоматического развертывания tracking кода.

## Скрипт 1: Добавление доменов в Umami

**Файл**: `add-domains-to-umami.js`

### Назначение
Читает список доменов и добавляет их в Umami, создавая CSV файл с доменами и их ID.

### Подготовка

1. Создайте файл `domains.txt` со списком доменов (по одному на строку):
```
example1.com
example2.com
site3.ru
```

2. Установите переменные окружения или создайте `.env` файл:
```bash
export UMAMI_URL="https://your-umami-server.com"
export UMAMI_USERNAME="admin"
export UMAMI_PASSWORD="your-password"
```

### Запуск

```bash
node add-domains-to-umami.js
```

### Результат

Создается файл `domains-with-ids.csv`:
```
example1.com;abc12345-6789-...
example2.com;def67890-1234-...
site3.ru;ghi34567-8901-...
```

---

## Скрипт 2: Развертывание tracking кода

**Файл**: `deploy-tracking.js`

### Назначение
Для каждого сайта:
1. Генерирует уникальное имя JS файла (например `abc12345.js`)
2. Настраивает nginx редирект: `domain.com/abc12345.js` → `umami-server/script.js`
3. Внедряет код метрики во все HTML файлы сайта
4. Проверяет доступность метрики

### Подготовка

1. Скопируйте файл `domains-with-ids.csv` на сервер с FastPanel

2. Установите переменные окружения:
```bash
export UMAMI_SERVER="https://your-umami-server.com"
export FASTPANEL_SITES_DIR="/var/www"
export NGINX_SITES_DIR="/etc/nginx/sites-available"
```

### Запуск

**Тестовый запуск (без изменений):**
```bash
DRY_RUN=true node deploy-tracking.js
```

**Реальный запуск:**
```bash
node deploy-tracking.js
```

**Только настройка nginx (без внедрения в HTML):**
```bash
SKIP_HTML=true node deploy-tracking.js
```

**Только внедрение в HTML (без nginx):**
```bash
SKIP_NGINX=true node deploy-tracking.js
```

### Что делает скрипт

#### 1. Генерация уникального имени скрипта
Для `website-id: abc12345-6789-abcd-ef01-234567890abc` создается `abc12345.js`

#### 2. Настройка nginx
Добавляет в конфиг сайта:
```nginx
# Umami Analytics Tracking Script
location = /abc12345.js {
    proxy_pass https://your-umami-server.com/script.js;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
    add_header Cache-Control "public, max-age=3600";
}
```

#### 3. Внедрение кода в HTML
Находит все `.html` файлы в директории сайта и добавляет перед `</head>`:
```html
<script defer src="/abc12345.js" data-website-id="abc12345-6789-abcd-ef01-234567890abc"></script>
```

#### 4. Проверка
Проверяет доступность `https://domain.com/abc12345.js`

### Результат

Создается файл `deployment-report.json` с детальным отчетом по каждому сайту:
```json
[
  {
    "domain": "example1.com",
    "success": true,
    "steps": {
      "nginx": { "success": true },
      "html": { "success": true, "injected": 5, "total": 5 },
      "verify": { "success": true }
    }
  },
  ...
]
```

---

## Полный процесс использования

### Шаг 1: На локальной машине

```bash
# Создайте список доменов
cat > domains.txt << EOF
site1.com
site2.com
site3.ru
EOF

# Настройте окружение
export UMAMI_URL="https://analytics.yourdomain.com"
export UMAMI_USERNAME="admin"
export UMAMI_PASSWORD="yourpassword"

# Запустите скрипт добавления
node add-domains-to-umami.js

# Результат: создан файл domains-with-ids.csv
```

### Шаг 2: На сервере FastPanel

```bash
# Скопируйте файл на сервер
scp domains-with-ids.csv root@your-fastpanel-server:/root/

# Скопируйте скрипт развертывания
scp deploy-tracking.js root@your-fastpanel-server:/root/

# Подключитесь к серверу
ssh root@your-fastpanel-server

# Настройте окружение
export UMAMI_SERVER="https://analytics.yourdomain.com"
export FASTPANEL_SITES_DIR="/var/www"

# Тестовый запуск
DRY_RUN=true node deploy-tracking.js

# Если все ок, реальный запуск
node deploy-tracking.js
```

### Шаг 3: Проверка

```bash
# Посмотрите отчет
cat deployment-report.json

# Проверьте несколько сайтов вручную
curl -I https://site1.com/abc12345.js
```

---

## Переменные окружения

### add-domains-to-umami.js
- `UMAMI_URL` - URL Umami сервера (по умолчанию: `http://localhost:3000`)
- `UMAMI_USERNAME` - Логин администратора
- `UMAMI_PASSWORD` - Пароль
- `INPUT_FILE` - Входной файл с доменами (по умолчанию: `domains.txt`)
- `OUTPUT_FILE` - Выходной файл с результатами (по умолчанию: `domains-with-ids.csv`)

### deploy-tracking.js
- `INPUT_FILE` - Входной файл с доменами и ID (по умолчанию: `domains-with-ids.csv`)
- `UMAMI_SERVER` - URL Umami сервера
- `FASTPANEL_SITES_DIR` - Директория с сайтами (по умолчанию: `/var/www`)
- `NGINX_SITES_DIR` - Директория с конфигами nginx (по умолчанию: `/etc/nginx/sites-available`)
- `DRY_RUN` - Тестовый режим без изменений (`true`/`false`)
- `SKIP_NGINX` - Пропустить настройку nginx (`true`/`false`)
- `SKIP_HTML` - Пропустить внедрение в HTML (`true`/`false`)
- `SKIP_VERIFY` - Пропустить проверку (`true`/`false`)

---

## Устранение проблем

### "Токен не получен"
Проверьте логин и пароль, убедитесь что Umami сервер доступен.

### "Nginx конфиг не найден"
Скрипт ищет конфиг в нескольких местах. Укажите правильный путь через `NGINX_SITES_DIR`.

### "Директория сайта не найдена"
Скрипт ищет в `$FASTPANEL_SITES_DIR/$domain/public_html`. Проверьте структуру директорий.

### "Ошибка перезагрузки nginx"
Запустите `nginx -t` чтобы увидеть ошибки в конфигурации.

---

## Безопасность

- **Уникальный скрипт для каждого сайта**: Злоумышленник не сможет легко определить, что вы используете Umami
- **Прокси через nginx**: Запросы идут через ваш домен, не блокируются AdBlock-ами
- **Кэширование**: Скрипт кэшируется на 1 час, снижая нагрузку на Umami сервер

---

## Производительность

- Скрипт 1: ~100мс на домен (200 доменов ≈ 20 секунд)
- Скрипт 2: ~2-5 секунд на сайт (200 сайтов ≈ 10-15 минут)

---

## Лицензия

MIT
