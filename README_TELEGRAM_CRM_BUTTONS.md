# CedarForma v12 — Telegram CRM кнопки

Что добавлено:

- Новая заявка приходит в Telegram с inline-кнопками.
- Менеджер может нажать:
  - ✅ Взять в работу
  - 📅 Назначить замер
  - 📐 Смета
  - 🏁 Закрыть
  - ❌ Отказ
  - 📞 Позвонить
  - 💬 WhatsApp
- Статус заявки меняется в таблице `CedarLeads`.
- Менеджер, который нажал кнопку, записывается в поля:
  - `assignedManagerChatId`
  - `assignedManagerName`
- При закрытии заявки заполняется `closedAt`.

## Важно по базе

Если у тебя уже запускалась версия v11, выполни новую миграцию:

```bash
cd server
npx sequelize-cli db:migrate
```

Новая миграция:

```text
20260524000500-add-telegram-crm-fields-to-cedar-leads.js
```

Она не трогает таблицы MonteQuiz и только добавляет поля в `CedarLeads`.

## .env

В `server/.env` должны быть:

```env
TELEGRAM_BOT_TOKEN=токен_бота
TELEGRAM_JOIN_PASSWORD=пароль_для_менеджеров
```

Опционально можно оставить статические chat_id:

```env
TELEGRAM_CHAT_ID=123456789,987654321
```

Но лучше подключать менеджеров через:

```text
/join пароль
```

## Запуск

Из корня проекта:

```bash
yarn dev
```

или:

```bash
npm run dev
```
