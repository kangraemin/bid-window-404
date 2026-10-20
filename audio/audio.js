// 소리 모듈 — 외부 음원 없음. 효과음은 ZzFX(MIT) 코드 생성, 배경음은 직접 작곡·칩튠 합성한 음원(audio/bgm.js) 또는 WebAudio 합성
// 악보: 8분음표 한 칸, '.'=쉼표, '-'=앞 음 이어서. 드럼: k=킥 s=스네어 h=하이햇
(() => {
'use strict';
const A = { c: null, muted: false, vol: 0.7, bgLv: 2, fxLv: 2, voice: true, pulse: {}, song: null, songName: null, step: 0, next: 0, after: null, want: null };
try { const s = JSON.parse(localStorage.getItem('ppg404_sound') || '{}'); if (s.vol != null) A.vol = s.vol; if (s.muted) A.muted = true; if (s.bgLv != null) A.bgLv = s.bgLv; if (s.fxLv != null) A.fxLv = s.fxLv; if (s.voice === false) A.voice = false; } catch (e) {}
function save() { try { localStorage.setItem('ppg404_sound', JSON.stringify({ vol: A.vol, muted: A.muted, bgLv: A.bgLv, fxLv: A.fxLv, voice: A.voice })); } catch (e) {} }
// 단계별 음량(0=끔·1=작게·2=보통·3=크게). 배경음은 효과음보다 한 발 뒤에 깔리게 낮춘다
const BG_GAIN = [0, 0.2, 0.36, 0.55], FX_GAIN = [0, 0.45, 0.8, 1.05];
function applyVol() { if (A.m) A.m.gain.value = A.muted ? 0 : 0.55 * A.vol; if (A.bg) A.bg.gain.value = BG_GAIN[A.bgLv]; if (A.fx) A.fx.gain.value = FX_GAIN[A.fxLv]; }

function init() {
  if (A.c) { if (A.c.state === 'suspended') A.c.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  const c = A.c = new AC();
  A.m = c.createGain(); A.m.connect(c.destination); applyVol();
  A.bg = c.createGain(); A.bg.connect(A.m);
  A.fx = c.createGain(); A.fx.connect(A.m); applyVol();
  for (const d of [0.125, 0.25, 0.5]) {
    const n = 32, re = new Float32Array(n), im = new Float32Array(n);
    for (let i = 1; i < n; i++) re[i] = 2 / (i * Math.PI) * Math.sin(i * Math.PI * d);
    A.pulse[d] = c.createPeriodicWave(re, im);
  }
  const b = c.createBuffer(1, c.sampleRate, c.sampleRate), ch = b.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  A.noise = b;
  ZZFX.audioContext = c; ZZFX.output = A.fx; ZZFX.volume = 0.5;
  decodeBgm();
  setInterval(schedule, 40);
  if (A.want !== null) { const w = A.want; A.want = null; music(w); }
}
function osc(dest, type, f, t, d, v, f2, duty) {
  const c = A.c, o = c.createOscillator(), g = c.createGain();
  if (type === 'pulse') o.setPeriodicWave(A.pulse[duty || 0.25]); else o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v, t); g.gain.setValueAtTime(v, t + d * 0.7); g.gain.linearRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + d + 0.02);
}
function nz(dest, t, d, v, ft, ff) {
  const c = A.c, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = A.noise; f.type = ft || 'lowpass'; f.frequency.value = ff || 1000;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.02);
}

// ───── 효과음: ZzFX 파라미터로 코드 생성(외부 파일 없음) ─────
// sq(): 사각파(shape 0 + shapeCurve 0) 소리. 인자: 음량, 주파수, 지속, 감쇠, 미끄럼, 음높이 점프, 점프 시각, 반복 간격
const sq = (v, f, sus, rel, slide = 0, jump = 0, jt = 0, rep = 0) => [v, 0, f, 0, sus, rel, 0, 0, slide, 0, jump, jt, rep];
const nzP = (v, f, sus, rel, filter) => [v, .05, f, 0, sus, rel, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, filter];
const z = (p, delay = 0) => { if (delay) setTimeout(() => { if (!A.muted) ZZFX.play(...p); }, delay); else ZZFX.play(...p); };
// 대사 타자기: 인물마다 음높이가 다르다
const VOICE = { boss: 520, hero: 700, granny: 880, grandpa: 300, slick: 240, slick2: 250, slick3: 260, twinA: 620, twinB: 660, builder: 340,
  startup: 820, clerk: 760, chef: 420, auntie: 600, youngman: 560, farmer: 380 };
const FX = {
  type: who => { if (A.voice) z(sq(.13, (VOICE[who] || 640) * (0.93 + Math.random() * .14), .01, .02)); },
  pageFlip: () => z(nzP(.5, 900, .02, .07, -2600)),
  paperDrop: () => { z(nzP(.45, 260 + Math.random() * 80, .01, .08, 1400)); z([.28, 0, 160, 0, .01, .05, 1, 1, -4]); },
  stampPass: () => { z(nzP(1.3, 90, .05, .26, 650)); z(sq(.5, 120, .03, .1, -6)); z(sq(.22, 1568, .04, .2, 0, 523, .05), 90); },
  stampReject: () => { z(nzP(1.3, 90, .06, .3, 600)); z(sq(.5, 120, .03, .12, -6)); z(sq(.3, 110, .12, .2, -2), 90); },
  correct: () => [523, 659, 784, 1047].forEach((f, i) => z(sq(.3, f, .05, .06), i * 70)),
  wrong: () => { z([.45, 0, 196, 0, .14, .05, 0, 0, -1, 0, 0, 0, 0, 0, 0, .3]); z([.45, 0, 147, 0, .22, .08, 0, 0, -1, 0, 0, 0, 0, 0, 0, .3], 160); },
  step: () => z(nzP(.28, 80 + Math.random() * 30, .01, .04, 320)),
  magnify: () => { z(sq(.25, 880, .03, .05, 20)); z(sq(.2, 1320, .03, .08), 60); },
  mark: () => z(sq(.3, 480, .04, .06, 18)),
  unmark: () => z(sq(.25, 900, .03, .05, -18)),
  score: () => z(sq(.25, 988, .04, .14, 0, 331, .05)),
  tick: () => z([.12, 0, 2000, 0, .004, .01, 0, 0]),
  hurry: () => z(sq(.25, 880, .06, .03, 0, -220, .05, .1)),
  menuMove: () => z(sq(.07, 1200, .01, .015)),
  menuSelect: () => z(sq(.25, 784, .03, .06, 0, 392, .03)),
  transition: () => { z(nzP(.35, 400, .1, .14, -1200)); z(sq(.12, 300, .15, .05, 25)); },
  bell: () => { z([.35, 0, 1319, 0, .05, .6, 1]); z([.25, 0, 1760, 0, .05, .6, 1], 120); },
  denied: () => z(sq(.25, 220, .06, .05, -3)),
  siren: () => z(sq(.2, 520, .3, .05, 10, 0, 0, .34)),
  pop: () => z(sq(.25, 300, .03, .06, 25)),
  newRule: () => [523, 659, 784, 1047].forEach((f, i) => z([.3, 0, f, 0, .08, .12, 0, .5], i * 100)),
  aiBeep: () => { z(sq(.18, 1480, .04, .01)); z(sq(.18, 1480, .04, .01), 110); },
};
function sfx(n, arg) { if (!A.c || A.muted || !FX[n]) return; try { FX[n](arg); } catch (e) {} }

// ───── 배경음 ─────
// 합성용 악보(bgm.js 음원이 없을 때만 쓰임)
const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const hz = n => { const m = n.match(/^([A-G]#?)(\d)$/); return 440 * Math.pow(2, (12 * (+m[2] + 1) + NOTE[m[1]] - 69) / 12); };
// 평일 창구 기본 선율(1~4일 공통, 날이 갈수록 템포·화음·드럼이 조여짐)
const WORK_LEAD = 'C5 . F5 . A5 . F5 . G5 . A5 . G5 . F5 . E5 . G5 . C6 . A5 . G5 - - . . . . . D5 . F5 . A5 . D6 . C6 . A5 . F5 . A5 . G5 . E5 . C5 . E5 . F5 - - . . . C5 .';
const WORK_BASS = 'F2 . C3 . F2 . C3 . C3 . G2 . C3 . G2 . C3 . G3 . A2 . E3 . C3 . G2 . C3 . E3 . D3 . A2 . D3 . A2 . F2 . C3 . F2 . C3 . C3 . G2 . C3 . E3 . F2 . C3 . F2 . . .';
const SONGS = {
  title: { bpm: 140, lead: 'E5 . G5 . C6 - B5 . A5 . G5 . E5 - . . F5 . A5 . D6 - C6 . B5 . G5 . D5 - . . E5 . G5 . C6 - B5 . A5 . C6 . E6 - D6 . C6 . B5 . A5 . G5 . C6 - - . G5 . C5 .',
    bass: 'C3 . G3 . C3 . G3 . A2 . E3 . A2 . E3 . F2 . C3 . F2 . C3 . G2 . D3 . G2 . B2 . C3 . G3 . C3 . G3 . A2 . E3 . A2 . E3 . F2 . C3 . G2 . D3 . C3 . G2 . C3 . . .', drum: 'k.h.s.hh' },
  work1: { bpm: 112, duty: 0.125, lead: WORK_LEAD, bass: WORK_BASS, drum: 'k...s...' },
  work2: { bpm: 118, duty: 0.125, lead: WORK_LEAD, bass: WORK_BASS, drum: 'k.h.s.h.',
    harm: 'A4 . . . C5 . . . E4 . . . D4 . . . G4 . . . E4 . . . E4 . . . . . . . F4 . . . F4 . . . A4 . . . F4 . . . E4 . . . G4 . . . A4 . . . . . . .' },
  work3: { bpm: 124, duty: 0.25, lead: 'A4 . C5 . E5 . A5 . G5 . E5 . C5 . E5 . F5 . A5 . C6 . A5 . G#5 - - . E5 . . . A4 . C5 . E5 . A5 . B5 . A5 . G5 . E5 . F5 . E5 . D5 . B4 . A4 - - . . . E5 .',
    bass: 'A2 . E3 . A2 . E3 . C3 . G3 . C3 . G3 . F2 . C3 . F2 . C3 . E2 . B2 . E2 . G#2 . A2 . E3 . A2 . E3 . G2 . D3 . G2 . D3 . D3 . A2 . E2 . B2 . A2 . E3 . A2 . . .', drum: 'k.hks.hh',
    harm: 'E4 . . . E4 . . . C4 . . . C4 . . . A4 . . . A4 . . . E4 . . . B4 . . . E4 . . . E4 . . . D4 . . . C4 . . . A4 . . . F4 . . . C4 . . . . . . .' },
  work4: { bpm: 132, duty: 0.25, lead: 'A4 . C5 . E5 . A5 . G5 . E5 . C5 . E5 . F5 . A5 . C6 . A5 . G#5 - - . E5 . . . A4 . C5 . E5 . A5 . B5 . A5 . G5 . E5 . F5 . E5 . D5 . B4 . A4 - - . . . E5 .',
    bass: 'A2 A2 E3 A2 A2 A2 E3 A2 C3 C3 G3 C3 C3 C3 G3 C3 F2 F2 C3 F2 F2 F2 C3 F2 E2 E2 B2 E2 E2 E2 G#2 E2 A2 A2 E3 A2 A2 A2 E3 A2 G2 G2 D3 G2 G2 G2 D3 G2 D3 D3 A2 D3 E2 E2 B2 E2 A2 . E3 . A2 . . .', drum: 'kshkkshh',
    harm: 'E4 . C5 . E4 . C5 . E4 . C5 . E4 . C5 . C5 . F5 . C5 . F5 . B4 . E5 . B4 . E5 . E4 . C5 . E4 . C5 . D5 . G5 . D5 . G5 . A4 . D5 . G#4 . B4 . C5 . E5 . C5 . . .' },
  ai: { bpm: 132, duty: 0.125, lead: 'A5 E5 C5 E5 A5 E5 C5 E5 G5 D5 B4 D5 G5 D5 B4 D5 F5 C5 A4 C5 F5 C5 A4 C5 E5 B4 G#4 B4 E5 B4 G#4 B4 A5 E5 C5 E5 A5 E5 C6 E5 B5 G5 D5 G5 B5 G5 D6 G5 C6 A5 F5 A5 D6 A5 F5 A5 B5 G#5 E5 G#5 E6 - - .',
    bass: 'A2 . . A2 . . A2 . G2 . . G2 . . G2 . F2 . . F2 . . F2 . E2 . . E2 . . E2 . A2 . . A2 . . A2 . G2 . . G2 . . G2 . F2 . . F2 . . F2 . E2 . . E2 . E3 . .', drum: 'k.hsk.hs' },
  caught: { bpm: 180, once: true, lead: 'G5 G5 . G5 C6 - - . E6 - - - - - - - . . . .', bass: 'C3 C3 . C3 G3 - - . C4 - - - - - - - . . . .', drum: 'k.k.s...k...s.......' },
  result: { bpm: 96, duty: 0.5, lead: 'E5 . G5 . A5 . G5 . E5 . D5 . C5 - - - D5 . E5 . G5 . E5 . D5 - - - - - . . E5 . G5 . A5 . C6 . B5 . G5 . A5 - - - G5 . E5 . D5 . E5 . C5 - - - - - . .',
    bass: 'C3 . . . G2 . . . A2 . . . E2 . . . F2 . . . C3 . . . G2 . . . G2 . . . C3 . . . G2 . . . A2 . . . E2 . . . F2 . . . G2 . . . C3 . . . . . . .', drum: 'h...h...' },
  endingGood: { bpm: 100, lead: 'C5 . . G4 C5 . E5 . G5 - - . E5 . G5 . A5 . . F5 A5 . C6 . G5 - - - - . . . F5 . . D5 F5 . A5 . G5 . . E5 G5 . C6 . B5 . A5 . G5 . D5 . C6 - - - - . . .',
    bass: 'C3 . G2 . C3 . G2 . E3 . C3 . E3 . C3 . F2 . C3 . F2 . C3 . C3 . G2 . C3 . G2 . D3 . A2 . D3 . A2 . C3 . G2 . C3 . G2 . G2 . D3 . G2 . B2 . C3 . G2 . C3 . . .', drum: 'k...s...' },
  endingBad: { bpm: 84, duty: 0.5, lead: 'E5 . D5 . C5 . B4 . A4 - - . . . . . F5 . E5 . D5 . C5 . B4 - - . . . . . C5 . B4 . A4 . G#4 . A4 . B4 . C5 . E5 . D5 - - - C5 . B4 . A4 - - - - - . .',
    bass: 'A2 . . . E2 . . . F2 . . . E2 . . . D2 . . . A2 . . . E2 . . . E2 . . . A2 . . . E2 . . . F2 . . . E2 . . . D2 . . . E2 . . . A2 . . . . . . .', drum: 'k.......' },
};
for (const s of Object.values(SONGS)) { s.L = s.lead.split(' '); s.B = s.bass.split(' '); s.D = s.drum.split(''); s.Hm = s.harm ? s.harm.split(' ') : null; }
// 배경음: 악보 작곡·칩튠 합성 음원(audio/bgm.js의 data URI)이 있으면 그걸 반복 재생, 없으면 아래 악보를 합성
const BUF = {};
function decodeBgm() {
  for (const [k, uri] of Object.entries(window.BGM_DATA || {})) {
    const bin = atob(uri.split(',')[1]), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    A.c.decodeAudioData(u8.buffer).then(b => { BUF[k] = b; if (A.songName === k && !A.src) { const n = k; A.songName = null; music(n, A.after); } }).catch(() => {});
  }
}
function stopSrc() { if (A.src) { const s = A.src, g = s.g; g.gain.setTargetAtTime(0, A.c.currentTime, 0.08); s.stop(A.c.currentTime + 0.4); A.src = null; } }
function music(name, after) {
  if (!A.c) { A.want = name; return; }
  if (name && A.songName === name) return;
  stopSrc();
  A.songName = name; A.after = after || null; A.song = null;
  if (name && BUF[name]) {
    const s = A.c.createBufferSource(), g = A.c.createGain();
    s.buffer = BUF[name]; s.loop = !(SONGS[name] && SONGS[name].once); g.gain.value = 1;
    s.connect(g); g.connect(A.bg); s.g = g; s.start(); A.src = s;
    if (!s.loop) s.onended = () => { if (A.src === s) { A.src = null; A.songName = null; if (A.after) music(A.after); } };
    return;
  }
  A.song = SONGS[name] || null; A.step = 0; A.next = A.c.currentTime + 0.08;
}
function playTrack(arr, i, t, sd, fn) {
  const tok = arr[i % arr.length]; if (!tok || tok === '.' || tok === '-') return;
  let n = 1; while (arr[(i + n) % arr.length] === '-' && n < 8) n++;
  fn(hz(tok), t, n * sd * 0.92);
}
function schedule() {
  const s = A.song; if (!s || !A.c) return;
  const sd = 60 / s.bpm / 2;
  while (A.next < A.c.currentTime + 0.18) {
    const t = A.next, i = A.step;
    if (s.once && i >= s.L.length) { const a = A.after; A.song = null; A.songName = null; if (a) music(a); return; }
    playTrack(s.L, i, t, sd, (f, t, d) => osc(A.bg, 'pulse', f, t, d, 0.07, 0, s.duty || 0.25));
    if (s.Hm) playTrack(s.Hm, i, t, sd, (f, t, d) => osc(A.bg, 'pulse', f, t, d, 0.035, 0, 0.5));
    playTrack(s.B, i, t, sd, (f, t, d) => osc(A.bg, 'triangle', f, t, d, 0.2));
    const dr = s.D[i % s.D.length];
    if (dr === 'k') osc(A.bg, 'square', 140, t, 0.08, 0.1, 40);
    if (dr === 's') nz(A.bg, t, 0.1, 0.14, 'highpass', 1500);
    if (dr === 'h') nz(A.bg, t, 0.03, 0.07, 'highpass', 7000);
    A.step++; A.next += sd;
  }
}
window.SND = {
  init, sfx, music, VOICE,
  get muted() { return A.muted; }, get vol() { return A.vol; }, get ready() { return !!A.c; },
  setMuted(m) { A.muted = m; applyVol(); save(); },
  toggleMute() { A.muted = !A.muted; applyVol(); save(); return A.muted; },
  get bgmLevel() { return A.bgLv; }, get fxLevel() { return A.fxLv; }, get voice() { return A.voice; },
  setLevel(kind, n) { n = Math.max(0, Math.min(3, n | 0)); if (kind === 'bgm') A.bgLv = n; else A.fxLv = n; applyVol(); save(); },
  setVoice(on) { A.voice = !!on; save(); },
  cycleVol() { const steps = [0.35, 0.7, 1]; const i = steps.findIndex(v => Math.abs(v - A.vol) < 0.01); A.vol = steps[(i + 1) % steps.length]; A.muted = false; applyVol(); save(); return A.vol; },
  songs: Object.keys(SONGS), effects: Object.keys(FX),
};
})();
