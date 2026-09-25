const puppeteer = require('puppeteer-core');
const fs = require('fs');
const { execSync } = require('child_process');

const FRAMES_DIR = '/tmp/fast_frames';
const AUDIO_PATH = '/tmp/fast_soundtrack.mp3';
const OUTPUT_VIDEO = '/home/user/thesis-shredder/thesis-shredder-demo.mp4';

// Read fast timeline
const { total_duration, timeline } = JSON.parse(fs.readFileSync('/tmp/fast_timeline.json', 'utf8'));

console.log(`Starting FAST CINEMATIC recording (~${total_duration.toFixed(1)}s)...`);

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
  await new Promise(r => setTimeout(r, 1000));

  // Inject Cinema Camera Container, Custom Glowing Cursor, and Dynamic HUD
  await page.evaluate(() => {
    // Wrap entire main page in a smooth kinetic 3D stage
    const stage = document.createElement('div');
    stage.id = 'cinematic-stage';
    stage.style.width = '100%';
    stage.style.height = '100%';
    stage.style.transformOrigin = 'center center';
    stage.style.transition = 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)';
    stage.style.willChange = 'transform';
    
    // Move all body children into stage (except scripts)
    const children = Array.from(document.body.children);
    children.forEach(c => {
      if (c.tagName !== 'SCRIPT') stage.appendChild(c);
    });
    document.body.appendChild(stage);

    // Dynamic High-Impact Virtual Cursor
    const cursor = document.createElement('div');
    cursor.id = 'demo-virtual-cursor';
    cursor.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 0 10px #00ffa7) drop-shadow(0 4px 14px rgba(0,0,0,0.8));">
        <path d="M3 2L18 11L11 13L9 21L3 2Z" fill="#00ffa7" stroke="#06080b" stroke-width="1.6" stroke-linejoin="round"/>
      </svg>
      <div id="demo-cursor-ripple"></div>
    `;
    cursor.style.position = 'fixed';
    cursor.style.top = '0';
    cursor.style.left = '0';
    cursor.style.transform = 'translate(960px, 480px)';
    cursor.style.zIndex = '9999999';
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

    // Cinematic HUD Subtitle Pill
    const captionBar = document.createElement('div');
    captionBar.id = 'demo-caption-bar';
    captionBar.innerHTML = `
      <div id="demo-cap-badge" style="background: rgba(0, 255, 167, 0.2); color: #00ffa7; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(0, 255, 167, 0.4); display: flex; align-items: center; gap: 6px;">
        <span style="width: 7px; height: 7px; background: #00ffa7; border-radius: 50%; box-shadow: 0 0 8px #00ffa7; animation: blink 1s infinite alternate;"></span>
        <span id="demo-cap-tag">01 // ADVERSARIAL ENGINE</span>
      </div>
      <div id="demo-cap-text" style="color: #ffffff; font-size: 13.5px; font-weight: 600; letter-spacing: 0.2px; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">
        THESIS SHREDDER: Breaking Trade Theses Before The Market Does
      </div>
    `;
    captionBar.style.position = 'fixed';
    captionBar.style.bottom = '28px';
    captionBar.style.left = '50%';
    captionBar.style.transform = 'translateX(-50%)';
    captionBar.style.zIndex = '9999998';
    captionBar.style.background = 'rgba(6, 12, 20, 0.92)';
    captionBar.style.backdropFilter = 'blur(16px)';
    captionBar.style.border = '1px solid rgba(0, 255, 167, 0.45)';
    captionBar.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 255, 167, 0.25)';
    captionBar.style.borderRadius = '32px';
    captionBar.style.padding = '10px 24px';
    captionBar.style.display = 'flex';
    captionBar.style.alignItems = 'center';
    captionBar.style.gap = '14px';
    captionBar.style.fontFamily = "'JetBrains Mono', monospace";
    captionBar.style.pointerEvents = 'none';
    captionBar.style.transition = 'all 0.3s ease';
    document.body.appendChild(captionBar);

    // Shockwave Screen Flash Element
    const flash = document.createElement('div');
    flash.id = 'demo-flash-overlay';
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100vw';
    flash.style.height = '100vh';
    flash.style.background = 'rgba(0, 255, 167, 0.15)';
    flash.style.zIndex = '9999995';
    flash.style.pointerEvents = 'none';
    flash.style.opacity = '0';
    flash.style.transition = 'opacity 0.2s ease-out';
    document.body.appendChild(flash);

    // Outro Grand Card
    const outro = document.createElement('div');
    outro.id = 'demo-outro-card';
    outro.innerHTML = `
      <div style="background: rgba(4, 15, 27, 0.96); border: 1.5px solid #00ffa7; box-shadow: 0 0 80px rgba(0, 255, 167, 0.35), 0 20px 60px rgba(0,0,0,0.9); border-radius: 20px; padding: 50px 65px; text-align: center; max-width: 800px; backdrop-filter: blur(24px); transform: scale(0.9); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);">
        <div style="display: inline-flex; align-items: center; gap: 14px; margin-bottom: 20px;">
          <svg viewBox="0 0 40 40" width="40" height="40" fill="#00FFA7" style="filter: drop-shadow(0 0 10px #00ffa7);">
            <path d="M 37.644 20.754 C 35.803 19.544 33.789 18.479 31.606 17.558 C 30.711 17.189 30.086 16.683 29.731 16.038 C 29.376 15.393 29.289 14.584 29.474 13.611 C 30.053 10.769 30.238 8.046 30.026 5.441 C 29.814 2.836 28.843 1.217 27.106 0.587 L 26.474 0.351 C 24.632 -0.333 22.817 -0.018 21.027 1.297 C 19.237 2.614 17.639 4.376 16.232 6.586 C 15.048 8.445 13.981 10.378 13.039 12.371 C 12.336 12.245 11.631 12.132 10.924 12.031 C 7.792 11.636 5.321 11.604 3.504 11.932 C 1.689 12.262 0.649 12.926 0.386 13.926 L 0.071 15.071 C -0.193 15.993 0.281 17.011 1.491 18.129 C 2.701 19.248 3.977 20.201 5.319 20.991 C 6.661 21.806 7.594 22.774 8.121 23.891 C 8.647 25.009 8.844 26.449 8.712 28.213 C 8.527 30.581 8.699 32.784 9.226 34.823 C 9.752 36.861 10.857 38.158 12.541 38.709 L 13.487 39.024 C 14.987 39.524 16.559 39.058 18.204 37.623 C 19.847 36.188 21.461 34.064 23.039 31.249 C 23.666 30.153 24.293 28.916 24.921 27.541 C 26.318 27.754 27.673 27.908 28.979 27.993 C 32.018 28.189 34.478 28.071 36.359 27.638 C 38.239 27.204 39.313 26.539 39.576 25.644 L 39.931 24.343 C 40.246 23.159 39.483 21.961 37.643 20.751 Z"/>
          </svg>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 19px; font-weight: 800; color: #00ffa7; letter-spacing: 2.5px;">NANSEN MERIDIAN BUILDATHON</span>
        </div>
        <h1 style="font-size: 46px; font-weight: 800; color: #ffffff; margin: 0 0 14px 0; letter-spacing: -1.5px; text-shadow: 0 0 30px rgba(0,255,167,0.3);">THESIS SHREDDER</h1>
        <p style="font-size: 19px; color: #7da0ff; margin: 0 0 28px 0; font-family: 'JetBrains Mono', monospace; font-weight: 600;">Adversarial On-Chain Intelligence Engine</p>
        <div style="background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 255, 167, 0.25); border-radius: 10px; padding: 20px 24px; font-family: 'JetBrains Mono', monospace; font-size: 14.5px; color: #cbd5e1; margin-bottom: 26px; text-align: left; line-height: 1.9;">
          <div><span style="color: #00ffa7; font-weight: 700;">⚡ API Pipeline:</span> Nansen v1 REST (Smart Money, Flow Intel, Profiler)</div>
          <div><span style="color: #00ffa7; font-weight: 700;">📦 Harvester:</span> 1,000 Verified API Requests Pipeline Engine</div>
          <div><span style="color: #00ffa7; font-weight: 700;">🔗 GitHub:</span> https://github.com/unborn7g/thesis-shredder</div>
        </div>
        <div style="font-size: 15px; color: #00ffa7; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">SURFACE THE SIGNAL. PROTECT YOUR CAPITAL.</div>
      </div>
    `;
    outro.style.position = 'fixed';
    outro.style.top = '0';
    outro.style.left = '0';
    outro.style.width = '100vw';
    outro.style.height = '100vh';
    outro.style.background = 'rgba(2, 6, 12, 0.9)';
    outro.style.backdropFilter = 'blur(20px)';
    outro.style.zIndex = '99999999';
    outro.style.display = 'flex';
    outro.style.alignItems = 'center';
    outro.style.justifyContent = 'center';
    outro.style.opacity = '0';
    outro.style.pointerEvents = 'none';
    outro.style.transition = 'opacity 0.5s ease';
    document.body.appendChild(outro);

    // Global helpers
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
      flash.style.opacity = '0.4';
      setTimeout(() => {
        ripple.style.transition = 'all 0.35s ease-out';
        ripple.style.transform = 'scale(5.5)';
        ripple.style.opacity = '0';
        flash.style.opacity = '0';
      }, 20);
    };
    window.__setCaption = (tag, text) => {
      document.getElementById('demo-cap-tag').innerText = tag;
      document.getElementById('demo-cap-text').innerText = text;
    };
    window.__showOutro = () => {
      outro.style.opacity = '1';
      outro.querySelector('div').style.transform = 'scale(1)';
    };
  });

  // Start CDP Screencast
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

  await client.send('Page.startScreencast', { format: 'jpeg', quality: 90, everyNthFrame: 1 });

  // Camera Dolly helper
  const cameraTo = async (scale, tx, ty, ms = 600) => {
    await page.evaluate((s, x, y) => window.__setCamera(s, x, y), scale, tx, ty);
    await new Promise(r => setTimeout(r, ms));
  };

  const cursorTo = async (selOrPos, ms = 450) => {
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
    const steps = Math.max(8, Math.floor(ms / 30));
    for (let i = 1; i <= steps; i++) {
      const p = i / steps;
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      await page.evaluate((x, y) => window.__moveCursor(x, y), cur.x + (tx - cur.x) * ease, cur.y + (ty - cur.y) * ease);
      await new Promise(r => setTimeout(r, ms / steps));
    }
  };

  const clickEl = async (sel, ms = 300) => {
    await cursorTo(sel, ms);
    await page.evaluate(() => window.__clickCursor());
    await page.click(sel);
    await new Promise(r => setTimeout(r, 150));
  };

  // ================= SCENE 1: KINETIC HOOK (0s - 11.5s) =================
  console.log("Scene 1: Kinetic Intro & Problem Hook...");
  await page.evaluate(() => window.__setCaption('01 // ADVERSARIAL ENGINE', 'THESIS SHREDDER: Breaking Trade Theses Before The Market Does'));
  // Dynamic camera zoom into the hero header
  await cameraTo(1.18, 0, 80, 800);
  await cursorTo({ x: 960, y: 220 }, 600);
  await new Promise(r => setTimeout(r, 1500));
  
  // Camera pans down into the presets deck
  await cameraTo(1.24, 160, -40, 800);
  await cursorTo('.preset-tab:nth-child(1)', 500);
  await new Promise(r => setTimeout(r, 1600));
  await cursorTo('.preset-tab:nth-child(2)', 500);
  await new Promise(r => setTimeout(r, 1600));
  await cursorTo('.preset-tab:nth-child(3)', 500);
  await new Promise(r => setTimeout(r, 1800));

  // ================= SCENE 2: INTERROGATING CATNIP (11.5s - 25.5s) =================
  console.log("Scene 2: Ingesting $CATNIP & Firing Nansen Gauntlets...");
  await page.evaluate(() => window.__setCaption('02 // THESIS INGESTION', 'Testing Hyped Memecoin ($CATNIP) Against Live Nansen REST API'));
  // Camera zooms deep into Interrogation Desk
  await cameraTo(1.36, 220, -80, 700);
  await clickEl('.preset-tab:nth-child(1)', 400); // CATNIP
  await new Promise(r => setTimeout(r, 1000));
  
  // Camera dollies down to Shred Button
  await cameraTo(1.42, 220, -220, 700);
  await clickEl('#shred-btn', 500);
  await new Promise(r => setTimeout(r, 2000));

  // Camera pans down to terminal logs streaming
  await cameraTo(1.38, 220, -320, 800);
  await new Promise(r => setTimeout(r, 3500));

  // ================= SCENE 3: THE VERDICT & CABAL AUDIT (25.5s - 37.0s) =================
  console.log("Scene 3: BASS DROP! 85% Critical Risk & Sybil Cabal...");
  await page.evaluate(() => window.__setCaption('03 // ADVERSARIAL BREAKDOWN', '85/100 CRITICAL RISK: Coordinated Sybil Cabal & Liquidity Drain Detected'));
  // Punch into the Critical Gauge on the right deck!
  await cameraTo(1.52, -340, -100, 700);
  await cursorTo('#shred-score-val', 400);
  await new Promise(r => setTimeout(r, 2200));

  // Camera dollies smoothly down to the Disperse Cabal Graph
  await cameraTo(1.46, -340, -260, 750);
  await cursorTo('#cabal-canvas', 450);
  await new Promise(r => setTimeout(r, 2500));

  // Camera moves to Evidence Rows
  await cursorTo('#evidence-list .evidence-row:nth-child(1)', 400);
  await new Promise(r => setTimeout(r, 1600));
  await cursorTo('#evidence-list .evidence-row:nth-child(2)', 400);
  await new Promise(r => setTimeout(r, 1600));

  // ================= SCENE 4: GUIDED BUILDER & AAVE VALIDATION (37.0s - 49.0s) =================
  console.log("Scene 4: Guided Wizard & Fundamental Aave Validation...");
  await page.evaluate(() => window.__setCaption('04 // GUIDED BUILDER', 'Interactive Multi-Vector Thesis Formulation for Any Investor'));
  // Fast camera whip to Guided Wizard on left deck
  await cameraTo(1.32, 220, -180, 600);
  await cursorTo('#template-select', 400);
  await page.select('#template-select', 'meme-breakout');
  await new Promise(r => setTimeout(r, 1200));
  await clickEl('.driver-chip:nth-child(1)', 350);
  await clickEl('.driver-chip:nth-child(2)', 350);
  await new Promise(r => setTimeout(r, 1200));

  // Immediate pivot to AAVE validation
  await page.evaluate(() => window.__setCaption('05 // FUNDAMENTAL AUDIT', 'Validating $AAVE: Verified Smart Money Accumulation & Resilient Score'));
  await cameraTo(1.24, 180, -20, 600);
  await clickEl('.preset-tab:nth-child(3)', 400); // AAVE
  await new Promise(r => setTimeout(r, 800));
  await cameraTo(1.35, 200, -180, 500);
  await clickEl('#shred-btn', 400);
  await new Promise(r => setTimeout(r, 1400));

  // Whip to right panel: Green Gauge & Organic Lattice
  await cameraTo(1.5, -340, -100, 650);
  await cursorTo('#shred-score-val', 400);
  await new Promise(r => setTimeout(r, 1800));
  await cameraTo(1.42, -340, -260, 600);
  await cursorTo('#cabal-canvas', 400);
  await new Promise(r => setTimeout(r, 2000));

  // ================= SCENE 5: NANSEN INTEGRATION & OUTRO (49.0s - 57.5s) =================
  console.log("Scene 5: Harvester Pipeline, Outro Impact & Meridian Seal...");
  await page.evaluate(() => window.__setCaption('06 // NANSEN INTEGRATION', 'REST API Architecture, 1,000 Call Harvester, & Meridian Submission'));
  // Camera pulls back to full 1.0x wide view
  await cameraTo(1.0, 0, 0, 700);
  await clickEl('#open-api-modal', 400);
  await new Promise(r => setTimeout(r, 1800));

  // Trigger Outro Card with grand sub-bass impact
  await page.evaluate(() => window.__showOutro());
  await new Promise(r => setTimeout(r, 4500));

  await client.send('Page.stopScreencast');
  await browser.close();

  console.log(`Captured ${frameCount} total cinematic frames!`);

  // Build Concat file with exact timestamps
  const concatPath = '/tmp/fast_frames_concat.txt';
  let concatData = '';
  for (let i = 0; i < frameEntries.length - 1; i++) {
    const cur = frameEntries[i];
    const nxt = frameEntries[i + 1];
    let d = nxt.timestamp - cur.timestamp;
    if (d <= 0.001) d = 0.033;
    if (d > 0.8) d = 0.8;
    concatData += `file '${cur.file}'\nduration ${d.toFixed(4)}\n`;
  }
  if (frameEntries.length > 0) {
    const last = frameEntries[frameEntries.length - 1];
    concatData += `file '${last.file}'\nduration 2.0\nfile '${last.file}'\n`;
  }
  fs.writeFileSync(concatPath, concatData);

  console.log("Encoding High-Bitrate H.264 Video with AAC Audio...");
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
  console.log(`Kinetic Video created at: ${OUTPUT_VIDEO}`);
  const st = fs.statSync(OUTPUT_VIDEO);
  console.log(`Video File Size: ${(st.size / (1024 * 1024)).toFixed(2)} MB`);
})();
