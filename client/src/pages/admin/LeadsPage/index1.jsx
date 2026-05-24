import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../../../api';

const statuses = {
  new: 'Новая',
  in_work: 'В работе',
  measurement: 'Замер',
  estimate: 'Смета',
  done: 'Завершено',
  cancelled: 'Отказ',
};

const statusClass = {
  new: 'fresh',
  in_work: 'work',
  measurement: 'measure',
  estimate: 'estimate',
  done: 'done',
  cancelled: 'cancelled',
};

const eventLabels = {
  created: 'Создание',
  status_changed: 'Статус',
  updated: 'Изменение',
  deleted: 'Удаление',
  telegram_action: 'Telegram',
  reminder: 'Напоминание',
};

const emptyEdit = {
  status: 'new',
  managerNote: '',
  nextContactAt: '',
  address: '',
  budget: '',
  message: '',
};

function toInputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU');
}

export default function LeadsPage() {
  const token = localStorage.getItem('adminToken');
  const [leads, setLeads] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [edit, setEdit] = useState(emptyEdit);
  const [statusFilter, setStatusFilter] = useState('all');
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    const params = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (search.trim()) params.search = search.trim();
    if (attentionOnly) params.attention = 'true';
    const { data } = await api.get('/leads', { params });
    setLeads(data.leads || []);
    setLoading(false);
  };

  const loadEvents = async (leadId) => {
    if (!leadId) return;
    setEventsLoading(true);
    try {
      const { data } = await api.get(`/leads/${leadId}/events`);
      setEvents(data.events || []);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (token) load().catch(() => setLoading(false));
  }, [token, statusFilter, attentionOnly]);

  const counters = useMemo(() => {
    return leads.reduce((acc, lead) => {
      acc.total += 1;
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      if (lead.requiresAttention) acc.attention = (acc.attention || 0) + 1;
      return acc;
    }, { total: 0 });
  }, [leads]);

  const openLead = (lead) => {
    setActive(lead);
    setEdit({
      status: lead.status || 'new',
      managerNote: lead.managerNote || '',
      nextContactAt: toInputDate(lead.nextContactAt),
      address: lead.address || '',
      budget: lead.budget || '',
      message: lead.message || '',
    });
    setMessage('');
    setEvents([]);
    loadEvents(lead.id).catch(() => setEventsLoading(false));
  };

  const update = async (payload = edit) => {
    if (!active) return;
    const { data } = await api.patch(`/leads/${active.id}`, payload);
    setActive(data.lead);
    setLeads((prev) => prev.map((lead) => lead.id === active.id ? data.lead : lead));
    setMessage('Заявка обновлена');
    await loadEvents(active.id);
  };

  const quickStatus = async (lead, status) => {
    const { data } = await api.patch(`/leads/${lead.id}`, { status });
    setLeads((prev) => prev.map((item) => item.id === lead.id ? data.lead : item));
    if (active?.id === lead.id) {
      setActive(data.lead);
      setEdit((prev) => ({ ...prev, status: data.lead.status }));
      await loadEvents(lead.id);
    }
  };

  const remove = async () => {
    if (!active || !window.confirm('Удалить заявку?')) return;
    await api.delete(`/leads/${active.id}`);
    setLeads((prev) => prev.filter((lead) => lead.id !== active.id));
    setActive(null);
    setEvents([]);
  };

  const exportCsv = () => {
    const rows = [
      ['Дата', 'Имя', 'Телефон', 'Услуга', 'Адрес', 'Бюджет', 'Статус', 'Комментарий менеджера'],
      ...leads.map((lead) => [
        new Date(lead.createdAt).toLocaleString('ru-RU'), lead.name, lead.phone, lead.service || '', lead.address || '', lead.budget || '', statuses[lead.status], lead.managerNote || '',
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(';')).join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cedarforma-leads.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!token) return <Navigate to="/admin/login" replace />;

  return (
    <div className="leads-crm">
      <div className="admin-top crm-head">
        <div>
          <h1>Заявки</h1>
          <p>Мини-CRM для CedarForma. Теперь с историей действий и контролем заявок, которые требуют внимания.</p>
        </div>
        <div className="crm-actions">
          <button className="secondary" onClick={exportCsv}>Экспорт CSV</button>
          <button className="secondary" onClick={load}>Обновить</button>
        </div>
      </div>

      <div className="crm-stats">
        <button className={statusFilter === 'all' ? 'active' : ''} onClick={() => setStatusFilter('all')}>Все <b>{counters.total}</b></button>
        {Object.entries(statuses).map(([value, label]) => (
          <button key={value} className={statusFilter === value ? 'active' : ''} onClick={() => setStatusFilter(value)}>{label} <b>{counters[value] || 0}</b></button>
        ))}
        <button className={attentionOnly ? 'active danger-filter' : ''} onClick={() => setAttentionOnly((value) => !value)}>Требуют внимания <b>{counters.attention || 0}</b></button>
      </div>

      <div className="crm-toolbar">
        <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Поиск: имя, телефон, услуга, адрес" />
        <button onClick={load}>Найти</button>
      </div>

      <div className="crm-grid">
        <section className="lead-list admin-card">
          {loading ? <p>Загрузка...</p> : leads.length === 0 ? <p>Заявок пока нет.</p> : leads.map((lead) => (
            <article className={`lead-row ${active?.id === lead.id ? 'selected' : ''}`} key={lead.id} onClick={() => openLead(lead)}>
              <div>
                <span className={`lead-badge ${statusClass[lead.status]}`}>{statuses[lead.status]}</span>
                {lead.requiresAttention && <span className="lead-badge attention">Требует внимания</span>}
                <h3>{lead.name}</h3>
                <p>{lead.phone} · {lead.service || 'услуга не указана'}</p>
                <small>{formatDate(lead.createdAt)}</small>
                {lead.attentionReason && <small className="attention-text">{lead.attentionReason.title}</small>}
              </div>
              <select value={lead.status} onClick={(e) => e.stopPropagation()} onChange={(e) => quickStatus(lead, e.target.value)}>
                {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </article>
          ))}
        </section>

        <aside className="lead-panel admin-card">
          {!active ? (
            <div className="lead-empty">
              <h2>Выбери заявку</h2>
              <p>Справа появятся детали, заметки, дата следующего контакта, статус и вся история действий.</p>
            </div>
          ) : (
            <div className="lead-edit">
              <div className="lead-edit-head">
                <div>
                  <span className={`lead-badge ${statusClass[active.status]}`}>{statuses[active.status]}</span>
                  {active.requiresAttention && <span className="lead-badge attention">Требует внимания</span>}
                  <h2>{active.name}</h2>
                  {active.attentionReason && <p className="attention-text">{active.attentionReason.title}: {active.attentionReason.text}</p>}
                  <a href={`tel:+${active.phone}`}>+{active.phone}</a>
                </div>
                <button className="danger-button" onClick={remove}>Удалить</button>
              </div>

              {message && <div className="info">{message}</div>}

              <label>Статус
                <select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                  {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>

              <label>Адрес / ориентир участка
                <input value={edit.address} onChange={(e) => setEdit({ ...edit, address: e.target.value })} placeholder="Например: Бердск, СНТ, коттеджный посёлок" />
              </label>

              <label>Бюджет / масштаб
                <input value={edit.budget} onChange={(e) => setEdit({ ...edit, budget: e.target.value })} placeholder="Например: до 300 тыс / участок 12 соток" />
              </label>

              <label>Следующий контакт
                <input type="datetime-local" value={edit.nextContactAt} onChange={(e) => setEdit({ ...edit, nextContactAt: e.target.value })} />
              </label>

              <label>Комментарий клиента
                <textarea value={edit.message} onChange={(e) => setEdit({ ...edit, message: e.target.value })} rows="4" />
              </label>

              <label>Заметка менеджера
                <textarea value={edit.managerNote} onChange={(e) => setEdit({ ...edit, managerNote: e.target.value })} rows="5" placeholder="Что обещали, когда перезвонить, что предложить" />
              </label>

              <button onClick={() => update()}>Сохранить изменения</button>

              <div className="lead-history">
                <div className="lead-history-head">
                  <h3>История действий</h3>
                  <button type="button" className="secondary small-button" onClick={() => loadEvents(active.id)}>Обновить</button>
                </div>

                {eventsLoading ? <p>Загрузка истории...</p> : events.length === 0 ? <p className="muted">Пока пусто. История ещё не успела стать летописью.</p> : (
                  <div className="timeline">
                    {events.map((event) => (
                      <div className="timeline-item" key={event.id}>
                        <div className="timeline-dot" />
                        <div className="timeline-card">
                          <div className="timeline-meta">
                            <b>{eventLabels[event.type] || event.type}</b>
                            <span>{formatDate(event.createdAt)}</span>
                          </div>
                          <p>{event.comment || 'Действие без комментария'}</p>
                          {(event.oldStatus || event.newStatus) && (
                            <small>
                              {event.oldStatus ? statuses[event.oldStatus] || event.oldStatus : '—'} → {event.newStatus ? statuses[event.newStatus] || event.newStatus : '—'}
                            </small>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
