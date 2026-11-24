// Basecamp Shillong — the 3D world: renderer, sky, textures, model, people meshes, collider
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshBVH } from 'three-mesh-bvh';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

export const FT = 0.3048;
export const P = (x, y, z = 0) => new THREE.Vector3(x * FT, z * FT, -y * FT);
export const toFt = (v) => ({ x: v.x / FT, y: -v.z / FT, z: v.y / FT });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mobile = matchMedia('(max-width: 820px)').matches || /Android|iPhone|iPad/.test(navigator.userAgent);

// ------------------------------------------------------------ renderer
export const renderer = new THREE.WebGLRenderer({ antialias: !/[?&]aa=0/.test(location.search), powerPreference: 'high-performance', preserveDrawingBuffer: /film/.test(location.pathname) });
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('scene').appendChild(renderer.domElement);
export const labelRenderer = new CSS2DRenderer({ element: document.getElementById('labels') });
labelRenderer.setSize(innerWidth, innerHeight);

export const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#c9d8e0', 140, 700);
export const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.15, 3000);
export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxPolarAngle = Math.PI / 2.08; controls.minDistance = 6; controls.maxDistance = 150;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const sky = new Sky(); sky.scale.setScalar(2500); scene.add(sky);
const su = sky.material.uniforms; su.turbidity.value = 5; su.rayleigh.value = 1.4; su.mieCoefficient.value = 0.005; su.mieDirectionalG.value = 0.82;
export const hemi = new THREE.HemisphereLight('#dfeeff', '#5d5040', 0.7); scene.add(hemi);
export const sun = new THREE.DirectionalLight('#fff1dc', 2.6);
sun.castShadow = true; const SM = mobile ? 1024 : 2048; sun.shadow.mapSize.set(SM, SM);
Object.assign(sun.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 220 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
sun.target.position.set(14, 0, -19); scene.add(sun, sun.target);

// ------------------------------------------------------------ procedural textures
function tex(size, draw, { srgb = true, rep = 1 } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'); draw(g, size);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / rep, 1 / rep); t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}
function noise(g, s, lo, hi, cell = 2, tint = [1, 1, 1]) {
  const small = document.createElement('canvas'); const n = Math.max(8, Math.floor(s / cell)); small.width = small.height = n; const sg = small.getContext('2d'); const d = sg.createImageData(n, n);
  for (let i = 0; i < n * n; i++) { const v = lo + Math.random() * (hi - lo); d.data[i * 4] = v * tint[0]; d.data[i * 4 + 1] = v * tint[1]; d.data[i * 4 + 2] = v * tint[2]; d.data[i * 4 + 3] = 255; }
  sg.putImageData(d, 0, 0); g.imageSmoothingEnabled = true; g.drawImage(small, 0, 0, s, s);
}
const T = {
  corrug: tex(256, (g, s) => { for (let x = 0; x < s; x++) { const v = 128 + 120 * Math.sin(x / s * Math.PI * 8); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, 0, 1, s); } }, { srgb: false, rep: 1.1 }),
  grime: tex(256, (g, s) => { noise(g, s, 215, 255, 6); g.globalAlpha = 0.08; for (let i = 0; i < 40; i++) { g.fillStyle = Math.random() < 0.5 ? '#5a3a20' : '#222'; g.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * 3, 20 + Math.random() * 120); } }, { rep: 3 }),
  planks: tex(512, (g, s) => { const n = 8; for (let i = 0; i < n; i++) { const v = 200 + Math.random() * 55; g.fillStyle = `rgb(${v},${v * 0.97},${v * 0.92})`; g.fillRect(0, i * s / n, s, s / n); g.globalAlpha = 0.12; for (let k = 0; k < 30; k++) { g.fillStyle = '#6b4a2a'; g.fillRect(Math.random() * s, i * s / n + Math.random() * s / n, 30 + Math.random() * 80, 1); } g.globalAlpha = 1; g.fillStyle = 'rgba(60,40,20,.55)'; g.fillRect(0, i * s / n, s, 2); g.fillRect(Math.random() * s, i * s / n, 2, s / n); } }, { rep: 1.6 }),
  tiles: tex(256, (g, s) => { noise(g, s, 225, 250, 8); g.fillStyle = 'rgba(90,90,90,.55)'; for (let i = 0; i <= 2; i++) { g.fillRect(i * s / 2 - 1, 0, 2, s); g.fillRect(0, i * s / 2 - 1, s, 2); } }, { rep: 1.2 }),
  concrete: tex(256, (g, s) => { noise(g, s, 200, 255, 3); g.globalAlpha = .15; noise(g, s, 150, 255, 24); }, { rep: 2.5 }),
  grass: tex(256, (g, s) => { noise(g, s, 170, 255, 2, [0.9, 1, 0.82]); g.globalAlpha = 0.25; noise(g, s, 140, 255, 30, [0.85, 1, 0.75]); }, { rep: 2 }),
  asphalt: tex(256, (g, s) => { noise(g, s, 150, 255, 2); }, { rep: 1.5 }),
  ply: tex(256, (g, s) => { g.fillStyle = '#fff'; g.fillRect(0, 0, s, s); g.globalAlpha = 0.07; for (let i = 0; i < 120; i++) { g.fillStyle = '#7a5a30'; const y = Math.random() * s; g.fillRect(0, y, s, 1 + Math.random() * 2); } g.globalAlpha = 0.25; g.fillStyle = '#6a5030'; g.fillRect(s / 2 - 1, 0, 2, s); }, { rep: 2.4 }),
  fabric: tex(128, (g, s) => { noise(g, s, 205, 255, 1); }, { rep: 0.4 }),
};
export const meadowTex = tex(256, (g, s) => { noise(g, s, 175, 255, 2, [0.9, 1, 0.8]); g.globalAlpha = 0.3; noise(g, s, 130, 255, 40, [0.8, 1, 0.7]); }, { rep: 6 });

function prepMaterial(m) {
  const n = m.name || '';
  m.envMapIntensity = 0.6;
  if (/Glass/.test(n)) { m.transparent = true; m.opacity = 0.28; m.depthWrite = false; m.side = THREE.DoubleSide; m.emissive = new THREE.Color('#ffc98a'); m.emissiveIntensity = 0; m.roughness = 0.04; m.metalness = 0.1; m.envMapIntensity = 1.4; }
  else if (n === 'Polycarbonate') { m.transparent = true; m.opacity = 0.22; m.depthWrite = false; m.side = THREE.DoubleSide; m.roughness = 0.2; }
  else if (/^Cont_/.test(n)) { m.roughness = 0.55; m.metalness = 0.35; m.bumpMap = T.corrug; m.bumpScale = 1.2; m.map = T.grime; }
  else if (n === 'Canopy') { m.bumpMap = T.corrug; m.bumpScale = 0.8; m.metalness = 0.5; m.roughness = 0.45; }
  else if (n === 'Wood_Deck' || n === 'Floor_Wood' || n === 'Furn_Wood') { m.map = T.planks; m.roughness = 0.75; }
  else if (n === 'Floor_Tile') { m.map = T.tiles; m.roughness = 0.35; }
  else if (n === 'Concrete' || n === 'Wall' || n === 'Stone') { m.map = T.concrete; m.roughness = 0.9; }
  else if (n === 'Grass' || n === 'Leaf' || n === 'Soil') { m.map = T.grass; m.roughness = 1; }
  else if (n === 'Asphalt' || n === 'Gravel') { m.map = T.asphalt; m.roughness = 0.95; }
  else if (n === 'Lining') { m.map = T.ply; m.roughness = 0.8; }
  else if (/Fabric|Mattress/.test(n)) { m.map = T.fabric; m.roughness = 0.95; }
  else if (n === 'Label') { m.emissive = new THREE.Color('#ffffff'); m.emissiveIntensity = 0.6; }
  else if (n === 'Solar') { m.roughness = 0.15; m.metalness = 0.6; m.envMapIntensity = 1.2; }
  m.needsUpdate = true;
}

// ------------------------------------------------------------ surroundings
{
  const meadow = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: '#628a48', roughness: 1, map: meadowTex }));
  meadowTex.repeat.set(150, 150);
  meadow.rotation.x = -Math.PI / 2; meadow.position.set(12, -0.12, -20); meadow.receiveShadow = true; scene.add(meadow);
  const lake = new THREE.Mesh(new THREE.PlaneGeometry(320, 140), new THREE.MeshStandardMaterial({ color: '#3f6f86', roughness: 0.08, metalness: 0.3, envMapIntensity: 1.5 }));
  lake.rotation.x = -Math.PI / 2; lake.position.set(40, -0.06, -140); scene.add(lake);
  const trunk = new THREE.CylinderGeometry(0.18, 0.28, 3, 6); trunk.translate(0, 1.5, 0);
  const c1 = new THREE.ConeGeometry(2.3, 5, 8); c1.translate(0, 4.6, 0); const c2 = new THREE.ConeGeometry(1.7, 4.2, 8); c2.translate(0, 7, 0); const c3 = new THREE.ConeGeometry(1.1, 3.2, 8); c3.translate(0, 9.1, 0);
  const crown = mergeGeometries([c1, c2, c3]);
  const N = mobile ? 180 : 320;
  const iT = new THREE.InstancedMesh(trunk, new THREE.MeshStandardMaterial({ color: '#4b3a2a', roughness: 1 }), N);
  const iC = new THREE.InstancedMesh(crown, new THREE.MeshStandardMaterial({ color: '#2c4f33', roughness: 0.95, flatShading: true }), N);
  const m = new THREE.Matrix4(); let i = 0; let s = 42; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  while (i < N) {
    const x = -160 + rnd() * 360, z = 70 - rnd() * 300;
    if ((x > -24 && x < 50 && z < 24 && z > -64) || (x > -120 && x < 200 && z < -70 && z > -210)) continue;
    const sc = 0.6 + rnd() * 1.0; m.compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 6), new THREE.Vector3(sc, sc * (0.8 + rnd() * 0.6), sc));
    iT.setMatrixAt(i, m); iC.setMatrixAt(i, m); i++;
  }
  iC.castShadow = true; scene.add(iT, iC);
  const hill = new THREE.MeshStandardMaterial({ color: '#46663f', roughness: 1, flatShading: true });
  [[-180, -300, 90], [40, -380, 120], [260, -280, 100], [340, -60, 80], [-260, -40, 70]].forEach(([x, z, r]) => { const h = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), hill); h.position.set(x, -4, z); h.scale.y = 0.42; scene.add(h); });
}
export const bulbMat = new THREE.MeshBasicMaterial({ color: '#ffd9a0' });
{
  const g = new THREE.SphereGeometry(0.06, 8, 6); const n = 60; const inst = new THREE.InstancedMesh(g, bulbMat, n); const m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) { const row = i % 3; const t = Math.floor(i / 3) / 19; m.setPosition(P(8 + t * 36, 62.5 + row * 4.5, 17.5 - Math.sin(t * Math.PI) * 1.1)); inst.setMatrixAt(i, m); }
  scene.add(inst);
}
export const roomLights = [];
[[20, 82, 17], [20, 98, 17], [20, 114, 17], [20, 52, 17], [20, 36, 17], [30, 16, 17], [30, 24, 17], [26, 66, 9], [26, 56, 8], [26, 82, 8], [73, 24, 8], [74, 76, 8], [36, 40, 8], [26, 114, 7]].forEach(([x, y, z]) => { const l = new THREE.PointLight('#ffb96b', 0, 14, 1.6); l.position.copy(P(x, y, z)); scene.add(l); roomLights.push(l); });
const rainGeo = new THREE.BufferGeometry(); const RN = 1800; const rp = new Float32Array(RN * 3);
for (let i = 0; i < RN; i++) { rp[i * 3] = -25 + Math.random() * 80; rp[i * 3 + 1] = Math.random() * 30; rp[i * 3 + 2] = 15 - Math.random() * 70; }
rainGeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
export const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: '#d6e4ef', size: 0.07, transparent: true, opacity: 0.65 }));
rain.visible = false; scene.add(rain);
export function updateRain(dt) { const p = rainGeo.attributes.position; for (let i = 0; i < RN; i++) { let y = p.getY(i) - dt * 22; if (y < 0) y += 30; p.setY(i, y); } p.needsUpdate = true; }

// ------------------------------------------------------------ the model
export const groups = { base: new THREE.Group(), groof: new THREE.Group(), upper: new THREE.Group(), roof: new THREE.Group() };
Object.values(groups).forEach(g => scene.add(g));
const ROOF_RE = /^(U_.*_Roof_|RoofDeck|RoofRail|Pergola|Solar_|Water_Tank|Yoga_Mat|Roof_Table|Skylight|CR_|Canopy_|WBalcony_Canopy|Stair_Canopy|Cafe_Roof|Activity_Roof|Rail_RoofBridge|Roof_Bridge|Ext_Landing_2|Rail_ExtLanding2|Ext_Stair_2|Rail_Ext2)/;
const GROOF_RE = /^G_.*_Roof_/;
const UPPER_RE = /^(U_|Dorm[A-E]_|F1_|F2_|P_F|P_Dorm|WBalcony|Balcony_|Founders_Balcony|Gallery_Walkway|Gallery_Outer|Rail_Gallery|Rail_Balcony|Rail_ExtLanding1|Ext_Landing_1|Rail_WBalcony|Rail_Gallery_Courtyard)/;
const classify = (n) => ROOF_RE.test(n) ? 'roof' : GROOF_RE.test(n) ? 'groof' : UPPER_RE.test(n) ? 'upper' : 'base';
export const glassMats = []; export const pickables = []; export let collider = null; export const vehicles = {};

function boxUV(g) {
  const p = g.attributes.position, n = g.attributes.normal; const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    if (ax >= ay && ax >= az) { uv[i * 2] = p.getZ(i); uv[i * 2 + 1] = p.getY(i); } else if (ay >= az) { uv[i * 2] = p.getX(i); uv[i * 2 + 1] = p.getZ(i); } else { uv[i * 2] = p.getX(i); uv[i * 2 + 1] = p.getY(i); }
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}


// ------------------------------------------------------------ free CC0 assets (Kenney furniture + nature kits, Quaternius characters)
// Blender's placeholder furniture is swapped for these at load time: each piece's bounding box tells us where the asset goes.
export const ASSETS = {}; let ANIMS = []; export const propBoxes = {};
async function loadAssets(onProgress) {
  try {
    const res = await fetch('./assets.b64.txt'); if (!res.ok) throw new Error('no assets');
    const total = +res.headers.get('content-length') || 5700000; const reader = res.body.getReader(); const chunks = []; let got = 0;
    for (;;) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); got += value.length; onProgress(Math.min(1, got / total)); }
    const map = JSON.parse(new TextDecoder().decode(await new Blob(chunks).arrayBuffer()));
    const loader = new GLTFLoader();
    await Promise.all(Object.entries(map).map(async ([k, b64]) => {
      const bin = atob(b64); const buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      const g = await new Promise((r2, rj) => loader.parse(buf.buffer, './', r2, rj));
      if (k === 'c:Casual_Male') ANIMS = g.animations;
      g.scene.updateMatrixWorld(true);
      ASSETS[k] = { scene: g.scene, box: new THREE.Box3().setFromObject(g.scene) };
      g.scene.traverse(o => { if (o.isMesh && o.material && !k.startsWith('c:')) { const m = o.material; m.envMapIntensity = 0.6; m.roughness = 0.8; m.metalness = 0;
        const c = RECOLOR[m.name] || (k === 'n:crops_bambooStageB' && m.name === 'grass' ? '#7f9a3e' : null); if (c) m.color.set(c); if (/^metal/.test(m.name)) { m.roughness = 0.45; m.metalness = 0.5; } } });
    }));
  } catch (e) { console.warn('CC0 assets unavailable, keeping simple shapes', e); }
}
// Kenney's kits are pastel; pull them toward the hostel's real palette (teak, slate fabric, Shillong pine greens)
const RECOLOR = { wood: '#9b6b44', woodDark: '#6b4a32', carpet: '#55626d', carpetWhite: '#e9e5dc', metal: '#b9bdc0', metalLight: '#e6e8e7', metalMedium: '#5b6367', metalDark: '#2f3437',
  plant: '#3f7a34', grass: '#4f8636', leafsDark: '#2d5128', leafsGreen: '#4a7a33', woodBark: '#5d4332', woodBarkDark: '#4d382b', leafsFall: '#d9822f', colorRed: '#c9443f', colorYellow: '#e2b53c', colorPurple: '#8a5bb0' };
const BUSHES = ['n:plant_bush', 'n:plant_bushDetailed', 'n:plant_bushLarge'], FLOWERS = ['n:flower_redA', 'n:flower_yellowA', 'n:flower_purpleA'], CROPS = ['n:crops_leafsStageB', 'n:crop_carrot', 'n:crops_cornStageB', 'n:crop_pumpkin', 'n:crops_leafsStageB'];
// [name regex (group 1 = which piece it belongs to), asset(s), how to fit, which way it faces]
const PROPS = [
  [/^(Dorm[A-E]_Bunk\d+)_/, 'f:bedBunk', 'box'],
  [/^((?:Chef|F1|F2)_Bed)_/, 'f:bedDouble', 'box'],
  [/^(Desk_\d+_\d+|Booth_\d_Desk|Chef_Desk)_/, 'f:desk', 'box', 'chair'],
  [/^(CoChair_\d+_\d+|Booth_\d_Chair|Meet_[NS]\d|Chef_Chair|Reception_Stool)_/, 'f:chairDesk', 'box', 'back'],
  [/^(Act_Chair_\d_\d)_/, 'f:chair', 'box', 'back'],
  [/^(Dorm[A-E]_WorkChair\d|F[12]_DeskChair)$/, 'f:chairDesk', 'box', 'table'],
  [/^(Deck_Chair_\d_\d|Dorm[A-E]_WBal_Chair\d|Balcony_Chair_\d)$/, 'f:chair', 'box', 'table'],
  [/^(Cafe_InStool_\d_\d|Pav_Stool_\d|Dorm[A-E]_Stool\d)$/, 'f:stoolBar', 'box'],
  [/^(Cafe_InTable_\d|Deck_Table_\d|Roof_Table_\d|Dorm[A-E]_WBal_Table)(?:_leg)?$/, 'f:tableRound', 'box'],
  [/^(Dining_Table\d|Meeting_Table|Folding_Table|Dorm[A-E]_Table)_(?:leg\d|top)$/, 'f:table', 'box'],
  [/^(Pav_Coffee|Reception_Coffee)_/, 'f:tableCoffee', 'box'],
  [/^(Pav_Sofa\d|Reception_Sofa|F[12]_Sofa)(?:_?Back)?$/, 'f:loungeSofa', 'box', 'back'],
  [/^(Washer_\d)(?:_door)?$/, 'f:washer', 'box', 'door'],
  [/^(Toilet_\d)$/, 'f:toilet', 'box'],
  [/^(Pav_Plant)(?:er)?_(\d)$/, 'f:pottedPlant', 'u'],
  [/^(Planter_\d)_Green$/, BUSHES, 'scatter'],
  [/^(Tree_\d)_/, ['n:tree_pineTallA_detailed', 'n:tree_pineTallB_detailed', 'n:tree_detailed'], 'h'],
  [/^(WG\d_Bamboo)(?:Foliage)?_(\d+)/, 'n:crops_bambooStageB', 'hx'],
  [/^(WG\d_BambooLeaf_\d+)$/, null, 'hide'],
  [/^(WG\d_Shrub_\d+)$/, BUSHES, 'u'],
  [/^(WG\d_Flower_\d+)$/, FLOWERS, 'u'],
  [/^(Veg_\d+_\d+)$/, CROPS, 'u'],
];
const propOf = (n) => { for (const r of PROPS) { const m = r[0].exec(n); if (m) return { key: m[1] + (m[2] && /^\d+$/.test(m[2]) ? '_' + m[2] : ''), rule: r }; } return null; };
const hsh = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return (h >>> 0) / 4294967296; };
function placeProps(inst, anchors) {
  const buckets = new Map(); const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), C = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  const add = (asset, grp, pos, yaw, sx, sy, sz, center) => {
    const a = ASSETS[asset]; if (!a) return false;
    const off = center ? a.box.getCenter(new THREE.Vector3()).setY(a.box.min.y) : new THREE.Vector3(0, a.box.min.y, 0);
    a.scene.traverse((o) => {
      if (!o.isMesh) return;
      const g = o.geometry.clone(); for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
      if (!g.index) { const ix = new Uint32Array(g.attributes.position.count); for (let i = 0; i < ix.length; i++) ix[i] = i; g.setIndex(new THREE.BufferAttribute(ix, 1)); }
      g.applyMatrix4(o.matrixWorld); g.translate(-off.x, -off.y, -off.z);
      g.applyMatrix4(M.compose(pos, Q.setFromAxisAngle(Y, yaw), S.set(sx, sy, sz)));
      const mats = Array.isArray(o.material) ? o.material : [o.material]; const mat = mats[0];
      const key = grp + '|' + mat.uuid; if (!buckets.has(key)) buckets.set(key, { grp, mat, geos: [] }); buckets.get(key).geos.push(g);
    });
    return true;
  };
  const done = new Set();
  for (const [key, it] of inst) {
    const [, asset, mode, face] = it.rule; const b = it.box; if (mode === 'hide') { done.add(key); continue; }
    const size = b.getSize(new THREE.Vector3()), ctr = b.getCenter(new THREE.Vector3()); const r = hsh(key);
    const pick = Array.isArray(asset) ? asset[Math.floor(r * asset.length)] : asset; const A = ASSETS[pick]; if (!A) continue;
    const ms = A.box.getSize(new THREE.Vector3()); const bottom = new THREE.Vector3(ctr.x, b.min.y, ctr.z);
    let ok = false;
    if (mode === 'box') {
      let dir = null; // which way the front should point
      if (face === 'back' && it.back) { const bc = it.back.getCenter(new THREE.Vector3()); dir = ctr.clone().sub(bc); }
      else if (face === 'door' && it.back) { dir = it.back.getCenter(new THREE.Vector3()).sub(ctr); }
      else if (face === 'table' || face === 'chair') { let best = null, bd = 9; for (const a of anchors[face]) { const d = a.distanceTo(ctr); if (d > 0.05 && d < bd) { bd = d; best = a; } } if (best) dir = best.clone().sub(ctr); }
      let yaw;
      if (dir && (Math.abs(dir.x) > 1e-3 || Math.abs(dir.z) > 1e-3)) { yaw = Math.abs(dir.x) > Math.abs(dir.z) ? (dir.x > 0 ? Math.PI / 2 : -Math.PI / 2) : (dir.z > 0 ? 0 : Math.PI); }
      else yaw = ((ms.x > ms.z) === (size.x > size.z)) ? 0 : Math.PI / 2;
      const swap = Math.abs(Math.sin(yaw)) > 0.5;
      ok = add(pick, it.grp, bottom, yaw, (swap ? size.z : size.x) / ms.x, size.y / ms.y, (swap ? size.x : size.z) / ms.z, true);
    } else if (mode === 'h') { const k = size.y / ms.y; ok = add(pick, it.grp, bottom, r * 6.28, k, k, k, true); }
    else if (mode === 'hx') { const k = Math.min(size.x / ms.x, size.z / ms.z) * 1.1; ok = add(pick, it.grp, bottom, r * 6.28, k, size.y / ms.y, k, true); }
    else if (mode === 'u') { const k = Math.min(size.x / ms.x, size.z / ms.z, size.y / ms.y) * 1.15; ok = add(pick, it.grp, bottom, r * 6.28, k, k, k, true); }
    else if (mode === 'scatter') {
      const n = Math.max(2, Math.min(9, Math.round(size.x * size.z / 0.5))); const cols = Math.max(1, Math.round(Math.sqrt(n * size.x / Math.max(0.1, size.z)))); const rows = Math.ceil(n / cols);
      for (let i = 0; i < n; i++) { const p2 = BUSHES[Math.floor(hsh(key + i) * 3)]; const m2 = ASSETS[p2]?.box.getSize(new THREE.Vector3()); if (!m2) continue;
        const cell = Math.min(size.x / cols, size.z / rows); const k = cell / Math.max(m2.x, m2.z) * 1.2;
        ok = add(p2, it.grp, new THREE.Vector3(b.min.x + (i % cols + 0.5) * size.x / cols, b.min.y + size.y * 0.6, b.min.z + (Math.floor(i / cols) + 0.5) * size.z / rows), hsh(key + 'r' + i) * 6.28, k, k, k, true) || ok; }
    }
    if (ok) done.add(key);
  }
  for (const bk of buckets.values()) {
    const merged = mergeGeometries(bk.geos, false); if (!merged) continue;
    const mesh = new THREE.Mesh(merged, bk.mat); mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.grp = bk.grp;
    groups[bk.grp].add(mesh); pickables.push(mesh);
  }
  return done;
}

export async function loadModel(onProgress) {
  let pm = 0, pa = 0; const prog = () => onProgress(Math.min(1, pm * 0.47 + pa * 0.53));
  const assetsP = loadAssets((f) => { pa = f; prog(); });
  const res = await fetch('./model.b64.txt');
  const total = +res.headers.get('content-length') || 4950000; const reader = res.body.getReader(); const chunks = []; let got = 0;
  for (;;) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); got += value.length; pm = Math.min(1, got / total); prog(); }
  const text = new TextDecoder().decode(await new Blob(chunks).arrayBuffer());
  const bin = atob(text.trim()); const buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  const gltf = await new Promise((res2, rej) => new GLTFLoader().parse(buf.buffer, './', res2, rej));
  await assetsP;
  const haveAssets = Object.keys(ASSETS).length > 0; const inst = new Map(); const anchors = { table: [], chair: [] }; const held = [];
  const buckets = new Map(); const solid = [];
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    let top = o; while (top.parent && top.parent !== gltf.scene) top = top.parent;
    const name = top.name || o.name || '';
    const vm = /^(Scooter|Bike)_(\d+)_/.exec(name);
    if (vm) { // keep each scooter / bike separate so it can leave when rented
      const key = vm[1] + vm[2]; if (!vehicles[key]) { vehicles[key] = new THREE.Group(); vehicles[key].userData = { type: vm[1], idx: +vm[2] }; scene.add(vehicles[key]); }
      const vg = o.geometry.clone(); vg.applyMatrix4(o.matrixWorld); for (const k of Object.keys(vg.attributes)) if (k !== 'position' && k !== 'normal') vg.deleteAttribute(k);
      prepMaterial(o.material); const vmesh = new THREE.Mesh(vg, o.material); vmesh.castShadow = true; vehicles[key].add(vmesh); return;
    }
    const grp = classify(name);
    const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
    if (/(Table|Desk_\d|Desk_top|WorkCounter_top|Counter)/.test(name)) { g.computeBoundingBox(); anchors.table.push(g.boundingBox.getCenter(new THREE.Vector3())); }
    if (/(CoChair_\d+_\d+_seat|Booth_\d_Chair_seat|Chef_Chair_seat|WorkChair|DeskChair)/.test(name)) { g.computeBoundingBox(); anchors.chair.push(g.boundingBox.getCenter(new THREE.Vector3())); }
    const pr = haveAssets ? propOf(name) : null;
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.index) { const a = new Uint32Array(g.attributes.position.count); for (let i = 0; i < a.length; i++) a[i] = i; g.setIndex(new THREE.BufferAttribute(a, 1)); }
    boxUV(g);
    const mat = o.material; const key = grp + '|' + mat.uuid;
    if (pr) { g.computeBoundingBox(); let it = inst.get(pr.key); if (!it) inst.set(pr.key, it = { rule: pr.rule, grp, box: new THREE.Box3(), back: null, parts: [] }); it.box.union(g.boundingBox); it.parts.push({ key, grp, mat, g });
      if (/(back|Back|door)$/.test(name)) { it.back = (it.back || new THREE.Box3()).union(g.boundingBox); } }
    else { if (!buckets.has(key)) buckets.set(key, { grp, mat, geos: [] }); buckets.get(key).geos.push(g); }
    const see = /Glass|Polycarbonate|Label/.test(mat.name) || /^(Tree_|WG\d_Bamboo|WG\d_Flower|Veg_|Umbrella)/.test(name);
    if (!see) { const c = new THREE.BufferGeometry(); c.setAttribute('position', g.attributes.position); c.setIndex(g.index); solid.push(c); }
  });
  if (inst.size) { // swap placeholders for the CC0 models; anything that couldn't be placed keeps its Blender shape
    const placed = placeProps(inst, anchors); for (const [k, it] of inst) propBoxes[k] = it.box;
    for (const [k, it] of inst) if (!placed.has(k)) for (const p of it.parts) { if (!buckets.has(p.key)) buckets.set(p.key, { grp: p.grp, mat: p.mat, geos: [] }); buckets.get(p.key).geos.push(p.g); }
  }
  const seen = new Set();
  for (const b of buckets.values()) {
    if (!seen.has(b.mat)) { prepMaterial(b.mat); if (/Glass/.test(b.mat.name)) glassMats.push(b.mat); seen.add(b.mat); }
    const merged = mergeGeometries(b.geos, false); if (!merged) continue;
    const mesh = new THREE.Mesh(merged, b.mat); mesh.userData.grp = b.grp;
    if (b.mat.transparent) mesh.renderOrder = 2; else { mesh.castShadow = true; mesh.receiveShadow = true; }
    groups[b.grp].add(mesh); pickables.push(mesh);
  }
  // invisible ramps so you can step up from the paths onto the plinth-height floors
  const ramp = (x0, x1, y0, y1, zA, zB) => { const v = [P(x0, y0, zA), P(x1, y0, zB), P(x1, y1, zB), P(x0, y1, zA)]; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v.flatMap(q => q.toArray()), 3)); g.setIndex([0, 1, 2, 0, 2, 3]); return g; };
  solid.push(ramp(46, 49.2, 36, 106, 1.9, 0.12), ramp(63.8, 66, 56, 96, 0.12, 1.25), ramp(56.5, 59, 1.5, 4, 0.1, 0.62));
  const cg = mergeGeometries(solid, false); cg.boundsTree = new MeshBVH(cg);
  collider = new THREE.Mesh(cg); collider.visible = false;
}

// ------------------------------------------------------------ sky + time of day
const DUSK = new THREE.Color('#f2b28a'), DAYFOG = new THREE.Color('#c9d8e0'), NIGHTFOG = new THREE.Color('#0d1525'), STORMFOG = new THREE.Color('#7f8b94');
export function updateSky(minute, flags, battery) {
  const h = minute / 60; const ang = (h - 6) / 12 * Math.PI; const elev = Math.sin(ang);
  const day = clamp((elev + 0.08) / 0.35, 0, 1);
  const sp = new THREE.Vector3(Math.cos(ang) * 0.75, elev, -0.45 + 0.15 * Math.cos(ang)).normalize();
  su.sunPosition.value.copy(sp); su.turbidity.value = flags.storm ? 14 : 5; su.rayleigh.value = flags.storm ? 3 : 1.4;
  sun.position.copy(sun.target.position).addScaledVector(sp, 90);
  sun.intensity = 2.8 * day * (flags.storm ? 0.3 : 1);
  sun.color.setHSL(0.08, 0.7, 0.62 + 0.3 * day);
  hemi.intensity = 0.12 + 0.65 * day; hemi.color.setHSL(0.58, 0.5, 0.35 + 0.5 * day);
  scene.environmentIntensity = 0.15 + 0.85 * day;
  renderer.toneMappingExposure = 0.55 + 0.4 * day;
  const dusk = clamp(1 - Math.abs(elev) / 0.3, 0, 1);
  const fog = scene.fog.color; fog.copy(NIGHTFOG).lerp(DAYFOG, day).lerp(DUSK, dusk * 0.4 * day);
  if (flags.storm) fog.lerp(STORMFOG, 0.6 * day);
  scene.fog.near = flags.storm ? 50 : 140; scene.fog.far = flags.storm ? 260 : 700;
  const night = 1 - day; const cut = flags.powerCut && !battery && night > 0.5 ? 0.12 : 1;
  for (const m of glassMats) m.emissiveIntensity = night * (m.name === 'Glass_Lit' ? 1.5 : 0.85) * cut;
  bulbMat.color.setRGB(1, 0.85, 0.62).multiplyScalar(0.3 + night * 1.3 * cut);
  for (const l of roomLights) l.intensity = 14 * night * cut;
  rain.visible = !!flags.storm;
}

// ------------------------------------------------------------ people meshes
const personMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, metalness: 0 });
function colored(geo, hex) { const c = new THREE.Color(hex); const n = geo.attributes.position.count; const a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'color'].includes(k)) geo.deleteAttribute(k); return geo; }
const SKIN = ['#8d5a3b', '#a8714a', '#c68b5e', '#d9a47a', '#e8bf98', '#6e4630'];
const HAIR = ['#1b1714', '#2b1d14', '#3a2a1c', '#4b3a2a', '#151515', '#6b4a2a'];
const PANTS = ['#2d3a52', '#3c3c3c', '#5b5140', '#22303f', '#4a4f3a', '#2a2a2a'];
export const SHIRTS = {
  nightly: ['#2a9d8f', '#3a8fb7', '#4f7cac', '#2f9e7a', '#5b8c9a'], monthly: ['#e76f51', '#d9603b', '#c75b39', '#e0873e', '#cc6a4c'],
  staff: ['#f1f1ec'], visitor: ['#8d99ae', '#9a8f80', '#7f8c8d'], owner: ['#e9c46a'], local: ['#7a6a9a', '#6a7a5a'],
};
export function makeSimplePerson({ shirt, seed = 1, apron = false }) {
  let s = seed % 2147483647 || 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; const pk = (a) => a[Math.floor(rnd() * a.length)];
  const skin = pk(SKIN), hair = pk(HAIR), pants = pk(PANTS); const tall = 0.92 + rnd() * 0.14;
  const torso = colored(new THREE.CapsuleGeometry(0.17, 0.36, 4, 10), shirt); torso.scale(1, 1, 0.72); torso.translate(0, 1.18, 0);
  const hips = colored(new THREE.CapsuleGeometry(0.155, 0.08, 4, 10), pants); hips.scale(1, 1, 0.75); hips.translate(0, 0.9, 0);
  const neck = colored(new THREE.CylinderGeometry(0.05, 0.055, 0.1, 8), skin); neck.translate(0, 1.47, 0);
  const head = colored(new THREE.SphereGeometry(0.115, 16, 12), skin); head.scale(0.95, 1.08, 1); head.translate(0, 1.62, 0);
  const hairG = colored(new THREE.SphereGeometry(0.123, 16, 10, 0, Math.PI * 2, 0, Math.PI * (0.45 + rnd() * 0.2)), hair); hairG.translate(0, 1.645, -0.008);
  const parts = [torso, hips, neck, head, hairG];
  if (apron) { const ap = colored(new THREE.BoxGeometry(0.3, 0.5, 0.02), '#2f5d45'); ap.translate(0, 1.0, 0.135); parts.push(ap); }
  const body = new THREE.Mesh(mergeGeometries(parts), personMat);
  const legGeo = () => { const l = colored(new THREE.CapsuleGeometry(0.07, 0.6, 4, 8), pants); l.translate(0, -0.38, 0); const sh = colored(new THREE.BoxGeometry(0.1, 0.07, 0.22), '#2a2420'); sh.translate(0, -0.79, 0.04); return mergeGeometries([l, sh]); };
  const armGeo = () => { const a = colored(new THREE.CapsuleGeometry(0.055, 0.46, 4, 8), shirt); a.translate(0, -0.27, 0); const hand = colored(new THREE.SphereGeometry(0.05, 8, 6), skin); hand.translate(0, -0.56, 0); return mergeGeometries([a, hand]); };
  const g = new THREE.Group(); g.add(body);
  const legL = new THREE.Mesh(legGeo(), personMat), legR = new THREE.Mesh(legGeo(), personMat); legL.position.set(-0.08, 0.86, 0); legR.position.set(0.08, 0.86, 0);
  const armL = new THREE.Mesh(armGeo(), personMat), armR = new THREE.Mesh(armGeo(), personMat); armL.position.set(-0.22, 1.42, 0); armR.position.set(0.22, 1.42, 0);
  armL.rotation.z = 0.08; armR.rotation.z = -0.08;
  g.add(legL, legR, armL, armR); g.scale.setScalar(tall);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  return { group: g, legL, legR, armL, armR, body };
}
function animateSimplePerson(p, moving, phase, dt) {
  const k = moving ? 1 : 0; const sw = Math.sin(phase) * 0.6 * k;
  const lerp = (a, b) => a + (b - a) * Math.min(1, dt * 10);
  p.legL.rotation.x = lerp(p.legL.rotation.x, sw); p.legR.rotation.x = lerp(p.legR.rotation.x, -sw);
  p.armL.rotation.x = lerp(p.armL.rotation.x, -sw * 0.8); p.armR.rotation.x = lerp(p.armR.rotation.x, sw * 0.8);
  p.body.position.y = moving ? Math.abs(Math.cos(phase)) * 0.025 : lerp(p.body.position.y, 0);
}

// ------------------------------------------------------------ people: Quaternius rigged characters (CC0), procedural fallback
const OUTFIT = {
  chef: ['Chef_Male', 'Chef_Female'], gardener: ['Worker_Male', 'Worker_Female'], cleaner: ['Worker_Male', 'Worker_Female'], laundry: ['Worker_Male', 'Worker_Female'],
  techie: ['Casual3_Male', 'Casual3_Female'], reception: ['Casual2_Male', 'Casual2_Female'], community: ['Casual2_Male', 'Casual2_Female'], photographer: ['Casual3_Male', 'Casual3_Female'],
  owner: ['Suit_Male', 'Suit_Female'],
  guest: [['Casual_Male', 'Casual2_Male', 'Casual3_Male', 'Casual_Bald'], ['Casual_Female', 'Casual2_Female', 'Casual3_Female']],
};
const TINT_MAT = /^(Shirt|Clothes|Top|Jacket|Sweater|Hoodie)$/i;
export function makePerson(opts) {
  const { shirt, seed = 1, apron = false, role, female, kind } = opts;
  if (!ASSETS['c:Casual_Male'] || !ANIMS.length) return makeSimplePerson({ shirt, seed, apron });
  let s = seed % 2147483647 || 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; const pk = (a) => a[Math.floor(rnd() * a.length)];
  const fem = female ?? rnd() < 0.45; rnd();
  const o = OUTFIT[role] || OUTFIT[kind] || OUTFIT.guest;
  let name = Array.isArray(o[0]) ? pk(o[fem ? 1 : 0]) : o[fem ? 1 : 0];
  if (!ASSETS['c:' + name]) name = fem ? 'Casual_Female' : 'Casual_Male';
  const src = ASSETS['c:' + name].scene; const model = SkeletonUtils.clone(src);
  const skin = new THREE.Color(pk(SKIN)), hair = new THREE.Color(pk(HAIR)); const tintShirt = !OUTFIT[role] && shirt;
  model.traverse((m) => {
    if (!m.isMesh) return; m.castShadow = true; m.frustumCulled = false;
    const fix = (mt) => { const c = mt.clone(); c.envMapIntensity = 0.5; c.roughness = 0.8; c.metalness = 0;
      if (/^Skin$/i.test(mt.name)) c.color.copy(skin).convertSRGBToLinear();
      else if (/^Hair$/i.test(mt.name)) c.color.copy(hair).convertSRGBToLinear();
      else if (tintShirt && TINT_MAT.test(mt.name)) c.color.set(shirt).convertSRGBToLinear();
      return c; };
    m.material = Array.isArray(m.material) ? m.material.map(fix) : fix(m.material);
  });
  const tall = 0.93 + rnd() * 0.12; const k = 1.72 * tall / (ASSETS['c:' + name].box.max.y - ASSETS['c:' + name].box.min.y);
  model.scale.setScalar(k);
  const g = new THREE.Group(); g.add(model);
  const mixer = new THREE.AnimationMixer(model); const act = {};
  for (const c of ANIMS) act[c.name] = mixer.clipAction(c);
  act.Idle.play(); act.Idle.time = rnd() * 2;
  const dummy = new THREE.Object3D(); // old procedural rigs had arm/leg handles; keep harmless stand-ins
  return { group: g, model, mixer, act, cur: 'Idle', rigged: true, legL: dummy, legR: dummy, armL: dummy, armR: new THREE.Object3D(), body: dummy, lastPhase: 0 };
}
export function animatePerson(p, moving, phase, dt, opt) {
  if (!p.rigged) return animateSimplePerson(p, moving, phase, dt);
  const want = opt && opt.pose ? opt.pose : moving ? (opt && opt.carry ? 'Walk_Carry' : 'Walk') : 'Idle';
  if (want !== p.cur && p.act[want]) { const from = p.act[p.cur], to = p.act[want]; to.reset().play(); if (want === 'SitDown') { to.setLoop(THREE.LoopOnce, 1); to.clampWhenFinished = true; } from.crossFadeTo(to, 0.25, false); p.cur = want; }
  if (opt && opt.time != null) { p.mixer.setTime(opt.time); return; } // film frames: absolute time
  if (moving) { const dp = Math.max(0, phase - p.lastPhase); const sp = dt > 0 ? dp / dt : 7.7; p.act.Walk.timeScale = p.act.Walk_Carry.timeScale = Math.max(0.6, Math.min(2.6, sp / 7.7)); }
  p.lastPhase = phase; p.mixer.update(Math.min(dt, 0.1));
}

addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); labelRenderer.setSize(innerWidth, innerHeight); });
export const isMobile = mobile;
