# 입찰 창구 404호 플랫폼 확인(headless·음소거): 타이틀→첫 클릭→튜토리얼→1일차 자동 진행.
# 소리: AudioContext의 마스터·배경음·효과음 게인(생성 순서 1·2·3번째)에 AnalyserNode 탭을 달아 RMS 기록, 실제 출력은 0 게인으로 막음.
# 깨짐: 글꼴 FontFace 상태, 캔버스 크기, 콘솔 에러·경고, 실패 요청(404·file 못 읽음), 진행 중 캡처.
import sys, time, json, pathlib, argparse
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser()
ap.add_argument('--url', required=True); ap.add_argument('--engine', default='chromium')
ap.add_argument('--channel', default=None); ap.add_argument('--w', type=int, default=1920); ap.add_argument('--h', type=int, default=1080)
ap.add_argument('--secs', type=int, default=90); ap.add_argument('--shot', type=int, default=15)
ap.add_argument('--out', required=True); ap.add_argument('--tag', required=True)
a = ap.parse_args()
out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
INIT = r"""(()=>{const O=window.AudioContext||window.webkitAudioContext;if(!O)return;
window.__au={ctx:[],gains:[],an:[],log:[],zz:0};
const W=function(...x){const c=new O(...x);window.__au.ctx.push(c);
 const mute=c.createGain();mute.gain.value=0;mute.connect(c.destination);
 Object.defineProperty(c,'destination',{get:()=>mute});
 const cg=c.createGain.bind(c);c.createGain=function(){const g=cg();const au=window.__au;
  if(au.gains.length<3){au.gains.push(g);const an=c.createAnalyser();an.fftSize=2048;g.connect(an);au.an.push(an)}return g};
 return c};
W.prototype=O.prototype;window.AudioContext=W;window.webkitAudioContext=W;
const buf=new Float32Array(2048);
window.__au.peak=[0,0,0];
setInterval(()=>{const au=window.__au;au.an.forEach((an,i)=>{an.getFloatTimeDomainData(buf);let s=0;for(const v of buf)s+=v*v;const r=Math.sqrt(s/buf.length);if(r>au.peak[i])au.peak[i]=r})},50);
const hook=()=>{if(window.ZZFX&&!window.ZZFX.__h){const p=window.ZZFX.play.bind(window.ZZFX);window.ZZFX.play=(...x)=>{window.__au.zz++;return p(...x)};window.ZZFX.__h=1}};
setInterval(hook,200);})()"""
errs, warns, failed, res, phases = [], [], [], {'tag': a.tag, 'url': a.url}, []
def audio(pg, label):
    r = pg.evaluate("(()=>{const au=window.__au;if(!au)return null;const p=au.peak.slice();au.peak=[0,0,0];return {state:au.ctx.map(c=>c.state),rms:{master:+p[0].toFixed(4),bgm:+p[1].toFixed(4),sfx:+p[2].toFixed(4)},sfxPlays:au.zz}})()")
    phases.append({'at': label, **(r or {})}); return r
with sync_playwright() as p:
    bt = getattr(p, a.engine); kw = {'headless': True}
    if a.channel: kw['channel'] = a.channel
    if a.engine == 'chromium': kw['args'] = ['--mute-audio']
    if a.engine == 'firefox': kw['firefox_user_prefs'] = {'media.volume_scale': '0.0'}
    b = bt.launch(**kw)
    pg = b.new_page(viewport={'width': a.w, 'height': a.h})
    pg.add_init_script(INIT)
    pg.on('console', lambda m: (errs if m.type == 'error' else warns).append(m.text[:300]) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:300]))
    pg.on('requestfailed', lambda r: failed.append(r.url[-120:] + ' ' + str(r.failure)))
    pg.on('response', lambda r: failed.append(f'{r.status} {r.url[-120:]}') if r.status >= 400 else None)
    pg.goto(a.url); time.sleep(3)
    res['browser'] = f'{a.engine}/{a.channel or "-"} {b.version}'
    res['fonts'] = pg.evaluate("(async()=>{await document.fonts.ready;return [...document.fonts].map(f=>f.family.replace(/\"/g,'')+':'+f.status)})()")
    res['fontsOk'] = all(x.endswith(':loaded') for x in res['fonts'] if x.split(':')[0] in ('G11', 'G11B', 'G9')) and {'G11', 'G11B', 'G9'} <= {x.split(':')[0] for x in res['fonts'] if x.endswith(':loaded')}
    c = res['canvas'] = pg.evaluate("(()=>{const r=document.getElementById('c').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,vw:innerWidth,vh:innerHeight}})()")
    res['fits'] = c['x'] >= -0.5 and c['y'] >= -0.5 and c['x'] + c['w'] <= c['vw'] + 0.5 and c['y'] + c['h'] <= c['vh'] + 0.5
    audio(pg, 'before-click'); res['warnBeforeClick'] = list(warns)
    pg.screenshot(path=str(out / f'{a.tag}_00_title.png'))
    pg.mouse.click(a.w // 2, int(a.h * 0.70)); time.sleep(3)
    audio(pg, 'after-first-click')
    pg.screenshot(path=str(out / f'{a.tag}_01_afterclick.png'))
    t0, n, last, steps, trail = time.time(), 1, time.time(), 0, []
    while time.time() - t0 < a.secs:
        st = pg.evaluate("window.__game.botStep('right')"); steps += 1
        k = pg.evaluate("(()=>{const s=window.__game.scene,G=window.__game.G;return (G?G.day:'-')+'/'+(s&&s.dbg?'work':(s&&s.d?'talk':(s&&s.next?'result':'other')))})()")
        if not trail or trail[-1] != k: trail.append(k)
        if time.time() - last > a.shot:
            last = time.time(); n += 1; pg.screenshot(path=str(out / f'{a.tag}_{n:02d}_t{int(time.time()-t0):03d}_{k.replace("/","-")}.png'))
            audio(pg, f't{int(time.time()-t0)}')
        if pg.evaluate("!!(window.__game.scene && window.__game.scene.credits!=null)"): res['ending'] = True; break
        time.sleep(0.12 if isinstance(st, str) and (st.startswith('work') or st == 'wait') else 0.35)
    audio(pg, 'end'); pg.screenshot(path=str(out / f'{a.tag}_99_last.png'))
    res['steps'], res['trail'] = steps, trail[:60]
    b.close()
play = [x for x in phases if x['at'] not in ('before-click',)]
res['audio'] = phases
res['bgmOk'] = any((x.get('rms') or {}).get('bgm', 0) > 0.001 for x in play)
res['sfxOk'] = any((x.get('rms') or {}).get('sfx', 0) > 0.001 for x in play) and (phases[-1].get('sfxPlays') or 0) > 0
res['ctxRunning'] = any('running' in (x.get('state') or []) for x in play)
res['errors'], res['warnings'], res['failedRequests'] = errs, warns[:20], failed
res['ok'] = (not errs) and (not failed) and res['fits'] and res['fontsOk'] and res['bgmOk'] and res['sfxOk'] and res['ctxRunning']
print(json.dumps({k: res[k] for k in ('tag', 'browser', 'ok', 'fontsOk', 'fits', 'bgmOk', 'sfxOk', 'ctxRunning', 'errors', 'failedRequests')}, ensure_ascii=False))
(out / f'{a.tag}.json').write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding='utf-8')
