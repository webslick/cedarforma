import { useState } from 'react';
import { api } from '../../../api';
import './style.css';

const services = [
  {
    title: 'Озеленение участка под ключ',
    price: 'от 390 ₽/м²',
    note: 'Подбор и высадка хвойных, кустарников, газона и живых зон под стиль дома.',
    image: '/uploads/service-landscape.jpg',
  },
  {
    title: 'Крупномеры и собственный питомник',
    price: 'по запросу',
    note: 'Ели, сосны и декоративные растения с подбором, доставкой и посадкой.',
    image: '/uploads/service-nursery.jpg',
  },
  {
    title: 'Хозблоки и садовые постройки',
    price: 'по проекту',
    note: 'Аккуратные хозяйственные модули, навесы и деревянные конструкции для участка.',
    image: '/uploads/service-hozblok.jpg',
  },
  {
    title: 'Собачьи будки и вольеры',
    price: 'по размеру',
    note: 'Деревянные будки, утеплённые решения и вольеры под конкретную задачу.',
    image: '/uploads/service-doghouse.jpg',
  },
  {
    title: 'Уличные туалеты и малые формы',
    price: 'по проекту',
    note: 'Дачные туалеты, душевые, компактные строения и полезные элементы участка.',
    image: '/uploads/service-toilet.jpg',
  },
  {
    title: 'Демонтаж построек',
    price: 'по смете',
    note: 'Разбор старых зданий, вывоз, подготовка территории под новый сценарий участка.',
    image: '/uploads/service-demolition.jpg',
  },
];

const gallery = [
  { image: '/uploads/work-01.jpg', title: 'Питомник хвойных растений', tag: 'растения' },
  { image: '/uploads/work-02.jpg', title: 'Подготовка посадочного материала', tag: 'озеленение' },
  { image: '/uploads/work-03.jpg', title: 'Деревянный хозблок', tag: 'постройки' },
  { image: '/uploads/work-04.jpg', title: 'Будка для собаки', tag: 'малые формы' },
  { image: '/uploads/work-05.jpg', title: 'Хозблок на участке', tag: 'постройки' },
  { image: '/uploads/work-06.jpg', title: 'Садовая постройка', tag: 'дерево' },
  { image: '/uploads/work-07.jpg', title: 'Хвойные в наличии', tag: 'питомник' },
  { image: '/uploads/work-08.jpg', title: 'Ели с комом', tag: 'крупномеры' },
  { image: '/uploads/work-09.jpg', title: 'Доставка растений', tag: 'логистика' },
  { image: '/uploads/work-10.jpg', title: 'Растения для участка', tag: 'озеленение' },
  { image: '/uploads/work-11.jpg', title: 'Демонтаж кровли', tag: 'демонтаж' },
  { image: '/uploads/work-12.jpg', title: 'Работы зимой', tag: 'процесс' },
];

const steps = ['Созвон', 'Выезд и осмотр', 'Смета', 'Договор', 'Работы', 'Сдача'];
const advantages = ['Свои растения и поставщики', 'Постройки под размер участка', 'Работаем комплексно', 'Показываем реальные работы'];
const featureCards = [
  { icon: 'person', title: 'Индивидуальный подход', text: 'Не лепим один шаблон на все дворы. Смотрим участок, задачи и бюджет.' },
  { icon: 'cube', title: 'Комплексные решения', text: 'Озеленение, постройки, демонтаж и подготовка территории в одной логике.' },
  { icon: 'leaf', title: 'Собственный питомник', text: 'Есть хвойные растения и крупномеры, которые можно подобрать под объект.' },
  { icon: 'shield', title: 'Работа по делу', text: 'Без театра из обещаний. Смета, сроки, понятный результат и нормальная коммуникация.' },
];
const stats = [
  { value: '10+', label: 'лет практического опыта' },
  { value: '250+', label: 'растений в наличии' },
  { value: '6', label: 'ключевых направлений' },
  { value: 'Под ключ', label: 'от идеи до реализации' },
];

function FeatureIcon({ name }) {
  const common = { width: 42, height: 42, viewBox: '0 0 48 48', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (name === 'person') return <svg {...common}><circle cx="24" cy="15" r="7"/><path d="M11 42c2-9 8-14 13-14s11 5 13 14"/><path d="M8 42h32"/></svg>;
  if (name === 'cube') return <svg {...common}><path d="M24 5l17 9v20l-17 9-17-9V14l17-9z"/><path d="M7 14l17 10 17-10"/><path d="M24 24v19"/><path d="M17 20l14-8"/></svg>;
  if (name === 'leaf') return <svg {...common}><path d="M38 9C22 10 12 19 11 35c15 1 25-7 27-26z"/><path d="M12 35c8-10 15-15 26-26"/><path d="M20 34l-5 8"/></svg>;
  return <svg {...common}><path d="M24 5l15 6v12c0 10-6 17-15 20C15 40 9 33 9 23V11l15-6z"/><path d="M18 24l4 4 8-9"/></svg>;
}

export default function Home() {
  const [form, setForm] = useState({ name: '', phone: '', service: services[0].title, address: '', budget: '', message: '' });
  const [status, setStatus] = useState('idle');

  const change = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus('loading');

    try {
      await api.post('/leads', form);
      setForm({ name: '', phone: '', service: services[0].title, address: '', budget: '', message: '' });
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <main className="cf-page">
      <div className="cf-topline">
        <div className="cf-container cf-topline-inner">
          <span>Новосибирск и область</span>
          <div>
            <a href="tel:+79000000000">+7 (900) 000-00-00</a>
            <a href="mailto:info@cedarforma.ru">info@cedarforma.ru</a>
            <a href="#lead">Обратная связь</a>
          </div>
        </div>
      </div>

      <header className="cf-header cf-container">
        <a className="cf-logo" href="#top" aria-label="CedarForma">
          <img src="/cedar-logo.png" alt="CedarForma" />
        </a>
        <nav>
          <a href="#services">Услуги</a>
          <a href="#works">Работы</a>
          <a href="#about">О нас</a>
          <a href="#process">Как работаем</a>
          <a href="#lead">Контакты</a>
        </nav>
        <a className="cf-outline" href="#lead">Оставить заявку</a>
      </header>

      <section id="top" className="cf-hero">
        <div className="cf-hero-shade" />
        <div className="cf-container cf-hero-content">
          <div className="cf-hero-text">
            <span className="cf-kicker">благоустройство участков под ключ</span>
            <h1>Создаём пространство для жизни.</h1>
            <p>
              Озеленяем участки, подбираем крупномеры, делаем садовые постройки,
              хозблоки, вольеры и готовим территорию под новый сценарий жизни.
            </p>
            <div className="cf-actions">
              <a className="cf-btn" href="#lead">Рассчитать стоимость</a>
              <a className="cf-ghost" href="#works">Смотреть работы</a>
            </div>
          </div>
          <form className="cf-hero-form" onSubmit={submit}>
            <h2>Оставьте заявку</h2>
            <p>Свяжемся, уточним задачу и прикинем стоимость по вашему участку.</p>
            <input name="name" value={form.name} onChange={change} placeholder="Ваше имя" required />
            <input name="phone" value={form.phone} onChange={change} placeholder="Телефон" required />
            <select name="service" value={form.service} onChange={change}>
              {services.map((service) => <option key={service.title}>{service.title}</option>)}
            </select>
            <input name="address" value={form.address} onChange={change} placeholder="Где участок?" />
            <button className="cf-btn" disabled={status === 'loading'}>{status === 'loading' ? 'Отправляем...' : 'Получить расчёт'}</button>
            {status === 'success' && <small className="cf-success">Заявка отправлена. Порядок победил хаос 🌲</small>}
            {status === 'error' && <small className="cf-error">Не получилось отправить. Проверьте сервер или поля.</small>}
          </form>
        </div>
      </section>

      <section className="cf-info-strip cf-container" aria-label="Преимущества CedarForma">
        <div className="cf-feature-grid">
          {featureCards.map((item) => (
            <article className="cf-feature-card" key={item.title}>
              <FeatureIcon name={item.icon} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <div className="cf-stats-panel">
          {stats.map((item) => (
            <div className="cf-stat-item" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="cf-section cf-container">
        <div className="cf-section-head">
          <span className="cf-kicker">услуги и цены</span>
          <h2>Работы по участку без лишнего театра</h2>
          <p>Цены стартовые. Финальная смета зависит от размеров, материалов, доступа техники и состояния участка. Земля, как обычно, делает вид, что она главный инвестор проекта.</p>
        </div>
        <div className="cf-service-grid">
          {services.map((service, index) => (
            <article className="cf-service-card cf-reveal" style={{ animationDelay: `${index * 90}ms`, '--service-image': `url(${service.image})` }} key={service.title}>
              <div className="cf-card-photo"><span>{String(index + 1).padStart(2, '0')}</span></div>
              <div className="cf-card-body">
                <h3>{service.title}</h3>
                <strong>{service.price}</strong>
                <p>{service.note}</p>
                <a href="#lead">Подробнее</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="works" className="cf-works cf-container">
        <div className="cf-section-head">
          <span className="cf-kicker">реальные работы</span>
          <h2>Не стоки, а наши объекты и материалы</h2>
          <p>Фотографии обработаны в едином стиле: аккуратные кадры, тёплая цветокоррекция и затемнение. Не глянец ради глянца, а честная подача без визуального бардака.</p>
        </div>
        <div className="cf-gallery-grid">
          {gallery.map((item, index) => (
            <article className={`cf-work-card ${index === 0 || index === 8 ? 'wide' : ''}`} key={item.image} style={{ '--work-image': `url(${item.image})` }}>
              <div className="cf-work-photo" />
              <div className="cf-work-caption">
                <span>{item.tag}</span>
                <h3>{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="cf-about">
        <div className="cf-container cf-about-grid">
          <div className="cf-portrait" />
          <div>
            <span className="cf-kicker">о cedarforma</span>
            <h2>Делаем участок красивым, полезным и живым</h2>
            <p>
              Мы не продаём “картинку из интернета”. Работаем с реальными участками,
              растениями, деревом, демонтажем и задачами, которые обычно всплывают уже
              по колено в грязи. Поэтому собираем всё в понятный план: что убрать,
              что посадить, что построить и как это будет служить.
            </p>
            <div className="cf-advantages">
              {advantages.map((item) => <div key={item}><b>✓</b><span>{item}</span></div>)}
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="cf-section cf-container">
        <div className="cf-section-head">
          <span className="cf-kicker">как мы работаем</span>
          <h2>От заявки до готового участка</h2>
        </div>
        <div className="cf-process">
          {steps.map((step, index) => (
            <div className="cf-step" key={step}>
              <b>{String(index + 1).padStart(2, '0')}</b>
              <span>{step}</span>
              <p>{index === 0 ? 'Понимаем задачу и ожидания.' : index === 1 ? 'Смотрим участок и ограничения.' : index === 2 ? 'Фиксируем объём и стоимость.' : index === 3 ? 'Работаем официально и спокойно.' : index === 4 ? 'Закупаем, строим, высаживаем.' : 'Передаём результат и рекомендации.'}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="lead" className="cf-final cf-container">
        <div>
          <span className="cf-kicker">обратная связь</span>
          <h2>Расскажите, что нужно сделать на участке</h2>
          <p>Озеленение, постройка, демонтаж, питомник или комплексно. Разберём задачу и предложим первый план.</p>
        </div>
        <form onSubmit={submit}>
          <input name="name" value={form.name} onChange={change} placeholder="Ваше имя" required />
          <input name="phone" value={form.phone} onChange={change} placeholder="Телефон" required />
          <select name="service" value={form.service} onChange={change}>
            {services.map((service) => <option key={service.title}>{service.title}</option>)}
          </select>
          <input name="address" value={form.address} onChange={change} placeholder="Где находится участок?" />
          <input name="budget" value={form.budget} onChange={change} placeholder="Примерный бюджет / площадь" />
          <textarea name="message" value={form.message} onChange={change} placeholder="Коротко опишите участок: что нужно сделать, где находится, когда хотите начать" />
          <button className="cf-btn" disabled={status === 'loading'}>{status === 'loading' ? 'Отправляем...' : 'Отправить заявку'}</button>
        </form>
      </section>

      <footer className="cf-footer">
        <div className="cf-container">
          <b>CedarForma</b>
          <span>© 2026. Создаём пространство для жизни.</span>
        </div>
      </footer>
    </main>
  );
}
