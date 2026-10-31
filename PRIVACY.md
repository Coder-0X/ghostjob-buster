# Privacy Policy for GhostJob Buster

**Effective Date:** October 25, 2026  
**Developer:** Coder-0X  
**Product:** GhostJob Buster (Browser Extension for Microsoft Edge & Google Chrome)

---

## 1. Zero Data Collection Architecture
GhostJob Buster operates on a **strict local-only, zero-telemetry architecture**:
- We do **NOT** collect, transmit, store, sell, or analyze your personal information.
- We do **NOT** track your identity, your resume, your job applications, your browsing history, or your user accounts on LinkedIn, Indeed, or any other platform.
- We operate **no remote servers**, analytics endpoints, tracking pixels, or third-party behavioral telemetry.

---

## 2. Permissions & Technical Justifications

GhostJob Buster requests only the minimal browser permissions required to perform its single purpose—evaluating job postings for ghost/zombie indicators directly in your browser:

| Permission | Purpose & Scope |
| :--- | :--- |
| `storage` | Stores your local candidate settings, scanned job count, and evaluated jobs list strictly inside your browser's private local sandboxed storage (`chrome.storage.local`). Never uploaded to the cloud. |
| `alarms` | Used to schedule lightweight local garbage collection and cache cleanup routines within the browser service worker. |
| `https://*.linkedin.com/*` | Enables the content script to detect and display ghost risk indicators on LinkedIn job requisitions (`/jobs/`). |
| `https://*.indeed.com/*` | Enables the content script to detect and display ghost risk indicators on Indeed job listings. |

---

## 3. How Job Data Is Handled
When you browse a job on LinkedIn or Indeed:
1. The extension analyzes the publicly visible text of the job description (e.g., posted date, applicant count, talent pool keywords) in volatile local browser memory.
2. The 6-factor heuristic algorithm computes a Ghost Score entirely on your machine.
3. If you click on one of the verification buttons (ATS, Recent Hires, Layoff Radar), the extension opens a standard public search query in a new tab without passing any private session tokens or identifiers.
4. All calculations and temporary evaluation logs remain strictly within your device's browser profile. You can erase this data at any moment with the "Clear" button in the popup.

---

## 4. Third-Party Services
GhostJob Buster does not integrate with any third-party analytics (e.g., Google Analytics, Mixpanel, Sentry) or advertising networks.

---

## 5. User Rights & Data Deletion
Because all data resides exclusively in your browser's `chrome.storage.local`:
- You have complete control over your data.
- You can clear your analysis history anytime via the popup interface.
- Uninstalling the extension immediately and permanently removes all stored data from your browser.

---

## 6. Contact & Open Source Auditing
GhostJob Buster is open-source. You can inspect the source code, verify privacy claims, or submit inquiries via GitHub:
- **Repository:** [https://github.com/Coder-0X/ghostjob-buster](https://github.com/Coder-0X/ghostjob-buster)
- **Developer:** Coder-0X
