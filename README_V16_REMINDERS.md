# CedarForma v16: напоминания по заявкам

Что добавлено:
- автоматическая проверка зависших заявок;
- Telegram-напоминания менеджерам;
- события `reminder` в истории заявки;
- фильтр админки «Требуют внимания»;
- сохранены все Telegram-фиксы: никаких `tel:` в inline-кнопках, телефон через `lead_phone:${lead.id}`, WhatsApp через очищенный `wa.me`.

После обновления:

```bash
cd server
npx sequelize-cli db:migrate
cd ..
yarn
yarn dev
```

Настройки в `server/.env`:

```env
LEAD_REMINDER_CHECK_MINUTES=10
LEAD_REMINDER_NEW_MINUTES=30
LEAD_REMINDER_IN_WORK_HOURS=24
LEAD_REMINDER_MEASUREMENT_HOURS=48
LEAD_REMINDER_COOLDOWN_MINUTES=120
```

Логика:
- новая заявка без реакции дольше 30 минут → напоминание;
- заявка «В работе» без движения дольше 24 часов → напоминание;
- заявка «Замер» без сметы дольше 48 часов → напоминание;
- просрочен `nextContactAt` → напоминание.
