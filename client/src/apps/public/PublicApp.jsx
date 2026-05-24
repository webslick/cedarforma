import { Routes, Route } from 'react-router-dom';
import './public.css';
import Home from '../../pages/public/Home';

export default function PublicApp() {
  return (
    <div className="cf-public-app">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}
