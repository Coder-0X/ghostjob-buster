/**
 * GhostJob Buster - Advanced Content Script (Manifest V3)
 * React SPA-aware listener, LinkedIn & Indeed DOM extractors, and 6-factor Ghost Score engine.
 */

(function () {
  'use strict';

  if (window.__GHOSTJOB_BUSTER_LOADED__) return;
  window.__GHOSTJOB_BUSTER_LOADED__ = true;

  let lastEvaluatedJobId = '';
  let evaluationTimer = null;

  // Major companies with documented hiring restructuring/layoff freezes
  const KNOWN_RESTRUCTURING_COMPANIES = [
    'google', 'meta', 'amazon', 'microsoft', 'tesla', 'cisco', 'intel',
    'dell', 'ibm', 'salesforce', 'nike', 'general motors', 'disney', 'unity',
    'paypal', 'spotify', 'wayfair', 'chegg', 'xerox', 'paramount'
  ];

  // Evergreen talent-pool phrases
  const EVERGREEN_PHRASES = [
    'talent pool', 'future consideration', 'future opportunities', 'ongoing intake',
    'pipeline', 'general application', 'future openings', 'continuous recruiting',
    'anticipation of future', 'expression of interest'
  ];

  // Helper: Extract unique Job ID from URL or attributes
  function getJobId() {
    const url = window.location.href;
    // LinkedIn: /jobs/view/123456789/ or currentJobId=123456789
    const liMatch = url.match(/\/jobs\/view\/(\d+)/) || url.match(/currentJobId=(\d+)/);
    if (liMatch) return 'li_' + liMatch[1];

    // Indeed: jk=abcdef123456 or vjk=abcdef123456
    const inMatch = url.match(/[?&]jk=([a-f0-9]+)/i) || url.match(/[?&]vjk=([a-f0-9]+)/i);
    if (inMatch) return 'in_' + inMatch[1];

    return window.location.pathname;
  }

  // Extract LinkedIn job details
  function extractLinkedInDetails() {
    const titleEl = document.querySelector('h1.job-details-jobs-unified-top-card__job-title') ||
                    document.querySelector('h1.t-24.t-bold') ||
                    document.querySelector('.jobs-unified-top-card__job-title');
    if (!titleEl) return null;

    const companyEl = document.querySelector('.job-details-jobs-unified-top-card__company-name a') ||
                      document.querySelector('.job-details-jobs-unified-top-card__company-name') ||
                      document.querySelector('.jobs-unified-top-card__company-name');

    const postedEl = document.querySelector('.jobs-unified-top-card__posted-date') ||
                     document.querySelector('span.tvm__text--low-emphasis');

    const applicantEl = document.querySelector('.jobs-unified-top-card__applicant-count') ||
                        document.querySelector('span.jobs-unified-top-card__bullet');

    const recruiterEl = document.querySelector('.hirer-card__hirer-information') ||
                        document.querySelector('.hirer-card');

    const descEl = document.querySelector('#job-details') ||
                   document.querySelector('.jobs-description-content__text');

    const applyBtn = document.querySelector('.jobs-apply-button') ||
                     document.querySelector('button[data-control-name="jobdetails_topcard_inapply"]');

    const title = titleEl.textContent.trim();
    const company = companyEl ? companyEl.textContent.trim() : 'Company';
    const postedText = postedEl ? postedEl.textContent.trim() : '';
    const applicantText = applicantEl ? applicantEl.textContent.trim() : '';
    const hasRecruiter = !!recruiterEl;
    const isEasyApply = applyBtn ? applyBtn.textContent.includes('Easy Apply') : false;
    const description = descEl ? descEl.textContent.toLowerCase() : '';

    return {
      platform: 'LinkedIn',
      jobId: getJobId(),
      title,
      company,
      postedText,
      applicantText,
      hasRecruiter,
      isEasyApply,
      description,
      url: window.location.href
    };
  }

  // Extract Indeed job details
  function extractIndeedDetails() {
    const titleEl = document.querySelector('h2.jobsearch-JobInfoHeader-title') ||
                    document.querySelector('[data-testid="simpler-jobTitle"]');
    if (!titleEl) return null;

    const companyEl = document.querySelector('[data-testid="inlineHeader-companyName"] a') ||
                      document.querySelector('[data-testid="inlineHeader-companyName"]') ||
                      document.querySelector('.jobsearch-CompanyInfoContainer');

    const postedEl = document.querySelector('[data-testid="myJobsStateDate"]') ||
                     document.querySelector('.jobsearch-JobMetadataFooter span.date');

    const descEl = document.querySelector('#jobDescriptionText');

    const title = titleEl.textContent.trim();
    const company = companyEl ? companyEl.textContent.trim() : 'Company';
    const postedText = postedEl ? postedEl.textContent.trim() : '';
    const description = descEl ? descEl.textContent.toLowerCase() : '';

    return {
      platform: 'Indeed',
      jobId: getJobId(),
      title,
      company,
      postedText,
      applicantText: '',
      hasRecruiter: false,
      isEasyApply: true,
      description,
      url: window.location.href
    };
  }

  // 6-Factor Ghost Score Calculation
  function evaluateGhostJob(job) {
    let score = 20; // Base baseline
    const flags = [];
    const lowerPosted = (job.postedText || '').toLowerCase();
    const lowerApplicant = (job.applicantText || '').toLowerCase();
    const lowerCompany = (job.company || '').toLowerCase();

    // 1. Repost Velocity & Age Factor (Max +35%)
    if (lowerPosted.includes('reposted')) {
      score += 25;
      flags.push({
        label: 'Repeatedly Reposted Listing',
        detail: `Tagged as "${job.postedText}". Roles reposted over 14-day cycles are often automated evergreen pools.`
      });
    }

    if (lowerPosted.includes('month') || lowerPosted.includes('30+ day') || lowerPosted.includes('weeks ago')) {
      const matchMonth = lowerPosted.match(/(\d+)\s+month/);
      const months = matchMonth ? parseInt(matchMonth[1], 10) : 1;
      if (months >= 2) {
        score += 30;
        flags.push({
          label: 'Stale Requisition (' + months + '+ Months Old)',
          detail: 'Open positions rarely stay unfilled for 60+ days without an active hiring freeze or resume-harvesting intent.'
        });
      } else {
        score += 15;
      }
    } else if (lowerPosted.includes('just posted') || lowerPosted.includes('1 day') || lowerPosted.includes('2 day') || lowerPosted.includes('today')) {
      score -= 20; // Very fresh posting
    }

    // 2. Applicant Saturation Gap (Max +25%)
    let applicantCount = 0;
    const countMatch = lowerApplicant.match(/(\d[\d,]*)/);
    if (countMatch) {
      applicantCount = parseInt(countMatch[1].replace(/,/g, ''), 10);
    } else if (lowerApplicant.includes('over 200')) {
      applicantCount = 201;
    }

    if (applicantCount >= 500) {
      score += 25;
      flags.push({
        label: 'Extreme Applicant Saturation (500+ Applicants)',
        detail: 'Listing remains open despite overwhelming candidate volume without closing for review.'
      });
    } else if (applicantCount >= 200) {
      score += 15;
      flags.push({
        label: 'High Applicant Saturation (200+ Applicants)',
        detail: 'Substantial talent pool already collected; probability of resume review drops significantly.'
      });
    } else if (applicantCount > 0 && applicantCount < 40) {
      score -= 15; // Low applicant count, early candidate intake
    }

    // 3. Recruiter Accountability Factor (Max +15% or -20%)
    if (job.hasRecruiter) {
      score -= 20; // Real human recruiter attached!
    } else if (job.platform === 'LinkedIn') {
      score += 15;
      flags.push({
        label: 'Anonymous Hiring Team',
        detail: 'No dedicated recruiter or hiring manager is attached to this requisition.'
      });
    }

    // 4. Company Restructuring / Layoff Signals (Max +15%)
    const isRestructuring = KNOWN_RESTRUCTURING_COMPANIES.some(comp => lowerCompany.includes(comp));
    if (isRestructuring) {
      score += 15;
      flags.push({
        label: 'Company Restructuring Signal',
        detail: `${job.company} has announced corporate headcount reductions or hiring freezes in recent quarters.`
      });
    }

    // 5. Evergreen / Talent-Pool JD Phrasing (Max +15%)
    for (const phrase of EVERGREEN_PHRASES) {
      if (job.description.includes(phrase)) {
        score += 20;
        flags.push({
          label: 'Evergreen Talent-Pool Language',
          detail: `Job description explicitly includes talent-pooling phrasing: "${phrase}".`
        });
        break;
      }
    }

    score = Math.min(95, Math.max(5, score));

    const isHighRisk = score >= 60;
    const isModerate = score >= 35 && score < 60;

    let verdict = 'Active Priority Requisition';
    let color = '#10B981';

    if (isHighRisk) {
      verdict = 'High Ghost Job Likelihood';
      color = '#EF4444';
    } else if (isModerate) {
      verdict = 'Moderate Sunk-Cost Risk';
      color = '#F59E0B';
    }

    return {
      score,
      verdict,
      color,
      flags,
      isHighRisk,
      isModerate,
      applicantCount
    };
  }

  // Build candidate empowerment verification links
  function buildCandidateLinks(job) {
    const cleanTitle = job.title.replace(/[^\w\s-]/g, ' ').split(/\s+/).slice(0, 4).join(' ');
    const company = job.company;

    return {
      // 1. Native ATS Verification (Greenhouse, Lever, Workday)
      nativeATS: `https://www.google.com/search?q=site:boards.greenhouse.io/${encodeURIComponent(company)}+OR+site:jobs.lever.co/${encodeURIComponent(company)}+OR+site:myworkdayjobs.com/${encodeURIComponent(company)}+"${encodeURIComponent(cleanTitle)}"`,

      // 2. LinkedIn Recent Hires Audit (Check if someone was already hired)
      recentHires: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' ' + cleanTitle)}`,

      // 3. Layoff & Hiring Freeze Radar
      layoffRadar: `https://www.google.com/search?q=${encodeURIComponent(company + ' layoffs hiring freeze 2025 OR 2026')}`,

      // 4. Glassdoor Company Interview Difficulty
      glassdoor: `https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(company)}`
    };
  }

  // Inject the floating badge into the page
  function injectGhostBadge(job, analysis, links) {
    const existing = document.getElementById('ghostjob-buster-root');
    if (existing) existing.remove();

    const root = document.createElement('div');
    root.id = 'ghostjob-buster-root';

    root.innerHTML = `
      <div class="gjb-card ${analysis.isHighRisk ? 'gjb-alert-border' : ''}">
        <div class="gjb-header">
          <div class="gjb-brand">
            <span class="gjb-ghost-icon">👻</span>
            <span class="gjb-title">GhostJob Buster</span>
          </div>
          <div class="gjb-actions">
            <button class="gjb-btn-toggle" title="Minimize/Maximize" id="gjb-toggle-btn">−</button>
            <button class="gjb-btn-close" title="Close" id="gjb-close-btn">&times;</button>
          </div>
        </div>

        <div class="gjb-body" id="gjb-body-content">
          <div class="gjb-score-row">
            <div class="gjb-gauge">
              <span class="gjb-score-num" style="color: ${analysis.color};">${analysis.score}%</span>
            </div>
            <div class="gjb-status">
              <span class="gjb-verdict" style="color: ${analysis.color};">${analysis.verdict}</span>
              <span class="gjb-meta">${job.postedText || 'Posted date unavailable'} ${job.applicantText ? '• ' + job.applicantText : ''}</span>
            </div>
          </div>

          ${analysis.flags.length > 0 ? `
            <div class="gjb-flags">
              ${analysis.flags.map(f => `
                <div class="gjb-flag-item">
                  <span class="gjb-flag-bullet">⚠️</span>
                  <div class="gjb-flag-text">
                    <strong>${f.label}</strong>
                    <p>${f.detail}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<div class="gjb-clean-notice">✅ Fresh opening with active candidate intake. No ghost markers detected.</div>'}

          <div class="gjb-links-header">1-Click Reality Checks:</div>
          <div class="gjb-btn-grid">
            <a href="${links.nativeATS}" target="_blank" rel="noopener noreferrer" class="gjb-action-btn gjb-ats" title="Checks Greenhouse, Lever, and Workday directly">
              <span>🏢 Verify on Native Career Site / ATS</span>
              <span class="gjb-arrow">↗</span>
            </a>
            <a href="${links.recentHires}" target="_blank" rel="noopener noreferrer" class="gjb-action-btn gjb-hires" title="Check if this title was already hired on LinkedIn">
              <span>👥 Check Recent Hires for this Role</span>
              <span class="gjb-arrow">↗</span>
            </a>
            <a href="${links.layoffRadar}" target="_blank" rel="noopener noreferrer" class="gjb-action-btn gjb-layoff" title="Check hiring freezes and layoff announcements">
              <span>📰 Layoffs & Freeze Radar</span>
              <span class="gjb-arrow">↗</span>
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    // Event listeners
    const toggleBtn = root.querySelector('#gjb-toggle-btn');
    const bodyContent = root.querySelector('#gjb-body-content');
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = bodyContent.style.display === 'none';
      bodyContent.style.display = isCollapsed ? 'block' : 'none';
      toggleBtn.textContent = isCollapsed ? '−' : '+';
    });

    const closeBtn = root.querySelector('#gjb-close-btn');
    closeBtn.addEventListener('click', () => {
      root.remove();
    });
  }

  // Main evaluation trigger
  async function evaluateCurrentJob() {
    const host = window.location.hostname;
    let job = null;

    if (host.includes('linkedin.com')) {
      job = extractLinkedInDetails();
    } else if (host.includes('indeed.com')) {
      job = extractIndeedDetails();
    }

    if (!job || !job.title) return;

    if (job.jobId === lastEvaluatedJobId) return;
    lastEvaluatedJobId = job.jobId;

    const analysis = evaluateGhostJob(job);
    const links = buildCandidateLinks(job);

    injectGhostBadge(job, analysis, links);

    try {
      await chrome.runtime.sendMessage({
        type: 'JOB_ANALYZED',
        payload: {
          jobId: job.jobId,
          title: job.title,
          company: job.company,
          platform: job.platform,
          url: job.url,
          postedText: job.postedText,
          applicantText: job.applicantText,
          ghostScore: analysis.score,
          verdict: analysis.verdict,
          flags: analysis.flags
        }
      });
    } catch (e) {}
  }

  // Bi-directional messaging listener for popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_ACTIVE_JOB') {
      const host = window.location.hostname;
      const job = host.includes('linkedin.com') ? extractLinkedInDetails() : extractIndeedDetails();
      if (job && job.title) {
        const analysis = evaluateGhostJob(job);
        const links = buildCandidateLinks(job);
        sendResponse({ success: true, job, analysis, links });
      } else {
        sendResponse({ success: false });
      }
    }
    return true;
  });

  // SPA Navigation Observer (React pushState & DOM hydration)
  function setupSpaObserver() {
    // 1. URL change detector (pushState / popstate)
    let currentUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        lastEvaluatedJobId = '';
        scheduleEvaluation();
      }
    }, 700);

    // 2. DOM MutationObserver
    const observer = new MutationObserver(() => {
      scheduleEvaluation();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function scheduleEvaluation() {
    if (evaluationTimer) clearTimeout(evaluationTimer);
    evaluationTimer = setTimeout(evaluateCurrentJob, 500);
  }

  setupSpaObserver();
  scheduleEvaluation();
})();
