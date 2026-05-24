# Исправление входа в админку

Ошибка `POST http://127.0.0.1:3000/api/admin-auth/login 404` была из-за отсутствия proxy в `client/vite.config.js`.

Теперь Vite проксирует все `/api/*` запросы на backend:

```js
proxy: {
  '/api': {
    target: 'http://127.0.0.1:4000',
    changeOrigin: true,
    secure: false,
  },
}
```

Запуск:

```bash
cd server
yarn install
yarn dev

cd ../client
yarn install
yarn dev
```

Админка:

```txt
http://127.0.0.1:3000/admin/login
login: admin
password: admin12345
```

Проверка backend:

```bash
curl http://127.0.0.1:4000/api/health
curl -X POST http://127.0.0.1:4000/api/admin-auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin12345"}'
```
