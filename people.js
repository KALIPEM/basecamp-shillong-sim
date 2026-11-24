// Basecamp Shillong — the people: who they are, what they want from you, and what happens in their lives.
// Pure data + functions (no DOM). Effects are plain objects that econ.js applies.

const ORIGINS = [
  { place: 'Shillong', w: 3, first: ['Ibasuk', 'Daphisha', 'Wanphrang', 'Kitboklang', 'Banri', 'Shanborlang', 'Iohbha', 'Rilang', 'Badap', 'Pynshngain', 'Larisa', 'Teibor'], last: ['Lyngdoh', 'Kharkongor', 'Syiem', 'Marbaniang', 'Nongrum', 'Wahlang', 'Kharbuli', 'Rymbai'] },
  { place: 'Guwahati', w: 2, first: ['Ankur', 'Pallavi', 'Bikash', 'Rimpi', 'Hiranya', 'Manjit'], last: ['Baruah', 'Saikia', 'Das', 'Bora', 'Hazarika'] },
  { place: 'Kohima', w: 1, first: ['Vikhozo', 'Neisa', 'Atono', 'Kevi'], last: ['Angami', 'Sema', 'Kikon'] },
  { place: 'Bengaluru', w: 3, first: ['Aarav', 'Ananya', 'Rohan', 'Meera', 'Kiran', 'Nisha', 'Arjun', 'Tara'], last: ['Rao', 'Iyer', 'Shetty', 'Nair', 'Menon', 'Reddy'] },
  { place: 'Mumbai', w: 2, first: ['Kabir', 'Zoya', 'Dev', 'Riya', 'Neel'], last: ['Mehta', 'Kapoor', 'Shah', 'Desai'] },
  { place: 'Delhi', w: 2, first: ['Aditi', 'Rahul', 'Esha', 'Ishaan', 'Sana'], last: ['Sharma', 'Verma', 'Malhotra', 'Khan'] },
  { place: 'Kolkata', w: 2, first: ['Sayan', 'Trisha', 'Arka', 'Debolina'], last: ['Banerjee', 'Sen', 'Ghosh', 'Mukherjee'] },
  { place: 'Kochi', w: 1, first: ['Anand', 'Lakshmi', 'Jithin', 'Neethu'], last: ['Menon', 'Pillai', 'Thomas'] },
  { place: 'Berlin', w: 1, first: ['Lena', 'Jonas', 'Mia'], last: ['Schmidt', 'Becker'] },
  { place: 'Osaka', w: 1, first: ['Yuki', 'Haruto'], last: ['Tanaka', 'Sato'] },
  { place: 'Melbourne', w: 1, first: ['Tom', 'Ivy', 'Ewan'], last: ['Walker', 'Nguyen'] },
  { place: 'Lisbon', w: 1, first: ['Sara', 'Marco'], last: ['Costa', 'Silva'] },
];
const LOCAL = ORIGINS[0];
const JOBS = ['backend developer', 'product designer', 'college student', 'travel vlogger', 'nurse on a break', 'school teacher', 'data scientist', 'freelance writer', 'PhD researcher studying orchids', 'musician', 'photographer', 'UX researcher', 'marketing lead', 'doctor', 'architect'];
export const TRAITS = {
  chatty: 'loves a long chat', introvert: 'keeps to themselves', foodie: 'judges a place by its breakfast', earlybird: 'up at 5 for the sunrise',
  nightowl: 'works past midnight', adventurer: 'wants to do every trail', picky: 'notices everything', generous: 'tips everyone',
};
const IDEAS = [['Pine Pay', 'UPI checkout for Northeast craft sellers'], ['Living Root AI', 'crop disease detection for Khasi farmers'], ['Umiam Mobility', 'shared EV scooters for hill towns'], ['Cloudline Health', 'telemedicine for remote villages'],
  ['Orange Ledger', 'bookkeeping for small shops'], ['Laitlum Tours', 'book local guides in two taps'], ['Monsoon Labs', 'landslide alerts for hill roads'], ['Khasi Hills Craft', 'a D2C brand for bamboo homeware'],
  ['Ridge Learn', 'coding classes in Khasi and English'], ['Mist Stack', 'dev tools for tiny teams'], ['Bamboo Grid', 'solar micro-grids for villages'], ['Cherry Foods', 'packaged Khasi snacks']];

const pick = (r, a) => a[Math.floor(r() * a.length)];
function wpick(r, list) { const t = list.reduce((a, x) => a + x.w, 0); let v = r() * t; for (const x of list) if ((v -= x.w) <= 0) return x; return list[0]; }

export function makeProfile(r, type, usedIdeas = []) {
  const o = type === 'staff' ? LOCAL : wpick(r, ORIGINS);
  const p = { first: pick(r, o.first), last: pick(r, o.last), origin: o.place, trait: pick(r, Object.keys(TRAITS)), rel: 20, mood: 0, look: Math.floor(r() * 1e6) };
  p.name = `${p.first} ${p.last}`;
  p.age = type === 'staff' ? 22 + Math.floor(r() * 30) : 21 + Math.floor(r() * 18);
  if (type === 'monthly') {
    const free = IDEAS.filter(i => !usedIdeas.includes(i[0])); const idea = pick(r, free.length ? free : IDEAS);
    p.startup = idea[0]; p.idea = idea[1]; p.stage = 0; p.job = 'founder';
  } else if (type === 'nightly') p.job = pick(r, JOBS);
  return p;
}
export const STAGES = ['building the first version', 'talking to customers', 'getting first users', 'chasing first revenue', 'raising a small round'];

// ---------- small talk: what people say when you just walk up ----------
export function smallTalk(st, who, kind, r) {
  const s = st.sat; const low = Object.entries({ clean: s.clean, food: s.food, wifi: s.wifi, vibe: s.vibe, comfort: s.comfort, value: s.value }).sort((a, b) => a[1] - b[1])[0];
  const gripe = {
    clean: 'Honestly, the bathrooms could be cleaner. Someone left a mess this morning.',
    food: "Breakfast is fine, but I'd kill for something more local. Jadoh, maybe?",
    wifi: 'The Wi-Fi drops every time three people get on a call.',
    vibe: "It's a bit quiet in the evenings. An event or a jam night would be nice.",
    comfort: "The beds are OK. My back says otherwise though, haha.",
    value: "It's lovely, but a little pricey for a dorm bed, to be honest.",
  }[low[0]];
  const praise = ['The courtyard under that clear roof is my favourite spot.', 'Waking up to the mist over Umiam is unreal.', 'The café coffee is seriously good.', 'Everyone here is so easy to talk to.', 'I came for two nights and keep wanting to stay.'];
  const t = who.trait;
  if (kind === 'staff') {
    if (who.morale < 35) return `Things are hard right now, ${st.playerName}. Too much work, not enough hands. I'm thinking about my options.`;
    if (who.morale > 80) return pick(r, [`I like working here. It feels like ours.`, `Busy day, but a good one! The guests are nice this week.`, `Thank you for looking after us, ${st.playerName}.`]);
    return pick(r, [`All good. ${s.clean < 70 && who.role === 'cleaner' ? "Though honestly we're stretched with this many guests." : 'Just keeping things moving.'}`, `The mist is heavy today. Guests keep asking about the root bridges.`, `Did you hear? ${pick(r, ['the Lajong match is on tonight', 'the road to Sohra is clear again', 'oranges are cheap at Iewduh this week'])}.`]);
  }
  if (kind === 'owner') return pick(r, [`Numbers look ${st.yesterday && st.yesterday.revenue.beds > 15000 ? 'good' : 'tight'} this week. Let's keep going.`, `I'm fixing the Wi-Fi router. Again.`, `Did you see that review? We need more of those.`]);
  if (kind === 'monthly') {
    const stage = STAGES[Math.min(STAGES.length - 1, who.stage || 0)];
    if (who.rel > 70) return `${who.startup} is ${stage}. Honestly, ${st.playerName}, being here changed how I build. I might stay in Shillong for good.`;
    return pick(r, [`Still ${stage} for ${who.startup}. ${who.idea[0].toUpperCase() + who.idea.slice(1)}. It's slow, but it's moving.`, gripe, `If you ever want a demo of ${who.startup}, grab me in co-working.`]);
  }
  if (t === 'introvert' && who.rel < 40) return 'Oh, hi. Yes, all good, thanks.';
  if (t === 'foodie' && s.food < 75) return "I'll be honest: breakfast needs work. Local food would make this place.";
  if (t === 'picky') return gripe;
  if (t === 'adventurer') return pick(r, ['Tomorrow: Nongriat, all 3,000 steps. Wish me luck.', 'Any trail you love that tourists skip?', 'Laitlum at sunrise was insane.']);
  if (t === 'nightowl' && s.wifi < 75) return 'The Wi-Fi gives up around midnight, exactly when I start working.';
  if (t === 'chatty') return `I'm from ${who.origin}, ${who.job}. ${pick(r, praise)} ${low[1] < 65 ? gripe : ''}`;
  return pick(r, [...praise, gripe]);
}

// ---------- concerns: things people bring to you, with real choices ----------
// who: 'guest' (nightly), 'founder' (monthly), 'staff' (any), 'staff:<role>', 'local' (a neighbour/business)
// eff keys: cash(-spend), earn, mood, rel, morale, staffMorale, rep, aw, incub, vibe, nights, rateMult, salary, off, hosting, contract, flag, leave, gamble
export const CONCERNS = {
  wifi_slow: {
    who: 'guest', w: (st) => st.sat.wifi < 75 ? 3 : 0.2,
    text: (p) => `${p.first}: "The Wi-Fi keeps dropping and I have a client call at 4. Is there anything you can do?"`,
    choices: [
      { label: 'Lend them your phone hotspot for the call', eff: { mood: 12, rel: 10 } },
      { label: 'Give them a phone booth and a coffee (₹120)', eff: { cash: 120, mood: 9, rel: 5 } },
      { label: '"We\'re working on it"', eff: { mood: -6 } },
    ], ignore: { mood: -8 },
  },
  dirty_bath: {
    who: 'guest', w: (st) => st.sat.clean < 75 ? 3 : 0.15,
    text: (p, st) => `${p.first}: "The bathroom in our dorm hasn't been cleaned since morning. It's pretty gross."`,
    choices: [
      { label: 'Clean it yourself, right now', eff: { mood: 12, rel: 12 } },
      { label: 'Ask a cleaner to drop everything', eff: { mood: 7, staffMorale: -3 } },
      { label: 'Apologise and promise it will be done tonight', eff: { mood: -3 } },
    ], ignore: { mood: -10, rep: -0.01 },
  },
  cold_night: {
    who: 'guest', w: (st, m) => [11, 0, 1].includes(m) ? 2.5 : 0,
    text: (p) => `${p.first}: "It's freezing at night. Do you have extra blankets?"`,
    choices: [
      { label: 'Buy extra blankets for every bed (₹4,500)', eff: { cash: 4500, mood: 8, flag: ['blankets', 60] } },
      { label: 'Give them a hot water bottle (₹300)', eff: { cash: 300, mood: 6 } },
      { label: '"Welcome to Shillong winters!"', eff: { mood: -5 } },
    ], ignore: { mood: -6 },
    skip: (st) => st.flags.blanketsUntil >= st.day,
  },
  tour_reco: {
    who: 'guest', w: () => 1.2,
    text: (p) => `${p.first}: "Living root bridges or Laitlum tomorrow? What would you do?"`,
    choices: [
      { label: 'Book them with a local guide (you earn ₹350)', need: (st) => st.upgrades.guides != null, eff: { earn: [350, 'tours'], mood: 8, rel: 5 } },
      { label: 'Sketch them a map with your secret viewpoint', eff: { mood: 7, rel: 12 } },
      { label: '"Google it, honestly"', eff: { mood: -3 } },
    ], ignore: {},
  },
  birthday: {
    who: 'guest', w: () => 0.6,
    text: (p) => `${p.first} mentions it's their birthday today. They're travelling alone.`,
    choices: [
      { label: 'Surprise cake from the café at dinner (₹450)', eff: { cash: 450, mood: 22, rel: 20, aw: 0.01, news: 'The whole dining hall sang for {first}\'s birthday. Someone filmed it.' } },
      { label: 'Wish them and buy them a coffee (₹120)', eff: { cash: 120, mood: 8, rel: 8 } },
      { label: 'Just wish them', eff: { mood: 3, rel: 3 } },
    ], ignore: {},
  },
  noise: {
    who: 'guest', w: (st) => st.occ > 18 ? 1.5 : 0.3,
    text: (p) => `${p.first}: "Some people in my dorm were loud until 2 am. I barely slept."`,
    choices: [
      { label: 'Set quiet hours from 11 pm, and enforce them', eff: { mood: 10, flag: ['quiet', 30], vibe: -1 } },
      { label: 'Move them to a quieter bed and give earplugs (₹50)', eff: { cash: 50, mood: 7 } },
      { label: '"It\'s a hostel, that\'s the vibe"', eff: { mood: -8 } },
    ], ignore: { mood: -6 }, skip: (st) => st.flags.quietUntil >= st.day,
  },
  extend: {
    who: 'guest', w: (st) => st.occ < 26 ? 1 : 0,
    text: (p) => `${p.first}: "I love it here. Could I stay 3 more nights? Any discount?"`,
    choices: [
      { label: 'Yes, 20% off for the extra nights', eff: { nights: 3, rateMult: 0.8, mood: 10, rel: 10 } },
      { label: 'Yes, at the normal price', eff: { gamble: [0.55, { nights: 3, mood: 4 }, { mood: -2, say: 'They decided to move on after all.' }] } },
      { label: 'Throw in a free scooter day (₹0, they stay 4 nights)', need: (st) => true, eff: { nights: 4, mood: 14, rel: 12, rateMult: 1 } },
    ], ignore: { mood: -2 },
  },
  vegan: {
    who: 'guest', w: () => 0.7,
    text: (p) => `${p.first}: "I'm vegan. Is there anything for me at breakfast besides toast?"`,
    choices: [
      { label: 'Ask the chef for a vegan plate each day (+₹40/day food cost)', eff: { mood: 12, rel: 8, chefMorale: -2, cash: 120 } },
      { label: 'Fruit and poha from the café (₹0)', eff: { mood: 4 } },
      { label: '"We can skip the egg for you"', eff: { mood: -4 } },
    ], ignore: { mood: -5 },
  },
  express_laundry: {
    who: 'guest', w: () => 0.9,
    text: (p) => `${p.first}: "I've run out of clean clothes and I'm leaving tomorrow. Laundry by tonight?"`,
    choices: [
      { label: 'Express wash & dry (₹250)', eff: { earn: [250, 'laundry'], mood: 6 } },
      { label: 'Normal wash, ready by morning (₹150)', eff: { earn: [150, 'laundry'], mood: 2 } },
      { label: 'Do it free, it\'s a small thing', eff: { mood: 10, rel: 10 } },
    ], ignore: { mood: -4 },
  },
  // founders on monthly stays
  server_request: {
    who: 'founder', w: (st) => st.hosting.customers.length < st.hosting.slots ? 2 : 0,
    text: (p) => `${p.first} (${p.startup}): "Cloud bills are killing us. Could we run our staging server in your server room?"`,
    choices: [
      { label: 'Yes, a dev box at your listed price', eff: { hosting: 'dev', rel: 6 } },
      { label: 'First month free, then the listed price', eff: { hosting: 'devfree', rel: 15 } },
      { label: '"We don\'t really do that"', eff: { rel: -5 } },
    ], ignore: { rel: -3 },
  },
  quiet_room: {
    who: 'founder', w: () => 1,
    text: (p) => `${p.first}: "I have an investor demo tomorrow at 11. Can I have the meeting room?"`,
    choices: [
      { label: 'It\'s yours, free, and I\'ll make sure nobody walks in', eff: { rel: 14, mood: 8, incub: 0.01 } },
      { label: 'Sure, ₹300 for the slot', eff: { earn: [300, 'desks'], rel: 2 } },
      { label: 'Sorry, it\'s booked', eff: { rel: -6, mood: -4 } },
    ], ignore: { rel: -4 },
  },
  cofounder_fight: {
    who: 'founder', w: () => 0.6,
    text: (p) => `${p.first} looks wrecked: "My co-founder wants to pivot ${p.startup}. I don't. We haven't spoken in two days."`,
    choices: [
      { label: 'Sit with them for an hour and talk it through', eff: { rel: 20, mood: 10, incub: 0.02, stage: 1, news: '{first} and their co-founder agreed on a plan for {startup} after a long talk in the courtyard.' } },
      { label: 'Suggest a long walk around Umiam to clear their head', eff: { rel: 8, mood: 5 } },
      { label: 'Stay out of it', eff: { mood: -3 } },
    ], ignore: { mood: -5 },
  },
  cash_crunch: {
    who: 'founder', w: (st) => 0.5,
    text: (p) => `${p.first}: "Our payment from a client is late. Can I pay this month's rent in two weeks?"`,
    choices: [
      { label: 'Yes, pay when you can', eff: { gamble: [0.8, { rel: 15, mood: 8 }, { cash: 3750, rel: 10, say: 'They could only pay half in the end.' }] } },
      { label: 'Swap one month\'s rent for 1% of the startup', eff: { equity: 1, rel: 10 } },
      { label: '"Rules are rules, sorry"', eff: { rel: -15, mood: -12, gamble: [0.35, { leave: true, say: 'They packed up and left the next morning.' }, {}] } },
    ], ignore: { mood: -6 },
  },
  investor_intro: {
    who: 'founder', w: (st) => st.incubRep > 0.35 ? 1 : 0.2,
    text: (p) => `${p.first}: "Do you know any angel investors? ${p.startup} is ready for a small round."`,
    choices: [
      { label: 'Write a warm intro to your best contact', eff: { rel: 12, gamble: [0.3, { stage: 2, news: '{startup} closed a small angel round after your intro. {first} bought cake for the whole co-working room.', incub: 0.05 }, { rel: 2 }] } },
      { label: 'Invite them to pitch at your next fundraising night', eff: { rel: 8, incub: 0.01 } },
      { label: '"Not really, sorry"', eff: { rel: -2 } },
    ], ignore: {},
  },
  // staff
  raise: {
    who: 'staff', w: (st) => 0.9,
    text: (p) => `${p.first} (${p.roleLabel}): "Prices at the market keep going up. Could I get a ₹1,500 raise?"`,
    choices: [
      { label: 'Yes, ₹1,500 more a month', eff: { salary: 1500, morale: 25, rel: 10 } },
      { label: 'A one-time ₹3,000 bonus instead', eff: { cash: 3000, morale: 12 } },
      { label: '"Not right now"', eff: { morale: -15 } },
    ], ignore: { morale: -10 },
  },
  leave: {
    who: 'staff', w: () => 0.6,
    text: (p) => `${p.first} (${p.roleLabel}): "My cousin is getting married in Jowai. Can I take 3 days off?"`,
    choices: [
      { label: 'Paid leave, and take some cake for the family (₹500)', eff: { cash: 500, off: 3, morale: 22, rel: 12 } },
      { label: 'Unpaid leave', eff: { off: 3, morale: 4 } },
      { label: '"We\'re too busy this week"', eff: { morale: -25 } },
    ], ignore: { morale: -12 },
  },
  chef_idea: {
    who: 'staff:chef', w: () => 0.6,
    text: (p) => `${p.first} (chef): "What if we did a proper Khasi dinner every Friday? Jadoh, doh khlieh, the works."`,
    choices: [
      { label: 'Do it, and put it on the café board too (₹2,500 setup)', eff: { cash: 2500, morale: 15, flag: ['khasiNight', 9999], aw: 0.02 } },
      { label: 'Try it once and see', eff: { cash: 1200, morale: 6, vibe: 1 } },
      { label: '"Let\'s keep the menu simple"', eff: { morale: -8 } },
    ], ignore: { morale: -4 }, skip: (st) => st.flags.khasiNightUntil > st.day,
  },
  overworked: {
    who: 'staff:cleaner', w: (st) => st.occ > st.cleanCap ? 3 : 0,
    text: (p) => `${p.first} (cleaner): "We can't keep up with this many guests. Something has to give."`,
    choices: [
      { label: 'Overtime pay for the next two weeks (₹4,000)', eff: { cash: 4000, morale: 10, flag: ['overtime', 14] } },
      { label: 'Promise to hire someone soon', eff: { morale: 2, promise: 'cleaner' } },
      { label: '"Work faster"', eff: { morale: -20 } },
    ], ignore: { morale: -12 },
  },
  // locals
  farmer_deal: {
    who: 'local', w: (st) => st.flags.farmerDeal ? 0 : 0.5,
    text: () => `Bah Hambok, a farmer from Mawphlang, offers fresh vegetables every week at 15% below the market. Storms might sometimes stop him coming.`,
    choices: [
      { label: 'Shake hands on it', eff: { flag: ['farmerDeal', 9999], news: 'Bah Hambok\'s first delivery came in: carrots, ginger and a huge jackfruit nobody asked for.' } },
      { label: 'Decline politely', eff: {} },
    ], ignore: {},
  },
  neighbour: {
    who: 'local', w: (st) => st.occ > 15 ? 0.5 : 0.1,
    text: () => `Your neighbour Kong Rida complains about music on the roof deck after 10 pm.`,
    choices: [
      { label: 'Invite her family for dinner and agree on quiet hours (₹900)', eff: { cash: 900, flag: ['quiet', 30], rep: 0.01, news: 'Kong Rida came for dinner and stayed until 11, telling stories about old Shillong.' } },
      { label: 'Close the roof at 10 pm', eff: { vibe: -1 } },
      { label: 'Ignore it', eff: { gamble: [0.4, { cash: 5000, say: 'She called the police. A ₹5,000 fine for noise.' }, {}] } },
    ], ignore: { gamble: [0.3, { cash: 5000, say: 'She called the police. A ₹5,000 fine for noise.' }, {}] },
  },
  room_rental: {
    who: 'local', w: (st) => !st.events.scheduled ? 0.6 : 0,
    text: () => `A Shillong design studio wants to rent your activity room this Saturday for a workshop. They offer ₹8,000.`,
    choices: [
      { label: 'Accept', eff: { earn: [8000, 'events'], vibe: 1 } },
      { label: 'Counter at ₹12,000', eff: { gamble: [0.5, { earn: [12000, 'events'] }, { say: 'They found another venue.' }] } },
      { label: 'Decline', eff: {} },
    ], ignore: {},
  },
  laundry_contract: {
    who: 'local', w: (st) => st.laundry.contracts.length < 3 ? 0.5 : 0,
    text: () => `A homestay near Umiam wants you to wash their linen: about 40 kg a week at ₹55/kg.`,
    choices: [
      { label: 'Take the contract', eff: { contract: { name: 'Umiam homestay', kg: 40, rate: 55 } } },
      { label: 'Ask for ₹70/kg', eff: { gamble: [0.5, { contract: { name: 'Umiam homestay', kg: 40, rate: 70 } }, { say: 'They went with the dhobi in town.' }] } },
      { label: 'Decline', eff: {} },
    ], ignore: {},
  },
  hosting_local: {
    who: 'local', w: (st) => st.hosting.customers.length < st.hosting.slots ? 0.5 : 0,
    text: () => `A Police Bazaar travel agency wants to host its booking website on your server instead of an overseas cloud.`,
    choices: [
      { label: 'Offer web hosting at your listed price', need: (st) => st.upgrades.fibre != null, eff: { hosting: 'web' } },
      { label: 'Offer a dev box (no business fibre yet)', eff: { hosting: 'dev' } },
      { label: 'Decline', eff: {} },
    ], ignore: {},
  },
  fire_check: {
    who: 'local', w: () => 0.25,
    text: () => `The fire department will inspect next week. Your extinguishers are past their refill date.`,
    choices: [
      { label: 'Refill and add two more (₹6,000)', eff: { cash: 6000, news: 'Fire inspection passed without a single note.' } },
      { label: 'Wing it', eff: { gamble: [0.35, { cash: 25000, rep: -0.03, say: 'The inspection failed: ₹25,000 fine.' }, { say: 'The inspector was in a hurry. You got lucky.' }] } },
    ], ignore: { gamble: [0.35, { cash: 25000, rep: -0.03, say: 'The inspection failed: ₹25,000 fine.' }, {}] },
  },
};

// ---------- life updates: the news feed ----------
export function lifeNews(st, r, people) {
  const out = [];
  const { guests, founders, staff } = people;
  const g = guests.length ? pick(r, guests) : null, f = founders.length ? pick(r, founders) : null, s = staff.length ? pick(r, staff) : null;
  const pool = [];
  if (g) pool.push(
    `${g.first} from ${g.origin} climbed down to the double-decker root bridge at Nongriat and came back limping and happy.`,
    `${g.first} met someone from ${pick(r, ['Pune', 'Leh', 'Chennai', 'Paris'])} over dinner. They're already planning a trip to Dawki together.`,
    `${g.first} (${g.job}) spent the whole afternoon sketching the courtyard.`,
    `${g.first} posted a sunrise reel from your roof deck. ${Math.floor(200 + r() * 4000)} likes and counting.`,
  );
  if (g && g.origin !== 'Shillong') pool.push(`${g.first} tried jadoh for the first time and asked for a second plate.`);
  if (f) pool.push(
    `${f.first} shipped a new version of ${f.startup} at 3 am in co-working. The kettle was the only witness.`,
    `${f.startup} got its ${pick(r, ['first', 'tenth', 'first paying'])} customer today. ${f.first} rang the reception bell twice.`,
    `${f.first} gave a 10-minute demo of ${f.startup} to whoever was at breakfast. Two people signed up.`,
    `${f.first} is pulling an all-nighter. The chef left a plate of momos by their desk.`,
  );
  if (s) pool.push(
    `${s.first} (${s.roleLabel}) ${pick(r, ["'s son passed his class 10 boards with distinction", ' won second place at a Khasi cooking contest in Police Bazaar', ' has been with Basecamp for a while now and knows every guest by name', "'s grandmother turned 90. Everyone signed a card"])}.`,
  );
  pool.push(
    pick(r, ['Shillong Lajong won at home tonight. The courtyard got loud.', 'Traffic on GS Road is terrible. Some arrivals will run late.', 'The Ward\'s Lake boats are running again.', 'Mist rolled over Umiam so thick at 7 am you couldn\'t see the water.', 'Oranges from Sohra are in season. The café made fresh juice.', 'A busker at Police Bazaar played Bob Dylan in Khasi. Two guests filmed the whole thing.']),
  );
  const n = r() < 0.6 ? 1 : 2;
  for (let i = 0; i < n; i++) out.push(pick(r, pool));
  return [...new Set(out)];
}

export function fill(t, p) { return t.replace(/\{(\w+)\}/g, (_, k) => p[k] != null ? p[k] : ''); }
