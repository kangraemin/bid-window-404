# 입찰 창구 404호 플랫폼 확인: 브라우저·해상도·주소별로 타이틀→시작→자동 진행, 콘솔 오류·글꼴·캔버스 크기·캡처
import sys, time, json, pathlib, argparse
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser()
ap.add_argument('--url', required=True); ap.add_argument('--engine', default='chromium')
ap.add_argument('--channel', default=None); ap.add_argument('--w', type=int, default=1920); ap.add_argument('--h', type=int, default=1080)
ap.add_argument('--secs', type=int, default=90); ap.add_argument('--out', required=True); ap.add_argument('--tag', required=True)
a = ap.parse_args()
out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
errs, res = [], {'tag': a.tag, 'url': a.url}
with sync_playwright() as p:
    bt = getattr(p, a.engine)
    kw = {'channel': a.channel} if a.channel else {}
    if a.engine == 'chromium': kw['args'] = ['--autoplay-policy=no-user-gesture-required', '--mute-audio']
    if a.engine == 'firefox': kw['firefox_user_prefs'] = {'media.volume_scale': '0.0'}
    kw['headless'] = True
    b = bt.launch(**kw)
    pg = b.new_page(viewport={'width': a.w, 'height': a.h})
    pg.add_init_script("(()=>{const O=window.AudioContext||window.webkitAudioContext;if(!O)return;window.__acs=[];const W=function(...a){const c=new O(...a);window.__acs.push(c);const g=c.createGain();g.gain.value=0;g.connect(c.destination);Object.defineProperty(c,'destination',{get:()=>g});return c};W.prototype=O.prototype;window.AudioContext=W;window.webkitAudioContext=W})()")
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto(a.url); time.sleep(3)
    res['browser'] = b.version
    res['fonts'] = pg.evaluate("(async()=>{await document.fonts.ready;return ['G11','G11B','G9'].map(f=>document.fonts.check('12px '+f+'','가'))})()")
    res['canvas'] = pg.evaluate("(()=>{const r=document.getElementById('c').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,vw:innerWidth,vh:innerHeight}})()")
    c = res['canvas']; res['fits'] = c['x'] >= -0.5 and c['y'] >= -0.5 and c['x'] + c['w'] <= c['vw'] + 0.5 and c['y'] + c['h'] <= c['vh'] + 0.5
    res['hasBot'] = pg.evaluate("!!(window.__game && window.__game.botStep)")
    pg.screenshot(path=str(out / f'{a.tag}_00_title.png'))
    pg.mouse.click(a.w // 2, int(a.h * 0.70)); time.sleep(0.6)
    pg.screenshot(path=str(out / f'{a.tag}_01_afterclick.png'))
    time.sleep(1.5); res['audio'] = pg.evaluate("(window.__acs||[]).map(c=>c.state)")
    t0, n, last, steps, days = time.time(), 0, 0, 0, set()
    while time.time() - t0 < a.secs:
        st = pg.evaluate("window.__game.botStep('right')") if res['hasBot'] else pg.mouse.click(a.w // 2, int(a.h * 0.7))
        steps += 1
        d = pg.evaluate("window.__game && window.__game.G && window.__game.G.day")
        days.add(d)
        if time.time() - last > a.secs / 6:
            last = time.time(); n += 1; pg.screenshot(path=str(out / f'{a.tag}_{n+1:02d}_play.png'))
        if pg.evaluate("!!(window.__game.scene && window.__game.scene.credits!=null)"): res['ending'] = True; break
        time.sleep(0.12 if isinstance(st, str) and (st.startswith('work') or st == 'wait') else 0.35)
    pg.screenshot(path=str(out / f'{a.tag}_99_last.png'))
    res['steps'], res['days'] = steps, sorted(x for x in days if x is not None)
    b.close()
res['errors'] = errs; res['ok'] = (not errs) and res['fits'] and all(res['fonts'])
print(json.dumps(res, ensure_ascii=False))
(out / f'{a.tag}.json').write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding='utf-8')
