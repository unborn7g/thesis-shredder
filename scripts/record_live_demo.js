const puppeteer = require('puppeteer-core');
const fs = require('fs');
const { execSync } = require('child_process');

const FRAMES_DIR = '/tmp/live_frames';
const AUDIO_PATH = '/tmp/master_45s_soundtrack.mp3';
const OUTPUT_VIDEO = '/home/user/thesis-shredder/thesis-shredder-demo.mp4';

console.log("Starting 45s LIVE WORKING DEMO recording with refined framing & dynamic subtitles...");

(async () => {
  if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080',
      '--headless=new'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Reset to empty state on load
  await page.evaluate(() => {
    const empty = document.getElementById('empty-state');
    const results = document.getElementById('results-content');
    if (empty && results) {
      empty.classList.remove('hidden');
      results.classList.add('hidden');
    }
    const ti = document.getElementById('thesis-input');
    if (ti) ti.value = '';
    const ts = document.getElementById('token-symbol');
    if (ts) ts.value = '';
  });

  // Inject Cinema Stage, Subtitle Engine, Virtual Cursor, and Effects
  await page.evaluate(() => {
    // 1. Stage wrapper for kinetic zoom & dolly
    const stage = document.createElement('div');
    stage.id = 'cinematic-stage';
    stage.style.width = '100%';
    stage.style.height = '100%';
    stage.style.transformOrigin = 'center center';
    stage.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
    stage.style.willChange = 'transform';
    
    const children = Array.from(document.body.children);
    children.forEach(c => {
      if (c.tagName !== 'SCRIPT') stage.appendChild(c);
    });
    document.body.appendChild(stage);

    // 2. High-contrast Animated Subtitles HUD
    const subBox = document.createElement('div');
    subBox.id = 'demo-subtitles-box';
    subBox.innerHTML = `
      <div id="sub-pill" style="
        background: rgba(4, 15, 27, 0.95);
        backdrop-filter: blur(18px);
        border: 1.5px solid rgba(0, 255, 167, 0.55);
        box-shadow: 0 10px 40px rgba(0,0,0,0.92), 0 0 25px rgba(0,255,167,0.3);
        border-radius: 35px;
        padding: 12px 28px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 19.5px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 0.3px;
        display: flex;
        align-items: center;
        gap: 12px;
        text-shadow: 0 2px 6px rgba(0,0,0,0.95);
        transition: all 0.2s ease;
      ">
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#00ffa7; box-shadow:0 0 10px #00ffa7;"></span>
        <span id="sub-text">Most crypto AI just hypes your trades.</span>
      </div>
    `;
    subBox.style.position = 'fixed';
    subBox.style.bottom = '30px';
    subBox.style.left = '50%';
    subBox.style.transform = 'translateX(-50%)';
    subBox.style.zIndex = '99999998';
    subBox.style.pointerEvents = 'none';
    document.body.appendChild(subBox);

    // Subtitle CSS styles
    const style = document.createElement('style');
    style.innerHTML = `
      .hl-mint { color: #00ffa7; font-weight: 800; text-shadow: 0 0 14px rgba(0,255,167,0.9); }
      .hl-red { color: #ff2244; font-weight: 800; text-shadow: 0 0 14px rgba(255,34,68,0.9); }
    `;
    document.head.appendChild(style);

    // 3. Virtual Cursor
    const cursor = document.createElement('div');
    cursor.id = 'demo-virtual-cursor';
    cursor.innerHTML = `
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 0 10px #00ffa7) drop-shadow(0 4px 14px rgba(0,0,0,0.9));">
        <path d="M3 2L18 11L11 13L9 21L3 2Z" fill="#00ffa7" stroke="#040f1b" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>
      <div id="demo-cursor-ripple"></div>
    `;
    cursor.style.position = 'fixed';
    cursor.style.top = '0';
    cursor.style.left = '0';
    cursor.style.transform = 'translate(960px, 460px)';
    cursor.style.zIndex = '99999999';
    cursor.style.pointerEvents = 'none';
    cursor.style.transition = 'transform 0.04s linear';
    document.body.appendChild(cursor);

    const ripple = document.getElementById('demo-cursor-ripple');
    ripple.style.position = 'absolute';
    ripple.style.top = '0';
    ripple.style.left = '0';
    ripple.style.width = '16px';
    ripple.style.height = '16px';
    ripple.style.borderRadius = '50%';
    ripple.style.border = '2.5px solid #00ffa7';
    ripple.style.boxShadow = '0 0 15px #00ffa7';
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '0';
    ripple.style.pointerEvents = 'none';

    // 4. Screen Flash on actions
    const flash = document.createElement('div');
    flash.id = 'demo-flash';
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100vw';
    flash.style.height = '100vh';
    flash.style.background = 'rgba(0, 255, 167, 0.25)';
    flash.style.zIndex = '99999995';
    flash.style.pointerEvents = 'none';
    flash.style.opacity = '0';
    flash.style.transition = 'opacity 0.2s ease-out';
    document.body.appendChild(flash);

    // 5. Grand Outro Overlay (Solid dark background, no bleed-through)
    const outro = document.createElement('div');
    outro.id = 'demo-outro';
    outro.innerHTML = `
      <div style="background: #060e18; border: 2px solid #00ffa7; box-shadow: 0 0 90px rgba(0, 255, 167, 0.4), 0 30px 90px rgba(0,0,0,0.98); border-radius: 24px; padding: 50px 70px; text-align: center; max-width: 820px; transform: scale(0.94); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);">
        <div style="display: inline-flex; align-items: center; gap: 14px; margin-bottom: 22px;">
          <svg viewBox="0 0 40 40" width="44" height="44" fill="#00FFA7" style="filter: drop-shadow(0 0 12px #00ffa7);">
            <path d="M 37.644 20.754 C 35.803 19.544 33.789 18.479 31.606 17.558 C 30.711 17.189 30.086 16.683 29.731 16.038 C 29.376 15.393 29.289 14.584 29.474 13.611 C 30.053 10.769 30.238 8.046 30.026 5.441 C 29.814 2.836 28.843 1.217 27.106 0.587 L 26.474 0.351 C 24.632 -0.333 22.817 -0.018 21.027 1.297 C 19.237 2.614 17.639 4.376 16.232 6.586 C 15.048 8.445 13.981 10.378 13.039 12.371 C 12.336 12.245 11.631 12.132 10.924 12.031 C 7.792 11.636 5.321 11.604 3.504 11.932 C 1.689 12.262 0.649 12.926 0.386 13.926 L 0.071 15.071 C -0.193 15.993 0.281 17.011 1.491 18.129 C 2.701 19.248 3.977 20.201 5.319 20.991 C 6.661 21.806 7.594 22.774 8.121 23.891 C 8.647 25.009 8.844 26.449 8.712 28.213 C 8.527 30.581 8.699 32.784 9.226 34.823 C 9.752 36.861 10.857 38.158 12.541 38.709 L 13.487 39.024 C 14.987 39.524 16.559 39.058 18.204 37.623 C 19.847 36.188 21.461 34.064 23.039 31.249 C 23.666 30.153 24.293 28.916 24.921 27.541 C 26.318 27.754 27.673 27.908 28.979 27.993 C 32.018 28.189 34.478 28.071 36.359 27.638 C 38.239 27.204 39.313 26.539 39.576 25.644 L 39.931 24.343 C 40.246 23.159 39.483 21.961 37.643 20.751 Z"/>
          </svg>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 800; color: #00ffa7; letter-spacing: 2.5px;">NANSEN MERIDIAN BUILDATHON</span>
        </div>
        <h1 style="font-size: 48px; font-weight: 800; color: #ffffff; margin: 0 0 14px 0; letter-spacing: -1.5px; text-shadow: 0 0 30px rgba(0,255,167,0.4);">THESIS SHREDDER</h1>
        <p style="font-size: 20px; color: #7da0ff; margin: 0 0 26px 0; font-family: 'JetBrains Mono', monospace; font-weight: 600;">Adversarial On-Chain Intelligence Engine</p>
        <div style="background: rgba(0, 0, 0, 0.65); border: 1px solid rgba(0, 255, 167, 0.3); border-radius: 12px; padding: 22px 28px; font-family: 'JetBrains Mono', monospace; font-size: 15px; color: #cbd5e1; margin-bottom: 26px; text-align: left; line-height: 1.9;">
          <div><span style="color: #00ffa7; font-weight: 700;">⚡ API Pipeline:</span> Nansen v1 REST (Smart Money, Flow Intel, Profiler)</div>
          <div><span style="color: #00ffa7; font-weight: 700;">📦 Harvester Engine:</span> 1,000 Verified API Requests Pipeline</div>
          <div><span style="color: #00ffa7; font-weight: 700;">🔗 GitHub:</span> https://github.com/unborn7g/thesis-shredder</div>
        </div>
        <div style="font-size: 16px; color: #00ffa7; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">SURFACE THE SIGNAL. PROTECT YOUR CAPITAL.</div>
      </div>
    `;
    outro.style.position = 'fixed';
    outro.style.top = '0';
    outro.style.left = '0';
    outro.style.width = '100vw';
    outro.style.height = '100vh';
    outro.style.background = '#040f1b';
    outro.style.zIndex = '999999999';
    outro.style.display = 'flex';
    outro.style.alignItems = 'center';
    outro.style.justifyContent = 'center';
    outro.style.opacity = '0';
    outro.style.pointerEvents = 'none';
    outro.style.transition = 'opacity 0.4s ease';
    document.body.appendChild(outro);

    // Helpers
    window.__setCamera = (scale, tx, ty) => {
      stage.style.transform = `scale(${scale}) translate(${tx}px, ${ty}px)`;
    };
    window.__moveCursor = (x, y) => {
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.__clickCursor = () => {
      ripple.style.transition = 'none';
      ripple.style.transform = 'scale(0)';
      ripple.style.opacity = '1';
      flash.style.opacity = '0.35';
      setTimeout(() => {
        ripple.style.transition = 'all 0.35s ease-out';
        ripple.style.transform = 'scale(5.5)';
        ripple.style.opacity = '0';
        flash.style.opacity = '0';
      }, 20);
    };
    window.__setSub = (html) => {
      const el = document.getElementById('sub-text');
      el.style.opacity = '0';
      setTimeout(() => {
        el.innerHTML = html;
        el.style.opacity = '1';
      }, 80);
    };
    window.__showOutro = () => {
      subBox.style.display = 'none';
      outro.style.opacity = '1';
      outro.querySelector('div').style.transform = 'scale(1)';
    };
  });

  // Start Screencast Frame Collector
  const client = await page.target().createCDPSession();
  let frameCount = 0;
  const frameEntries = [];
  const startTime = Date.now();

  client.on('Page.screencastFrame', async (event) => {
    const idx = frameCount++;
    const framePath = `${FRAMES_DIR}/frame_${String(idx).padStart(6, '0')}.jpg`;
    fs.writeFileSync(framePath, Buffer.from(event.data, 'base64'));
    frameEntries.push({
      file: framePath,
      timestamp: (Date.now() - startTime) / 1000.0
    });
    await client.send('Page.screencastFrameAck', { sessionId: event.sessionId });
  });

  await client.send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1 });

  // Helpers
  const cameraTo = async (scale, tx, ty, ms = 400) => {
    await page.evaluate((s, x, y) => window.__setCamera(s, x, y), scale, tx, ty);
    await new Promise(r => setTimeout(r, ms));
  };

  const cursorTo = async (selOrPos, ms = 300) => {
    let tx, ty;
    if (typeof selOrPos === 'string') {
      const b = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }, selOrPos);
      if (!b) return;
      tx = b.x; ty = b.y;
    } else {
      tx = selOrPos.x; ty = selOrPos.y;
    }
    const cur = await page.evaluate(() => {
      const c = document.getElementById('demo-virtual-cursor');
      const m = c.style.transform.match(/translate\(([\d.]+)px,\s*([\d.]+)px\)/);
      return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 960, y: 540 };
    });
    const steps = Math.max(5, Math.floor(ms / 30));
    for (let i = 1; i <= steps; i++) {
      const p = i / steps;
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      await page.evaluate((x, y) => window.__moveCursor(x, y), cur.x + (tx - cur.x) * ease, cur.y + (ty - cur.y) * ease);
      await new Promise(r => setTimeout(r, ms / steps));
    }
  };

  const clickEl = async (sel, ms = 250) => {
    await cursorTo(sel, ms);
    await page.evaluate(() => window.__clickCursor());
    await page.click(sel);
    await new Promise(r => setTimeout(r, 120));
  };

  const typeInto = async (sel, text, totalMs = 1100) => {
    await clickEl(sel, 250);
    const delay = Math.max(16, Math.floor(totalMs / text.length));
    for (let ch of text) {
      await page.keyboard.sendCharacter(ch);
      await new Promise(r => setTimeout(r, delay));
    }
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ================= SCENARIO TIMELINE (0s -> 45.0s) =================

  // 1. Hook (0.0s - 3.2s)
  console.log("0s - 3.2s | Hook: Problem Statement");
  await page.evaluate(() => window.__setSub("Most crypto AI just hypes your trades."));
  await cameraTo(1.15, 0, 70, 400);
  await cursorTo({ x: 960, y: 220 }, 300);
  await sleep(2500);

  // 2. Meet Thesis Shredder (3.2s - 6.5s)
  console.log("3.2s - 6.5s | Introducing Thesis Shredder");
  await page.evaluate(() => window.__setSub("Meet <span class='hl-mint'>Thesis Shredder</span>: adversarial due diligence."));
  await cameraTo(1.20, 160, 20, 400);
  await cursorTo('.presets-section', 300);
  await sleep(2500);

  // 3. Memecoin Input & Live Typing (6.5s - 10.8s)
  console.log("6.5s - 10.8s | Typing Memecoin Thesis");
  await page.evaluate(() => window.__setSub("Testing an overhyped memecoin: <span class='hl-mint'>$CATNIP</span> on Solana."));
  await cameraTo(1.22, 160, -40, 400);
  await cursorTo('#token-symbol', 200);
  await page.evaluate(() => { document.getElementById('token-symbol').value = 'CATNIP'; });
  await cursorTo('#thesis-input', 200);
  await typeInto('#thesis-input', 'Longing $CATNIP breakout. CT claims Smart Money is buying and dev tokens are locked.', 1200);
  await sleep(1500);

  // 4. Hit Shred Button (10.8s - 14.5s)
  console.log("10.8s - 14.5s | Hitting Shred Button");
  await page.evaluate(() => window.__setSub("CT claims Smart Money is buying. We hit <span class='hl-mint'>Shred Thesis</span>!"));
  await cameraTo(1.24, 160, -100, 350);
  await clickEl('#shred-btn', 300);
  await sleep(2500);

  // 5. Live Nansen Gauntlets Firing (14.5s - 18.5s)
  console.log("14.5s - 18.5s | Live Nansen Gauntlet Execution");
  await page.evaluate(() => window.__setSub("Live Nansen API gauntlets fire across <span class='hl-mint'>Smart Money & Profiler</span>."));
  await cameraTo(1.22, 160, -180, 400);
  await cursorTo('#console-output', 300);
  await sleep(2800);

  // 6. Score Reveal: 85% Critical Risk (18.5s - 22.5s)
  console.log("18.5s - 22.5s | Score Reveal: 85% Critical Risk");
  await page.evaluate(() => window.__setSub("Verdict: <span class='hl-red'>85% CRITICAL RISK</span>. Smart Money dumping (-$412K)."));
  await page.evaluate(() => window.scrollTo(0, 0));
  await cameraTo(1.20, -160, 40, 450);
  await cursorTo('#shred-score-val', 300);
  await sleep(2600);

  // 7. Cabal Sybil Visualizer (22.5s - 26.5s)
  console.log("22.5s - 26.5s | Sybil Cabal Visualizer");
  await page.evaluate(() => window.__setSub("Nansen Profiler detects <span class='hl-red'>11 sybil wallets</span> sharing 1 Disperse root!"));
  await cursorTo('#cabal-canvas', 300);
  await sleep(3200);

  // 8. Test Fundamental Thesis: AAVE (26.5s - 30.5s)
  console.log("26.5s - 30.5s | Interrogating AAVE on Ethereum");
  await page.evaluate(() => window.__setSub("Now testing fundamental thesis: <span class='hl-mint'>$AAVE</span> on Ethereum."));
  await cameraTo(1.18, 160, 20, 350);
  await clickEl('.preset-tab:nth-child(3)', 300); // AAVE preset click
  await sleep(300);
  await cameraTo(1.22, 160, -100, 300);
  await clickEl('#shred-btn', 300);
  await sleep(2000);

  // 9. Aave Validated 6% (30.5s - 35.0s)
  console.log("30.5s - 35.0s | Aave Validated: 6% Low Risk");
  await page.evaluate(() => window.__setSub("Nansen confirms <span class='hl-mint'>+$4.25M Smart Money inflows</span>. Score: 6% Validated!"));
  await page.evaluate(() => window.scrollTo(0, 0));
  await cameraTo(1.20, -160, 40, 450);
  await cursorTo('#shred-score-val', 300);
  await sleep(1500);
  await cursorTo('#cabal-canvas', 300);
  await sleep(1600);

  // 10. One-Click Due Diligence Export (35.0s - 38.8s)
  console.log("35.0s - 38.8s | Exporting Due Diligence");
  await page.evaluate(() => window.__setSub("One-click due diligence export for institutional traders."));
  await cameraTo(1.18, -160, -40, 350);
  await clickEl('#export-btn', 250);
  await sleep(1100);
  await cursorTo('#share-x-btn', 250);
  await sleep(1200);

  // 11. Meridian Outro & Repo Seal (38.8s - 45.0s)
  console.log("38.8s - 45.0s | Outro Impact & Meridian Seal");
  await page.evaluate(() => window.__setSub("Built on Nansen REST API for <span class='hl-mint'>Nansen Meridian Buildathon</span>."));
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    window.__showOutro();
  });
  await cameraTo(1.0, 0, 0, 300);
  await sleep(5800);

  await client.send('Page.stopScreencast');
  await browser.close();

  console.log(`Captured ${frameCount} total frames!`);

  // Concat List
  const concatPath = '/tmp/live_frames_concat.txt';
  let concatData = '';
  for (let i = 0; i < frameEntries.length - 1; i++) {
    const cur = frameEntries[i];
    const nxt = frameEntries[i + 1];
    let d = nxt.timestamp - cur.timestamp;
    if (d <= 0.001) d = 0.033;
    if (d > 0.6) d = 0.6;
    concatData += `file '${cur.file}'\nduration ${d.toFixed(4)}\n`;
  }
  if (frameEntries.length > 0) {
    const last = frameEntries[frameEntries.length - 1];
    concatData += `file '${last.file}'\nduration 2.0\nfile '${last.file}'\n`;
  }
  fs.writeFileSync(concatPath, concatData);

  console.log("Encoding Final 45s Broadcast Video with H.264 + AAC...");
  const cmd = [
    'ffmpeg', '-y',
    '-f', 'concat', '-safe', '0', '-i', concatPath,
    '-i', AUDIO_PATH,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k',
    '-shortest',
    OUTPUT_VIDEO
  ].join(' ');

  execSync(cmd, { stdio: 'inherit' });
  console.log(`Live Working Demo created at: ${OUTPUT_VIDEO}`);
  const st = fs.statSync(OUTPUT_VIDEO);
  console.log(`Video File Size: ${(st.size / (1024 * 1024)).toFixed(2)} MB`);
})();
