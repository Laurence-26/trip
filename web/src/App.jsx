import React, { useState, lazy, Suspense } from 'react';
import RoleSelect from './RoleSelect';

const DriverApp = lazy(() => import('./DriverApp'));
const OwnerApp  = lazy(() => import('./OwnerApp'));

const Blank = <div style={{ background: '#070A10', minHeight: '100vh' }} />;

export default function App() {
  const [role, setRole] = useState(() => localStorage.getItem('app_role'));

  const selectRole = r => { localStorage.setItem('app_role', r); setRole(r); };
  const switchRole = () => { localStorage.removeItem('app_role'); setRole(null); };

  if (!role) return <RoleSelect onSelect={selectRole} />;

  return (
    <Suspense fallback={Blank}>
      {role === 'driver'
        ? <DriverApp onRoleSwitch={switchRole} />
        : <OwnerApp  onRoleSwitch={switchRole} />
      }
    </Suspense>
  );
}
