### AI ASSISTANT RULES — Umami Analytics (Fork)

#### 0. СТРАТЕГИЯ КАСТОМИЗАЦИИ
**Этот проект — форк официального Umami с регулярными обновлениями из upstream**

**Принципы кастомизации:**
- Максимальная изоляция изменений для минимизации конфликтов при merge
- Новые фичи добавляй в отдельные файлы/модули, избегай правок существующих файлов
- Если нужна правка core-файла — делай точечные изменения, избегай рефакторинга
- Используй расширение через наследование, композицию, plugin patterns
- Документируй все кастомизации в `CUSTOMIZATIONS.md` с указанием причины и затронутых файлов
- Перед большими изменениями проверяй, можно ли решить задачу через конфигурацию или внешние скрипты

**Git workflow:**
```bash
# Получить обновления из официального репозитория
git pull upstream master

# Запушить изменения в свой форк
git push origin master
# или просто: git push

# Origin: https://github.com/WebDevRes/umami (твой форк)
# Upstream: https://github.com/umami-software/umami (официальный репо)
```

#### 1. ЭКОНОМИЯ ТОКЕНОВ
- Читай только необходимые файлы, избегай чтения node_modules/, .next/, dist/, build/
- Используй Grep/Glob вместо полного чтения файлов для поиска
- При редактировании показывай только измененные части
- Не дублируй код в ответах - ссылайся на строки (например, `src/lib/utils.ts:42`)
- Параллельные tool calls для независимых операций
- Не читай логи полностью - используй фильтры или grep

#### 2. АРХИТЕКТУРА ПРОЕКТА
**Stack:** Next.js 15 + React 19 + TypeScript + Prisma + PostgreSQL/MySQL/ClickHouse
- **Framework:** Next.js 15 (App Router) с React Server Components
- **Frontend:** React 19 + react-basics (UI components)
- **Backend:** Next.js API Routes (src/app/api/)
- **Database:** Prisma ORM (db/prisma/schema.prisma)
- **State:** Zustand (src/store/)
- **Queries:** TanStack Query (src/queries/)
- **Tracker:** Отдельный скрипт rollup (src/tracker/)
- **i18n:** react-intl (public/intl/messages/)
- **Styling:** CSS Modules

**Структура:**
```
src/
├── app/              # Next.js App Router (pages + API routes)
├── components/       # React компоненты
├── lib/              # Утилиты и хелперы
├── queries/          # TanStack Query hooks
├── store/            # Zustand stores
├── tracker/          # Tracking скрипт
└── styles/           # Global CSS
db/                   # Prisma схемы
scripts/              # Build и utility скрипты
public/               # Статические файлы
```

#### 3. СТИЛЬ КОДА
- TypeScript strict mode
- 2 spaces indentation, UTF-8, LF
- Именование: camelCase для функций/переменов, PascalCase для компонентов/типов
- React: Function components + hooks
- Следуй существующим паттернам проекта (проверяй аналогичные файлы)
- ESLint + Prettier настроены (npm run lint)

#### 4. РАБОТА С ЗАДАЧАМИ
- Сначала понять задачу, затем искать нужный код
- Проверяй существующие реализации перед предложением нового
- Для API endpoints смотри src/app/api/
- Для UI компонентов смотри src/components/
- Для DB queries смотри src/queries/ и db/prisma/
- Для tracker изменений смотри src/tracker/
- Используй scripts/ для автоматизации задач

**Build процесс:**
```bash
npm run dev           # Разработка (localhost:3000)
npm run build         # Production build
npm run start         # Запуск production
npm run lint          # Линтинг
npm test              # Jest тесты
```

**Dev сервер управление:**
- **ВСЕГДА проверяй занят ли порт 3000 ПЕРЕД запуском:** `netstat -ano | findstr :3000`
- Если порт занят — убей процесс: `taskkill //F //PID <PID>`
- Только потом запускай `npm run dev` в фоне
- НИКОГДА не запускай dev сервер на другом порту (3001, 3002, etc)

#### 5. БЕЗОПАСНОСТЬ
- .env файлы НИКОГДА не коммитить (используй .env.example для шаблонов)
- Секреты только через process.env
- Database queries через Prisma (защита от SQL injection)
- Валидация входных данных через Zod schemas
- API endpoints требуют аутентификацию (JWT через lib/auth)
- XSS защита: никогда dangerouslySetInnerHTML без sanitization

#### 6. КАСТОМИЗАЦИЯ И СОВМЕСТИМОСТЬ
**Перед изменением existing файлов:**
1. Проверь, можно ли решить через новый компонент/модуль
2. Используй композицию вместо модификации core файлов
3. Если правка неизбежна — делай минимальные точечные изменения
4. Добавь комментарий `// CUSTOM: причина изменения`

**Документирование:**
- Все кастомизации записывай в `CUSTOMIZATIONS.md`
- Формат: `[Файл] - [Что изменено] - [Зачем] - [Дата]`
- Это поможет при разрешении конфликтов после `git pull upstream master`

**Конфликты при merge:**
- Приоритет upstream изменениям, если твои правки можно переписать
- Если кастомизация критична — аккуратно merge и тестируй

#### 7. ОТВЕТЫ
- **ВСЕГДА отвечай на русском языке** - все объяснения, диагнозы, планы и общение только на русском
- Код и комментарии на английском (стандарт проекта)
- Кратко: диагноз → решение → код (если нужен)
- При неясности - спроси, не угадывай
- Для больших изменений - план по шагам с учетом будущих merge конфликтов
- Ссылки на файлы: `[filename.ts:42](src/filename.ts#L42)`