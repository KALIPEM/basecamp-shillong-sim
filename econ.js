// Basecamp Shillong — hostel owner sim, business engine v2 (no DOM, no three.js)
import { makeProfile, CONCERNS, lifeNews, fill, STAGES } from './people.js';

export const VERSION = 2;
export const BEDS = 30;
export const DORMS = [
  { id: 'A', name: 'Dorm A', yb: 74 }, { id: 'B', name: 'Dorm B', yb: 90 }, { id: 'C', name: 'Dorm C', yb: 106 },
  { id: 'D', name: 'Dorm D', yb: 44 }, { id: 'E', name: 'Dorm E', yb: 28 },
];
export const dormOfBed = (b) => DORMS[Math.floor(b / 6)].id;
export const SEASON = [0.8, 0.85, 1.05, 1.15, 1.15, 0.75, 0.55, 0.55, 0.7, 1.15, 1.3, 1.1];
export const MONSOON = (m) => m >= 5 && m <= 8;
export const WINTER = (m) => m === 11 || m <= 1;
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ROLES = {
  cleaner: { label: 'Cleaner', salary: 6000, max: 6, note: 'Each keeps about 12 occupied beds spotless (less when tired or unhappy).' },
  chef: { label: 'Chef', salary: 18000, max: 2, note: 'Cooks breakfast and dinner, runs the café kitchen.' },
  reception: { label: 'Receptionist', salary: 10000, max: 1, note: 'Smoother check-ins, a bit more comfort.' },
  community: { label: 'Community manager', salary: 20000, max: 1, note: 'Better vibe, cheaper events, more founders.' },
  photographer: { label: 'Photographer', salary: 15000, max: 1, note: 'Daily reels: steady awareness, viral chances.' },
  gardener: { label: 'Gardener', salary: 7000, max: 1, note: 'Kitchen garden yields cut food costs.' },
  techie: { label: 'Server admin', salary: 22000, max: 1, note: 'Keeps the server room up. Needed past 4 hosting customers.' },
  laundry: { label: 'Laundry hand', salary: 7000, max: 1, note: 'Triples how much outside laundry you can take.' },
};

export const UPGRADES = {
  battery: { label: 'Solar battery bank', cost: 120000, desc: 'Power cuts stop hurting, and the server stays up. Electricity -35%.' },
  wifi3: { label: '3rd Wi-Fi line', cost: 8000, monthly: 1500, desc: 'More bandwidth for guests and desk users.' },
  wifi4: { label: '4th Wi-Fi line', cost: 8000, monthly: 1500, desc: 'For founders on video calls all day.', needs: 'wifi3' },
  fibre: { label: 'Business fibre line', cost: 10000, monthly: 4000, desc: 'Lets you sell web hosting. Wi-Fi gets better too.' },
  gpu: { label: 'GPU server', cost: 320000, desc: 'Rent GPU time to AI startups (₹18k/month each, up to 2). Power hungry.', needs: 'fibre' },
  mattress: { label: 'Premium mattresses', cost: 60000, desc: 'Comfort +12. Reviews mention sleep a lot.' },
  garden: { label: 'Kitchen garden expansion', cost: 25000, desc: 'Food +8, kitchen ingredients -15%.' },
  roaster: { label: 'Café coffee roaster', cost: 70000, desc: 'Coffee costs less to make and sells 30% more.' },
  signage: { label: 'Road signage + lit café sign', cost: 30000, desc: 'Café walk-ins +40%.' },
  scooters: { label: '3 more EV scooters', cost: 210000, desc: 'Scooter fleet goes from 6 to 9.' },
  projector: { label: 'Projector + sound', cost: 50000, desc: 'Events draw 30% more people.' },
  heatpump: { label: 'Hot water heat pump', cost: 90000, desc: 'Hot showers in winter. Comfort +6, power -10%.' },
  washers: { label: '2 commercial washers', cost: 45000, desc: 'Outside laundry capacity +60 kg a day.' },
  guides: { label: 'Partner with local guides', cost: 5000, desc: 'Book guests on tours to root bridges and Laitlum for ₹350 commission each.' },
};
export const EVENTS = {
  ai: { label: 'AI build night', cost: 6000, ticket: 799, desc: 'Workshop for builders and curious locals.' },
  fund: { label: 'Fundraising night', cost: 15000, ticket: 0, desc: 'Investors meet founders. Boosts the incubator.' },
  yoga: { label: 'Weekend yoga retreat', cost: 5000, ticket: 1500, desc: 'Roof deck and lawn sessions.' },
  village: { label: 'Village food trail', cost: 3000, ticket: 600, desc: 'Guests visit local farmers and eat local.' },
};
export const MARKETING = {
  reels: { label: 'Instagram reels push', cost: 8000, desc: 'Quick awareness bump. Better with a photographer.' },
  ota: { label: 'Booking-site boost (14 days)', cost: 12000, desc: 'More nightly bookings while it runs.' },
  founders: { label: 'Founder outreach (14 days)', cost: 6000, desc: 'LinkedIn and startup groups. More monthly founders.' },
};
export const MENU = {
  coffee: { label: 'Coffee (local beans)', price: 120, cost: 32, base: 0.55, el: 1.3 },
  tea: { label: 'Ja sha (red tea)', price: 40, cost: 9, base: 0.35, el: 1.1 },
  jadoh: { label: 'Jadoh plate', price: 180, cost: 70, base: 0.25, el: 1.4, veg: true },
  momos: { label: 'Momos (6 pcs)', price: 140, cost: 48, base: 0.3, el: 1.3, veg: true },
};
export const HOSTING = {
  dev: { label: 'Dev box', price: 2000, power: 400 },
  web: { label: 'Web hosting', price: 3500, power: 500, needs: 'fibre' },
  gpu: { label: 'GPU time', price: 18000, power: 4000, needs: 'gpu', max: 2 },
};
export const FIXED = { electricity: 15000, staples: 8000, wifiPerLine: 1500, maintenance: 10000, ops: 30000, insurance: 4000, licences: 2000, software: 2500 };
export const RATES = { otaCommission: 0.15, gstRooms: 0.05, gstFood: 0.05, gstServices: 0.18, breakfast: 40, dinner: 70, lpgCylinder: 1800, mealsPerCylinder: 70, linen: 25, loadCost: 35, kgPerLoad: 6 };
export const LOAN_EMI = 150000;
export const DEFAULT_PRICES = { nightly: 1400, monthly: 250, desk: 300, bike: 250, scooter: 600, laundryLoad: 150, washfold: 70 };

// ---------- rng ----------
export function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
export function poisson(r, l) { if (l <= 0) return 0; if (l > 30) return Math.max(0, Math.round(l + Math.sqrt(l) * gauss(r))); const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; }
export function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (r, a) => a[Math.floor(r() * a.length)];
export const R = (st) => { const r = rng(st.rs); return () => { const x = r(); st.rs = Math.floor(x * 4294967295) || 1; return x; }; };

// ---------- state ----------
export function newGame(mode = 'relaxed', seed = Date.now(), playerName = 'You') {
  const st = {
    v: VERSION, mode, seed: seed >>> 0, rs: (seed >>> 0) || 7, playerName,
    day: 0, minute: 9 * 60, cash: mode === 'realistic' ? 400000 : 300000,
    rep: 3.6, reviews: 0, awareness: 0.18, incubRep: 0.25,
    prices: { ...DEFAULT_PRICES }, menu: Object.fromEntries(Object.entries(MENU).map(([k, v]) => [k, v.price])),
    hostingPrices: Object.fromEntries(Object.entries(HOSTING).map(([k, v]) => [k, v.price])),
    supplier: 'local', monthlyCap: 8,
    staff: [], upgrades: {}, beds: Array(BEDS).fill(null), guests: [], pending: [], nextId: 1,
    events: { scheduled: null, last: {}, history: [] }, marketing: { otaUntil: -1, foundersUntil: -1 },
    today: blankDay(), yesterday: null, month: blankMonth(0), lastMonth: null, history: [],
    sat: { clean: 80, food: 80, wifi: 80, vibe: 60, comfort: 75, value: 75, overall: 75 },
    flags: { powerCut: false, storm: false, wifiOut: false, festival: null, eventsLast7: [], vibeAdj: 0, farmerDeal: false, outage: false },
    applications: [], portfolio: [], achievements: {}, log: [], news: [], concerns: [], promises: [],
    hosting: { slots: 8, customers: [] }, laundry: { contracts: [] },
    occ: 0, cleanCap: 24, over: false,
  };
  const r = R(st);
  hireStaff(st, 'cleaner', r, true); hireStaff(st, 'cleaner', r, true); hireStaff(st, 'chef', r, true);
  return st;
}
function blankDay() {
  return {
    revenue: { beds: 0, monthly: 0, cafe: 0, desks: 0, rentals: 0, tours: 0, laundry: 0, hosting: 0, events: 0, exits: 0 },
    costs: { kitchen: 0, cafe: 0, lpg: 0, staff: 0, utilities: 0, running: 0, linen: 0, commission: 0, gst: 0, people: 0, events: 0, marketing: 0, upgrades: 0, other: 0, loan: 0 },
    cafeItems: {}, turnedAway: 0, walkins: 0, deskUsers: 0, bikes: 0, scooters: 0, tours: 0, arrivals: 0, departures: 0, laundryKg: 0, laundryLoads: 0, meals: 0,
  };
}
function blankMonth(m) { return { m, revenue: 0, costs: 0, nights: 0, possible: 0 }; }

export function dateOf(day) { const d = new Date(Date.UTC(2027, 0, 1 + day)); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), dow: d.getUTCDay() }; }
export function dateLabel(day) { const t = dateOf(day); return `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][t.dow]} ${t.d} ${MONTHS[t.m]} ${t.y}`; }
export const occupied = (st) => st.beds.filter(Boolean).length;
export const monthlyCount = (st) => st.guests.filter(g => g.type === 'monthly' && g.status !== 'gone').length;
export const activeStaff = (st, role) => st.staff.filter(s => (!role || s.role === role) && !(s.offUntil >= st.day));
export const staffCount = (st, role) => st.staff.filter(s => s.role === role).length;
const perf = (s) => 0.6 + 0.4 * s.morale / 100;
export const wifiLines = (st) => 2 + (st.upgrades.wifi3 != null ? 1 : 0) + (st.upgrades.wifi4 != null ? 1 : 0) + (st.upgrades.fibre != null ? 1 : 0);

export function log(st, msg, kind = 'info') { st.log.unshift({ day: st.day, msg, kind }); if (st.log.length > 70) st.log.length = 70; }
export function news(st, msg, who) { st.news.unshift({ day: st.day, msg, who }); if (st.news.length > 80) st.news.length = 80; }
export function spend(st, a, b) { st.cash -= a; st.today.costs[b] = (st.today.costs[b] || 0) + a; st.month.costs += a; }
export function earn(st, a, b) { st.cash += a; st.today.revenue[b] = (st.today.revenue[b] || 0) + a; st.month.revenue += a; }
const gstOut = (amount, rate) => amount * rate / (1 + rate); // prices include GST

// ---------- people ----------
export function personByKey(st, key) {
  if (!key) return null;
  if (key[0] === 'g') { const g = st.guests.find(x => x.id === +key.slice(1)); return g && g.status !== 'gone' ? g : null; }
  if (key[0] === 's') return st.staff.find(x => x.id === +key.slice(1)) || null;
  return null;
}
export function hireStaff(st, role, r = R(st), free = false) {
  const p = makeProfile(r, 'staff');
  const s = { ...p, id: st.nextId++, role, roleLabel: ROLES[role].label.toLowerCase(), salary: ROLES[role].salary, morale: 70, since: st.day, offUntil: -1 };
  st.staff.push(s);
  if (!free) { spend(st, Math.round(s.salary * 0.25), 'staff'); log(st, `👋 Hired ${s.name} as ${ROLES[role].label.toLowerCase()}.`); news(st, `${s.first} joined the team as ${s.roleLabel}. Everyone got a welcome jadoh at lunch.`, 's' + s.id); }
  return s;
}
export function setStaff(st, role, delta) {
  if (delta > 0) {
    if (staffCount(st, role) >= ROLES[role].max) return 'Limit reached.';
    hireStaff(st, role);
    st.promises = st.promises.filter(p => !(p.kind === role));
    return null;
  }
  const list = st.staff.filter(s => s.role === role); if (!list.length) return 'Nobody to let go.';
  const s = list[list.length - 1]; st.staff = st.staff.filter(x => x !== s);
  spend(st, Math.round(s.salary * 0.5), 'staff'); // notice pay
  for (const o of st.staff) o.morale = clamp(o.morale - 6, 0, 100);
  log(st, `👋 Let ${s.name} go, with two weeks' pay. The team noticed.`, 'bad');
  return null;
}

export function computeSat(st) {
  const u = st.upgrades, f = st.flags, t = dateOf(st.day);
  const occ = Math.max(1, occupied(st));
  const cleaners = activeStaff(st, 'cleaner');
  st.cleanCap = cleaners.reduce((a, s) => a + 12 * perf(s), 0) * (f.overtimeUntil >= st.day ? 1.2 : 1);
  st.occ = occupied(st);
  const clean = clamp(40 + 60 * Math.min(1, st.cleanCap / occ), 0, 100);
  const chefs = activeStaff(st, 'chef');
  let food = chefs.length ? 60 + 16 * Math.max(...chefs.map(perf)) + (chefs.length > 1 ? 4 : 0) : 22;
  food += (u.garden != null ? 8 : 0) + (activeStaff(st, 'gardener').length ? 4 : 0) + (u.roaster != null ? 2 : 0) + (f.farmerDeal ? 4 : 0) + (f.khasiNightUntil > st.day ? 4 : 0) + (st.supplier === 'local' ? 2 : 0);
  if (f.storm && st.supplier === 'local' && !f.farmerDeal) food -= 6;
  if (st.day <= (f.foodBoostUntil || -1)) food += 5;
  const deskLoad = occ * 0.6 + st.today.deskUsers;
  let wifi = clamp(100 * Math.min(1, (wifiLines(st) * 12) / Math.max(1, deskLoad)), 0, 100);
  if (f.wifiOut) wifi = 30;
  const ev7 = f.eventsLast7.filter(d => st.day - d < 7).length;
  const cm = activeStaff(st, 'community')[0];
  let vibe = 48 + Math.min(25, 8 * ev7) + (cm ? 12 * perf(cm) : 0) + (f.storm ? 0 : 8) + (activeStaff(st, 'photographer').length ? 3 : 0)
    - (f.powerCut && u.battery == null ? 15 : 0) - (f.quietUntil >= st.day ? 3 : 0) + (f.khasiNightUntil > st.day ? 4 : 0) + f.vibeAdj;
  const rec = activeStaff(st, 'reception')[0];
  let comfort = 72 + (u.mattress != null ? 12 : 0) + (rec ? 7 * perf(rec) : 0) + (u.heatpump != null ? 6 : 0) - (occupied(st) >= 29 ? 6 : 0);
  if (WINTER(t.m)) comfort += f.blanketsUntil >= st.day ? 3 : -5;
  const fair = 700 + 220 * st.rep, fairM = 120 + 40 * st.rep;
  const vN = 100 - Math.max(0, (st.prices.nightly - fair) / fair) * 180 + Math.max(0, (fair - st.prices.nightly) / fair) * 30;
  const vM = 100 - Math.max(0, (st.prices.monthly - fairM) / fairM) * 150 + Math.max(0, (fairM - st.prices.monthly) / fairM) * 20;
  const value = clamp(0.7 * vN + 0.3 * vM, 0, 100);
  food = clamp(food, 0, 100); vibe = clamp(vibe, 0, 100); comfort = clamp(comfort, 0, 100);
  const overall = 0.2 * clean + 0.18 * food + 0.17 * wifi + 0.15 * vibe + 0.15 * comfort + 0.15 * value;
  st.sat = { clean, food, wifi, vibe, comfort, value, overall };
  return st.sat;
}

// ---------- demand ----------
export function nightlyLambda(st) {
  const t = dateOf(st.day); const dow = (t.dow === 5 || t.dow === 6) ? 1.4 : (t.dow === 0 ? 0.8 : 1);
  const fest = st.flags.festival ? st.flags.festival.mult : 1; const ota = st.day <= st.marketing.otaUntil ? 1.15 : 1;
  const road = st.flags.roadBlockUntil >= st.day ? 0.5 : 1;
  return 6 * SEASON[t.m] * (0.3 + st.awareness) * Math.pow(st.rep / 3.6, 2.2) * Math.pow(1400 / st.prices.nightly, 1.7) * dow * fest * ota * road;
}
export function monthlyLambdaWeek(st) {
  const boost = st.day <= st.marketing.foundersUntil ? 1.6 : 1;
  return 0.6 * (0.4 + st.incubRep) * Math.pow(250 / st.prices.monthly, 1.4) * (activeStaff(st, 'community').length ? 1.5 : 1) * boost;
}

export function addGuest(st, type, nights) {
  const bed = st.beds.findIndex(b => !b);
  if (bed < 0) { st.today.turnedAway++; return null; }
  const r = R(st); const used = st.guests.filter(g => g.startup).map(g => g.startup);
  const p = makeProfile(r, type, used);
  const g = { ...p, id: st.nextId++, type, bed, nightsLeft: nights, rate: type === 'monthly' ? st.prices.monthly : st.prices.nightly, arrivedDay: st.day, status: 'in' };
  st.beds[bed] = g.id; st.guests.push(g); st.today.arrivals++;
  if (!st.achievements.firstGuest) { st.achievements.firstGuest = st.day; log(st, `🎉 First guest checked in: ${g.name} from ${g.origin}!`, 'good'); }
  if (occupied(st) === BEDS && !st.achievements.fullHouse) { st.achievements.fullHouse = st.day; log(st, '🏆 Full house! All 30 beds taken.', 'good'); }
  if (type === 'monthly') news(st, `${g.first} ${g.last} from ${g.origin} moved in for a month to build ${g.startup}: ${g.idea}.`, 'g' + g.id);
  return g;
}
export function checkout(st, g) { if (g.bed != null && st.beds[g.bed] === g.id) st.beds[g.bed] = null; g.status = 'gone'; st.concerns = st.concerns.filter(c => c.who !== 'g' + g.id); }

export function hourTick(st, hour) {
  const signals = []; const r = R(st);
  if (hour === 10) {
    for (const g of st.guests) if (g.status === 'leaving') { checkout(st, g); st.today.departures++; signals.push({ kind: 'depart', id: g.id }); }
    st.guests = st.guests.filter(g => g.status !== 'gone');
  }
  const due = st.pending.filter(p => p.hour === hour); st.pending = st.pending.filter(p => p.hour !== hour);
  for (const p of due) { const g = addGuest(st, p.type, p.nights); if (g) signals.push({ kind: 'arrive', id: g.id }); }
  const ev = st.events.scheduled;
  if (ev && ev.day === st.day && hour === 18) { runEvent(st, ev.type, r); st.events.scheduled = null; signals.push({ kind: 'event', type: ev.type }); }
  return signals;
}

function runEvent(st, type, r) {
  const E = EVENTS[type]; const proj = st.upgrades.projector != null ? 1.3 : 1; const aw = st.awareness;
  let people = 0, revenue = 0;
  if (type === 'ai') { people = Math.min(20, poisson(r, (6 + 18 * aw) * proj)); revenue = people * E.ticket; st.awareness = clamp(aw + 0.015, 0, 1); st.incubRep = clamp(st.incubRep + 0.02, 0, 1); }
  if (type === 'fund') { people = Math.min(25, poisson(r, (8 + 10 * st.incubRep) * proj)); st.incubRep = clamp(st.incubRep + 0.08, 0, 1); const live = st.portfolio.filter(p => p.status === 'active'); if (live.length && r() < 0.35) raiseRound(st, pick(r, live), r, 'an investor at fundraising night'); }
  if (type === 'yoga') { people = Math.min(12, poisson(r, (4 + 10 * aw) * proj * SEASON[dateOf(st.day).m])); revenue = people * E.ticket; st.awareness = clamp(aw + 0.01, 0, 1); }
  if (type === 'village') { people = Math.max(1, Math.round(occupied(st) * 0.4)); revenue = people * E.ticket; st.flags.foodBoostUntil = st.day + 3; }
  if (revenue) { earn(st, revenue, 'events'); spend(st, Math.round(gstOut(revenue, RATES.gstServices)), 'gst'); }
  st.flags.eventsLast7.push(st.day);
  st.events.history.unshift({ day: st.day, type, people, revenue }); st.events.history.length = Math.min(st.events.history.length, 20);
  log(st, `🎤 ${E.label}: ${people} people came${revenue ? `, ₹${fmt(revenue)} in tickets` : ''}.`, 'good');
}
export function scheduleEvent(st, type) {
  const E = EVENTS[type];
  if (st.events.scheduled) return 'Another event is already booked.';
  const last = st.events.last[type]; if (last != null && st.day - last < 5) return `Wait ${5 - (st.day - last)} more day(s) before repeating this.`;
  const cost = Math.round(E.cost * (activeStaff(st, 'community').length ? 0.7 : 1)); if (st.cash < cost) return 'Not enough cash.';
  spend(st, cost, 'events'); const day = st.minute < 17 * 60 ? st.day : st.day + 1;
  st.events.scheduled = { type, day, hour: 18 }; st.events.last[type] = st.day;
  log(st, `📅 ${E.label} booked for ${day === st.day ? 'tonight' : 'tomorrow'} at 6 pm (₹${fmt(cost)}).`); return null;
}
export function runMarketing(st, key) {
  const M = MARKETING[key]; const r = R(st);
  if (st.cash < M.cost) return 'Not enough cash.';
  if (key === 'ota' && st.day <= st.marketing.otaUntil) return 'Already running.';
  if (key === 'founders' && st.day <= st.marketing.foundersUntil) return 'Already running.';
  spend(st, M.cost, 'marketing');
  if (key === 'reels') { let b = activeStaff(st, 'photographer').length ? 0.05 : 0.03; if (r() < 0.12) { b += 0.08; log(st, '🔥 One of your reels went viral!', 'good'); } st.awareness = clamp(st.awareness + b, 0, 1); log(st, `📣 Reels push done. Awareness now ${Math.round(st.awareness * 100)}%.`); }
  if (key === 'ota') { st.marketing.otaUntil = st.day + 14; log(st, '📣 Booking-site boost running for 14 days.'); }
  if (key === 'founders') { st.marketing.foundersUntil = st.day + 14; st.incubRep = clamp(st.incubRep + 0.05, 0, 1); log(st, '📣 Founder outreach running for 14 days.'); }
  return null;
}
export function buyUpgrade(st, key) {
  const U = UPGRADES[key];
  if (st.upgrades[key] != null) return 'Already bought.';
  if (U.needs && st.upgrades[U.needs] == null) return `Needs ${UPGRADES[U.needs].label} first.`;
  if (st.cash < U.cost) return 'Not enough cash.';
  spend(st, U.cost, 'upgrades'); st.upgrades[key] = st.day;
  if (key === 'signage') st.awareness = clamp(st.awareness + 0.03, 0, 1);
  log(st, `🛠️ Bought ${U.label}.`, 'good'); return null;
}
export function decideApplication(st, idx, accept) {
  const a = st.applications[idx]; if (!a) return null;
  st.applications.splice(idx, 1);
  if (!accept) { log(st, `Passed on ${a.name}.`); return null; }
  if (st.cash < a.fee) { st.applications.splice(idx, 0, a); return 'Not enough cash.'; }
  spend(st, a.fee, 'other');
  st.portfolio.push({ name: a.name, stake: a.stake, valuation: a.valuation, status: 'active', since: st.day });
  st.incubRep = clamp(st.incubRep + 0.04, 0, 1);
  log(st, `🌱 ${a.name} joined the incubator. You hold ${a.stake}%.`, 'good');
  if (st.portfolio.length >= 3 && !st.achievements.incub3) { st.achievements.incub3 = st.day; log(st, '🏆 Incubated 3 startups!', 'good'); }
  return null;
}
function raiseRound(st, p, r, via) { p.valuation = Math.round(p.valuation * (1.8 + r() * 1.7)); log(st, `💸 ${p.name} raised a round via ${via}. Valued at ₹${fmtL(p.valuation)}.`, 'good'); news(st, `${p.name} raised money via ${via}. Champagne was not available in Umiam, so they made do with ja sha.`); }
export const portfolioValue = (st) => st.portfolio.filter(p => p.status === 'active').reduce((a, p) => a + p.valuation * p.stake / 100, 0);

// ---------- hosting ----------
export function addHosting(st, plan, name, freeMonths = 0) {
  const H = HOSTING[plan];
  if (st.hosting.customers.length >= st.hosting.slots) return 'The server room is full.';
  if (H.needs && st.upgrades[H.needs] == null) return `Needs ${UPGRADES[H.needs].label}.`;
  if (H.max && st.hosting.customers.filter(c => c.plan === plan).length >= H.max) return 'No GPU capacity left.';
  st.hosting.customers.push({ name, plan, since: st.day, freeUntil: st.day + 30 * freeMonths });
  log(st, `🖥️ ${name} is now hosting a ${H.label.toLowerCase()} with you.`, 'good');
  if (st.hosting.customers.length >= 5 && !st.achievements.host5) { st.achievements.host5 = st.day; log(st, '🏆 5 hosting customers in your server room!', 'good'); }
  return null;
}
export function dropHosting(st, idx) { const c = st.hosting.customers[idx]; if (!c) return; st.hosting.customers.splice(idx, 1); log(st, `🖥️ Ended hosting for ${c.name}.`); }

// ---------- concerns ----------
export function concernText(st, c) {
  const T = CONCERNS[c.tpl]; const p = personByKey(st, c.who) || {};
  return T.text(p, st);
}
export function concernChoices(st, c) {
  const T = CONCERNS[c.tpl];
  return T.choices.map((ch, i) => ({ i, label: ch.label, ok: !ch.need || ch.need(st), cost: ch.eff.cash || 0 }));
}
export function resolveConcern(st, id, choiceIdx, inPerson = false) {
  const c = st.concerns.find(x => x.id === id); if (!c) return null;
  const T = CONCERNS[c.tpl]; const ch = T.choices[choiceIdx]; if (!ch) return null;
  if (ch.need && !ch.need(st)) return { err: 'Not available yet.' };
  if (ch.eff.cash && st.cash < ch.eff.cash) return { err: 'Not enough cash.' };
  st.concerns = st.concerns.filter(x => x !== c);
  const out = applyEff(st, c.who, ch.eff, inPerson);
  return { ok: true, say: out };
}
function applyEff(st, who, eff, inPerson) {
  const r = R(st); const p = personByKey(st, who); const notes = [];
  if (eff.gamble) { const [pr, a, b] = eff.gamble; return applyEff(st, who, r() < pr ? a : b, inPerson); }
  if (eff.cash) spend(st, eff.cash, 'people');
  if (eff.earn) { earn(st, eff.earn[0], eff.earn[1]); spend(st, Math.round(gstOut(eff.earn[0], RATES.gstServices)), 'gst'); }
  if (p) {
    if (eff.mood && p.mood != null) p.mood = clamp(p.mood + eff.mood + (inPerson ? 3 : 0), -40, 40);
    if (eff.rel || inPerson) p.rel = clamp((p.rel || 0) + (eff.rel || 0) + (inPerson ? 5 : 0), 0, 100);
    if (eff.morale && p.morale != null) p.morale = clamp(p.morale + eff.morale + (inPerson ? 3 : 0), 0, 100);
    if (eff.salary) p.salary += eff.salary;
    if (eff.off) p.offUntil = st.day + eff.off;
    if (eff.nights) { p.nightsLeft += eff.nights; if (eff.rateMult) p.rate = Math.round(p.rate * eff.rateMult); if (p.status === 'leaving') p.status = 'in'; }
    if (eff.leave) p.status = 'leaving';
    if (eff.stage) p.stage = Math.min(STAGES.length - 1, (p.stage || 0) + eff.stage);
    if (eff.equity && p.startup) { st.portfolio.push({ name: p.startup, stake: eff.equity, valuation: 5000000, status: 'active', since: st.day }); log(st, `🌱 You now own ${eff.equity}% of ${p.startup}.`, 'good'); }
    if (eff.hosting) { const plan = eff.hosting === 'devfree' ? 'dev' : eff.hosting; const e = addHosting(st, plan, p.startup || p.name, eff.hosting === 'devfree' ? 1 : 0); if (e) notes.push(e); }
  } else if (eff.hosting) { const e = addHosting(st, eff.hosting, eff.hosting === 'web' ? 'Police Bazaar travel agency' : 'Local dev shop'); if (e) notes.push(e); }
  if (eff.staffMorale) for (const s of st.staff) s.morale = clamp(s.morale + eff.staffMorale, 0, 100);
  if (eff.chefMorale) for (const s of st.staff.filter(x => x.role === 'chef')) s.morale = clamp(s.morale + eff.chefMorale, 0, 100);
  if (eff.rep) st.rep = clamp(st.rep + eff.rep, 1, 5);
  if (eff.aw) st.awareness = clamp(st.awareness + eff.aw, 0, 1);
  if (eff.incub) st.incubRep = clamp(st.incubRep + eff.incub, 0, 1);
  if (eff.vibe) st.flags.vibeAdj += 4 * eff.vibe;
  if (eff.flag) { const [k, d] = eff.flag; if (k === 'farmerDeal') st.flags.farmerDeal = true; else st.flags[k + 'Until'] = st.day + d; }
  if (eff.contract) { st.laundry.contracts.push({ ...eff.contract, since: st.day }); log(st, `🧺 Laundry contract: ${eff.contract.name}, ${eff.contract.kg} kg/week at ₹${eff.contract.rate}/kg.`, 'good'); }
  if (eff.promise) st.promises.push({ kind: eff.promise, due: st.day + 10 });
  if (eff.news) news(st, fill(eff.news, p || {}), who);
  if (eff.say) notes.push(eff.say);
  return notes.join(' ');
}
export function chat(st, key) {
  const p = personByKey(st, key); if (!p) return;
  if (p.chatDay === st.day) return;
  p.chatDay = st.day; p.rel = clamp((p.rel || 0) + 3, 0, 100);
  if (p.mood != null) p.mood = clamp(p.mood + 1, -40, 40);
  if (p.morale != null) p.morale = clamp(p.morale + 1, 0, 100);
  if (p.rel >= 90 && !st.achievements.friend) { st.achievements.friend = st.day; log(st, `🏆 ${p.first} calls you a real friend.`, 'good'); }
}

function generateConcerns(st, r) {
  // expire
  for (const c of [...st.concerns]) if (st.day > c.expires) { st.concerns = st.concerns.filter(x => x !== c); const T = CONCERNS[c.tpl]; if (T.ignore && Object.keys(T.ignore).length) applyEff(st, c.who, T.ignore, false); }
  const busy = new Set(st.concerns.map(c => c.who));
  const m = dateOf(st.day).m;
  const pools = {
    guest: st.guests.filter(g => g.status === 'in' && g.type === 'nightly' && !busy.has('g' + g.id)).map(g => 'g' + g.id),
    founder: st.guests.filter(g => g.status === 'in' && g.type === 'monthly' && !busy.has('g' + g.id)).map(g => 'g' + g.id),
  };
  const n = Math.min(4 - st.concerns.length, poisson(r, 0.6 + st.guests.length * 0.06));
  for (let i = 0; i < n; i++) {
    const opts = [];
    for (const [k, T] of Object.entries(CONCERNS)) {
      if (T.skip && T.skip(st)) continue; if (st.concerns.some(c => c.tpl === k)) continue;
      let w = T.w(st, m); if (!w) continue;
      let poolKeys;
      if (T.who === 'guest' || T.who === 'founder') poolKeys = pools[T.who];
      else if (T.who.startsWith('staff')) { const role = T.who.split(':')[1]; poolKeys = st.staff.filter(s => (!role || s.role === role) && !busy.has('s' + s.id) && !(s.offUntil >= st.day)).map(s => 's' + s.id); }
      else poolKeys = ['local'];
      if (!poolKeys.length) continue;
      opts.push({ k, w, poolKeys });
    }
    if (!opts.length) break;
    let tot = opts.reduce((a, o) => a + o.w, 0), x = r() * tot, sel = opts[0];
    for (const o of opts) if ((x -= o.w) <= 0) { sel = o; break; }
    const who = pick(r, sel.poolKeys); busy.add(who);
    st.concerns.push({ id: st.nextId++, tpl: sel.k, who, created: st.day, expires: st.day + 2 });
  }
}

// ---------- midnight settlement ----------
export function dayTick(st) {
  const r = R(st); const t = dateOf(st.day); const u = st.upgrades, f = st.flags;
  computeSat(st);
  const occ = occupied(st);
  const nightly = st.guests.filter(g => g.status === 'in' && g.type === 'nightly');
  const monthly = st.guests.filter(g => g.status === 'in' && g.type === 'monthly');
  const season = SEASON[t.m]; const monsoon = MONSOON(t.m);

  // 1. rooms
  for (const g of st.guests) if (g.status === 'in') {
    earn(st, g.rate, g.type === 'monthly' ? 'monthly' : 'beds');
    spend(st, Math.round(gstOut(g.rate, RATES.gstRooms)), 'gst');
    if (g.type !== 'monthly') spend(st, Math.round(g.rate * RATES.otaCommission), 'commission');
    g.nightsLeft--;
  }
  st.month.nights += occ; st.month.possible += BEDS;

  // 2. kitchen: breakfast + dinner for everyone staying
  const supplierMult = st.supplier === 'local' ? 1 : 1.08;
  const seasonMult = monsoon ? (st.supplier === 'local' ? 1.2 : 1.05) : 1;
  const foodMult = supplierMult * seasonMult * (u.garden != null ? 0.85 : 1) * (f.farmerDeal ? 0.9 : 1) * (activeStaff(st, 'gardener').length ? 0.95 : 1);
  const khasiFri = f.khasiNightUntil > st.day && t.dow === 5 ? 10 : 0;
  const meals = occ * 2 + khasiFri; st.today.meals = meals;
  spend(st, Math.round(occ * (RATES.breakfast + RATES.dinner) * foodMult + khasiFri * RATES.dinner * foodMult + FIXED.staples / 30), 'kitchen');

  // 3. café, item by item
  const walk = poisson(r, 18 * season * (0.3 + st.awareness) * (u.signage != null ? 1.4 : 1) * (f.storm ? 0.5 : 1) * (st.rep / 3.6) * (f.roadBlockUntil >= st.day ? 0.6 : 1));
  const visits = walk + Math.round(occ * 0.5);
  st.today.walkins = walk; let cafeRev = 0, cafeCost = 0, cafeItems = 0;
  for (const [k, M] of Object.entries(MENU)) {
    const price = st.menu[k];
    let prob = M.base * Math.pow(M.price / price, M.el);
    if (k === 'coffee' && u.roaster != null) prob *= 1.3;
    if (k === 'jadoh' && khasiFri) prob *= 1.5;
    const n = poisson(r, visits * Math.min(0.95, prob));
    let unitCost = M.cost * (M.veg ? foodMult : supplierMult);
    if (k === 'coffee' && u.roaster != null) unitCost *= 0.75;
    cafeRev += n * price; cafeCost += n * unitCost; cafeItems += n; st.today.cafeItems[k] = { n, rev: n * price, cost: Math.round(n * unitCost) };
  }
  if (cafeRev) { earn(st, cafeRev, 'cafe'); spend(st, Math.round(cafeCost), 'cafe'); spend(st, Math.round(gstOut(cafeRev, RATES.gstFood)), 'gst'); }
  // LPG for kitchen + café
  spend(st, Math.round((meals + cafeItems * 0.4) / RATES.mealsPerCylinder * RATES.lpgCylinder), 'lpg');

  // 4. desks, rentals, tours
  const deskCap = Math.max(0, Math.round(16 - monthly.length * 0.8 - nightly.length * 0.15));
  const desks = Math.min(deskCap, poisson(r, 5 * season * (0.3 + st.awareness) * Math.pow(300 / st.prices.desk, 1.3) * (activeStaff(st, 'community').length ? 1.3 : 1)));
  st.today.deskUsers = desks;
  const plan = st.rentPlan || planRentals(st, r);
  const bikes = Math.min(plan.bikes, nightly.length), scooters = Math.min(plan.scooters, nightly.length);
  const tours = u.guides != null ? poisson(r, nightly.length * 0.15 * (f.storm ? 0.4 : 1)) : 0;
  st.today.bikes = bikes; st.today.scooters = scooters; st.today.tours = tours;
  const svc = desks * st.prices.desk + bikes * st.prices.bike + scooters * st.prices.scooter;
  if (desks) earn(st, desks * st.prices.desk, 'desks');
  if (bikes + scooters) earn(st, bikes * st.prices.bike + scooters * st.prices.scooter, 'rentals');
  if (tours) earn(st, tours * 350, 'tours');
  if (svc) spend(st, Math.round(gstOut(svc, RATES.gstServices)), 'gst');
  if (scooters) spend(st, scooters * 60, 'utilities'); // charging

  // 5. laundry: guests + outside wash & fold + contracts
  const guestLoads = poisson(r, occ * 0.15 * Math.pow(150 / st.prices.laundryLoad, 1.2));
  const localKg = poisson(r, 8 * (0.3 + st.awareness) * Math.pow(70 / st.prices.washfold, 1.4));
  const contractKg = st.laundry.contracts.reduce((a, c) => a + c.kg / 7, 0);
  const capKg = (activeStaff(st, 'laundry').length ? 180 : 60) + (u.washers != null ? 60 : 0);
  const extKg = Math.min(capKg, localKg + contractKg); const lost = localKg + contractKg - extKg;
  const contractRev = st.laundry.contracts.reduce((a, c) => a + c.rate * c.kg / 7, 0) * (extKg / Math.max(1, localKg + contractKg));
  const laundryRev = guestLoads * st.prices.laundryLoad + Math.min(localKg, Math.max(0, extKg - contractKg)) * st.prices.washfold + contractRev;
  const loads = guestLoads + Math.ceil(extKg / RATES.kgPerLoad) + Math.ceil(occ / 4); // + linen
  st.today.laundryKg = Math.round(extKg); st.today.laundryLoads = loads;
  if (laundryRev) { earn(st, Math.round(laundryRev), 'laundry'); spend(st, Math.round(gstOut(laundryRev, RATES.gstServices)), 'gst'); }
  spend(st, loads * RATES.loadCost, 'utilities');
  if (lost > 5 && st.laundry.contracts.length && r() < 0.15) { const c = st.laundry.contracts.shift(); log(st, `🧺 ${c.name} cancelled their laundry contract: you kept missing their pickups.`, 'bad'); }

  // 6. server room
  const hc = st.hosting.customers; let outage = false;
  if (hc.length) {
    const noAdmin = hc.length > 4 && !activeStaff(st, 'techie').length;
    outage = (f.powerCut && u.battery == null && r() < 0.7) || r() < (noAdmin ? 0.06 : 0.015);
    let rev = 0, power = 0;
    for (const c of hc) { const H = HOSTING[c.plan]; power += H.power / 30; if (st.day >= c.freeUntil) rev += st.hostingPrices[c.plan] / 30; }
    if (outage) { rev *= 0.5; log(st, `🖥️ Server room went down today${f.powerCut && u.battery == null ? ' during the power cut' : ''}. Customers got half-day credits.`, 'bad'); }
    if (rev) { earn(st, Math.round(rev), 'hosting'); spend(st, Math.round(gstOut(rev, RATES.gstServices)), 'gst'); }
    spend(st, Math.round(power), 'utilities');
    if (outage) for (const c of [...hc]) if (r() < 0.12) { st.hosting.customers = st.hosting.customers.filter(x => x !== c); log(st, `🖥️ ${c.name} moved their server elsewhere after the outage.`, 'bad'); }
  }
  f.outage = outage;

  // 7. running costs
  const lines = wifiLines(st) - (u.fibre != null ? 1 : 0);
  const elec = FIXED.electricity * (u.battery != null ? 0.65 : 1) * (u.heatpump != null ? 0.9 : 1) * (u.gpu != null ? 1 : 1);
  spend(st, Math.round((elec + lines * FIXED.wifiPerLine + (u.fibre != null ? 4000 : 0)) / 30), 'utilities');
  spend(st, Math.round((FIXED.maintenance + FIXED.ops + FIXED.insurance + FIXED.licences + FIXED.software) / 30), 'running');
  spend(st, Math.round(st.staff.reduce((a, s) => a + s.salary, 0) / 30) + (f.overtimeUntil >= st.day ? 285 : 0), 'staff');
  spend(st, occ * RATES.linen, 'linen');
  if (st.mode === 'realistic') spend(st, Math.round(LOAN_EMI / 30), 'loan');
  if (f.powerCut && u.battery == null) spend(st, 2500, 'utilities');
  if ([1, 2, 3].includes(t.m) && t.dow === 1) { spend(st, 1500, 'utilities'); }

  // 8. checkouts + reviews, by person
  let reviewsToday = 0;
  for (const g of st.guests) if (g.status === 'in' && g.nightsLeft <= 0) {
    g.status = 'leaving';
    const personal = clamp(st.sat.overall + g.mood * 0.8 + (g.rel - 20) * 0.1, 0, 100);
    const stars = clamp(1 + 4 * Math.pow(personal / 100, 1.3) + gauss(r) * 0.35, 1, 5);
    st.rep = (st.rep * 25 + stars) / 26; st.reviews++; reviewsToday++;
    if (stars >= 4.75 && !st.achievements.five) { st.achievements.five = st.day; log(st, `🏆 First 5★ review, from ${g.name}!`, 'good'); }
    if (stars >= 4.6 && g.rel > 60) news(st, `${g.first} left a ${stars.toFixed(1)}★ review: "${pick(r, ['Felt like family.', 'The owner actually knows your name.', 'Best hostel in the Northeast, no contest.', 'Come for the views, stay for the people.'])}"`, 'g' + g.id);
    if (stars < 2.5) log(st, `😬 ${g.name} left a ${stars.toFixed(1)}★ review. Check the happiness bars.`, 'bad');
  }

  // 9. staff morale + promises
  for (const s of st.staff) {
    let d = (62 - s.morale) * 0.03; // drift to neutral
    if (s.role === 'cleaner' && st.occ > st.cleanCap) d -= 1.2;
    if (s.salary > ROLES[s.role].salary) d += 0.3;
    s.morale = clamp(s.morale + d, 0, 100);
    if (s.morale < 22 && r() < 0.05) { st.staff = st.staff.filter(x => x !== s); log(st, `🚪 ${s.name} (${s.roleLabel}) quit. Morale was too low.`, 'bad'); news(st, `${s.first} handed in their keys and left Basecamp today.`, 's' + s.id); }
  }
  for (const pr of [...st.promises]) if (st.day > pr.due) { st.promises = st.promises.filter(x => x !== pr); for (const s of st.staff.filter(x => x.role === pr.kind)) s.morale = clamp(s.morale - 12, 0, 100); log(st, `💬 You promised to hire another ${pr.kind} and didn't. The team remembers.`, 'bad'); }

  // 10. founders' journeys + incubator applications
  for (const g of monthly) {
    if (t.dow === 3 && r() < 0.18 + g.rel / 400 + st.sat.vibe / 600 && g.stage < 4) { g.stage++; news(st, `${g.first}'s ${g.startup} moved on to ${STAGES[g.stage]}.`, 'g' + g.id); }
    const stayed = st.day - g.arrivedDay;
    if (stayed >= 10 && !g.applied && t.dow === 1 && r() < 0.04 + 0.1 * st.incubRep * (st.sat.vibe / 100) + Math.max(0, g.rel - 40) / 400 + g.stage * 0.03) {
      g.applied = true;
      st.applications.push({ name: g.startup, founder: g.name, stake: 2 + Math.floor(r() * 4), fee: 25000, valuation: Math.round((30 + r() * 50 + g.stage * 15) * 100000) });
      log(st, `📨 ${g.first} wants ${g.startup} to join your incubator.`, 'good');
    }
  }
  // hosting inquiries from your own community
  if (t.dow === 4 && st.hosting.customers.length < st.hosting.slots && r() < 0.1 + st.portfolio.filter(p => p.status === 'active').length * 0.05) {
    const owner = pick(r, [...st.portfolio.filter(p => p.status === 'active').map(p => p.name), 'A Shillong web agency', 'Laitumkhrah coding club']);
    if (!st.hosting.customers.some(c => c.name === owner)) addHosting(st, st.upgrades.fibre != null && r() < 0.5 ? 'web' : 'dev', owner);
  }

  // 11. concerns + life news
  generateConcerns(st, r);
  const people = { guests: nightly, founders: monthly, staff: st.staff };
  for (const msg of lifeNews(st, r, people)) news(st, msg);

  // 12. drift + history
  st.awareness = clamp(st.awareness * 0.99 + 0.0006 * reviewsToday * (st.rep / 4) + (st.day <= st.marketing.otaUntil ? 0.003 : 0) + (activeStaff(st, 'photographer').length ? 0.0012 : 0), 0, 1);
  st.incubRep = clamp(st.incubRep * 0.998 + (activeStaff(st, 'community').length ? 0.001 : 0), 0, 1);
  f.vibeAdj *= 0.85;
  const profit = sumObj(st.today.revenue) - sumObj(st.today.costs);
  st.history.push({ day: st.day, cash: Math.round(st.cash), occ, profit: Math.round(profit), rep: +st.rep.toFixed(2) });
  if (st.history.length > 400) st.history.shift();
  if (st.rep >= 4.5 && !st.achievements.rep45) { st.achievements.rep45 = st.day; log(st, '🏆 Reputation hit 4.5★!', 'good'); }
  if (st.cash >= 1000000 && !st.achievements.tenL) { st.achievements.tenL = st.day; log(st, '🏆 ₹10 lakh in the bank!', 'good'); }

  // ---- new day ----
  st.yesterday = st.today; st.today = blankDay(); st.day++;
  const nt = dateOf(st.day);
  if (nt.d === 1) monthEnd(st, r, t.m, nt);
  rollDayFlags(st, r, nt);
  const n = poisson(r, nightlyLambda(st));
  for (let i = 0; i < n; i++) st.pending.push({ hour: 12 + Math.floor(r() * 9), type: 'nightly', nights: 1 + Math.min(6, poisson(r, 1.3)) });
  if (nt.dow === 1) {
    const m = poisson(r, monthlyLambdaWeek(st));
    const room = Math.max(0, st.monthlyCap - monthlyCount(st) - st.pending.filter(p => p.type === 'monthly').length);
    for (let i = 0; i < Math.min(m, room); i++) st.pending.push({ hour: 11 + Math.floor(r() * 6), type: 'monthly', nights: 28 + Math.floor(r() * 4) });
    if (m > room && m > 0) log(st, `🧳 ${m - room} founder(s) asked for a monthly stay, but your monthly-bed cap is full.`);
  }
  st.rentPlan = planRentals(st, r);
  if (st.cash < -300000) { st.over = true; log(st, '💀 The bank stepped in. Basecamp is out of cash.', 'bad'); }
  return st;
}

export function planRentals(st, r = R(st)) {
  const n = st.guests.filter(g => g.status === 'in' && g.type === 'nightly').length + st.pending.filter(p => p.type === 'nightly').length * 0.5;
  const storm = st.flags.storm;
  return {
    bikes: storm ? 0 : Math.min(6, poisson(r, n * 0.12 * Math.pow(250 / st.prices.bike, 1.2))),
    scooters: Math.min(st.upgrades.scooters != null ? 9 : 6, poisson(r, n * 0.14 * Math.pow(600 / st.prices.scooter, 1.2) * (storm ? 0.4 : 1))),
  };
}
function rollDayFlags(st, r, nt) {
  const f = st.flags; const u = st.upgrades;
  f.eventsLast7 = f.eventsLast7.filter(d => st.day - d < 7);
  f.powerCut = r() < (MONSOON(nt.m) ? 0.12 : 0.05);
  f.storm = MONSOON(nt.m) && r() < 0.15;
  f.wifiOut = wifiLines(st) < 3 && r() < 0.03;
  f.festival = null;
  if (nt.m === 10 && nt.d >= 12 && nt.d <= 18) f.festival = { name: 'Shillong Cherry Blossom Festival', mult: 1.6 };
  if (nt.m === 3 && nt.d >= 10 && nt.d <= 14) f.festival = { name: 'Shad Suk Mynsiem week', mult: 1.25 };
  if (nt.m === 11 && nt.d >= 20) f.festival = { name: 'Christmas in Shillong', mult: 1.35 };
  if (f.festival && f.prevFest !== f.festival.name) log(st, `🌸 ${f.festival.name} is on. Expect more bookings.`, 'good');
  f.prevFest = f.festival ? f.festival.name : null;
  if (f.powerCut) log(st, u.battery != null ? '⚡ Power cut today. The solar battery kept everything running.' : '⚡ Power cut today. Guests are grumbling and the generator costs ₹2,500.', u.battery != null ? 'info' : 'bad');
  if (f.storm) { log(st, '🌧️ Monsoon storm: roof deck closed, bikes stay in.', 'bad'); if (st.supplier === 'local' && !f.farmerDeal && r() < 0.4) news(st, 'The Iewduh market truck couldn\'t make it through the rain. The chef improvised with what was in the store room.'); }
  if (MONSOON(nt.m) && r() < 0.03) { f.roadBlockUntil = st.day + 2; log(st, '⛰️ Landslide on the Guwahati–Shillong road. Fewer arrivals for two days.', 'bad'); news(st, 'A landslide near Nongpoh has traffic backed up for kilometres. Two guests are stuck in Guwahati.'); }
  if (f.wifiOut) log(st, '📶 Wi-Fi outage today. Another line would help.', 'bad');
  if (r() < (activeStaff(st, 'photographer').length ? 0.015 : 0.004)) { st.awareness = clamp(st.awareness + 0.08, 0, 1); log(st, '🔥 A guest reel about Basecamp went viral!', 'good'); }
  if (r() < 0.02) { st.rep = clamp(st.rep - 0.05, 1, 5); log(st, '😤 Someone left an unfair 1★ review online.', 'bad'); }
  if (r() < 0.01 && st.sat.clean < 60) { spend(st, 10000, 'other'); log(st, '🧾 Health inspection found the dorms dirty. Fined ₹10,000.', 'bad'); }
}

function monthEnd(st, r, prevM, nt) {
  const mo = st.month; const profit = mo.revenue - mo.costs; const occPct = mo.possible ? Math.round(100 * mo.nights / mo.possible) : 0;
  st.lastMonth = { ...mo, profit, occPct, label: MONTHS[prevM] };
  log(st, `📊 ${MONTHS[prevM]} report: revenue ₹${fmt(mo.revenue)}, costs ₹${fmt(mo.costs)}, ${profit >= 0 ? 'profit' : 'loss'} ₹${fmt(Math.abs(profit))}, occupancy ${occPct}%.`, profit >= 0 ? 'good' : 'bad');
  if (profit > 0 && !st.achievements.profitMonth) { st.achievements.profitMonth = st.day; log(st, '🏆 First profitable month!', 'good'); }
  st.month = blankMonth(nt.m);
  if (nt.m === 10) { spend(st, 60000, 'running'); log(st, '🎨 Yearly anti-rust repaint of the containers: ₹60,000.'); }
  if (nt.m === 3) { spend(st, 12000, 'running'); log(st, '🧾 Trade licence and FSSAI renewals: ₹12,000.'); }
  for (const c of [...st.hosting.customers]) if (r() < 0.05) { st.hosting.customers = st.hosting.customers.filter(x => x !== c); log(st, `🖥️ ${c.name} stopped hosting with you.`); }
  for (const p of st.portfolio) {
    if (p.status !== 'active') continue; const x = r();
    if (x < 0.08) { p.status = 'closed'; log(st, `🪦 ${p.name} shut down. It happens.`, 'bad'); }
    else if (x < 0.11) raiseRound(st, p, r, 'their own fundraising');
    else if (p.valuation > 50000000 && x < 0.125) { const pay = Math.round(p.valuation * p.stake / 100 * 0.8); p.status = 'exited'; earn(st, pay, 'exits'); log(st, `🚀 ${p.name} got acquired! Your stake paid out ₹${fmt(pay)}.`, 'good'); if (!st.achievements.exit) { st.achievements.exit = st.day; log(st, '🏆 First startup exit!', 'good'); } }
  }
}

export const sumObj = (o) => Object.values(o).reduce((a, b) => a + b, 0);
export function fmt(n) { return Math.round(n).toLocaleString('en-IN'); }
export function fmtL(n) { if (Math.abs(n) >= 10000000) return (n / 10000000).toFixed(2) + ' Cr'; if (Math.abs(n) >= 100000) return (n / 100000).toFixed(1) + ' L'; return fmt(n); }
export const ACHIEVEMENTS = [
  ['firstGuest', 'First guest'], ['five', 'First 5★ review'], ['fullHouse', 'Full house (30/30)'], ['profitMonth', 'First profitable month'], ['friend', 'Make a real friend'],
  ['rep45', '4.5★ reputation'], ['tenL', '₹10 lakh in the bank'], ['host5', '5 hosting customers'], ['incub3', 'Incubate 3 startups'], ['exit', 'First startup exit'],
];
