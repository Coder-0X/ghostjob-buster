# 👻 GhostJob Buster

> **LinkedIn & Indeed Reality Layer** — Exposing ghost postings, fake corporate talent pipelines, applicant saturation, and hiring freezes before you waste hours tailoring resumes.

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success?style=flat-square&color=8B5CF6)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Zero Data Collection](https://img.shields.io/badge/Privacy-100%25%20Local-10B981?style=flat-square)](PRIVACY.md)
[![Edge & Chrome Ready](https://img.shields.io/badge/Compatibility-Edge%20%7C%20Chrome%20%7C%20Brave-blue?style=flat-square)](https://github.com/Coder-0X/ghostjob-buster)

---

## ⚡ The Problem
Surveys and labor market analytics show that **between 18% and 34% of open job postings on corporate job boards are "Ghost Jobs"**—requisitions that companies have no immediate intention to fill. 

Companies post ghost jobs to:
1. Signal synthetic corporate growth and financial health to investors.
2. Build passive "talent pools" for speculative future openings months away.
3. Placate overworked employees by pretending reinforcements are coming.
4. Pacify internal compliance requirements while already having an internal candidate pre-selected.

Candidates spend **45–60 minutes per job** tailoring cover letters and portfolios into a corporate vacuum.

---

## 🛡️ What GhostJob Buster Does

GhostJob Buster injects a reality layer directly into **LinkedIn** and **Indeed** job postings:

- 📊 **6-Factor Heuristic Ghost Score (0–100%)**:
  - **Repost Velocity & Age (30%)**: Flags jobs lingering for >45 days or reposted multiple cycles.
  - **Applicant Saturation Gap (25%)**: Flags postings with >200 applicants where the company has not advanced hiring stages.
  - **Recruiter Anonymity (15%)**: Identifies hidden hirers vs. verified recruitment team members.
  - **Corporate Restructuring & Layoff History (15%)**: Cross-references against documented tech layoff and hiring freeze trackers.
  - **Evergreen JD Phrases (10%)**: Detects "talent pipeline", "future consideration", and "ongoing intake" phrases.
  - **Native ATS Disconnect (5%)**: Checks whether the job exists on the company's real career portal (Greenhouse, Lever, Ashby, Workday).

- ⚡ **1-Click Candidate Countermeasures**:
  - **🏢 Verify on Native Career Site / ATS**: Instantly searches Greenhouse, Lever, and Workday to confirm if the requisition actually exists.
  - **👥 Check Recent Hires for Title**: Searches LinkedIn for employees recently hired with this exact title to verify active team growth.
  - **📰 Layoff & Hiring Freeze Radar**: Checks news and layoff tracking sources for the target employer.

- ⏱️ **Candidate Time Saved Tracker**: Quantifies the real hours saved by dodging zombie listings.

---

## 🔒 100% Local & Privacy First
- **No telemetry, zero cloud tracking, zero account logins.**
- All evaluations run in ephemeral local browser memory.
- Candidate stats are stored exclusively in `chrome.storage.local`.

---

## 🚀 Installation & Local Development

### Load in Developer Mode (Chrome, Edge, Brave, Opera)
1. Clone this repository:
   ```bash
   git clone https://github.com/Coder-0X/ghostjob-buster.git
   ```
2. Open your browser's extension management page:
   - Chrome / Brave: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. Toggle **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the `ghostjob-buster` folder.
5. Navigate to any job listing on **LinkedIn** or **Indeed**. The GhostJob Buster badge will appear immediately beside the job header!

---

## 📦 Store Distribution Package
The production-ready extension package is located in `dist/ghostjob-buster-v1.0.0.zip`.

---

## 📄 License
MIT License. Created by [Coder-0X](https://github.com/Coder-0X).
