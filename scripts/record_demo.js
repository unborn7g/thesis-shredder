const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRAMES_DIR = '/tmp/demo_frames';
const AUDIO_PATH = '/tmp/demo_audio/final_soundtrack.mp3';
const OUTPUT_VIDEO = '/home/user/thesis-shredder/thesis-shredder-demo.mp4';

// Read markers from JSON
const markersData = JSON.parse(fs.readFileSync('/tmp/video_markers.json', 'utf8'));
const { total_duration, markers } = markersData;

console.log(`Starting video recording for ${total_duration.toFixed(2)}s...`);

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

  // Wait 1 second for initial render
  await new Promise(r => setTimeout(r, 1000));

  // Inject Custom Virtual Cursor and Lower-Third Banner into DOM
  await page.evaluate(() => {
    // 1. Cursor DOM
    const cursor = document.createElement('div');
    cursor.id = 'demo-virtual-cursor';
    cursor.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 2px 8px rgba(0,255,167,0.5));">
        <path d="M4 2L18 10L11 12L9 19L4 2Z" fill="#00ffa7" stroke="#040f1b" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
      <div id="demo-cursor-ripple"></div>
    `;
    cursor.style.position = 'fixed';
    cursor.style.top = '0';
    cursor.style.left = '0';
    cursor.style.transform = 'translate(960px, 540px)';
    cursor.style.zIndex = '9999999';
    cursor.style.pointerEvents = 'none';
    cursor.style.transition = 'transform 0.05s linear';
    document.body.appendChild(cursor);

    // Ripple style
    const ripple = document.getElementById('demo-cursor-ripple');
    ripple.style.position = 'absolute';
    ripple.style.top = '0';
    ripple.style.left = '0';
    ripple.style.width = '14px';
    ripple.style.height = '14px';
    ripple.style.borderRadius = '50%';
    ripple.style.border = '2px solid #00ffa7';
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '0';
    ripple.style.pointerEvents = 'none';

    // 2. Subtitle / Chapter Bar DOM
    const captionBar = document.createElement('div');
    captionBar.id = 'demo-caption-bar';
    captionBar.innerHTML = `
      <div class="caption-tag" id="demo-cap-tag">01 // OVERVIEW</div>
      <div class="caption-text" id="demo-cap-text">THESIS SHREDDER: Adversarial Due Diligence Engine Powered by Nansen API</div>
    `;
    captionBar.style.position = 'fixed';
    captionBar.style.bottom = '28px';
    captionBar.style.left = '50%';
    captionBar.style.transform = 'translateX(-50%)';
    captionBar.style.zIndex = '9999998';
    captionBar.style.background = 'rgba(6, 12, 20, 0.9)';
    captionBar.style.backdropFilter = 'blur(14px)';
    captionBar.style.border = '1px solid rgba(0, 255, 167, 0.4)';
    captionBar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 255, 167, 0.2)';
    captionBar.style.borderRadius = '30px';
    captionBar.style.padding = '10px 24px';
    captionBar.style.display = 'flex';
    captionBar.style.alignItems = 'center';
    captionBar.style.gap = '14px';
    captionBar.style.fontFamily = "'JetBrains Mono', monospace";
    captionBar.style.pointerEvents = 'none';
    captionBar.style.transition = 'all 0.3s ease';
    document.body.appendChild(captionBar);

    const tagStyle = document.getElementById('demo-cap-tag');
    tagStyle.style.background = 'rgba(0, 255, 167, 0.15)';
    tagStyle.style.color = '#00ffa7';
    tagStyle.style.fontSize = '11px';
    tagStyle.style.fontWeight = '700';
    tagStyle.style.letterSpacing = '1px';
    tagStyle.style.padding = '4px 10px';
    tagStyle.style.borderRadius = '20px';
    tagStyle.style.border = '1px solid rgba(0, 255, 167, 0.3)';

    const textStyle = document.getElementById('demo-cap-text');
    textStyle.style.color = '#e2ecf7';
    textStyle.style.fontSize = '13px';
    textStyle.style.fontWeight = '500';
    textStyle.style.letterSpacing = '0.3px';

    // 3. Outro Card DOM (Hidden initially)
    const outroCard = document.createElement('div');
    outroCard.id = 'demo-outro-card';
    outroCard.innerHTML = `
      <div style="background: rgba(4, 15, 27, 0.96); border: 1px solid rgba(0, 255, 167, 0.5); box-shadow: 0 0 60px rgba(0, 255, 167, 0.25); border-radius: 16px; padding: 48px 60px; text-align: center; max-width: 760px; backdrop-filter: blur(20px);">
        <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 24px;">
          <svg viewBox="0 0 40 40" width="36" height="36" fill="#00FFA7">
            <path d="M 37.644 20.754 C 35.803 19.544 33.789 18.479 31.606 17.558 C 30.711 17.189 30.086 16.683 29.731 16.038 C 29.376 15.393 29.289 14.584 29.474 13.611 C 30.053 10.769 30.238 8.046 30.026 5.441 C 29.814 2.836 28.843 1.217 27.106 0.587 L 26.474 0.351 C 24.632 -0.333 22.817 -0.018 21.027 1.297 C 19.237 2.614 17.639 4.376 16.232 6.586 C 15.048 8.445 13.981 10.378 13.039 12.371 C 12.336 12.245 11.631 12.132 10.924 12.031 C 7.792 11.636 5.321 11.604 3.504 11.932 C 1.689 12.262 0.649 12.926 0.386 13.926 L 0.071 15.071 C -0.193 15.993 0.281 17.011 1.491 18.129 C 2.701 19.248 3.977 20.201 5.319 20.991 C 6.661 21.806 7.594 22.774 8.121 23.891 C 8.647 25.009 8.844 26.449 8.712 28.213 C 8.527 30.581 8.699 32.784 9.226 34.823 C 9.752 36.861 10.857 38.158 12.541 38.709 L 13.487 39.024 C 14.987 39.524 16.559 39.058 18.204 37.623 C 19.847 36.188 21.461 34.064 23.039 31.249 C 23.666 30.153 24.293 28.916 24.921 27.541 C 26.318 27.754 27.673 27.908 28.979 27.993 C 32.018 28.189 34.478 28.071 36.359 27.638 C 38.239 27.204 39.313 26.539 39.576 25.644 L 39.931 24.343 C 40.246 23.159 39.483 21.961 37.643 20.751 Z"/>
          </svg>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; color: #00ffa7; letter-spacing: 2px;">NANSEN MERIDIAN BUILDATHON 2026</span>
        </div>
        <h1 style="font-size: 42px; font-weight: 800; color: #ffffff; margin: 0 0 16px 0; letter-spacing: -1px;">THESIS SHREDDER</h1>
        <p style="font-size: 18px; color: #7da0ff; margin: 0 0 28px 0; font-family: 'JetBrains Mono', monospace;">Adversarial On-Chain Due Diligence Engine</p>
        <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 18px; font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #a0aec0; margin-bottom: 24px; text-align: left; line-height: 1.8;">
          <div><span style="color: #00ffa7;">⚡ Data Source:</span> Nansen v1 REST API (Smart Money, Flow Intel, Profiler)</div>
          <div><span style="color: #00ffa7;">📦 Qualification:</span> Harvester Pipeline for 1,000 Verified API Requests</div>
          <div><span style="color: #00ffa7;">🔗 GitHub:</span> https://github.com/unborn7g/thesis-shredder</div>
        </div>
        <div style="font-size: 14px; color: #00ffa7; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Surface The Signal. Protect Your Capital.</div>
      </div>
    `;
    outroCard.style.position = 'fixed';
    outroCard.style.top = '0';
    outroCard.style.left = '0';
    outroCard.style.width = '100vw';
    outroCard.style.height = '100vh';
    outroCard.style.background = 'rgba(2, 6, 12, 0.88)';
    outroCard.style.backdropFilter = 'blur(16px)';
    outroCard.style.zIndex = '99999999';
    outroCard.style.display = 'flex';
    outroCard.style.alignItems = 'center';
    outroCard.style.justifyContent = 'center';
    outroCard.style.opacity = '0';
    outroCard.style.pointerEvents = 'none';
    outroCard.style.transition = 'opacity 0.8s ease';
    document.body.appendChild(outroCard);

    // Helpers exposed to puppeteer
    window.__moveCursor = (x, y) => {
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.__clickCursor = () => {
      ripple.style.transition = 'none';
      ripple.style.transform = 'scale(0)';
      ripple.style.opacity = '1';
      setTimeout(() => {
        ripple.style.transition = 'all 0.4s ease-out';
        ripple.style.transform = 'scale(4.5)';
        ripple.style.opacity = '0';
      }, 20);
    };
    window.__setCaption = (tag, text) => {
      document.getElementById('demo-cap-tag').innerText = tag;
      document.getElementById('demo-cap-text').innerText = text;
    };
    window.__showOutro = () => {
      outroCard.style.opacity = '1';
    };
  });

  // Start CDP Screencast session
  const client = await page.target().createCDPSession();
  let frameCount = 0;
  const frameEntries = [];
  const startTime = Date.now();

  client.on('Page.screencastFrame', async (event) => {
    const idx = frameCount++;
    const framePath = `${FRAMES_DIR}/frame_${String(idx).padStart(6, '0')}.jpg`;
    const buf = Buffer.from(event.data, 'base64');
    fs.writeFileSync(framePath, buf);
    frameEntries.push({
      file: framePath,
      timestamp: (Date.now() - startTime) / 1000.0
    });
    await client.send('Page.screencastFrameAck', { sessionId: event.sessionId });
  });

  await client.send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1 });

  // Helper functions
  const moveCursorTo = async (targetSelectorOrCoords, durationMs = 600) => {
    let targetX, targetY;
    if (typeof targetSelectorOrCoords === 'string') {
      const box = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }, targetSelectorOrCoords);
      if (!box) return;
      targetX = box.x;
      targetY = box.y;
    } else {
      targetX = targetSelectorOrCoords.x;
      targetY = targetSelectorOrCoords.y;
    }

    const cur = await page.evaluate(() => {
      const c = document.getElementById('demo-virtual-cursor');
      const m = c.style.transform.match(/translate\(([\d.]+)px,\s*([\d.]+)px\)/);
      return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 960, y: 540 };
    });

    const steps = Math.max(10, Math.floor(durationMs / 40));
    for (let s = 1; s <= steps; s++) {
      const progress = s / steps;
      const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const x = cur.x + (targetX - cur.x) * ease;
      const y = cur.y + (targetY - cur.y) * ease;
      await page.evaluate((cx, cy) => window.__moveCursor(cx, cy), x, y);
      await new Promise(r => setTimeout(r, durationMs / steps));
    }
  };

  const smoothScrollTo = async (targetY, durationMs = 700) => {
    const curY = await page.evaluate(() => window.scrollY);
    const steps = Math.max(10, Math.floor(durationMs / 40));
    for (let s = 1; s <= steps; s++) {
      const progress = s / steps;
      const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      const y = curY + (targetY - curY) * ease;
      await page.evaluate((sy) => window.scrollTo(0, sy), y);
      await new Promise(r => setTimeout(r, durationMs / steps));
    }
  };

  const clickTarget = async (sel) => {
    await moveCursorTo(sel, 500);
    await page.evaluate(() => window.__clickCursor());
    await page.click(sel);
    await new Promise(r => setTimeout(r, 200));
  };

  // ================= SCENARIO EXECUTION =================
  console.log("Executing Scene 1: Introduction (0s - 12.4s)...");
  await page.evaluate(() => window.__setCaption('01 // OVERVIEW', 'THESIS SHREDDER: Adversarial Due Diligence Engine Powered by Nansen'));
  await moveCursorTo({ x: 960, y: 280 }, 800);
  await new Promise(r => setTimeout(r, 2000));
  await moveCursorTo('.preset-tab:nth-child(1)', 800);
  await new Promise(r => setTimeout(r, 2000));
  await moveCursorTo('.preset-tab:nth-child(2)', 800);
  await new Promise(r => setTimeout(r, 2000));
  await moveCursorTo('.preset-tab:nth-child(3)', 800);
  await new Promise(r => setTimeout(r, 2000));

  console.log("Executing Scene 2: Interrogating Memecoin (12.4s - 26.7s)...");
  await page.evaluate(() => window.__setCaption('02 // THESIS INGESTION', 'Testing Hyped Memecoin ($CATNIP) Against Live Nansen REST API'));
  await clickTarget('.preset-tab:nth-child(1)'); // CATNIP
  await new Promise(r => setTimeout(r, 1200));
  await smoothScrollTo(280, 800);
  await clickTarget('#shred-btn'); // Shred
  await new Promise(r => setTimeout(r, 2500));
  await smoothScrollTo(420, 800);
  await new Promise(r => setTimeout(r, 4000));

  console.log("Executing Scene 3: Verdict & Adversarial Audit (26.7s - 42.0s)...");
  await page.evaluate(() => window.__setCaption('03 // ADVERSARIAL AUDIT', '85/100 CRITICAL RISK: Coordinated Sybil Ring & Liquidity Bleed Detected'));
  await moveCursorTo('#shred-score-val', 800);
  await new Promise(r => setTimeout(r, 2000));
  await moveCursorTo('#cabal-canvas', 800);
  await new Promise(r => setTimeout(r, 3000));
  await moveCursorTo('#evidence-list .evidence-row:nth-child(1)', 700);
  await new Promise(r => setTimeout(r, 2500));
  await moveCursorTo('#evidence-list .evidence-row:nth-child(2)', 700);
  await new Promise(r => setTimeout(r, 2500));
  await moveCursorTo('#evidence-list .evidence-row:nth-child(3)', 700);
  await new Promise(r => setTimeout(r, 2000));

  console.log("Executing Scene 4: Guided Thesis Builder (42.0s - 56.4s)...");
  await page.evaluate(() => window.__setCaption('04 // GUIDED BUILDER', 'Interactive Multi-Vector Thesis Formulation for Any Investor'));
  await smoothScrollTo(260, 800);
  await moveCursorTo('#template-select', 700);
  await page.select('#template-select', 'meme-breakout');
  await new Promise(r => setTimeout(r, 1500));
  await clickTarget('.driver-chip:nth-child(1)'); // volume surge
  await new Promise(r => setTimeout(r, 800));
  await clickTarget('.driver-chip:nth-child(2)'); // smart money rumor
  await new Promise(r => setTimeout(r, 800));
  await moveCursorTo('#thesis-input', 800);
  await new Promise(r => setTimeout(r, 3500));

  console.log("Executing Scene 5: Fundamental Blue-Chip ($AAVE) (56.4s - 69.7s)...");
  await page.evaluate(() => window.__setCaption('05 // FUNDAMENTAL AUDIT', 'Validating $AAVE: Verified Smart Money Accumulation & Low Risk'));
  await smoothScrollTo(0, 800);
  await clickTarget('.preset-tab:nth-child(3)'); // AAVE
  await new Promise(r => setTimeout(r, 1000));
  await smoothScrollTo(280, 800);
  await clickTarget('#shred-btn');
  await new Promise(r => setTimeout(r, 2500));
  await smoothScrollTo(420, 800);
  await moveCursorTo('#shred-score-val', 800);
  await new Promise(r => setTimeout(r, 3000));
  await moveCursorTo('#cabal-canvas', 800);
  await new Promise(r => setTimeout(r, 2500));

  console.log("Executing Scene 6: Architecture, Harvester & Outro (69.7s - 81.9s)...");
  await page.evaluate(() => window.__setCaption('06 // NANSEN INTEGRATION', 'REST API Architecture, 1,000 Call Harvester, & Meridian Submission'));
  await smoothScrollTo(0, 700);
  await clickTarget('#open-api-modal');
  await new Promise(r => setTimeout(r, 2500));
  await moveCursorTo('#run-harvest-sample', 800);
  await new Promise(r => setTimeout(r, 2500));
  
  // Show Outro Card
  await page.evaluate(() => window.__showOutro());
  await new Promise(r => setTimeout(r, 4500));

  await client.send('Page.stopScreencast');
  await browser.close();

  console.log(`Captured ${frameCount} total frames!`);

  // Build concat list for ffmpeg with exact timestamps
  const concatListPath = '/tmp/frames_concat.txt';
  let concatContent = '';
  for (let i = 0; i < frameEntries.length - 1; i++) {
    const cur = frameEntries[i];
    const nxt = frameEntries[i + 1];
    let duration = nxt.timestamp - cur.timestamp;
    if (duration <= 0.001) duration = 0.033;
    // Cap max pause per frame to 1s to prevent runaway if paused
    if (duration > 1.0) duration = 1.0;
    concatContent += `file '${cur.file}'\nduration ${duration.toFixed(4)}\n`;
  }
  // Repeat last frame
  if (frameEntries.length > 0) {
    const last = frameEntries[frameEntries.length - 1];
    concatContent += `file '${last.file}'\nduration 2.0\n`;
    concatContent += `file '${last.file}'\n`;
  }
  fs.writeFileSync(concatListPath, concatContent);

  console.log("Encoding video with ffmpeg (H.264 + AAC)...");
  const ffmpegCmd = [
    'ffmpeg', '-y',
    '-f', 'concat', '-safe', '0', '-i', concatListPath,
    '-i', AUDIO_PATH,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k',
    '-shortest',
    OUTPUT_VIDEO
  ].join(' ');

  console.log("Running ffmpeg command:", ffmpegCmd);
  execSync(ffmpegCmd, { stdio: 'inherit' });

  console.log(`Demo video created successfully at: ${OUTPUT_VIDEO}`);
  const stats = fs.statSync(OUTPUT_VIDEO);
  console.log(`Video File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
})();
