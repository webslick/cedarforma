require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const router = require('./routers/router');
const errorMiddleware = require('./middelwares/error-middleware');
const { sequelize } = require('./db/models');
const telegramService = require('./services/telegram-service');
const reminderService = require('./services/reminder-service');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL || 'http://127.0.0.1:3000',
}));

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/api', router);
app.use('/api/leads', require('./routers/lead.routes'));
app.use('/api/admin-auth', require('./routers/admin-auth.routes'));
app.use('/api/admin-users', require('./routers/admin-user.routes'));

app.use(errorMiddleware);

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('База подключена');

    if (process.env.DB_SYNC_ALTER === 'true') {
      await sequelize.sync({ alter: true });
      console.log('Модели синхронизированы');
    }

    app.listen(PORT, () => {
      console.log(`cedarforma.ru server started on port ${PORT}`);
      console.log(`NODE_ENV = ${process.env.NODE_ENV}`);
      telegramService.startPolling();
      reminderService.start();
    });
  } catch (e) {
    console.error('Ошибка запуска сервера:', e);
    process.exit(1);
  }
};

start();
