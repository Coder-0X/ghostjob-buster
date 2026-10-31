/**
 * GhostJob Buster - Background Service Worker (Manifest V3)
 * Handles job history tracking, badge alerts, and candidate time-savings analytics.
 */

chrome.runtime.onInstalled.addListener(async () => {
  const defaults = {
    settings: {
      autoScan: true,
      alertThreshold: 60 // Ghost risk % that triggers warning
    },
    stats: {
      jobsScanned: 0,
      ghostJobsFlagged: 0,
      hoursSavedEst: 0
    },
    scannedJobs: []
  };

  const current = await chrome.storage.local.get(['settings', 'stats', 'scannedJobs']);
  if (!current.settings) {
    await chrome.storage.local.set(defaults);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === 'JOB_ANALYZED') {
        const job = message.payload;
        const data = await chrome.storage.local.get(['stats', 'scannedJobs', 'settings']);

        const stats = data.stats || { jobsScanned: 0, ghostJobsFlagged: 0, hoursSavedEst: 0 };
        const scannedJobs = data.scannedJobs || [];
        const settings = data.settings || { alertThreshold: 60 };

        stats.jobsScanned += 1;

        if (job.ghostScore >= settings.alertThreshold) {
          stats.ghostJobsFlagged += 1;
          // Each avoided ghost job saves roughly 45 minutes (0.75 hrs) of tailored resume tailoring
          stats.hoursSavedEst = +(stats.hoursSavedEst + 0.75).toFixed(1);

          if (sender.tab && sender.tab.id) {
            await chrome.action.setBadgeText({ text: '👻', tabId: sender.tab.id });
            await chrome.action.setBadgeBackgroundColor({ color: '#DC2626', tabId: sender.tab.id });
          }
        } else {
          if (sender.tab && sender.tab.id) {
            await chrome.action.setBadgeText({ text: '✓', tabId: sender.tab.id });
            await chrome.action.setBadgeBackgroundColor({ color: '#10B981', tabId: sender.tab.id });
          }
        }

        const updated = [
          {
            id: Date.now(),
            jobId: job.jobId,
            title: job.title,
            company: job.company,
            platform: job.platform,
            url: job.url,
            ghostScore: job.ghostScore,
            verdict: job.verdict,
            postedText: job.postedText,
            applicantText: job.applicantText,
            flags: job.flags || [],
            timestamp: new Date().toISOString()
          },
          ...scannedJobs.filter(j => j.url !== job.url && j.jobId !== job.jobId)
        ].slice(0, 40);

        await chrome.storage.local.set({ stats, scannedJobs: updated });
        sendResponse({ success: true, stats });
      } else if (message.type === 'GET_DASHBOARD_DATA') {
        const data = await chrome.storage.local.get(['stats', 'scannedJobs', 'settings']);
        sendResponse({ success: true, data });
      } else if (message.type === 'CLEAR_HISTORY') {
        await chrome.storage.local.set({
          scannedJobs: [],
          stats: { jobsScanned: 0, ghostJobsFlagged: 0, hoursSavedEst: 0 }
        });
        sendResponse({ success: true });
      }
    } catch (err) {
      console.error('[GhostJob Buster SW Error]:', err);
      sendResponse({ success: false, error: err.message });
    }
  })();
  return true;
});
