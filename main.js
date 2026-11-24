import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import * as E from './econ.js';
import { smallTalk, TRAITS, STAGES } from './people.js';
import * as W from './render.js';
import { buildNav, loadNavData, serializeNav, navKey } from './nav.js';
let NAV = null; // walkable-ground grid, built once the model is in
const { renderer, labelRenderer, scene, camera, controls, P, toFt, groups, pickables } = W;

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = Math.random;
const SAVE_KEY = 'basecampSim.v2';
const fmt = E.fmt, fmtL = E.fmtL;
const money = (n) => (n < 0 ? '−₹' : '₹') + fmtL(Math.abs(n));
if ('ontouchstart' in window) document.body.classList.add('touch');

// ============================================================ walk graph (feet) for NPCs
const N = {
  gate: [49, 1, 0.15], g12: [49, 12, 0.15], g24: [49, 24, 0.15], g40: [49, 40, 0.15], g48: [49, 48, 0.15], g56: [49, 56, 0.15], g67: [49, 67, 0.15], g78: [49, 78, 0.15], g94: [49, 94, 0.15], g100: [49, 100.5, 0.15], g114: [49, 114, 0.15],
  apron: [26, 6, 0.12], park: [26, 22, 0.15], fw: [3, 6, 0.12], wg1: [3, 48, 0.35], wg2: [3, 78, 0.35], wg3: [3, 108, 0.35],
  recDoor: [45.5, 40, 1.85], rec: [36, 40, 1.85], chefDoor: [26.4, 38.3, 1.85], chefR: [18, 40, 1.85],
  meetDoor: [45.5, 48, 1.85], meet: [37, 48, 1.85], dinDoor: [45.5, 56, 1.85], din: [26, 56, 1.85], kitDoor: [25, 51.7, 1.85], kit: [16, 48, 1.85],
  dinCourt: [26, 61, 1.1], court: [24, 66, 0.5], courtE: [44, 67, 0.5], courtCow: [26, 73.2, 1.1], cow: [26, 82, 1.85], cowDoor: [45.5, 78, 1.85],
  wcDoor: [45.5, 94, 1.85], wc: [36, 92, 1.85], lauDoor: [45.5, 100.5, 1.85], lau: [36, 101.5, 1.85], pavE: [44, 114, 0.4], pav: [26, 114, 0.4],
  ep0: [54, 5, 0.15], ep1: [54, 24, 0.15], ep2: [54, 44, 0.15], sb: [54.4, 46.6, 0.15], ep3: [56.9, 50, 0.15], ep4: [56.9, 76, 0.15], ep5: [56.9, 100.3, 0.15],
  cafeDeck: [63, 22, 1.2], cafeIn: [73.5, 24, 1.85], bike: [63, 47, 0.15], yoga: [61, 75, 0.8], actDeck: [68, 76, 1.2], actIn: [74, 76, 1.85], gard: [66, 100.3, 0.15],
  st1: [54.4, 61.6, 11], l1: [54.3, 63.2, 11], st2a: [54.4, 65.2, 11], st2b: [54.4, 79, 20.8], ug16: [48, 16, 11], ug24: [48, 24, 11], ug31: [48, 30.5, 11], ug47: [48, 46.5, 11], ug63: [48, 63.2, 11], ug77: [48, 76.5, 11], ug93: [48, 92.5, 11], ug109: [48, 108.5, 11],
  f1Door: [44.5, 15, 11.35], f1: [30, 16, 11.35], f2Door: [44.5, 23, 11.35], f2: [30, 24, 11.35],
  dEdoor: [44.5, 30.5, 11.35], dE: [22, 36, 11.35], dDdoor: [44.5, 46.5, 11.35], dD: [22, 52, 11.35], dAdoor: [44.5, 76.5, 11.35], dA: [22, 82, 11.35],
  dBdoor: [44.5, 92.5, 11.35], dB: [22, 98, 11.35], dCdoor: [44.5, 108.5, 11.35], dC: [22, 114, 11.35],
  wbE: [4, 36, 11], wbD: [4, 52, 11], wbA: [4, 82, 11], wbB: [4, 98, 11], wbC: [4, 114, 11],
  l2: [54.3, 81, 20.8], bridge: [49, 81, 20.8], roofIn: [43, 81, 20.9], roof: [26, 100, 20.9],
};
const EDGES = [['gate', 'g12'], ['g12', 'g24'], ['g24', 'g40'], ['g40', 'g48'], ['g48', 'g56'], ['g56', 'g67'], ['g67', 'g78'], ['g78', 'g94'], ['g94', 'g100'], ['g100', 'g114'],
  ['gate', 'apron'], ['apron', 'park'], ['apron', 'fw'], ['fw', 'wg1'], ['wg1', 'wg2'], ['wg2', 'wg3'],
  ['g40', 'recDoor'], ['recDoor', 'rec'], ['rec', 'chefDoor'], ['chefDoor', 'chefR'], ['g48', 'meetDoor'], ['meetDoor', 'meet'], ['g56', 'dinDoor'], ['dinDoor', 'din'], ['din', 'kitDoor'], ['kitDoor', 'kit'],
  ['din', 'dinCourt'], ['dinCourt', 'court'], ['g67', 'courtE'], ['courtE', 'court'], ['court', 'courtCow'], ['courtCow', 'cow'], ['g78', 'cowDoor'], ['cowDoor', 'cow'],
  ['g94', 'wcDoor'], ['wcDoor', 'wc'], ['g100', 'lauDoor'], ['lauDoor', 'lau'], ['g114', 'pavE'], ['pavE', 'pav'],
  ['gate', 'ep0'], ['ep0', 'ep1'], ['ep1', 'ep2'], ['ep2', 'sb'], ['ep2', 'g48'], ['ep2', 'ep3'], ['ep3', 'ep4'], ['ep4', 'ep5'], ['ep1', 'cafeDeck'], ['cafeDeck', 'cafeIn'], ['ep2', 'bike'],
  ['ep4', 'yoga'], ['yoga', 'actDeck'], ['actDeck', 'actIn'], ['ep5', 'gard'],
  ['sb', 'st1'], ['st1', 'l1'], ['l1', 'ug63'], ['ug63', 'ug47'], ['ug47', 'ug31'], ['ug31', 'ug24'], ['ug24', 'ug16'], ['ug63', 'ug77'], ['ug77', 'ug93'], ['ug93', 'ug109'],
  ['ug16', 'f1Door'], ['f1Door', 'f1'], ['ug24', 'f2Door'], ['f2Door', 'f2'], ['ug31', 'dEdoor'], ['dEdoor', 'dE'], ['ug47', 'dDdoor'], ['dDdoor', 'dD'],
  ['ug77', 'dAdoor'], ['dAdoor', 'dA'], ['ug93', 'dBdoor'], ['dBdoor', 'dB'], ['ug109', 'dCdoor'], ['dCdoor', 'dC'],
  ['dE', 'wbE'], ['dD', 'wbD'], ['dA', 'wbA'], ['dB', 'wbB'], ['dC', 'wbC'], ['wbE', 'wbD'], ['wbD', 'wbA'], ['wbA', 'wbB'], ['wbB', 'wbC'],
  ['l1', 'st2a'], ['st2a', 'st2b'], ['st2b', 'l2'], ['l2', 'bridge'], ['bridge', 'roofIn'], ['roofIn', 'roof']];
const NV = Object.fromEntries(Object.entries(N).map(([k, v]) => [k, P(v[0], v[1], v[2])]));
const ADJ = {}; for (const k in N) ADJ[k] = [];
for (const [a, b] of EDGES) { const w = NV[a].distanceTo(NV[b]); ADJ[a].push([b, w]); ADJ[b].push([a, w]); }
const pathCache = new Map();
function route(a, b) {
  const key = a + '>' + b; if (pathCache.has(key)) return pathCache.get(key);
  const dist = { [a]: 0 }, prev = {}, done = new Set(); const q = [a];
  while (q.length) { q.sort((x, y) => dist[x] - dist[y]); const u = q.shift(); if (done.has(u)) continue; done.add(u); if (u === b) break; for (const [v, w] of ADJ[u]) { const d = dist[u] + w; if (dist[v] == null || d < dist[v]) { dist[v] = d; prev[v] = u; q.push(v); } } }
  const out = []; let c = b; if (c !== a && prev[c] == null) return [b];
  while (c != null) { out.unshift(c); c = prev[c]; } pathCache.set(key, out); return out;
}
function nearestNode(v) { let best = 'gate', bd = 1e9; for (const k in NV) { const d = NV[k].distanceTo(v); if (d < bd) { bd = d; best = k; } } return best; }
const DEST = {
  reception: ['rec', [29, 44, 37.5, 42.5, 1.85]], chefroom: ['chefR', [13, 24, 37, 43, 1.85]], kitchen: ['kit', [10, 26, 47, 50, 1.85]], meeting: ['meet', [30, 44, 45.5, 50.5, 1.85]],
  dining: ['din', [8, 44, 53.5, 59, 1.85]], courtyard: ['court', [9, 40, 61.5, 72, 0.5]], cowork: ['cow', [9, 44, 75.5, 89, 1.85]], wcs: ['wc', [28, 44, 91, 93, 1.85]],
  laundry: ['lau', [27, 45, 99, 103, 1.85]], pavilion: ['pav', [9, 44, 107, 121, 0.4]], parking: ['park', [37, 45, 14, 32, 0.15]], cafe: ['cafeIn', [71, 74.5, 6, 42, 1.85]],
  cafedeck: ['cafeDeck', [58, 69, 6, 42, 1.2]], bikes: ['bike', [57, 69, 45, 48.5, 0.15]], activity: ['actIn', [71, 77, 60, 92, 1.85]], yoga: ['yoga', [58, 64, 59, 91, 0.8]],
  garden: ['gard', [58, 77, 99, 102, 0.15]], westgarden: ['wg2', [1, 5, 72, 86, 0.35]], roof: ['roof', [8, 44, 76, 120, 20.9]], gate: ['gate', [47, 51, 0, 2, 0.15]],
  f1: ['f1', [16, 44, 13, 19, 11.35]], f2: ['f2', [16, 44, 21, 27, 11.35]], frontdesk: ['rec', [31, 36, 41.5, 42.8, 1.85]],
};
const DORM_NODE = { A: 'dA', B: 'dB', C: 'dC', D: 'dD', E: 'dE' }, DORM_YB = { A: 74, B: 90, C: 106, D: 44, E: 28 }, WB_NODE = { A: 'wbA', B: 'wbB', C: 'wbC', D: 'wbD', E: 'wbE' };
const inBoxRaw = (b) => P(b[0] + rnd() * (b[1] - b[0]), b[2] + rnd() * (b[3] - b[2]), b[4]);
const _cp = new THREE.Vector3(), _down = new THREE.Vector3(0, -1, 0), _hit = {}, _ray = new THREE.Raycaster(); _ray.firstHitOnly = true;
function standable(p) { // nothing within 0.23 m of a person's body at this spot
  const bvh = W.collider && W.collider.geometry.boundsTree; if (!bvh) return true;
  let y = p.y; _ray.set(_cp.set(p.x, p.y + 0.9, p.z), _down); _ray.far = 1.6; const fl = _ray.intersectObject(W.collider, false)[0]; if (fl && fl.point.y < p.y + 0.5) y = fl.point.y; // stand on whatever floor is there
  for (const h of [0.4, 0.95, 1.55]) { _cp.set(p.x, y + h, p.z); const r = bvh.closestPointToPoint(_cp, _hit, 0, 0.23); if (r && r.distance < 0.23) return false; }
  return true;
}
function clearWalk(a, b) { // a straight walk from a to b doesn't go through walls or furniture (door leaves don't count, they open)
  if (!W.collider) return true;
  const d = b.clone().sub(a); const len = Math.hypot(d.x, d.z); if (len < 0.05) return true; d.y = 0; d.normalize();
  for (const h of [0.4, 1.2]) for (const side of [-0.22, 0, 0.22]) {
    const o = new THREE.Vector3(a.x - d.z * side, Math.max(a.y, b.y) + h, a.z + d.x * side);
    _ray.set(o, d); _ray.far = len; const hit = _ray.intersectObject(W.collider, false)[0]; if (hit) return false;
  }
  return true;
}
function pickSpot(from, sample, tries = 16) { for (let i = 0; i < tries; i++) { const p = sample(); if (standable(p) && (!from || clearWalk(from, p))) return p; } return null; }
const inBox = (b, from) => navSpot(b, from) || pickSpot(from, () => inBoxRaw(b)) || (from ? from.clone() : inBoxRaw(b));
function navSpot(b, from) { // b in feet: [x0, x1, y0, y1, floor z]
  if (!NAV) return null; const FT = W.FT; const k0 = from ? NAV.nearest(from, 2.5) : -1;
  const k = NAV.randomIn([b[0] * FT, b[1] * FT, -b[3] * FT, -b[2] * FT], b[4] * FT, k0, rnd); return k >= 0 ? NAV.pos(k) : null;
}
function bedPoint(bed) { const d = E.dormOfBed(bed), yb = DORM_YB[d]; const bunk = Math.floor((bed % 6) / 2); return P([10.8, 19.3, 27.8][bunk] + (bed % 2 ? 1.2 : -1.2), yb + 11.3, 11.35); }

// ============================================================ NPCs
const FEMALE = new Set(['Daphisha', 'Iohbha', 'Larisa', 'Pynshngain', 'Pallavi', 'Rimpi', 'Neisa', 'Atono', 'Ananya', 'Meera', 'Nisha', 'Tara', 'Zoya', 'Riya', 'Aditi', 'Esha', 'Sana', 'Trisha', 'Debolina', 'Lakshmi', 'Neethu', 'Lena', 'Mia', 'Yuki', 'Ivy', 'Sara']);
const agentLayer = new THREE.Group(); scene.add(agentLayer);
const agents = new Map();
class Agent {
  constructor(key, kind, info) {
    this.key = key; this.kind = kind; this.info = info || {};
    const list = W.SHIRTS[kind] || W.SHIRTS.visitor; const seed = (info.look || Math.floor(rnd() * 1e6)) + 1;
    const shirt = kind === 'staff' ? '#ecebe4' : list[seed % list.length];
    this.p = W.makePerson({ shirt, seed, apron: ['chef', 'gardener'].includes(info.role), role: info.role, kind, female: FEMALE.has(info.first || (info.name || '').split(' ')[0]) });
    this.obj = this.p.group; this.obj.userData.agent = this; this.obj.traverse(o => { o.userData.agent = this; });
    agentLayer.add(this.obj);
    const b = document.createElement('div'); b.className = 'bang'; b.innerHTML = '<span>!</span>'; this.bangEl = b;
    const bo = new CSS2DObject(b); bo.position.set(0, 2.1, 0); this.obj.add(bo); this.bangObj = bo; bo.visible = false;
    const t = document.createElement('div'); t.className = 'tagname'; t.textContent = info.short || info.name || ''; this.tagEl = t;
    const to = new CSS2DObject(t); to.position.set(0, 1.92, 0); this.obj.add(to); this.tagObj = to; to.visible = false; this.showTag = false; this.hasConcern = false;
    this.node = 'gate'; this.path = []; this.away = false; this.idleT = 0; this.dest = null; this.after = null; this.phase = rnd() * 6; this.frozen = false;
    this.obj.position.copy(NV.gate);
  }
  goto(destName, opts = {}) {
    let node, point;
    if (destName === 'bed') { node = DORM_NODE[E.dormOfBed(this.info.bed)]; point = bedPoint(this.info.bed); }
    else if (destName === 'dorm') { const d = this.info.dorm; node = DORM_NODE[d]; point = navSpot([8, 32, DORM_YB[d] + 1, DORM_YB[d] + 10, 11.35], NV[node]) || pickSpot(NV[node], () => P(8 + rnd() * 24, DORM_YB[d] + 1 + rnd() * 9, 11.35)) || NV[node].clone(); }
    else if (destName === 'westbalc') { const d = this.info.bed != null ? E.dormOfBed(this.info.bed) : 'A'; node = WB_NODE[d]; point = navSpot([0.5, 5.5, DORM_YB[d] + 2, DORM_YB[d] + 14, 11], NV[node]) || pickSpot(NV[node], () => P(3 + rnd() * 2, DORM_YB[d] + 2 + rnd() * 12, 11)) || NV[node].clone(); }
    else if (destName === 'out') { node = 'gate'; point = NV.gate.clone(); this.goingOut = true; }
    else { const D = DEST[destName] || DEST.courtyard; node = D[0]; point = inBox(D[1], NV[node]); }
    if (this.away) { this.away = false; this.obj.visible = true; this.obj.position.copy(NV.gate); this.node = 'gate'; this.path = []; this.pathNames = []; }
    if (NAV) { // real walkways: A* over the walkable grid, so nobody cuts through walls, glass or furniture
      const pts = NAV.route(this.obj.position, point);
      if (pts) { if (!pts.length) pts.push(point.clone()); this.path = pts; this.pathNames = pts.map(() => null); this.node = node; this.dest = destName; this.after = opts.after || null; this.onArrive = opts.onArrive || null; return; }
    }
    // if already walking, carry on to the next waypoint first so nobody cuts through walls or air
    const start = (this.path.length && this.pathNames && this.pathNames[0]) ? this.pathNames[0] : this.node;
    const nodes = route(start, node);
    this.path = nodes.map(n => NV[n].clone()); this.pathNames = nodes.slice(); this.path.push(point); this.pathNames.push(null);
    this.node = node; this.dest = destName; this.after = opts.after || null; this.onArrive = opts.onArrive || null;
  }
  update(dt, speed) {
    if (this.away) return;
    let moving = false;
    if (!this.frozen && speed > 0) {
      if (this.path.length) {
        const tgt = this.path[0]; const p = this.obj.position; const d = tgt.clone().sub(p); const dist = d.length();
        const v = Math.min(7, 1.4 * Math.max(1, Math.sqrt(speed) * 1.3)) * dt;
        // someone right in front? wait for them (in a tight spot only one of a facing pair waits), then carry on
        const blk = blockedBy(this, d, dist);
        if (blk && (this._wait = (this._wait || 0) + dt * Math.max(1, speed)) < 3) { W.animatePerson(this.p, false, this.phase, dt); return; }
        if (!blk) this._wait = 0;
        if (dist <= v) { p.copy(tgt); this.path.shift(); if (this.pathNames) this.pathNames.shift(); if (!this.path.length) this.arrived(); }
        else { d.multiplyScalar(v / dist); p.add(d); const yaw = Math.atan2(d.x, d.z); this.obj.rotation.y += (((yaw - this.obj.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * Math.min(1, dt * 10); moving = true; this.phase += v * 5.5; }
      } else {
        this.idleT -= dt * speed;
        if (this.idleT < 0 && this.dest && !['bed', 'out'].includes(this.dest) && DEST[this.dest]) { this.idleT = 8 + rnd() * 12; const tgt = inBox(DEST[this.dest][1], this.obj.position); const pts = NAV && NAV.route(this.obj.position, tgt); this.path = pts && pts.length ? pts : [tgt]; this.pathNames = this.path.map(() => null); }
      }
    }
    W.animatePerson(this.p, moving, this.phase, dt);
  }
  arrived() {
    if (this.goingOut) { this.goingOut = false; this.away = true; this.obj.visible = false; this.node = 'gate'; }
    if (this.onArrive) { const f = this.onArrive; this.onArrive = null; f(this); }
    if (this.after) { const a = this.after; this.after = null; this.goto(a); }
    this.idleT = 4 + rnd() * 8;
  }
  remove() { this.obj.traverse(o => { if (o.element) o.element.remove(); }); agentLayer.remove(this.obj); agents.delete(this.key); }
}
const wpick = (list) => { const tot = list.reduce((a, [, w]) => a + w, 0); let x = rnd() * tot; for (const [k, w] of list) if ((x -= w) <= 0) return k; return list[0][0]; };
function guestPlan(a, h) {
  const storm = st.flags.storm; const ev = st.events.scheduled && st.events.scheduled.day === st.day;
  if (a.kind === 'monthly') {
    if (h >= 23 || h < 7) return 'bed'; if (h < 9) return 'dining';
    if (h < 13) return wpick([['cowork', 7], ['meeting', 1], ['cafe', 1.5]]); if (h < 14) return 'dining';
    if (h < 19) return wpick([['cowork', 6], ['activity', 1], ['cafe', 1.5], ['courtyard', 1.5], ['pavilion', 1]]);
    if (h < 21) return ev && h >= 18 ? 'activity' : wpick([['dining', 3], ['courtyard', 3]]);
    return wpick([['courtyard', 3], ['roof', storm ? 0 : 2], ['westbalc', 2], ['bed', 1]]);
  }
  if (h >= 23 || h < 7) return 'bed';
  if (h < 9) return wpick([['dining', 6], ['yoga', storm ? 0 : 1], ['roof', storm ? 0 : 1]]);
  if (h < 12) return wpick([['out', storm ? 0.5 : 3], ['cafe', 2], ['cafedeck', storm ? 0 : 1.5], ['cowork', 1.5], ['courtyard', 1], ['bikes', storm ? 0 : 0.6], ['garden', 0.5], ['laundry', 0.4]]);
  if (h < 14) return wpick([['dining', 4], ['cafe', 2], ['cafedeck', storm ? 0 : 1.5], ['out', 1.5]]);
  if (h < 18) return wpick([['out', storm ? 0.5 : 3.5], ['cafe', 1.5], ['cowork', 1], ['courtyard', 1], ['westbalc', 1], ['roof', storm ? 0 : 1], ['westgarden', 0.6], ['pavilion', 1]]);
  if (h < 20) return ev && h >= 18 ? wpick([['activity', 3], ['dining', 2]]) : wpick([['dining', 5], ['courtyard', 3]]);
  return wpick([['courtyard', 3], ['roof', storm ? 0 : 2], ['cafe', 1], ['westbalc', 1.5], ['bed', 1.5]]);
}
function staffPlan(a, h) {
  const r = a.info.role;
  if (r === 'chef') return h >= 6 && h < 22 ? (h % 5 === 0 ? 'dining' : 'kitchen') : 'chefroom';
  if (r === 'cleaner') return h >= 9 && h < 17 ? (h % 4 === 0 ? 'laundry' : 'dorm') : 'out';
  if (r === 'reception') return h >= 8 && h < 21 ? 'frontdesk' : 'out';
  if (r === 'community') return h >= 10 && h < 21 ? wpick([['courtyard', 2], ['cowork', 2], ['activity', 1], ['cafe', 1]]) : 'out';
  if (r === 'photographer') return h >= 9 && h < 19 ? wpick([['roof', 2], ['courtyard', 2], ['cafedeck', 2], ['yoga', 1], ['garden', 1], ['westgarden', 1]]) : 'out';
  if (r === 'gardener') return h >= 7 && h < 15 ? wpick([['garden', 4], ['westgarden', 2], ['yoga', 1]]) : 'out';
  if (r === 'techie') return h >= 9 && h < 19 ? wpick([['wcs', 4], ['cowork', 2], ['cafe', 1]]) : 'out';
  if (r === 'laundry') return h >= 8 && h < 17 ? 'laundry' : 'out';
  return 'courtyard';
}
function ownerPlan(a, h) { if (h >= 23 || h < 7) return 'f2'; return wpick([['courtyard', 2], ['cowork', 2], ['cafe', 1.5], ['reception', 1], ['meeting', 1], ['roof', st.flags.storm ? 0 : 1], ['garden', 0.5]]); }
const planFor = (a, h) => a.kind === 'staff' ? staffPlan(a, h) : a.kind === 'owner' ? ownerPlan(a, h) : guestPlan(a, h);

function syncAgents(snap = false) {
  if (!st) return; const want = new Set(); const h = Math.floor(st.minute / 60);
  for (const g of st.guests) {
    if (g.status === 'gone') continue; const key = 'g' + g.id; want.add(key);
    if (!agents.has(key)) {
      const a = new Agent(key, g.type, { name: g.name, short: g.first, bed: g.bed, id: g.id, look: g.look }); agents.set(key, a);
      if (snap) { const plan = guestPlan(a, h); if (plan === 'out') { a.away = true; a.obj.visible = false; } else { a.goto(plan); a.obj.position.copy(a.path[a.path.length - 1]); a.path = []; } }
      else a.goto('reception', { after: 'bed' });
    }
  }
  for (const s of st.staff) {
    if (s.offUntil >= st.day) continue; const key = 's' + s.id; want.add(key);
    if (!agents.has(key)) { const a = new Agent(key, 'staff', { name: s.name, short: s.first, role: s.role, dorm: 'ABCDE'[s.id % 5], look: s.look }); agents.set(key, a); a.goto(staffPlan(a, h)); if (snap && a.path.length) { a.obj.position.copy(a.path[a.path.length - 1]); a.path = []; } }
  }
  want.add('o1'); if (!agents.has('o1')) { const a = new Agent('o1', 'owner', { name: 'Your co-founder', short: 'Co-founder', look: 777 }); agents.set('o1', a); a.goto(ownerPlan(a, h)); if (snap) { a.obj.position.copy(a.path[a.path.length - 1]); a.path = []; } }
  for (const c of st.concerns) if (c.who === 'local') {
    const key = 'l' + c.id; want.add(key);
    if (!agents.has(key)) { const a = new Agent(key, 'local', { name: 'Visitor from town', short: 'Visitor', concern: c.id }); agents.set(key, a); a.goto('frontdesk'); if (snap) { a.obj.position.copy(a.path[a.path.length - 1]); a.path = []; } }
  }
  for (const [k, a] of agents) if (!want.has(k) && !k.startsWith('v') && !a.leaving && k !== 'me') { if (k[0] === 'l') { a.leaving = true; a.goto('out'); a.onArrive = () => a.remove(); } else a.remove(); }
  updateBangs();
}
function updateVehicles() {
  if (!st) return; const h = Math.floor(st.minute / 60); const out = h >= 9 && h < 18;
  const plan = st.rentPlan || { bikes: 0, scooters: 0 };
  for (const g of Object.values(W.vehicles)) { const { type, idx } = g.userData; const n = type === 'Bike' ? plan.bikes : plan.scooters; g.visible = !(out && idx < n); }
}
function updateBangs() {
  const keys = new Set(st.concerns.map(c => c.who === 'local' ? 'l' + c.id : c.who));
  for (const [k, a] of agents) a.hasConcern = keys.has(k);
  const n = st.concerns.length; const b = $('inboxBadge'); b.textContent = n; b.classList.toggle('hidden', !n);
}
function hourlyPlans(h) {
  for (const a of agents.values()) {
    if (a.kind === 'visitor' || a.kind === 'local' || a.frozen) continue;
    setTimeout(() => { if (!agents.has(a.key) || a.leaving || a.frozen) return; const plan = planFor(a, h); if (plan === a.dest && !a.away && plan !== 'out') return; if (a.away && plan === 'out') return; a.goto(plan); }, rnd() * 800 / Math.max(1, speed));
  }
}
let vseq = 0;
function spawnVisitor(dest, stay) { if ([...agents.keys()].filter(k => k[0] === 'v').length > 14) return; const key = 'v' + (vseq++); const a = new Agent(key, 'visitor', { name: 'Visitor' }); agents.set(key, a); a.goto(dest); a.leaveAt = st.day * 24 + Math.floor(st.minute / 60) + stay; }
function visitorsTick(h) {
  for (const [k, a] of agents) if (k[0] === 'v' && a.leaveAt != null && st.day * 24 + h >= a.leaveAt && !a.leaving) { a.leaving = true; a.goto('out'); a.onArrive = () => a.remove(); }
  // visitors only stand in for real customers counted by the business engine
  if (h >= 8 && h <= 19) { const w = st.yesterday ? st.yesterday.walkins : 0; const per = w / 12; const n = Math.floor(per) + (rnd() < per % 1 ? 1 : 0); for (let i = 0; i < n; i++) spawnVisitor(rnd() < 0.6 ? 'cafe' : 'cafedeck', 1 + Math.floor(rnd() * 2)); }
  if (h === 9) { const d = st.yesterday ? st.yesterday.deskUsers : 0; for (let i = 0; i < Math.min(5, d); i++) spawnVisitor('cowork', 8); }
  if (h === 11 && st.yesterday && st.yesterday.laundryKg > 10) spawnVisitor('laundry', 1);
}

// ============================================================ labels on the building
const dormLabels = {}, dormObjs = {};
for (const d of E.DORMS) { const el = document.createElement('div'); el.className = 'pill'; const o = new CSS2DObject(el); o.position.copy(P(20, d.yb + 8, 24)); scene.add(o); dormLabels[d.id] = el; dormObjs[d.id] = o; }
const eventEl = document.createElement('div'); eventEl.className = 'pill event'; const evL = new CSS2DObject(eventEl); evL.position.copy(P(74, 76, 14)); scene.add(evL);
function updateLabels() {
  for (const d of E.DORMS) { const base = E.DORMS.indexOf(d) * 6; let n = 0; for (let b = base; b < base + 6; b++) if (st.beds[b]) n++; const el = dormLabels[d.id]; el.textContent = `${d.name} · ${n}/6`; el.className = 'pill' + (n === 6 ? ' full' : ''); dormObjs[d.id].visible = !(walking || cut === 'ground'); }
  const ev = st.events.scheduled; evL.visible = !!ev && !walking; if (ev) eventEl.textContent = `${E.EVENTS[ev.type].label} · ${ev.day === st.day ? 'tonight' : 'tomorrow'} 6 pm`;
}

// ============================================================ cutaway + manager cameras
let cut = 'full';
function setCut(c) { cut = c; groups.roof.visible = c === 'full'; groups.upper.visible = c !== 'ground'; groups.groof.visible = c !== 'ground'; document.querySelectorAll('#cutaway button').forEach(b => b.classList.toggle('on', b.dataset.c === c)); if (st) updateLabels(); }
const VIEWS = { overview: [P(-75, -70, 150), P(58, 62, 0)], courtyard: [P(-12, 44, 52), P(26, 68, 3)], dorms: [P(-30, 60, 85), P(24, 80, 12)], cafe: [P(95, -12, 34), P(66, 26, 4)] };
let camAnim = null;
function flyTo(v) { const [pos, tgt] = VIEWS[v]; camAnim = { t: 0, p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: tgt }; if ((v === 'dorms' || v === 'courtyard') && cut === 'full') setCut('roofless'); }
function flyToPoint(pt) { const tgt = pt.clone(); const pos = tgt.clone().add(new THREE.Vector3(-9, 11, 9)); camAnim = { t: 0, p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: tgt }; if (pt.y > 3 && cut === 'full') setCut('roofless'); if (pt.y < 3 && pt.y > -1 && toFt(pt).x < 47 && toFt(pt).x > 5 && cut !== 'ground') setCut('ground'); }

// ============================================================ the player (you)
const RAD = 0.28, SEG = 1.0;
const me = { pos: new THREE.Vector3(), vel: new THREE.Vector3(), onGround: false, person: null, phase: 0, yaw: 0 };
let walking = false; const keys = {}; let joy = { x: 0, y: 0 };
const tBox = new THREE.Box3(), tSeg = new THREE.Line3(), tV = new THREE.Vector3(), tV2 = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
let savedCam = null;
function makeMe() {
  if (me.person) { agentLayer.remove(me.person.group); }
  me.person = W.makePerson({ shirt: st.look || '#c8612e', seed: 4242, role: 'owner', female: false });
  const t = document.createElement('div'); t.className = 'tagname me'; t.textContent = st.playerName || 'You'; const to = new CSS2DObject(t); to.position.set(0, 1.95, 0); me.person.group.add(to); me.tag = t; me.tagObj = to; to.visible = false;
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.4, 32), new THREE.MeshBasicMaterial({ color: '#f2b81c', transparent: true, opacity: 0.8, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; me.person.group.add(ring);
  agentLayer.add(me.person.group); me.person.group.visible = false;
}
function startWalking() {
  if (!W.collider || !st) return; walking = true; document.body.classList.add('walking'); $('walkBtn').classList.add('on'); $('walkBtn').textContent = '🗺️ Manager view';
  $('walkHelp').classList.remove('hidden'); hideCard();
  savedCam = { p: camera.position.clone(), t: controls.target.clone(), cut };
  if (!me.placed) { me.pos.copy(P(49, 10, 0)).add(new THREE.Vector3(0, RAD + 0.2, 0)); me.yaw = Math.PI; me.placed = true; }
  me.person.group.visible = true; me.tagObj.visible = true; me.vel.set(0, 0, 0);
  controls.minDistance = 2.2; controls.maxDistance = 16; controls.maxPolarAngle = 1.48; controls.enablePan = false;
  const feet = me.pos.clone().sub(new THREE.Vector3(0, RAD, 0)); controls.target.copy(feet).add(new THREE.Vector3(0, 1.4, 0));
  camera.position.copy(controls.target).add(new THREE.Vector3(Math.sin(me.yaw) * -5, 2.6, Math.cos(me.yaw) * -5).multiplyScalar(-1));
  camera.position.copy(controls.target).add(new THREE.Vector3(0, 2.8, 6));
  updateLabels(); toast(`You're walking around Basecamp. People with a yellow ! want to talk to you.`, 'good');
}
function stopWalking() {
  walking = false; document.body.classList.remove('walking'); $('walkBtn').classList.remove('on'); $('walkBtn').textContent = '🚶 Walk as you';
  $('walkHelp').classList.add('hidden'); $('prompt').classList.add('hidden'); closeDialogue();
  me.person.group.visible = false; me.tagObj.visible = false; for (const a of agents.values()) a.showTag = false;
  controls.minDistance = 6; controls.maxDistance = 150; controls.maxPolarAngle = Math.PI / 2.08; controls.enablePan = true;
  if (savedCam) { camAnim = { t: 0, p0: camera.position.clone(), t0: controls.target.clone(), p1: savedCam.p, t1: savedCam.t }; setCut(savedCam.cut); }
  groups.base.visible = true; updateLabels();
}
function collide(dt) {
  const bvh = W.collider.geometry.boundsTree;
  tSeg.start.copy(me.pos); tSeg.end.copy(me.pos).addScaledVector(up, SEG);
  tBox.makeEmpty(); tBox.expandByPoint(tSeg.start); tBox.expandByPoint(tSeg.end); tBox.min.addScalar(-RAD); tBox.max.addScalar(RAD);
  bvh.shapecast({
    intersectsBounds: (box) => box.intersectsBox(tBox),
    intersectsTriangle: (tri) => { const tp = tV, cp = tV2; const d = tri.closestPointToSegment(tSeg, tp, cp); if (d < RAD) { const depth = RAD - d; const dir = cp.sub(tp).normalize(); tSeg.start.addScaledVector(dir, depth); tSeg.end.addScaledVector(dir, depth); } },
  });
  W.collideDoors(tSeg, RAD);
  for (const a of agents.values()) { if (a.away) continue; const p = a.obj.position; const dy = tSeg.start.y - p.y; if (dy < -0.3 || dy > 2) continue;
    const dx = tSeg.start.x - p.x, dz = tSeg.start.z - p.z; const d = Math.hypot(dx, dz); const min = RAD + BODY;
    if (d < min && d > 1e-4) { const k = (min - d) / d; tSeg.start.x += dx * k; tSeg.start.z += dz * k; tSeg.end.x += dx * k; tSeg.end.z += dz * k; } }
  const delta = tV.subVectors(tSeg.start, me.pos);
  me.onGround = delta.y > Math.abs(dt * me.vel.y * 0.25);
  const off = Math.max(0, delta.length() - 1e-5); delta.normalize().multiplyScalar(off); me.pos.add(delta);
  if (!me.onGround) { delta.normalize(); me.vel.addScaledVector(delta, -delta.dot(me.vel)); } else me.vel.set(0, 0, 0);
  if (me.pos.y - RAD < -0.12) { me.pos.y = -0.12 + RAD; me.vel.set(0, 0, 0); me.onGround = true; }
  const hz = Math.hypot(me.pos.x - 12, me.pos.z + 19); if (hz > 110) me.pos.set(12 + (me.pos.x - 12) * 110 / hz, me.pos.y, -19 + (me.pos.z + 19) * 110 / hz);
}
function stepMe(dt) {
  if (dlgOpen) { W.animatePerson(me.person, false, me.phase, dt); return; }
  const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize(); const right = new THREE.Vector3().crossVectors(fwd, up);
  let ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x;
  let iz = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) + joy.y;
  const len = Math.hypot(ix, iz); const run = keys.ShiftLeft || keys.ShiftRight || len > 1.4;
  const mv = new THREE.Vector3(); if (len > 0.05) { mv.addScaledVector(fwd, iz).addScaledVector(right, ix).normalize().multiplyScalar((run ? 4.2 : 2.1) * Math.min(1, len)); }
  const before = me.pos.clone();
  const steps = 5; const sdt = dt / steps;
  for (let i = 0; i < steps; i++) { me.vel.y += -14 * sdt; me.pos.addScaledVector(me.vel, sdt); me.pos.addScaledVector(mv, sdt); collide(sdt); }
  const moved = me.pos.clone().sub(before);
  camera.position.add(moved); controls.target.add(moved);
  const feet = me.pos.clone().sub(new THREE.Vector3(0, RAD, 0));
  me.person.group.position.copy(feet);
  if (mv.lengthSq() > 0.01) { const yaw = Math.atan2(mv.x, mv.z); me.yaw += (((yaw - me.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * Math.min(1, dt * 12); me.phase += mv.length() * dt * 2.6; }
  me.person.group.rotation.y = me.yaw;
  W.animatePerson(me.person, mv.lengthSq() > 0.01, me.phase, dt);
  // Sims-style cutaway around you
  const f = toFt(feet); const inMain = f.x > 4 && f.x < 47 && f.y > 9 && f.y < 124;
  if (feet.y < 2.8) { groups.roof.visible = false; groups.upper.visible = !inMain; groups.groof.visible = !inMain; }
  else if (feet.y < 6) { groups.roof.visible = false; groups.upper.visible = true; groups.groof.visible = true; }
  else { groups.roof.visible = true; groups.upper.visible = true; groups.groof.visible = true; }
  // who's near?
  let best = null, bd = 2.6;
  for (const a of agents.values()) {
    if (a.away || !a.obj.visible) { a.showTag = false; continue; }
    const d = a.obj.position.distanceTo(feet); a.showTag = d < 9;
    if (d < bd && Math.abs(a.obj.position.y - feet.y) < 1.2) { bd = d; best = a; }
  }
  nearAgent = best;
  nearDoor = null; let dd = 1.9;
  for (const d of W.doors) { const dx = d.center.x - feet.x, dz = d.center.z - feet.z; const h = Math.hypot(dx, dz); if (h < dd && Math.abs(d.center.y - 1.2 - feet.y) < 1.4) { dd = h; nearDoor = d; } }
  const pr = $('prompt');
  if (best && !dlgOpen && !(nearDoor && dd < bd - 0.6)) { nearDoor = null; pr.innerHTML = `<kbd>E</kbd>Talk to ${best.info.short || best.info.name}${best.hasConcern ? ' <b style="color:#f2b81c">(wants to talk)</b>' : ''}`; pr.classList.remove('hidden'); $('talkBtn').textContent = 'Talk'; }
  else if (nearDoor && !dlgOpen) { nearAgent = null; const open = nearDoor.want > 0; pr.innerHTML = `<kbd>E</kbd>${open ? 'Close' : 'Open'} the door`; pr.classList.remove('hidden'); $('talkBtn').textContent = open ? 'Close' : 'Open'; }
  else pr.classList.add('hidden');
}
let nearAgent = null, nearDoor = null;
// ------------------------------------------------------------ people keep their distance
// Everyone has a 0.26 m body: overlapping people ease apart, people walking head-on both bear right to pass,
// and nobody is ever pushed off walkable ground. You (the player) are solid to them and they are solid to you.
const BODY = 0.26;
function blockedBy(a, dir, dist) {
  if (dist < 1e-3) return null; const p = a.obj.position; const dx = dir.x / dist, dz = dir.z / dist;
  for (const b of agents.values()) {
    if (b === a || b.away) continue; const q = b.obj.position; if (Math.abs(q.y - p.y) > 1.1) continue;
    const rx = q.x - p.x, rz = q.z - p.z; const r = Math.hypot(rx, rz); if (r > 0.62 || r < 0.3) continue; // already brushing: let them ease apart instead of freezing
    if ((rx * dx + rz * dz) / r < 0.45) continue;                    // not in front of me
    if (b.path.length) { const t = b.path[0]; const bx = t.x - q.x, bz = t.z - q.z; const bl = Math.hypot(bx, bz) || 1;
      if ((bx * dx + bz * dz) / bl < -0.3 && a.key < b.key) continue; } // head-on: the one with right of way keeps going
    return b;
  }
  if (walking && me.person) { const q = me.person.group.position; const rx = q.x - p.x, rz = q.z - p.z; const r = Math.hypot(rx, rz); if (r < 0.65 && Math.abs(q.y - p.y) < 1.1 && (rx * dx + rz * dz) / r > 0.45) return me; }
  return null;
}
const _off = new THREE.Vector3();
function nudge(a, dx, dz) {
  const p = a.obj.position; _off.set(p.x + dx, p.y, p.z + dz);
  if (NAV) { const k = NAV.nearest(_off, 0.16); if (k < 0 || Math.abs(NAV.Y[k] - p.y) > 0.3) return false; }
  p.x += dx; p.z += dz; return true;
}
function crowd(dt) {
  const list = []; for (const a of agents.values()) if (!a.away && !a.frozen) list.push(a);
  const pl = walking && me.person ? me.person.group.position : null;
  for (let i = 0; i < list.length; i++) {
    const a = list[i], pa = a.obj.position; const movingA = a.path.length > 0;
    for (let j = i + 1; j < list.length; j++) {
      const b = list[j], pb = b.obj.position; if (Math.abs(pa.y - pb.y) > 1.2) continue;
      let dx = pb.x - pa.x, dz = pb.z - pa.z; const d = Math.hypot(dx, dz); const min = BODY * 2;
      if (d < min) { // overlapping: ease apart, the one walking gives way more
        if (d < 1e-4) { dx = Math.random() - 0.5; dz = Math.random() - 0.5; } const n = Math.hypot(dx, dz); dx /= n; dz /= n;
        const push = Math.min(min - d, 0.6 * dt * 4 + 0.02); const movingB = b.path.length > 0; const wa = movingA && !movingB ? 0.8 : !movingA && movingB ? 0.2 : 0.5;
        if (!nudge(a, -dx * push * wa, -dz * push * wa)) nudge(b, dx * push, dz * push); if (!nudge(b, dx * push * (1 - wa), dz * push * (1 - wa))) nudge(a, -dx * push, -dz * push);
      }
      // walking towards each other: both drift to their own right
      if (d < 1.3 && movingA && b.path.length) {
        const ta = a.path[0], tb = b.path[0]; const ax = ta.x - pa.x, az = ta.z - pa.z, bx = tb.x - pb.x, bz = tb.z - pb.z; const la = Math.hypot(ax, az) || 1, lb = Math.hypot(bx, bz) || 1;
        if ((ax * bx + az * bz) / (la * lb) < -0.5 && (ax * (pb.x - pa.x) + az * (pb.z - pa.z)) > 0) { const s = 0.5 * dt * Math.min(3, speed || 1); nudge(a, -az / la * s, ax / la * s); nudge(b, -bz / lb * s, bx / lb * s); }
      }
    }
    if (pl && Math.abs(pa.y - pl.y) < 1.2) { // the player is solid: people step aside
      const dx = pa.x - pl.x, dz = pa.z - pl.z; const d = Math.hypot(dx, dz); const min = BODY + 0.3;
      if (d < min && d > 1e-4) { const push = Math.min(min - d, 0.05); nudge(a, dx / d * push, dz / d * push); }
    }
    // stuck behind someone for a while? find another way round
    if (movingA) { const tgt = a.path[0]; const dd = Math.hypot(tgt.x - pa.x, tgt.z - pa.z);
      if (a._best == null || dd < a._best - 0.05) { a._best = dd; a._stuck = 0; } else if ((a._stuck += dt * Math.max(1, speed || 1)) > 2.5) { a._stuck = 0; a._best = null; const goal = a.path[a.path.length - 1]; const r = NAV && NAV.route(pa, goal); if (r && r.length) { a.path = r; a.pathNames = r.map(() => null); } }
      if (dd < 0.05) a._best = null;
    } else a._best = null;
  }
}
function useDoor(d) { W.setDoor(d, d.want === 0, true); }
// NPCs open doors as they reach them and let them swing shut behind; doors you opened stay open until you close them
function tendDoors(dt) {
  const now = performance.now();
  for (const d of W.doors) {
    let near = false;
    for (const a of agents.values()) { if (a.away) continue; const p = a.obj.position; if (Math.hypot(p.x - d.center.x, p.z - d.center.z) < 1.7 + Math.min(2.5, speed * 0.15) && Math.abs(p.y + 1.2 - d.center.y) < 1.6) { near = true; break; } }
    if (walking && me.person) { const p = me.person.group.position; if (Math.hypot(p.x - d.center.x, p.z - d.center.z) < 1.0 && Math.abs(p.y + 1.2 - d.center.y) < 1.6) near = near || d.want > 0; }
    if (near) { if (d.want === 0) W.setDoor(d, true, false); d.holdUntil = now + 1600; }
    else if (d.want > 0 && !d.byPlayer && now > d.holdUntil) W.setDoor(d, false, false);
  }
  W.updateDoors(dt * Math.max(1, Math.sqrt(speed || 1)));
}
addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  keys[e.code] = true;
  if (walking && e.code === 'KeyE' && !dlgOpen) { if (nearAgent) openDialogue(nearAgent, true); else if (nearDoor) useDoor(nearDoor); }
  if (e.code === 'Escape') { if (dlgOpen) closeDialogue(); else if (walking) stopWalking(); }
  if (e.code === 'Space' && !walking) { setSpeed(speed ? 0 : 1); e.preventDefault(); }
  if (walking && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
{ // touch joystick
  const el = $('joy'), knob = el.querySelector('i'); let id = null, cx = 0, cy = 0;
  el.addEventListener('pointerdown', (e) => { id = e.pointerId; const r = el.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; el.setPointerCapture(id); move(e); });
  const move = (e) => { if (e.pointerId !== id) return; let dx = (e.clientX - cx) / 50, dy = (e.clientY - cy) / 50; const l = Math.hypot(dx, dy); if (l > 1.6) { dx *= 1.6 / l; dy *= 1.6 / l; } joy = { x: dx, y: -dy }; knob.style.transform = `translate(${dx * 30}px,${dy * 30}px)`; };
  el.addEventListener('pointermove', move);
  const end = (e) => { if (e.pointerId !== id) return; id = null; joy = { x: 0, y: 0 }; knob.style.transform = ''; };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  $('talkBtn').onclick = () => { if (dlgOpen) return; if (nearAgent) openDialogue(nearAgent, true); else if (nearDoor) useDoor(nearDoor); };
}

// ============================================================ conversations
let dlgOpen = false, dlgAgent = null, dlgSpeed = 1, dlgInPerson = false;
function personOf(a) { if (!a) return null; if (a.key[0] === 'g' || a.key[0] === 's') return E.personByKey(st, a.key); return null; }
function concernOf(a) { if (a.kind === 'local') return st.concerns.find(c => c.id === a.info.concern); return st.concerns.find(c => c.who === a.key); }
function initials(n) { return n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase(); }
function hearts(rel) { const n = Math.round((rel || 0) / 20); return '♥'.repeat(n) + '♡'.repeat(5 - n); }
function openDialogue(a, inPerson) {
  dlgOpen = true; dlgAgent = a; dlgInPerson = inPerson; dlgSpeed = speed; setSpeed(0);
  a.frozen = true;
  if (inPerson) { const v = me.person.group.position.clone().sub(a.obj.position); a.obj.rotation.y = Math.atan2(v.x, v.z); me.yaw = Math.atan2(-v.x, -v.z); me.person.group.rotation.y = me.yaw; }
  const p = personOf(a); if (p && inPerson) E.chat(st, a.key);
  renderDialogue();
}
function closeDialogue() { if (!dlgOpen) return; dlgOpen = false; if (dlgAgent) dlgAgent.frozen = false; dlgAgent = null; $('dlg').classList.add('hidden'); setSpeed(dlgSpeed || 1); updateBangs(); refreshPanel(); }
function renderDialogue(say, fx, extra) {
  const a = dlgAgent; if (!a) return; const p = personOf(a); const c = concernOf(a);
  const kind = a.kind; const color = { nightly: '#2a9d8f', monthly: '#c8612e', staff: '#2f5d45', owner: '#d39b2a', visitor: '#7f8c8d', local: '#7a6a9a' }[kind] || '#555';
  let name = a.info.name, sub = '', meters = '';
  if (p) {
    if (kind === 'staff') { sub = `${E.ROLES[p.role].label} · from ${p.origin} · ${TRAITS[p.trait]}`; meters = `Morale ${Math.round(p.morale)}/100<br>${hearts(p.rel)}`; }
    else { sub = `${p.origin} · ${p.type === 'monthly' ? `founder of ${p.startup}` : p.job} · ${TRAITS[p.trait]}`; meters = `Mood ${p.mood >= 10 ? '😊' : p.mood <= -10 ? '😠' : '🙂'} · ${Math.max(0, p.nightsLeft)} night(s) left<br>${hearts(p.rel)}`; }
  } else if (kind === 'owner') sub = 'Co-founder, lives in Founder room 2'; else if (kind === 'local') sub = 'Came in from town'; else sub = 'Here for the café, a desk or an event';
  let text = say, opts = '';
  if (!text) {
    if (c) text = E.concernText(st, c);
    else if (p) text = smallTalk(st, p, kind === 'staff' ? 'staff' : p.type, rnd);
    else if (kind === 'owner') text = smallTalk(st, {}, 'owner', rnd);
    else text = rnd() < 0.5 ? 'Lovely place. Is the café open late?' : 'A friend told me about the coffee here. Worth the ride from Laitumkhrah.';
  }
  if (c && !say) {
    opts = E.concernChoices(st, c).map(ch => `<button data-ch="${ch.i}" ${ch.ok ? '' : 'disabled'}>${ch.label}${!ch.ok ? ' (not available yet)' : ''}</button>`).join('');
    opts += `<button data-act="later">Let me think about it</button>`;
  } else {
    const more = [];
    if (p && kind !== 'staff' && p.type === 'nightly') { more.push(['honest', 'How is your stay, honestly?']); if (st.upgrades.guides != null && !p.tourDone) more.push(['tour', 'Want me to book you a guided tour? (₹350 for us)']); }
    if (p && p.type === 'monthly') { more.push(['startup', `How's ${p.startup} going?`]); if (!p.applied && (p.stage || 0) >= 1) more.push(['incubate', 'Have you thought about joining our incubator?']); if (!st.hosting.customers.some(h => h.name === p.startup) && st.hosting.customers.length < st.hosting.slots) more.push(['host', 'Need somewhere to run your servers?']); }
    if (p && kind === 'staff') { if (p.thankDay !== st.day) more.push(['thank', 'Thank them for their work today']); more.push(['help', 'What would make your job easier?']); }
    opts = more.map(([k, l]) => `<button data-act="${k}">${l}</button>`).join('') + `<button data-act="bye">Bye</button>`;
  }
  $('dlg').innerHTML = `<button class="x" data-act="bye">×</button><div class="head"><div class="av" style="background:${color}">${initials(name)}</div><div class="who"><b>${name}</b><div>${sub}</div></div><div class="meters">${meters}</div></div>
    <div class="say">${text}</div>${fx ? `<div class="fx">${fx}</div>` : ''}${extra || ''}<div class="opts">${opts}</div>
    ${!dlgInPerson ? '<div class="muted" style="margin-top:8px">Talking from the office. Walk over in person for a bigger effect.</div>' : ''}`;
  $('dlg').classList.remove('hidden');
  $('dlg').querySelectorAll('[data-ch]').forEach(b => b.onclick = () => choose(c, +b.dataset.ch));
  $('dlg').querySelectorAll('[data-act]').forEach(b => b.onclick = () => dlgAction(b.dataset.act));
}
function snapshot(p) { return { cash: st.cash, mood: p && p.mood, rel: p && p.rel, morale: p && p.morale }; }
function fxText(b, p) {
  const out = []; const dc = Math.round(st.cash - b.cash); if (dc) out.push(`${dc > 0 ? '+' : '−'}₹${fmt(Math.abs(dc))}`);
  if (p) { if (p.mood != null && b.mood != null && Math.round(p.mood - b.mood)) out.push(`Mood ${p.mood - b.mood > 0 ? '+' : ''}${Math.round(p.mood - b.mood)}`); if (b.rel != null && Math.round(p.rel - b.rel)) out.push(`Relationship ${p.rel - b.rel > 0 ? '+' : ''}${Math.round(p.rel - b.rel)}`); if (p.morale != null && b.morale != null && Math.round(p.morale - b.morale)) out.push(`Morale ${p.morale - b.morale > 0 ? '+' : ''}${Math.round(p.morale - b.morale)}`); }
  return out.join(' · ');
}
const REPLY = { good: ['That means a lot. Thank you.', 'Perfect, thank you so much!', 'You\'re the best, honestly.'], meh: ['Okay. Fine.', 'Right. Sure.', 'Hmm, okay.'] };
function choose(c, i) {
  const p = personOf(dlgAgent); const before = snapshot(p);
  const res = E.resolveConcern(st, c.id, i, dlgInPerson);
  if (!res || res.err) { toast(res ? res.err : 'Something went wrong.', 'bad'); return; }
  const fx = fxText(before, p); const good = (p && ((p.mood != null && p.mood > before.mood) || p.rel > before.rel || (p.morale != null && p.morale > before.morale))) || st.cash < before.cash;
  flushLog(); updateBangs(); syncAgents();
  renderDialogue(`${res.say ? res.say + ' ' : ''}"${(good ? REPLY.good : REPLY.meh)[Math.floor(rnd() * 3)]}"`, fx);
}
function dlgAction(k) {
  const a = dlgAgent; const p = personOf(a); const before = snapshot(p);
  if (k === 'bye' || k === 'later') return closeDialogue();
  if (k === 'honest') return renderDialogue(smallTalk(st, { ...p, trait: 'picky' }, 'nightly', rnd));
  if (k === 'tour') { p.tourDone = true; if (rnd() < 0.6 + p.rel / 250) { E.earn(st, 350, 'tours'); p.mood = clamp(p.mood + 6, -40, 40); return renderDialogue('"Yes! Root bridges tomorrow, early start."', fxText(before, p)); } return renderDialogue('"Maybe next time, I\'m saving money for Dawki."'); }
  if (k === 'startup') { const s = STAGES[Math.min(STAGES.length - 1, p.stage || 0)]; p.rel = clamp(p.rel + 2, 0, 100); return renderDialogue(`"${p.startup} is ${s}. ${p.idea[0].toUpperCase() + p.idea.slice(1)}. ${p.stage >= 2 ? 'People are actually paying now!' : 'Still figuring out who needs it most.'}"`, fxText(before, p)); }
  if (k === 'incubate') { if (p.rel >= 45 || rnd() < 0.3) { p.applied = true; st.applications.push({ name: p.startup, founder: p.name, stake: 2 + Math.floor(rnd() * 4), fee: 25000, valuation: Math.round((30 + rnd() * 50 + (p.stage || 0) * 15) * 100000) }); refreshPanel(); return renderDialogue(`"Honestly? I'd love that. I'll send you our deck tonight."`, 'New incubator application'); } return renderDialogue(`"Maybe. I don't know you well enough yet."`); }
  if (k === 'host') { if (rnd() < 0.5 + p.rel / 200) { const e = E.addHosting(st, 'dev', p.startup); flushLog(); return renderDialogue(e ? `"Sounds great, but: ${e}"` : `"A dev box right here? Yes please. Cheaper than AWS."`, e ? '' : `New hosting customer: +₹${fmt(st.hostingPrices.dev)}/month`); } return renderDialogue(`"We're fine on the cloud for now, thanks."`); }
  if (k === 'thank') { p.thankDay = st.day; p.morale = clamp(p.morale + 4, 0, 100); p.rel = clamp(p.rel + 3, 0, 100); return renderDialogue(`"${p.morale > 70 ? 'Thank you, that\'s kind.' : 'Thanks. It\'s been a long week.'}"`, fxText(before, p)); }
  if (k === 'help') {
    const tips = { cleaner: st.occ > st.cleanCap ? 'Honestly, one more cleaner. We can\'t keep up.' : 'Better mops? Kidding. We\'re okay right now.', chef: st.supplier === 'local' && E.MONSOON(E.dateOf(st.day).m) ? 'In the monsoon the market truck doesn\'t always come. A farmer deal or the wholesaler would help.' : st.upgrades.garden == null ? 'Expand the kitchen garden. Fresh greens, cheaper too.' : 'A second chef on busy weekends.', reception: 'A proper check-in system. And more chairs in the lobby.', techie: st.upgrades.battery == null ? 'A battery bank. Every power cut takes the servers down.' : 'More customers! The racks are half empty.', laundry: 'Two more commercial washers and I could take more contracts.' };
    return renderDialogue(`"${tips[p.role] || 'More guests and more events. It\'s more fun when it\'s busy.'}"`);
  }
}

// ============================================================ game loop
let st = null; let speed = 1; let lastHour = null; let saveT = 0;
const MIN_PER_SEC = 12;
function setSpeed(s) { speed = s; document.querySelectorAll('#speed button').forEach(b => b.classList.toggle('on', +b.dataset.s === s)); }
function handleSignals(sig) {
  for (const s of sig) {
    if (s.kind === 'depart') { const a = agents.get('g' + s.id); if (a) { a.leaving = true; a.frozen = false; a.goto('out'); a.onArrive = () => a.remove(); } }
    if (s.kind === 'event') { const h = st.events.history[0]; const n = h ? Math.min(10, Math.round(h.people / 2)) : 0; for (let i = 0; i < n; i++) spawnVisitor('activity', 2 + (rnd() < 0.5 ? 1 : 0)); }
  }
}
function tick(dt) {
  if (!st || st.over || speed === 0) return;
  st.minute += dt * MIN_PER_SEC * speed;
  while (st.minute >= 1440) { st.minute -= 1440; E.dayTick(st); lastHour = -1; onDay(); if (st.over) return gameOver(); }
  const h = Math.floor(st.minute / 60);
  while (lastHour !== h) {
    lastHour = lastHour == null || lastHour >= 23 ? 0 : lastHour + 1;
    const sig = E.hourTick(st, lastHour); syncAgents(); handleSignals(sig); visitorsTick(lastHour); hourlyPlans(lastHour);
    updateVehicles();
    if (['overview', 'inbox', 'people', 'news', 'services'].includes(tab) || lastHour === 0) { const ae = document.activeElement; if (!ae || ae.type !== 'range') refreshPanel(); }
    updateLabels();
  }
}
let lastLogTop = null;
function onDay() { flushLog(); refreshPanel(); save(); }
function flushLog() { const fresh = []; for (const l of st.log) { if (l === lastLogTop) break; fresh.push(l); } lastLogTop = st.log[0]; fresh.reverse().slice(-4).forEach(l => toast(l.msg, l.kind)); }
const clock = new THREE.Clock();
function loop() {
  const raw = clock.getDelta(); const dt = Math.min(raw, 0.1); const gdt = Math.min(raw, 0.5);
  if (camAnim) { camAnim.t = Math.min(1, camAnim.t + dt / 1.4); const e = 1 - Math.pow(1 - camAnim.t, 3); camera.position.lerpVectors(camAnim.p0, camAnim.p1, e); controls.target.lerpVectors(camAnim.t0, camAnim.t1, e); if (camAnim.t >= 1) camAnim = null; }
  if (st) {
    tick(gdt);
    if (walking) stepMe(dt);
    tendDoors(dt);
    crowd(dt);
    const upperHidden = !groups.upper.visible;
    for (const a of agents.values()) { a.update(dt, dlgOpen ? 0 : speed); a.obj.visible = !a.away && !(upperHidden && a.obj.position.y > 3) && !(!groups.roof.visible && a.obj.position.y > 6.2 && walking); a.bangObj.visible = a.obj.visible && a.hasConcern; a.tagObj.visible = a.obj.visible && a.showTag && walking; }
    W.updateSky(st.minute, st.flags, st.upgrades.battery != null); updateHud();
    if (W.rain.visible) W.updateRain(dt);
    saveT += dt; if (saveT > 20) { saveT = 0; save(); }
  }
  if (!st) W.updateDoors(dt);
  controls.update();
  renderer.render(scene, camera); labelRenderer.render(scene, camera);
}

// ============================================================ HUD + panels
let hudT = 0;
function updateHud() {
  const now = performance.now(); if (now - hudT < 150) return; hudT = now;
  $('date').textContent = E.dateLabel(st.day);
  const h = Math.floor(st.minute / 60), m = Math.floor(st.minute % 60); $('time').textContent = `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
  const c = $('cash'); c.textContent = money(st.cash); c.classList.toggle('neg', st.cash < 0);
  $('rep').textContent = `${st.rep.toFixed(2)} ★`; $('beds').textContent = `${E.occupied(st)}/30`; $('aw').textContent = `${Math.round(st.awareness * 100)}%`;
  const f = st.flags; const fl = [];
  if (f.festival) fl.push(`🌸 ${f.festival.name}`); if (f.storm) fl.push('🌧️ Storm'); if (f.powerCut) fl.push(st.upgrades.battery != null ? '⚡ Power cut (on battery)' : '⚡ Power cut'); if (f.wifiOut) fl.push('📶 Wi-Fi down'); if (f.roadBlockUntil >= st.day) fl.push('⛰️ Road blocked');
  const html = fl.map(x => `<div class="chip">${x}</div>`).join(''); if ($('flags').innerHTML !== html) $('flags').innerHTML = html;
}
let tab = 'overview', newsMode = 'people';
function refreshPanel() { if (!st) return; $('tabBody').innerHTML = TABS[tab](); bindTab(); if (tab === 'overview') drawSpark(); }
const pct = (v) => Math.round(v);
const satBar = (l, v) => `<div class="bar"><span>${l}</span><i><em class="${v >= 75 ? '' : v >= 55 ? 'mid' : 'low'}" style="width:${pct(v)}%"></em></i><b>${pct(v)}</b></div>`;
const moodFace = (m) => m >= 10 ? '😊' : m <= -10 ? '😠' : '🙂';
const COSTNAMES = { kitchen: 'Kitchen ingredients', cafe: 'Café ingredients', lpg: 'LPG gas', staff: 'Salaries', utilities: 'Power, water, internet', running: 'Ops, upkeep, insurance, licences', linen: 'Linen & toiletries', commission: 'Booking commissions', gst: 'GST', people: 'Favours & fixes', events: 'Events', marketing: 'Marketing', upgrades: 'Upgrades', other: 'Other', loan: 'Loan EMI' };
const REVNAMES = { beds: 'Nightly beds', monthly: 'Monthly stays', cafe: 'Café', desks: 'Desk passes', rentals: 'Bike + scooter rentals', tours: 'Tour commissions', laundry: 'Laundry', hosting: 'Server hosting', events: 'Events + room hire', exits: 'Startup exits' };
function moneyTable(obj, names) { return `<table class="t">${Object.entries(obj).filter(([, v]) => v).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<tr><td>${names[k] || k}</td><td>₹${fmt(v)}</td></tr>`).join('') || '<tr><td class="muted">Nothing yet</td><td></td></tr>'}</table>`; }

function concernCard(c) {
  const p = E.personByKey(st, c.who);
  return `<div class="concern"><p>${E.concernText(st, c)}</p><div class="opts">${E.concernChoices(st, c).map(ch => `<button data-cid="${c.id}" data-ci="${ch.i}" ${ch.ok ? '' : 'disabled'}>${ch.label}</button>`).join('')}</div>
  <div class="row" style="padding:8px 0 0;border:0"><span class="muted">${c.expires > st.day ? 'Needs an answer by tomorrow' : 'Needs an answer today'}${p ? ` · ${p.first} is somewhere around` : ''}</span><button class="btn sm ghost" data-find="${c.who === 'local' ? 'l' + c.id : c.who}">Find</button></div></div>`;
}
const TABS = {
  overview() {
    E.computeSat(st); const y = st.yesterday; const yP = y ? E.sumObj(y.revenue) - E.sumObj(y.costs) : 0; const mo = st.month; const mP = mo.revenue - mo.costs; const lm = st.lastMonth;
    return `<h3>Right now</h3><div class="kpis">
      <div class="kpi"><small>Beds taken</small><b>${E.occupied(st)} / 30</b></div><div class="kpi"><small>Monthly founders</small><b>${E.monthlyCount(st)} / ${st.monthlyCap}</b></div>
      <div class="kpi"><small>Yesterday</small><b class="${yP >= 0 ? 'pos' : 'neg'}">${money(yP)}</b></div><div class="kpi"><small>This month</small><b class="${mP >= 0 ? 'pos' : 'neg'}">${money(mP)}</b></div>
      <div class="kpi"><small>Needs your answer</small><b>${st.concerns.length}</b></div><div class="kpi"><small>Turned away yesterday</small><b>${y ? y.turnedAway : 0}</b></div></div>
      ${st.concerns.length ? `<p class="muted">People are waiting on you. Check the Inbox, or walk over and talk to them in person.</p>` : ''}
      <h3>Guest happiness</h3>${satBar('Cleanliness', st.sat.clean)}${satBar('Food', st.sat.food)}${satBar('Wi-Fi', st.sat.wifi)}${satBar('Vibe', st.sat.vibe)}${satBar('Comfort', st.sat.comfort)}${satBar('Value', st.sat.value)}
      <p class="muted">Overall ${pct(st.sat.overall)}/100. Each guest's review also depends on how you treated them personally.</p>
      <h3>Cash, last 90 days</h3><canvas class="spark" id="spark"></canvas>
      ${y ? `<h3>Yesterday: money in</h3>${moneyTable(y.revenue, REVNAMES)}<h3>Yesterday: money out</h3>${moneyTable(y.costs, COSTNAMES)}` : ''}
      ${lm ? `<h3>${lm.label} report</h3><div class="kpis"><div class="kpi"><small>Revenue</small><b>${money(lm.revenue)}</b></div><div class="kpi"><small>Profit</small><b class="${lm.profit >= 0 ? 'pos' : 'neg'}">${money(lm.profit)}</b></div><div class="kpi"><small>Occupancy</small><b>${lm.occPct}%</b></div><div class="kpi"><small>Rating</small><b>${st.rep.toFixed(2)} ★</b></div></div>` : ''}
      <h3>Goals</h3><div class="ach">${E.ACHIEVEMENTS.map(([k, l]) => `<span class="${st.achievements[k] != null ? 'got' : ''}">${st.achievements[k] != null ? '✓ ' : ''}${l}</span>`).join('')}</div>`;
  },
  inbox() {
    return `<h3>Waiting on you</h3><p class="muted">Answer here, or walk over and talk to them. Doing it in person earns more trust.</p>${st.concerns.map(concernCard).join('') || '<p class="muted">Nothing right now. Enjoy the mist.</p>'}
    <h3>Incubator applications</h3>${st.applications.length ? `<p class="muted">${st.applications.length} waiting in the Incubator tab.</p>` : '<p class="muted">None.</p>'}`;
  },
  people() {
    const gs = st.guests.filter(g => g.status !== 'gone').sort((a, b) => (b.type === 'monthly') - (a.type === 'monthly'));
    const row = (k, title, sub, right) => `<div class="row"><div class="grow"><b>${title}</b><div class="muted">${sub}</div></div>${right}<button class="btn sm ghost" data-find="${k}">Find</button></div>`;
    return `<h3>Guests (${gs.length})</h3>${gs.map(g => row('g' + g.id, `${g.name}${st.concerns.some(c => c.who === 'g' + g.id) ? ' <span class="tag warn">!</span>' : ''}`, `${g.origin} · ${g.type === 'monthly' ? `<b>${g.startup}</b>, ${STAGES[g.stage || 0]}` : g.job} · Dorm ${E.dormOfBed(g.bed)} · ${Math.max(0, g.nightsLeft)}n left`, `<span title="mood">${moodFace(g.mood)}</span><span class="tag">${hearts(g.rel)}</span>`)).join('') || '<p class="muted">No guests yet.</p>'}
      <h3>Your team (${st.staff.length})</h3>${st.staff.map(s => row('s' + s.id, `${s.name}${st.concerns.some(c => c.who === 's' + s.id) ? ' <span class="tag warn">!</span>' : ''}`, `${E.ROLES[s.role].label} · ₹${fmt(s.salary)}/mo · ${s.offUntil >= st.day ? 'on leave' : TRAITS[s.trait]}`, `<span class="tag ${s.morale > 65 ? 'ok' : s.morale > 40 ? 'warn' : 'bad'}">morale ${Math.round(s.morale)}</span>`)).join('')}`;
  },
  news() {
    const list = newsMode === 'people' ? st.news : st.log;
    return `<div class="seg"><button data-nm="people" class="${newsMode === 'people' ? 'on' : ''}">People &amp; Shillong</button><button data-nm="biz" class="${newsMode === 'biz' ? 'on' : ''}">Business log</button></div>
    <div class="log">${list.map(l => `<div class="${l.kind || ''}">${l.msg}<span>${E.dateLabel(l.day)}</span></div>`).join('') || '<div class="muted">Quiet so far.</div>'}</div>`;
  },
  prices() {
    const p = st.prices; const fair = Math.round(700 + 220 * st.rep);
    const sl = (k, label, min, max, step, note, obj = 'prices') => `<div class="slider"><label>${label}<b id="pv_${obj}_${k}">₹${fmt(st[obj][k])}</b></label><input type="range" min="${min}" max="${max}" step="${step}" value="${st[obj][k]}" data-k="${k}" data-o="${obj}"><div class="muted">${note}</div></div>`;
    return `<h3>Beds</h3>${sl('nightly', 'Nightly bed, with breakfast + dinner', 600, 3000, 50, `Guests think about ₹${fmt(fair)} is fair at your rating. Booking sites take 15%, GST 5%.`)}
      ${sl('monthly', 'Monthly stay, per night', 150, 800, 10, `₹${fmt(p.monthly * 30)} a month, meals included. Founders on monthly stays can join your incubator.`)}
      <div class="slider"><label>Beds open to monthly stays<b id="pv_cap">${st.monthlyCap}</b></label><input type="range" min="0" max="30" step="1" value="${st.monthlyCap}" data-k="monthlyCap"><div class="muted">Monthly guests pay less but stay, build things and pitch your incubator.</div></div>
      <h3>Extras</h3>${sl('desk', 'Co-working day pass', 100, 800, 25, 'For outsiders using the 16 desks.')}${sl('bike', 'Bicycle rental, per day', 100, 800, 25, '6 bikes by the outdoor stair.')}${sl('scooter', 'EV scooter rental, per day', 300, 1500, 50, `${st.upgrades.scooters != null ? 9 : 6} scooters. Charging costs about ₹60 a day each.`)}
      <p class="muted">Café menu prices are in Café &amp; kitchen. Laundry and hosting prices are in Laundry &amp; servers.</p>`;
  },
  cafe() {
    const y = st.yesterday; const items = y ? y.cafeItems : {};
    const rows = Object.entries(E.MENU).map(([k, M]) => { const it = items[k] || { n: 0, rev: 0, cost: 0 }; const unit = Math.round(M.cost * (k === 'coffee' && st.upgrades.roaster != null ? 0.75 : 1)); const margin = Math.round(100 * (1 - unit / st.menu[k])); return `<div class="slider"><label>${M.label}<b id="pv_menu_${k}">₹${fmt(st.menu[k])}</b></label><input type="range" min="${Math.round(M.price * 0.4)}" max="${Math.round(M.price * 2.2)}" step="5" value="${st.menu[k]}" data-k="${k}" data-o="menu"><div class="muted">Ingredients ~₹${unit} a serving (${margin}% margin) · sold ${it.n} yesterday</div></div>`; }).join('');
    const occ = E.occupied(st); const foodMult = (st.supplier === 'local' ? 1 : 1.08) * (E.MONSOON(E.dateOf(st.day).m) ? (st.supplier === 'local' ? 1.2 : 1.05) : 1) * (st.upgrades.garden != null ? 0.85 : 1) * (st.flags.farmerDeal ? 0.9 : 1);
    return `<h3>Café menu</h3><p class="muted">Every item has its own ingredient cost. Price too high and people order less. Walk-ins yesterday: ${y ? y.walkins : 0}.</p>${rows}
      <h3>Kitchen</h3><div class="kpis"><div class="kpi"><small>Meals cooked yesterday</small><b>${y ? y.meals : 0}</b></div><div class="kpi"><small>Ingredients / guest / day</small><b>₹${Math.round((E.RATES.breakfast + E.RATES.dinner) * foodMult)}</b></div>
      <div class="kpi"><small>Kitchen spend yesterday</small><b>₹${fmt(y ? y.costs.kitchen : 0)}</b></div><div class="kpi"><small>LPG yesterday</small><b>₹${fmt(y ? y.costs.lpg : 0)}</b></div></div>
      <p class="muted">Breakfast ~₹${E.RATES.breakfast} and dinner ~₹${E.RATES.dinner} a guest before adjustments, plus ₹8k a month of staples and spices. Commercial LPG is ₹${fmt(E.RATES.lpgCylinder)} a cylinder.</p>
      <h3>Where you buy</h3><div class="seg"><button data-sup="local" class="${st.supplier === 'local' ? 'on' : ''}">Iewduh market (local)</button><button data-sup="wholesale" class="${st.supplier === 'wholesale' ? 'on' : ''}">Guwahati wholesaler</button></div>
      <p class="muted">${st.supplier === 'local' ? 'Fresher and cheaper, and guests notice. In the monsoon prices jump 20% and storms can stop the truck.' : '8% pricier, but steady through the monsoon.'} ${st.flags.farmerDeal ? 'Bah Hambok\'s farm deal saves another 10%.' : ''} ${st.upgrades.garden != null ? 'Your garden covers some greens (−15%).' : ''}</p>`;
  },
  services() {
    const y = st.yesterday; const hs = st.hosting; const cap = (E.activeStaff(st, 'laundry').length ? 180 : 60) + (st.upgrades.washers != null ? 60 : 0);
    const hsl = (k) => { const H = E.HOSTING[k]; const ok = !H.needs || st.upgrades[H.needs] != null; return `<div class="slider"><label>${H.label}${ok ? '' : ` <span class="tag">needs ${E.UPGRADES[H.needs].label}</span>`}<b id="pv_hostingPrices_${k}">₹${fmt(st.hostingPrices[k])}</b></label><input type="range" min="${Math.round(H.price * 0.5)}" max="${H.price * 2}" step="250" value="${st.hostingPrices[k]}" data-k="${k}" data-o="hostingPrices"><div class="muted">Per month · power ~₹${fmt(H.power)}/month</div></div>`; };
    return `<h3>Laundry</h3><div class="kpis"><div class="kpi"><small>Outside laundry yesterday</small><b>${y ? y.laundryKg : 0} kg</b></div><div class="kpi"><small>Capacity for outside work</small><b>${cap} kg/day</b></div></div>
      <div class="slider"><label>Guest laundry, per load<b id="pv_prices_laundryLoad">₹${fmt(st.prices.laundryLoad)}</b></label><input type="range" min="50" max="400" step="10" value="${st.prices.laundryLoad}" data-k="laundryLoad" data-o="prices"><div class="muted">Each load costs ~₹${E.RATES.loadCost} in detergent and power.</div></div>
      <div class="slider"><label>Wash &amp; fold for locals, per kg<b id="pv_prices_washfold">₹${fmt(st.prices.washfold)}</b></label><input type="range" min="30" max="150" step="5" value="${st.prices.washfold}" data-k="washfold" data-o="prices"><div class="muted">Neighbours drop off bags at reception. GST 18%.</div></div>
      <b style="font-size:13px">Contracts</b>${st.laundry.contracts.map(c => `<div class="row"><div class="grow"><b>${c.name}</b><div class="muted">${c.kg} kg/week at ₹${c.rate}/kg</div></div></div>`).join('') || '<p class="muted">No contracts yet. Local businesses sometimes ask; watch your Inbox.</p>'}
      <h3>Server room</h3><div class="kpis"><div class="kpi"><small>Racks in use</small><b>${hs.customers.length} / ${hs.slots}</b></div><div class="kpi"><small>Yesterday</small><b class="${st.flags.outage ? 'neg' : 'pos'}">${hs.customers.length ? (st.flags.outage ? 'Outage' : 'All up') : '—'}</b></div></div>
      <p class="muted">${st.upgrades.battery == null ? 'Without the solar battery, power cuts usually take the servers down.' : 'Solar battery keeps the servers up in power cuts.'} ${hs.customers.length > 4 && !E.activeStaff(st, 'techie').length ? '<b>You need a server admin with this many customers.</b>' : ''}</p>
      ${hsl('dev')}${hsl('web')}${hsl('gpu')}
      ${hs.customers.map((c, i) => `<div class="row"><div class="grow"><b>${c.name}</b><div class="muted">${E.HOSTING[c.plan].label} · ₹${fmt(st.hostingPrices[c.plan])}/mo${c.freeUntil > st.day ? ' · free until ' + E.dateLabel(c.freeUntil) : ''}</div></div><button class="btn sm ghost" data-drop="${i}">End</button></div>`).join('') || '<p class="muted">No customers yet. Founders and local businesses will ask, or offer it when you chat with founders.</p>'}`;
  },
  staff() {
    return `<h3>Your team</h3><p class="muted">Salaries: ₹${fmt(st.staff.reduce((a, s) => a + s.salary, 0))} a month. Hiring costs a quarter of a month's pay. Letting someone go costs two weeks' pay and dents everyone's morale.</p>` +
      Object.entries(E.ROLES).map(([k, R]) => { const list = st.staff.filter(s => s.role === k); return `<div class="row"><div class="grow"><b>${R.label}</b><div class="muted">₹${fmt(R.salary)}/month · ${R.note}</div>${list.map(s => `<div class="muted">· ${s.name}, morale ${Math.round(s.morale)}${s.offUntil >= st.day ? ' (on leave)' : ''}</div>`).join('')}</div><div class="stepper"><button data-staff="${k}" data-d="-1">−</button><span>${list.length}</span><button data-staff="${k}" data-d="1">+</button></div></div>`; }).join('');
  },
  grow() {
    const mk = Object.entries(E.MARKETING).map(([k, m]) => { const running = (k === 'ota' && st.day <= st.marketing.otaUntil) || (k === 'founders' && st.day <= st.marketing.foundersUntil); return `<div class="row"><div class="grow"><b>${m.label}</b><div class="muted">₹${fmt(m.cost)} · ${m.desc}</div></div>${running ? '<span class="tag ok">Running</span>' : `<button class="btn rust" data-mk="${k}">Run</button>`}</div>`; }).join('');
    const up = Object.entries(E.UPGRADES).map(([k, u]) => `<div class="row"><div class="grow"><b>${u.label}</b><div class="muted">₹${fmt(u.cost)}${u.monthly ? ` + ₹${fmt(u.monthly)}/mo` : ''} · ${u.desc}</div></div>${st.upgrades[k] != null ? '<span class="tag ok">Owned</span>' : `<button class="btn" data-up="${k}" ${u.needs && st.upgrades[u.needs] == null ? 'disabled' : ''}>Buy</button>`}</div>`).join('');
    return `<h3>Marketing</h3><p class="muted">Awareness is ${Math.round(st.awareness * 100)}%. It fades if you go quiet. Good reviews help it grow.</p>${mk}<h3>Upgrades</h3>${up}`;
  },
  events() {
    const sch = st.events.scheduled;
    const cards = Object.entries(E.EVENTS).map(([k, e]) => { const last = st.events.last[k]; const wait = last != null ? Math.max(0, 5 - (st.day - last)) : 0; const cost = Math.round(e.cost * (E.activeStaff(st, 'community').length ? 0.7 : 1)); return `<div class="row"><div class="grow"><b>${e.label}</b><div class="muted">Costs ₹${fmt(cost)}${e.ticket ? ` · tickets ₹${fmt(e.ticket)}` : ''} · ${e.desc}</div></div>${wait ? `<span class="tag">${wait}d</span>` : `<button class="btn rust" data-ev="${k}" ${sch ? 'disabled' : ''}>Host</button>`}</div>`; }).join('');
    const hist = st.events.history.slice(0, 8).map(h => `<div>${E.EVENTS[h.type].label}: ${h.people} people${h.revenue ? `, ₹${fmt(h.revenue)}` : ''}<span>${E.dateLabel(h.day)}</span></div>`).join('') || '<div class="muted">No events yet.</div>';
    return `<h3>Activity room</h3><p class="muted">${sch ? `Booked: ${E.EVENTS[sch.type].label}, ${sch.day === st.day ? 'tonight' : 'tomorrow'} at 6 pm.` : 'One event at a time. Events lift the vibe for a week and spread the word. Locals sometimes ask to rent the room too.'}</p>${cards}<h3>Past events</h3><div class="log">${hist}</div>`;
  },
  incubator() {
    const apps = st.applications.map((a, i) => `<div class="row"><div class="grow"><b>${a.name}</b><div class="muted">Pitched by ${a.founder}. Program cost ₹${fmt(a.fee)} for ${a.stake}% · valued ₹${fmtL(a.valuation)}</div></div><div class="stepper"><button class="btn sm" data-app="${i}" data-a="1" style="width:auto">Back</button><button class="btn sm ghost" data-app="${i}" data-a="0" style="width:auto">Pass</button></div></div>`).join('') || '<p class="muted">No applications right now. Founders apply after about 10 days, sooner if they like you. You can also ask them yourself.</p>';
    const port = st.portfolio.map(p => `<div class="row"><div class="grow"><b>${p.name}</b><div class="muted">${p.stake}% · valued ₹${fmtL(p.valuation)}</div></div><span class="tag ${p.status === 'active' ? 'ok' : ''}">${p.status === 'active' ? '₹' + fmtL(p.valuation * p.stake / 100) : p.status}</span></div>`).join('') || '<p class="muted">No startups yet.</p>';
    return `<h3>Incubator</h3><div class="kpis"><div class="kpi"><small>Reputation</small><b>${Math.round(st.incubRep * 100)}%</b></div><div class="kpi"><small>Portfolio (paper)</small><b>${money(E.portfolioValue(st))}</b></div></div><h3>Applications</h3>${apps}<h3>Portfolio</h3>${port}`;
  },
  help() {
    return `<h3>How to play</h3>
    <p class="muted"><b>Walk as you:</b> press the orange button to step into Basecamp. WASD or arrows to walk, Shift to run, drag to turn the camera, <b>E</b> to talk or open and close the door in front of you (you can also click a door). Doors are solid when shut; staff and guests open them as they walk through. On a phone, use the joystick and the Talk button. People with a yellow <b>!</b> need something from you. Handling it in person earns more trust than doing it from the Inbox.</p>
    <p class="muted"><b>People matter:</b> every guest has a mood and a relationship with you, and that shapes the review they leave. Staff have morale: unhappy staff work slower and can quit.</p>
    <p class="muted"><b>Money:</b> beds and monthly stays, the café menu, desk passes, rentals, tours, laundry (guests, locals and contracts), server hosting, events and room hire. Costs are itemised: kitchen and café ingredients, LPG, salaries, power and Wi-Fi, linen, booking commissions, GST, upkeep and licences.</p>
    <p class="muted"><b>Seasons:</b> busy in spring and Oct–Nov, quiet and stormy in the monsoon. Winters are cold, so blankets and hot water matter.</p>
    <h3>Assumptions</h3><p class="muted">From your plan: ₹1,400/night with meals, ₹250/night monthly, electricity ₹15k, cleaners ₹6k. Estimates: chef ₹18k, ops staff ₹30k, maintenance ₹10k, insurance ₹4k, licences ₹2k + ₹12k yearly, software ₹2.5k, Wi-Fi ₹1.5k a line, fibre ₹4k, booking commission 15%, GST 5% on rooms and food and 18% on services, ingredients ₹40 breakfast and ₹70 dinner, LPG ₹1,800 a cylinder, linen ₹25 a night, yearly repaint ₹60k, ₹1.5L/month loan in Realistic mode.</p>
    <h3>Credits</h3><p class="muted">Furniture and plants: Kenney Furniture Kit and Nature Kit (kenney.nl). People: Quaternius Ultimate Animated Character Pack (quaternius.com). All CC0, free to use. Building designed in Blender, rendered with three.js.</p>
    <h3>Game</h3><div class="actions"><button class="btn ghost" id="restart">Start over</button></div>`;
  },
};
function hearts2(rel) { return hearts(rel); }
function bindTab() {
  const body = $('tabBody');
  body.querySelectorAll('input[type=range]').forEach(inp => inp.addEventListener('input', () => {
    const k = inp.dataset.k, o = inp.dataset.o, v = +inp.value;
    if (k === 'monthlyCap') { st.monthlyCap = v; $('pv_cap').textContent = v; } else { st[o][k] = v; const el = $(`pv_${o}_${k}`); if (el) el.textContent = '₹' + fmt(v); }
  }));
  body.querySelectorAll('[data-staff]').forEach(b => b.onclick = () => act(E.setStaff(st, b.dataset.staff, +b.dataset.d)));
  body.querySelectorAll('[data-mk]').forEach(b => b.onclick = () => act(E.runMarketing(st, b.dataset.mk)));
  body.querySelectorAll('[data-up]').forEach(b => b.onclick = () => act(E.buyUpgrade(st, b.dataset.up)));
  body.querySelectorAll('[data-ev]').forEach(b => b.onclick = () => act(E.scheduleEvent(st, b.dataset.ev)));
  body.querySelectorAll('[data-app]').forEach(b => b.onclick = () => act(E.decideApplication(st, +b.dataset.app, b.dataset.a === '1')));
  body.querySelectorAll('[data-drop]').forEach(b => b.onclick = () => { E.dropHosting(st, +b.dataset.drop); act(null); });
  body.querySelectorAll('[data-sup]').forEach(b => b.onclick = () => { st.supplier = b.dataset.sup; act(null); });
  body.querySelectorAll('[data-nm]').forEach(b => b.onclick = () => { newsMode = b.dataset.nm; refreshPanel(); });
  body.querySelectorAll('[data-cid]').forEach(b => b.onclick = () => { const c = st.concerns.find(x => x.id === +b.dataset.cid); const p = c && E.personByKey(st, c.who); const before = p ? snapshot(p) : null; const r = E.resolveConcern(st, +b.dataset.cid, +b.dataset.ci, false); if (r && r.err) return toast(r.err, 'bad'); if (r && r.say) toast(r.say); if (p) { const fx = fxText(before, p); if (fx) toast(`${p.first}: ${fx}`, 'good'); } act(null); syncAgents(); });
  body.querySelectorAll('[data-find]').forEach(b => b.onclick = () => findPerson(b.dataset.find));
  const rs = $('restart'); if (rs) rs.onclick = () => { if (rs.dataset.sure) { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } location.reload(); } else { rs.dataset.sure = 1; rs.textContent = 'Tap again to wipe this save'; } };
}
function act(err) { if (err) toast(err, 'bad'); flushLog(); syncAgents(); updateLabels(); refreshPanel(); save(); }
function findPerson(key) {
  const a = agents.get(key);
  if (!a || a.away) return toast(a ? `${a.info.short || a.info.name} is out exploring right now.` : 'Not around right now.', 'info');
  if (walking) { toast(`${a.info.short || a.info.name} is ${describeWhere(a.obj.position)}. Look for their name tag.`); return; }
  flyToPoint(a.obj.position); setTimeout(() => showAgentCard(a), 700);
}
function describeWhere(v) { const f = toFt(v); const z = zoneAt(f); return z ? 'in the ' + z[1].toLowerCase() : 'outside'; }
function drawSpark() {
  const c = $('spark'); if (!c) return; const dpr = devicePixelRatio || 1; const w = c.clientWidth, h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; const g = c.getContext('2d'); g.scale(dpr, dpr); const hist = st.history.slice(-90);
  if (hist.length < 2) { g.fillStyle = '#6c716b'; g.font = '12px Inter'; g.fillText('Play a few days to see the trend.', 10, h / 2 + 4); return; }
  const vals = hist.map(x => x.cash); const mn = Math.min(0, ...vals), mx = Math.max(...vals); const pad = 8; const X = (i) => pad + i / (hist.length - 1) * (w - pad * 2), Y = (v) => h - pad - (v - mn) / (mx - mn || 1) * (h - pad * 2);
  if (mn < 0) { g.strokeStyle = '#d9b3b3'; g.beginPath(); g.moveTo(pad, Y(0)); g.lineTo(w - pad, Y(0)); g.stroke(); }
  g.strokeStyle = '#2f5d45'; g.lineWidth = 2; g.beginPath(); vals.forEach((v, i) => i ? g.lineTo(X(i), Y(v)) : g.moveTo(X(i), Y(v))); g.stroke(); g.fillStyle = '#1f2421'; g.font = '600 11px Inter'; g.fillText(money(vals[vals.length - 1]), w - 70, 14);
}
function toast(msg, kind = 'info') { const el = document.createElement('div'); el.className = 'toast ' + kind; el.textContent = msg; $('toasts').prepend(el); setTimeout(() => el.remove(), 5200); while ($('toasts').children.length > 4) $('toasts').lastChild.remove(); }

// ============================================================ clicking rooms + people (manager view)
const ZONES = [
  ['roof', 'Roof deck', 6, 46, 74, 122, 20.5, 40], ['solar', 'Solar roof', 6, 46, 12, 60, 20.5, 40], ['courtroof', 'Courtyard roof', 6, 46, 60, 74, 20.5, 40],
  ['f1', 'Your room', 6, 46, 12, 20, 10.6, 20.6], ['f2', "Co-founder's room", 6, 46, 20, 28, 10.6, 20.6],
  ['dE', 'Dorm E', 6, 46, 28, 44, 10.6, 20.6], ['dD', 'Dorm D', 6, 46, 44, 60, 10.6, 20.6], ['dA', 'Dorm A', 6, 46, 74, 90, 10.6, 20.6], ['dB', 'Dorm B', 6, 46, 90, 106, 10.6, 20.6], ['dC', 'Dorm C', 6, 46, 106, 122, 10.6, 20.6],
  ['wbal', 'West balcony', 0, 6, 8, 122, 9, 14], ['gallery', 'Steel gallery', 46, 52.5, 6, 122, 9, 14], ['fbal', "Founders' balcony", 6, 46, 6, 12, 9, 14], ['stair', 'Outdoor stair', 52, 57, 46, 84, 0, 30],
  ['reception', 'Reception', 26, 46, 36, 44, 0, 10.6], ['chef', 'Chef room', 6, 26, 36, 44, 0, 10.6], ['kitchen', 'Kitchen', 6, 28, 44, 52, 0, 10.6], ['meeting', 'Meeting room', 28, 46, 44, 52, 0, 10.6],
  ['dining', 'Dining hall', 6, 46, 52, 60, 0, 10.6], ['courtyard', 'Covered courtyard', 6, 46, 60, 74, 0, 20.5], ['cowork', 'Co-working', 6, 46, 74, 90, 0, 10.6],
  ['wcs', 'Server room, WCs + phone booths', 6, 46, 90, 98, 0, 10.6], ['laundry', 'Laundry + store', 6, 46, 98, 106, 0, 10.6], ['pavilion', 'Covered pavilion', 6, 46, 106, 122, 0, 10.6],
  ['parking', 'Covered parking', 6, 46, 12, 36, 0, 10.6], ['cafe', 'Basecamp Café', 69.5, 80, 3, 45, 0, 14], ['cafedeck', 'Café deck', 56.5, 69.5, 1, 44, 0, 14],
  ['bikes', 'Bike rental', 56, 70, 44, 50, 0, 10], ['activity', 'Activity room', 69.5, 80, 55, 97, 0, 14], ['yoga', 'Yoga lawn', 56, 69.5, 52, 97, 0, 10],
  ['garden', 'Kitchen garden', 54, 80, 97, 125, 0, 12], ['wgarden', 'West gardens', -1, 6, 12, 122, -1, 9], ['front', 'Front apron', -1, 49, -2, 12, -1, 9],
];
function zoneAt(f) { for (const z of ZONES) if (f.x >= z[2] && f.x <= z[3] && f.y >= z[4] && f.y <= z[5] && f.z >= z[6] && f.z <= z[7]) return z; return null; }
const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2(); let downAt = null;
renderer.domElement.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!st || !downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
  mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(mouse, camera);
  const ah = ray.intersectObjects([...agents.values()].filter(a => a.obj.visible).map(a => a.obj), true);
  if (ah.length) { const a = ah[0].object.userData.agent; if (!a) return; if (walking) { if (a.obj.position.distanceTo(me.person.group.position) < 3) openDialogue(a, true); else toast(`Walk closer to talk to ${a.info.short || a.info.name}.`); } else showAgentCard(a); return; }
  const dh = ray.intersectObjects(W.doors.flatMap(d => d.leaves.map(l => l.pivot)).filter(o => o.parent.visible), true)[0];
  if (dh && dh.object.userData.door) { const d = W.doors.find(x => x.name === dh.object.userData.door); if (d && (!walking || d.center.distanceTo(me.person.group.position) < 4)) { useDoor(d); return; } }
  if (walking) return;
  const hit = ray.intersectObjects(pickables.filter(m => m.parent.visible && !m.material.transparent), false)[0]; if (!hit) return hideCard();
  const z = zoneAt(toFt(hit.point)); if (z) showZone(z[0], z[1]); else hideCard();
});
let cardFn = null;
function showCard(fn) { cardFn = fn; renderCard(); }
function renderCard() { if (!cardFn) return; const c = $('card'); c.innerHTML = `<button class="x" id="cardX">×</button>` + cardFn(); c.classList.remove('hidden'); $('cardX').onclick = hideCard; c.querySelectorAll('[data-goto]').forEach(b => b.onclick = () => switchTab(b.dataset.goto)); c.querySelectorAll('[data-talk]').forEach(b => b.onclick = () => { const a = agents.get(b.dataset.talk); if (a) { hideCard(); openDialogue(a, false); } }); }
function hideCard() { cardFn = null; $('card').classList.add('hidden'); }
setInterval(() => { if (cardFn && st && !walking) renderCard(); }, 1500);
function dormCard(id) {
  const d = E.DORMS.find(x => x.id === id); const base = E.DORMS.indexOf(d) * 6; const rows = [];
  for (let b = base; b < base + 6; b++) { const g = st.guests.find(x => x.id === st.beds[b]); rows.push(`<div class="row"><span>Bed ${b - base + 1}</span><span class="muted">${g ? `${g.name} ${moodFace(g.mood)} · ${g.type === 'monthly' ? g.startup : g.job} · ${Math.max(0, g.nightsLeft)}n` : 'empty'}</span></div>`); }
  return `<h4>${d.name}</h4><p class="muted">Two containers joined, 640 sq ft: 3 bunks, lockers, a work counter, and a bathroom with 2 WCs, 2 showers and 2 basins.</p>${rows.join('')}`;
}
function showZone(id, name) {
  const y = st.yesterday;
  const map = {
    dA: () => dormCard('A'), dB: () => dormCard('B'), dC: () => dormCard('C'), dD: () => dormCard('D'), dE: () => dormCard('E'),
    f1: () => `<h4>${name}</h4><p class="muted">Where you live: a full container with an ensuite, a desk and a lounge corner.</p>`,
    cafe: () => `<h4>${name}</h4><p class="muted">Yesterday: ${y ? y.walkins : 0} walk-ins, ₹${fmt(y ? y.revenue.cafe : 0)} in sales, ₹${fmt(y ? y.costs.cafe : 0)} in ingredients.</p><button class="btn" data-goto="cafe">Menu &amp; costs</button>`,
    kitchen: () => `<h4>${name}</h4><p class="muted">${y ? y.meals : 0} meals yesterday. Food score ${pct(st.sat.food)}. Buying from ${st.supplier === 'local' ? 'Iewduh market' : 'the Guwahati wholesaler'}.</p><button class="btn" data-goto="cafe">Kitchen</button>`,
    wcs: () => `<h4>${name}</h4><p class="muted">Server racks: ${st.hosting.customers.length}/${st.hosting.slots} in use${st.flags.outage ? ', and they went down yesterday' : ''}.</p><button class="btn" data-goto="services">Server room</button>`,
    laundry: () => `<h4>${name}</h4><p class="muted">${y ? y.laundryLoads : 0} loads yesterday, ${y ? y.laundryKg : 0} kg of it for outside customers.</p><button class="btn" data-goto="services">Laundry</button>`,
    cowork: () => `<h4>${name}</h4><p class="muted">16 desks opening onto the courtyard. ${y ? y.deskUsers : 0} desk passes yesterday. Wi-Fi ${pct(st.sat.wifi)}.</p>`,
    activity: () => `<h4>${name}</h4><p class="muted">${st.events.scheduled ? `Booked: ${E.EVENTS[st.events.scheduled.type].label}.` : 'Free tonight.'}</p><button class="btn rust" data-goto="events">Events</button>`,
    courtyard: () => `<h4>${name}</h4><p class="muted">The heart of Basecamp under the clear roof. Vibe ${pct(st.sat.vibe)}.</p>`,
    reception: () => `<h4>${name}</h4><p class="muted">${E.activeStaff(st, 'reception').length ? 'Staffed.' : 'No receptionist, so check-ins are clunky.'} ${st.concerns.filter(c => c.who === 'local').length ? 'Someone from town is waiting here.' : ''}</p>`,
    garden: () => `<h4>${name}</h4><p class="muted">${st.upgrades.garden != null ? 'Expanded, and feeding the kitchen.' : 'Expand it to cut ingredient costs.'}</p>`,
  };
  showCard(map[id] || (() => `<h4>${name}</h4>`));
}
function showAgentCard(a) {
  showCard(() => {
    const p = personOf(a); const c = concernOf(a);
    let h = '';
    if (p) h = `<h4>${p.name}</h4><p class="muted">${a.kind === 'staff' ? `${E.ROLES[p.role].label} · morale ${Math.round(p.morale)}` : `${p.origin} · ${p.type === 'monthly' ? `founder of ${p.startup}` : p.job} · ${moodFace(p.mood)} · ${hearts(p.rel)}`}<br>${TRAITS[p.trait]}</p>`;
    else h = `<h4>${a.info.name}</h4>`;
    if (c) h += `<p style="font-size:13px">${E.concernText(st, c)}</p>`;
    return h + `<div class="actions"><button class="btn" data-talk="${a.key}">${c ? 'Answer now' : 'Chat'}</button></div><p class="muted">Or press Walk as you and go talk in person for a bigger effect.</p>`;
  });
}

// ============================================================ start / save
function save() { if (!st) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(st)); } catch (e) { } }
function loadSave() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function startGame(state) {
  st = state; lastHour = Math.floor(st.minute / 60); lastLogTop = st.log[0] || null;
  for (const a of [...agents.values()]) a.remove();
  if (!st.rentPlan) st.rentPlan = E.planRentals(st);
  makeMe(); syncAgents(true); updateLabels(); updateVehicles(); refreshPanel(); setSpeed(1); $('start').classList.add('hidden');
  if (!st.log.length) { E.log(st, `🏕️ Basecamp is open! Welcome, ${st.playerName}. Your first guests arrive this afternoon.`, 'good'); flushLog(); refreshPanel(); }
}
function gameOver() {
  setSpeed(0); save(); if (walking) stopWalking();
  $('overBody').innerHTML = `<h1>Out of cash</h1><p>Basecamp ran out of money on ${E.dateLabel(st.day)}. You lasted ${st.day} days with a ${st.rep.toFixed(2)}★ rating.</p><p class="muted">Usually it's too many staff for too few guests, prices that scare people off, or a quiet monsoon with no marketing.</p><div class="actions"><button class="btn" id="again">Try again</button></div>`;
  $('over').classList.remove('hidden'); $('again').onclick = () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } location.reload(); };
}
function switchTab(t) { tab = t; document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === t)); refreshPanel(); if (innerWidth <= 820) { $('panel').classList.remove('min'); document.body.classList.remove('pmin'); } }
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => switchTab(b.dataset.t));
document.querySelectorAll('#speed button').forEach(b => b.onclick = () => setSpeed(+b.dataset.s));
document.querySelectorAll('#cutaway button').forEach(b => b.onclick = () => setCut(b.dataset.c));
document.querySelectorAll('#cams button').forEach(b => b.onclick = () => flyTo(b.dataset.v));
$('walkBtn').onclick = () => walking ? stopWalking() : startWalking();
$('panelToggle').onclick = () => { const p = $('panel'); p.classList.toggle('min'); document.body.classList.toggle('pmin', p.classList.contains('min')); $('panelToggle').textContent = p.classList.contains('min') ? '▴' : '▾'; };
let mode = 'relaxed', look = '#c8612e';
document.querySelectorAll('.mode').forEach(b => b.onclick = () => { mode = b.dataset.m; document.querySelectorAll('.mode').forEach(x => x.classList.toggle('on', x === b)); });
['#c8612e', '#2f5d45', '#3a6ea5', '#7a4a9a', '#d39b2a', '#222222'].forEach((c, i) => { const s = document.createElement('div'); s.className = 'swatch' + (i ? '' : ' on'); s.style.background = c; s.title = 'Your shirt'; s.onclick = () => { look = c; document.querySelectorAll('.swatch').forEach(x => x.classList.toggle('on', x === s)); }; $('swatches').appendChild(s); });
$('newGame').onclick = () => { const st0 = E.newGame(mode, (rnd() * 1e9) | 0, ($('pname').value || 'You').trim()); st0.look = look; startGame(st0); };
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

camera.position.copy(VIEWS.overview[0]); controls.target.copy(VIEWS.overview[1]);
renderer.setAnimationLoop(loop);
W.loadModel((f) => { $('loadFill').style.width = Math.round(f * 92) + '%'; }).then(async () => {
  $('loadTxt').textContent = 'Mapping the walkways…';
  try {
    const key = navKey(W.collider);
    try { const r = await fetch('./nav.b64.txt'); if (r.ok) NAV = loadNavData(await r.text(), key); } catch (e) { }
    if (!NAV) NAV = await buildNav(W.collider, [-3, 26, -41, 3], (f) => { $('loadFill').style.width = Math.round(92 + f * 8) + '%'; }); // layout changed: map it fresh
  } catch (e) { console.warn('nav grid failed, using the simple path graph', e); }
  $('loading').remove();
  const saved = loadSave();
  if (saved && saved.v === E.VERSION && !saved.over) { $('continue').classList.remove('hidden'); $('continue').onclick = () => startGame(saved); $('pname').value = saved.playerName || ''; }
  $('start').classList.remove('hidden');
  W.updateSky(16.5 * 60, { storm: false, powerCut: false }, false);
}).catch((err) => { $('loadTxt').textContent = 'Could not load the 3D model. Try refreshing.'; console.error(err); });
