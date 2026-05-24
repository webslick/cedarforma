# CedarForma: запуск в общей базе с MonteQuiz

Проект специально переведён на отдельные таблицы с префиксом `Cedar`, чтобы не конфликтовать с уже существующими таблицами MonteQuiz.

## Таблицы CedarForma

- `CedarAdminUsers`
- `CedarAdminSettings`
- `CedarLeads`

## Почему так

В MonteQuiz уже есть таблицы `AdminUsers`, `AdminSettings`, `Players`, `Quests`, `Questions`, `Orders`, `Accesses`, `GameSessions`, `HintUsages` и другие. Поэтому CedarForma не создаёт таблицы с такими же именами и не трогает игровые таблицы.

## Команды

```bash
cd server
npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev
```

## Админка

- адрес: `/admin`
- login: `admin`
- password: `admin12345`

После первого входа пароль лучше поменять.
