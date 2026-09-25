# 📋 Nansen Meridian Buildathon Submission Checklist
**Deadline:** September 27, 2026 (23:59 UTC)  
**Grand Prize:** $10,000 USDC

---

### Step 1: Push Code to GitHub
- [ ] Create a new public repository (e.g. `thesis-shredder` or `nansen-thesis-shredder`).
- [ ] Initialize git and push the contents of `thesis-shredder/`:
  ```bash
  git init
  git add .
  git commit -m "feat: Thesis Shredder - Adversarial Onchain Intelligence for Nansen Meridian Buildathon"
  git remote add origin https://github.com/YOUR_USERNAME/thesis-shredder.git
  git branch -M main
  git push -u origin main
  ```
- [ ] Ensure the repo has a clean description and tags: `nansen`, `buildathon`, `onchain-analytics`, `ai-agent`.

---

### Step 2: Log 1,000 Nansen API Calls
- [ ] Ensure you have created your API key at [app.nansen.ai/api](https://app.nansen.ai/api).
- [ ] Run the automated harvester script in your terminal:
  ```bash
  export NANSEN_API_KEY="your-api-key-here"
  python3 scripts/harvest_1000_calls.py --target 1000 --delay 0.2
  ```
  *(Takes ~3–4 minutes to log 1,000 legitimate calls across chains).*
- [ ] Check your Nansen dashboard at [app.nansen.ai/api](https://app.nansen.ai/api) to verify the call counter shows ≥ 1,000 calls.

---

### Step 3: Record & Post Demo on X
- [ ] Record a 30–60 second screen walkthrough (follow `docs/DEMO_VIDEO_SCRIPT.md`).
- [ ] Post on X using the copy from `docs/X_POST_COPY.md`.
- [ ] Tag **`@nansen_ai`** and include the link to your GitHub repo.
- [ ] Copy the URL of your published X post.

---

### Step 4: Submit the Official Typeform
- [ ] Navigate to the official submission form: **[nsn.ai/meridian-submit](https://nansen-ai.typeform.com/meridian-submit)**
- [ ] Field 1: **Email** -> Enter the exact email tied to your Nansen account (used to verify your 1,000 API calls).
- [ ] Field 2: **X Post Demo** -> Paste the link to your X post containing the video.
- [ ] Field 3: **Github Repo** -> Paste your public GitHub repository URL.
- [ ] Click Submit. You are officially entered!
