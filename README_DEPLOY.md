# CedarForma production package

Состав:
- `client` — React/Vite публичный сайт + админка
- `server` — Express API + Sequelize + MySQL
- `client/public/uploads` — обработанные реальные фото работ
- `client/public/cedar-logo.png` — PNG-логотип в шапке

Запуск локально:

```bash
cd server
npm install
npm run dev
```

Перед продом проверьте `.env` в `server` и `VITE_API_URL` при необходимости.
