import { Routes, Route, Navigate } from 'react-router-dom';
import DriverApp from './DriverApp';
import OwnerApp  from './OwnerApp';

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<Navigate to="/driver" replace />} />
      <Route path="/driver"  element={<DriverApp />} />
      <Route path="/owner"   element={<OwnerApp />} />
    </Routes>
  );
}
