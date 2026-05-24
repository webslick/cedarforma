# Telegram debug для CedarForma

В v13 отправка заявки в Telegram сделана синхронно и с подробными логами.

После создания заявки в терминале сервера должны появиться строки:

```bash
[Telegram] new lead #ID. Recipients: 1 [ '245880107' ]
[Telegram] lead #ID sent to 245880107
[LeadService] Telegram notification result: { ok: true, sent: 1, errors: [] }
```

Если `Recipients: 0`, проверь:

```sql
SELECT id, chatId, username, firstName, isActive
FROM CedarTelegramSubscribers;
```

`isActive` должен быть `1`.

Если отправка падает, в логах будет конкретный `chatId` и ошибка Telegram.
