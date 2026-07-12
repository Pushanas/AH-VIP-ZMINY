import { Routes, Route } from 'react-router-dom';
import MainUserApp from './MainUserApp';
import AdminPanel from './AdminPanel';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainUserApp />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
}
