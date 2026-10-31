/**
 * GhostJob Buster - Popup Dashboard Controller
 * Connects with content script and background service worker to render live detections.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const activeJobCard = document.getElementById('active-job-card');
  const noActiveJobBanner = document.getElementById('no-active-job');
  const activeTitle = document.getElementById('active-title');
  const activeCompany = document.getElementById('active-company');
  const activeMeta = document.getElementById('active-meta');
  const activeRiskPill = document.getElementById('active-risk-pill');

  const btnAts = document.getElementById('btn-active-ats');
  const btnHires = document.getElementById('btn-active-hires');
  const btnLayoffs = document.getElementById('btn-active-layoffs');

  const statScanned = document.getElementById('stat-scanned');
  const statFlagged = document.getElementById('stat-flagged');
  const statHours = document.getElementById('stat-hours');

  const recentList = document.getElementById('recent-list');
  const clearHistoryBtn = document.getElementById('clear-history-btn');

  // 1. Attempt to communicate with active tab to get current job
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id && (tab.url.includes('linkedin.com') || tab.url.includes('indeed.com'))) {
      chrome.tabs.sendMessage(tab.id, { type: 'GET_ACTIVE_JOB' }, (response) => {
        if (chrome.runtime.lastError || !response || !response.success || !response.job) {
          // No job selected on current page
          showNoActiveJob();
          return;
        }

        const { job, analysis, links } = response;
        showActiveJob(job, analysis, links);
      });
    } else {
      showNoActiveJob();
    }
  } catch (e) {
    showNoActiveJob();
  }

  function showActiveJob(job, analysis, links) {
    if (!job || !job.title) {
      showNoActiveJob();
      return;
    }

    activeJobCard.style.display = 'flex';
    noActiveJobBanner.style.display = 'none';

    activeTitle.textContent = job.title;
    activeCompany.textContent = job.company || 'Unknown Employer';

    const metaParts = [];
    if (job.postedText) metaParts.push(job.postedText);
    if (job.applicantText) metaParts.push(job.applicantText);
    activeMeta.textContent = metaParts.join(' • ') || 'Live Job Posting';

    const score = analysis.ghostScore || 0;
    activeRiskPill.textContent = `${score}% Ghost Risk (${analysis.verdict || 'Moderate'})`;
    activeRiskPill.className = 'active-risk-pill';
    if (score >= 60) {
      activeRiskPill.classList.add('high-risk');
    } else if (score >= 35) {
      activeRiskPill.classList.add('medium-risk');
    } else {
      activeRiskPill.classList.add('low-risk');
    }

    if (links) {
      btnAts.href = links.atsVerificationUrl || '#';
      btnHires.href = links.recentHiresUrl || '#';
      btnLayoffs.href = links.layoffFreezeRadarUrl || '#';
    }
  }

  function showNoActiveJob() {
    activeJobCard.style.display = 'none';
    noActiveJobBanner.style.display = 'block';
  }

  // 2. Load dashboard statistics & recent jobs
  async function loadDashboardData() {
    chrome.runtime.sendMessage({ type: 'GET_DASHBOARD_DATA' }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        return;
      }

      const { stats, scannedJobs } = response.data || {};

      if (stats) {
        statScanned.textContent = stats.jobsScanned || 0;
        statFlagged.textContent = stats.ghostJobsFlagged || 0;
        statHours.textContent = `${stats.hoursSavedEst || 0}h`;
      }

      renderRecentJobs(scannedJobs || []);
    });
  }

  function renderRecentJobs(jobs) {
    if (!jobs || jobs.length === 0) {
      recentList.innerHTML = '<div class="empty-state">No jobs evaluated yet. Browse LinkedIn or Indeed to see live detections.</div>';
      return;
    }

    recentList.innerHTML = '';
    jobs.slice(0, 10).forEach((job) => {
      const a = document.createElement('a');
      a.className = 'recent-item';
      a.href = job.url || '#';
      a.target = '_blank';

      const infoDiv = document.createElement('div');
      infoDiv.className = 'recent-item-info';

      const titleEl = document.createElement('span');
      titleEl.className = 'recent-item-title';
      titleEl.textContent = job.title;

      const subEl = document.createElement('span');
      subEl.className = 'recent-item-sub';
      subEl.textContent = `${job.company || 'Company'} • ${job.platform || 'Job Board'}`;

      infoDiv.appendChild(titleEl);
      infoDiv.appendChild(subEl);

      const scoreEl = document.createElement('span');
      const score = job.ghostScore || 0;
      scoreEl.className = 'recent-score-pill ' + (score >= 60 ? 'high' : score >= 35 ? 'medium' : 'low');
      scoreEl.textContent = `${score}%`;

      a.appendChild(infoDiv);
      a.appendChild(scoreEl);
      recentList.appendChild(a);
    });
  }

  // 3. Clear History
  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all scanned job history and reset stats?')) {
      chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' }, (resp) => {
        if (resp && resp.success) {
          statScanned.textContent = '0';
          statFlagged.textContent = '0';
          statHours.textContent = '0h';
          renderRecentJobs([]);
        }
      });
    }
  });

  await loadDashboardData();
});
