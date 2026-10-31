# Store Submission Guide for GhostJob Buster

Use this metadata and copy to submit GhostJob Buster to **Microsoft Edge Add-ons** and **Google Chrome Web Store**.

---

## 1. Extension Details

- **Name:** `GhostJob Buster`
- **Short Name:** `GhostJobBuster`
- **Short Description (Max 132 chars):**
  > Detect ghost & zombie job postings on LinkedIn and Indeed. See applicant saturation, age velocity, and verify ATS listings instantly.
- **Category:** Productivity / Search Tools / Job Search
- **Default Language:** English (United States)
- **Version:** `1.0.0`
- **Developer / Publisher Name:** `Coder-0X`
- **Privacy Policy URL:** `https://github.com/Coder-0X/ghostjob-buster/blob/main/PRIVACY.md`
- **Support / Website URL:** `https://github.com/Coder-0X/ghostjob-buster`

---

## 2. Detailed Store Description

```markdown
GhostJob Buster protects job seekers from wasting countless hours applying to "Ghost Jobs"—postings that companies keep online for optics, talent hoarding, or internal compliance with no active intent to hire.

Stop throwing tailored resumes and cover letters into corporate black holes. GhostJob Buster equips you with an immediate reality check on every job requisition.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ KEY FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👻 6-FACTOR GHOST RISK SCORE
Calculates a real-time risk score (0–100%) directly inside LinkedIn and Indeed job descriptions based on:
• Repost Velocity & Age: Flags postings lingering beyond 45 days or undergoing perpetual repost cycles.
• Applicant Saturation Gap: Warns when over 200 candidates have applied without requisition status updates.
• Anonymous Recruiter Flag: Highlights when hirer identities are intentionally hidden.
• Corporate Restructuring & Layoff Radar: Alerts you if the company has recently enacted major layoffs or hiring freezes.
• Evergreen Talent Pool Keywords: Detects phrases like "continuous recruitment", "talent pipeline", and "future openings".
• ATS Disconnect: Identifies when an aggregator job does not link to a native corporate ATS (Greenhouse, Lever, Ashby, Workday).

🏢 1-CLICK ATS CAREER SITE VERIFICATION
Instantly cross-check with a single click if the opening genuinely exists on the employer's official career portal or applicant tracking system.

👥 RECENT HIRES REALITY CHECK
Search with one click for recent hires holding this exact job title to verify if the team is actively onboarding candidates.

⏱️ CANDIDATE TIME PROTECTION METRICS
Tracks total candidate hours saved across your job search by preventing wasted applications.

🔒 ZERO DATA COLLECTION & 100% PRIVATE
GhostJob Buster requires no account, creates no cloud footprint, collects zero personal information, and executes all analyses locally within your browser.
```

---

## 3. Single Purpose Justification (for Store Reviewers)

> **Single Purpose:**  
> The single purpose of GhostJob Buster is to analyze publicly visible job postings on LinkedIn and Indeed to compute and display ghost job risk indicators and provide candidate verification tools directly within the job search interface.

---

## 4. Permissions Justifications (for Chrome/Edge Store Review)

| Requested Permission | Plain-English Justification for Store Reviewer |
| :--- | :--- |
| `storage` | Required to persist candidate analysis settings, total jobs scanned counter, and local job history within `chrome.storage.local`. All data remains sandboxed on the client machine. |
| `alarms` | Used to trigger periodic client-side memory cleanup routines within the background service worker. |
| `https://*.linkedin.com/*` | Required to read publicly available job details (title, company, date posted, applicant count) and render the Ghost Score badge in the DOM on LinkedIn job pages. |
| `https://*.indeed.com/*` | Required to read publicly available job details (title, company, date posted, applicant count) and render the Ghost Score badge in the DOM on Indeed job pages. |

---

## 5. Reviewer Notes / Testing Instructions

```text
To test this extension:
1. Open any job posting on LinkedIn (e.g. linkedin.com/jobs/view/...) or Indeed (e.g. indeed.com/viewjob?...).
2. Observe the purple GhostJob Buster badge inserted beside the job title/header displaying the calculated Ghost Probability score and factor breakdowns.
3. Click the extension toolbar icon to view the active job requisition summary, ATS verification button, recent hires search, and candidate hours saved counter.
4. Note that all analysis is performed locally in browser memory; no user data or credentials are transmitted.
```
