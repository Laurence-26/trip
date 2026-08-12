import React from 'react';
import { Truck, BarChart2, ArrowRight } from 'lucide-react';

const C = {
  bg: '#070A10', card: '#0B1018',
  border: 'rgba(255,255,255,0.07)',
  amber: '#F59E0B', amberSoft: 'rgba(245,158,11,0.14)',
  green: '#10B981', greenSoft: 'rgba(16,185,129,0.13)',
  text: '#D5DDE9', sub: '#64748B',
};

const GF = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');`;

export default function RoleSelect({ onSelect }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <style>{GF}</style>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={{ width: 76, height: 76, borderRadius: 24, background: C.amberSoft, border: `1.5px solid ${C.amber}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <Truck size={36} color={C.amber} />
        </div>
        <div style={{ fontFamily: 'Outfit, system-ui', fontSize: 36, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>TRIPS</div>
        <div style={{ color: C.sub, fontSize: 13, marginTop: 6, letterSpacing: '0.05em' }}>FLEET MANAGEMENT</div>
      </div>

      {/* Role cards */}
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Driver */}
        <button
          onClick={() => onSelect('driver')}
          style={{
            background: C.card, border: `1.5px solid ${C.amber}33`,
            borderRadius: 20, padding: '22px 20px',
            cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 18,
            fontFamily: 'Inter, system-ui',
          }}
        >
          <div style={{ width: 54, height: 54, borderRadius: 16, background: C.amberSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Truck size={28} color={C.amber} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Outfit, system-ui', fontSize: 19, fontWeight: 800, color: C.text }}>Driver</div>
            <div style={{ fontSize: 13, color: C.sub, marginTop: 3 }}>Log trips · Share location</div>
          </div>
          <ArrowRight size={18} color={C.amber} />
        </button>

        {/* Owner */}
        <button
          onClick={() => onSelect('owner')}
          style={{
            background: C.card, border: `1.5px solid ${C.green}33`,
            borderRadius: 20, padding: '22px 20px',
            cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 18,
            fontFamily: 'Inter, system-ui',
          }}
        >
          <div style={{ width: 54, height: 54, borderRadius: 16, background: C.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BarChart2 size={28} color={C.green} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Outfit, system-ui', fontSize: 19, fontWeight: 800, color: C.text }}>Owner / Manager</div>
            <div style={{ fontSize: 13, color: C.sub, marginTop: 3 }}>View reports · Manage fleet</div>
          </div>
          <ArrowRight size={18} color={C.green} />
        </button>
      </div>

      <div style={{ color: C.sub, fontSize: 11, marginTop: 40, letterSpacing: '0.04em' }}>
        Rock Eagle Tracker
      </div>
    </div>
  );
}
