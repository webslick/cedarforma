# CedarForma v15: история действий по заявкам

Добавлено:

- таблица `CedarLeadEvents`;
- модель `LeadEvent`;
- запись события при создании заявки;
- запись события при смене статуса из админки;
- запись события при изменении данных заявки;
- запись события при Telegram-действиях менеджера;
- API `GET /api/leads/:id/events`;
- лента истории в карточке заявки в админке.

После обновления выполнить:

```bash
cd server
npx sequelize-cli db:migrate
cd ..
yarn dev
```

Проверка в MySQL:

```sql
SHOW TABLES LIKE 'CedarLeadEvents';
SELECT * FROM CedarLeadEvents ORDER BY id DESC;
```

Важно: фикс Telegram-кнопок сохранён. `tel:` в inline keyboard не используется. Телефон отдаётся через `callback_data: lead_phone:<id>`, WhatsApp открывается через `https://wa.me/` с очищенным номером.
