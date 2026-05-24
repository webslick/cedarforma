import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../../../api';

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    login: 'admin',
    password: 'admin12345',
  });

  const [error, setError] = useState('');

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError('');

      const response = await api.post('/admin-auth/login', form);

      localStorage.setItem('adminToken', response.data.data.token);

      navigate('/admin/leads');
    } catch (e) {
      setError(e.response?.data?.message || 'Ошибка входа');
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>CedarForma Admin</h1>
        <p>Вход в админку заявок и управления сайтом.</p>

        <input
          name="login"
          placeholder="Логин"
          value={form.login}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Пароль"
          value={form.password}
          onChange={handleChange}
        />

        {error && <div className="error">{error}</div>}

        <button type="submit">Войти</button>
      </form>
    </div>
  );
}