import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Truck, Route, Fuel, FileSpreadsheet, Trash2,
  Users, TrendingUp, TrendingDown, WifiOff,
  Lock, Copy, Check, RefreshCw, BarChart2, ArrowRight,
  Settings, Wallet, MapPin,
} from 'lucide-react';

// ── Config ─────────────────────────────────────────────────────
const SERVER_URL = 'https://trip-production-ac4c.up.railway.app';

// ── Design tokens ──────────────────────────────────────────────
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
  blue:      '#3B82F6',
  text:      '#D5DDE9',
  sub:       '#64748B',
  muted:     '#243044',
};

const GF = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
  input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.45);cursor:pointer}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
  select option{background:#0B1018}
  @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
`;

// ── Translations ────────────────────────────────────────────────
const LANG = {
  en: {
    appName:'TRIPS', ownerLabel:'Owner',
    enterPin:'Enter owner PIN', wrongPin:'Wrong PIN. Try again.', unlock:'Unlock',
    fleetCode:'Fleet Code', shareCode:'Share this code with your drivers',
    copy:'Copy', copied:'Copied',
    resetCodeQ:'Generate a new fleet code? Drivers will need to re-enter it.',
    income:'Income', expenses:'Expenses', net:'Net',
    trSing:'trip', trPlur:'trips', drvSing:'driver', drvPlur:'drivers',
    profit:'Profit', loss:'Loss', pendingLoan:'Pending (Loan)',
    byDriver:'By Driver', byTruck:'By Truck',
    allDrivers:'All Drivers', allTrucks:'All Trucks',
    export:'Export', lock:'Lock', loading:'Loading…',
    noTrips:'No trips for this period.', noExp:'No expenses for this period.',
    noLoans:'No loans for this period.',
    deleteQ:'Delete this record?', deleteLbl:'Delete',
    report:'REPORT', tripsNav:'TRIPS', expensesNav:'EXPENSES', loansNav:'LOANS',
    byPayment:'By Payment Method',
    cash:'Cash', mpesa:'Phone', bank:'Bank', loan:'Loan',
    markPaid:'Mark Paid', outstanding:'Outstanding', paid:'Paid',
    loanSummary:'Loan Summary',
    fuelUsed:'Fuel Used', totalFuel:'Total Fuel', liters:'L', avgFuel:'Avg / Trip',
    mapNav:'MAP', noDriversOnline:'No drivers sharing location right now.', justNow:'just now', minAgo:'min ago', driverMap:'Live Driver Map', mapSearch:'Search driver or truck…',
    live:'Live', offline:'Offline',
    today:'Today', week:'7 Days', month:'Month', all:'All',
    settings:'Settings', language:'Language',
    pinLock:'PIN Lock', reqPin:'Require PIN to open', pinLockDesc:'Protect the Owner dashboard',
    changePin:'Change PIN', currentPin:'Current PIN', newPin:'New PIN', confirmPin:'Confirm New PIN',
    wrongCurPin:'Wrong current PIN', pinTooShort:'PIN must be at least 4 digits',
    pinMismatch:"PINs don't match", pinChanged:'PIN changed!', savePin:'Save PIN',
    close:'Close',
  },
  sw: {
    appName:'SAFARI', ownerLabel:'Mmiliki',
    enterPin:'Weka PIN ya mmiliki', wrongPin:'PIN si sahihi. Jaribu tena.', unlock:'Fungua',
    fleetCode:'Nambari ya Msafara', shareCode:'Shiriki nambari hii na madereva wako',
    copy:'Nakili', copied:'Imenakiliwa',
    resetCodeQ:'Tengeneza nambari mpya ya msafara? Madereva watahitaji kuiingiza tena.',
    income:'Mapato', expenses:'Gharama', net:'Jumla',
    trSing:'safari', trPlur:'safari', drvSing:'dereva', drvPlur:'madereva',
    profit:'Faida', loss:'Hasara', pendingLoan:'Inasubiri (Mkopo)',
    byDriver:'Kwa Dereva', byTruck:'Kwa Lori',
    allDrivers:'Madereva Wote', allTrucks:'Malori Yote',
    export:'Hamisha', lock:'Funga', loading:'Inapakia…',
    noTrips:'Hakuna safari kwa kipindi hiki.', noExp:'Hakuna gharama kwa kipindi hiki.',
    noLoans:'Hakuna mikopo kwa kipindi hiki.',
    deleteQ:'Futa rekodi hii?', deleteLbl:'Futa',
    report:'RIPOTI', tripsNav:'SAFARI', expensesNav:'GHARAMA', loansNav:'MIKOPO',
    byPayment:'Kwa Njia ya Malipo',
    cash:'Taslimu', mpesa:'Simu', bank:'Benki', loan:'Mkopo',
    markPaid:'Weka Imelipwa', outstanding:'Inadaiwa', paid:'Imelipwa',
    loanSummary:'Muhtasari wa Mikopo',
    fuelUsed:'Mafuta Yaliyotumika', totalFuel:'Jumla ya Mafuta', liters:'L', avgFuel:'Wastani / Safari',
    mapNav:'RAMANI', noDriversOnline:'Hakuna madereva wanaoshiriki mahali sasa.', justNow:'sasa hivi', minAgo:'dak iliyopita', driverMap:'Ramani ya Madereva', mapSearch:'Tafuta dereva au lori…',
    live:'Mtandaoni', offline:'Nje ya Mtandao',
    today:'Leo', week:'Siku 7', month:'Mwezi', all:'Zote',
    settings:'Mipangilio', language:'Lugha',
    pinLock:'Kufuli cha PIN', reqPin:'Hitaji PIN kufungua', pinLockDesc:'Linda dashibodi ya mmiliki',
    changePin:'Badilisha PIN', currentPin:'PIN ya sasa', newPin:'PIN mpya', confirmPin:'Thibitisha PIN mpya',
    wrongCurPin:'PIN ya sasa si sahihi', pinTooShort:'PIN lazima iwe tarakimu 4 au zaidi',
    pinMismatch:'PIN hazilingani', pinChanged:'PIN imebadilishwa!', savePin:'Hifadhi PIN',
    close:'Funga',
  },
};

// ── API ────────────────────────────────────────────────────────
const apiFetch = (path, opts = {}) =>
  fetch(`${SERVER_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });

const api = {
  trips:             fleet   => apiFetch(`/api/trips?fleet=${fleet}`),
  expenses:          fleet   => apiFetch(`/api/expenses?fleet=${fleet}`),
  sync:              (f, ts) => apiFetch(`/api/sync?fleet=${f}&since=${ts}`),
  deleteTrip:        id      => apiFetch(`/api/trips/${id}`,    { method: 'DELETE' }),
  deleteExpense:     id      => apiFetch(`/api/expenses/${id}`, { method: 'DELETE' }),
  patchTripStatus:   (id, status) => apiFetch(`/api/trips/${id}`, { method: 'PATCH', body: JSON.stringify({ payment_status: status }) }),
  locations:         fleet        => apiFetch(`/api/locations?fleet=${fleet}`),
};

// ── Helpers ────────────────────────────────────────────────────
const WORDS   = ['EAGLE','ROCK','ROAD','CARGO','HAUL','FLEET','SWIFT','APEX','PRIDE','SAFARI'];
const genCode = () => `${WORDS[Math.floor(Math.random() * WORDS.length)]}-${Math.floor(1000 + Math.random() * 9000)}`;
const mergeById = (existing, incoming) => {
  const map = new Map(existing.map(r => [r.id, r]));
  incoming.forEach(r => map.set(r.id, r));
  return Array.from(map.values()).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
};
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmt      = n => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

const PAY_COLORS = {
  Cash:            { bg: 'rgba(16,185,129,0.15)',  fg: '#10B981' },
  'Mobile Money':  { bg: 'rgba(59,130,246,0.15)',  fg: '#60A5FA' },
  'Bank Transfer': { bg: 'rgba(245,158,11,0.15)',  fg: '#F59E0B' },
  Loan:            { bg: 'rgba(244,63,94,0.15)',   fg: '#F43F5E' },
};

// ── Date range hook ────────────────────────────────────────────
function useDateRange(range) {
  return useMemo(() => {
    const now = new Date();
    if (range === 'today') { const d = todayStr(); return { from: d, to: d }; }
    if (range === 'week')  { const d = new Date(now); d.setDate(d.getDate() - 7); return { from: d.toISOString().slice(0, 10), to: todayStr() }; }
    if (range === 'month') { return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10), to: todayStr() }; }
    return { from: '0000-01-01', to: '9999-12-31' };
  }, [range]);
}

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

// ── Segment pills ──────────────────────────────────────────────
function SegPills({ options, value, onChange, accent = C.amber }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} style={{
            padding: '6px 12px', borderRadius: 999,
            border:     `1.5px solid ${on ? accent : C.border}`,
            background: on ? accent + '22' : 'transparent',
            color:      on ? accent : C.sub,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── PIN screen ─────────────────────────────────────────────────
function PINScreen({ pin, onUnlock, i18n }) {
  const [entered, setEntered] = useState('');
  const [err, setErr]         = useState(false);
  const [shake, setShake]     = useState(false);

  const attempt = () => {
    if (entered === pin) { onUnlock(); return; }
    setErr(true); setShake(true); setEntered('');
    setTimeout(() => { setErr(false); setShake(false); }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
      <style>{GF}</style>
      <div style={{ width: '100%', maxWidth: 340 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: C.amberSoft, border: `1px solid ${C.amber}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Truck size={30} color={C.amber} />
          </div>
          <div style={{ fontFamily: 'Outfit, system-ui', fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: '-0.4px' }}>{i18n('appName')}</div>
          <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>{i18n('ownerLabel')}</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${shake ? C.rose : C.border}`, borderRadius: 20, padding: '28px 24px', transition: 'border-color 0.2s', animation: shake ? 'shake 0.35s ease' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 16 }}>
            <Lock size={14} color={C.amber} /> {i18n('enterPin')}
          </div>
          <input autoFocus type="password" inputMode="numeric" maxLength={8}
            style={{ width: '100%', boxSizing: 'border-box', padding: '14px', background: C.card2, border: `1.5px solid ${err ? C.rose : C.border}`, borderRadius: 12, color: C.text, fontSize: 26, textAlign: 'center', letterSpacing: '0.35em', outline: 'none', marginBottom: 10, fontFamily: 'JetBrains Mono, monospace', transition: 'border-color 0.2s' }}
            placeholder="····" value={entered}
            onChange={e => setEntered(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && attempt()}
          />
          {err && <div style={{ color: C.rose, fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{i18n('wrongPin')}</div>}
          <button onClick={attempt} style={{ width: '100%', padding: '13px', background: `linear-gradient(135deg,${C.amber},#FCD34D)`, border: 'none', borderRadius: 13, fontWeight: 700, fontSize: 15, color: '#07090F', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {i18n('unlock')} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Fleet code banner ──────────────────────────────────────────
function FleetBanner({ code, onReset, i18n }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <div style={{ background: C.card2, border: `1px solid ${C.amber}22`, borderRadius: 16, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{i18n('fleetCode')}</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: C.amber, letterSpacing: '0.08em' }}>{code}</div>
        <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>{i18n('shareCode')}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 6, background: copied ? C.greenSoft : C.amberSoft, border: `1px solid ${copied ? C.green : C.amber}44`, borderRadius: 9, padding: '8px 12px', fontWeight: 700, fontSize: 12, color: copied ? C.green : C.amber, cursor: 'pointer' }}>
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? i18n('copied') : i18n('copy')}
        </button>
        <button onClick={() => window.confirm(i18n('resetCodeQ')) && onReset()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 9, padding: '8px', cursor: 'pointer' }}>
          <RefreshCw size={14} color={C.sub} />
        </button>
      </div>
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color, soft }) {
  return (
    <div style={{ background: soft || C.card, border: `1px solid ${color}22`, borderRadius: 16, padding: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color: color || C.text }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ── Report tab ─────────────────────────────────────────────────
function ReportTab({ trips, expenses, driverFilter, truckFilter, range, setRange, i18n }) {
  const { from, to } = useDateRange(range);
  const rangeOpts = [
    { value: 'today', label: i18n('today') },
    { value: 'week',  label: i18n('week')  },
    { value: 'month', label: i18n('month') },
    { value: 'all',   label: i18n('all')   },
  ];

  const fTrips = useMemo(() => trips.filter(t =>
    t.date >= from && t.date <= to &&
    (driverFilter === 'all' || t.driver     === driverFilter) &&
    (truckFilter  === 'all' || t.truck_name === truckFilter)
  ), [trips, from, to, driverFilter, truckFilter]);

  const fExp = useMemo(() => expenses.filter(e =>
    e.date >= from && e.date <= to &&
    (driverFilter === 'all' || e.driver === driverFilter)
  ), [expenses, from, to, driverFilter]);

  const income     = fTrips.reduce((s, r) => s + Number(r.price       || 0), 0);
  const expense    = fExp.reduce((s, r)   => s + Number(r.amount      || 0), 0);
  const net        = income - expense;
  const pending    = fTrips.filter(r => r.payment_status === 'Pending').reduce((s, r) => s + Number(r.price || 0), 0);
  const totalFuel  = fTrips.reduce((s, r) => s + Number(r.fuel_liters || 0), 0);
  const tripsWithFuel = fTrips.filter(r => Number(r.fuel_liters) > 0);
  const avgFuel    = tripsWithFuel.length ? Math.round(totalFuel / tripsWithFuel.length) : 0;

  const group = (arr, key, valKey) => {
    const map = {};
    arr.forEach(r => {
      const k = r[key] || 'Unknown';
      if (!map[k]) map[k] = { key: k, trips: 0, revenue: 0 };
      map[k].trips++;
      map[k].revenue += Number(r[valKey] || 0);
    });
    return Object.values(map).sort((a, b) => b.trips - a.trips);
  };

  const byDriver = useMemo(() => group(fTrips, 'driver',     'price'), [fTrips]);
  const byTruck  = useMemo(() => group(fTrips, 'truck_name', 'price'), [fTrips]);
  const maxTrips = byDriver.length ? byDriver[0].trips : 1;

  const exportExcel = async () => {
    const { default: ExcelJS } = await import('exceljs');
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Truck Trip Tracker';
    wb.created = new Date();

    // Sort trips by date
    const sorted = [...fTrips].sort((a, b) => a.date.localeCompare(b.date));

    // ── Dynamic color pools ──────────────────────────────────────
    const BROKER_BG = ['FFFFF2CC','FFE2EFDA','FFDEEAF1','FFFCE4EC','FFEDE7F6'];
    const BROKER_FG = ['FF7F6000','FF375623','FF1F3864','FF880E4F','FF4527A0'];
    const TRUCK_BG  = ['FF4472C4','FF2E4057','FF1A8A9A','FF7030A0','FFFE5000'];

    const brkMap = {}, trkMap = {};
    let brkCt = 0, trkCt = 0;
    sorted.forEach(t => {
      if (t.client     && brkMap[t.client]     == null) brkMap[t.client]     = brkCt++;
      if (t.truck_name && trkMap[t.truck_name] == null) trkMap[t.truck_name] = trkCt++;
    });
    const bgOfBroker = b => BROKER_BG[(brkMap[b] ?? 0) % BROKER_BG.length];
    const fgOfBroker = b => BROKER_FG[(brkMap[b] ?? 0) % BROKER_FG.length];
    const bgOfTruck  = t => TRUCK_BG[(trkMap[t] ?? 0) % TRUCK_BG.length];

    // ── ISO week key (Mon–Sun) ───────────────────────────────────
    const isoWeek = ds => {
      const d = new Date(ds + 'T00:00:00');
      d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
      const w1 = new Date(d.getFullYear(), 0, 4);
      return `${d.getFullYear()}-W${String(1 + Math.round(((d - w1) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7)).padStart(2,'0')}`;
    };

    // Assign per-week trip number
    const weekCt = {};
    const rows = sorted.map(t => {
      const wk = isoWeek(t.date);
      weekCt[wk] = (weekCt[wk] || 0) + 1;
      return { ...t, _wk: wk, _tn: weekCt[wk] };
    });

    // ── Shared cell-styling helpers ──────────────────────────────
    const fill = argb => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
    const thinBorder = argb => ({ style: 'thin', color: { argb } });
    const medBorder  = argb => ({ style: 'medium', color: { argb } });
    const fullBorder = (t, l = 'FFC8C8C8') => ({
      top: t, bottom: thinBorder(l), left: thinBorder(l), right: thinBorder(l),
    });

    // ════════════════════════════════════════════════════════════
    // Trips sheet
    // ════════════════════════════════════════════════════════════
    const ws = wb.addWorksheet('Trips', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }],
      pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
    });

    ws.columns = [
      { header: 'DATE',            key: 'date',   width: 22 },
      { header: 'DRIVER',          key: 'driver', width: 13 },
      { header: 'TRUCK NO.',       key: 'truck',  width: 14 },
      { header: 'BROKER / CLIENT', key: 'client', width: 20 },
      { header: 'FROM',            key: 'from',   width: 18 },
      { header: 'TO',              key: 'to',     width: 18 },
      { header: 'LOAD / CARGO',    key: 'load',   width: 16 },
      { header: 'NO. TRIPS',       key: 'ntrips', width: 9  },
      { header: 'PRICE (TZS)',     key: 'price',  width: 15 },
      { header: 'PAY METHOD',      key: 'pay',    width: 13 },
      { header: 'DIST (km)',       key: 'dist',   width: 10 },
      { header: 'FUEL (L)',        key: 'fuel',   width: 9  },
      { header: 'NOTES',           key: 'notes',  width: 22 },
      { header: 'TRIP #',          key: 'tn',     width: 8  },
      { header: 'PMT STATUS',      key: 'pmt',    width: 14 },
      { header: 'TOTAL',           key: 'total',  width: 15 },
      { header: 'LOAN',            key: 'loan',   width: 15 },
    ];

    // Header row
    const hdr = ws.getRow(1);
    hdr.height = 32;
    hdr.eachCell((cell, col) => {
      const isBlue = col === 11 || col === 12;
      const isDark = col === 14;
      const isLoan = col === 17;
      cell.fill = fill(isBlue ? 'FF2E75B6' : isDark ? 'FF1B2631' : isLoan ? 'FFC00000' : 'FFFFD966');
      cell.font = { name: 'Calibri', bold: true, size: 10, color: { argb: isBlue || isDark || isLoan ? 'FFFFFFFF' : 'FF000000' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      const edge = isBlue ? 'FF1D5A8A' : isDark ? 'FF0A1520' : isLoan ? 'FF8B0000' : 'FFB8A840';
      cell.border = { top: medBorder(edge), bottom: medBorder(edge), left: thinBorder('FFC8C8C8'), right: thinBorder('FFC8C8C8') };
    });

    // Data rows
    let prevWk = null;
    rows.forEach((t, i) => {
      const newWk    = i > 0 && t._wk !== prevWk;
      prevWk = t._wk;
      const isPaid   = t.payment_status === 'Paid';
      const hasPrice = Number(t.price) > 0;
      const fuelVal  = Number(t.fuel_liters) || 0;
      const distVal  = Number(t.distance_km) || 0;
      const bgA      = bgOfBroker(t.client);

      const row = ws.addRow({
        date:   t.date,
        driver: t.driver || '',
        truck:  t.truck_name || '',
        client: t.client || '',
        from:   t.from || '',
        to:     t.to || '',
        load:   t.load || '',
        ntrips: 1,
        price:  Number(t.price) || 0,
        pay:    t.payment_method || '',
        dist:   distVal || '',
        fuel:   fuelVal || '',
        notes:  t.notes || '',
        tn:     t._tn,
        pmt:    t.payment_status || '',
        total:  Number(t.price) || 0,
        loan:   t.payment_method === 'Loan' ? Number(t.price) || 0 : '',
      });
      row.height = 18;

      const topBorder = newWk ? medBorder('FF2E75B6') : thinBorder('FFC8C8C8');

      row.eachCell({ includeEmpty: true }, (cell, col) => {
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = fullBorder(topBorder);
        cell.alignment = { vertical: 'middle' };

        // Default: broker row color
        if (![3,12,14,16,17].includes(col)) {
          cell.fill = fill(bgA);
        }

        // Col 3 — Truck: vibrant solid color
        if (col === 3 && t.truck_name) {
          cell.fill = fill(bgOfTruck(t.truck_name));
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (col === 3 && !t.truck_name) cell.fill = fill(bgA);

        // Col 4 — Broker name: colored bold text
        if (col === 4) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: fgOfBroker(t.client) } };
        }

        // Col 9 — Price
        if (col === 9) { cell.numFmt = '#,##0'; cell.alignment = { horizontal: 'right', vertical: 'middle' }; }

        // Col 10 — Pay method
        if (col === 10) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (t.payment_method === 'Loan') {
            cell.fill = fill('FFFFE699');
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF7F6000' } };
          }
        }

        // Col 11 — Distance
        if (col === 11) { cell.fill = fill(bgA); cell.alignment = { horizontal: 'right', vertical: 'middle' }; }

        // Col 12 — Fuel: light blue tint
        if (col === 12) {
          if (fuelVal) {
            cell.fill = fill('FFBDD7EE');
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF2E75B6' } };
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          } else {
            cell.fill = fill(bgA);
          }
        }

        // Col 14 — Trip#: navy on pale blue
        if (col === 14) {
          cell.fill = fill('FFEAF0FB');
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1F3864' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }

        // Col 16 — TOTAL
        if (col === 16) {
          cell.fill = fill(bgA);
          cell.numFmt = '#,##0';
          cell.font = { name: 'Calibri', size: 10, bold: true };
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        }

        // Col 17 — LOAN: red when this trip is a loan, otherwise empty
        if (col === 17) {
          if (t.payment_method === 'Loan' && hasPrice) {
            cell.fill = fill('FFC00000');
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.numFmt = '#,##0';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          } else {
            cell.fill = fill(bgA);
          }
        }
      });
    });

    // ── Summary block below data ──────────────────────────────
    ws.addRow({});
    const totalIncome = rows.reduce((s, t) => s + Number(t.price || 0), 0);
    const totalPaid   = rows.filter(t => t.payment_status === 'Paid').reduce((s, t) => s + Number(t.price || 0), 0);
    const totalBal    = totalIncome - totalPaid;
    const totalFuel   = rows.reduce((s, t) => s + Number(t.fuel_liters || 0), 0);

    const totalLoans = rows.filter(t => t.payment_method === 'Loan').reduce((s, t) => s + Number(t.price || 0), 0);

    const sumRow = (label, val, bg, fg, fmt) => {
      const r = ws.addRow({ notes: label, total: val });
      r.height = 22;
      ['notes','total'].forEach(k => {
        const c = r.getCell(k);
        c.fill = fill(bg); c.font = { name: 'Calibri', size: 10, bold: true, color: { argb: fg } };
        c.border = fullBorder(medBorder(bg));
      });
      const pc = r.getCell('total');
      pc.numFmt = fmt || '#,##0';
      pc.alignment = { horizontal: 'right', vertical: 'middle' };
    };
    sumRow('TRIPS ZOTE / TOTAL INCOME',         totalIncome, 'FF1B2631', 'FFFFFFFF');
    sumRow('TOTAL LOANS OUTSTANDING',            totalLoans,  'FFC00000', 'FFFFFFFF');
    sumRow('BADO / BALANCE REMAINING',           totalBal,    'FFC00000', 'FFFFFFFF', '#,##0.00');
    sumRow('JUMLA YA MAFUTA / TOTAL FUEL (L)',   totalFuel,   'FF2E75B6', 'FFFFFFFF');

    // ════════════════════════════════════════════════════════════
    // Daily sheet — trips grouped by date
    // ════════════════════════════════════════════════════════════
    const wsd = wb.addWorksheet('Daily');
    wsd.columns = [
      { header: 'DATE',           key: 'date',   width: 22 },
      { header: 'FUEL TOTAL (L)', key: 'fuel',   width: 14 },
      { header: 'TOTAL INCOME',   key: 'income', width: 18 },
      { header: 'NO. TRIPS',      key: 'trips',  width: 10 },
      { header: 'AVG L / TRIP',   key: 'avg',    width: 12 },
    ];
    const dhdr = wsd.getRow(1);
    dhdr.height = 28;
    dhdr.eachCell((cell, col) => {
      cell.fill = fill(col === 2 ? 'FF2E75B6' : 'FFFFD966');
      cell.font = { name: 'Calibri', bold: true, size: 10, color: { argb: col === 2 ? 'FFFFFFFF' : 'FF000000' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      const edge = col === 2 ? 'FF1D5A8A' : 'FFB8A840';
      cell.border = { top: medBorder(edge), bottom: medBorder(edge), left: thinBorder('FFC8C8C8'), right: thinBorder('FFC8C8C8') };
    });

    const byDate = {};
    rows.forEach(t => {
      if (!byDate[t.date]) byDate[t.date] = { fuel: 0, income: 0, trips: 0 };
      byDate[t.date].fuel   += Number(t.fuel_liters || 0);
      byDate[t.date].income += Number(t.price || 0);
      byDate[t.date].trips  += 1;
    });
    Object.keys(byDate).sort().forEach(date => {
      const d = byDate[date];
      const dr = wsd.addRow({
        date,
        fuel:   d.fuel || '',
        income: d.income,
        trips:  d.trips,
        avg:    d.fuel && d.trips ? parseFloat((d.fuel / d.trips).toFixed(1)) : '',
      });
      dr.height = 18;
      dr.getCell('fuel').fill  = fill('FFBDD7EE');
      dr.getCell('fuel').font  = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF2E75B6' } };
      ['fuel','income','trips','avg'].forEach(k => {
        dr.getCell(k).alignment = { horizontal: 'right', vertical: 'middle' };
        dr.getCell(k).border = fullBorder(thinBorder('FFC8C8C8'));
      });
      dr.getCell('income').numFmt = '#,##0';
      dr.getCell('date').border = fullBorder(thinBorder('FFC8C8C8'));
    });

    // ════════════════════════════════════════════════════════════
    // Expenses sheet
    // ════════════════════════════════════════════════════════════
    const wse = wb.addWorksheet('Expenses');
    wse.columns = [
      { header: 'DATE',        key: 'date',   width: 18 },
      { header: 'DRIVER',      key: 'driver', width: 14 },
      { header: 'TYPE',        key: 'type',   width: 14 },
      { header: 'AMOUNT (TZS)',key: 'amount', width: 16 },
      { header: 'DESCRIPTION', key: 'desc',   width: 30 },
    ];
    const ehdr = wse.getRow(1);
    ehdr.height = 28;
    ehdr.eachCell(cell => {
      cell.fill = fill('FFFFD966');
      cell.font = { name: 'Calibri', bold: true, size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: medBorder('FFB8A840'), bottom: medBorder('FFB8A840'), left: thinBorder('FFC8C8C8'), right: thinBorder('FFC8C8C8') };
    });
    fExp.forEach(r => {
      const er = wse.addRow({ date: r.date, driver: r.driver, type: r.type, amount: Number(r.amount) || 0, desc: r.description || '' });
      er.height = 18;
      er.getCell('amount').numFmt = '#,##0';
      er.getCell('amount').alignment = { horizontal: 'right', vertical: 'middle' };
      er.eachCell({ includeEmpty: true }, c => { c.font = { name: 'Calibri', size: 10 }; c.border = fullBorder(thinBorder('FFC8C8C8')); });
    });

    // ════════════════════════════════════════════════════════════
    // Download / Share
    // ════════════════════════════════════════════════════════════
    const fileName = `trips-${from}_${to}.xlsx`;
    const buffer   = await wb.xlsx.writeBuffer();

    try {
      const bytes = new Uint8Array(buffer);
      let b64 = '';
      for (let i = 0; i < bytes.length; i++) b64 += String.fromCharCode(bytes[i]);
      const written = await Filesystem.writeFile({ path: fileName, data: btoa(b64), directory: Directory.Cache });
      await Share.share({ title: 'Trips Report', url: written.uri });
    } catch {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <SegPills options={rangeOpts} value={range} onChange={setRange} accent={C.green} />
        <button onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: 7, background: C.greenSoft, border: `1px solid ${C.green}33`, borderRadius: 10, padding: '9px 14px', fontWeight: 700, fontSize: 13, color: C.green, cursor: 'pointer' }}>
          <FileSpreadsheet size={14} /> {i18n('export')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <StatCard label={i18n('income')}   value={fmt(income)}  icon={<TrendingUp   size={13} color={C.green} />} color={C.green} soft={C.greenSoft} />
        <StatCard label={i18n('expenses')} value={fmt(expense)} icon={<TrendingDown size={13} color={C.rose}  />} color={C.rose}  soft={C.roseSoft}  />
        <StatCard label={i18n('net')}      value={fmt(net)}     sub={net < 0 ? i18n('loss') : i18n('profit')} icon={<Truck size={13} color={net >= 0 ? C.green : C.rose} />} color={net >= 0 ? C.green : C.rose} />
        <StatCard label={i18n('tripsNav')} value={fTrips.length} sub={`${byDriver.length} ${byDriver.length !== 1 ? i18n('drvPlur') : i18n('drvSing')}`} icon={<Route size={13} color={C.amber} />} color={C.amber} soft={C.amberSoft} />
      </div>

      {/* Fuel summary */}
      {totalFuel > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.amber}33`, borderRadius: 14, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{i18n('fuelUsed')}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: C.amber }}>{totalFuel} {i18n('liters')}</div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>{i18n('totalFuel')}</div>
            </div>
            {avgFuel > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: C.amber }}>{avgFuel} {i18n('liters')}</div>
                <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>{i18n('avgFuel')}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {pending > 0 && (
        <div style={{ background: C.roseSoft, border: `1px solid ${C.rose}33`, borderRadius: 12, padding: '11px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: C.sub }}>{i18n('pendingLoan')}</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: C.rose, fontSize: 15 }}>{fmt(pending)}</span>
        </div>
      )}

      {/* Payment method breakdown */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{i18n('byPayment')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { method: 'Cash',          key: 'cash' },
            { method: 'Mobile Money',  key: 'mpesa' },
            { method: 'Bank Transfer', key: 'bank'  },
            { method: 'Loan',          key: 'loan'  },
          ].map(({ method, key }) => {
            const mc   = PAY_COLORS[method] || { bg: C.amberSoft, fg: C.amber };
            const rows = fTrips.filter(t => t.payment_method === method);
            const tot  = rows.reduce((s, r) => s + Number(r.price || 0), 0);
            return (
              <div key={method} style={{ background: mc.bg, border: `1px solid ${mc.fg}33`, borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: mc.fg, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{i18n(key)}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: mc.fg }}>{fmt(tot)}</div>
                <div style={{ fontSize: 11, color: mc.fg, opacity: 0.7, marginTop: 2 }}>{rows.length} {rows.length !== 1 ? i18n('trPlur') : i18n('trSing')}</div>
              </div>
            );
          })}
        </div>
      </div>

      {byDriver.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{i18n('byDriver')}</div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            {byDriver.map((d, i) => (
              <div key={d.key} style={{ padding: '12px 16px', borderTop: i ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{d.key}</span>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: C.green }}>{fmt(d.revenue)}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: C.text }}>
                      {d.trips} <span style={{ fontSize: 11, fontWeight: 400, color: C.sub }}>{d.trips !== 1 ? i18n('trPlur') : i18n('trSing')}</span>
                    </span>
                  </div>
                </div>
                <div style={{ height: 4, background: C.muted, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(d.trips / maxTrips) * 100}%`, background: `linear-gradient(90deg,${C.amber},#FCD34D)`, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {byTruck.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{i18n('byTruck')}</div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            {byTruck.map((r, i) => (
              <div key={r.key} style={{ padding: '11px 16px', borderTop: i ? `1px solid ${C.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{r.key}</span>
                <div style={{ display: 'flex', gap: 14 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: C.green }}>{fmt(r.revenue)}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: C.text }}>{r.trips} <span style={{ fontSize: 11, fontWeight: 400, color: C.sub }}>{r.trips !== 1 ? i18n('trPlur') : i18n('trSing')}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Trips tab ──────────────────────────────────────────────────
function TripsTab({ trips, driverFilter, truckFilter, range, onDelete, i18n }) {
  const { from, to } = useDateRange(range);
  const filtered = trips.filter(r =>
    r.date >= from && r.date <= to &&
    (driverFilter === 'all' || r.driver     === driverFilter) &&
    (truckFilter  === 'all' || r.truck_name === truckFilter)
  );

  if (filtered.length === 0) return (
    <div style={{ color: C.sub, fontSize: 14, fontStyle: 'italic', textAlign: 'center', padding: '48px 0' }}>{i18n('noTrips')}</div>
  );

  return (
    <div>
      {filtered.map(r => {
        const pc = PAY_COLORS[r.payment_method] || { bg: C.amberSoft, fg: C.amber };
        return (
          <div key={r.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 15, padding: '13px 15px', marginBottom: 9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.sub }}>{r.date}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{r.client}</span>
                  <span style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>· {r.driver}</span>
                  {r.truck_name && <span style={{ background: '#0F1F3D', color: '#60A5FA', fontSize: 11, padding: '2px 7px', borderRadius: 6, fontWeight: 600 }}>{r.truck_name}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, flexWrap: 'wrap', marginBottom: r.load ? 4 : 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                  <span style={{ color: C.text }}>{r.from}</span>
                  <span style={{ color: C.sub, fontSize: 11 }}>→</span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose, flexShrink: 0 }} />
                  <span style={{ color: C.text }}>{r.to}</span>
                </div>
                {r.load && <div style={{ fontSize: 11, color: C.sub }}>{r.load}</div>}
                {(r.distance_km || r.fuel_liters) && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                    {r.distance_km && <span style={{ fontSize: 11, color: C.sub }}>{r.distance_km} km</span>}
                    {r.fuel_liters && <span style={{ fontSize: 11, color: C.amber, fontWeight: 600 }}>{r.fuel_liters} L</span>}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7, flexShrink: 0 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 14, color: C.green }}>{fmt(r.price)}</span>
                <span style={{ background: pc.bg, color: pc.fg, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'JetBrains Mono, monospace' }}>
                  {r.payment_method}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
              <button onClick={() => window.confirm(i18n('deleteQ')) && onDelete('trips', r.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: C.sub, fontSize: 12, padding: '2px 6px', borderRadius: 6 }}>
                <Trash2 size={13} /> {i18n('deleteLbl')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Expenses tab ───────────────────────────────────────────────
function ExpensesTab({ expenses, driverFilter, range, onDelete, i18n }) {
  const { from, to } = useDateRange(range);
  const filtered = expenses.filter(r =>
    r.date >= from && r.date <= to &&
    (driverFilter === 'all' || r.driver === driverFilter)
  );

  if (filtered.length === 0) return (
    <div style={{ color: C.sub, fontSize: 14, fontStyle: 'italic', textAlign: 'center', padding: '48px 0' }}>{i18n('noExp')}</div>
  );

  return (
    <div>
      {filtered.map(r => (
        <div key={r.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 15, padding: '13px 15px', marginBottom: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.sub }}>{r.date}</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{r.type}</span>
              <span style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>· {r.driver}</span>
            </div>
            {r.description && <div style={{ fontSize: 12, color: C.sub }}>{r.description}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: C.rose, fontSize: 15 }}>−{fmt(r.amount)}</span>
            <button onClick={() => window.confirm(i18n('deleteQ')) && onDelete('expenses', r.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: 6 }}>
              <Trash2 size={13} color={C.sub} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Loans tab ──────────────────────────────────────────────────
function LoansTab({ trips, driverFilter, truckFilter, range, onMarkPaid, i18n }) {
  const { from, to } = useDateRange(range);
  const loans = trips.filter(r =>
    r.payment_method === 'Loan' &&
    r.date >= from && r.date <= to &&
    (driverFilter === 'all' || r.driver     === driverFilter) &&
    (truckFilter  === 'all' || r.truck_name === truckFilter)
  );

  const totalOwed = loans.filter(r => r.payment_status === 'Pending').reduce((s, r) => s + Number(r.price || 0), 0);
  const totalPaid = loans.filter(r => r.payment_status === 'Paid').reduce((s, r) => s + Number(r.price || 0), 0);

  return (
    <div>
      {/* Summary strip */}
      {loans.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <div style={{ background: C.roseSoft, border: `1px solid ${C.rose}33`, borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.rose, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{i18n('outstanding')}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: C.rose }}>{fmt(totalOwed)}</div>
          </div>
          <div style={{ background: C.greenSoft, border: `1px solid ${C.green}33`, borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{i18n('paid')}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: C.green }}>{fmt(totalPaid)}</div>
          </div>
        </div>
      )}

      {loans.length === 0
        ? <div style={{ color: C.sub, fontSize: 14, fontStyle: 'italic', textAlign: 'center', padding: '48px 0' }}>{i18n('noLoans')}</div>
        : loans.map(r => {
          const isPending = r.payment_status === 'Pending';
          return (
            <div key={r.id} style={{ background: C.card, border: `1px solid ${isPending ? C.rose + '44' : C.green + '44'}`, borderRadius: 15, padding: '13px 15px', marginBottom: 9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.sub }}>{r.date}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{r.client}</span>
                    <span style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>· {r.driver}</span>
                    {r.truck_name && <span style={{ background: '#0F1F3D', color: '#60A5FA', fontSize: 11, padding: '2px 7px', borderRadius: 6, fontWeight: 600 }}>{r.truck_name}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, flexWrap: 'wrap' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                    <span style={{ color: C.text }}>{r.from}</span>
                    <span style={{ color: C.sub, fontSize: 11 }}>→</span>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose, flexShrink: 0 }} />
                    <span style={{ color: C.text }}>{r.to}</span>
                  </div>
                  {(r.distance_km || r.fuel_liters) && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                      {r.distance_km && <span style={{ fontSize: 11, color: C.sub }}>{r.distance_km} km</span>}
                      {r.fuel_liters && <span style={{ fontSize: 11, color: C.amber, fontWeight: 600 }}>{r.fuel_liters} L</span>}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 15, color: C.green }}>{fmt(r.price)}</span>
                  {isPending
                    ? <button onClick={() => onMarkPaid(r.id)} style={{ background: `linear-gradient(135deg,${C.green},#34D399)`, border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 700, fontSize: 12, color: '#07090F', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Check size={12} /> {i18n('markPaid')}
                      </button>
                    : <span style={{ background: C.greenSoft, color: C.green, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={11} /> {i18n('paid')}
                      </span>
                  }
                </div>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

// ── Map tab ────────────────────────────────────────────────────
const MAP_COLORS = ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EC4899','#EF4444','#14B8A6'];
function MapTab({ fleetCode, i18n }) {
  const mapRef   = useRef(null);
  const mapInst  = useRef(null);
  const markers  = useRef({});
  const [locs, setLocs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const colorFor = name => MAP_COLORS[Math.abs([...name].reduce((s,c)=>s+c.charCodeAt(0),0)) % MAP_COLORS.length];
  const initials = name => name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const minAgo   = ts   => Math.floor((Date.now() - ts) / 60000);

  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;
    mapInst.current = L.map(mapRef.current, { center: [-6.7924, 39.2083], zoom: 12 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 18,
    }).addTo(mapInst.current);
    return () => { if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; } };
  }, []);

  const refresh = useCallback(async () => {
    if (!fleetCode) return;
    try {
      const data = await api.locations(fleetCode);
      setLocs(data);
      if (!mapInst.current) return;
      const seen = new Set();
      data.forEach(loc => {
        seen.add(loc.driver);
        const color = colorFor(loc.driver);
        const truckLabel = loc.truck ? `<br/><span style="opacity:0.7;font-size:11px">${loc.truck}</span>` : '';
        const ago = minAgo(loc.updated_at);
        const speedLabel = loc.speed > 0 ? ` · ${Math.round(loc.speed * 3.6)} km/h` : '';
        const popupHtml = `<b>${loc.driver}</b>${truckLabel}<br/>${ago === 0 ? 'just now' : `${ago} min ago`}${speedLabel}`;
        const icon = L.divIcon({
          html: `<div style="width:38px;height:38px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.35)">${initials(loc.driver)}</div>`,
          className: '', iconSize: [38,38], iconAnchor: [19,19], popupAnchor: [0,-22],
        });
        if (markers.current[loc.driver]) {
          markers.current[loc.driver].setLatLng([loc.lat, loc.lon]).setIcon(icon);
          markers.current[loc.driver].getPopup()?.setContent(popupHtml);
        } else {
          const m = L.marker([loc.lat, loc.lon], { icon }).addTo(mapInst.current);
          m.bindPopup(popupHtml);
          markers.current[loc.driver] = m;
        }
      });
      Object.keys(markers.current).forEach(name => {
        if (!seen.has(name)) { markers.current[name].remove(); delete markers.current[name]; }
      });
      if (data.length) {
        mapInst.current.fitBounds(L.latLngBounds(data.map(l=>[l.lat,l.lon])), { padding:[40,40], maxZoom:14 });
      }
    } catch {}
    setLoading(false);
  }, [fleetCode]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  const focusDriver = loc => {
    if (!mapInst.current || !markers.current[loc.driver]) return;
    mapInst.current.flyTo([loc.lat, loc.lon], 16, { animate: true, duration: 0.8 });
    setTimeout(() => markers.current[loc.driver]?.openPopup(), 850);
  };

  const q = search.toLowerCase().trim();
  const filtered = q
    ? locs.filter(l => l.driver.toLowerCase().includes(q) || (l.truck || '').toLowerCase().includes(q))
    : locs;

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{i18n('driverMap')}</div>

      <div style={{ position: 'relative', marginBottom: 10 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder={i18n('mapSearch')}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px 10px 36px', background: C.card2, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 13, outline: 'none' }}
        />
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.sub, cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 2 }}>×</button>
        )}
      </div>

      <div ref={mapRef} style={{ height: '48vh', borderRadius: 16, overflow: 'hidden', marginBottom: 14, border: `1px solid ${C.border}` }} />

      {loading
        ? <div style={{ color: C.sub, textAlign: 'center', padding: '16px 0', fontSize: 13 }}>{i18n('loading')}</div>
        : filtered.length === 0
          ? <div style={{ color: C.sub, fontSize: 14, fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
              {locs.length === 0 ? i18n('noDriversOnline') : `No results for "${search}"`}
            </div>
          : filtered.map(loc => {
              const color = colorFor(loc.driver);
              const ago   = minAgo(loc.updated_at);
              return (
                <div
                  key={loc.driver}
                  onClick={() => focusDriver(loc)}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 15px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0 }}>
                    {initials(loc.driver)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{loc.driver}</div>
                    <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>
                      {loc.truck && <span style={{ marginRight: 6, color: C.amber }}>{loc.truck}</span>}
                      {ago === 0 ? i18n('justNow') : `${ago} ${i18n('minAgo')}`}
                      {loc.speed > 0 ? ` · ${Math.round(loc.speed * 3.6)} km/h` : ''}
                    </div>
                  </div>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: ago < 2 ? C.green : C.amber, boxShadow: `0 0 6px ${ago < 2 ? C.green : C.amber}` }} />
                </div>
              );
            })
      }
    </div>
  );
}

// ── Bottom nav ─────────────────────────────────────────────────
function BottomNav({ tab, setTab, i18n }) {
  const TABS = [
    { id: 'report',   Icon: BarChart2, lk: 'report'      },
    { id: 'trips',    Icon: Route,     lk: 'tripsNav'     },
    { id: 'expenses', Icon: Fuel,      lk: 'expensesNav'  },
    { id: 'loans',    Icon: Wallet,    lk: 'loansNav'     },
    { id: 'map',      Icon: MapPin,    lk: 'mapNav'       },
  ];
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(7,10,16,0.96)', backdropFilter: 'blur(24px)', borderTop: `1px solid ${C.border}`, display: 'flex', paddingBottom: 'env(safe-area-inset-bottom,0px)' }}>
      {TABS.map(({ id, Icon, lk }) => {
        const on = id === tab;
        return (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '11px 0' }}>
            <Icon size={22} color={on ? C.amber : C.sub} strokeWidth={on ? 2.2 : 1.5} />
            <span style={{ fontSize: 9, fontWeight: 700, color: on ? C.amber : C.sub, letterSpacing: '0.05em' }}>{i18n(lk)}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Settings modal (bottom sheet) ──────────────────────────────
function SettingsModal({ onClose, lang, setLang, pinEnabled, setPinEnabled, storedPin, setStoredPin, i18n }) {
  const [curPin, setCurPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [cfmPin, setCfmPin] = useState('');
  const [pinErr, setPinErr] = useState('');
  const [pinOk,  setPinOk]  = useState(false);

  const togglePin = () => {
    const v = !pinEnabled;
    localStorage.setItem('owner_pin_enabled', String(v));
    setPinEnabled(v);
  };

  const changePin = () => {
    if (curPin !== storedPin)   { setPinErr(i18n('wrongCurPin'));  return; }
    if (newPin.length < 4)      { setPinErr(i18n('pinTooShort')); return; }
    if (newPin !== cfmPin)      { setPinErr(i18n('pinMismatch')); return; }
    localStorage.setItem('owner_pin', newPin);
    setStoredPin(newPin);
    setPinOk(true);
    setCurPin(''); setNewPin(''); setCfmPin(''); setPinErr('');
    setTimeout(() => setPinOk(false), 2000);
  };

  const pinInput = (val, setter) => (
    <input type="password" inputMode="numeric" maxLength={8} value={val}
      onChange={e => { setter(e.target.value); setPinErr(''); }}
      placeholder="····"
      style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 20, textAlign: 'center', letterSpacing: '0.25em', outline: 'none', fontFamily: 'JetBrains Mono, monospace' }}
    />
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'flex-end' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', background: C.card, borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', maxHeight: '85vh', overflowY: 'auto', boxSizing: 'border-box' }}>
        {/* Drag handle */}
        <div onClick={onClose} style={{ width: 40, height: 4, background: C.muted, borderRadius: 999, margin: '0 auto 20px', cursor: 'pointer' }} />

        <div style={{ fontFamily: 'Outfit, system-ui', fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 22 }}>{i18n('settings')}</div>

        {/* PIN lock toggle */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>{i18n('pinLock')}</div>
          <div style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <Lock size={18} color={pinEnabled ? C.amber : C.sub} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{i18n('reqPin')}</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{i18n('pinLockDesc')}</div>
            </div>
            <button onClick={togglePin} style={{ width: 50, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', background: pinEnabled ? C.amber : C.muted, position: 'relative', flexShrink: 0 }}>
              <span style={{ position: 'absolute', top: 3, left: pinEnabled ? 27 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block' }} />
            </button>
          </div>

          {/* Change PIN form — only when PIN is enabled */}
          {pinEnabled && (
            <div style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px' }}>
              <div style={{ fontWeight: 600, color: C.text, fontSize: 14, marginBottom: 14 }}>{i18n('changePin')}</div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{i18n('currentPin')}</div>
                {pinInput(curPin, setCurPin)}
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{i18n('newPin')}</div>
                {pinInput(newPin, setNewPin)}
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{i18n('confirmPin')}</div>
                {pinInput(cfmPin, setCfmPin)}
              </div>
              {pinErr && <div style={{ color: C.rose,  fontSize: 13, textAlign: 'center', marginBottom: 10 }}>{pinErr}</div>}
              {pinOk  && <div style={{ color: C.green, fontSize: 13, textAlign: 'center', marginBottom: 10 }}>{i18n('pinChanged')}</div>}
              <button onClick={changePin} style={{ width: '100%', padding: '11px', background: `linear-gradient(135deg,${C.amber},#FCD34D)`, border: 'none', borderRadius: 11, fontWeight: 700, fontSize: 14, color: '#07090F', cursor: 'pointer' }}>
                {i18n('savePin')}
              </button>
            </div>
          )}
        </div>

        <button onClick={onClose} style={{ width: '100%', padding: '12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 12, fontWeight: 600, color: C.sub, fontSize: 14, cursor: 'pointer' }}>
          {i18n('close')}
        </button>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function OwnerApp() {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const i18n = key => (LANG[lang] || LANG.en)[key] || key;

  const [storedPin, setStoredPin] = useState(() => localStorage.getItem('owner_pin') || '1234');
  const [pinEnabled, setPinEnabled] = useState(() => localStorage.getItem('owner_pin_enabled') !== 'false');

  const [unlocked, setUnlocked] = useState(() =>
    localStorage.getItem('owner_pin_enabled') === 'false' ||
    sessionStorage.getItem('owner_auth') === '1'
  );

  const [showSettings, setShowSettings] = useState(false);
  const [tab, setTab]     = useState('report');
  const [range, setRange] = useState('month');
  const [driverFilter, setDriverFilter] = useState('all');
  const [truckFilter,  setTruckFilter]  = useState('all');
  const [trips, setTrips]       = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [online, setOnline]     = useState(navigator.onLine);
  const [loading, setLoading]   = useState(true);
  const lastSync = useRef(0);

  const [fleetCode, setFleetCode] = useState(() => {
    const saved = localStorage.getItem('owner_fleet_code');
    if (saved) return saved;
    const code = genCode();
    localStorage.setItem('owner_fleet_code', code);
    return code;
  });

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    if (!unlocked || !fleetCode) return;
    Promise.all([api.trips(fleetCode), api.expenses(fleetCode)])
      .then(([t, e]) => { setTrips(t); setExpenses(e); lastSync.current = Date.now(); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [unlocked, fleetCode]);

  const poll = useCallback(async () => {
    if (!fleetCode) return;
    try {
      const { trips: nt, expenses: ne, server_time } = await api.sync(fleetCode, lastSync.current);
      if (nt.length) setTrips(p => mergeById(p, nt));
      if (ne.length) setExpenses(p => mergeById(p, ne));
      lastSync.current = server_time || Date.now();
    } catch {}
  }, [fleetCode]);

  useEffect(() => {
    if (!unlocked || !online) return;
    const id = setInterval(poll, 10000);
    return () => clearInterval(id);
  }, [unlocked, online, poll]);

  const handleDelete = async (col, id) => {
    if (col === 'trips') { await api.deleteTrip(id);    setTrips(p    => p.filter(r => r.id !== id)); }
    else                 { await api.deleteExpense(id); setExpenses(p => p.filter(r => r.id !== id)); }
  };

  const handleMarkPaid = async id => {
    await api.patchTripStatus(id, 'Paid');
    setTrips(p => p.map(r => r.id === id ? { ...r, payment_status: 'Paid' } : r));
  };

  const resetFleet = () => {
    const code = genCode();
    localStorage.setItem('owner_fleet_code', code);
    setFleetCode(code); setTrips([]); setExpenses([]); setLoading(true); lastSync.current = 0;
  };

  const handlePinEnabled = v => {
    setPinEnabled(v);
    if (!v) setUnlocked(true);
  };

  const drivers    = useMemo(() => [...new Set(trips.map(r => r.driver).filter(Boolean))].sort(), [trips]);
  const truckNames = useMemo(() => [...new Set(trips.map(r => r.truck_name).filter(Boolean))].sort(), [trips]);

  const rangeOpts = [
    { value: 'today', label: i18n('today') },
    { value: 'week',  label: i18n('week')  },
    { value: 'month', label: i18n('month') },
    { value: 'all',   label: i18n('all')   },
  ];

  const doUnlock = () => { sessionStorage.setItem('owner_auth', '1'); setUnlocked(true); };
  if (!unlocked && pinEnabled) return <PINScreen pin={storedPin} onUnlock={doUnlock} i18n={i18n} />;

  const sel = { background: C.card2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 9, padding: '7px 10px', fontSize: 13, cursor: 'pointer', outline: 'none' };

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <style>{GF}</style>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          lang={lang} setLang={setLang}
          pinEnabled={pinEnabled} setPinEnabled={handlePinEnabled}
          storedPin={storedPin} setStoredPin={setStoredPin}
          i18n={i18n}
        />
      )}

      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(7,10,16,0.95)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}`, padding: '11px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Truck size={20} color={C.amber} />
          <span style={{ fontFamily: 'Outfit, system-ui', fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.3px' }}>{i18n('appName')}</span>
          <span style={{ color: C.sub, fontSize: 12 }}>· {i18n('ownerLabel')}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {online
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.green, fontSize: 12 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}` }} /> {i18n('live')}
                </span>
              : <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.rose, fontSize: 12 }}><WifiOff size={12} /> {i18n('offline')}</span>
            }
            <LangBtn lang={lang} toggle={() => { const nl = lang === 'en' ? 'sw' : 'en'; localStorage.setItem('app_lang', nl); setLang(nl); }} />
            <button onClick={() => setShowSettings(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.sub, display: 'flex', alignItems: 'center' }}>
              <Settings size={16} />
            </button>
            {pinEnabled && (
              <button onClick={() => { sessionStorage.removeItem('owner_auth'); setUnlocked(false); }} style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: C.sub, fontSize: 11 }}>
                {i18n('lock')}
              </button>
            )}
          </div>
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 10 }}>
          <select value={driverFilter} onChange={e => setDriverFilter(e.target.value)} style={sel}>
            <option value="all">{i18n('allDrivers')}</option>
            {drivers.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={truckFilter} onChange={e => setTruckFilter(e.target.value)} style={sel}>
            <option value="all">{i18n('allTrucks')}</option>
            {truckNames.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <SegPills options={rangeOpts} value={range} onChange={setRange} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 16px 96px' }}>
        <FleetBanner code={fleetCode} onReset={resetFleet} i18n={i18n} />
        {loading
          ? <div style={{ color: C.sub, fontSize: 14, textAlign: 'center', padding: '48px 0' }}>{i18n('loading')}</div>
          : <>
              {tab === 'report'   && <ReportTab   trips={trips} expenses={expenses} driverFilter={driverFilter} truckFilter={truckFilter} range={range} setRange={setRange} i18n={i18n} />}
              {tab === 'trips'    && <TripsTab    trips={trips} driverFilter={driverFilter} truckFilter={truckFilter} range={range} onDelete={handleDelete} i18n={i18n} />}
              {tab === 'expenses' && <ExpensesTab expenses={expenses} driverFilter={driverFilter} range={range} onDelete={handleDelete} i18n={i18n} />}
              {tab === 'loans'    && <LoansTab    trips={trips} driverFilter={driverFilter} truckFilter={truckFilter} range={range} onMarkPaid={handleMarkPaid} i18n={i18n} />}
              {tab === 'map'      && <MapTab      fleetCode={fleetCode} i18n={i18n} />}
            </>
        }
      </div>

      <BottomNav tab={tab} setTab={setTab} i18n={i18n} />
    </div>
  );
}
