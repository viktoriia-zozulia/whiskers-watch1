# Деплой WhiskersWatch бесплатно: Neon + Render

Итог: сайт на адресе вида `https://whiskers-watch.onrender.com`, база данных в Neon, автодеплой при каждом `git push`. Банковская карта не нужна ни там, ни там.

Как это устроено. Весь сайт — это один Docker-контейнер (рецепт лежит в `Dockerfile` в корне). Контейнер собирает фронтенд, при старте сам накатывает миграции и запускает бэкенд, а бэкенд отдаёт и API, и страницы сайта. Render собирает и запускает этот контейнер, Neon хранит базу.

> **Что важно знать про бесплатный Render.** Если на сайт 15 минут никто не заходит, сервис «засыпает». Первый заход после этого грузится около минуты, дальше всё работает быстро. Рекрутеру это может показаться поломкой — как этого избежать, описано в шаге 6.

---

## 0. Залить код на GitHub

Render берёт код прямо из репозитория, поэтому все изменения должны быть запушены:

```bash
cd ~/code/pet-health-monitoring
git status            # .env, дамп базы и архивы должны быть в .gitignore и не попадать в список
git add -A
git commit -m "Landing redesign, deploy setup"
git push
```

## 1. База данных в Neon

1. Зайди на https://neon.tech и нажми **Sign up**, удобнее всего через GitHub.
2. **Create project**:
   - Project name: `whiskers-watch`
   - Region: **Europe (Frankfurt)**. Ставь тот же регион, что будет у Render, тогда запросы к базе быстрее.
3. В дашборде проекта нажми **Connect** и скопируй строку подключения. Она выглядит так:
   ```
   postgresql://neondb_owner:xxxx@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
   Хвост `?sslmode=require` должен остаться.
4. *(Необязательно, но полезно.)* Создай аккаунт `demo@whiskers.app / demo1234` с готовыми данными:
   ```bash
   cd backend
   DATABASE_URL="строка_из_neon" bun run migrate
   DATABASE_URL="строка_из_neon" bun run seed
   ```
   Кнопка «Відкрити демо» работает и без этого шага: она сама создаёт временные аккаунты.

## 2. Сервис в Render

1. Зайди на https://render.com и нажми **Get Started**, тоже через GitHub. Дай Render доступ к репозиторию `whiskers-watch1`.
2. **New → Blueprint** и выбери репозиторий. Render найдёт файл `render.yaml` и покажет сервис `whiskers-watch` (Docker, тариф Free).
3. Render попросит значение `DATABASE_URL`. Вставь строку из Neon.
   `JWT_SECRET` Render сгенерирует сам, а `TRUST_PROXY` уже прописан в файле.
4. Нажми **Apply** / **Deploy Blueprint**. Первая сборка идёт 5–10 минут, прогресс видно во вкладке **Logs**. В конце должны появиться строки:
   ```
   Database migration completed successfully.
   🐾 WhiskersWatch app running at http://localhost:…
   ```
5. Ссылка на сайт появится вверху страницы сервиса. Если имя `whiskers-watch` уже занято, Render добавит к нему суффикс.

<details>
<summary>Если Blueprint не подходит: создать сервис вручную</summary>

**New → Web Service** → выбрать репозиторий → Language: **Docker** → Instance type: **Free** → Region: **Frankfurt**.
В **Advanced**:
- Health Check Path: `/api/health`
- Environment Variables:
  - `DATABASE_URL` — строка из Neon;
  - `JWT_SECRET` — любая длинная случайная строка, например вывод `openssl rand -hex 32`;
  - `TRUST_PROXY` = `true`.
</details>

## 3. Проверка

- Открой ссылку и нажми **«Відкрити демо»**: должна открыться картка Сніжка.
- `https://<твой-адрес>/api/health` должен вернуть `{"ok":true}`.
- Попробуй зарегистрироваться, добавить питомца и загрузить фото. Фото хранятся в базе, поэтому переживают перезапуски сервиса.

## 4. Автодеплой

Каждый `git push` в `main` запускает новую сборку и выкладку. Миграции применяются при старте автоматически. В GitHub (вкладка **Actions**) параллельно прогоняются тесты и проверяется сборка Docker-образа.

## 5. Вход через Google (необязательно)

1. Открой https://console.cloud.google.com, затем **APIs & Services → Credentials**. Создай **OAuth client ID** (тип Web application) или открой тот, что у тебя уже есть.
2. В **Authorized JavaScript origins** добавь адрес сайта, например `https://whiskers-watch.onrender.com`.
3. В Render: **Environment → Add Environment Variable** → `GOOGLE_CLIENT_ID` = твой client ID → **Save changes**. Сервис перезапустится сам.

## 6. Чтобы сайт не «засыпал» (по желанию)

Заведи бесплатный пинг, например https://cron-job.org или https://uptimerobot.com: запрос на `https://<твой-адрес>/api/health` раз в 10 минут.
- Этот запрос не обращается к базе, поэтому лимиты Neon не расходуются.
- Один постоянно работающий сервис укладывается в 750 бесплатных часов Render в месяц.

## 7. Финальные штрихи

- Вставь ссылку в начало `README.md` — там есть закомментированная строка-заготовка.
- В описании репозитория на GitHub (шестерёнка **About**) укажи ссылку в поле **Website**.
- В резюме: *WhiskersWatch — full-stack pet health tracker (React, TypeScript, Bun, PostgreSQL). Live demo: …, code: …*

---

## Если что-то пошло не так

| Симптом | Что проверить |
|---|---|
| Сборка падает на `bun install --frozen-lockfile` | Запусти `bun install` локально в `frontend/` и `backend/`, закоммить обновлённые `bun.lock` и запушь. |
| В логах `JWT_SECRET must be set in production` | Не задана переменная `JWT_SECRET`. Добавь её в **Environment**. |
| `connection refused` / `password authentication failed` / ошибка SSL | Неверный `DATABASE_URL`: скопируй строку из Neon заново, вместе с `?sslmode=require`. |
| Сайт открывается около минуты | Это пробуждение после сна (см. шаг 6). |
| Не приходит еженедельный email-отчёт | На бесплатных хостингах исходящие SMTP-порты часто заблокированы. Остальное приложение от этой функции не зависит. |
| Слишком много попыток входа или демо | Срабатывает защита (лимит запросов). Подожди 15–60 минут или перезапусти сервис (**Manual Deploy → Restart service**). |
