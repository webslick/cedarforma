import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { api } from '../../../api';

const initialForm = {
  login: '',
  email: '',
  password: '',
  name: '',
  role: 'manager',
};

export default function AdminUsersPage() {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadAdmins = async () => {
    const response = await api.get('/admin-users');
    setAdmins(response.data.data || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        await loadAdmins();
      } catch (e) {
        setError(e.response?.data?.message || 'Ошибка загрузки админов');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      setMessage('');
      setError('');

      await api.post('/admin-users', form);

      setForm(initialForm);
      setMessage('Админ создан');

      await loadAdmins();
    } catch (e) {
      setError(e.response?.data?.message || 'Ошибка создания админа');
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      setMessage('');
      setError('');

      await api.patch(`/admin-users/${id}`, payload);

      setMessage('Админ обновлён');

      await loadAdmins();
    } catch (e) {
      setError(e.response?.data?.message || 'Ошибка обновления админа');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Удалить админа?');

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage('');
      setError('');

      await api.delete(`/admin-users/${id}`);

      setMessage('Админ удалён');

      await loadAdmins();
    } catch (e) {
      setError(e.response?.data?.message || 'Ошибка удаления админа');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="layout">
      <header className="topbar">
        <div>
          <Link to="/admin/leads">← Заявки</Link>
          <h1>Администраторы</h1>
          <p>
            Раздаём ключи от замка аккуратно, а не как Wi-Fi пароль на подъезде.
          </p>
        </div>

        <button className="secondary" type="button" onClick={logout}>
          Выйти
        </button>
      </header>

      {message && <div className="info">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="grid">
        <form className="card" onSubmit={handleCreate}>
          <h2>Создать админа</h2>

          <input
            name="login"
            placeholder="Логин"
            value={form.login}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Пароль"
            value={form.password}
            onChange={handleChange}
            required
          />

          <input
            name="name"
            placeholder="Имя"
            value={form.name}
            onChange={handleChange}
          />

          <select name="role" value={form.role} onChange={handleChange}>
            <option value="manager">manager</option>
            <option value="admin">admin</option>
          </select>

          <button type="submit">Создать</button>
        </form>

        <div className="card">
          <h2>Список</h2>

          {isLoading && <p className="muted">Загрузка...</p>}

          {!isLoading && (
            <div className="list">
              {admins.map((admin) => (
                <div className="admin-item" key={admin.id}>
                  <div>
                    <b>{admin.login}</b>
                    <span>
                      {admin.name || 'Без имени'} · {admin.email || 'без email'}
                    </span>
                  </div>

                  <div className="admin-actions">
                    <select
                      value={admin.role}
                      onChange={(event) =>
                        handleUpdate(admin.id, { role: event.target.value })
                      }
                    >
                      <option value="manager">manager</option>
                      <option value="admin">admin</option>
                    </select>

                    <button
                      className={admin.isActive ? 'secondary' : ''}
                      type="button"
                      onClick={() =>
                        handleUpdate(admin.id, { isActive: !admin.isActive })
                      }
                    >
                      {admin.isActive ? 'Выключить' : 'Включить'}
                    </button>

                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => handleDelete(admin.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}

              {admins.length === 0 && (
                <p className="muted">
                  Админов нет. Замок стоит открытый, цивилизация снова удивила.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}