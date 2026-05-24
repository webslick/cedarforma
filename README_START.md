# CedarForma: запуск одной командой

## Установка зависимостей

```bash
npm run install:all
```

или отдельно:

```bash
cd server && npm install
cd ../client && npm install
cd .. && npm install
```

## Миграции

```bash
npm run migrate
```

## Запуск разработки одной командой

```bash
npm run dev
```

Запустятся сразу:
- backend: http://127.0.0.1:4000
- frontend: http://127.0.0.1:3000

Админка:
http://127.0.0.1:3000/admin/login

Логин: admin
Пароль: admin12345

## Почему так

В корне проекта добавлен общий `package.json`, как в MonteQuiz:

```json
"dev": "cross-env NODE_ENV=development run-p server client"
```

Теперь не надо запускать сервер и клиент двумя руками, как будто мы снова в 2007 году.
