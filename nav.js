// Basecamp Shillong — walkable-ground grid built from the real collision mesh, plus A* paths for everyone.
// A cell is walkable only if a body (0.23 m radius, knee to head) fits there, so people can't cut through
// walls, glass, counters or furniture. Door leaves aren't in the collision mesh: doorways stay walkable and
// the doors swing open as people reach them.
import * as THREE from 'three';

const CELL = 0.25, RAD = 0.23, STEP = 0.4;

export function buildNav(collider, bounds, onProgress) {
  const bvh = collider.geometry.boundsTree;
  const [x0, x1, z0, z1] = bounds; const nx = Math.ceil((x1 - x0) / CELL), nz = Math.ceil((z1 - z0) / CELL);
  const ray = new THREE.Raycaster(); ray.firstHitOnly = false; const down = new THREE.Vector3(0, -1, 0);
  const o = new THREE.Vector3(), cp = new THREE.Vector3(), hit = {};
  const col = new Array(nx * nz); const X = [], Y = [], Z = [], C = [];
  const fits = (x, y, z) => { for (const h of [0.5, 1.0, 1.55]) { cp.set(x, y + h, z); const r = bvh.closestPointToPoint(cp, hit, 0, RAD); if (r && r.distance < RAD) return false; } return true; };
  return new Promise((resolve) => {
    let i = 0;
    const chunk = () => {
      const end = Math.min(nx, i + 12);
      for (; i < end; i++) for (let j = 0; j < nz; j++) {
        const x = x0 + (i + 0.5) * CELL, z = z0 + (j + 0.5) * CELL; const list = [];
        o.set(x, 30, z); ray.set(o, down); ray.far = 31;
        const hits = collider.raycast ? (() => { const out = []; collider.raycast(ray, out); return out; })() : [];
        hits.sort((a, b) => b.point.y - a.point.y); let lastY = 1e9;
        for (const h of hits) {
          if (!h.face || h.face.normal.y < 0.7) continue;
          const y = h.point.y; if (lastY - y < 1.7) { lastY = y; continue; } // need head room above this floor
          lastY = y; if (fits(x, y, z)) { list.push(X.length); X.push(x); Y.push(y); Z.push(z); C.push(i * nz + j); }
        }
        // bare ground outside the building (the meadow is not in the collision mesh)
        if (!hits.length || hits[hits.length - 1].point.y > 1.7) { if (fits(x, 0, z)) { list.push(X.length); X.push(x); Y.push(0); Z.push(z); C.push(i * nz + j); } }
        col[i * nz + j] = list;
      }
      onProgress && onProgress(i / nx);
      if (i < nx) setTimeout(chunk, 0); else resolve(finish());
    };
    const finish = () => makeNav(X, Y, Z, C, col, nx, nz, x0, z0);
    chunk();
  });
}

// rebuild neighbours from the raw cells (fast) — used after building and when loading a precomputed grid
function makeNav(X, Y, Z, C, col, nx, nz, x0, z0) {
      const n = X.length; const nb = new Int32Array(n * 8).fill(-1);
      const find = (ci, cj, y) => { if (ci < 0 || cj < 0 || ci >= nx || cj >= nz) return -1; const l = col[ci * nz + cj]; let best = -1, bd = STEP; for (const k of l) { const d = Math.abs(Y[k] - y); if (d < bd) { bd = d; best = k; } } return best; };
      const D = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (let k = 0; k < n; k++) {
        const ci = Math.floor(C[k] / nz), cj = C[k] % nz;
        for (let d = 0; d < 8; d++) {
          const t = find(ci + D[d][0], cj + D[d][1], Y[k]); if (t < 0) continue;
          if (d >= 4 && (find(ci + D[d][0], cj, Y[k]) < 0 || find(ci, cj + D[d][1], Y[k]) < 0)) continue; // no corner cutting
          nb[k * 8 + d] = t;
        }
      }
      return new Nav({ X, Y, Z, C, nb, col, nx, nz, x0, z0, find });
}

// compact save format: per cell column index (uint32) + floor height in mm (int16)
export function serializeNav(nav, key) {
  const n = nav.n; const buf = new ArrayBuffer(24 + n * 6); const dv = new DataView(buf);
  dv.setUint32(0, 0x4e415631); dv.setUint32(4, n); dv.setUint32(8, nav.nx); dv.setUint32(12, nav.nz); dv.setFloat32(16, nav.x0); dv.setFloat32(20, nav.z0);
  for (let k = 0; k < n; k++) { dv.setUint32(24 + k * 4, nav.C[k]); dv.setInt16(24 + n * 4 + k * 2, Math.round(nav.Y[k] * 1000)); }
  let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192));
  return key + '\n' + btoa(s);
}
export function loadNavData(text, key) {
  const nl = text.indexOf('\n'); if (text.slice(0, nl) !== key) return null;
  const bin = atob(text.slice(nl + 1).trim()); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  const dv = new DataView(u.buffer); if (dv.getUint32(0) !== 0x4e415631) return null;
  const n = dv.getUint32(4), nx = dv.getUint32(8), nz = dv.getUint32(12), x0 = dv.getFloat32(16), z0 = dv.getFloat32(20);
  const X = new Array(n), Y = new Array(n), Z = new Array(n), C = new Array(n); const col = Array.from({ length: nx * nz }, () => []);
  for (let k = 0; k < n; k++) { const c = dv.getUint32(24 + k * 4); C[k] = c; const i = Math.floor(c / nz), j = c % nz; X[k] = x0 + (i + 0.5) * CELL; Z[k] = z0 + (j + 0.5) * CELL; Y[k] = dv.getInt16(24 + n * 4 + k * 2) / 1000; col[c].push(k); }
  return makeNav(X, Y, Z, C, col, nx, nz, x0, z0);
}
// fingerprint of the collision mesh, so a stale grid is never used
export function navKey(collider) { const p = collider.geometry.attributes.position; const b = collider.geometry.boundsTree.getBoundingBox(new THREE.Box3()); let h = 0; for (let i = 0; i < p.count; i += 97) h = (h * 31 + Math.round(p.getX(i) * 100 + p.getY(i) * 10 + p.getZ(i))) | 0; return `nav1:${p.count}:${b.min.x.toFixed(2)}:${b.max.z.toFixed(2)}:${h}`; }

class Heap { constructor() { this.a = []; this.p = []; }
  push(v, pr) { const a = this.a, p = this.p; a.push(v); p.push(pr); let i = a.length - 1; while (i > 0) { const q = (i - 1) >> 1; if (p[q] <= pr) break; a[i] = a[q]; p[i] = p[q]; i = q; } a[i] = v; p[i] = pr; }
  pop() { const a = this.a, p = this.p; const top = a[0]; const lv = a.pop(), lp = p.pop(); if (a.length) { let i = 0; for (;;) { let c = 2 * i + 1; if (c >= a.length) break; if (c + 1 < a.length && p[c + 1] < p[c]) c++; if (p[c] >= lp) break; a[i] = a[c]; p[i] = p[c]; i = c; } a[i] = lv; p[i] = lp; } return top; }
  get size() { return this.a.length; } }

export class Nav {
  constructor(d) { Object.assign(this, d); this.n = d.X.length; this.g = new Float32Array(this.n); this.came = new Int32Array(this.n); this.stamp = new Int32Array(this.n); this.run = 0; this.comp = this.components(); }
  components() { const c = new Int32Array(this.n).fill(-1); let id = 0; const st = [];
    for (let s = 0; s < this.n; s++) { if (c[s] >= 0) continue; c[s] = id; st.push(s); while (st.length) { const k = st.pop(); for (let d = 0; d < 8; d++) { const t = this.nb[k * 8 + d]; if (t >= 0 && c[t] < 0) { c[t] = id; st.push(t); } } } id++; }
    return c; }
  cellOf(x, z) { return [Math.floor((x - this.x0) / CELL), Math.floor((z - this.z0) / CELL)]; }
  // nearest walkable cell to a point on roughly the same floor
  nearest(p, maxR = 2, comp = -1) {
    const [ci, cj] = this.cellOf(p.x, p.z); const R = Math.ceil(maxR / CELL); let best = -1, bd = 1e9;
    for (let r = 0; r <= R; r++) {
      for (let i = ci - r; i <= ci + r; i++) for (let j = cj - r; j <= cj + r; j++) {
        if (Math.max(Math.abs(i - ci), Math.abs(j - cj)) !== r || i < 0 || j < 0 || i >= this.nx || j >= this.nz) continue;
        for (const k of this.col[i * this.nz + j]) { const dy = Math.abs(this.Y[k] - p.y); if (dy > 0.9) continue; if (comp >= 0 && this.comp[k] !== comp) continue; const d = Math.hypot(this.X[k] - p.x, this.Z[k] - p.z) + dy * 2; if (d < bd) { bd = d; best = k; } }
      }
      if (best >= 0 && r * CELL > bd) break;
    }
    return best;
  }
  pos(k, v = new THREE.Vector3()) { return v.set(this.X[k], this.Y[k], this.Z[k]); }
  // a random walkable spot inside a box [xmin,xmax,zmin,zmax] at about floor height y, reachable from `fromK`
  randomIn(b, y, fromK, rnd = Math.random) {
    const comp = fromK >= 0 ? this.comp[fromK] : -1;
    for (let t = 0; t < 30; t++) { const k = this.nearest(new THREE.Vector3(b[0] + rnd() * (b[1] - b[0]), y, b[2] + rnd() * (b[3] - b[2])), 0.6, comp); if (k >= 0) return k; }
    return -1;
  }
  path(a, b) { // A* between cell indices; returns a list of cell indices or null
    if (a < 0 || b < 0 || this.comp[a] !== this.comp[b]) return null;
    const run = ++this.run, g = this.g, came = this.came, stamp = this.stamp, X = this.X, Y = this.Y, Z = this.Z;
    const h = (k) => Math.hypot(X[k] - X[b], Z[k] - Z[b]) + Math.abs(Y[k] - Y[b]);
    const open = new Heap(); g[a] = 0; came[a] = -1; stamp[a] = run; open.push(a, h(a)); let guard = 0;
    while (open.size && guard++ < 200000) {
      const k = open.pop(); if (k === b) break;
      for (let d = 0; d < 8; d++) { const t = this.nb[k * 8 + d]; if (t < 0) continue;
        const ng = g[k] + (d < 4 ? CELL : CELL * 1.4142) + Math.abs(Y[t] - Y[k]);
        if (stamp[t] !== run || ng < g[t] - 1e-6) { stamp[t] = run; g[t] = ng; came[t] = k; open.push(t, ng + h(t)); } }
    }
    if (stamp[b] !== run) return null;
    const out = []; for (let k = b; k >= 0; k = came[k]) out.push(k); return out.reverse();
  }
  // can you walk straight from cell a to cell b without leaving walkable ground?
  straight(a, b) {
    const ax = this.X[a], az = this.Z[a], ay = this.Y[a], bx = this.X[b], bz = this.Z[b], by = this.Y[b];
    const L = Math.hypot(bx - ax, bz - az); const n = Math.ceil(L / (CELL * 0.4));
    for (let s = 1; s < n; s++) { const t = s / n; const x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = ay + (by - ay) * t;
      const [ci, cj] = this.cellOf(x, z); if (ci < 0 || cj < 0 || ci >= this.nx || cj >= this.nz) return false;
      let ok = false; for (const k of this.col[ci * this.nz + cj]) if (Math.abs(this.Y[k] - y) < 0.3) { ok = true; break; } if (!ok) return false; }
    return true;
  }
  // A* plus string-pulling into a short list of world-space waypoints
  route(from, to) {
    const a = this.nearest(from, 2.5), b = this.nearest(to, 2.5, a >= 0 ? this.comp[a] : -1); const p = this.path(a, b); if (!p) return null;
    const pts = []; let i = 0;
    while (i < p.length - 1) { let j = Math.min(p.length - 1, i + 40); while (j > i + 1 && !this.straight(p[i], p[j])) j--; pts.push(this.pos(p[j])); i = j; }
    return pts;
  }
}
