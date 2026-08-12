import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Truck, Route, Fuel, Plus, WifiOff,
  LogOut, Hash, Clock, ArrowRight, Navigation,
} from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

const IS_NATIVE = Capacitor.isNativePlatform();

const SERVER_URL = 'https://trip-production-ac4c.up.railway.app';

const C = {
  bg:        '#070A10',
  card:      '#0B1018',
  card2:     '#111927',
  border:    'rgba(255,255,255,0.07)',
  amber:     '#F59E0B',
  amberSoft: 'rgba(245,158,11,0.14)',
  green:     '#10B981',
  greenSoft: 'rgba(16,185,129,0.13)',
  rose:      '#F43F5E',
  roseSoft:  'rgba(244,63,94,0.13)',
  text:      '#D5DDE9',
  sub:       '#64748B',
  muted:     '#243044',
};

const GF = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
  input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.45);cursor:pointer}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
  select option{background:#0B1018}
`;

const LANG = {
  en: {
    appName:'TRIPS', sub:'Driver App',
    yourName:"What's your name?", namePH:'Your full name', cont:'Continue',
    fleetTitle:'Fleet Code', fleetAsk:'Ask your owner for the code',
    fleetErr:'Should look like EAGLE-4829', joinFleet:'Join Fleet',
    tripTicket:'Trip Ticket', date:'Date', truckPlate:'Truck / Plate',
    client:'Client / Broker', clientPH:'Who booked this load',
    route:'Route', FROM:'FROM', fromPH:'Loading point',
    TO:'TO', toPH:'Delivery point', load:'Load / Cargo', loadPH:'e.g. 20t cement',
    numTrips:'No. of Trips', price:'Price (TZS)', payMethod:'Payment method', notes:'Notes (optional)',
    notesPH:'Anything worth flagging…', fillAll:'Fill in all required fields.',
    time:'Departure Time', arrTime:'Arrival Time', distKm:'Distance (km)', calcKm:'Auto', calculating:'…',
    fuelL:'Fuel Used (L)', fuelAuto:'Auto', fuelRate:'45 L/100 km (tap Auto)',
    gpsShare:'GPS', gpsOn:'Sharing location', gpsOff:'Location off',
    gpsDeny:'Location permission denied. Go to phone Settings → Apps → Trips → Permissions → Location → Allow.',
    gpsDenyWeb:'Location blocked. Tap the lock icon in your browser address bar → Site settings → Allow Location.',
    locTitle:'Share Your Location',
    locBody:'Your fleet owner needs to see where you are on the map. Location is only shared while GPS is turned on — you stay in control.',
    locAllow:'Allow Location',
    locLater:'Not Now',
    saving:'Saving…', saveTrip:'Save Trip',
    expSlip:'Expense Slip', amount:'Amount (TZS)', expType:'Expense type',
    descOpt:'Description (optional)', descPH:'e.g. diesel 50L at station', saveExp:'Save Expense',
    todayTrips:"Today's Trips", noTrips:'No trips logged yet.',
    syncWait:'Waiting to sync', todayExp:"Today's Expenses", noExp:'No expenses today.',
    income:'Income', expenses:'Expenses',
    trSing:'trip', trPlur:'trips', itSing:'item', itPlur:'items',
    navTrip:'LOG TRIP', navExp:'EXPENSE', navToday:'TODAY',
    live:'Live', offline:'Offline',
    cash:'Cash', mpesa:'Phone', bank:'Bank', loan:'Loan',
    fuel:'Fuel', repair:'Repair', fines:'Fines', other:'Other',
  },
  sw: {
    appName:'SAFARI', sub:'Programu ya Dereva',
    yourName:'Jina lako ni nani?', namePH:'Jina lako kamili', cont:'Endelea',
    fleetTitle:'Nambari ya Msafara', fleetAsk:'Uliza mmiliki wako nambari',
    fleetErr:'Inapaswa kuonekana kama EAGLE-4829', joinFleet:'Jiunge na Msafara',
    tripTicket:'Tiketi ya Safari', date:'Tarehe', truckPlate:'Lori / Nambari',
    client:'Mteja / Dalali', clientPH:'Aliyeagiza mzigo',
    route:'Njia', FROM:'KUTOKA', fromPH:'Mahali pa kupakia',
    TO:'HADI', toPH:'Mahali pa kutoa', load:'Mzigo / Shehena', loadPH:'mf. saruji 20t',
    numTrips:'Idadi ya Safari', price:'Bei (TZS)', payMethod:'Njia ya Malipo', notes:'Maelezo (si lazima)',
    notesPH:'Kitu chochote cha kuzingatia…', fillAll:'Jaza sehemu zote zinazohitajika.',
    time:'Wakati wa Kuondoka', arrTime:'Wakati wa Kufika', distKm:'Umbali (km)', calcKm:'Hesabu', calculating:'…',
    fuelL:'Mafuta Yaliyotumika (L)', fuelAuto:'Kiot', fuelRate:'45 L/100 km (bonyeza Kiot)',
    gpsShare:'GPS', gpsOn:'Unashiriki mahali', gpsOff:'Mahali imezimwa',
    gpsDeny:'Ruhusa ya mahali imekataliwa. Nenda Mipangilio → Programu → Trips → Ruhusa → Mahali → Ruhusu.',
    gpsDenyWeb:'Eneo limezuiwa. Bonyeza ikoni ya kufuli kwenye kivinjari → Mipangilio ya tovuti → Ruhusu Eneo.',
    locTitle:'Shiriki Mahali Pako',
    locBody:'Mmiliki wako anahitaji kuona uko wapi kwenye ramani. Mahali inashirikiwa tu wakati GPS imewezeshwa — wewe ndiye unayedhibiti.',
    locAllow:'Ruhusu Mahali',
    locLater:'Baadaye',
    saving:'Inahifadhi…', saveTrip:'Hifadhi Safari',
    expSlip:'Karatasi ya Gharama', amount:'Kiasi (TZS)', expType:'Aina ya Gharama',
    descOpt:'Maelezo (si lazima)', descPH:'mf. dizeli 50L stesheni', saveExp:'Hifadhi Gharama',
    todayTrips:'Safari za Leo', noTrips:'Hakuna safari zilizorekodiwa.',
    syncWait:'Inasubiri kusawazisha', todayExp:'Gharama za Leo', noExp:'Hakuna gharama leo.',
    income:'Mapato', expenses:'Gharama',
    trSing:'safari', trPlur:'safari', itSing:'kipande', itPlur:'vipande',
    navTrip:'SAFARI', navExp:'GHARAMA', navToday:'LEO',
    live:'Mtandaoni', offline:'Nje ya Mtandao',
    cash:'Taslimu', mpesa:'Simu', bank:'Benki', loan:'Mkopo',
    fuel:'Mafuta', repair:'Matengenezo', fines:'Faini', other:'Nyingine',
  },
};

// ── API ────────────────────────────────────────────────────────
const apiFetch = (path, opts = {}) =>
  fetch(`${SERVER_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });

const api = {
  addTrip:    d => apiFetch('/api/trips',    { method: 'POST', body: JSON.stringify(d) }),
  addExpense: d => apiFetch('/api/expenses', { method: 'POST', body: JSON.stringify(d) }),
  sync: (fleet, ts) => apiFetch(`/api/sync?fleet=${fleet}&since=${ts}`),
};

// ── Offline queue ──────────────────────────────────────────────
const qKey     = f => `rq_${f}`;
const enqueue  = (fleet, type, data) => {
  const q = JSON.parse(localStorage.getItem(qKey(fleet)) || '[]');
  localStorage.setItem(qKey(fleet), JSON.stringify([...q, { type, data }]));
};
const flushQueue = async fleet => {
  const key = qKey(fleet);
  const q   = JSON.parse(localStorage.getItem(key) || '[]');
  if (!q.length) return;
  const remaining = [];
  for (const item of q) {
    try { await (item.type === 'trip' ? api.addTrip(item.data) : api.addExpense(item.data)); }
    catch { remaining.push(item); }
  }
  localStorage.setItem(key, JSON.stringify(remaining));
};
const pendingCount = f => JSON.parse(localStorage.getItem(qKey(f)) || '[]').length;

// ── Utils ──────────────────────────────────────────────────────
const mergeById = (existing, incoming) => {
  const map = new Map(existing.map(r => [r.id, r]));
  incoming.forEach(r => map.set(r.id, { ...r, _pending: false }));
  return Array.from(map.values()).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
};
const uid    = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const today  = () => new Date().toISOString().slice(0, 10);
const fmt    = n  => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const isCode = c  => /^[A-Z]+-\d{3,6}$/i.test(c.trim());

const PAYMENT_VALS = ['Cash', 'Mobile Money', 'Bank Transfer', 'Loan'];
const PAY_KEYS     = ['cash', 'mpesa', 'bank', 'loan'];
const EXPENSE_VALS = ['Fuel', 'Maintenance', 'Traffic Fines', 'Other'];
const EXP_KEYS     = ['fuel', 'repair', 'fines', 'other'];

// ── Shared input style ─────────────────────────────────────────
const inp = (extra = {}) => ({
  width: '100%', boxSizing: 'border-box', padding: '11px 13px',
  background: C.card2, border: `1.5px solid ${C.border}`,
  borderRadius: 11, color: C.text, fontSize: 14,
  fontFamily: 'Inter, system-ui, sans-serif', outline: 'none',
  ...extra,
});

// ── Language toggle button ─────────────────────────────────────
function LangBtn({ lang, toggle }) {
  return (
    <button onClick={toggle} style={{
      background: 'transparent', border: `1px solid ${C.border}`,
      borderRadius: 6, padding: '4px 9px', color: C.sub,
      fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em',
    }}>
      {lang === 'en' ? 'SW' : 'EN'}
    </button>
  );
}

// ── Pills ──────────────────────────────────────────────────────
function Pills({ options, value, onChange, accent = C.amber }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} style={{
            padding: '7px 14px', borderRadius: 999,
            border:     `1.5px solid ${on ? accent : C.border}`,
            background: on ? accent + '22' : 'transparent',
            color:      on ? accent : C.sub,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Label wrapper ──────────────────────────────────────────────
function Fld({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

// ── Setup: Name ────────────────────────────────────────────────
function NameSetup({ onSave, i18n, lang, toggleLang }) {
  const [name, setName] = useState('');
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', position: 'relative' }}>
      <style>{GF}</style>
      <div style={{ position: 'absolute', top: 16, right: 16 }}><LangBtn lang={lang} toggle={toggleLang} /></div>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 70, height: 70, borderRadius: 22, background: C.amberSoft, border: `1px solid ${C.amber}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Truck size={30} color={C.amber} />
          </div>
          <div style={{ fontFamily: 'Outfit, system-ui', fontSize: 30, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>{i18n('appName')}</div>
          <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>{i18n('sub')}</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '26px 22px' }}>
          <div style={{ fontWeight: 600, color: C.text, fontSize: 16, marginBottom: 16 }}>{i18n('yourName')}</div>
          <input autoFocus style={inp({ marginBottom: 14, fontSize: 16 })} placeholder={i18n('namePH')}
            value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim())}
          />
          <button onClick={() => name.trim() && onSave(name.trim())} style={{
            width: '100%', background: `linear-gradient(135deg,${C.amber},#FCD34D)`,
            border: 'none', borderRadius: 13, padding: '13px',
            fontWeight: 700, fontSize: 15, color: '#07090F', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {i18n('cont')} <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Setup: Fleet code ──────────────────────────────────────────
function FleetSetup({ onSave, i18n, lang, toggleLang }) {
  const [code, setCode] = useState('');
  const [err, setErr]   = useState(false);
  const attempt = () => {
    const u = code.trim().toUpperCase();
    if (!isCode(u)) { setErr(true); return; }
    onSave(u);
  };
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', position: 'relative' }}>
      <style>{GF}</style>
      <div style={{ position: 'absolute', top: 16, right: 16 }}><LangBtn lang={lang} toggle={toggleLang} /></div>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 70, height: 70, borderRadius: 22, background: C.amberSoft, border: `1px solid ${C.amber}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Hash size={30} color={C.amber} />
          </div>
          <div style={{ fontFamily: 'Outfit, system-ui', fontSize: 30, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>{i18n('fleetTitle')}</div>
          <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>{i18n('fleetAsk')}</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '26px 22px' }}>
          <input autoFocus
            style={inp({ textAlign: 'center', fontSize: 22, letterSpacing: '0.15em', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', marginBottom: 8, ...(err ? { borderColor: C.rose } : {}) })}
            placeholder="EAGLE-4829" value={code}
            onChange={e => { setCode(e.target.value); setErr(false); }}
            onKeyDown={e => e.key === 'Enter' && attempt()}
          />
          {err && <div style={{ color: C.rose, fontSize: 12, textAlign: 'center', marginBottom: 10 }}>{i18n('fleetErr')}</div>}
          <button onClick={attempt} style={{
            width: '100%', background: `linear-gradient(135deg,${C.amber},#FCD34D)`,
            border: 'none', borderRadius: 13, padding: '13px',
            fontWeight: 700, fontSize: 15, color: '#07090F', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {i18n('joinFleet')} <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Trip form ──────────────────────────────────────────────────
function TripForm({ driverName, fleetCode, onSave, i18n }) {
  const payOpts = PAYMENT_VALS.map((v, i) => ({ value: v, label: i18n(PAY_KEYS[i]) }));
  const blank = { date: today(), truck_name: '', client: '', from: '', to: '', load: '', trips_count: '1', price: '', payment_method: 'Cash', notes: '', time: '', arrival_time: '', distance_km: '', fuel_liters: '' };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState(false);
  const [focus, setFocus]   = useState('');
  const [calcing, setCalcing] = useState(false);

  const autoFuel = () => {
    const km = Number(form.distance_km);
    if (!km) return;
    setForm(p => ({ ...p, fuel_liters: String(Math.round(km * 45 / 100)) }));
  };

  const calcDistance = async () => {
    if (!form.from || !form.to) return;
    setCalcing(true);
    try {
      const geo = async q => {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=en`);
        const d = await r.json();
        if (!d.length) throw new Error('not found');
        return [d[0].lon, d[0].lat];
      };
      const [f, t] = await Promise.all([geo(form.from), geo(form.to)]);
      const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${f[0]},${f[1]};${t[0]},${t[1]}?overview=false`);
      const d = await r.json();
      setForm(p => ({ ...p, distance_km: String(Math.round(d.routes[0].distance / 1000)) }));
    } catch {}
    finally { setCalcing(false); }
  };
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const fi = (k, extra = {}) => ({
    ...inp(extra),
    ...(focus === k ? { borderColor: C.amber, boxShadow: `0 0 0 3px ${C.amberSoft}` } : {}),
  });
  const fiGreen = k => ({
    ...inp({ padding: '9px 11px' }),
    ...(focus === k ? { borderColor: C.green, boxShadow: `0 0 0 3px ${C.greenSoft}` } : {}),
  });
  const fiRose = k => ({
    ...inp({ padding: '9px 11px' }),
    ...(focus === k ? { borderColor: C.rose, boxShadow: `0 0 0 3px ${C.roseSoft}` } : {}),
  });

  const submit = async () => {
    if (!form.truck_name || !form.client || !form.from || !form.to || !form.load || !form.price) {
      setErr(true); return;
    }
    setErr(false); setSaving(true);
    try {
      await onSave({ ...form, trips_count: Number(form.trips_count) || 1, price: Number(form.price), payment_status: form.payment_method === 'Loan' ? 'Pending' : 'Paid' });
      setForm({ ...blank, date: form.date, truck_name: form.truck_name });
    } finally { setSaving(false); }
  };

  return (
    <div style={{ padding: '16px 16px 96px' }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.amberSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Route size={17} color={C.amber} />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit, system-ui', fontSize: 17, fontWeight: 800, color: C.text }}>{i18n('tripTicket')}</div>
            <div style={{ fontSize: 12, color: C.sub }}>{driverName}</div>
          </div>
        </div>
        <div style={{ padding: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Fld label={i18n('date')}>
              <input type="date" style={fi('date')} value={form.date} onChange={set('date')} onFocus={() => setFocus('date')} onBlur={() => setFocus('')} />
            </Fld>
            <Fld label={i18n('truckPlate')}>
              <input style={fi('truck', { textTransform: 'uppercase' })} placeholder="T 123 ABC" value={form.truck_name} onChange={set('truck_name')} onFocus={() => setFocus('truck')} onBlur={() => setFocus('')} />
            </Fld>
          </div>
          <Fld label={i18n('client')}>
            <input style={fi('client')} placeholder={i18n('clientPH')} value={form.client} onChange={set('client')} onFocus={() => setFocus('client')} onBlur={() => setFocus('')} />
          </Fld>
          <Fld label={i18n('route')}>
            <div style={{ background: C.card2, borderRadius: 13, padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: '0.07em', marginBottom: 5 }}>{i18n('FROM')}</div>
                  <input style={fiGreen('from')} placeholder={i18n('fromPH')} value={form.from} onChange={set('from')} onFocus={() => setFocus('from')} onBlur={() => setFocus('')} />
                </div>
                <ArrowRight size={14} color={C.muted} style={{ marginTop: 20, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.rose, letterSpacing: '0.07em', marginBottom: 5 }}>{i18n('TO')}</div>
                  <input style={fiRose('to')} placeholder={i18n('toPH')} value={form.to} onChange={set('to')} onFocus={() => setFocus('to')} onBlur={() => setFocus('')} />
                </div>
              </div>
            </div>
          </Fld>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Fld label={i18n('time')}>
              <input type="time" style={fi('time')} value={form.time} onChange={set('time')} onFocus={() => setFocus('time')} onBlur={() => setFocus('')} />
            </Fld>
            <Fld label={i18n('arrTime')}>
              <input type="time" style={fi('arrival_time')} value={form.arrival_time} onChange={set('arrival_time')} onFocus={() => setFocus('arrival_time')} onBlur={() => setFocus('')} />
            </Fld>
            <Fld label={i18n('distKm')}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="number" style={{ ...fi('distance_km'), flex: 1 }} placeholder="0" value={form.distance_km} onChange={set('distance_km')} onFocus={() => setFocus('distance_km')} onBlur={() => setFocus('')} />
                <button type="button" onClick={calcDistance} disabled={calcing || !form.from || !form.to} style={{ background: calcing ? C.muted : C.amberSoft, border: `1px solid ${C.amber}33`, borderRadius: 10, padding: '0 9px', fontWeight: 700, fontSize: 11, color: calcing ? C.sub : C.amber, cursor: 'pointer', flexShrink: 0 }}>
                  {calcing ? i18n('calculating') : i18n('calcKm')}
                </button>
              </div>
            </Fld>
            <Fld label={i18n('fuelL')}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="number" style={{ ...fi('fuel_liters'), flex: 1 }} placeholder="0" value={form.fuel_liters} onChange={set('fuel_liters')} onFocus={() => setFocus('fuel_liters')} onBlur={() => setFocus('')} />
                <button type="button" onClick={autoFuel} disabled={!form.distance_km} style={{ background: form.distance_km ? C.amberSoft : C.muted, border: `1px solid ${C.amber}33`, borderRadius: 10, padding: '0 9px', fontWeight: 700, fontSize: 11, color: form.distance_km ? C.amber : C.sub, cursor: 'pointer', flexShrink: 0 }}>
                  {i18n('fuelAuto')}
                </button>
              </div>
            </Fld>
          </div>
          <Fld label={i18n('load')}>
            <input style={fi('load')} placeholder={i18n('loadPH')} value={form.load} onChange={set('load')} onFocus={() => setFocus('load')} onBlur={() => setFocus('')} />
          </Fld>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Fld label={i18n('numTrips')}>
              <input type="number" style={fi('trips_count')} placeholder="1" min="1" value={form.trips_count} onChange={set('trips_count')} onFocus={() => setFocus('trips_count')} onBlur={() => setFocus('')} />
            </Fld>
            <Fld label={i18n('price')}>
              <input type="number" style={fi('price')} placeholder="0" value={form.price} onChange={set('price')} onFocus={() => setFocus('price')} onBlur={() => setFocus('')} />
            </Fld>
          </div>
          <Fld label={i18n('payMethod')}>
            <Pills options={payOpts} value={form.payment_method} onChange={v => setForm(f => ({ ...f, payment_method: v }))} />
          </Fld>
          <Fld label={i18n('notes')}>
            <input style={fi('notes')} placeholder={i18n('notesPH')} value={form.notes} onChange={set('notes')} onFocus={() => setFocus('notes')} onBlur={() => setFocus('')} />
          </Fld>
          {err && (
            <div style={{ padding: '10px 13px', background: C.roseSoft, borderLeft: `3px solid ${C.rose}`, borderRadius: 9, marginBottom: 14, fontSize: 13, color: C.rose }}>
              {i18n('fillAll')}
            </div>
          )}
          <button onClick={submit} disabled={saving} style={{
            width: '100%', padding: '13px',
            background: saving ? C.muted : `linear-gradient(135deg,${C.amber},#FCD34D)`,
            border: 'none', borderRadius: 13, fontWeight: 700, fontSize: 15,
            color: saving ? C.sub : '#07090F', cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Plus size={17} /> {saving ? i18n('saving') : i18n('saveTrip')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Expense form ───────────────────────────────────────────────
function ExpenseForm({ driverName, onSave, i18n }) {
  const expOpts = EXPENSE_VALS.map((v, i) => ({ value: v, label: i18n(EXP_KEYS[i]) }));
  const blank = { date: today(), type: 'Fuel', amount: '', description: '' };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [focus, setFocus]   = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const fi  = (k, extra = {}) => ({
    ...inp(extra),
    ...(focus === k ? { borderColor: C.rose, boxShadow: `0 0 0 3px ${C.roseSoft}` } : {}),
  });

  const submit = async () => {
    if (!form.amount) return;
    setSaving(true);
    try {
      await onSave({ ...form, amount: Number(form.amount) });
      setForm({ ...blank, date: form.date });
    } finally { setSaving(false); }
  };

  return (
    <div style={{ padding: '16px 16px 96px' }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.roseSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Fuel size={17} color={C.rose} />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit, system-ui', fontSize: 17, fontWeight: 800, color: C.text }}>{i18n('expSlip')}</div>
            <div style={{ fontSize: 12, color: C.sub }}>{driverName}</div>
          </div>
        </div>
        <div style={{ padding: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Fld label={i18n('date')}>
              <input type="date" style={fi('date')} value={form.date} onChange={set('date')} onFocus={() => setFocus('date')} onBlur={() => setFocus('')} />
            </Fld>
            <Fld label={i18n('amount')}>
              <input type="number" style={fi('amount')} placeholder="0" value={form.amount} onChange={set('amount')} onFocus={() => setFocus('amount')} onBlur={() => setFocus('')} />
            </Fld>
          </div>
          <Fld label={i18n('expType')}>
            <Pills options={expOpts} value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} accent={C.rose} />
          </Fld>
          <Fld label={i18n('descOpt')}>
            <input style={fi('desc')} placeholder={i18n('descPH')} value={form.description} onChange={set('description')} onFocus={() => setFocus('desc')} onBlur={() => setFocus('')} />
          </Fld>
          <button onClick={submit} disabled={saving} style={{
            width: '100%', padding: '13px',
            background: saving ? C.muted : C.rose,
            border: 'none', borderRadius: 13, fontWeight: 700, fontSize: 15,
            color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Plus size={17} /> {saving ? i18n('saving') : i18n('saveExp')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Today log ──────────────────────────────────────────────────
function TodayLog({ trips, expenses, i18n }) {
  const todayDate = today();
  const tt   = trips.filter(x => x.date === todayDate);
  const te   = expenses.filter(x => x.date === todayDate);
  const inc  = tt.reduce((s, x) => s + Number(x.price  || 0), 0);
  const spent = te.reduce((s, x) => s + Number(x.amount || 0), 0);

  return (
    <div style={{ padding: '16px 16px 96px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
        {[
          { label: i18n('income'),   value: inc,   count: `${tt.length} ${tt.length !== 1 ? i18n('trPlur') : i18n('trSing')}`,  color: C.green, soft: C.greenSoft },
          { label: i18n('expenses'), value: spent, count: `${te.length} ${te.length !== 1 ? i18n('itPlur') : i18n('itSing')}`,  color: C.rose,  soft: C.roseSoft  },
        ].map(card => (
          <div key={card.label} style={{ background: card.soft, border: `1px solid ${card.color}22`, borderRadius: 16, padding: '14px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: card.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 21, fontWeight: 700, color: card.color }}>{fmt(card.value)}</div>
            <div style={{ fontSize: 11, color: card.color + '99', marginTop: 3 }}>{card.count}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{i18n('todayTrips')}</div>
        {tt.length === 0
          ? <div style={{ color: C.sub, fontSize: 13, fontStyle: 'italic', textAlign: 'center', padding: '24px 0' }}>{i18n('noTrips')}</div>
          : tt.map(trip => (
            <div key={trip.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 15, padding: '13px 15px', marginBottom: 9 }}>
              {trip._pending && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.amber, fontSize: 11, marginBottom: 7 }}>
                  <Clock size={11} /> {i18n('syncWait')}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{trip.client}</span>
                    {trip.truck_name && (
                      <span style={{ background: '#0F1F3D', color: '#60A5FA', fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{trip.truck_name}</span>
                    )}
                    {trip.trips_count > 1 && (
                      <span style={{ background: C.amberSoft, color: C.amber, fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>×{trip.trips_count}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, flexWrap: 'wrap' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                    <span style={{ color: C.text }}>{trip.from}</span>
                    <span style={{ color: C.sub, fontSize: 11 }}>→</span>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose, flexShrink: 0 }} />
                    <span style={{ color: C.text }}>{trip.to}</span>
                  </div>
                  {trip.load && <div style={{ fontSize: 11, color: C.sub, marginTop: 5 }}>{trip.load}</div>}
                  {(trip.time || trip.distance_km || trip.fuel_liters) && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 5, flexWrap: 'wrap' }}>
                      {trip.time        && <span style={{ fontSize: 11, color: C.sub, display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} /> {trip.time}</span>}
                      {trip.arrival_time && <span style={{ fontSize: 11, color: C.sub }}>→ {trip.arrival_time}</span>}
                      {trip.distance_km && <span style={{ fontSize: 11, color: C.sub }}>{trip.distance_km} km</span>}
                      {trip.fuel_liters && <span style={{ fontSize: 11, color: C.amber }}>{trip.fuel_liters} L</span>}
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 700, color: C.green, marginLeft: 12, whiteSpace: 'nowrap' }}>
                  {fmt(trip.price)}
                </div>
              </div>
            </div>
          ))
        }
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{i18n('todayExp')}</div>
        {te.length === 0
          ? <div style={{ color: C.sub, fontSize: 13, fontStyle: 'italic', textAlign: 'center', padding: '24px 0' }}>{i18n('noExp')}</div>
          : te.map(exp => (
            <div key={exp.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 15, padding: '13px 15px', marginBottom: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{exp.type}</div>
                {exp.description && <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>{exp.description}</div>}
                {exp._pending && <div style={{ fontSize: 11, color: C.amber, marginTop: 4 }}>⏳ {i18n('syncWait')}</div>}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: C.rose, fontSize: 15 }}>
                −{fmt(exp.amount)}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── Bottom nav ─────────────────────────────────────────────────
function BottomNav({ tab, setTab, badge, i18n }) {
  const TABS = [
    { id: 'trip',    Icon: Route, lk: 'navTrip'  },
    { id: 'expense', Icon: Fuel,  lk: 'navExp'   },
    { id: 'today',   Icon: Truck, lk: 'navToday' },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(7,10,16,0.96)', backdropFilter: 'blur(24px)',
      borderTop: `1px solid ${C.border}`, display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom,0px)',
    }}>
      {TABS.map(({ id, Icon, lk }) => {
        const on = id === tab;
        return (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '11px 0', position: 'relative',
          }}>
            <Icon size={22} color={on ? C.amber : C.sub} strokeWidth={on ? 2.2 : 1.5} />
            <span style={{ fontSize: 9, fontWeight: 700, color: on ? C.amber : C.sub, letterSpacing: '0.05em' }}>{i18n(lk)}</span>
            {id === 'today' && badge > 0 && (
              <span style={{ position: 'absolute', top: 7, left: '54%', background: C.amber, color: '#07090F', fontSize: 9, fontWeight: 800, minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function DriverApp({ onRoleSwitch }) {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const i18n = key => (LANG[lang] || LANG.en)[key] || key;
  const toggleLang = () => {
    const nl = lang === 'en' ? 'sw' : 'en';
    localStorage.setItem('app_lang', nl);
    setLang(nl);
  };

  const [driverName, setDriverName] = useState(() => localStorage.getItem('driver_name') || '');
  const [fleetCode,  setFleetCode]  = useState(() => localStorage.getItem('driver_fleet_code') || '');
  const [tab, setTab]       = useState('trip');
  const [trips, setTrips]   = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);
  const syncRef = useRef(0);
  const [gpsActive, setGpsActive] = useState(() => localStorage.getItem('gps_sharing') === 'true');
  const [gpsDenied, setGpsDenied] = useState(false);
  const [showLocRationale, setShowLocRationale] = useState(false);
  const gpsIntervalRef = useRef(null);

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Validate stored GPS permission on startup — revoked in Settings must reset state
  useEffect(() => {
    if (!gpsActive) return;
    Geolocation.checkPermissions().then(s => {
      if ((s.location || s.coarseLocation) !== 'granted') {
        localStorage.setItem('gps_sharing', 'false');
        setGpsActive(false);
      }
    }).catch(() => {
      localStorage.setItem('gps_sharing', 'false');
      setGpsActive(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = useCallback(async () => {
    if (!fleetCode || !driverName) return;
    try {
      await flushQueue(fleetCode);
      const { trips: nt, expenses: ne, server_time } = await api.sync(fleetCode, syncRef.current);
      if (nt.length) setTrips(p => mergeById(p, nt.filter(r => r.driver === driverName)));
      if (ne.length) setExpenses(p => mergeById(p, ne.filter(r => r.driver === driverName)));
      syncRef.current = server_time || Date.now();
    } catch {}
    setPending(pendingCount(fleetCode));
  }, [fleetCode, driverName]);

  useEffect(() => {
    if (!fleetCode || !driverName) return;
    sync();
    const id = setInterval(sync, 10000);
    return () => clearInterval(id);
  }, [sync, online]);

  const sendLocation = useCallback(async () => {
    if (!driverName || !fleetCode) return;
    let pos;
    try {
      pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
    } catch {
      try {
        pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
      } catch {
        // After any position failure, check if permission was revoked
        try {
          const s = await Geolocation.checkPermissions();
          if ((s.location || s.coarseLocation) === 'denied') {
            localStorage.setItem('gps_sharing', 'false');
            setGpsActive(false);
            setGpsDenied(true);
          }
        } catch {}
        return;
      }
    }
    try {
      await fetch(`${SERVER_URL}/api/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver: driverName, fleet_code: fleetCode,
          truck: localStorage.getItem('last_truck') || '',
          lat: pos.coords.latitude, lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed || 0,
          updated_at: Date.now(),
        }),
      });
    } catch {}
  }, [driverName, fleetCode]);

  useEffect(() => {
    if (gpsIntervalRef.current) { clearInterval(gpsIntervalRef.current); gpsIntervalRef.current = null; }
    if (!gpsActive) return;
    sendLocation();
    gpsIntervalRef.current = setInterval(sendLocation, 30000);
    return () => clearInterval(gpsIntervalRef.current);
  }, [gpsActive, sendLocation]);

  const toggleGps = async () => {
    if (gpsActive) {
      localStorage.setItem('gps_sharing', 'false');
      setGpsActive(false);
      return;
    }
    try {
      const status = await Geolocation.checkPermissions();
      const state = status.location || status.coarseLocation;
      if (state === 'granted') {
        localStorage.setItem('gps_sharing', 'true');
        setGpsActive(true);
      } else if (state === 'denied') {
        // Permanently denied — must go to Settings
        setGpsDenied(true);
      } else {
        // 'prompt' or 'prompt-with-rationale' — show rationale then request
        setShowLocRationale(true);
      }
    } catch {
      setShowLocRationale(true);
    }
  };

  const confirmLocationAllow = async () => {
    setShowLocRationale(false);
    if (IS_NATIVE) {
      // Android: requestPermissions() shows the system dialog
      try {
        const perm = await Geolocation.requestPermissions();
        const state = perm.location || perm.coarseLocation;
        if (state === 'granted') {
          localStorage.setItem('gps_sharing', 'true');
          setGpsActive(true);
        } else {
          setGpsDenied(true);
        }
      } catch { setGpsDenied(true); }
    } else {
      // Browser: requestPermissions() is a no-op; calling getCurrentPosition triggers the dialog
      try {
        await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 10000 });
        localStorage.setItem('gps_sharing', 'true');
        setGpsActive(true);
      } catch (e) {
        if (e?.code === 1 /* PERMISSION_DENIED */) {
          setGpsDenied(true);
        } else {
          // Timeout/unavailable but permission may be granted — verify and proceed
          try {
            const s = await Geolocation.checkPermissions();
            if ((s.location || s.coarseLocation) === 'granted') {
              localStorage.setItem('gps_sharing', 'true');
              setGpsActive(true);
            } else { setGpsDenied(true); }
          } catch { setGpsDenied(true); }
        }
      }
    }
  };

  const saveTrip = async trip => {
    if (trip.truck_name) localStorage.setItem('last_truck', trip.truck_name);
    const r = { ...trip, id: uid(), fleet_code: fleetCode, driver: driverName, created_at: Date.now() };
    setTrips(p => [{ ...r, _pending: true }, ...p]);
    try { await api.addTrip(r); setTrips(p => p.map(x => x.id === r.id ? { ...x, _pending: false } : x)); }
    catch { enqueue(fleetCode, 'trip', r); }
    setPending(pendingCount(fleetCode));
  };

  const saveExpense = async exp => {
    const r = { ...exp, id: uid(), fleet_code: fleetCode, driver: driverName, created_at: Date.now() };
    setExpenses(p => [{ ...r, _pending: true }, ...p]);
    try { await api.addExpense(r); setExpenses(p => p.map(x => x.id === r.id ? { ...x, _pending: false } : x)); }
    catch { enqueue(fleetCode, 'expense', r); }
    setPending(pendingCount(fleetCode));
  };

  if (!driverName) return <NameSetup  onSave={n => { localStorage.setItem('driver_name', n); setDriverName(n); }} i18n={i18n} lang={lang} toggleLang={toggleLang} />;
  if (!fleetCode)  return <FleetSetup onSave={c => { localStorage.setItem('driver_fleet_code', c); setFleetCode(c); }} i18n={i18n} lang={lang} toggleLang={toggleLang} />;

  const todayCount = trips.filter(x => x.date === today()).length;

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <style>{GF}</style>

      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(7,10,16,0.95)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}`, padding: '11px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Truck size={20} color={C.amber} />
          <span style={{ fontFamily: 'Outfit, system-ui', fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.3px' }}>{i18n('appName')}</span>
          <span style={{ color: C.sub, fontSize: 12 }}>· {driverName}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <LangBtn lang={lang} toggle={toggleLang} />
            <button onClick={toggleGps} title={gpsActive ? i18n('gpsOn') : i18n('gpsOff')} style={{ background: gpsActive ? 'rgba(16,185,129,0.15)' : 'transparent', border: `1px solid ${gpsActive ? C.green : C.border}`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: gpsActive ? C.green : C.sub }}>
              <Navigation size={12} strokeWidth={gpsActive ? 2.5 : 1.5} />
              {gpsActive && <span style={{ fontSize: 10, fontWeight: 700 }}>GPS</span>}
            </button>
            {!online
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.rose,  fontSize: 12 }}><WifiOff size={12} /> {i18n('offline')}</span>
              : pending > 0
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.amber, fontSize: 12 }}><Clock size={12} /> {pending}</span>
                : <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.green, fontSize: 12 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
                    {i18n('live')}
                  </span>
            }
            <button
              onClick={() => { localStorage.removeItem('driver_name'); localStorage.removeItem('driver_fleet_code'); setDriverName(''); setFleetCode(''); onRoleSwitch?.(); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.sub, display: 'flex', alignItems: 'center' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
        {gpsDenied && (
          <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(244,63,94,0.15)', border: `1px solid ${C.rose}44`, borderRadius: 10, fontSize: 12, color: C.rose, lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ flex: 1 }}>{IS_NATIVE ? i18n('gpsDeny') : i18n('gpsDenyWeb')}</span>
            <button onClick={() => setGpsDenied(false)} style={{ background: 'none', border: 'none', color: C.rose, cursor: 'pointer', padding: 0, fontSize: 18, lineHeight: 1, flexShrink: 0, opacity: 0.7 }}>×</button>
          </div>
        )}
      </div>

      {tab === 'trip'    && <TripForm    driverName={driverName} fleetCode={fleetCode} onSave={saveTrip}    i18n={i18n} />}
      {tab === 'expense' && <ExpenseForm driverName={driverName}                       onSave={saveExpense} i18n={i18n} />}
      {tab === 'today'   && <TodayLog    trips={trips} expenses={expenses}                                  i18n={i18n} />}

      <BottomNav tab={tab} setTab={setTab} badge={todayCount} i18n={i18n} />

      {showLocRationale && (
        <div
          onClick={e => e.target === e.currentTarget && setShowLocRationale(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'flex-end' }}
        >
          <div style={{ width: '100%', background: C.card, borderRadius: '22px 22px 0 0', padding: '20px 20px 44px', boxSizing: 'border-box' }}>
            <div
              onClick={() => setShowLocRationale(false)}
              style={{ width: 36, height: 4, background: C.muted, borderRadius: 999, margin: '0 auto 24px', cursor: 'pointer' }}
            />
            <div style={{ width: 64, height: 64, borderRadius: 20, background: C.greenSoft, border: `1.5px solid ${C.green}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <Navigation size={30} color={C.green} />
            </div>
            <div style={{ fontFamily: 'Outfit,system-ui', fontSize: 20, fontWeight: 800, color: C.text, textAlign: 'center', marginBottom: 12 }}>
              {i18n('locTitle')}
            </div>
            <div style={{ fontSize: 14, color: C.sub, textAlign: 'center', lineHeight: 1.65, marginBottom: 30, maxWidth: 320, margin: '0 auto 30px' }}>
              {i18n('locBody')}
            </div>
            <button
              onClick={confirmLocationAllow}
              style={{ width: '100%', padding: '15px', background: `linear-gradient(135deg,${C.green},#34D399)`, border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, color: '#07090F', cursor: 'pointer', marginBottom: 12 }}
            >
              {i18n('locAllow')}
            </button>
            <button
              onClick={() => setShowLocRationale(false)}
              style={{ width: '100%', padding: '13px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 12, fontWeight: 600, color: C.sub, fontSize: 14, cursor: 'pointer' }}
            >
              {i18n('locLater')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
