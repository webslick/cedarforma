import { Navigate, Routes, Route, NavLink } from 'react-router-dom';
import './admin.css';

import LoginPage from '../../pages/admin/LoginPage';
import LeadsPage from '../../pages/admin/LeadsPage';
import AdminUsersPage from '../../pages/admin/AdminUsersPage';

function AdminLayout({ children }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-title">CedarForma</div>
        <nav className="sidebar-nav">
          <NavLink to="/admin/leads">Заявки</NavLink>
          <NavLink to="/admin/users">Админы</NavLink>
          <NavLink to="/">На сайт</NavLink>
        </nav>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}

export default function AdminApp() {
  return (
    <div className="mq-admin-app">
      <Routes>
        <Route index element={<Navigate to="leads" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="leads" element={<AdminLayout><LeadsPage /></AdminLayout>} />
        <Route path="users" element={<AdminLayout><AdminUsersPage /></AdminLayout>} />
      </Routes>
    </div>
  );
}
