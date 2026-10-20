# 게임 없이 AudioContext만: 클릭 뒤 state·RMS (환경 탓인지 가르기)
import sys, time, json, pathlib
from playwright.sync_api import sync_playwright
u = pathlib.Path(sys.argv[1]).resolve().as_uri()
with sync_playwright() as p:
    for eng, ch in (('firefox', None), ('chromium', 'msedge')):
        kw = {'headless': True}
        if ch: kw['channel'] = ch; kw['args'] = ['--mute-audio']
        else: kw['firefox_user_prefs'] = {'media.volume_scale': '0.0'}
        b = getattr(p, eng).launch(**kw); pg = b.new_page(); pg.goto(u); pg.mouse.click(100, 100); time.sleep(2.5)
        print('ACTEST', sys.argv[2], eng, ch, json.dumps(pg.evaluate('window.r')), b.version); b.close()
