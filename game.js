// 입찰 창구 404호 — 8비트 서류 검사 게임 (480×270 논리 화면)
(() => {
'use strict';
const W = 480, H = 270, FPS = 60;
const DATA = window.GAME_DATA;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
let K = 3, ROT = false;
const TOUCH = !!((window.matchMedia && matchMedia('(pointer:coarse)').matches) || ('ontouchstart' in window) || navigator.maxTouchPoints > 0);
const TOTAL_APPS = DATA.days.reduce((s, d) => s + d.applicants.length, 0);
const TOTAL_FLAWED = DATA.days.reduce((s, d) => s + d.applicants.filter(a => a.flaw).length, 0); // 부정 업체 수(14)
const isCatch = l => l.kind === 'caught' || l.kind === 'wrongreason'; // 반려해서 막음(사유가 달라도 계약은 막음)
const weekCaught = () => G.perDay.reduce((s, r) => s + ((r && r.log) || []).filter(isCatch).length, 0);

// ───────── 색 (8비트 UI 팔레트) ─────────
const C = {
  ink: '#1a1424', navy: '#28305c', blue: '#3c5aa8', sky: '#7ab4e8', cream: '#f6eedc', paper: '#fffaf0',
  line: '#d9ccb4', gray: '#5e5870', dgray: '#4a4458', red: '#d63c3c', dred: '#8c2030', green: '#3ca050',
  dgreen: '#1e6436', yellow: '#f6c445', orange: '#e8853a', teal: '#2f9c9c', wood: '#8c5430', white: '#ffffff', pink: '#f09cb0',
};

// ───────── 설정(저장) ─────────
const OPT = { instant: false, calm: false, zoom: TOUCH };
try { Object.assign(OPT, JSON.parse(localStorage.getItem('ppg404_opts')) || {}); } catch (e) {}
function saveOpt() { try { localStorage.setItem('ppg404_opts', JSON.stringify(OPT)); } catch (e) {} }

// ───────── 화면 맞추기: 휴대폰 세로면 화면을 눕혀 크게 ─────────
function resize() {
  const vw = innerWidth, vh = innerHeight;
  ROT = TOUCH && vh > vw * 1.1;
  const aw = ROT ? vh : vw, ah = ROT ? vw : vh;
  const s = Math.min(aw / W, ah / H);
  const cw = Math.floor(W * s), ch = Math.floor(H * s), st = cv.style;
  st.width = cw + 'px'; st.height = ch + 'px';
  if (ROT) { st.position = 'absolute'; st.left = Math.round((vw - cw) / 2) + 'px'; st.top = Math.round((vh - ch) / 2) + 'px'; st.transform = 'rotate(90deg)'; }
  else { st.position = ''; st.left = ''; st.top = ''; st.transform = ''; }
  K = Math.max(2, Math.min(4, Math.ceil(s * (devicePixelRatio || 1))));
  cv.width = W * K; cv.height = H * K;
  ctx.imageSmoothingEnabled = false;
}
// 세로로 들어오면 처음 한 번 회전 안내(DOM, 글자는 똑바로). 누르거나 가로로 돌리면 사라짐
let rotDone = false;
const rotEl = document.getElementById('rot');
function rotGuide() {
  if (!rotEl) return;
  if (!ROT && !rotEl.hidden) rotDone = true;
  rotEl.hidden = !(ROT && !rotDone);
}
if (rotEl) rotEl.addEventListener('pointerup', e => { e.preventDefault(); rotDone = true; rotEl.hidden = true; });
addEventListener('resize', () => { resize(); rotGuide(); }); resize(); rotGuide();

// ───────── 그림 ─────────
const IMG = {};
for (const [k, v] of Object.entries(window.IMAGES || {})) { const im = new Image(); im.src = v; IMG[k] = im; }
const silCache = {};
function silhouette(name, color) {
  const key = name + color;
  if (silCache[key]) return silCache[key];
  const im = IMG[name]; if (!im || !im.complete) return null;
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
  const x = c.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  return (silCache[key] = c);
}
function spr(name, x, y, o = {}) {
  const im = o.sil ? silhouette(name, o.sil) : IMG[name];
  if (!im || (im.complete === false)) return;
  if (window.__drawSpy) window.__drawSpy('spr', name, Math.round(x), Math.round(y), o.sw || im.width * (o.scale || 1), o.sh || im.height * (o.scale || 1)); // QA 겹침 검사용(평소엔 없음)
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  if (o.flip) { ctx.translate(Math.round(x) + im.width, Math.round(y)); ctx.scale(-1, 1); ctx.drawImage(im, 0, 0); }
  else if (o.sx != null) ctx.drawImage(im, o.sx, o.sy, o.sw, o.sh, Math.round(x), Math.round(y), o.sw, o.sh);
  else if (o.scale) ctx.drawImage(im, Math.round(x), Math.round(y), im.width * o.scale, im.height * o.scale);
  else ctx.drawImage(im, Math.round(x), Math.round(y));
  ctx.restore();
}
const iw = n => (IMG[n] && IMG[n].width) || 0, ih = n => (IMG[n] && IMG[n].height) || 0;
function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function frameRect(x, y, w, h, c, t = 1) { rect(x, y, w, t, c); rect(x, y + h - t, w, t, c); rect(x, y, t, h, c); rect(x + w - t, y, t, h, c); }
// 8비트 상자: 검은 테두리 + 밝은 안쪽 선
function box(x, y, w, h, fill, edge = C.ink, hi = null) {
  if (window.__drawSpy) window.__drawSpy('box', fill, x, y, w, h);
  rect(x + 1, y, w - 2, h, edge); rect(x, y + 1, w, h - 2, edge);
  rect(x + 1, y + 1, w - 2, h - 2, fill);
  if (hi) { rect(x + 2, y + 2, w - 4, 1, hi); rect(x + 2, y + 2, 1, h - 4, hi); }
}
function fontOf(f) { return f === 9 ? '10px G9' : f === 'b' ? '12px G11B' : f === 'B' ? '24px G11B' : f === 'M' ? '18px G11B' : '12px G11'; }
function text(s, x, y, o = {}) {
  ctx.font = fontOf(o.f); ctx.textBaseline = 'top'; ctx.textAlign = o.a || 'left';
  if (o.sh) { ctx.fillStyle = o.sh; ctx.fillText(s, Math.round(x) + 1, Math.round(y) + 1); }
  if (o.out) { ctx.fillStyle = o.out; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ctx.fillText(s, Math.round(x) + dx, Math.round(y) + dy); }
  ctx.fillStyle = o.c || C.ink; ctx.fillText(s, Math.round(x), Math.round(y));
  if (window.__drawSpy) { const w0 = ctx.measureText(s).width, a = o.a || 'left'; window.__drawSpy('text', String(s), Math.round(x - (a === 'center' ? w0 / 2 : a === 'right' ? w0 : 0)), Math.round(y), w0, o.f === 9 ? 10 : o.f === 'B' ? 24 : o.f === 'M' ? 18 : 12); }
}
function tw(s, f) { ctx.font = fontOf(f); return ctx.measureText(s).width; }
function wrap(s, maxW, f) {
  const out = [], s0 = s;
  // 수+단위('세 장', '4 명')·짧은 수식 사이 띄어쓰기는 붙여 둔다(\u00a0) — 줄은 띄어쓰기에서만 끊고, 한 단어가 칸보다 길 때만 글자 단위로
  s = String(s).replace(/(^|[\s(])(한|두|세|네|다섯|여섯|일곱|여덟|아홉|열|몇|\d[\d,]*) (?=(장|명|곳|개|번|모|대|칸|건|가지|일|시|분|원|조|봉|살|년|달|주|쪽|줄|억|만)(?![가-힣]{3}))/g, '$1$2\u00a0');
  const greedy = (para, W) => {
    const r = []; let line = '';
    for (const word of para.split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (tw(t, f) <= W) { line = t; continue; }
      if (line) r.push(line);
      let w = word;
      while (tw(w, f) > W) { let i = w.length; while (i > 1 && tw(w.slice(0, i), f) > W) i--; r.push(w.slice(0, i)); w = w.slice(i); }
      line = w;
    }
    r.push(line); return r;
  };
  for (const para of s.split('\n')) {
    let r = greedy(para, maxW);
    // 외톨이 줄 방지: 마지막 줄이 칸의 30% 미만이면(예: '곳', '같음') 폭을 조금씩 줄여 다시 나눠
    // 줄 수가 같고 마지막 줄이 30% 이상인 나눔을 쓴다(줄 수·칸 크기는 그대로)
    const orphan = q => q.length >= 2 && q[q.length - 1] && tw(q[q.length - 1], f) < maxW * 0.3;
    if (orphan(r)) for (let k = 0.97; k >= 0.55; k -= 0.03) {
      const q = greedy(para, maxW * k);
      if (q.length === r.length && !orphan(q)) { r = q; break; }
      if (q.length > r.length) break;
    }
    out.push(...r);
  }
  if (window.__wrapSpy) window.__wrapSpy(s0, maxW, f, out); // QA용 줄바꿈 감시(평소엔 없음)
  return out;
}
// 타자 효과용: 전체 문장으로 줄을 나눈 뒤 보이는 글자 수(n)만큼만 잘라 낸다 — 글자가 늘어나는 동안 어절이 줄 사이를 뛰지 않게
function wrapTyped(s, n, maxW, f) {
  s = String(s); const full = wrap(s, maxW, f), out = []; let pos = 0;
  const ns = s.replace(/\u00a0/g, ' ');
  for (const L of full) {
    const L2 = L.replace(/\u00a0/g, ' '); let i = ns.indexOf(L2, pos); if (i < 0) i = pos;
    if (n <= i) break;
    out.push(L.slice(0, n - i)); pos = i + L2.length;
  }
  return out;
}
// (w14) 줄 수 제한으로 잘리면 마지막 줄 끝에 '…' — 말없이 중간에서 끊기지 않게
function clip(lines, n, maxW, f) { if (lines.length <= n) return lines; const r = lines.slice(0, n); if (n > 0) r[n - 1] = fit(lines.slice(n - 1).join(' '), maxW, f); if (window.__clipSpy) window.__clipSpy(lines.join(' '), r); return r; }
function fit(s, maxW, f) { s = String(s); if (tw(s, f) <= maxW) return s; let i = s.length; while (i > 1 && tw(s.slice(0, i) + '…', f) > maxW) i--; return s.slice(0, i) + '…'; }
// 픽셀 동그라미(표시)
function pixEllipse(cx, cy, rx, ry, c, prog = 1) {
  const n = Math.max(24, Math.round((rx + ry) * 2.2));
  for (let i = 0; i < n * prog; i++) {
    const a = -Math.PI * 0.8 + (i / n) * Math.PI * 2.15;
    rect(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), 2, 2, c);
  }
}
function arrow(x, y, dir, c = C.yellow) { // 깜빡이는 화살표 (dir: down/up/left/right)
  const b = Math.floor(T / 15) % 2 ? 2 : 0;
  for (let i = 0; i < 6; i++) {
    const L = 11 - i * 2;
    if (dir === 'down') { rect(x - L / 2 - 1, y + i + b - 1, L + 2, 1, C.ink); rect(x - L / 2, y + i + b, L, 1, c); }
    if (dir === 'up') { rect(x - L / 2, y - i - b, L, 1, c); }
    if (dir === 'right') { rect(x + i + b, y - L / 2, 1, L, c); }
    if (dir === 'left') { rect(x - i - b, y - L / 2, 1, L, c); }
  }
}
// 작은 판정 아이콘(14px): ok=초록 동그라미, bad=빨간 가위표, skip=회색 줄
function verdictIcon(x, y, kind) {
  if (kind === 'ok') { box(x, y, 14, 14, C.green); pixEllipse(x + 6, y + 6, 3, 3, C.white); }
  else if (kind === 'skip') { box(x, y, 14, 14, C.line); rect(x + 3, y + 6, 8, 2, C.dgray); }
  else { box(x, y, 14, 14, C.red); for (let i = 0; i < 7; i++) { rect(x + 3 + i, y + 3 + i, 2, 2, C.white); rect(x + 9 - i, y + 3 + i, 2, 2, C.white); } }
}

// ───────── 소리: audio/audio.js(SND) — 효과음 ZzFX, 배경음 악보 작곡·칩튠 직접 합성 음원(bgm.js) ─────────
const SFX_ALIAS = { click: 'menuSelect', paper: 'pageFlip', ok: 'correct', bad: 'wrong', coin: 'score', whoosh: 'transition', alarm: 'hurry', open: 'magnify', fanfare: 'newRule' };
function sfx(n, arg) { SND.sfx(SFX_ALIAS[n] || n, arg); }
function music(n, after) { SND.music(n, after); }
const daySong = di => di >= 4 ? 'ai' : 'work' + (di + 1);

// ───────── 입력: 누를 때 표시, 뗄 때 실행(누른 채 밖으로 빼면 취소) ─────────
let hits = [], lastRows = [], pointer = { x: -1, y: -1 }, anyTap = null, pressed = null, kbd = false, keyHandler = null;
function hit(x, y, w, h, fn, o = {}) { hits.push({ x, y, w, h, fn, cur: o.cur !== false, btn: o.btn }); }
function toLogical(e) {
  const r = cv.getBoundingClientRect();
  if (ROT) return { x: (e.clientY - r.top) / r.height * W, y: (r.right - e.clientX) / r.width * H };
  return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
}
function findHit(p) { for (let i = hits.length - 1; i >= 0; i--) { const h = hits[i]; if (p.x >= h.x && p.x < h.x + h.w && p.y >= h.y && p.y < h.y + h.h) return h; } return null; }
const sameHit = (a, b) => a && b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
const inside = (p, x, y, w, h) => p && p.x >= x && p.x < x + w && p.y >= y && p.y < y + h;
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); SND.init(); kbd = false;
  const p = toLogical(e); pointer = p; pressed = { x: p.x, y: p.y, t: T, h: findHit(p) };
  try { cv.setPointerCapture(e.pointerId); } catch (er) {}
});
cv.addEventListener('pointerup', e => {
  e.preventDefault();
  const p = toLogical(e), pr = pressed; pressed = null;
  pointer = e.pointerType === 'mouse' ? p : { x: -1, y: -1 };
  if (!pr) return;
  const h = findHit(p);
  if (pr.h) { if (h && sameHit(h, pr.h)) h.fn(p); }
  else if (!h && anyTap) anyTap(p);
});
cv.addEventListener('pointercancel', () => { pressed = null; });
let lastHov = null;
cv.addEventListener('pointermove', e => {
  pointer = toLogical(e); const h = findHit(pointer); cv.style.cursor = h && h.cur ? 'pointer' : 'default';
  const id = h && h.cur && h.btn ? h.btn : null; if (id && id !== lastHov && e.pointerType === 'mouse') sfx('menuMove'); lastHov = id;
});
addEventListener('keydown', e => {
  SND.init(); kbd = true;
  const k = e.key, c = e.code;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(k)) e.preventDefault();
  if (c === 'KeyM') { toggleSound(); return; }
  if (SETTINGS) { settingsKey(k); return; }
  if (keyHandler) keyHandler(k, c);
});

// ───────── 공용 연출 ─────────
let T = 0; // 프레임 카운터
let shake = 0, flash = null, wipe = null;
const parts = [], pops = [];
function burst(x, y, c, n = 14, sp = 2.2) {
  if (OPT.calm) n = Math.ceil(n / 3);
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = sp * (0.4 + Math.random()); parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.2, c, life: 26 + Math.random() * 14 }); }
}
function popup(txt, x, y, c) { pops.push({ txt, x, y, t: 0, c }); }
function go(fn) { if (wipe) return; wipe = { t: 0, fn }; sfx('whoosh'); }
function drawFx() {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--;
    if (p.life <= 0) { parts.splice(i, 1); continue; }
    rect(Math.round(p.x), Math.round(p.y), 2, 2, p.c);
  }
  for (let i = pops.length - 1; i >= 0; i--) {
    const p = pops[i]; p.t++;
    if (p.t > 70) { pops.splice(i, 1); continue; }
    const jump = p.t < 8 ? [0, -4, -7, -9, -10, -9, -8, -8][p.t] : -8 - Math.floor((p.t - 8) / 8);
    if (p.t > 55 && p.t % 4 < 2) continue;
    text(p.txt, p.x, p.y + jump, { f: 'b', c: p.c, out: C.ink, a: 'center' });
  }
  if (flash) {
    flash.t--;
    if (flash.t <= 0) flash = null;
    else if (OPT.calm) { if (flash.t > 12) { ctx.globalAlpha = 0.12; rect(0, 0, W, H, flash.c); ctx.globalAlpha = 1; } }
    else if (flash.t % 6 < 3) { ctx.globalAlpha = 0.35; rect(0, 0, W, H, flash.c); ctx.globalAlpha = 1; }
  }
}
function drawWipe() {
  if (!wipe) return;
  wipe.t++;
  if (wipe.t === 15) { const f = wipe.fn; f(); }
  const p = wipe.t <= 15 ? wipe.t / 15 : 1 - (wipe.t - 15) / 15;
  const B = 30, cols = W / B, rows = H / B;
  for (let by = 0; by < rows; by++) for (let bx = 0; bx < cols; bx++) {
    const v = (bx + by) / (cols + rows - 2);
    const s = Math.max(0, Math.min(1, p * 2 - v)) * B;
    if (s > 0) rect(bx * B + (B - s) / 2, by * B + (B - s) / 2, s, s, C.ink);
  }
  if (wipe.t >= 30) wipe = null;
}

// ───────── 저장: 업체 하나 처리할 때마다 ─────────
const SAVE_KEY = 'ppg404_save';
function blankG() { return { day: 0, score: 0, ok: 0, total: 0, unfair: 0, missed: 0, saved: 0, leaked: 0, skipped: 0, perDay: [], mid: null }; }
function loadSave() {
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && Array.isArray(s.perDay) && s.day >= 0 && s.day < DATA.days.length && (s.day > 0 || s.mid)) return Object.assign(blankG(), s); } catch (e) {}
  return null;
}
function writeSave() { if (G && (G.taste || G.tutor)) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) {} }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
let G = null, scoreShown = 0;
function newGame() { G = blankG(); scoreShown = 0; }

// ───────── 서류 정의 ─────────
const DOCS = {
  bid: { name: '입찰서', head: C.navy, spr: 'envelope', f: [['company', '업체명'], ['item', '품명'], ['amount', '입찰금액'], ['ip', '투찰 IP'], ['kind', '계약 방식']] },
  reg: { name: '사업자등록증', head: C.teal, spr: 'paper', f: [['company', '상호'], ['rep', '대표자'], ['addr', '사업장'], ['opened', '개업일'], ['regno', '등록번호']] },
  site: { name: '현장 확인서', head: C.wood, spr: 'paper', f: [['photo', '현장 사진'], ['addr', '확인 주소'], ['staff', '상시 인원'], ['note', '조사 메모']] },
  staff: { name: '기술인력 명부', head: C.dgreen, spr: 'paper', f: [['p1', '기술인 1'], ['p2', '기술인 2'], ['p3', '기술인 3'], ['note', '비고']] },
  innov: { name: '혁신제품 지정서', head: C.blue, spr: 'cert', f: [['product', '제품명'], ['no', '지정번호'], ['until', '유효기간'], ['org', '지정기관']] },
  safety: { name: '안전 확인서', head: C.orange, spr: 'paper', f: [['record', '사고 기록'], ['action', '조치'], ['note', '비고']] },
};
const TABN = { bid: '입찰서', reg: '등록증', site: '현장 확인', staff: '기술인력', innov: '혁신 지정', safety: '안전 확인' };
const PHOTO_IMG = { cowork: 'office' }; // 사람이 일하는 공유 사무실은 사무실 그림을 쓴다
const PHOTO = { office: '사무실', emptylot: '빈 땅(풀밭)', sharedoffice: '공유 사무실(우편함만)', cowork: '공유 사무실', container: '컨테이너 사무실', kitchen: '작업장', warehouse: '창고', factory: '공장·작업장', farm: '농장(밭·비닐하우스)', shop: '가게·작업장' }; // 9차: 철물점은 가게 앞 사진
const fieldLabel = key => { const [d, f] = key.split('.'); const D = DOCS[d]; if (!D) return key; const x = D.f.find(z => z[0] === f); return D.name + '의 \'' + (x ? x[1] : f) + '\''; };
const fieldShort = key => { const [d, f] = key.split('.'); const D = DOCS[d]; if (!D) return key; const x = D.f.find(z => z[0] === f), lb = x ? x[1] : f, tn = TABN[d] || D.name; return lb.startsWith(tn.split(' ')[0]) ? lb : tn + ' › ' + lb; }; // (w15c) 탭 › 칸
// (w15d) 놓친 칸 안내: 늘 '탭 › 칸', 한 덩어리(줄은 칸 사이에서만 바뀜)
const fieldTab = key => { const [d, f] = key.split('.'); const D = DOCS[d]; if (!D) return key; const x = D.f.find(z => z[0] === f); return ((TABN[d] || D.name) + ' › ' + (x ? x[1] : f)).replace(/ /g, '\u00a0'); };
const fsn = fieldTab;
const NAMES = { boss: '공팀장', hero: '새봄', narr: '', slick: '나번쩍', granny: '오순두' }; // 9차: 창구 이름표·등록증 대표자와 같은 실명
function speakerName(who, a) { return (a && a.name) || (NAMES[who] != null ? NAMES[who] : '업체 대표'); }
const FACE = { normal: 0, happy: 1, upset: 2 };
const FACEY = { grandpa: 47, slick3: 52, farmer: 54, granny: 55, slick: 55, stationer: 56, sandman: 50 }; // 대화창 얼굴 자르기 기준(위에서 얼굴 중심 px)
const chSpr = (k, face) => 'ch_' + k + '_' + (FACE[face] != null ? FACE[face] : 0);
const won = n => { if (!n) return '0원'; const e = Math.floor(n / 1e8), m = Math.round((n % 1e8) / 1e4); return (e ? e + '억 ' : '') + (m ? m.toLocaleString() + '만' : '') + '원'; };
const amountOf = a => +(String((a.docs.bid || {}).amount || '0').replace(/[^0-9]/g, '')) || 0;
const companyOf = a => (a.docs.bid && a.docs.bid.company) || (a.docs.reg && a.docs.reg.company) || a.sprite;
const docsOf = a => Object.keys(DOCS).filter(k => a.docs && a.docs[k]);
// 날짜: data.js의 days[].date 하나만 쓴다 (HUD·신문·규정집·대사 공통)
function dateParts(di) { const s = (DATA.days[Math.min(di, DATA.days.length - 1)] || {}).date || ''; const m = s.match(/(\d{4})\.(\d{2})\.(\d{2})\s*\((.)\)/); return m ? { y: m[1], mo: +m[2], d: +m[3], w: m[4] } : null; }
function dateShort(di) {
  if (di >= DATA.days.length) { const p = dateParts(DATA.days.length - 1); return p ? p.mo + '.' + (p.d + 3) + '(월)' : ''; }
  const p = dateParts(di); return p ? p.mo + '.' + p.d + '(' + p.w + ')' : '';
}
const dateFull = di => (DATA.days[di] || {}).date || '';
function findApp(id) { for (let d = 0; d < DATA.days.length; d++) { const a = DATA.days[d].applicants.find(x => x.id === id); if (a) return { a, di: d }; } return { a: null, di: 0 }; }

// 판정 근거 문장 자동 생성 — 서류의 실제 값으로
// (w14) 목록 속 자리는 id로 찾는다 — 3분 맛보기 복제본은 indexOf가 -1이라 자기 자신을 '뒤에 온 업체'로 잡았음
function gwa(w) { const c = String(w).charCodeAt(String(w).length - 1) - 0xAC00; return c >= 0 && c < 11172 && c % 28 ? '과' : '와'; } // 받침 있으면 '과'
function posOf(list, a) { return list.findIndex(x => x === a || x.id === a.id); }
function prevSameIP(a, di) {
  const ip = a.docs.bid && a.docs.bid.ip; if (!ip) return null;
  // 같은 날 앞 업체가 있으면 그 업체. 다른 날이면 그 IP가 처음 '담합'으로 걸린 날을 가리킨다(AI 경고·팀장 대사와 같은 기준)
  { const L = DATA.days[di].applicants; for (let i = posOf(L, a) - 1; i >= 0; i--) if (L[i].docs.bid && L[i].docs.bid.ip === ip) return { a: L[i], d: di }; }
  for (let d = 0; d < di; d++) for (const x of DATA.days[d].applicants) if (x.flaw && x.flaw.rule === 'collusion' && x.docs.bid && x.docs.bid.ip === ip) return { a: x, d };
  for (let d = di; d >= 0; d--) {
    const list = DATA.days[d].applicants, end = d === di ? posOf(list, a) : list.length;
    for (let i = end - 1; i >= 0; i--) if (list[i].docs.bid && list[i].docs.bid.ip === ip) return { a: list[i], d };
  }
  return null;
}
function valOf(a, id) { const [d, f] = id.split('.'); const v = a.docs[d] && a.docs[d][f]; return f === 'photo' ? (PHOTO[v] || v) : v; }
// 기술인 이름이 앞서 받은 다른 업체 명부에도 있는지
function staffDup(a, di, name) {
  for (let d = di; d >= 0; d--) {
    const list = DATA.days[d].applicants, end = d === di ? posOf(list, a) : list.length;
    for (let i = end - 1; i >= 0; i--) { const s = list[i].docs.staff; if (s && [s.p1, s.p2, s.p3].some(p => p && p.split('·')[0].trim() === name)) return { a: list[i], d }; }
  }
  return null;
}
// 판정 근거 문장. marks(내 표시)·AI 경고와 관련된 근거가 맨 앞에 오도록 정렬한다
function evidence(a, di, marks) {
  const out = [], D = DATA.days[di], f = a.flaw, docs = a.docs, today = dateFull(di).split(' ')[0];
  if (f) {
    const used = new Set(), F = f.fields;
    if (f.rule === 'staffdup' && docs.staff) {
      for (const id of F.filter(x => /^staff\.p\d$/.test(x))) {
        const raw = docs.staff[id.split('.')[1]] || '', nm = raw.split('·')[0].trim(); if (!nm) continue;
        const p = staffDup(a, di, nm), note = docs.staff.note || '';
        if (p) out.push(`기술인 '${raw}' — ${p.d === di ? '앞 업체' : (p.d + 1) + '일차'} '${companyOf(p.a)}' 명부에도 있음(이중 등재)`);
        else if (note.includes(nm)) { out.push(`기술인 '${raw}' — 비고: ${note} → 이름만 빌림`); used.add('staff.note'); }
        else out.push(`기술인 '${raw}' — 실제 근무 확인 안 됨`);
        used.add(id);
      }
    }
    if ((F.includes('reg.addr') || F.includes('site.addr')) && docs.reg && docs.site && docs.reg.addr !== docs.site.addr) { out.push(`등록 주소 '${docs.reg.addr}' ≠ 확인 주소 '${docs.site.addr}'`); used.add('reg.addr'); used.add('site.addr'); }
    let ipLine = null; // 9차: IP가 이 규칙의 핵심(담합)이 아니면 규칙 핵심 근거 뒤로 미룬다 — 판정 상자 첫 줄·대사·신문이 같은 이유를 말하게
    if (F.includes('bid.ip')) { const p = prevSameIP(a, di); if (p) { const ipOut = f.rule === 'collusion' ? out : (ipLine = []); ipOut.push(`투찰 IP ${docs.bid.ip} = ${p.d === di ? '앞 업체' : (p.d + 1) + '일차' + (p.a.flaw && p.a.flaw.rule === 'collusion' ? ' 담합' : '')} '${companyOf(p.a)}' IP`); used.add('bid.ip'); if (F.includes('bid.amount')) { ipOut.push(`입찰금액 ${docs.bid.amount} ≈ '${companyOf(p.a)}' ${p.a.docs.bid.amount}`); used.add('bid.amount'); } } }
    if (f.rule === 'banned') { const r = docs.reg || {}; const b = (D.banlist || []).find(b => b.rep === r.rep || b.company === r.company || b.company === (docs.bid || {}).company); if (b) { out.push(`제재 명단 '${b.company} · ${b.rep}'(~${b.until})과 ${b.rep === r.rep ? '대표자' : '상호'} 일치`); used.add('reg.rep'); used.add('reg.company'); } }
    if (f.rule === 'safety' && docs.safety) { out.push(`${docs.safety.note} → 다수공급자계약 신규 등록 2년 제한`); used.add('safety.note'); used.add('bid.kind'); }
    if (F.includes('innov.until') && docs.innov) { out.push(`유효기간 ${docs.innov.until} — 오늘(${today})보다 앞, 특례 끝남`); used.add('innov.until'); }
    for (const id of F) if (!used.has(id)) { const v = valOf(a, id); if (v && v !== '-') out.push(`${fieldShort(id)}: ${v}`); }
    if (ipLine) out.push(...ipLine);
  } else {
    // 정상 업체: [관련 칸, 문장] 목록을 만든 뒤 내 표시·AI 경고와 관련된 것부터
    const E = [];
    if (docs.reg && docs.site) E.push([['reg.addr', 'site.addr'], docs.reg.addr === docs.site.addr ? `등록 주소 = 확인 주소 (${docs.site.addr})` : `주소: ${docs.reg.addr} / ${docs.site.addr}`]);
    if (docs.site) E.push([['site.photo', 'site.staff', 'site.note'], `현장: ${PHOTO[docs.site.photo] || docs.site.photo}, 상시 인원 ${docs.site.staff}` + (docs.site.note ? ` (${docs.site.note})` : '') + ' — 실제로 일하는 곳']);
    if (docs.staff) E.push([['staff.p1', 'staff.p2', 'staff.p3', 'staff.note'], `기술인력: ${docs.staff.note || '겹치는 이름 없음'}, 다른 회사 명부와 겹치는 이름 없음`]);
    if (docs.innov) E.push([['innov.until', 'innov.product', 'innov.no', 'innov.org', 'reg.opened'], `혁신제품 유효기간 ${docs.innov.until} — 오늘(${today}) 이후라 특례 유효`]);
    if (docs.safety) E.push([['safety.record', 'safety.action', 'safety.note'], `안전: 사고 기록 ${docs.safety.record}, ${docs.safety.note}`]);
    // (w13) 뒤에 같은 IP 업체가 오면(한마음가구) '겹치지 않음'은 하루 끝엔 틀린 말 → 심사 당시 기준 + 뒤에 조사 의뢰
    const later = docs.bid && docs.bid.ip ? D.applicants.slice(posOf(D.applicants, a) + 1).filter(x => x.id !== a.id && x.docs.bid && x.docs.bid.ip === docs.bid.ip) : [];
    if (docs.bid && docs.bid.ip && di >= 2) { const p = prevSameIP(a, di); E.push([['bid.ip', 'bid.amount'], p ? `투찰 IP가 '${companyOf(p.a)}'${gwa(companyOf(p.a))} 같지만 다른 단서 없음` : later.length ? '심사 당시엔 겹치는 IP 없음 · 같은 IP가 뒤에 또 오면 그때 함께 조사 의뢰' : '투찰 IP·금액이 다른 업체와 겹치지 않음']); }
    if ((D.banlist || []).length) E.push([['reg.rep', 'reg.company', 'bid.company'], `대표 '${(docs.reg || {}).rep || '-'}'·상호가 제재 명단에 없음`]);
    const want = [];
    for (const m of marks || []) want.push(m);
    if (later.length) want.push('bid.ip');
    const al = a.aiAlert || '';
    if (/IP/.test(al)) want.push('bid.ip'); if (/이름|제재|명단/.test(al)) want.push('reg.company'); if (/사진|낡|페이퍼/.test(al)) want.push('site.photo'); if (/유효|혁신|기간/.test(al)) want.push('innov.until');
    if (docs.innov) want.push('innov.until');
    const pri = e => { const i = want.findIndex(w => e[0].includes(w)); return i < 0 ? 99 : i; };
    E.sort((x, y) => pri(x) - pri(y));
    // 내 표시가 위 목록 어디에도 안 걸리면 그 칸 값을 맨 앞에 직접 적는다
    for (const m of (marks || []).slice().reverse()) if (!E.some(e => e[0].includes(m))) { const v = valOf(a, m); if (v) E.unshift([[m], `${fieldShort(m)} '${v}' — 규정 위반이 아니에요` + (m === 'reg.opened' ? ' (새 회사도 입찰 가능)' : '')]); }
    for (const e of E) out.push(e[1]);
  }
  return out;
}
const KIND_TITLE = { okpass: '정답! 통과', caught: '정답! 반려', wrongreason: '반려는 맞지만 사유가 달라요', missed: '놓쳤다!', unfair: '억울한 반려!', nogrounds: '근거 부족 (0점)', skipped: '미처리 (시간 초과)' };
function detailOf(a, kind, ev, marks) {
  const e0 = ev[0] || '';
  if (kind === 'okpass') return '정상 — ' + e0;
  if (kind === 'caught') return '반려 근거 — ' + e0;
  if (kind === 'wrongreason') return '진짜 근거 — ' + e0;
  if (kind === 'missed') return '놓친 근거 — ' + e0;
  if (kind === 'nogrounds') return '근거 부족 — ' + e0;
  if (kind === 'unfair') return (marks && marks.length && !e0.startsWith(fieldShort(marks[0])) ? fieldShort(marks[0]) + '은 정상 · ' : '') + e0;
  return '';
}

// ───────── 장면 공용: 사무실 그리기 ─────────
const ROOM_H = 150, CW = 250; // 업체 대표가 서는 가운데 x
function drawPerson(p) {
  const name = chSpr(p.k, p.face);
  const w = iw(name), h = ih(name);
  let x = p.x - w / 2, y = ROOM_H + 6 - h + (p.dy || 0);
  if (p.idle) { y += Math.floor((T + (p.seed || 0)) / 32) % 2; if (p.twitch > 0 && !OPT.calm) x += p.twitch % 4 < 2 ? 1 : -1; }
  if (p.hop > 0) { y += [0, -1, -3, -5, -6, -6, -5, -3, -1, 0, 1, 0][12 - p.hop] || 0; }
  if (p.walk) x += p.dy ? 1 : -1; // 걸을 때 몸을 좌우로 흔듦
  spr(name, x, y);
  if (p.flashC && p.flashT > 0 && p.flashT % 6 < 3 && !OPT.calm) spr(name, x, y, { sil: p.flashC, alpha: 0.6 });
}
function drawRoom(person, o = {}) {
  rect(0, 0, W, H, C.cream);
  spr('bg_wall', 0, 0);
  if (o.ai) drawMonitor(o.ai);
  if (person) drawPerson(person);
  const ch = ih('counter');
  spr('counter', 0, ROOM_H - ch + 4);
  spr('desk', 0, ROOM_H);
}
function drawMonitor(ai) { // 모니터 그림(배경). 글자는 drawAIPanel이 맨 앞에 그림
  const mx = 406, my = 19; // 오른쪽 위 구석(x406~477, y19~88). 안내 상자(x≤401)·AI 상자(y≥92)와 1px도 안 겹침
  spr('monitor', mx, my);
  const sx = mx + 10, sy = my + 10, sw = 46, sh = 37;
  rect(sx, sy, sw, sh, ai.alert && Math.floor(T / 12) % 2 ? C.dred : '#0c2a1a');
  if (ai.alert) { if (Math.floor(T / 12) % 2) spr('warn', sx + sw / 2 - 8, sy + sh / 2 - 8); }
  else { for (let i = 0; i < 3; i++) rect(sx + 4, sy + 6 + i * 8, 10 + ((T / 3 + i * 13) % 28), 2, '#7cf0a0'); rect(sx, sy + (Math.floor(T / 3) % sh), sw, 1, '#2f7a4a'); }
}
function hud(info) {
  rect(0, 0, W, 16, C.navy); rect(0, 16, W, 1, C.ink);
  text(info.left, 6, 3, { c: C.white });
  if (info.clock) {
    spr('clock', 178, 2);
    const red = info.late && Math.floor(T / 15) % 2;
    text(info.clock, 194, 2, { c: red ? C.red : C.yellow, f: 'b' });
    if (info.gauge != null) { // 남은 검사 시간 막대
      const gx = 234, gw = 46, sl = info.secLeft != null; // (w15b) 남은 초를 막대 안에 숫자로
      box(gx, sl ? 2 : 4, gw, sl ? 12 : 8, C.ink); const g = Math.max(0, Math.min(1, info.gauge));
      rect(gx + 1, sl ? 3 : 5, Math.round((gw - 2) * g), sl ? 10 : 6, g > 0.35 ? C.green : g > 0.12 ? C.orange : C.red);
      if (sl) text(info.secLeft + '초', gx + gw / 2, 3, { f: 9, a: 'center', c: C.white, out: C.ink });
      if (info.paused) { rect(gx + gw + 4, 4, 2, 8, C.sky); rect(gx + gw + 8, 4, 2, 8, C.sky); }
    }
  }
  if (info.left2) text(info.left2, 294, 3, { c: C.sky });
  const tgt = G ? G.score : 0;
  if (G && G.tutor) { text('연습', 352, 2, { c: C.sky, f: 'b' }); return; } // (w15) 연수는 점수 없음
  if (scoreShown !== tgt) { const d = tgt - scoreShown; scoreShown += Math.sign(d) * Math.max(1, Math.ceil(Math.abs(d) / 7)); if ((tgt - scoreShown) * Math.sign(d) < 0) scoreShown = tgt; }
  const bump = scoreShown !== tgt ? -1 : 0;
  spr('coin', 352, 3 + bump);
  text(String(scoreShown), 366, 2 + bump, { c: scoreShown !== tgt ? C.white : C.yellow, f: 'b' });
}
function button(x, y, w, h, label, fn, o = {}) {
  const hov = !TOUCH && inside(pointer, x, y, w, h) && !o.disabled;
  const dn = pressed && pressed.h && inside(pressed, x, y, w, h) && inside(pointer, x, y, w, h);
  const yy = y + (dn ? 1 : 0);
  if (!dn) rect(x + 1, y + h, w - 2, 2, C.ink);
  box(x, yy, w, h, o.c || (hov ? C.yellow : C.cream), C.ink, o.hi || C.white);
  if (o.icon) spr(o.icon, x + (o.iconX != null ? o.iconX : (w - iw(o.icon)) / 2), yy + (o.iconY != null ? o.iconY : 3));
  if (o.draw) o.draw(x, yy);
  if (label) text(label, x + w / 2, yy + (o.ly != null ? o.ly : (h - 12) / 2), { a: 'center', f: o.f || 'b', c: o.tc || C.ink });
  if (o.focus) frameRect(x - 2, yy - 2, w + 4, h + 4, Math.floor(T / 10) % 2 ? C.blue : C.sky, 2);
  if (o.disabled) { ctx.globalAlpha = 0.55; rect(x, yy, w, h, C.gray); ctx.globalAlpha = 1; }
  else if (o.dim) { ctx.globalAlpha = 0.3; rect(x, yy, w, h, C.gray); ctx.globalAlpha = 1; }
  hit(x, y - (o.padT || 0), w, h + 2 + (o.padT || 0) + (o.padB || 0), () => { if (o.disabled) { sfx('denied'); if (o.onDisabled) o.onDisabled(); return; } sfx('click'); fn(); }, { btn: o.disabled ? null : label + x + ',' + y });
}

// ───────── 모든 장면 공통: 소리 버튼·설정(톱니) ─────────
// 그림과 누르는 영역을 맞추고 두 영역 사이에 2px 빈 틈을 둔다(톱니 410~447, 소리 449~480)
let SETTINGS = false, setCur = -1;
function toggleSound() { SND.init(); const m = SND.toggleMute(); if (!m) sfx('menuSelect'); }
function openSettings(on) { SETTINGS = on; setCur = -1; sfx(on ? 'open' : 'click'); }
function drawGlobalUI() {
  if (SETTINGS) drawSettings();
  const x = 452, y = 1, m = SND.muted;
  box(x, y, 26, 15, m ? C.dgray : C.blue);
  rect(x + 5, y + 5, 3, 5, C.white); rect(x + 8, y + 3, 2, 9, C.white);
  if (m) { for (let i = 0; i < 5; i++) { rect(x + 13 + i, y + 5 + i, 1, 1, C.red); rect(x + 17 - i, y + 5 + i, 1, 1, C.red); } }
  else { const lv = Math.max(SND.bgmLevel || 0, SND.fxLevel || 0); for (let i = 0; i < Math.max(1, lv); i++) rect(x + 12 + i * 3, y + 10 - i * 2, 2, 2 + i * 2, C.white); }
  hit(449, 0, 31, 32, toggleSound, { btn: 'snd' });
  const gx = 420; // 톱니
  box(gx, y, 24, 15, SETTINGS ? C.yellow : C.navy, C.ink, C.blue);
  const gc = SETTINGS ? C.ink : C.white, cx = gx + 12, cy = y + 7;
  rect(cx - 3, cy - 3, 7, 7, gc); rect(cx - 1, cy - 5, 3, 11, gc); rect(cx - 5, cy - 1, 11, 3, gc); rect(cx - 1, cy - 1, 3, 3, SETTINGS ? C.yellow : C.navy);
  hit(410, 0, 37, 32, () => openSettings(!SETTINGS), { btn: 'opt' });
}
// 설정 칸(키보드 ↑↓로 고르고 ←→/Enter로 바꿈)
function settingRows() {
  return [
    { kind: 'lv', label: '배경음', key: 'bgm' },
    { kind: 'lv', label: '효과음', key: 'fx' },
    { kind: 'tg', label: '대사 소리', note: '타자기 삐삐', on: () => SND.voice, fn: () => SND.setVoice(!SND.voice) },
    { kind: 'tg', label: '대사 바로 표시', on: () => OPT.instant, fn: () => { OPT.instant = !OPT.instant; saveOpt(); } },
    { kind: 'tg', label: '흔들림·번쩍임 줄이기', on: () => OPT.calm, fn: () => { OPT.calm = !OPT.calm; saveOpt(); } },
    { kind: 'tg', label: '서류 크게 보기', note: '검사·판정 설명', on: () => OPT.zoom, fn: () => { OPT.zoom = !OPT.zoom; saveOpt(); if (scene && scene.dbg) { scene.zoom = OPT.zoom; scene.rvFull = false; } } },
  ];
}
function settingsKey(k) {
  const rows = settingRows(), n = rows.length;
  if (k === 'Escape') { SETTINGS = false; sfx('click'); return; }
  if (k === 'ArrowDown') { setCur = (setCur + 1) % (n + 2); sfx('menuMove'); return; }
  if (k === 'ArrowUp') { setCur = setCur < 0 ? n + 1 : (setCur + n + 1) % (n + 2); sfx('menuMove'); return; }
  const r = rows[setCur];
  if (!r) { if (k === 'Enter' || k === ' ') { SETTINGS = false; sfx('click'); if (setCur === n) go(() => startTutorial(() => setScene(Title), { inGame: true })); } return; }
  if (r.kind === 'lv') {
    const lv = r.key === 'bgm' ? SND.bgmLevel : SND.fxLevel;
    if (k === 'ArrowLeft') { SND.setLevel(r.key, lv - 1); sfx('click'); }
    if (k === 'ArrowRight' || k === 'Enter' || k === ' ') { SND.setLevel(r.key, k === 'ArrowRight' ? lv + 1 : (lv + 1) % 4); sfx('click'); }
  } else if (['ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(k)) { r.fn(); sfx('click'); }
}
function drawSettings() {
  ctx.globalAlpha = 0.65; rect(0, 0, W, H, C.ink); ctx.globalAlpha = 1;
  hit(0, 0, W, H, () => {}, { cur: false });
  const x = 14, y = 20, w = 452, h = 246, colW = 216, RH = 40; // 9차: 두 칸+간격(8+216+4+216+8)=창 폭 452 — 오른쪽 칸이 테두리 밖으로 안 나가게
  box(x, y, w, h, C.paper, C.ink, C.white);
  rect(x + 4, y + 4, w - 8, 18, C.navy);
  text('설정', x + 12, y + 7, { f: 'b', c: C.white }); text('여는 동안 게임이 멈춰요', x + w - 10, y + 8, { f: 9, c: C.sky, a: 'right' });
  settingRows().forEach((r, i) => {
    const col = i < 3 ? 0 : 1, cx = x + 8 + col * (colW + 4), yy = y + 28 + (i % 3) * RH, focus = kbd && setCur === i;
    box(cx, yy, colW, RH - 4, focus ? '#fff0b0' : C.cream, focus ? C.blue : C.line);
    text(r.label, cx + 8, yy + (r.note ? 4 : 11), { f: 'b' });
    if (r.note) text(r.note, cx + 8, yy + 20, { f: 9, c: C.dgray });
    if (r.kind === 'lv') {
      const lv = r.key === 'bgm' ? SND.bgmLevel : SND.fxLevel;
      button(cx + 58, yy + 2, 32, 30, '−', () => SND.setLevel(r.key, lv - 1));
      for (let k = 0; k < 3; k++) box(cx + 95 + k * 16, yy + 10, 14, 14, k < lv ? C.dgreen : C.line);
      button(cx + 146, yy + 2, 32, 30, '+', () => SND.setLevel(r.key, lv + 1));
      text(['끔', '작게', '보통', '크게'][lv] || '', cx + colW - 6, yy + 11, { f: 9, c: C.dgray, a: 'right' });
    } else {
      const on = r.on();
      button(cx + colW - 72, yy + 2, 66, 30, on ? '켜짐' : '꺼짐', r.fn, { c: on ? C.dgreen : C.line, tc: on ? C.white : C.ink, hi: on ? C.green : C.white });
    }
  });
  const ky = y + 28 + 3 * RH + 4;
  if (!TOUCH || kbd) text('키보드: ↑↓ 칸 고르기 · ←→ 바꾸기 · Esc 닫기 · M 소리 끄기', x + 14, ky, { f: 9, c: C.dgray });
  if (!TOUCH || kbd) text('검사 중: ←→ 서류 · ↑↓ 칸 · Space 표시 · P 통과 · R 반려 · Z 크게 · Enter 다음', x + 14, ky + 13, { f: 9, c: C.dgray });
  if (scene !== Title) button(x + 10, y + h - 40, 120, 32, '타이틀로', () => { SETTINGS = false; go(() => setScene(Title)); });
  // (w15) 연수 다시 보기: 본편 기록은 업체마다 저장돼 있어 끝나면 타이틀에서 이어하기
  button(x + w / 2 - 75, y + h - 40, 150, 32, '튜토리얼 다시 보기', () => { SETTINGS = false; go(() => startTutorial(() => setScene(Title), { inGame: true })); }, { f: 'b', c: C.cream, focus: kbd && setCur === 6 });
  button(x + w - 130, y + h - 40, 120, 32, '닫기', () => { SETTINGS = false; }, { c: C.yellow, focus: kbd && setCur === 7 });
}

// ───────── 대화 상자 (타자기) ─────────
function Dialog(lines, onDone, o = {}) { return { lines, i: 0, n: 0, onDone, o, wait: 0 }; }
function dlgUpdate(d) {
  const L = d.lines[d.i]; if (!L) return;
  const full = L.text.length;
  if (OPT.instant) { d.n = full; return; }
  if (d.n < full) { const before = Math.floor(d.n); d.n = Math.min(full, d.n + 0.8); if (Math.floor(d.n) !== before && before % 2 === 0 && L.text[before] !== ' ') sfx('type', L.who); }
}
function dlgTap(d) {
  const L = d.lines[d.i]; if (!L) return;
  if (d.n < L.text.length) { d.n = L.text.length; return; }
  d.i++; d.n = 0; sfx('click');
  if (d.i >= d.lines.length) d.onDone && d.onDone();
}
function dlgDraw(d, y = 194) {
  const L = d.lines[Math.min(d.i, d.lines.length - 1)]; if (!L) return;
  const x = 6, w = W - 12, h = H - y - 4;
  box(x, y, w, h, C.paper, C.ink, C.white);
  const narr = L.who === 'narr', tx0 = narr ? x + 14 : x + 76;
  if (!narr) rect(x + 3, y + 3, 64, h - 6, C.sky);
  const sp = chSpr(L.who, L.face);
  if (!narr && IMG[sp]) { const sw = iw(sp); const cw = Math.min(62, sw); spr(sp, x + 4, y + 4, { sx: Math.max(0, (sw - cw) / 2), sy: (FACEY[L.who] || 57) - 32, sw: cw, sh: h - 8 }); }
  if (!narr) { rect(x + 3, y + 3, 64, 1, C.ink); rect(x + 67, y + 3, 1, h - 6, C.ink); }
  text(speakerName(L.who, L), tx0, y + 6, { f: 'b', c: L.who === 'hero' ? C.blue : L.who === 'boss' ? C.teal : C.dred });
  const shown = L.text.slice(0, Math.floor(d.n));
  wrapTyped(L.text, Math.floor(d.n), narr ? w - 30 : w - 92, 0).slice(0, 4).forEach((l, i) => text(l, tx0, y + (narr ? 12 : 22) + i * 15, { c: C.ink }));
  if (d.n >= L.text.length && Math.floor(T / 20) % 2) arrow(x + w - 12, y + h - 12, 'down', C.red);
  text((d.i + 1) + '/' + d.lines.length, x + w - 10, y + h - 26, { f: 9, c: C.gray, a: 'right' });
  if (d.o.skip) button(x + w - 84, y - 24, 78, 20, '건너뛰기 ▶', () => { d.i = d.lines.length; d.onDone && d.onDone(); }, { f: 9, c: C.cream, padT: 10 });
}

// ───────── 장면 관리 ─────────
let scene = null;
function setScene(s) { scene = s; anyTap = null; keyHandler = null; pressed = null; s.init && s.init(); }

// 타이틀
const CREDIT1 = '그림: Codex 이미지 생성 · 코드·대사: Claude · 글꼴: Galmuri(OFL)';
const CREDIT2 = '배경음: 악보 작곡·칩튠 직접 합성 · 효과음: ZzFX';
const CREDIT_T = '그림 Codex · 코드 Claude · 음악 칩튠 합성 · 글꼴 Galmuri(OFL)'; // 자세한 출처는 엔딩 크레딧
const LAST_KEY = 'ppg404_last';
function loadLast() { try { const l = JSON.parse(localStorage.getItem(LAST_KEY)); if (l && Array.isArray(l.wrongs)) return l; } catch (e) {} return null; }
const Title = {
  init() {
    this.t = 0; music('title'); this.save = loadSave(); this.last = loadLast(); this.confirm = false; this.sel = 0;
    keyHandler = k => {
      if (this.t <= 70) return;
      const bs = this.btns || [];
      if (k === 'ArrowDown' || k === 'ArrowRight') { this.sel = (this.sel + 1) % bs.length; sfx('menuMove'); }
      else if (k === 'ArrowUp' || k === 'ArrowLeft') { this.sel = (this.sel + bs.length - 1) % bs.length; sfx('menuMove'); }
      else if (k === 'Escape' && this.confirm) { this.confirm = false; this.sel = 0; }
      else if ((k === 'Enter' || k === ' ') && bs[this.sel]) { sfx('click'); bs[this.sel](); }
    };
  },
  start() { clearSave(); newGame(); go(() => startDay(0)); },
  cont() { G = this.save; scoreShown = 0; resumeGame(); },
  update() { this.t++; },
  draw() {
    spr('title', 0, 0);
    const t = this.t, logo = DATA.title || '입찰 창구 404호';
    ctx.font = fontOf('B'); const total = ctx.measureText(logo).width;
    let x = W / 2 - total / 2;
    box(W / 2 - total / 2 - 14, 22, total + 28, 40, C.navy, C.ink, C.blue);
    [...logo].forEach((ch, i) => {
      const k = t - i * 5; const cw = (ctx.font = fontOf('B'), ctx.measureText(ch).width);
      if (k > 0) { const dy = k < 10 ? [-20, -12, -5, 0, 3, 2, 0, -1, 0, 0][k] : (Math.floor((t + i * 4) / 30) % 2 ? -1 : 0); text(ch, x, 30 + dy, { f: 'B', c: i >= logo.length - 4 ? C.yellow : C.white, sh: C.ink }); }
      x += cw;
    });
    if (t > 60) text('신입 심사관의 닷새', W / 2, 68, { a: 'center', f: 'b', c: C.white, out: C.ink });
    if (t > 66) { const tg = '404 = 찾을 수 없음 · 서류에만 있는 회사를 찾아라!', tgw = tw(tg, 'b') + 16; ctx.globalAlpha = 0.85; rect(W / 2 - tgw / 2, 86, tgw, 18, C.navy); ctx.globalAlpha = 1; text(tg, W / 2, 89, { a: 'center', f: 'b', c: C.yellow }); }
    const fns = [];
    if (t > 70) {
      const s = this.save, L = this.last, blink = Math.floor(t / 30) % 2 ? C.yellow : C.cream;
      const F = i => kbd && this.sel === i;
      const tasteBtn = (bx, by, bw) => { const i = fns.length; fns.push(() => startTaste()); button(bx, by, bw, 30, '3분 맛보기', fns[i], { f: 'b', c: C.pink, focus: F(i) }); };
      const tutBtn = (bx, by, bw) => { const i = fns.length; fns.push(() => startTutorial(() => setScene(Title))); button(bx, by, bw, 30, '튜토리얼', fns[i], { f: 'b', c: C.cream, focus: F(i) }); }; // (w15) 연수 다시 보기
      const lastBtn = (bx, by, bw) => { const i = fns.length; fns.push(() => go(() => setScene(LastShift(L)))); button(bx, by, bw, 30, '지난 근무 복습', fns[i], { f: 'b', c: C.sky, focus: F(i) }); };
      if (s && !this.confirm) {
        const where = (s.day + 1) + '일차' + (s.mid && s.mid.di === s.day ? ' · ' + (s.mid.idx + 1) + '번째 업체부터' : '');
        fns.push(() => this.cont()); button(W / 2 - 110, 125, 220, 38, '이어하기 ▶', fns[0], { c: blink, focus: F(0), f: 'M' }); // (w15) 더 크게 // 어디서 이어 가는지는 위 안내 띠(y107)에 — 건물 간판(y168~190)과 안 겹치게
        // 버튼 사이 틈이 건물 간판(x205~292, y168~190) 위에 오지 않게: 간판은 가운데 버튼 하나가 통째로 덮는다
        const two = !!L; // (w15) 가운데 '3분 맛보기'(204~296)가 건물 간판(x205~292)을 통째로 덮게
        fns.push(() => { this.confirm = true; this.sel = 1; }); button(two ? 52 : 108, 168, two ? 72 : 92, 30, '처음부터', fns[1], { c: C.line, focus: F(1) });
        if (two) tutBtn(128, 168, 72);
        tasteBtn(204, 168, 92);
        if (two) lastBtn(300, 168, 128); else tutBtn(300, 168, 92); // 지난 근무 복습은 늘 마지막 버튼(검사 스크립트가 씀)
      } else if (s && this.confirm) {
        box(W / 2 - 135, 130, 270, 92, C.paper, C.ink, C.white);
        text('저장된 기록(' + (s.day + 1) + '일차)이 지워져요.', W / 2, 138, { a: 'center', f: 'b', c: C.dred });
        text('처음부터 다시 할까요?', W / 2, 154, { a: 'center' });
        fns.push(() => this.start()); button(W / 2 - 125, 178, 120, 32, '네, 처음부터', fns[0], { c: C.line, focus: F(0) });
        fns.push(() => { this.confirm = false; this.sel = 0; }); button(W / 2 + 5, 178, 120, 32, '아니요', fns[1], { c: C.yellow, focus: F(1) });
      } else {
        // 건물 노란 간판 띠(y≈174~187)가 버튼 사이에 따로 보이면 버튼처럼 읽혀서, 아래 버튼이 띠를 덮게 올린다
        fns.push(() => this.start()); button(W / 2 - 85, 134, 170, 34, '시작하기 ▶', fns[0], { c: blink, focus: F(0) });
        if (L) { tutBtn(108, 174, 92); tasteBtn(204, 174, 92); lastBtn(300, 174, 100); } else { tutBtn(136, 174, 64); tasteBtn(204, 174, 140); }
      }
      if (!this.confirm) { const m = s ? '저장된 기록: ' + (s.day + 1) + '일차' + (s.mid && s.mid.di === s.day ? ' ' + (s.mid.idx + 1) + '번째 업체부터' : '') + ' · 업체마다 자동 저장' : '업체 하나를 처리할 때마다 자동 저장돼요', mw = tw(m, 9) + 12; box(W / 2 - mw / 2, 107, mw, 14, s ? C.navy : C.ink); text(m, W / 2, 109, { a: 'center', f: 9, c: s ? C.yellow : C.white }); } // 사람 그림과 안 겹치게 간판 아래·버튼 위
      if (!SND.ready && Math.floor(t / 30) % 2) { const m = '화면을 누르면 소리가 나요', mw = tw(m, 9) + 8; ctx.globalAlpha = 0.75; rect(W - 2 - mw, H - 18, mw, 14, C.ink); ctx.globalAlpha = 1; text(m, W - 6, H - 16, { a: 'right', f: 9, c: C.yellow }); } // 도장 그림(오른쪽 위)을 덮지 않게 오른쪽 아래(크레딧 반대편)
    }
    this.btns = fns; if (this.sel >= fns.length) this.sel = 0;
    { const mw = tw(CREDIT_T, 9) + 10; ctx.globalAlpha = 0.8; rect(2, H - 14, mw, 13, C.ink); ctx.globalAlpha = 1; text(CREDIT_T, 7, H - 13, { f: 9, c: C.white }); } // 한 줄만, 사람 그림(발끝 y≈250) 아래 찻길에. 자세한 출처는 엔딩 크레딧
  },
};

// 틀리거나 못 본 서류 목록(엔딩·지난 근무 공용). st = { page, sel, view }
const WL_PER = 6, WL_RH = 30;
function wrongListKey(st, wrongs, k, onClose) {
  if (st.view) { viewKey(st.view, k, () => { st.view = null; }); return; }
  const pages = Math.max(1, Math.ceil(wrongs.length / WL_PER)), onPage = wrongs.slice(st.page * WL_PER, st.page * WL_PER + WL_PER).length;
  if (k === 'Escape') { onClose(); return; }
  if (k === 'ArrowDown') { st.sel = Math.min(onPage - 1, st.sel + 1); sfx('menuMove'); }
  if (k === 'ArrowUp') { st.sel = Math.max(0, st.sel - 1); sfx('menuMove'); }
  if (k === 'ArrowRight' && pages > 1) { st.page = (st.page + 1) % pages; st.sel = 0; sfx('paper'); }
  if (k === 'ArrowLeft' && pages > 1) { st.page = (st.page + pages - 1) % pages; st.sel = 0; sfx('paper'); }
  if (k === 'Enter' || k === ' ') { const l = wrongs[st.page * WL_PER + Math.max(0, st.sel)]; if (l) { st.view = makeView(l); sfx('open'); } }
}
function drawWrongList(st, wrongs, title, onClose, sub) {
  ctx.globalAlpha = 0.6; rect(0, 0, W, H, C.ink); ctx.globalAlpha = 1;
  hit(0, 0, W, H, () => {}, { cur: false });
  const bx = 20, by = 20, bw = 440, bh = 248;
  box(bx, by, bw, bh, C.paper, C.ink, C.white);
  text(fit(title, bw - 24, 'b'), bx + 12, by + 7, { f: 'b', c: C.navy });
  if (sub) text(fit(sub, bw - 24, 9), bx + 12, by + 21, { f: 9, c: C.dgray });
  const y0 = by + (sub ? 32 : 25);
  const pages = Math.max(1, Math.ceil(wrongs.length / WL_PER));
  if (st.page >= pages) st.page = 0;
  const list = wrongs.slice(st.page * WL_PER, st.page * WL_PER + WL_PER);
  if (!wrongs.length) text('틀린 서류가 없어요. 완벽한 근무!', W / 2, y0 + 60, { a: 'center', f: 'b', c: C.dgreen });
  list.forEach((l, i) => {
    const yy = y0 + i * WL_RH, focus = kbd && st.sel === i;
    box(bx + 8, yy, bw - 16, WL_RH - 2, focus ? '#fff0b0' : i % 2 ? C.cream : C.paper, focus ? C.blue : C.line);
    verdictIcon(bx + 13, yy + 7, l.kind === 'skipped' ? 'skip' : 'bad');
    text((l.di + 1) + '일차', bx + 32, yy + 9, { f: 9, c: C.dgray });
    text(fit(l.company, 120, 'b'), bx + 68, yy + 3, { f: 'b' });
    // (w11) 근거 글은 오른쪽 판정 라벨 앞 10px까지만(라벨과 붙어 한 줄로 읽히던 것)
    const kt = KIND_TITLE[l.kind] || '', dw = Math.min(230, bx + bw - 14 - tw(kt, 9) - 10 - (bx + 68));
    // (w13) 근거 줄 = 업체별 핵심 근거(하루 결과 화면과 같은 brief). 모두 반려해도 줄마다 다른 근거가 보이게
    const ap = l.kind !== 'skipped' ? findApp(l.id).a : null, wl = ap && ap.brief && BRIEF_PRE[l.kind] ? BRIEF_PRE[l.kind] + ap.brief : l.detail;
    text(fit(wl || (l.kind === 'skipped' ? '시간이 모자라 심사하지 못함' : ''), dw, 9), bx + 68, yy + 16, { f: 9, c: C.dgray });
    text(kt, bx + bw - 14, yy + 9, { f: 9, c: l.kind === 'skipped' ? C.dgray : C.dred, a: 'right' });
    hit(bx + 8, yy, bw - 16, WL_RH - 2, () => { st.sel = i; st.view = makeView(l); sfx('open'); });
  });
  const fy = by + bh - 34;
  if (pages > 1) {
    button(bx + 10, fy, 50, 30, '◀', () => { st.page = (st.page + pages - 1) % pages; st.sel = 0; });
    text((st.page + 1) + '/' + pages, bx + 85, fy + 9, { f: 'b', a: 'center' });
    button(bx + 110, fy, 50, 30, '▶', () => { st.page = (st.page + 1) % pages; st.sel = 0; });
  }
  if (kbd) { const kx = pages > 1 ? bx + 168 : bx + 12, km = pages > 1 ? '↑↓·Enter 열기·←→ 쪽' : '↑↓ 고르기 · Enter 열기 · Esc 닫기'; text(fit(km, bx + bw - 106 - kx, 9), kx, fy + 10, { f: 9, c: C.dgray }); }
  button(bx + bw - 100, fy, 90, 30, '닫기', onClose, { c: C.yellow });
  if (st.view) drawView(st.view, () => { st.view = null; });
}

// 지난 근무 복습: 마지막 완주 기록(새로고침·다음 방문에도 남음)
function LastShift(L) {
  const back = () => go(() => setScene(Title));
  return {
    init() { this.t = 0; this.st = { page: 0, sel: 0, view: null }; music('result'); keyHandler = k => wrongListKey(this.st, L.wrongs, k, back); },
    update() { this.t++; },
    draw() {
      rect(0, 0, W, H, C.navy);
      for (let i = 0; i < 20; i++) rect((i * 53 + T / 3) % W, (i * 37) % H, 2, 2, C.blue);
      const d = new Date(L.at || Date.now()), when = (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
      drawWrongList(this.st, L.wrongs, '지난 근무 · ' + L.title + ' · ' + L.score + '/' + (TOTAL_APPS * 100) + '점 (' + Math.round((L.ratio || 0) * 100) + '%)', back,
        when + ' 완주 · 처리 ' + L.done + '/' + TOTAL_APPS + ' · 바르게 ' + L.ok + ' · 억울 ' + L.unfair + ' · 놓침 ' + L.missed + ' · 미처리 ' + L.skipped);
    },
    get view() { return this.st && this.st.view; }, set view(v) { if (this.st) this.st.view = v; },
  };
}

function resumeGame() {
  const m = G.mid;
  if (m && m.di === G.day) go(() => setScene(Work(m.di, m)));
  else go(() => startDay(G.day));
}

// 하루 시작: 신문 → 대화 → 새 규칙 → 업무
function startDay(di) {
  G.day = di; G.mid = null; writeSave();
  const D = DATA.days[di];
  const steps = [];
  if (di > 0 && G.perDay[di - 1]) steps.push(() => setScene(News(DATA.days[di - 1], G.perDay[di - 1], next)));
  steps.push(() => setScene(Talk(D.intro || [], next, { title: D.day + '일차 · ' + D.title, sub: dateShort(di), di })));
  (D.newRules || []).forEach((r, i, A) => steps.push(() => setScene(RuleCard(r, next, i < A.length - 1))));
  if (di === 0 && !tutDone()) steps.push(() => startTutorial(next, { inGame: true })); // (w15) 처음 한 번만 자동
  steps.push(() => setScene(Work(di)));
  let k = 0;
  function next() { const f = steps[k++]; if (f) { if (k === 1) f(); else go(f); } }
  next();
}

// 아침 신문 — 어제 실제 판정 기록으로 제목·사진·본문을 만든다
function News(D, res, done) {
  const di = D.day - 1;
  const fill = (s, a) => s.replace('{company}', companyOf(a)).replace('{item}', (a.docs.bid || {}).item || '물품');
  let paper = '행복일보';
  const pick = s => { const mm = s && s.match(/^\[(.+?)\]\s*/); if (mm) { paper = mm[1]; return s.slice(mm[0].length); } return s; };
  const missed = (res.log || []).filter(l => l.kind === 'missed').map(l => DATA.days[di].applicants.find(a => a.id === l.id)).filter(Boolean);
  let headline, tone, photo;
  pick(D.news && D.news.good);
  if (missed.length) {
    const a = missed[0], R = DATA.rules[a.flaw.rule] || {};
    headline = R.newsBad ? fill(R.newsBad, a) : pick(D.news && D.news.bad) || '부정 업체 계약 들통';
    if (missed.length > 1) headline += ` 외 ${missed.length - 1}건`;
    tone = 'bad'; photo = chSpr(a.sprite, 'happy');
  } else if (res.skippedFlawed) {
    headline = `창구 마감 넘겨 심사 못 한 업체 ${res.skipped}곳… 조사팀이 다시 본다`; tone = 'mid'; photo = chSpr('boss', 'normal');
  } else {
    headline = pick(D.news && D.news.good) || '부정 입찰 0건, 창구 철통'; tone = 'good'; photo = chSpr('hero', 'happy');
  }
  // 아래 칸에 실을 업체: 놓친 곳 > 바르게 막은 곳 > 그날 수상한 업체 아무나(현장 확인서가 있는 곳)
  const byId = id => D.applicants.find(a => a.id === id), withSite = a => a && a.flaw && a.docs.site;
  const feat = missed.find(withSite) || (res.log || []).filter(l => l.kind === 'caught').map(l => byId(l.id)).find(withSite) || D.applicants.find(withSite) || null;
  const body = `${D.day}일차 창구: 업체 ${res.assigned || res.total}곳 중 ${res.total}곳 심사, 바르게 처리 ${res.ok}건. 막아 낸 수상한 계약 ${won(res.saved)}.`
    + (res.missed ? ` 놓친 계약 ${won(res.leaked)}.` : '') + (res.unfair ? ` 억울하게 반려된 업체 ${res.unfair}곳.` : ' 억울한 반려 없음.') + (res.skipped ? ` 미처리 ${res.skipped}곳.` : '');
  return {
    init() { this.t = 0; music(null); sfx('paper'); anyTap = () => { if (this.t > 30) done(); }; keyHandler = () => { if (this.t > 30) done(); }; },
    update() { this.t++; if (this.t === 18) { sfx('paperDrop'); if (!OPT.calm) shake = 4; } },
    draw() {
      rect(0, 0, W, H, C.dgray);
      for (let i = 0; i < 24; i++) rect((i * 71) % W, (i * 43 + 7) % H, 2, 2, C.gray);
      const k = OPT.calm ? 1 : Math.min(1, this.t / 18), y = 24;
      ctx.save();
      if (k < 1) { const s = 0.15 + 0.85 * k; ctx.translate(W / 2, H / 2); ctx.rotate((1 - k) * Math.PI * 4); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2); }
      box(40, y, 400, 222, C.paper, C.ink, C.white);
      text(paper, W / 2, y + 8, { a: 'center', f: 'B', c: C.ink });
      rect(52, y + 38, 376, 2, C.ink); rect(52, y + 42, 376, 1, C.ink);
      text(dateShort(D.day) + ' 아침', 56, y + 46, { f: 9, c: C.gray }); text('제' + (404 + D.day) + '호', 424, y + 46, { f: 9, c: C.gray, a: 'right' });
      const hl = wrap(headline, 360, 'M');
      hl.slice(0, 2).forEach((l, i) => text(l, W / 2, y + 62 + i * 22, { a: 'center', f: 'M', c: tone === 'good' ? C.navy : tone === 'bad' ? C.dred : C.dgray }));
      const py = y + 112;
      box(56, py, 96, 96, tone === 'bad' ? C.pink : C.sky);
      if (IMG[photo]) spr(photo, 58, py + 2, { sx: Math.max(0, (iw(photo) - 92) / 2), sy: 0, sw: Math.min(92, iw(photo)), sh: 92 });
      let bl = wrap(body, 262, 0); if (bl.length > 4) bl = bl.slice(0, 3).concat([fit(bl.slice(3).join(' '), 262, 0)]);
      bl.forEach((l, i) => text(l, 164, py + 2 + i * 15, { c: C.ink }));
      if (feat) { // 아래 칸: 어제 사건의 현장 사진 기사(있는 현장 사진을 줄여 씀) + 배운 규칙 한 줄
        const fy = py + 2 + bl.length * 15 + 5, st = feat.docs.site || {}, Rl = DATA.rules[feat.flaw.rule] || {}, pic = 'photo_' + (st.pic || PHOTO_IMG[st.photo] || st.photo || 'office');
        rect(164, fy - 3, 264, 1, C.line);
        box(164, fy, 40, 40, C.white);
        if (IMG[pic]) ctx.drawImage(IMG[pic], 166, fy + 2, 36, 36);
        text(fit((tone === 'bad' ? '놓친 곳' : '막은 곳') + ' · ' + companyOf(feat), 218, 'b'), 210, fy + 1, { f: 'b', c: tone === 'bad' ? C.dred : C.navy });
        text(fit('현장: ' + (st.photo ? (PHOTO[st.photo] || st.photo) + ', 상시 ' + st.staff : '사진 없음'), 218, 9), 210, fy + 16, { f: 9, c: C.dgray });
        text(fit('걸린 규칙: ' + (Rl.name || ''), 218, 9), 210, fy + 28, { f: 9, c: C.dgray });
      }
      ctx.restore();
      if (this.t > 30) { const m = (kbd ? 'Enter 또는 ' : '') + '화면을 누르면 다음 ▶', mw = tw(m, 'b') + 16; box(W / 2 - mw / 2, H - 22, mw, 19, Math.floor(this.t / 30) % 2 ? C.yellow : C.cream); text(m, W / 2, H - 19, { a: 'center', f: 'b', c: C.ink }); }
    },
  };
}

// 대화 장면(출근·퇴근)
function Talk(lines, done, o = {}) {
  return {
    init() {
      this.t = 0; music(o.music || daySong(o.di || 0));
      this.d = Dialog(lines.length ? lines : [{ who: 'boss', face: 'normal', text: '...' }], () => done(), { skip: true });
      anyTap = () => dlgTap(this.d); keyHandler = k => { if (k === ' ' || k === 'Enter') dlgTap(this.d); };
      this.person = { k: 'boss', face: 'normal', x: CW, idle: true, seed: 0, twitch: 0 };
    },
    update() {
      this.t++; dlgUpdate(this.d);
      const L = this.d.lines[Math.min(this.d.i, this.d.lines.length - 1)];
      if (L && L.who !== 'hero' && L.who !== 'narr') {
        if (this.person.k !== L.who) { this.person.k = L.who; this.person.hop = 12; }
        if (this.person.face !== (L.face || 'normal')) { this.person.face = L.face || 'normal'; this.person.twitch = 8; }
      }
      if (this.person.hop > 0) this.person.hop--;
      if (this.person.twitch > 0) this.person.twitch--; else if (Math.random() < 0.01) this.person.twitch = 8;
    },
    draw() {
      drawRoom(this.person);
      hud({ left: o.title || '', clock: o.clock || '08:50' });
      if (o.title && this.t < 110) {
        const k = OPT.calm ? 1 : Math.min(1, this.t / 10), dy = Math.round((1 - k) * 60);
        box(8, 24 - dy, 190, o.sub ? 40 : 30, C.navy, C.ink, C.blue);
        text(fit(o.title, 176, 'b'), 103, 31 - dy, { a: 'center', f: 'b', c: C.yellow });
        if (o.sub) text('2026년 ' + o.sub, 103, 47 - dy, { a: 'center', f: 9, c: C.sky });
      }
      dlgDraw(this.d);
      if (o.skipAll) { // (w15d) 검사 화면과 같은 자리·같은 두 번 누름(대화 '건너뛰기 ▶'와 떨어뜨림)
        if (this.skipArm > 0) this.skipArm--;
        button(300, 1, 116, 15, this.skipArm > 0 ? '한 번 더 누르면 건너뜀' : '연수 건너뛰기 ▶', () => { if (this.skipped) return; if (!(this.skipArm > 0)) { this.skipArm = 150; return; } this.skipped = true; o.skipAll(); }, { f: 9, c: this.skipArm > 0 ? C.yellow : C.cream, padT: 2, padB: 14 });
      }
    },
  };
}

// 새 규칙 카드
function RuleCard(key, done, more) {
  const R = DATA.rules[key] || { name: key, short: '', learn: '' };
  return {
    init() { this.t = 0; sfx('fanfare'); anyTap = () => { if (this.t > 20) done(); }; keyHandler = () => { if (this.t > 20) done(); }; },
    update() { this.t++; },
    draw() {
      drawRoom(null);
      ctx.globalAlpha = 0.6; rect(0, 0, W, H, C.ink); ctx.globalAlpha = 1;
      const k = OPT.calm ? 1 : this.t < 8 ? [0.2, 0.5, 0.8, 1.1, 1.05, 1, 1, 1][this.t] : 1;
      // 카드 높이는 내용에 맞춘다(본문과 '눌러서 업무 시작' 사이가 비지 않게)
      const W0 = 400;
      const el = R.easy ? clip(wrap('쉬운 말 · ' + R.easy, W0 - 40, 0), 2, W0 - 40, 0) : [];
      const cl = R.check ? clip(wrap('확인 방법: ' + R.check, W0 - 40, 0), 2, W0 - 40, 0) : [];
      const l0 = TOUCH ? wrap(R.learn || '', W0 - 40, 0) : null, lf = l0 && l0.length <= 5 ? 0 : 9, llh = lf === 0 ? 14 : 12; // (w15b) 폰: 12px로 읽히게(5줄 넘으면 10px)
      const ll = lf === 0 ? l0 : clip(wrap(R.learn || '', W0 - 40, 9), 4, W0 - 40, 9);
      let ch = 76 + (el.length ? el.length * 14 + 6 : 0) + (cl.length ? cl.length * 14 + 10 : 0) + ll.length * llh + 8 + 22;
      ch = Math.max(130, Math.min(250, ch));
      const w = Math.round(W0 * k), h = Math.round(ch * k), x = (W - w) / 2, y = (H - h) / 2 + 6;
      box(x, y, w, h, C.paper, C.ink, C.white);
      if (k < 1) return;
      rect(x + 4, y + 4, w - 8, 22, C.blue);
      text('새 규칙이 규정집에 들어왔어요!', x + w / 2, y + 9, { a: 'center', f: 'b', c: C.white });
      spr('rulebook', x + 14, y + 34);
      text(R.name, x + 58, y + 34, { f: 'M', c: C.dred });
      text(R.short, x + 58, y + 56, { f: 0, c: C.ink });
      let yy = y + 76;
      if (el.length) { el.forEach((l, i) => text(l, x + 20, yy + i * 14, { c: C.teal })); yy += el.length * 14 + 6; }
      if (cl.length) {
        box(x + 14, yy - 3, w - 28, cl.length * 14 + 6, '#fff0b0');
        cl.forEach((l, i) => text(l, x + 20, yy + i * 14, { c: C.navy })); yy += cl.length * 14 + 10;
      }
      ll.forEach((l, i) => text(l, x + 20, yy + i * llh, { f: lf, c: C.dgray }));
      if (this.t > 20 && Math.floor(this.t / 20) % 2) text(more ? '눌러서 다음 규칙 ▶' : '눌러서 업무 시작', x + w / 2, y + h - 16, { a: 'center', f: TOUCH ? 0 : 9, c: C.gray });
    },
  };
}

// ───────── 서류 그리기(업무·복습 공용) ─────────
const DV = { x: 6, y: 152, w: 312, h: 114 }, DVZ = { x: 4, y: 42, w: 316, h: 224 };
function tabGeom(n, R) { const tw0 = Math.min(77, Math.floor((R.w - 4) / n)); return { tw0, ty: R.y - 19 }; }
// 탭: 보이는 높이 21, 누르는 영역은 위로 넓혀 32(휴대폰 약 46px)
function drawTabs(keys, R, cur, seen, onTab, mark, glow) {
  const { tw0, ty } = tabGeom(keys.length, R);
  keys.forEach((k, i) => {
    const tx = R.x + 4 + i * tw0, on = i === cur;
    box(tx, ty + (on ? 0 : 2), tw0 - 2, on ? 21 : 19, on ? C.paper : C.line, C.ink, on ? C.white : null);
    text(TABN[k], tx + (tw0 - 2) / 2, ty + (on ? 4 : 6), { a: 'center', f: on ? 'b' : 0, c: on ? C.ink : C.dgray });
    if (glow === i && Math.floor(T / 15) % 2) frameRect(tx - 1, ty + 1, tw0, on ? 21 : 19, C.orange, 2);
    if (seen && !seen.has(i) && Math.floor(T / 20) % 2) rect(tx + tw0 - 9, ty + 5, 4, 4, C.red);
    if (mark && mark.has(k)) { box(tx + tw0 - 13, ty - 4, 11, 11, C.orange); text('!', tx + tw0 - 8, ty - 4, { f: 9, c: C.white, a: 'center' }); }
    if (onTab) hit(tx, ty - 11, tw0 - 2, 32, () => onTab(i));
  });
}
function drawDoc(a, key, R, o = {}) {
  const d = DOCS[key], data = a.docs[key]; const big = R.h > 150;
  const x = R.x, y = R.y + (o.dy || 0), w = R.w, h = R.h;
  box(x, y, w, h, C.paper, C.ink, C.white);
  rect(x + 3, y + 3, w - 6, 14, d.head);
  text(d.name, x + 8, y + 4, { f: 'b', c: C.white });
  text('조달청 나라장터', x + w - 8, y + 5, { f: 9, c: C.cream, a: 'right' });
  const fields = d.f.filter(([k]) => data[k] != null && data[k] !== '');
  const rows = [];
  if (key === 'site') {
    const sc = big ? 2 : 1, ps = 72 * sc, px = x + 8, py = y + 21;
    box(px - 2, py - 2, ps + 4, ps + 4, C.white);
    spr('photo_' + (data.pic || PHOTO_IMG[data.photo] || data.photo || 'office'), px, py, sc > 1 ? { scale: sc } : {});
    text('현장 사진', px + ps / 2, py + ps + 7, { f: 9, c: C.gray, a: 'center' });
    rows.push({ id: 'site.photo', hx: px - 2, hy: py - 2, hw: ps + 4, hh: ps + 4, cx: px + ps / 2, cy: py + ps / 2, rx: ps / 2 - 3, ry: ps / 2 - 3, photo: true });
    const fx = px + ps + 14, fw = x + w - fx - 6, rh = big ? 48 : 30; let fy = y + 20;
    for (const [k, label] of fields) {
      if (k === 'photo') continue;
      const v = String(data[k]);
      // (w11) 값이 칸 폭(fw = 패널 안쪽 여백 6px 앞까지)을 넘으면 작은 글자 → 두 줄로. 긴 조사 메모 끝 글자가 패널 경계선에 걸리던 것
      const fonts = big ? ['M', 'b'] : [0, 9]; let vf = fonts.find(f => tw(v, f) <= fw), lines = [v];
      if (vf == null) { vf = big ? 'b' : 9; lines = wrap(v, fw, vf).slice(0, 2); if (lines.length === 2 && tw(lines[1], vf) > fw) lines[1] = fit(lines[1], fw, vf); }
      const lh = vf === 'M' ? 18 : vf === 9 ? 10 : 12, step = vf === 9 ? 10 : lh + 1, vh = lh + (lines.length - 1) * step, lw = Math.max(...lines.map(l => tw(l, vf)));
      text(label, fx, fy, { f: big ? 0 : 9, c: C.gray });
      const vy = fy + (big ? (lines.length > 1 ? 17 : 20) : (lines.length > 1 ? 10 : 14)); // 칸 이름 아래 3px 이상 띄움(타원 윗변이 칸 이름에 걸리지 않게)
      lines.forEach((l, j) => text(l, fx, vy + j * step, { c: C.ink, f: vf }));
      rows.push({ id: 'site.' + k, hx: fx - 4, hy: fy - 1, hw: x + w - fx, hh: rh - 3, cx: fx + lw / 2, cy: vy + vh / 2, rx: Math.min(fw / 2 + 4, lw / 2 + 7), ry: vh / 2 + (big ? 2 : 1) });
      fy += rh;
    }
  } else {
    let fy = y + 21;
    const rh = big ? Math.min(40, Math.floor((h - 26) / fields.length)) : (fields.length > 4 ? 18 : 22);
    const vx = big ? x + 96 : x + 80, fw = x + w - vx - 8;
    for (const [k, label] of fields) {
      const v = String(data[k]), bold = k === 'amount' || k === 'company';
      let vf = bold ? 'b' : 0; if (big) vf = tw(v, 'M') <= fw ? 'M' : 'b';
      const vh = vf === 'M' ? 18 : 12, vy = fy + (big ? Math.round((rh - 3 - vh) / 2) : 0);
      rect(x + 8, fy + rh - 3, w - 16, 1, C.line);
      text(label, x + 10, fy + (big ? Math.round((rh - 15) / 2) : 1), { f: big ? 0 : 9, c: C.gray });
      text(v, vx, vy, { c: C.ink, f: vf });
      rows.push({ id: key + '.' + k, hx: x + 4, hy: fy - 2, hw: w - 8, hh: rh, cx: vx + tw(v, vf) / 2, cy: vy + vh / 2, rx: tw(v, vf) / 2 + 8, ry: vh / 2 + 3 });
      fy += rh;
    }
  }
  for (const r of rows) {
    if (o.interactive && !TOUCH && inside(pointer, r.hx, r.hy, r.hw, r.hh)) { ctx.globalAlpha = 0.18; rect(r.hx, r.hy, r.hw, r.hh, C.yellow); ctx.globalAlpha = 1; }
    if (o.tutor && o.tutor.includes(r.id) && (OPT.calm || Math.floor(T / 20) % 2)) { if (r.photo) frameRect(r.hx, r.hy, r.hw, r.hh, C.orange, 3); else { ctx.globalAlpha = 0.3; rect(r.hx, r.hy, r.hw, r.hh, C.orange); ctx.globalAlpha = 1; } }
    if (o.hl && o.hl.includes(r.id)) { if (r.photo) frameRect(r.hx, r.hy, r.hw, r.hh, o.hlC || C.orange, OPT.calm || Math.floor(T / 16) % 2 ? 3 : 2); else { ctx.globalAlpha = OPT.calm ? 0.25 : Math.floor(T / 16) % 2 ? 0.35 : 0.15; rect(r.hx, r.hy, r.hw, r.hh, o.hlC || C.orange); ctx.globalAlpha = 1; if (OPT.calm) frameRect(r.hx, r.hy, r.hw, r.hh, o.hlC || C.orange, 2); } }
    if (o.cursor === r.id) frameRect(r.hx, r.hy, r.hw, r.hh, Math.floor(T / 10) % 2 ? C.blue : C.sky, 2);
    if (o.marks && o.marks.has(r.id)) { const prog = Math.min(1, (T - o.marks.get(r.id)) / 8); pixEllipse(r.cx, r.cy, r.rx, r.ry, C.red, prog); }
    if (o.interactive) hit(r.hx, r.hy, r.hw, r.hh, () => o.onMark(r.id));
  }
  lastRows = rows;
  return rows.map(r => r.id);
}

// 지난 판정 다시 보기(결과·엔딩 공용): 서류 + 근거
function makeView(entry) {
  const { a, di } = findApp(entry.id); if (!a) return null;
  const keys = docsOf(a); let tab = 0;
  const target = a.flaw ? a.flaw.fields[0] : (entry.marks || [])[0];
  if (target) { const t = keys.indexOf(target.split('.')[0]); if (t >= 0) tab = t; }
  return { entry, a, di, tab, keys, ev: evidence(a, di, entry.marks), page: 0 };
}
function viewLines(v) {
  const e = v.entry, a = v.a, rule = a.flaw && DATA.rules[a.flaw.rule], L = [];
  L.push(['내 판정', (e.verdict ? (e.verdict === 'pass' ? '통과' : '반려') : '못 봄') + ' → 정답: ' + (a.flaw ? '반려 (' + rule.name + ')' : a.noGrounds ? '통과 (심사 당시엔 정상)' : '통과 (정상 업체)')]);
  if (e.marks && e.marks.length) L.push(['내 표시', e.marks.map(fieldShort).join(', ')]);
  v.ev.slice(0, 4).forEach((l, i) => L.push([i ? '' : (a.flaw ? '근거' : '정상 근거'), l]));
  if (a.aiAlert || a.aiWhy) L.push(['AI 경고', (a.aiAlert || '없음') + (a.aiWhy ? ' (AI는 ' + a.aiWhy + ')' : '')]);
  if (rule && rule.check) L.push(['확인법', rule.check]);
  return L;
}
// 다시 보기 키: ←→ 서류 탭 · Space 설명 크게/서류 · Esc·Enter 닫기
function viewKey(v, k, close) {
  if (k === 'Escape' || k === 'Enter') { close(); sfx('click'); return; }
  if (k === ' ') { v.page ^= 1; sfx('paper'); return; }
  if (v.page === 0 && (k === 'ArrowRight' || k === 'ArrowLeft')) { const n = v.keys.length; v.tab = (v.tab + (k === 'ArrowRight' ? 1 : n - 1)) % n; sfx('paper'); }
}
function drawView(v, onClose) {
  ctx.globalAlpha = 0.75; rect(0, 0, W, H, C.ink); ctx.globalAlpha = 1;
  hit(0, 0, W, H, () => {}, { cur: false });
  const e = v.entry, a = v.a;
  box(4, 20, 472, 248, C.cream, C.ink, C.white);
  const kc = e.good ? C.dgreen : e.kind === 'skipped' ? C.dgray : C.dred, L = viewLines(v);
  if (v.page === 1) { // 설명 크게: 화면 폭 전체를 12px 글자로
    text(fit((v.di + 1) + '일차 · ' + e.company + ' — ' + (KIND_TITLE[e.kind] || ''), 440, 'b'), 14, 28, { f: 'b', c: kc });
    rect(12, 44, 456, 1, C.line);
    let y = 50;
    for (const [lab, val] of L) {
      const lw = lab ? tw(lab + ': ', 'b') : 0;
      if (lab) text(lab + ':', 14, y, { f: 'b', c: lab.startsWith('AI') ? C.blue : C.navy });
      if (y > 214) break;
      for (const s2 of clip(wrap(val, 450 - lw, 0), Math.floor((214 - y) / 15) + 1, 450 - lw, 0)) { text(s2, 14 + lw, y, { c: C.ink }); y += 15; }
      y += 3;
    }
    button(14, 232, 120, 30, '서류 보기', () => { v.page = 0; }, { f: 'b' });
  } else {
    const R = { x: 10, y: 46, w: 300, h: 216 };
    const fk = new Set(a.flaw ? a.flaw.fields.map(f => f.split('.')[0]) : []);
    drawTabs(v.keys, R, v.tab, null, i => { v.tab = i; sfx('paper'); }, fk);
    drawDoc(a, v.keys[v.tab], R, { marks: new Map((e.marks || []).map(m => [m, -99])), hl: a.flaw ? a.flaw.fields : null, hlC: C.orange });
    const x = 316, w = 154; let y = 26;
    text(fit((v.di + 1) + '일차 · ' + e.company, w, 'b'), x, y, { f: 'b', c: C.navy }); y += 15;
    // (w10) 긴 제목('반려는 맞지만 사유가 달라요')은 말줄임 대신 두 줄로
    for (const s2 of wrap(KIND_TITLE[e.kind] || '', w, 'b').slice(0, 2)) { text(s2, x, y, { f: 'b', c: kc }); y += 15; }
    y += 2;
    // 핵심 근거는 12px로 먼저, 나머지는 '설명 크게'에서
    const key = L.find(l => l[0] === '근거' || l[0] === '정상 근거') || L[0];
    for (const s2 of clip(wrap(key[1], w, 0), 6, w, 0)) { text(s2, x, y, { c: C.ink }); y += 14; }
    y += 4;
    if (y <= 178) for (const s2 of clip(wrap(L[0][1], w, 9), Math.min(2, Math.floor((178 - y) / 11) + 1), w, 9)) { text(s2, x, y, { f: 9, c: C.dgray }); y += 11; }
    text('빨간 동그라미=내 표시', x, 204, { f: 9, c: C.red }); text('주황 칸=진짜 근거', x, 215, { f: 9, c: C.orange });
    button(x, 232, 78, 30, '설명 크게', () => { v.page = 1; }, { f: 9 });
  }
  if (kbd) text(v.page ? 'Space 서류 · Esc 닫기' : '←→ 탭 · Space 설명', v.page ? 140 : 316, v.page ? 242 : 192, { f: 9, c: C.dgray });
  button(396, 232, 74, 30, '닫기', onClose, { c: C.yellow });
}

// ───────── 업무(핵심) ─────────
const LAW_OK = '걸리는 규칙 없음 → 입찰참가자격 충족(국가계약법 시행령 제12조)';
const LAW_OK_S = '자격 충족(시행령 제12조)'; // 설명 카드 한 줄용
const LAW_S = { paper: '국가계약법 시행령 제12조', staffdup: '건설산업기본법 제10조', collusion: '공정거래법 제40조', banned: '국가계약법 제27조', safety: '다수공급자계약 규정', innovexp: '혁신제품 지정 제도' };
const DAY_SEC = 150; // 검사 시간 합계(초) = 09:00~18:00. 서류를 검사하는 동안에만 흐른다
const daySec = di => (DATA.days[di] && DATA.days[di].sec) || DAY_SEC; // (w15) 날이 갈수록 짧아짐
const clockStr = (c, sec = DAY_SEC) => { const mins = Math.min(540, Math.floor(c / sec * 540 / 10) * 10); return String(9 + Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0'); };
function Work(di, resume, opt = {}) {
  const D = DATA.days[di];
  const S = {
    D, di, q: opt.apps || D.applicants, idx: -1, a: null, phase: 'next', pt: 0, clock: 0, log: [], marks: new Map(), tab: 0, seen: new Set(),
    person: null, bubble: null, overlay: null, judge: null, stampAnim: null, stampMark: null, ink: [], late: false, ended: false,
    hasAI: !!D.ai || D.applicants.some(a => a.aiAlert), tut: !!D.tutorial, idle: 0, nag: null, toast: null, cur: -1, rowIds: [], zoom: OPT.zoom, rpage: 0, flip: 0, jolt: 0, rv: null, fast: false,
    coach: !!opt.coach, cs: 0, sec: daySec(di), miss: false,
  };
  if (resume) { S.idx = resume.idx - 1; S.log = (resume.log || []).slice(); S.clock = resume.clock || 0; S.late = !!resume.late; S.ended = !!resume.ended; }
  const tutor = () => S.coach || (S.tut && S.idx < 2);
  // 서류 크게 보기: 검사·도장·판정 반응·설명(설명을 크게 펼치지 않았을 때)까지 확대 유지
  const R = () => (S.phase === 'review' && S.miss) || (S.zoom && (['inspect', 'stamp', 'react'].includes(S.phase) || (S.phase === 'review' && !S.rvFull))) ? DVZ : DV; // (w15) 놓친 칸 화면은 늘 서류 크게
  const tut2 = () => S.tut && S.idx === 1 && S.a && S.a.flaw; // 둘째 연습: 증거 표시→반려를 해내야 끝남

  // ── (w15) 연수 칸 짚기 ──
  const coachStep = () => S.coach && S.a && S.phase === 'inspect' && !S.overlay ? (COACH[S.a.id] || [])[S.cs] || null : null;
  function coachRect(st) {
    const r = R(), keys = docsOf(S.a), [k, v] = st.tg.split(':');
    if (k === 'person') return r === DVZ ? { x: 323, y: 19, w: 156, h: 60 } : { x: 190, y: 22, w: 120, h: 126 };
    if (k === 'doc') return { x: r.x, y: r.y, w: r.w, h: r.h };
    if (k === 'tab') { const i = keys.indexOf(v), g = tabGeom(keys.length, r); return { x: r.x + 3 + i * g.tw0, y: g.ty - 1, w: g.tw0, h: 23 }; }
    if (k === 'row') { const q = lastRows.find(q2 => q2.id === v); return q ? { x: q.hx, y: q.hy, w: q.hw, h: q.hh } : { x: r.x, y: r.y, w: r.w, h: r.h }; }
    return { pass: { x: 324, y: 152, w: 74, h: 56 }, reject: { x: 402, y: 152, w: 74, h: 56 }, rules: { x: 324, y: 212, w: 74, h: 50 } }[v];
  }
  function coachMet(st) {
    const [k, v] = st.tg.split(':');
    if (st.need === 'tab') return S.tab === docsOf(S.a).indexOf(v);
    if (st.need === 'mark') return S.marks.has(v);
    return false;
  }
  function coachDeny() { sfx('denied'); S.coachNudge = 24; }
  function coachTap() { const st = coachStep(); if (!st) return; if (st.need === 'tap') { S.cs++; sfx('menuSelect'); } else coachDeny(); }
  function coachDo() { // 키보드 Enter: 지금 단계를 해 준다
    const st = coachStep(); if (!st) return;
    const v = st.tg.split(':')[1];
    if (st.need === 'tap') coachTap();
    else if (st.need === 'tab') setTab(docsOf(S.a).indexOf(v));
    else if (st.need === 'mark') toggleMark(v);
    else stamp(st.need);
  }
  function nextApplicant() {
    S.idx++; S.marks = new Map(); S.tab = 0; S.seen = new Set([0]); S.stampMark = null; S.judge = null; S.idle = 0; S.ink = []; S.cur = -1; S.rv = null; S.bubble = null; S.rvFull = false; S.cs = 0; S.miss = false;
    if (S.idx >= S.q.length || S.ended) return endDay();
    S.a = S.q[S.idx];
    S.fast = S.idx > 0 || !!resume;
    S.person = { k: S.a.sprite, face: S.a.face || 'normal', x: -60, dy: 0, idle: false, walk: true, seed: S.idx * 7, twitch: 0, flashT: 0, hop: 0 };
    S.phase = 'enter'; S.pt = 0; sfx('bell');
    S.greet = (S.a.say && S.a.say.enter) || '안녕하세요.';
    const ei = S.a.enterIf; // 예전에 만난 손님: 그때 판정에 따라 인사가 달라짐
    if (ei) for (const r of G.perDay) for (const l of ((r && r.log) || [])) if (l.id === ei.id && l.kind === ei.kind) S.greet = ei.text;
    if (S.idx === 1 && !S.tut && di === 0) S.toast = null;
  }
  function endDay() {
    if (S.phase === 'out') return; S.phase = 'out';
    const L = S.log, done = new Set(L.map(l => l.id)), sk = S.q.filter(a => !done.has(a.id));
    const res = {
      assigned: S.q.length, total: L.length, ok: L.filter(l => l.good).length, unfair: L.filter(l => l.kind === 'unfair').length, missed: L.filter(l => l.kind === 'missed').length,
      saved: L.filter(l => l.kind === 'caught' || l.kind === 'wrongreason').reduce((s, l) => s + l.amount, 0), leaked: L.filter(l => l.kind === 'missed').reduce((s, l) => s + l.amount, 0),
      skipped: sk.length, skippedIds: sk.map(a => a.id), skippedNames: sk.map(companyOf), skippedFlawed: sk.filter(a => a.flaw).length, pts: L.reduce((s, l) => s + (l.dpts != null ? l.dpts : (l.pts || 0)), 0), floored: L.some(l => l.dpts != null && l.dpts !== l.pts), log: L.slice(),
    };
    if (opt.onEnd) { opt.onEnd(res); return; } // 3분 맛보기: 본편 기록에 안 남김
    G.perDay[di] = res;
    G.ok += res.ok; G.total += res.total; G.unfair += res.unfair; G.missed += res.missed; G.saved += res.saved; G.leaked += res.leaked; G.skipped += res.skipped;
    G.day = di + 1; G.mid = null; writeSave();
    let outro = (D.outro || []).slice();
    const last = S.q[S.q.length - 1], ll = L.find(l => l.id === last.id);
    const villainMissed = D.outroMissed && !(ll && isCatch(ll));
    if (villainMissed) outro = D.outroMissed.slice();
    // 퇴근 대사를 실제 기록에 맞춘다: 그날 놓친 수, 이번 주 적발이 절반 이하인지
    const dayMiss = res.missed + res.skippedFlawed, weekLow = di === DATA.days.length - 1 && ((TOTAL_FLAWED - weekCaught()) * 2 >= TOTAL_FLAWED || G.unfair * 2 >= TOTAL_APPS - TOTAL_FLAWED);
    const manyUnfair = di === DATA.days.length - 1 && G.unfair >= 3; // (w13) 억울한 반려가 여러 곳이면 '잘 해냈어요' 금지
    const weMissed = dayMiss === 0 ? '우리는 오늘 하나도 안 놓쳤지만요.' : dayMiss === 1 ? '우리도 하나 놓쳤고요.' : '우리도 오늘 ' + dayMiss + '곳을 놓쳤고요.';
    outro = outro.map(l => {
      const v = (dayMiss && l.ifMissed) || (weekLow && l.ifWeekLow) || (manyUnfair && l.ifUnfair) || null;
      const o = Object.assign({}, l, v || {}); delete o.ifMissed; delete o.ifWeekLow; delete o.ifUnfair;
      o.text = o.text.replace('{weMissed}', weMissed).replace('{unfairN}', G.unfair); return o;
    });
    // 그날 틀린 판정을 한 줄로 짚는다(놓친 부정·억울한 반려). 1~4일차는 끝에, 5일차는 마지막 인사 앞에
    const mN = villainMissed ? 0 : res.missed, uN = res.unfair;
    const wrongTxt = mN && uN ? '오늘 부정 업체 ' + mN + '곳은 통과됐고, 멀쩡한 업체 ' + uN + '곳은 억울하게 반려됐어요. 결과 화면에서 근거를 꼭 다시 봐요.'
      : mN ? '오늘 부정 업체 ' + mN + '곳이 통과 도장을 받았어요. 결과 화면에서 놓친 근거를 꼭 다시 봐요.'
      : uN ? '오늘 멀쩡한 업체 ' + uN + '곳을 억울하게 반려했어요. 결과 화면에서 정상인 근거를 꼭 다시 봐요.' : '';
    if (wrongTxt) outro.splice(di === DATA.days.length - 1 ? Math.max(0, outro.length - 1) : outro.length, 0, { who: 'boss', face: 'normal', text: wrongTxt });
    if (res.skipped) outro.unshift({ who: 'boss', face: 'normal', text: `18시, 퇴근 시간이에요. 남은 ${res.skipped}곳은 오늘 심사하지 못했어요. 성적에는 미처리(0점)로 남고, 그 서류는 조사팀이 따로 살펴요.` });
    go(() => setScene(Talk(outro, () => go(() => setScene(Result(di, res))), { title: D.day + '일차 퇴근', clock: S.ended ? '18:00' : clockStr(S.clock, S.sec), di })));
  }
  function stamp(verdict) {
    if (S.phase !== 'inspect' || S.overlay) return;
    { const st = coachStep(); if (st && st.need !== verdict) { coachDeny(); return; } }
    if (verdict === 'reject' && S.tut && S.idx === 0) { S.nag = { text: '첫 업체는 연습이에요. 이상한 칸이 없으면 통과 도장!', t: 160 }; sfx('denied'); return; }
    if (verdict === 'pass' && S.tut && S.idx === 0 && S.seen.size < docsOf(S.a).length) { S.nag = { text: '먼저 위쪽 탭을 눌러 서류를 모두 넘겨 봐요!', t: 160 }; sfx('denied'); return; }
    if (tut2()) {
      if (verdict === 'pass') { S.nag = { text: '이 업체는 수상해요! 현장 확인 탭의 사진을 보고 동그라미 → 반려해요.', t: 200 }; sfx('denied'); return; }
      if (![...S.marks.keys()].some(m => S.a.flaw.fields.includes(m))) { S.nag = { text: '빈 땅 사진을 눌러 동그라미를 친 뒤 반려해요.', t: 200 }; sfx('denied'); return; }
    }
    if (verdict === 'reject' && S.marks.size === 0) { S.nag = { text: '반려하려면 먼저 수상한 칸을 눌러 동그라미를 쳐요!', t: 160 }; sfx('denied'); if (!OPT.calm) shake = 4; return; }
    S.phase = 'stamp'; S.pt = 0; S.stampAnim = { verdict, t: 0 }; S.nag = null;
  }
  function judge(verdict) {
    const a = S.a, flaw = a.flaw, marked = [...S.marks.keys()];
    let kind;
    if (verdict === 'pass') kind = flaw ? 'missed' : 'okpass';
    else if (!flaw) kind = a.noGrounds ? 'nogrounds' : 'unfair'; // (w13) 한마음가구: 그때는 증거가 없어 0점, 억울한 반려로 세지 않음
    else kind = marked.some(m => flaw.fields.includes(m)) ? 'caught' : 'wrongreason';
    const pts = { okpass: 100, caught: 100, wrongreason: 50, missed: di >= 2 ? -50 : 0, unfair: -50, nogrounds: 0 }[kind]; // 기획서 점수표 ×10. (w15) 3일차부터 놓침 -50
    const good = kind === 'okpass' || kind === 'caught';
    const before = G.score; G.score = Math.max(0, G.score + pts); const dpts = G.score - before; // (w14) 0점 하한 적용 뒤 실제 변화
    const rule = flaw && DATA.rules[flaw.rule];
    const why = kind === 'okpass' ? '정상 업체 — 통과' : kind === 'caught' ? (rule ? rule.reason : '반려') : kind === 'wrongreason' ? '반려는 맞음, 사유 틀림 → ' + (rule ? rule.name : '') : kind === 'missed' ? '놓침: ' + (rule ? rule.reason : '') : kind === 'nogrounds' ? '근거 부족 — 그때는 반려할 증거가 없었음' : '억울한 반려 — 정상 업체였음';
    const ev = evidence(a, di, marked);
    S.log.push({ id: a.id, company: companyOf(a), verdict, kind, good, why, detail: detailOf(a, kind, ev, marked), marks: marked, amount: amountOf(a), pts, dpts });
    G.mid = { di, idx: S.idx + 1, log: S.log, clock: S.clock, late: S.late, ended: S.ended }; writeSave();
    let title = { okpass: '정답! 통과', caught: '정답! 반려', wrongreason: '사유가 달라요', missed: '놓쳤다!', unfair: '억울한 반려!', nogrounds: '근거 부족' }[kind];
    if (kind === 'caught' && rule && rule.stampNote) title = '정답! ' + rule.stampNote;
    S.judge = { title, good, t: 0, pts, kind };
    if (!G.tutor) popup((pts > 0 ? '+' : '') + pts, R() === DVZ ? 400 : CW, R() === DVZ ? 106 : 34, pts > 0 ? C.yellow : C.red); // 작게 보기: 손님 머리(y≥46, 뛰어도) 위 빈 벽 — 얼굴을 안 가림. 크게 보기: 미니 말풍선 ~y78 아래
    const p = S.person;
    if (good) { sfx('ok'); setTimeout(() => sfx('coin'), 280); flash = { c: C.white, t: 18 }; if (kind === 'caught') music('caught', daySong(di)); p.hop = 12; }
    else { sfx('bad'); flash = { c: C.red, t: 24 }; if (!OPT.calm) shake = 8; p.twitch = 18; }
    p.flashC = good ? C.white : C.red; p.flashT = 24;
    const say = a.say || {};
    let line, face;
    if (kind === 'okpass' || kind === 'missed') { line = say.pass; face = 'happy'; }
    else if (kind === 'unfair' || kind === 'nogrounds') { line = say.reject; face = 'upset'; }
    else { line = say.caught || say.reject; face = 'upset'; }
    p.face = face;
    if (kind === 'caught' && (a.reveal || (di === DATA.days.length - 1 && S.idx === S.q.length - 1))) { setTimeout(() => sfx('siren'), 400); S.reveal = 140; }
    S.bubble = { text: line || '...', n: 1, t: 0 }; // n:0이면 한 프레임 말풍선이 사라짐
    let bl = (a.boss || {})[good ? 'correct' : 'wrong'];
    if (kind === 'wrongreason') bl = '반려는 맞아요. 그런데 진짜 문제는 ' + flaw.fields.slice(0, 3).map(fieldLabel).join(', ') + ' 칸이에요.';
    // 판정 후 설명 카드에 넣을 비교 줄
    const lines = [];
    if (D.ai || a.aiAlert || a.aiWhy) {
      lines.push(['서류', ev[0] || '']); // 첫 줄 = 서류의 구체 근거, AI 경고는 그다음
      lines.push(['AI 경고', (a.aiAlert || '없음') + (a.aiWhy ? ' — AI는 ' + a.aiWhy.replace(/함$/, '했어요').replace(/봄$/, '봤어요') : a.aiAlert ? ' — 이번엔 서류와 맞음' : '')]);
      lines.push(['판단', (flaw ? '반려 — ' + rule.reason : '정상 업체 — 통과') + ' (도장은 사람이)']);
      lines.push(['규정', flaw ? (LAW_S[flaw.rule] || rule.law) : LAW_OK_S]);
    } else {
      // 첫 줄 = 이번 판단을 가르는 구체 근거(내 표시와 관련된 값부터)
      const lab = flaw ? (kind === 'missed' ? '놓친 근거' : kind === 'wrongreason' ? '진짜 근거' : '근거') : '정상 근거';
      const mine = kind === 'wrongreason' || kind === 'unfair' || kind === 'nogrounds';
      ev.slice(0, mine ? 2 : 3).forEach((l, i) => lines.push([i ? '' : lab, l]));
      if (mine) lines.push(['내 표시', marked.map(fieldShort).join(', ') + (kind === 'unfair' ? ' → 정상 값이에요' : kind === 'nogrounds' ? ' → 지금은 반려 근거가 아니에요' : ' → 진짜 근거가 아니에요')]);
      lines.push(['규정', flaw ? (LAW_S[flaw.rule] || rule.law) : LAW_OK_S]); // (w15) 맞든 틀리든 근거 규정 이름
      if (rule && rule.check && lines.length < 4) lines.push(['확인법', rule.check]);
    }
    if (a.explain) lines.splice(0, lines.length, ...a.explain); // 연수: 실제 업무처럼 서류·칸·규정으로 설명
    S.rv = { line: bl || (good ? '좋아요!' : '다시 한번 살펴봐요.'), n: 0, t: 0, lines, face: good ? 'happy' : 'upset' };

    // (w15) 틀린 판정: '이걸 놓치셨어요' 화면 내용
    if (!good && !S.coach) {
      const mk = marked.map(fsn).join(', ');
      const fl = flaw ? flaw.fields.slice(0, 2).map(fsn).join(', ') + (flaw.fields.length > 2 ? ' 등' : '') : ''; // 칸 이름은 둘까지(나머지는 서류에 하이라이트)
      S.missInfo = kind === 'missed' ? { title: '이걸 놓치셨어요', hl: '놓친 칸', head: fl, why: ev[0] || rule.reason, law: rule.law, tip: rule.tip }
        : kind === 'wrongreason' ? { title: '사유 칸이 달라요', hl: '내 표시 → 진짜 칸', head: (mk || '없음') + '\u00a0→ ' + fl, why: ev[0] || rule.reason, law: rule.law, tip: rule.tip }
        : kind === 'nogrounds' ? { title: '근거가 부족했어요', hl: '내 표시', head: mk || '없음', why: ev[0] || '', law: LAW_OK, tip: '그날 서류끼리 어긋난 칸이 있을 때만 반려해요. 나중에 드러난 일은 조사 의뢰로 이어져요.' }
        : { title: '억울한 반려였어요', hl: '내 표시', head: (mk || '없음') + '\u00a0→ 정상 값', why: a.trap || ev[0] || '', law: LAW_OK, tip: '낡음·작음·새 회사·비슷한 이름은 반려 사유가 아니에요. 서류끼리 어긋난 칸을 찾아요.' };
    } else S.missInfo = null;
  }
  function toReview() {
    if (S.phase !== 'react') return;
    S.phase = 'review'; S.pt = 0; S.rv.t = 0; sfx('pop'); S.miss = !!S.missInfo;
    pops.length = 0; parts.length = 0; S.reveal = 0; // +점수 팝업·불꽃이 설명 카드 글 위에 남지 않게
    const a = S.a, keys = docsOf(a);
    const target = a.flaw ? a.flaw.fields[0] : [...S.marks.keys()][0];
    if (target) { const t = keys.indexOf(target.split('.')[0]); if (t >= 0 && t !== S.tab) { S.tab = t; S.seen.add(t); S.flip = 6; } }
  }
  function reviewTap() { if (S.rv && S.rv.n < S.rv.line.length) S.rv.n = S.rv.line.length; }
  function reviewNext() {
    if (S.phase !== 'review') return;
    S.phase = 'leave'; S.pt = 0; S.bubble = null; S.person.idle = false; S.person.walk = true; S.overlay = null;
  }
  function skipWalk() {
    if (S.phase === 'enter') { S.person.x = CW; }
    else if (S.phase === 'leave') { S.person.x = W + 80; }
  }
  function setTab(i) { { const st = coachStep(); if (st && !(st.need === 'tab' && docsOf(S.a)[i] === st.tg.split(':')[1])) { coachDeny(); return; } } if (S.tab !== i) { S.tab = i; S.seen.add(i); S.flip = 6; S.cur = -1; sfx('paper'); } S.idle = 0; }
  function toggleMark(key) {
    if (S.phase !== 'inspect' || S.overlay) return;
    { const st = coachStep(); if (st && !(st.need === 'mark' && st.tg === 'row:' + key && !S.marks.has(key))) { coachDeny(); return; } }
    if (S.marks.has(key)) { S.marks.delete(key); sfx('unmark'); }
    else if (tut2() && !S.a.flaw.fields.includes(key)) { // 연습 중 엉뚱한 칸: 그 자리에서 다시
      sfx('denied'); S.nag = { text: '그 칸은 정상이에요. 현장 확인서의 사진(빈 땅)을 눌러 봐요!', t: 200 }; S.jolt = 4;
      const si = docsOf(S.a).indexOf('site'); if (si >= 0 && si !== S.tab) setTab(si);
    }
    else { S.marks.set(key, T); sfx('mark'); S.person.twitch = 10; S.jolt = 4; }
    S.idle = 0;
  }
  function openOv(k) { S.overlay = k; S.rpage = 0; sfx('open'); }
  // 크게/작게 버튼: 설명 단계에선 서류를 작게(설명 전체)↔서류 크게
  function zoomBtn() {
    if (S.phase === 'review') { if (R() === DVZ) S.rvFull = true; else { S.rvFull = false; S.zoom = true; OPT.zoom = true; saveOpt(); } }
    else { S.zoom = !S.zoom; OPT.zoom = S.zoom; saveOpt(); }
    sfx('paper');
  }
  const zoomLabel = () => R() === DVZ ? '작게 보기' : '크게 보기'; // 늘 '서류'를 기준으로(설명 단계에서도 같은 이름)
  // 규정집 쪽: 규칙 3개씩 + 제재 명단 + 조작법
  function rulePages() {
    const learned = [];
    for (let i = 0; i <= di; i++) for (const r of DATA.days[i].newRules || []) if (!learned.includes(r)) learned.push(r);
    const P = [];
    const per = TOUCH ? 1 : 2; // (w10) 모바일은 글자를 키운 만큼 한 쪽에 규칙 하나
    for (let i = 0; i < learned.length; i += per) P.push({ k: 'rules', list: learned.slice(i, i + per), n: learned.length });
    P.push({ k: 'ban' }); P.push({ k: 'how' });
    return P;
  }
  S.dbg = { toggleMark, stamp, next: reviewNext, toReview, setTab, coachStep, coachDo };
  S.init = () => {
    music(daySong(di));
    nextApplicant();
    anyTap = () => {
      if (S.overlay) return;
      if (S.phase === 'enter' || S.phase === 'leave') skipWalk();
      else if (S.phase === 'greet') S.pt = Math.max(S.pt, 29);
      else if (S.phase === 'react' && S.pt > 12) toReview();
      else if (S.phase === 'review' && !S.coach) { if (S.rv && S.rv.n < S.rv.line.length) reviewTap(); else if (S.pt > (S.miss ? 45 : 15)) reviewNext(); } // 대화처럼 빈 곳을 누르면 다음 업체
    };
    keyHandler = (k, c) => {
      if (coachStep() && (k === 'Enter' || k === ' ')) { coachDo(); return; }
      if (S.overlay) {
        if (k === 'Escape' || k === ' ' || k === 'Enter') S.overlay = null;
        else if (S.overlay === 'rules' && (k === 'ArrowRight' || k === 'ArrowLeft')) { const n = rulePages().length; S.rpage = (S.rpage + (k === 'ArrowRight' ? 1 : n - 1)) % n; sfx('paper'); }
        return;
      }
      if (c === 'KeyB') return openOv('rules');
      if (c === 'KeyL' && di >= 1) return openOv('ledger');
      if (c === 'KeyZ') { zoomBtn(); return; }
      if (S.phase === 'enter' || S.phase === 'leave') { if (k === ' ' || k === 'Enter') skipWalk(); return; }
      if (S.phase === 'react') { if (k === ' ' || k === 'Enter') toReview(); return; }
      const keys = S.a ? docsOf(S.a) : [], n = keys.length;
      if (S.phase === 'review') {
        if (k === 'Enter') { if (S.rv.n < S.rv.line.length) reviewTap(); else reviewNext(); }
        if (k === ' ') reviewTap();
        if (k === 'ArrowRight') setTab((S.tab + 1) % n);
        if (k === 'ArrowLeft') setTab((S.tab + n - 1) % n);
        return;
      }
      if (S.phase === 'inspect') {
        if (k === 'ArrowRight') setTab((S.tab + 1) % n);
        if (k === 'ArrowLeft') setTab((S.tab + n - 1) % n);
        if (/^[1-6]$/.test(k) && +k <= n) setTab(+k - 1);
        if ((k === 'ArrowDown' || k === 'ArrowUp') && S.rowIds.length) { const m = S.rowIds.length; S.cur = S.cur < 0 ? (k === 'ArrowDown' ? 0 : m - 1) : (S.cur + (k === 'ArrowDown' ? 1 : -1) + m) % m; sfx('menuMove'); }
        if (k === ' ' && S.cur >= 0 && S.rowIds[S.cur]) toggleMark(S.rowIds[S.cur]);
        if (c === 'KeyP') stamp('pass');
        if (c === 'KeyR') stamp('reject');
      }
    };
  };
  S.update = () => {
    S.pt++;
    { const st = coachStep(); if (st && coachMet(st)) { S.cs++; sfx('menuSelect'); } }
    if (S.coachNudge > 0) S.coachNudge--;
    const p = S.person;
    if (p) { if (p.twitch > 0) p.twitch--; else if (p.idle && Math.random() < 0.008) p.twitch = 6; if (p.flashT > 0) p.flashT--; if (p.hop > 0) p.hop--; }
    if (S.nag && S.nag.t > 0) S.nag.t--;
    if (S.toast && S.toast.t > 0 && S.phase === 'inspect') S.toast.t--;
    if (S.reveal > 0) { S.reveal--; if (S.reveal % 20 === 0) burst(CW, 60, [C.red, C.yellow, C.white][S.reveal % 3], 10, 3); }
    if (S.bubble) { S.bubble.t++; if (OPT.instant) S.bubble.n = S.bubble.text.length; else if (S.bubble.n < S.bubble.text.length) { const b = Math.floor(S.bubble.n); S.bubble.n += 0.8; if (Math.floor(S.bubble.n) !== b && b % 3 === 0) sfx('type', S.a && S.a.sprite); } }
    switch (S.phase) {
      case 'enter': { // 걸어 들어오기: 계단식 이동 + 발 구르기 들썩임 (둘째 업체부터 빠르게)
        p.idle = false; p.walk = true;
        const every = S.fast ? 3 : 6, stepX = S.fast ? 16 : 10;
        if (S.pt % every === 0) { p.x += stepX; p.dy = p.dy ? 0 : -2; if (!S.fast || S.pt % (every * 2) === 0) sfx('step'); }
        if (p.x >= CW) { p.x = CW; p.dy = 0; p.idle = true; p.walk = false; p.hop = 12; S.phase = 'greet'; S.pt = 0; S.bubble = { text: S.greet, n: 0, t: 0 }; }
        break;
      }
      case 'greet':
        if (S.pt >= 30) { S.phase = 'docs'; S.pt = 0; S.docAnim = 0; sfx('paper'); }
        break;
      case 'docs':
        S.docAnim++;
        if (S.docAnim === 4 && S.hasAI && S.a.aiAlert) sfx('aiBeep');
        if (S.docAnim % 8 === 0) sfx('paperDrop');
        if (S.docAnim >= 8 * docsOf(S.a).length + 10) {
          S.phase = 'inspect'; S.pt = 0;
          if (S.tut && S.idx === 2) S.toast = { text: '이제 실전! 서류를 검사하는 동안만 시계가 가요. 규정집·기록을 펼치면 멈춰요.', t: 360 };
          else if (!S.tut && !S.coach && S.idx === 0 && !resume && D.firstTip) S.toast = { text: D.firstTip, t: 360 };
        }
        break;
      case 'inspect': {
        if (!tutor() && !S.overlay && !S.ended) {
          const before = S.clock; S.clock += 1 / FPS;
          if (Math.floor(S.clock / (S.sec / 9)) !== Math.floor(before / (S.sec / 9))) sfx('tick');
          if (!S.late && S.clock > S.sec * 8 / 9) { S.late = true; sfx('alarm'); S.nag = { text: '17시! 한 시간 남았어요. 서두르세요!', t: 150 }; }
          if (S.clock >= S.sec) { S.clock = S.sec; S.ended = true; sfx('alarm'); S.nag = { text: '18:00 퇴근 시간! 지금 업체까지만 심사하고 마감해요.', t: 240 }; }
        }
        S.idle++;
        break;
      }
      case 'stamp': {
        const sa = S.stampAnim; sa.t++;
        if (sa.t === 10) {
          const sp = S.sp || { x: R().x + R().w - 66, y: R().y + 24 }, mx = sp.x, my = sp.y, col = sa.verdict === 'pass' ? C.green : C.red;
          sfx(sa.verdict === 'pass' ? 'stampPass' : 'stampReject'); if (!OPT.calm) shake = 6; burst(mx + 20, my + 20, col, 18, 2.6); S.stampMark = sa.verdict; S.jolt = 6;
          S.ink = Array.from({ length: 12 }, () => { const ang = Math.random() * Math.PI * 2, d = 22 + Math.random() * 14; return { dx: Math.cos(ang) * d, dy: Math.sin(ang) * d * 0.8, s: 1 + (Math.random() * 3 | 0) }; });
        }
        if (sa.t === 34) { judge(sa.verdict); S.phase = 'react'; S.pt = 0; }
        break;
      }
      case 'react':
        if (S.judge) S.judge.t++;
        if (S.pt >= (S.reveal > 0 ? 110 : 55)) toReview();
        break;
      case 'review':
        S.rv.t++;
        if (OPT.instant) S.rv.n = S.rv.line.length;
        else if (S.rv.n < S.rv.line.length) { const b = Math.floor(S.rv.n); S.rv.n += 0.9; if (Math.floor(S.rv.n) !== b && b % 2 === 0) sfx('type', 'boss'); }
        break;
      case 'leave': {
        p.idle = false; p.walk = true;
        const every = S.fast ? 3 : 6, stepX = S.fast ? 16 : 10;
        if (S.pt % every === 0) { p.x += stepX; p.dy = p.dy ? 0 : -2; if (!S.fast || S.pt % (every * 2) === 0) sfx('step'); }
        if (p.x > W + 70) { S.person = null; S.phase = 'next'; S.pt = 0; }
        break;
      }
      case 'next':
        if (S.pt > (S.fast ? 4 : 12)) nextApplicant();
        break;
    }
  };
  // ── 화면 그리기 ──
  function drawDesk() {
    const a = S.a; if (!a) return;
    const keys = docsOf(a);
    if (S.phase === 'docs') { // 서류가 창구 틈으로 미끄러져 책상에 떨어짐(통통 튐)
      keys.forEach((k, i) => {
        const t = S.docAnim - i * 8; if (t < 0) return;
        const sp = DOCS[k].spr, tx = 20 + i * 70, ty = 172, k2 = Math.min(1, t / 8);
        const x = CW - 20 + (tx - CW + 20) * k2, y = 120 + (ty - 120) * k2 - (t >= 8 && t < 14 ? [0, 4, 6, 4, 1, 0][t - 8] : 0);
        spr(sp, x, y);
      });
      return;
    }
    if (!['inspect', 'stamp', 'react', 'review'].includes(S.phase)) return;
    const r = R(), insp = S.phase === 'inspect' && !S.overlay, rev = S.phase === 'review';
    const fk = rev && a.flaw ? new Set(a.flaw.fields.map(f => f.split('.')[0])) : null;
    const siteI = keys.indexOf('site'), glow = insp && tut2() && S.tab !== siteI ? siteI : -1;
    drawTabs(keys, r, S.tab, S.seen, (insp || (rev && !S.overlay)) ? setTab : null, fk, glow);
    const fl = S.flip > 0 ? S.flip-- : 0, jo = S.jolt > 0 ? S.jolt-- : 0;
    const dy = (fl ? [0, 1, 3, 5, 3, 1, 0][fl] : 0) + (jo && !OPT.calm ? [0, 1, 2, 3, 2, 1, 0][jo] : 0);
    const tut = insp && tut2() ? ['site.photo'] : insp && S.tut && S.idx < 2 && a.flaw && S.idle > 360 ? a.flaw.fields : null;
    S.rowIds = drawDoc(a, keys[Math.min(S.tab, keys.length - 1)], r, {
      dy, marks: S.marks, interactive: insp, onMark: toggleMark, cursor: insp && kbd && S.cur >= 0 ? S.rowIds[S.cur] : null, tutor: tut,
      hl: rev ? (a.flaw ? a.flaw.fields : S.miss ? [...S.marks.keys()] : null) : null, hlC: S.judge && S.judge.good ? C.green : a.flaw ? C.orange : C.green,
    });
    S.sp = stampXY(r);
    if (S.stampMark && !S.miss) {
      const mx = S.sp.x, my = S.sp.y + dy, col = S.stampMark === 'pass' ? C.green : C.red, al = rev ? 0.4 : 1;
      ctx.globalAlpha = al * 0.8; if (!rev) for (const d of S.ink) rect(mx + 20 + d.dx, my + 20 + d.dy, d.s, d.s, col); ctx.globalAlpha = 1;
      spr(S.stampMark === 'pass' ? 'mark_ok' : 'mark_x', mx, my, { alpha: al });
      if (!rev) text(S.stampMark === 'pass' ? '통과' : '반려', mx + 20, my + 41, { a: 'center', f: 'b', c: col, out: C.paper });
    }
  }
  // 도장 자국 자리: 서류 오른쪽에서 값 글자와 겹치지 않는 높이를 고른다(없으면 예전 자리)
  function stampXY(r) {
    const sw = iw('mark_ok') || 40, sh = (ih('mark_ok') || 40) + 14, x = r.x + r.w - sw - 6, y0 = r.y + (r === DVZ ? 60 : 24);
    const boxes = lastRows.map(q => q.photo ? [q.hx, q.hy, q.hx + q.hw, q.hy + q.hh] : [q.cx - q.rx + 8, q.cy - q.ry + 3, q.cx + q.rx - 8, q.cy + q.ry - 3]);
    const free = y => boxes.every(b => b[2] < x - 2 || b[0] > x + sw + 2 || b[3] < y - 2 || b[1] > y + sh + 2);
    const ys = []; for (let y = r.y + 19; y + sh <= r.y + r.h - 2; y += 2) ys.push(y);
    ys.sort((a, b) => Math.abs(a - y0) - Math.abs(b - y0));
    const y = ys.find(free);
    return y != null ? { x, y } : { x: r.x + r.w - 66, y: y0 };
  }
  function zoomIcon(x, y) { frameRect(x - 8, y, 16, 12, C.ink); rect(x - 5, y + 3, 4, 2, C.ink); rect(x - 5, y + 3, 2, 4, C.ink); rect(x + 1, y + 7, 4, 2, C.ink); rect(x + 3, y + 5, 2, 4, C.ink); }
  function drawPanel() {
    if (S.phase === 'review' && (S.miss || S.coach)) return;
    const x0 = 324, y0 = 152, insp = S.phase === 'inspect' && !S.overlay;
    const st = S.phase === 'stamp' ? S.stampAnim : null;
    if (S.phase === 'review' || (S.phase === 'leave' && S.pt < 2)) {
      const lastOne = S.idx >= S.q.length - 1 || S.ended;
      button(x0, y0, 152, 54, lastOne ? '퇴근하기 ▶' : '다음 업체 ▶', reviewNext, { c: Math.floor(T / 30) % 2 ? C.yellow : C.cream, f: 'b', padT: 6, disabled: !!S.overlay });
      if (!TOUCH || kbd) text('Enter', x0 + 76, y0 + 38, { a: 'center', f: 9, c: C.gray });
    } else {
      const lockR = S.tut && S.idx === 0;
      button(x0, y0, 74, 54, '통과', () => stamp('pass'), { icon: st && st.verdict === 'pass' ? null : 'stamp_green', iconY: -8, ly: 39, tc: C.dgreen, disabled: !insp, padT: 6 });
      button(x0 + 78, y0, 74, 54, '반려', () => stamp('reject'), {
        icon: st && st.verdict === 'reject' ? null : 'stamp_red', iconY: -8, ly: 39, tc: C.dred, disabled: !insp || lockR, dim: insp && S.marks.size === 0, padT: 6,
        onDisabled: insp && lockR ? () => { S.nag = { text: '첫 업체는 연습이에요. 이상한 칸이 없으면 통과 도장!', t: 160 }; } : null,
      });
    }
    const canOpen = ['inspect', 'docs', 'review', 'react'].includes(S.phase) && !S.overlay;
    const items = [['규정집', 'rulebook', () => openOv('rules'), -3]];
    if (di >= 1) items.push(['기록판', 'magnifier', () => openOv('ledger'), 6]);
    items.push([zoomLabel(), null, zoomBtn, 0]);
    // 크게/작게 보기 버튼은 글자가 길어 폭을 더 준다(3개일 때 45·45·56)
    const gap = items.length > 2 ? 3 : 4, n = items.length, zw = n > 2 ? 56 : Math.floor((152 - (n - 1) * gap) / n), bw = Math.floor((152 - (n - 1) * gap - zw) / (n - 1));
    let bxx = x0;
    items.forEach(([lb, ic, fn, iy], i) => { const ww = i === n - 1 ? 152 - (bxx - x0) : bw, bx0 = bxx; button(bx0, y0 + 60, ww, 48, lb, fn, { icon: ic, iconY: iy, ly: 35, f: 9, disabled: ic ? !canOpen : false, draw: ic ? null : (bx, by) => zoomIcon(bx + ww / 2, by + 12) }); bxx += ww + gap; });
    // (w10) 표시 개수 배지: 버튼 위(y0-14)에 두면 크게 보기의 AI 경고 상자 아래 모서리와 겹쳐서 반려 버튼 안 오른쪽 위 모서리로
    if (S.marks.size && S.phase === 'inspect') { const bw2 = Math.max(20, tw('●' + S.marks.size, 9) + 6); box(x0 + 150 - bw2, y0 + 2, bw2, 13, C.red, C.ink); text('●' + S.marks.size, x0 + 150 - bw2 / 2, y0 + 3, { a: 'center', f: 9, c: C.white }); }
    if (st) { // 도장이 들려 올라갔다가 서류로 쾅
      const r = R(), sp = st.verdict === 'pass' ? 'stamp_green' : 'stamp_red';
      const fromX = st.verdict === 'pass' ? x0 + 18 : x0 + 96, sp0 = S.sp || { x: r.x + r.w - 66, y: r.y + 24 }, toX = sp0.x + 1, toY = sp0.y - 4;
      const t = st.t; let sx, sy;
      if (t < 8) { const k = t / 8; sx = fromX + (toX - fromX) * k; sy = y0 - 8 + (toY - 40 - y0 + 8) * k - Math.sin(k * Math.PI) * 14; }
      else if (t < 10) { sx = toX; sy = toY - 40 + (t - 8) * 20; }
      else if (t < 18) { sx = toX + (t < 12 ? (t % 2 ? 1 : -1) : 0); sy = toY; }
      else { sx = toX; sy = toY - (t - 18) * 6; }
      spr(sp, sx, sy);
    }
  }
  function drawAIPanel() {
    if (!S.hasAI || S.phase === 'review' || !S.a) return;
    if (S.phase === 'react' && R() === DVZ && S.judge) return; // 크게 보기 판정 배너 자리
    const on = ['docs', 'inspect', 'stamp', 'react'].includes(S.phase), alert = on ? S.a.aiAlert : null;
    const z = R() === DVZ, x = z ? 324 : 318, y = z ? 82 : 92, w = z ? 154 : 160; // (w15b) 작게 보기: 손님 자리(x≤310) 밖으로 — 경고 글 한 줄 최대 147px
    if (!on) { // 9차: 손님이 걸어 들어오는/나가는 동안엔 얼굴 높이(y≈50~110)를 비우고 아래쪽 한 줄 띠로만
      const sy = z ? 128 : 126, sh = 17;
      box(x, sy, w, sh, C.dgreen, C.ink); text('AI 감시 · 대기 중', x + 5, sy + 3, { f: 'b', c: C.yellow }); return;
    }
    let lh = 14; const top = z ? 19 : 18; // 머리말은 굵은 12px(작은 글꼴에선 'AI'가 '시'처럼 보였음)
    let ls = !on ? ['대기 중'] : alert ? wrap(alert, w - 10, 0) : ['이상 신호 없음', '그래도 직접 확인!'];
    if (ls.length > 3) ls = [ls[0], ls[1], fit(ls.slice(2).join(' '), w - 10, 0)];
    if (!z && ls.length > 2) ls = [ls[0], fit(ls.slice(1).join(' '), w - 10, 0)]; // 작게 보기: 모니터 아래 자리라 2줄까지
    if (ls.length > 2) lh = 13; // 3줄일 땐 13px(아래 도장과 안 겹치게), 2줄 이하는 14px로 글자끼리 안 닿게
    // 상자 높이를 줄 수에 맞춘다(글 아래 여백 5px 이상). 아래 도장 손잡이(PC y≈142~, 크게 보기 y≈151~)와 안 겹치게
    const h = z ? Math.max(57, top + ls.length * lh + 6) : Math.max(50, top + ls.length * lh + 4);
    box(x, y, w, h, alert ? C.dred : C.dgreen, C.ink);
    text(alert ? 'AI 경고 · 참고용' : 'AI 감시 · 참고용', x + 5, y + 3, { f: 'b', c: C.yellow });
    if (!on) { text(ls[0], x + 5, y + top, { c: C.white }); return; }
    rect(x + 4, y + 16, w - 8, 1, alert ? C.red : C.green);
    ls.forEach((l, i) => text(l, x + 5, y + top + i * lh, { c: C.white }));
  }
  function drawBubble() {
    const b = S.bubble; if (!b || !S.person || S.person.x < CW - 1 || S.phase === 'review') return;
    if (Math.floor(b.n) < 1) return; // 글자가 나오기 전 빈 말풍선은 그리지 않는다
    if (R() === DVZ) { // 서류 크게 보기: 오른쪽 위에 작은 얼굴 + 말
      // 안내 상자가 오른쪽 위에 떠 있으면 그 아래로 내린다(AI 상자가 있는 날은 자리가 없어 잠시 숨김)
      const hb = hintBoxH(); if (hb && S.hasAI) return;
      const x = 324, y = hb ? 20 + hb + 3 : 20, h = Math.min(58, 149 - y), sp = chSpr(S.person.k, S.person.face), w = 154;
      if (h < 34) return;
      box(x, y, w, h, C.white);
      rect(x + 3, y + 3, 30, 30, C.sky);
      if (IMG[sp] && IMG[sp].complete) { const sw = iw(sp), cs = Math.min(56, sw), fy0 = Math.max(0, Math.min(ih(sp) - cs, (FACEY[S.person.k] || 57) - 30)); ctx.drawImage(IMG[sp], Math.round((sw - cs) / 2), fy0, cs, cs, x + 4, y + 4, 28, 28); } // 얼굴 전체(머리~턱)를 반으로 줄여 보여 줌
      const nm = S.a.speaker || (S.a.docs.reg && S.a.docs.reg.rep) || ''; // 이름표 = 말하는 사람(대리인이면 speaker)
      if (nm && h >= 48) text(fit(nm, 32, 9), x + 18, y + 36, { a: 'center', f: 9, c: C.dred });
      let ls = wrapTyped(b.text, Math.floor(b.n), w - 44, 0); const mx = Math.max(2, Math.floor((h - 6) / 13));
      if (ls.length > mx) ls = ls.slice(0, mx - 1).concat([fit(ls.slice(mx - 1).join(' '), w - 44, 0)]);
      ls.forEach((l, i) => text(l, x + 38, y + 4 + i * 13, { c: C.ink }));
      return;
    }
    const bx = 10, bw = 176, pop = OPT.calm ? 0 : b.t < 6 ? [8, 4, -2, -1, 0, 0][b.t] : 0, by = 32 + pop; // 이름표(by-9)가 위쪽 HUD(~y17) 아래
    const lines = wrapTyped(b.text, Math.floor(b.n), bw - 14, 0), full = wrap(b.text, bw - 14, 0);
    const bh = 10 + full.length * 15;
    box(bx, by, bw, bh, C.white);
    for (let i = 0; i < 9; i++) { const t0 = by + 10 + Math.floor(i / 2), th = Math.max(2, 11 - i); rect(bx + bw - 1 + i, t0, 1, th, C.ink); if (th > 3 && i < 7) rect(bx + bw - 1 + i, t0 + 1, 1, th - 2, C.white); } // 말풍선 꼬리(손님 쪽)
    const nm = S.a.speaker || (S.a.docs.reg && S.a.docs.reg.rep) || (S.a.docs.bid && S.a.docs.bid.company) || '';
    if (nm) { box(bx + 6, by - 9, tw(nm, 9) + 10, 13, C.dred); text(nm, bx + 11, by - 8, { f: 9, c: C.white }); }
    lines.forEach((l, i) => text(l, bx + 7, by + 6 + i * 15, { c: C.ink }));
  }
  function hintNow() {
    if (S.coach && S.phase === 'inspect') return null;
    if (S.overlay || ['review', 'react', 'stamp', 'out'].includes(S.phase)) return null;
    if (S.nag && S.nag.t > 0) return { msg: S.nag.text, c: C.orange };
    if (S.ended && S.phase === 'inspect') return { msg: '18:00 퇴근 시간! 지금 업체까지만 심사해요.', c: C.orange };
    if (S.toast && S.toast.t > 0 && S.phase === 'inspect') return { msg: S.toast.text, c: C.sky };
    if (S.phase === 'enter' && S.idx === 1 && S.tut) return { msg: '화면을 누르면 걷는 장면을 건너뛰어요' };
    if (S.phase === 'inspect' && S.tut && S.idx < 2) {
      const keys = docsOf(S.a), n = keys.length, r = R(), g = tabGeom(n, r);
      const unseen = [...Array(n).keys()].find(i => !S.seen.has(i));
      const right = S.a.flaw && [...S.marks.keys()].some(m => S.a.flaw.fields.includes(m));
      if (tut2()) { // 둘째 연습: 현장 탭 → 빈 땅 사진 → 반려 순서로 짚는다
        const si = keys.indexOf('site');
        if (right) return { msg: '사유 표시 완료! 이제 반려 도장 쾅', tx: 441, ty: 132 };
        if (S.tab !== si) return { msg: '이번 업체는 수상해요. 위쪽 \'현장 확인\' 탭을 눌러 봐요', tx: r.x + 4 + si * g.tw0 + g.tw0 / 2, ty: g.ty - 12 };
        return { msg: '사진이 빈 땅(풀밭)이에요! 사진을 눌러 빨간 동그라미를 쳐요' };
      }
      if (unseen != null) return { msg: S.idx === 0 && S.a.tip && S.seen.size === 1 ? S.a.tip : '위쪽 탭을 눌러 서류를 모두 살펴봐요', tx: r.x + 4 + unseen * g.tw0 + g.tw0 / 2, ty: g.ty - 12 };
      if (S.a.flaw && !right) return { msg: (DATA.rules[S.a.flaw.rule] || {}).short + '! 이상한 칸을 눌러 동그라미' };
      if (S.a.flaw) return { msg: '사유 표시 완료! 반려 도장 쾅', tx: 441, ty: 132 };
      return { msg: '이상한 곳이 없나요? 그럼 통과 도장!', tx: 361, ty: 132 };
    }
    if (S.phase === 'inspect' && S.idle > 900) return { msg: '모르겠으면 규정집을 펼쳐 봐요', tx: 348, ty: 200 };
    return null;
  }
  function hintBoxH() { // 크게 보기에서 오른쪽 위 안내 상자 높이(없으면 0)
    const h = hintNow(); if (!h || R() !== DVZ) return 0;
    const lh = S.hasAI ? 13 : 14; return 8 + wrap(h.msg, 140, 0).slice(0, S.hasAI ? 4 : 5).length * lh;
  }
  function drawHint() {
    const h = hintNow(); if (!h) return;
    if (R() === DVZ) { // 서류 크게 보기: 오른쪽 위에
      const lh = S.hasAI ? 13 : 14, ls = clip(wrap(h.msg, 140, 0), S.hasAI ? 4 : 5, 140, 0), bh = 8 + ls.length * lh;
      box(324, 20, 154, bh, h.c || C.yellow); ls.forEach((l, i) => text(l, 331, 24 + i * lh, { c: C.ink }));
    } else if (S.hasAI) { // 작게 보기 + AI 날: 손님(x≤305)·AI 모니터(x≥406)·AI 상자(y≥92) 사이 빈칸(x307~401, y19~89)에만. 어느 것과도 1px도 안 겹침
      let ls = wrap(h.msg, 85, 9); if (ls.length > 5) ls = ls.slice(0, 4).concat([fit(ls.slice(4).join(' '), 85, 9)]);
      const bh = 6 + ls.length * 12, bx = 307, by = 19;
      box(bx, by, 95, bh, h.c || C.yellow);
      ls.forEach((l, i) => text(l, bx + 5, by + 3 + i * 12, { c: C.ink, f: 9 }));
    } else { // 작게 보기(PC): 왼쪽 말풍선·가운데 손님 얼굴(x≈200~300)과 안 겹치게 오른쪽 위(x306~476)
      const ls = clip(wrap(h.msg, 156, 0), 5, 156, 0), bh = 6 + ls.length * 14, bx = 306, by = 20;
      box(bx, by, 170, bh, h.c || C.yellow);
      ls.forEach((l, i) => text(l, bx + 7, by + 3 + i * 14, { c: C.ink }));
    }
    if (h.tx != null) arrow(h.tx, h.ty, 'down');
  }
  function drawOverlay() {
    if (!S.overlay) return;
    ctx.globalAlpha = 0.55; rect(0, 17, W, H, C.ink); ctx.globalAlpha = 1;
    const x = 14, y = 32, w = 452, h = 234;
    hit(0, 17, W, H, () => { S.overlay = null; sfx('click'); }, { cur: false });
    hit(x, y, w, h, () => {}, { cur: false });
    box(x, y, w, h, C.paper, C.ink, C.white);
    button(x + w - 70, y + 4, 64, 26, '닫기', () => { S.overlay = null; }, { c: C.red, tc: C.white, padT: 2 });
    if (S.overlay === 'rules') {
      const P = rulePages(); if (S.rpage >= P.length) S.rpage = 0;
      const pg = P[S.rpage], ri = P.filter(q => q.k === 'rules').length;
      // 쪽 이름표 3개(규칙·제재 명단·조작법). 누르는 높이 32
      [['규칙 ' + (P[0].n || 0) + '개', 'rules'], ['제재 명단', 'ban'], ['조작법', 'how']].forEach(([lb, kk], i) => {
        const on = pg.k === kk, bx = x + 8 + i * 106;
        box(bx, y + 5, 102, 24, on ? C.navy : C.line, C.ink); text(lb, bx + 51, y + 10, { a: 'center', f: 'b', c: on ? C.yellow : C.dgray });
        hit(bx, y + 1, 102, 32, () => { S.rpage = P.findIndex(q => q.k === kk); sfx('paper'); });
      });
      const bot = y + h - 38; // 아래 쪽 넘김 줄
      if (pg.k === 'rules') {
        let cy = y + 38;
        // 규칙마다 확인·쉬운 말 + 왜 막는지. 쪽 높이(158px)를 채우도록 '왜' 줄 수를 맞춘다(한 쪽 2개 → 아래가 비지 않게)
        // 규칙이 한 개뿐인 쪽은 긴 설명 + 예시 + 반려 사유까지, 두 개인 쪽은 짧은 설명(why)으로
        const one = pg.list.length === 1;
        const WF = TOUCH ? 0 : 9, WL = TOUCH ? 13 : 11; // (w10) 모바일은 '왜' 줄도 12px(10px 글꼴은 폰에서 너무 작음)
        const blk = pg.list.map(r => { const R0 = DATA.rules[r]; if (!R0) return null; const cl = wrap('확인: ' + (R0.check || ''), w - 36, 0), el = R0.easy ? wrap('쉬운 말: ' + R0.easy, w - 36, 0) : []; const xl = one ? [...(R0.ex && !TOUCH ? wrap(R0.ex, w - 36, 0) : []), ...wrap('반려 사유: ' + (R0.reason || ''), w - 36, 0)] : []; return { r, R0, cl, el, xl, ll: wrap('왜: ' + ((one && !TOUCH ? R0.learn : R0.why) || R0.learn || ''), w - 36, WF) }; }).filter(Boolean);
        const avail = bot - (y + 38) - 2, bH = b => 18 + (b.cl.length + b.el.length) * 13 + (b.ll.length ? b.ll.length * WL + 2 : 0) + (b.xl.length ? b.xl.length * 13 + 4 : 0) + 6;
        const tot = () => blk.reduce((s2, b) => s2 + bH(b) + 4, -4);
        while (tot() > avail) { const b = blk.reduce((m, q) => q.ll.length > m.ll.length ? q : m, blk[0]); if (!b.ll.length) break; const keep = b.ll.length - 1; b.ll = keep ? b.ll.slice(0, keep - 1).concat([fit(b.ll.slice(keep - 1).join(' '), w - 36, WF)]) : []; }
        if (window.__wrapSpy) blk.forEach(b => { if (b.ll.some(l => l.endsWith('…'))) window.__wrapSpy('규정집 잘림:' + b.r, w - 36, WF, ['…']); });
        blk.forEach(({ r, R0, cl, el, ll, xl }) => {
          const bh = bH({ cl, el, ll, xl });
          box(x + 10, cy, w - 20, bh, (D.newRules || []).includes(r) ? '#fff0b0' : C.cream, C.line);
          text(R0.name, x + 18, cy + 4, { f: 'b', c: C.dred }); text(fit(R0.short, w - 40 - tw(R0.name, 'b'), 0), x + 26 + tw(R0.name, 'b'), cy + 4, { c: C.ink });
          cl.forEach((l, j) => text(l, x + 18, cy + 18 + j * 13, { c: C.navy }));
          el.forEach((l, j) => text(l, x + 18, cy + 18 + (cl.length + j) * 13, { c: C.teal }));
          ll.forEach((l, j) => text(l, x + 18, cy + 20 + (cl.length + el.length) * 13 + j * WL, { f: WF, c: C.dgray }));
          { const y2 = cy + 20 + (cl.length + el.length) * 13 + ll.length * WL + 4; xl.forEach((l, j) => text(l, x + 18, y2 + j * 13, { c: l.startsWith('반려 사유') ? C.dred : C.ink })); }
          cy += bh + 4;
        });
        if (P.indexOf(pg) === ri - 1 && DATA.days.slice(di + 1).some(d2 => (d2.newRules || []).length) && cy < bot - 20)
          text('새 규칙은 날마다 여기에 하나씩 더해져요.', x + w / 2, cy + 6, { a: 'center', f: 9, c: C.dgray });
      } else if (pg.k === 'ban') {
        const bx = x + 18; let by = y + 40;
        text('부정당업자 제재 명단', bx, by, { f: 'b', c: C.dred }); by += 20;
        const bl = D.banlist || [];
        if (!bl.length) { text('오늘은 명단 확인 없음 (4일차부터)', bx, by, { c: C.dgray }); by += 22; } // 날짜 상자와 겹치지 않게 한 줄 내림
        const rh2 = bl.length >= 4 ? 18 : 22; // (w10) 명단이 4줄 이상이면 줄 간격을 좁혀 아래 안내·◀/▶ 줄과 띄운다
        for (const b of bl) { text(b.company + ' · 대표 ' + b.rep, bx, by, { f: 'b', c: C.ink }); text((b.from ? b.from + '~' + b.until : '~' + b.until + '까지') + ' 입찰 제한', bx + 196, by, { c: C.red }); by += rh2; } // (w11) 제재 기간을 시작~끝으로(적발 다음 날부터)
        box(bx - 4, by + 6, 190, 24, '#fff0b0'); text('오늘 ' + dateFull(di), bx + 4, by + 12, { f: 'b', c: C.navy });
        // (w10) 마지막 줄이 ◀/▶ 줄(bot+4)에 붙지 않게: 날짜 상자 바로 아래(by+36)에 두고 아래로 넘치면 위로 당김(줄 끝 ≥ 8px 여백)
        { const hl = wrap('업체명만 바꿔 오는 경우가 있어요. 대표자 이름까지 대조해요.', w - 40, 0), hy = Math.max(by + 34, Math.min(by + 36, bot - 8 - hl.length * 14));
          hl.forEach((l, j) => text(l, bx, hy + j * 14, { c: C.dgray })); }
      } else {
        const lx = x + 14; let ly = y + 40;
        text('도장 찍는 법', lx, ly, { f: 'b', c: C.navy }); ly += 18;
        ['① 위쪽 탭을 눌러 서류를 모두 넘겨 봐요.', '② 이상한 칸을 누르면 빨간 동그라미(다시 누르면 지움).', '③ 이상\u00a0없으면 통과, 동그라미를 쳤으면 반려 도장.', '겉모습(낡음·작음·새 회사)만으로 반려하면 억울한 업체가 생겨요.']
          .forEach((l, i) => wrap(l, w - 30, 0).forEach(s2 => { text(s2, lx, ly, { c: i === 3 ? C.dred : C.ink }); ly += 15; }));
        ly += 4;
        wrap('※ 게임이라 절차를 줄였어요. 실제로는 반려 뒤 소명·조사 절차가 따로 있고, 담합 징후는 반려와 함께 공정위에 조사를 맡겨요.', w - 30, 9).forEach(s2 => { text(s2, lx, ly, { f: 9, c: C.dgray }); ly += 11; });
        ly += 4;
        if (!TOUCH || kbd) text('키보드: ←→ 서류 · ↑↓ 칸 · Space 표시 · P 통과 · R 반려 · Z 크게', lx, ly, { f: 9, c: C.dgray });
        if (!TOUCH || kbd) text('B 규정집 · L 기록 · Enter 다음 · Esc 닫기 · M 소리', lx, ly + 11, { f: 9, c: C.dgray });
      }
      if (P.length > 1) {
        button(x + 10, bot + 4, 46, 30, '◀', () => { S.rpage = (S.rpage + P.length - 1) % P.length; sfx('paper'); });
        { const nm = q => q.k === 'rules' ? '규칙' + (ri > 1 ? ' ' + (P.indexOf(q) + 1) + '/' + ri + '쪽' : '') : q.k === 'ban' ? '제재 명단' : '조작법';
          text(nm(pg), x + 66, bot + 13, { f: 9, c: C.dgray }); text('다음: ' + nm(P[(S.rpage + 1) % P.length]), x + w - 66, bot + 13, { a: 'right', f: 9, c: C.dgray }); }
        button(x + w - 56, bot + 4, 46, 30, '▶', () => { S.rpage = (S.rpage + 1) % P.length; sfx('paper'); });
      }
    } else {
      text('오늘 받은 서류 기록', x + 12, y + 8, { f: 'b', c: C.navy });
      const cols = [['판정', 10], ['업체', 54], ['입찰금액', 150], ['투찰 IP', 248], ['기술인', 336]];
      cols.forEach(([n, cx]) => text(n, x + cx, y + 28, { f: 9, c: C.gray }));
      rect(x + 8, y + 40, w - 16, 1, C.ink);
      const rows = S.q.slice(0, S.idx + 1), rh = rows.length > 6 ? 23 : 25;
      const ips = {}; rows.forEach(a => { const ip = (a.docs.bid || {}).ip; if (ip) ips[ip] = (ips[ip] || 0) + 1; });
      const nmOf = a => { const st = a.docs.staff; return st ? [st.p1, st.p2, st.p3].filter(s => s && s !== '-').map(s => s.split('·')[0].trim()) : []; };
      const tech = {}; rows.forEach(a => new Set(nmOf(a)).forEach(n => { tech[n] = (tech[n] || 0) + 1; }));
      // 기술인 이름: 다른 업체 명부에도 있으면 IP처럼 빨간 글씨
      const names2 = (ns, x0, y0) => { let xx = x0; ns.forEach((n, k) => { const t = n + (k < ns.length - 1 ? ', ' : ''); text(t, xx, y0, { f: 9, c: tech[n] > 1 ? C.dred : C.ink }); xx += tw(t, 9); }); };
      rows.forEach((a, i) => {
        const yy = y + 45 + i * rh, cur = i === S.idx;
        if (cur) rect(x + 6, yy - 3, w - 12, rh - 1, '#fff0b0');
        const L = S.log.find(l => l.id === a.id);
        text(cur && !L ? '지금' : L ? (L.verdict === 'pass' ? '통과' : '반려') : '-', x + 10, yy, { f: 'b', c: cur && !L ? C.orange : L && L.verdict === 'pass' ? C.green : C.red });
        const bid = a.docs.bid || {}, st = a.docs.staff;
        text(fit(companyOf(a), 92, 0), x + 54, yy, {});
        text(bid.amount || '-', x + 150, yy, { f: 9 });
        text(bid.ip || '-', x + 248, yy, { f: 9, c: bid.ip && ips[bid.ip] > 1 ? C.dred : C.ink });
        const names = nmOf(a);
        if (!names.length) text('-', x + 336, yy, { f: 9 });
        else if (tw(names.join(', '), 9) <= 104) names2(names, x + 336, yy);
        else { names2(names.slice(0, 2), x + 336, yy - 2); names2(names.slice(2), x + 336, yy + 10); } // 두 줄은 12px 간격(겹침 없음)
      });
      text('같은 IP·겹치는 기술인(빨간 글씨)과 짠 듯한 금액은 의심 신호예요.', x + 12, y + h - 22, { f: 9, c: C.dgray });
    }
  }
  function drawJudge() {
    const j = S.judge; if (!j || S.phase !== 'react') return;
    const k = OPT.calm ? 1 : j.t < 6 ? [0.9, 1.12, 1.06, 1.02, 1, 1][j.t] : 1; // 빈 배너 프레임이 없게 처음부터 글자를 그림
    const big = R() === DVZ, w = Math.round((big ? 152 : 156) * k), h = Math.round(30 * k), x = (big ? 400 : 96) - w / 2, y = (big ? 128 : 98) - h / 2; // 작게 보기: 왼쪽 빈 벽(말풍선 아래 y83~113, x18~174) — 손님 얼굴(x≥200)을 안 가림. 크게 보기: 미니 말풍선·+점수 아래
    const rv = S.reveal > 0 && Math.floor(S.reveal / 8) % 2; // 정체 발각: 배너 자리에서 번갈아 깜빡(서류·말풍선을 안 가림)
    box(x, y, w, h, rv ? C.yellow : j.good ? C.dgreen : C.red, C.ink, C.white);
    text(rv ? '정체 발각!' : j.title, x + w / 2, y + 7, rv ? { a: 'center', f: 'b', c: C.dred } : { a: 'center', f: 'b', c: C.white, sh: C.ink });
  }
  function drawReview() { // 위에서 미끄러져 들어오면 윗줄이 잘려 보여서 제자리에서 흐리게 나타남
    if (S.phase !== 'review' || !S.rv) return;
    ctx.globalAlpha = OPT.calm ? 1 : Math.min(1, 0.35 + S.rv.t / 8); drawReview0(); ctx.globalAlpha = 1;
  }
  function drawReview0() { // 판정 뒤 설명. 서류 크게 보기면 오른쪽 작은 카드(서류는 큰 채로), 아니면 위쪽 큰 설명 카드
    if (S.phase !== 'review' || !S.rv) return;
    if (S.coach && S.a.explain) return drawExplain();
    if (S.miss) return drawMiss();
    const r = S.rv, j = S.judge, k = OPT.calm ? 1 : Math.min(1, r.t / 8);
    if (R() === DVZ) {
      const x = 324, w = 152, y = 19, h = 126;
      box(x, y, w, h, C.paper, C.ink, C.white);
      // 제목이 길면('정답! 반려 + 조사 의뢰') 말줄임 대신 두 줄로
      const tl = wrap(j.title, w - 46, 'b').slice(0, 2), off = (tl.length - 1) * 14;
      tl.forEach((l, i) => text(l, x + 6, y + 5 + i * 14, { f: 'b', c: j.good ? C.dgreen : C.dred }));
      if (!G.tutor) text((j.pts > 0 ? '+' : '') + j.pts, x + w - 6, y + 5, { f: 'b', c: j.pts > 0 ? C.orange : j.pts < 0 ? C.red : C.gray, a: 'right' });
      rect(x + 4, y + 20 + off, w - 8, 1, C.line);
      const L0 = r.lines.find(l => l[0] && !l[0].startsWith('AI') && l[0] !== '내 표시') || r.lines[0] || ['', ''];
      let yy = y + 24 + off;
      if (L0[0]) { text(L0[0], x + 6, yy, { f: 9, c: C.navy }); yy += 12; }
      for (const s2 of clip(wrap(L0[1], w - 12, 0), off ? 3 : 4, w - 12, 0)) { text(s2, x + 6, yy, { c: C.ink }); yy += 14; } // 아래 '설명 전체 보기' 버튼(y+94~) 위까지
      { const lw0 = r.lines.find(l => l[0] === '규정'); if (lw0) { const ll = wrap('규정: ' + lw0[1], w - 12, 9); if (yy + ll.length * 11 <= y + h - 34) ll.forEach(l => { text(l, x + 6, yy, { f: 9, c: C.navy }); yy += 11; }); } }
      button(x + 4, y + h - 32, w - 8, 28, '설명 전체 보기', () => { S.rvFull = true; sfx('paper'); }, { f: 9, c: C.cream });
      return;
    }
    const y = 19, ch = 108; // 아래 끝 y127: 서류 탭 '!' 배지(y129~) 위
    box(6, y, 468, ch, C.paper, C.ink, C.white);
    rect(10, y + 4, 46, 46, C.sky);
    const sp = chSpr('boss', r.face); if (IMG[sp]) { const sw = iw(sp), cw = Math.min(44, sw); spr(sp, 11, y + 5, { sx: Math.max(0, (sw - cw) / 2), sy: (FACEY.boss || 57) - 22, sw: cw, sh: 44 }); }
    text(j.title, 62, y + 3, { f: 'M', c: j.good ? C.dgreen : C.dred });
    if (!G.tutor) text((j.pts > 0 ? '+' : '') + j.pts + '점', 466, y + 4, { f: 'M', c: j.pts > 0 ? C.orange : j.pts < 0 ? C.red : C.gray, a: 'right' });
    wrapTyped('공팀장: ' + r.line, 5 + Math.floor(r.n), 400, 0).slice(0, 2).forEach((l, i) => text(l, 62, y + 24 + i * 13, { c: C.ink }));
    rect(12, y + 52, 456, 1, C.line);
    let yy = y + 56; const end = y + ch - 6;
    // 첫 근거 줄은 12px로, 남는 자리에 나머지(넘치면 '설명' 대신 서류 크게 보기·다시 보기에서 전체)
    r.lines.forEach(([lab, val], li) => {
      const big = li === 0 || (li === 1 && r.lines[0][0].startsWith('AI')), f = big ? 0 : 9, lh = big ? 14 : 11;
      const lw = lab ? tw(lab + ': ', 'b') : 0;
      if (yy + lh > end + 2) return;
      if (lab) text(lab + ':', 14, yy - (big ? 0 : 1), { f: 'b', c: lab.startsWith('AI') ? C.blue : C.navy });
      const ws = wrap(val, 446 - lw, f), room = Math.max(1, Math.floor((end + 2 - yy) / lh));
      for (const s2 of clip(ws, room, 446 - lw, f)) { text(s2, 14 + lw, yy, { f, c: C.ink }); yy += lh; }
      yy += 2;
    });
  }

  // (w15) 틀린 판정 화면: 왼쪽 서류(놓친 칸 깜빡) + 오른쪽 설명
  function drawMiss() {
    const m = S.missInfo, j = S.judge, x = 323, y = 19, w = 154, h = 248, iw0 = w - 12;
    box(x, y, w, h, C.paper, C.ink, C.white);
    rect(x + 3, y + 3, w - 6, 18, C.dred);
    text(m.title, x + 8, y + 6, { f: 'b', c: C.white });
    text((j.pts > 0 ? '+' : '') + j.pts, x + w - 7, y + 6, { f: 'b', c: j.pts < 0 ? C.yellow : C.white, a: 'right' });
    let yy = y + 26;
    const fitBlock = (s2, maxL0, maxL9) => { const a0 = wrap(s2, iw0, 0); if (a0.length <= maxL0) return { ls: a0, f: 0, lh: 14 }; const a9 = wrap(s2, iw0, 9); return { ls: clip(a9, maxL9, iw0, 9), f: 9, lh: 11 }; };
    const put = (lab, s2, c, m0, m9, lc) => { if (lab) { text(lab, x + 6, yy, { f: 9, c: lc || C.navy }); yy += 11; } const b = fitBlock(s2, m0, m9); b.ls.forEach(l => { text(l, x + 6, yy, { f: b.f, c }); yy += b.lh; }); yy += 4; };
    const lastOne = S.idx >= S.q.length - 1 || S.ended;
    if (TOUCH && !kbd) { // (w15b) 폰: 글을 12px로만 — 규정은 버튼 뒤로 접고, 이유·다음 행동을 먼저
      const showLaw = S.missLaw === m;
      put(m.hl || '', m.head, C.dred, 2, 4); // (w15d) '놓친 칸' 등은 '왜?'처럼 작은 제목으로 — 줄머리 혼자 남지 않게
      if (showLaw) put('근거 규정', lawBr(m.law), C.ink, 8, 10);
      else { put('왜?', m.why, C.ink, 4, 6); put('다음엔 여기부터', m.tip, C.dgreen, 3, 4, C.teal); }
      button(x + 4, y + h - 64, w - 8, 26, showLaw ? '◀ 이유 다시 보기' : '근거 규정 보기 ▶', () => { S.missLaw = showLaw ? null : m; }, { f: 'b', c: C.cream, padT: 2 });
      button(x + 4, y + h - 34, w - 8, 30, lastOne ? '알겠어요 · 퇴근 ▶' : '알겠어요 · 다음 ▶', reviewNext, { f: 'b', c: Math.floor(T / 30) % 2 ? C.yellow : C.cream });
      return;
    }
    put(m.hl || '', m.head, C.dred, 2, 4); // (w15d) '놓친 칸' 등은 '왜?'처럼 작은 제목으로 — 줄머리 혼자 남지 않게
    put('왜?', m.why, C.ink, 4, 6);
    put('', '규정: ' + lawBr(m.law), C.dgray, 0, 3);
    put('다음엔 여기부터', m.tip, C.dgreen, 3, 4, C.teal);
    button(x + 4, y + h - 34, w - 8, 30, lastOne ? '알겠어요 · 퇴근 ▶' : '알겠어요 · 다음 ▶', reviewNext, { f: 'b', c: Math.floor(T / 30) % 2 ? C.yellow : C.cream });
  }
  // (w15) 연수 판정 뒤: 실제 업무처럼 서류·칸·규정으로 '왜'
  function drawExplain() {
    const a = S.a, j = S.judge;
    ctx.globalAlpha = 0.55; rect(0, 17, W, H - 17, C.ink); ctx.globalAlpha = 1;
    hit(0, 17, W, H - 17, () => {}, { cur: false });
    box(8, 21, 464, 245, C.paper, C.ink, C.white);
    text(a.flaw ? '왜 반려일까요?' : '왜 통과일까요?', 18, 27, { f: 'M', c: a.flaw ? C.dred : C.dgreen });
    text(G.tutor ? j.title : j.title + ' ' + (j.pts > 0 ? '+' : '') + j.pts, 462, 31, { f: 'b', a: 'right', c: j.good ? C.dgreen : C.dred });
    rect(14, 49, 452, 1, C.line);
    let yy = 55;
    for (const [lab, val] of a.explain) {
      text(lab, 18, yy, { f: 'b', c: lab === '판단' ? C.dred : lab === '기억' ? C.teal : C.navy });
      const ls = wrap(val, 368, 0); ls.forEach((l, i) => text(l, 94, yy + i * 14, { c: lab === '판단' ? C.dred : C.ink }));
      yy += Math.max(1, ls.length) * 14 + 6;
    }
    const lastOne = S.idx >= S.q.length - 1;
    button(312, 228, 152, 32, lastOne ? '연수 마치기 ▶' : '다음 연수 업체 ▶', reviewNext, { f: 'b', c: Math.floor(T / 30) % 2 ? C.yellow : C.cream });
    if (!TOUCH || kbd) text('Enter', 300, 238, { f: 9, c: C.gray, a: 'right' });
  }
  // (w15) 연수 칸 짚기: 주변을 어둡게 + 노란 테두리 + 말풍선. 짚은 곳만 눌림
  function drawCoach() {
    const st = coachStep(); if (!st) return;
    const t = coachRect(st); if (!t) return;
    ctx.globalAlpha = 0.62;
    rect(0, 17, W, Math.max(0, t.y - 17), C.ink); rect(0, t.y + t.h, W, H - t.y - t.h, C.ink); rect(0, t.y, t.x, t.h, C.ink); rect(t.x + t.w, t.y, W - t.x - t.w, t.h, C.ink);
    ctx.globalAlpha = 1;
    frameRect(t.x - 2, t.y - 2, t.w + 4, t.h + 4, OPT.calm || Math.floor(T / 15) % 2 ? C.yellow : C.orange, 2);
    const tap = st.need === 'tap', foot = tap ? (TOUCH && !kbd ? '아무 곳이나 누르면 다음 ▶' : '클릭 또는 Enter → 다음 ▶') : '반짝이는 테두리 안을 직접 눌러요';
    const steps = (COACH[S.a.id] || []).length;
    const lay = w => { const ls = wrap(st.msg, w - 14, 0), fl = wrap(foot, w - 14, 9); return { ls, fl, h: 22 + ls.length * 14 + fl.length * 11 + 3 }; }; // (w15) 좁은 상자에선 안내 줄도 줄바꿈
    let bx, by, bw = 236, L = lay(bw);
    const cx = Math.max(4, Math.min(W - 4 - bw, t.x + t.w / 2 - bw / 2));
    if (st.tg.startsWith('tab:') && W - 4 - 330 >= 140) { bx = 330; bw = W - 4 - bx; L = lay(bw); by = Math.min(H - 2 - L.h, t.y + t.h + 30); } // (w15) 탭 짚기: 서류 칸을 가리지 않게 오른쪽
    else if (t.y + t.h + 8 + L.h <= H - 2) { bx = cx; by = t.y + t.h + 8; }
    else if (t.y - 8 - L.h >= 19) { bx = cx; by = t.y - 8 - L.h; }
    else if (W - 4 - (t.x + t.w + 8) >= 150) { bx = t.x + t.w + 8; bw = W - 4 - bx; L = lay(bw); by = Math.max(19, Math.min(H - 2 - L.h, t.y)); }
    else if (t.x - 12 >= 150) { bw = t.x - 12; bx = 4; L = lay(bw); by = Math.max(19, Math.min(H - 2 - L.h, t.y)); }
    else { bx = cx; by = 19; }
    const nud = S.coachNudge > 0 && !OPT.calm ? (S.coachNudge % 6 < 3 ? 2 : -2) : 0;
    box(bx + nud, by, bw, L.h, S.coachNudge > 0 ? C.yellow : C.white, C.ink, C.white);
    text('연수 ' + (S.cs + 1) + '/' + steps, bx + nud + 7, by + 4, { f: 9, c: C.dgray });
    if (S.coachNudge > 0) text('여기만 눌러요!', bx + nud + bw - 7, by + 4, { f: 9, c: C.dred, a: 'right' });
    L.ls.forEach((l, i) => text(l, bx + nud + 7, by + 17 + i * 14, { c: C.ink }));
    L.fl.forEach((l, i) => text(l, bx + nud + bw - 7, by + L.h - 13 - (L.fl.length - 1 - i) * 11, { f: 9, c: tap ? C.blue : C.dred, a: 'right' }));
    // 막기: 짚은 곳 밖은 눌러도 반응 없음(정보 단계는 아무 곳이나 = 다음)
    if (tap) hit(0, 17, W, H - 17, coachTap, { cur: false });
    else { const nb = () => coachDeny(); hit(0, 17, W, t.y - 17, nb, { cur: false }); hit(0, t.y + t.h, W, H, nb, { cur: false }); hit(0, t.y, t.x, t.h, nb, { cur: false }); hit(t.x + t.w, t.y, W, t.h, nb, { cur: false }); }
  }
  S.draw = () => {
    // 모니터 그림: 크게 보기에선 오른쪽 칸을 말풍선·AI 상자가 쓰므로 그리지 않음, 안내 상자가 그 자리에 뜨면 잠시 숨김(조각만 보이지 않게)
    const ai = S.hasAI && R() !== DVZ ? { alert: S.a && ['inspect', 'stamp', 'react', 'docs'].includes(S.phase) ? S.a.aiAlert : null } : null;
    drawRoom(S.person, { ai });
    drawBubble();
    drawAIPanel();
    drawDesk();
    drawPanel();
    drawJudge();
    drawReview();
    drawHint();
    const paused = S.phase !== 'inspect' || !!S.overlay || tutor() || S.ended;
    const remain = S.q.length - S.log.length;
    if (S.coach) { // 연수: 시계 없음 + 건너뛰기
      hud({ left: (G && G.taste ? '맛보기 · ' : '') + '연수 ' + Math.min(S.q.length, S.idx + 1) + '/' + S.q.length + ' · 점수 없음' });
      drawCoach();
      // (w15b) 터치 영역: 위 2 + 버튼 17 + 아래 14 = 33 논리px(폰 가로·세로 배율 1.44 → 47 CSS px). 실수로 닿아도 바로 끝나지 않게 두 번 눌러야 건너뜀
      if (S.skipArm > 0) S.skipArm--;
      if (opt.onSkip) button(300, 1, 116, 15, S.skipArm > 0 ? '한 번 더 누르면 건너뜀' : '연수 건너뛰기 ▶', () => { if (S.skipped) return; if (!(S.skipArm > 0)) { S.skipArm = 150; return; } S.skipped = true; opt.onSkip(); }, { f: 9, c: S.skipArm > 0 ? C.yellow : C.cream, padT: 2, padB: 14 });
    } else hud({ left: D.day + '일차 ' + dateShort(di), clock: S.ended ? '18:00' : clockStr(S.clock, S.sec), late: S.late, gauge: tutor() ? 1 : 1 - S.clock / S.sec, secLeft: tutor() || S.ended ? null : Math.max(0, Math.ceil(S.sec - S.clock)), paused, left2: '남은 ' + remain + '곳' });
    drawOverlay();
  };
  return S;
}


// ───────── (w15) 연수(튜토리얼): 통과 1건·반려 1건을 칸마다 짚어 가며 ─────────
const TUT_KEY = 'ppg404_tut';
function tutDone() { try { return localStorage.getItem(TUT_KEY) === '1'; } catch (e) { return false; } }
function markTut() { try { localStorage.setItem(TUT_KEY, '1'); } catch (e) {} }
function tutApps() { return JSON.parse(JSON.stringify(DATA.tutorial.applicants)); }
// 칸 짚기 단계: tg = 짚을 곳(person·doc·tab:키·row:칸·btn:pass/reject/rules), need = tap(누르면 다음)·tab·mark·pass·reject
const COACH = {
  t1: [
    { tg: 'person', need: 'tap', msg: '업체 대표가 입찰 서류를 냈어요. 서류가 진짜인지 보고 통과·반려 도장을 찍는 게 심사관 일이에요.' },
    { tg: 'doc', need: 'tap', msg: "지금 펼친 건 '입찰서'예요. 회사 이름·물건·금액이 적혀 있어요." },
    { tg: 'tab:reg', need: 'tab', msg: "위쪽 '등록증' 탭을 눌러 보세요." },
    { tg: 'row:reg.addr', need: 'tap', msg: "'사업장'은 회사가 있다고 신고한 주소예요. '학교앞길 5'를 기억해 두세요." },
    { tg: 'tab:site', need: 'tab', msg: "이제 '현장 확인' 탭. 조사관이 그 주소에 직접 가 본 기록이에요." },
    { tg: 'row:site.addr', need: 'tap', msg: "확인 주소도 '학교앞길 5', 등록증 사업장과 같아요. 두 서류를 맞춰 보는 게 핵심이에요." },
    { tg: 'row:site.photo', need: 'tap', msg: '현장 사진: 작은 가게지만 진짜 있어요.' },
    { tg: 'row:site.staff', need: 'tap', msg: '상시 인원 2명이 일해요. 작거나 낡은 건 반려 사유가 아니에요.' },
    { tg: 'btn:rules', need: 'tap', msg: '헷갈리면 규정집을 펼쳐요. 펼친 동안엔 시계가 멈춰요.' },
    { tg: 'btn:pass', need: 'pass', msg: "이상한 칸이 없어요. '통과' 도장을 눌러요." },
  ],
  t2: [
    { tg: 'person', need: 'tap', msg: '이번엔 공사 회사 대표예요. 겉모습 말고 서류를 맞춰 봐요.' },
    { tg: 'tab:reg', need: 'tab', msg: "'등록증' 탭을 눌러요." },
    { tg: 'row:reg.opened', need: 'tap', msg: '2026년 10월에 연 새 회사예요. 새 회사인 것만으론 문제없어요. 함정이에요!' },
    { tg: 'tab:site', need: 'tab', msg: "'현장 확인' 탭을 눌러요." },
    { tg: 'row:site.addr', need: 'tap', msg: '주소는 등록증과 같아요. 여기까진 정상이에요.' },
    { tg: 'row:site.photo', need: 'tap', msg: '그런데 사진이 풀밭이에요. 건물이 없어요.' },
    { tg: 'row:site.staff', need: 'tap', msg: '상시 인원 0명. 공사할 사람이 없어요. 서류에만 있는 회사(페이퍼컴퍼니) 의심!' },
    { tg: 'row:site.photo', need: 'mark', msg: '수상한 칸을 눌러 빨간 동그라미를 쳐요. 사진을 눌러 보세요.' },
    { tg: 'btn:reject', need: 'reject', msg: "동그라미가 반려 사유예요. 이제 '반려' 도장! 동그라미 없이는 반려할 수 없어요." },
  ],
};
// 연수는 본편 기록(G)을 건드리지 않게 따로 돌리고 끝나면 되돌린다
function loadSaveSafe() { try { return !!localStorage.getItem(SAVE_KEY) && !!loadSave(); } catch (e) { return false; } }
function startTutorial(after, o = {}) {
  const keep = G, keepShown = scoreShown; let done = false;
  G = blankG(); G.tutor = true; scoreShown = 0;
  const fin = () => { if (done) return; done = true; markTut(); G = keep; scoreShown = keepShown; if (o.inGame) after(); else go(after); };
  const skip = fin;
  const T0 = DATA.tutorial, steps = [
    () => setScene(Talk(T0.intro, next, { title: '연수 · 모의 심사 2건', di: 0, skipAll: skip })),
    () => setScene(Work(0, null, { apps: tutApps(), coach: true, onEnd: next, onSkip: skip })),
    () => setScene(Talk(!o.inGame || after !== next ? T0.outro.concat(loadSaveSafe() ? [{ who: 'boss', face: 'normal', text: "하던 근무는 타이틀의 '이어하기'로 이어져요. 기록은 그대로예요." }] : []) : T0.outro, next, { title: '연수 끝', di: 0 })),
  ];
  let k = 0;
  function next() { const f = steps[k++]; if (f) { if (k === 1 && o.inGame) f(); else go(f); } else fin(); }
  next();
}

// ───────── 3분 맛보기: 연수 2곳(통과·반려) → 5일차 AI 장면 2곳 ─────────
function tasteApps() {
  const d5 = DATA.days[4].applicants;
  const g = JSON.parse(JSON.stringify(d5.find(a => a.id === 'd5a1')));
  delete g.enterIf; g.say.enter = '아이고, 젊은 양반. 우리 두부는 새벽 4시에 만들어.';
  g.boss.wrong = 'AI 경고만 믿었네요. 주소·인원 다 맞는 정상 가게예요.';
  const v = JSON.parse(JSON.stringify(d5.find(a => a.id === 'd5a7')));
  v.flaw.fields = v.flaw.fields.filter(f => f !== 'bid.ip'); v.aiAlert = '빈 땅 사진·직원 0명 — 페이퍼컴퍼니 의심';
  v.say.caught = '빈 땅에 404 번호까지… 다 들켰군.';
  v.boss = { correct: '완벽해요! 빈 땅, 직원 0명, 404 번호. 서류에만 있는 회사예요.', wrong: '다시 봐요. 풀밭 사진, 직원 0명, 404로 시작하는 번호예요.' };
  return [tutApps(), [g, v]]; // (w15) 앞 두 곳 = 연수 업체(칸 짚기 안내)
}
function startTaste() {
  G = blankG(); G.taste = true; scoreShown = 0;
  const [a1, a5] = tasteApps();
  const steps = [
    () => setScene(Talk([
      { who: 'boss', face: 'normal', text: '어서 와요, 새봄 심사관! 여긴 나라장터 입찰 창구 404호예요.' },
      { who: 'boss', face: 'happy', text: "404는 인터넷에서 '찾을 수 없음'이죠. 서류에만 있고 실제론 없는 회사를 찾는 창구예요." },
      { who: 'boss', face: 'normal', text: "수상하면 '반려'(서류를 돌려보냄), 멀쩡하면 '통과'. 3분 맛보기, 시작해요!" },
    ], next, { title: '3분 맛보기', sub: dateShort(0), di: 0 })),
    () => setScene(RuleCard('paper', next)),
    () => { G.tutor = true; setScene(Work(0, null, { apps: a1, onEnd: tutDone, coach: true, onSkip: tutDone })); }, // (w15c) 연수는 점수 없음 — 끝나면(건너뛰기 포함) 0점부터
    () => setScene(Talk([
      { who: 'boss', face: 'happy', text: '잘했어요! 이제 금요일로 건너뛸게요. 이날부터 AI 감시 화면이 업체마다 경고를 띄워요.' },
      { who: 'boss', face: 'normal', text: 'AI는 돕는 거고 도장은 사람이 찍어요. AI 경고가 서류와 맞는지 직접 봐요.' },
    ], next, { title: '5일차 · AI가 왔다', sub: dateShort(4), di: 4 })),
    () => setScene(Work(4, null, { apps: a5, onEnd: r => { G.tasteOk = r.ok; G.tasteN = r.assigned; next(); } })),
    () => setScene(TasteEnd()),
  ];
  let k = 0;
  function next() { const f = steps[k++]; if (f) go(f); }
  function tutDone() { G = blankG(); G.taste = true; scoreShown = 0; next(); }
  next();
}
function TasteEnd() {
  const total = 200; // (w15c) 점수는 5일차 2곳만(연수 2곳은 점수 없음)
  return {
    init() { this.t = 0; this.sel = 0; music('endingGood'); sfx('fanfare');
      keyHandler = k => { if (k === 'ArrowLeft' || k === 'ArrowRight') { this.sel ^= 1; sfx('menuMove'); } else if ((k === 'Enter' || k === ' ') && this.btns) { sfx('click'); this.btns[this.sel](); } }; },
    update() { this.t++; },
    draw() {
      spr('ending_good', 0, 0);
      const PX = 60, PY = 26, PW = 360, PH = 196;
      ctx.globalAlpha = 0.86; rect(PX, PY, PW, PH, C.ink); ctx.globalAlpha = 1; frameRect(PX, PY, PW, PH, C.navy, 2);
      text('3분 맛보기 끝!', W / 2, PY + 10, { a: 'center', f: 'M', c: C.yellow });
      text('실전 ' + (G.tasteN || 2) + '곳 중 ' + (G.tasteOk || 0) + '곳 정답 · 점수 ' + G.score + ' / ' + total, W / 2, PY + 36, { a: 'center', f: 'b', c: C.white });
      const body = ['낡은 가게는 통과, 빈 땅 회사는 반려.', 'AI가 틀려도 도장 찍은 사람이 책임져요.', '', '본편은 5일 동안 34곳을 심사해요(약 20분).', '기술자 이름 빌리기·담합·제재 업체·', '중대재해·혁신제품까지 규칙이 하루씩 쌓여요.'];
      body.forEach((l, i) => text(l, W / 2, PY + 60 + i * 16, { a: 'center', c: i < 2 ? C.sky : C.white }));
      if (this.t > 30) {
        const bs = [['본편 시작 ▶', () => { newGame(); clearSave(); go(() => startDay(0)); }], ['처음으로', () => go(() => setScene(Title))]];
        this.btns = bs.map(b => b[1]);
        bs.forEach(([lb, fn], i) => button(W / 2 - 150 + i * 160, H - 42, 140, 32, lb, fn, { f: 'b', c: i ? C.line : C.yellow, focus: kbd && this.sel === i }));
      }
    },
  };
}

// 하루 결과
const SHORT_VERDICT = { okpass: '통과 · 정답', caught: '반려 · 정답', wrongreason: '반려 · 사유 틀림', missed: '통과 · 놓침', unfair: '반려 · 억울함', nogrounds: '반려 · 근거 부족', skipped: '미처리' };
const BRIEF_PRE = { okpass: '정상: ', caught: '근거: ', wrongreason: '진짜 근거: ', missed: '놓친 근거: ', unfair: '정상: ', nogrounds: '근거 부족: ' };
// (w15) 하루 결과: 틀린 판정을 유형별로 묶고 다음에 먼저 볼 곳
const UNFAIR_TIP = ['낡거나 작은 가게도 서류가 맞으면 통과예요.', '새 회사·비슷한 이름은 사유가 아니에요.', '금액만 비슷해선 담합이 아니에요.', '사고 기록만으론 반려하지 않아요.', 'AI 경고는 힌트예요. 서류로 확인해요.'];
const lawBr = s => String(s || '').replace(/\)·/g, ')· '); // (w15c) '…(입찰참가자격)·입찰자격' 같은 긴 덩어리가 낱말 중간에서 끊기지 않게
function missTypes(rows, di) {
  const M = new Map();
  for (const l of rows) {
    if (l.good) continue;
    const a = findApp(l.id).a, rule = a && a.flaw && DATA.rules[a.flaw.rule];
    let key, name, tip;
    if (l.kind === 'skipped') { key = 'skip'; name = '미처리(시간 초과)'; tip = '한 업체에 오래 머물지 마세요.'; }
    else if (l.kind === 'nogrounds') { key = 'nog'; name = '근거 부족 반려'; tip = '그날 서류끼리 어긋난 칸이 있을 때만 반려해요.'; }
    else if (l.kind === 'unfair') { key = 'unfair'; name = '억울한 반려'; tip = UNFAIR_TIP[Math.min(4, di || 0)]; }
    else if (rule) { key = a.flaw.rule + l.kind; name = rule.name + (l.kind === 'wrongreason' ? ' 사유 틀림' : ' 놓침'); tip = rule.tip; }
    else continue;
    const q = M.get(key) || { name, tip, n: 0 }; q.n++; M.set(key, q);
  }
  return [...M.values()].sort((a, b) => b.n - a.n);
}
function Result(di, res) {
  const D = DATA.days[di];
  const rows = res.log.map(l => Object.assign({}, l)).concat((res.skippedIds || []).map((id, i) => ({ id, company: res.skippedNames[i], kind: 'skipped', verdict: null, good: false, detail: '시간이 모자라 심사하지 못함 (0점)', pts: 0 })));
  return {
    init() {
      this.t = 0; this.rows = rows; this.res = res; music('result'); sfx('fanfare'); this.shown = 0; this.rowT = []; this.view = null; this.sel = -1;
      this.wt = missTypes(rows, di); this.box = this.wt.length ? 'miss' : 'learn'; // (w15) 놓친 유형 모아 보기
      // 키보드: ↑↓ 줄 고르기 · Enter 그 줄 다시 보기(고른 줄이 없으면 다음 날) · 다시 보기 안에서 ←→ 탭
      keyHandler = k => {
        if (this.view) { viewKey(this.view, k, () => { this.view = null; }); return; }
        if (k === 'ArrowDown') { this.sel = Math.min(rows.length - 1, this.sel + 1); sfx('menuMove'); }
        else if (k === 'ArrowUp') { this.sel = Math.max(-1, this.sel - 1); sfx('menuMove'); }
        else if (k === 'Escape') this.sel = -1;
        else if (k === 'Enter' || k === ' ') { if (this.sel >= 0 && rows[this.sel]) { this.view = makeView(rows[this.sel]); sfx('open'); } else this.next(); }
      };
    },
    next() { if (this.t < 40 || this.view) return; if (di + 1 < DATA.days.length) go(() => startDay(di + 1)); else go(() => setScene(Ending())); },
    update() {
      this.t++;
      if (this.t % 10 === 0 && this.shown < rows.length) { const r = rows[this.shown]; this.rowT[this.shown] = this.t; this.shown++; sfx(r.good ? 'coin' : 'pop'); }
    },
    draw() {
      rect(0, 0, W, H, C.navy);
      for (let i = 0; i < 20; i++) rect((i * 53 + T / 3) % W, (i * 37) % H, 2, 2, C.blue);
      hud({ left: D.day + '일차 결과 · ' + dateShort(di) });
      const x = 8, y = 20, bw = 290;
      box(x, y, bw, 248, C.paper, C.ink, C.white);
      text('오늘 배정된 업체 ' + rows.length + '곳', x + 10, y + 5, { f: 'b', c: C.navy });
      text('줄을 누르면 서류 다시 보기', x + bw - 8, y + 7, { f: 9, c: C.dgray, a: 'right' });
      const rh = Math.min(32, Math.floor(224 / Math.max(1, rows.length))); // 휴대폰에서 줄 높이 약 44px
      rows.slice(0, this.shown).forEach((l, i) => {
        const age = this.t - (this.rowT[i] || 0), off = OPT.calm ? 0 : Math.max(0, 8 - age) * 8, yy = y + 22 + i * rh + Math.max(0, Math.floor((rh - 26) / 2));
        if (kbd && this.sel === i) frameRect(x + 3, yy - 3, bw - 6, rh - 1, Math.floor(T / 10) % 2 ? C.blue : C.sky, 2);
        const rx = x + off;
        if (age === 8 && !OPT.calm) burst(x + 15, yy + 7, l.good ? C.green : C.red, 4, 1.2);
        verdictIcon(rx + 8, yy, l.kind === 'skipped' ? 'skip' : l.good ? 'ok' : 'bad');
        text(fit(l.company, 150, 'b'), rx + 28, yy, { f: 'b', c: l.kind === 'skipped' ? C.dgray : C.ink });
        const vt = SHORT_VERDICT[l.kind] || '';
        text(vt, x + bw - 10, yy + 1, { f: 9, c: l.kind === 'skipped' ? C.gray : l.good ? C.dgreen : C.red, a: 'right' });
        const ap = findApp(l.id).a, br = ap && ap.brief && l.kind !== 'skipped' ? BRIEF_PRE[l.kind] + ap.brief : (l.detail || l.why || ''), bf = TOUCH && tw(br, 0) <= bw - 40 ? 0 : 9;
        text(fit(br, bw - 40, bf), rx + 28, yy + (bf ? 12 : 13), { f: bf, c: l.good ? C.dgray : l.kind === 'skipped' ? C.gray : C.dred });
        if (!this.view) hit(x + 2, yy - 3, bw - 4, rh, () => { this.sel = i; this.view = makeView(l); sfx('open'); });
      });
      const rx = 304, rw = 168;
      box(rx, y, rw, 116, C.cream, C.ink, C.white);
      const acc = res.total ? Math.round(res.ok / res.total * 100) : 0, comp = Math.round(res.total / (res.assigned || 1) * 100);
      const stat = (lb, v, c, yy) => { text(lb, rx + 8, yy, { f: 9, c: C.gray }); text(v, rx + rw - 8, yy - 1, { f: 'b', c, a: 'right' }); };
      const sy = k => res.floored ? y + 5 + k * 13 : y + 7 + k * 14; // (w14) 하한 안내 줄이 들어갈 자리만큼 줄 간격을 좁힘
      stat('처리한 업체', res.total + '/' + res.assigned + '곳 (' + comp + '%)', comp === 100 ? C.green : C.orange, sy(0));
      stat('정확도(처리한 것)', acc + '%', acc >= 80 ? C.green : C.orange, sy(1));
      stat('막은 계약금', won(res.saved), C.navy, sy(2));
      stat('억울한 반려', res.unfair + '곳', res.unfair ? C.red : C.green, sy(3));
      stat('놓친 부정 업체', res.missed + '곳', res.missed ? C.red : C.green, sy(4));
      stat('미처리(0점)', res.skipped + '곳', res.skipped ? C.red : C.green, sy(5));
      rect(rx + 6, res.floored ? y + 83 : y + 92, rw - 12, 1, C.line);
      { const cy = res.floored ? y + 87 : y + 97; spr('coin', rx + 8, cy); text('오늘 ' + ((res.pts || 0) >= 0 ? '+' : '') + (res.pts || 0) + ' · 합계 ' + G.score, rx + 24, cy, { f: 'b', c: C.dred }); }
      if (res.floored) text(fit('※ 0점 아래로는 깎이지 않아요', rw - 16, 9), rx + 8, y + 102, { f: 9, c: C.dgray }); // (w14) 하한에 걸린 날만
      box(rx, y + 120, rw, 92, C.yellow, C.ink, C.white);
      if (this.wt.length) { // 탭 두 개: 놓친 유형 / 배운 상식
        [['놓친 유형 ' + this.wt.reduce((s2, q) => s2 + q.n, 0), 'miss'], ['배운 상식', 'learn']].forEach(([lb, k], i) => {
          const on = this.box === k, bx2 = rx + 3 + i * 82; box(bx2, y + 123, 80, 15, on ? C.dred : C.cream, C.ink); text(lb, bx2 + 40, y + 125, { f: 9, c: on ? C.white : C.dgray, a: 'center' });
          if (!this.view) hit(bx2, y + 116, 80, 26, () => { this.box = k; sfx('paper'); });
        });
      } else text('오늘 배운 조달 상식', rx + 8, y + 124, { f: 'b', c: C.dred });
      if (this.box === 'miss') { // 유형 하나를 자세히(팁 끝까지), 나머지는 이름만 — 상자를 누르면 다음 유형
        const n = this.wt.length, q = this.wt[(this.ws || 0) % n];
        // (w15c) 긴 유형 이름은 자르지 않는다: 한 줄 → 작은 글씨 한 줄 → 작은 글씨 두 줄
        const pgl = ((this.ws || 0) % n + 1) + '/' + n + ' ▶', nm = q.name + ' ×' + q.n, aw = rw - 14 - (n > 1 ? tw(pgl, 9) + 10 : 0); // (w15d) 쪽 표시와 10px 띄움
        const sp = q.name.match(/^(.*?) (사유 틀림|놓침)$/); // 두 줄이면 유형 이름 / '놓침 ×n'으로 나눈다
        const nl = tw(nm, 0) <= aw ? [[nm, 0]] : tw(nm, 9) <= aw ? [[nm, 9]] : sp && tw(sp[1], 9) <= aw ? [[sp[1], 9], [sp[2] + ' ×' + q.n, 9]] : wrap(nm, aw, 9).slice(0, 2).map(l => [l, 9]);
        nl.forEach(([l, f], i) => text(l, rx + 7, y + 142 + (f ? 1 : 0) + i * 10, { f: f || undefined, c: C.dred }));
        const ex = (nl.length - 1) * 10;
        if (n > 1) text(pgl, rx + rw - 7, y + 143, { f: 9, c: C.navy, a: 'right' });
        const others = this.wt.filter(o => o !== q), tl = clip(wrap(q.tip, rw - 14, 9), (others.length ? 4 : 5) - (ex ? 1 : 0), rw - 14, 9);
        tl.forEach((l, i) => text(l, rx + 7, y + 157 + ex + i * 11, { f: 9, c: C.ink }));
        if (others.length) text('그 밖에 ' + others.length + '가지 · 눌러서 보기', rx + 7, y + 199, { f: 9, c: C.dgray }); // (w15c) 이름을 잘라 늘어놓지 않음
        if (!this.view && n > 1) hit(rx, y + 140, rw, 72, () => { this.ws = ((this.ws || 0) + 1) % n; sfx('paper'); });
      } else { const ll = wrap(D.learn || '', rw - 14, 9), lh = 11, ty = this.wt.length ? 142 : 140; clip(ll, this.wt.length ? 6 : 6, rw - 14, 9).forEach((l, i) => text(l, rx + 7, y + ty + i * lh, { f: 9, c: C.ink })); }
      if (this.t > 40) button(rx, y + 214, rw, 32, di + 1 < DATA.days.length ? '다음 날 출근 ▶' : '엔딩 보기 ▶', () => this.next(), { padT: 2, focus: kbd && this.sel < 0 });
      if (this.view) drawView(this.view, () => { this.view = null; });
    },
  };
}

// 엔딩 — 등급은 34곳 전체 기준(미처리 0점 포함), 문장은 실제 기록으로 채운다
function Ending() {
  return {
    init() {
      this.t = 0; this.credits = null; this.list = null; this.view = null; this.page = 0;
      clearSave(); // 저장은 지우지만 이번 판 기록(G)은 복습용으로 남긴다
      const logs = G.perDay.flatMap(r => (r && r.log) || []), done = logs.length, skipped = TOTAL_APPS - done;
      const ratio = Math.max(0, G.score) / (100 * TOTAL_APPS); this.ratio = ratio;
      const ends = (DATA.endings || []).slice().sort((a, b) => b.min - a.min);
      // 등급 = 점수 비율 + 부정 업체 적발 비율. 통과만 눌러도 점수가 60%를 넘으므로, 부정 업체를 절반 이상 놓치면 수습 연장.
      const caught = logs.filter(isCatch).length, catchRate = caught / TOTAL_FLAWED, notCaught = TOTAL_FLAWED - caught;
      const lowCatch = notCaught * 2 >= TOTAL_FLAWED; this.caught = caught;
      this.e = ends.find(e => ratio >= e.min && catchRate >= (e.catchMin || 0) && !(lowCatch && e.min > 0)) || ends[ends.length - 1] || { title: '끝', text: [] };
      const key = this.e.key || ['best', 'good', 'retry'][Math.min(2, ends.indexOf(this.e))];
      this.img = key === 'best' ? 'ending_good' : key === 'good' ? 'ending_mid' : 'ending_bad';
      music(key === 'retry' ? 'endingBad' : 'endingGood');
      const vil = logs.find(l => l.id === 'd5a7'), vilCaught = vil && (vil.kind === 'caught' || vil.kind === 'wrongreason');
      const grannyHurt = logs.some(l => (l.id === 'd1a3' || l.id === 'd5a1') && l.kind === 'unfair');
      const miss = [];
      if (G.missed) miss.push('놓친 부정 업체 ' + G.missed + '곳');
      if (skipped) miss.push('시간이 모자라 못 본 업체 ' + skipped + '곳');
      const tok = {
        unfairLine: G.unfair === 0 ? '착한 가게는 한 곳도 울리지 않았다.' : '다만 멀쩡한 가게 ' + G.unfair + '곳을 억울하게 돌려보냈다. 새봄은 그 가게들을 찾아가 사과했다.',
        villainLine: vilCaught ? '이름을 바꿔 가며 찾아온 번쩍 사장도 끝내 서류에서 덜미를 잡혔다.' : '정직한상사의 정체(번쩍 사장)는 계약 직전 조사팀이 밝혀냈다. 창구에서 막았어야 했다.',
        grannyLine: grannyHurt ? '두부할매네 오순두 할머니께도 찾아가 고개 숙여 사과했다.' : '두부할매네 오순두 할머니는 오늘도 새벽 4시에 두부를 만든다.',
        missedLine: miss.length ? miss.join(', ') + '은 조사팀이 다시 살피기로 했다.' : '',
        // 만점·놓친 곳 0이면 '모두', 아니면 '거의 다'(성적 구간 문구를 실제 기록에 맞춤)
        catchLine: G.missed === 0 && skipped === 0 ? '새봄 심사관은 이번 주 가짜 회사를 한 곳도 놓치지 않고 모두 막아 냈다.' : '새봄 심사관은 이번 주 가짜 회사를 거의 다 막아 냈다.',
        doneLine: TOTAL_APPS + '곳 중 ' + done + '곳을 처리했고, ' + G.ok + '곳을 바르게 판정했다.',
        // 수습 연장: 점수는 넘었는데 부정 업체를 많이 놓친 판은 그 이유를 그대로 말한다
        retryLead: lowCatch ? (ratio >= 0.6 ? '점수는 ' + Math.round(ratio * 100) + '%였지만, 가짜 회사는 ' + TOTAL_FLAWED + '곳 중 ' + caught + '곳만 막아 냈다.' : '가짜 회사는 ' + TOTAL_FLAWED + '곳 중 ' + caught + '곳만 막아 냈다.') : '이번 주엔 헷갈린 서류가 많았다.',
        retryBoss: lowCatch && G.unfair < 10 ? '통과 도장만 찍으면 가짜 회사가 세금을 가져가요. 규정집 펴 놓고 월요일부터 다시 해 봐요.'
          : G.unfair >= 10 ? '의심만 하면 착한 가게가 울어요. 규정집 펴 놓고 월요일부터 다시 해 봐요.'
          : '괜찮아요, 처음엔 다 그래요. 규정집 펴 놓고 월요일부터 다시 해 봐요.',
      };
      // (w13) 수습 연장에서 놓친 문장 뒤에 오면 '다만'이 어색 → '게다가'
      if (key === 'retry' && miss.length && G.unfair) tok.unfairLine = tok.unfairLine.replace(/^다만 /, '게다가 ');
      if (lowCatch && G.unfair === 0) tok.unfairLine = '착한 가게를 울리진 않았지만, 통과 도장만으로는 가짜 회사를 못 막는다.';
      this.stats = { done, skipped, logs };
      const lines = this.e.text.map(t => t.replace(/\{(\w+)\}/g, (m, k) => tok[k] != null ? tok[k] : '').replace(/\s+/g, ' ').trim()).filter(Boolean);
      this.d = Dialog(lines.map(t => /^공팀장\s*:/.test(t) ? { who: 'boss', face: key === 'retry' ? 'normal' : 'happy', text: t.replace(/^공팀장\s*:\s*/, '').replace(/^"|"$/g, '') } : { who: 'narr', text: t }), () => { this.credits = 0; });
      this.wrongs = [];
      G.perDay.forEach((r, d) => { if (!r) return; for (const l of r.log || []) if (!l.good) this.wrongs.push(Object.assign({ di: d }, l)); (r.skippedIds || []).forEach((id, i) => this.wrongs.push({ di: d, id, company: r.skippedNames[i], kind: 'skipped', good: false, verdict: null })); });
      // 마지막 완주 기록을 따로 저장 → 타이틀 '지난 근무 복습'(새로고침·다음 방문에도)
      try { localStorage.setItem(LAST_KEY, JSON.stringify({ at: Date.now(), title: this.e.title, score: G.score, ratio, done, skipped, ok: G.ok, unfair: G.unfair, missed: G.missed, saved: G.saved, wrongs: this.wrongs })); } catch (e) {}
      this.ls = { page: 0, sel: 0, view: null }; this.bsel = 0;
      anyTap = () => { if (this.list || this.view) return; if (this.credits == null) dlgTap(this.d); else if (this.credits < 230) this.credits = 230; };
      keyHandler = k => {
        if (this.view) { viewKey(this.view, k, () => { this.view = null; }); return; }
        if (this.list) { wrongListKey(this.ls, this.wrongs, k, () => { this.list = null; }); return; }
        if (this.credits == null && (k === ' ' || k === 'Enter')) dlgTap(this.d);
        else if (this.credits != null && this.credits < 230 && (k === ' ' || k === 'Enter')) this.credits = 230;
        else if (this.credits >= 230) {
          const n = (this.btns || []).length;
          if (k === 'ArrowRight' || k === 'ArrowDown') { this.bsel = (this.bsel + 1) % n; sfx('menuMove'); }
          if (k === 'ArrowLeft' || k === 'ArrowUp') { this.bsel = (this.bsel + n - 1) % n; sfx('menuMove'); }
          if ((k === 'Enter' || k === ' ') && this.btns[this.bsel]) { sfx('click'); this.btns[this.bsel](); }
        }
      };
    },
    update() { this.t++; if (this.credits == null) dlgUpdate(this.d); else this.credits++; },
    draw() {
      spr(this.img, 0, 0);
      box(W / 2 - 120, 8, 240, 26, C.navy, C.ink, C.blue);
      text(this.e.title, W / 2, 13, { a: 'center', f: 'b', c: C.yellow });
      if (this.credits == null) { dlgDraw(this.d); return; }
      // 엔딩 그림을 먼저 1초 남짓 보여 준 뒤, 그림의 얼굴·트로피를 피한 자리에 성적·크레딧 판을 띄운다.
      // 글은 스크롤하지 않고 한 줄씩 나타난다(판 경계에서 반쯤 잘린 글자가 없게). 버튼(230)이 뜨기 전에 다 보임.
      const c = this.credits, st = this.stats, ff = f => f === 9 && TOUCH ? 0 : f, LH = { b: 16, 0: 13, 9: 11 };
      // ' · '로 나뉜 항목('놓친 부정 2') 안에서는 줄을 끊지 않는다 — 줄은 ' · ' 뒤에서만 바뀐다
      const nb = t => t.split(' · ').map(x => x.replace(/ /g, '\u00a0')).join(' · ');
      const score = [
        ['점수 ' + G.score + ' / ' + TOTAL_APPS * 100 + ' (' + Math.round(this.ratio * 100) + '%)', 'b', C.yellow],
        [nb('처리 ' + st.done + '/' + TOTAL_APPS + '곳 · 바른 판정 ' + G.ok + '곳'), 0, C.white],
        [nb('억울한 반려 ' + G.unfair + ' · 놓친 부정 ' + G.missed + (st.skipped ? ' · 미처리 ' + st.skipped : '')), 0, C.white],
        ['막아 낸 계약 ' + won(G.saved), 0, C.white],
      ];
      const cred = [
        ['그림  Codex (8비트\u00a0팔레트)', 9, C.sky],
        ['코드·대사  Claude', 9, C.white],
        ['배경음  악보 작곡·칩튠 직접 합성', 9, C.white],
        ['효과음  ZzFX (MIT)', 9, C.white],
        ['글꼴  Galmuri (SIL\u00a0OFL\u00a01.1)', 9, C.white],
      ];
      const motto = ['공정하게, 하지만 억울하지 않게.', 'b', C.yellow];
      const lay = (ents, w) => ents.flatMap(([s2, f, col]) => wrap(s2, w, ff(f)).map(l => [l, ff(f), col]));
      const hOf = ls => ls.reduce((s2, l) => s2 + LH[l[1]], 0);
      let panels;
      if (this.img === 'ending_bad') { // 서류 더미 속 주인공(왼쪽 아래)·도망치는 사장(오른쪽) → 위쪽 빈 벽 두 곳
        const A = lay(score.concat([motto]), 194), B = lay(cred, 174);
        panels = [{ x: 6, y: 38, w: 206, h: hOf(A) + 10, cols: [[A, 12]] }, { x: 216, y: 38, w: 186, h: hOf(B) + 10, cols: [[B, 222]] }];
      } else { // 얼굴·메달·트로피(위쪽 절반)를 피해 아래 띠에: 성적 | 크레딧 두 칸 + 맨 아래 한 줄 다짐
        const A = lay(score, 222), B = lay(cred, 206), top = Math.max(hOf(A), hOf(B)), bh = top + LH.b + 12;
        const y0 = 230 - bh;
        panels = [{ x: 8, y: y0, w: 464, h: bh, cols: [[A, 16], [B, 258], [[motto], 16, top + 4]] }];
      }
      const pa = Math.max(0, Math.min(1, (c - 45) / 10));
      if (pa > 0) {
        let k = 0;
        for (const P0 of panels) {
          ctx.globalAlpha = 0.84 * pa; rect(P0.x, P0.y, P0.w, P0.h, C.ink); ctx.globalAlpha = pa; frameRect(P0.x, P0.y, P0.w, P0.h, C.navy, 2);
          for (const [ls, cx, dy] of P0.cols) {
            let yy = P0.y + 6 + (dy || 0);
            for (const [l, f, col] of ls) {
              const la = Math.max(0, Math.min(1, (c - 55 - k * 8) / 8)); k++;
              if (la > 0) { ctx.globalAlpha = la; text(l, cx, yy + (f === 'b' ? 0 : 1), { f, c: col }); }
              yy += LH[f];
            }
          }
          ctx.globalAlpha = 1;
        }
      }
      if (this.credits >= 230 && !this.list && !this.view) {
        const bs = [];
        if (this.wrongs.length) bs.push(['틀린 서류 다시 보기', 140, () => { this.list = true; this.ls.page = 0; this.ls.sel = 0; }]);
        bs.push(['다시 근무하기', 110, () => { newGame(); clearSave(); go(() => startDay(0)); }]);
        bs.push(['처음으로', 86, () => go(() => setScene(Title))]);
        this.btns = bs.map(b => b[2]); if (this.bsel >= bs.length) this.bsel = 0;
        const tot = bs.reduce((s, b) => s + b[1], 0) + (bs.length - 1) * 8; let bx = W / 2 - tot / 2;
        bs.forEach(([lb, bw, fn], i) => { button(bx, H - 36, bw, 30, lb, fn, { f: 9, focus: kbd && this.bsel === i }); bx += bw + 8; });
      }
      if (this.list && !this.view) drawWrongList(this.ls, this.wrongs, '틀리거나 못 본 서류 ' + this.wrongs.length + '건 — 눌러서 다시 보기', () => { this.list = null; });
      if (this.view) drawView(this.view, () => { this.view = null; });
    },
  };
}

// ───────── 메인 루프 ─────────
let last = performance.now(), acc = 0;
function frame(now) {
  acc += Math.min(100, now - last); last = now;
  while (acc >= 1000 / FPS) { acc -= 1000 / FPS; T++; if (scene && scene.update && !SETTINGS) scene.update(); }
  hits = [];
  if (window.__frameSpy) window.__frameSpy(); // QA: 프레임마다 그리기 기록 초기화
  ctx.setTransform(K, 0, 0, K, 0, 0);
  ctx.imageSmoothingEnabled = false;
  let sx = 0, sy = 0;
  if (shake > 0) { shake--; if (!OPT.calm) { sx = (Math.random() * 2 - 1) * 2 | 0; sy = (Math.random() * 2 - 1) * 2 | 0; } }
  ctx.save(); ctx.translate(sx, sy);
  if (scene) scene.draw();
  drawFx();
  ctx.restore();
  drawGlobalUI();
  drawWipe();
  if (wipe) hits.push({ x: 0, y: 0, w: W, h: H, fn: () => {}, cur: false });
  requestAnimationFrame(frame);
}
// 디버그·녹화용: ?day=N 으로 바로 N일차
const qs = new URLSearchParams(location.search);
Promise.all([document.fonts ? document.fonts.ready : 0, ...Object.values(IMG).map(im => im.decode ? im.decode().catch(() => 0) : 0)]).then(() => {
  newGame();
  if (qs.get('day')) { G.day = +qs.get('day') - 1; startDay(G.day); } else setScene(Title);
  requestAnimationFrame(frame);
});
// 자동 검사용 봇: 정답대로(또는 mode='wrong'이면 일부러 틀리게) 한 단계씩 진행
function botStep(mode) {
  if (wipe || !scene) return 'wait';
  if (SETTINGS) { SETTINGS = false; return 'settings'; }
  const s = scene;
  if (s.dbg) {
    if (s.overlay) { s.overlay = null; return 'close'; }
    if (s.phase === 'react') { s.dbg.toReview(); return 'react'; }
    if (s.phase === 'review') { s.dbg.next(); return 'review'; }
    if (s.phase !== 'inspect') return 'work:' + s.phase;
    if (s.dbg.coachStep && s.dbg.coachStep()) { s.dbg.coachDo(); return 'coach'; }
    const a = s.a, flaw = a.flaw;
    if (s.tut && s.idx === 0) docsOf(a).forEach((k, i) => s.dbg.setTab(i)); // 첫 연습은 탭을 다 넘겨야 통과
    const wrong = (mode === 'wrong' || (mode === 'mixed' && s.idx % 3 === 1)) && !(s.tut && s.idx < 2); // 연습 두 업체는 정답만 통과됨
    if ((mode === 'allpass' || mode === 'allreject') && !(s.tut && s.idx < 2)) { // 점검용: 전부 통과 / 전부 반려(아무 칸 하나 표시)
      if (mode === 'allpass') { s.dbg.stamp('pass'); return 'pass'; }
      if (!s.marks.size) s.dbg.toggleMark(docsOf(a).includes('reg') ? 'reg.addr' : 'bid.company'); s.dbg.stamp('reject'); return 'reject';
    }
    if (flaw && !wrong) { if (!s.marks.size) s.dbg.toggleMark(flaw.fields[0]); s.dbg.stamp('reject'); return 'reject'; }
    if (!flaw && wrong) { s.dbg.toggleMark(docsOf(a).includes('reg') ? 'reg.addr' : 'bid.company'); s.dbg.stamp('reject'); return 'unfair'; }
    s.dbg.stamp('pass'); return 'pass';
  }
  if (s.view) { s.view = null; return 'closeview'; }
  if (s.list) { s.list = null; return 'closelist'; }
  if (s.next && s.t > 45) { s.next(); return 'next'; }
  if (s.d && s.credits == null) { dlgTap(s.d); return 'dlg'; }
  if (anyTap) { anyTap({ x: 240, y: 135 }); return 'tap'; }
  return 'idle';
}
window.__game = {
  get scene() { return scene; }, get G() { return G; }, get opts() { return OPT; }, get rot() { return ROT; }, botStep,
  newGame: () => { newGame(); clearSave(); go(() => startDay(0)); },
  settings: on => { SETTINGS = on == null ? !SETTINGS : !!on; }, get settingsOpen() { return !!SETTINGS; },
  view: e => makeView(e), wrap, tw, ending: () => setScene(Ending()),
  evidence: (a, di, m) => evidence(a, di, m), tasteApps: () => tasteApps(), fieldTab, fieldShort, // (w14) QA: 근거 문자열 덤프
  tutorial: () => startTutorial(() => setScene(Title)), tutDone: () => tutDone(), coach: COACH, // (w15) QA: 연수
};
})();
