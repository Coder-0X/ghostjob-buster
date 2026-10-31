/**
 * GhostJob Buster - Comprehensive Automated Test Suite
 * Tests Manifest V3 schema, 6-factor Ghost Score algorithm, and candidate link generators.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('🧪 Starting GhostJob Buster Test Suite...\n');

let testsPassed = 0;
let testsFailed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

// ----------------------------------------------------
// 1. Manifest V3 Integrity
// ----------------------------------------------------
console.log('📦 1. Manifest V3 Integrity Checks');

it('manifest.json exists and is valid JSON', () => {
  const manifestPath = path.join(ROOT_DIR, 'manifest.json');
  assert(fs.existsSync(manifestPath), 'manifest.json does not exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  assert.strictEqual(manifest.manifest_version, 3, 'Must be Manifest V3');
  assert(manifest.name.startsWith('GhostJob Buster'), 'Name must start with GhostJob Buster');
  assert(manifest.version, 'Version must be specified');
  assert(manifest.background && manifest.background.service_worker, 'Service worker must be defined');
  assert(Array.isArray(manifest.permissions), 'Permissions must be an array');
  assert(manifest.permissions.includes('storage'), 'Must have storage permission');
  assert(manifest.permissions.includes('alarms'), 'Must have alarms permission');
  assert(Array.isArray(manifest.host_permissions), 'Host permissions must be an array');
  assert(manifest.host_permissions.some(h => h.includes('linkedin.com')), 'LinkedIn host permission required');
  assert(manifest.host_permissions.some(h => h.includes('indeed.com')), 'Indeed host permission required');
});

it('All icon files exist in icons/ directory', () => {
  const sizes = [16, 48, 128, 300];
  for (const size of sizes) {
    const iconPath = path.join(ROOT_DIR, 'icons', `icon-${size}.png`);
    assert(fs.existsSync(iconPath), `Missing icon: icons/icon-${size}.png`);
    const stat = fs.statSync(iconPath);
    assert(stat.size > 100, `Icon icon-${size}.png is empty or too small`);
  }
});

// ----------------------------------------------------
// 2. Ghost Score Calculation Engine Test
// ----------------------------------------------------
console.log('\n👻 2. Ghost Score Calculation Engine Tests');

// Mock algorithm from content.js
const KNOWN_RESTRUCTURING_COMPANIES = [
  'google', 'meta', 'amazon', 'microsoft', 'tesla', 'cisco', 'intel',
  'dell', 'ibm', 'salesforce', 'nike', 'general motors', 'disney', 'unity',
  'paypal', 'spotify', 'wayfair', 'chegg', 'xerox', 'paramount'
];

const EVERGREEN_PHRASES = [
  'talent pool', 'future consideration', 'future opportunities', 'ongoing intake',
  'pipeline', 'general application', 'future openings', 'continuous recruiting',
  'anticipation of future', 'expression of interest'
];

function evaluateGhostJob(job) {
  let score = 0;
  const flags = [];

  // 1. Repost Velocity & Age
  const posted = (job.postedText || '').toLowerCase();
  if (posted.includes('reposted') || posted.includes('re-posted')) {
    score += 25;
    flags.push('Requisition has been repeatedly reposted');
  }
  if (posted.includes('month') || posted.includes('30+ days') || posted.includes('60+ days')) {
    score += 20;
    flags.push('Posting active for > 30 days');
  } else if (posted.includes('3 weeks') || posted.includes('4 weeks')) {
    score += 10;
    flags.push('Posting active for > 3 weeks');
  }

  // 2. Applicant Saturation
  const appText = (job.applicantText || '').toLowerCase();
  const appMatch = appText.match(/(\d+)\+?\s*applicant/);
  const applicantCount = appMatch ? parseInt(appMatch[1], 10) : (appText.includes('over 200') ? 200 : 0);

  if (applicantCount >= 200) {
    score += 25;
    flags.push('Severe applicant saturation (>200 applicants) with open posting');
  } else if (applicantCount >= 100) {
    score += 15;
    flags.push('High applicant saturation (>100 applicants)');
  }

  // 3. Recruiter Anonymity
  if (!job.hasNamedRecruiter) {
    score += 15;
    flags.push('Hirer/Recruiter identity concealed');
  }

  // 4. Corporate Layoffs & Restructuring
  const compLower = (job.company || '').toLowerCase();
  const hasLayoffs = KNOWN_RESTRUCTURING_COMPANIES.some(c => compLower.includes(c));
  if (hasLayoffs) {
    score += 15;
    flags.push('Company has recent documented layoffs or hiring restructuring');
  }

  // 5. Evergreen Phrases
  const descLower = (job.description || '').toLowerCase();
  const hasEvergreen = EVERGREEN_PHRASES.some(phrase => descLower.includes(phrase));
  if (hasEvergreen) {
    score += 10;
    flags.push('Contains evergreen talent pool phrasing');
  }

  // 6. Native ATS Disconnect
  if (!job.hasNativeAts) {
    score += 5;
    flags.push('No direct corporate ATS link');
  }

  score = Math.min(100, Math.max(5, score));

  let verdict = 'Low Risk';
  if (score >= 65) verdict = 'High Ghost Probability';
  else if (score >= 35) verdict = 'Moderate Caution';

  return { ghostScore: score, verdict, flags };
}

it('Fresh, active job with named recruiter yields Low Ghost Risk', () => {
  const freshJob = {
    title: 'Software Engineer',
    company: 'Stripe',
    postedText: 'Posted 2 days ago',
    applicantText: '18 applicants',
    hasNamedRecruiter: true,
    hasNativeAts: true,
    description: 'We are urgently hiring a full-time backend engineer to join our payments team.'
  };

  const result = evaluateGhostJob(freshJob);
  assert(result.ghostScore <= 20, `Expected low score, got ${result.ghostScore}`);
  assert.strictEqual(result.verdict, 'Low Risk');
});

it('Zombie job (reposted, 60 days old, 200+ applicants, anonymous recruiter) yields High Ghost Probability', () => {
  const zombieJob = {
    title: 'Senior Product Manager',
    company: 'Amazon',
    postedText: 'Reposted 2 months ago',
    applicantText: 'Over 200 applicants',
    hasNamedRecruiter: false,
    hasNativeAts: false,
    description: 'Join our talent pool for future consideration as opportunities arise.'
  };

  const result = evaluateGhostJob(zombieJob);
  assert(result.ghostScore >= 80, `Expected high score >= 80, got ${result.ghostScore}`);
  assert.strictEqual(result.verdict, 'High Ghost Probability');
  assert(result.flags.length >= 4, 'Should identify multiple red flags');
});

// ----------------------------------------------------
// 3. Candidate Countermeasure Link Generators
// ----------------------------------------------------
console.log('\n🔗 3. Candidate Countermeasure Link Generators');

function buildCandidateLinks(job) {
  const encodedComp = encodeURIComponent(job.company || '');
  const encodedTitle = encodeURIComponent(job.title || '');

  return {
    atsVerificationUrl: `https://www.google.com/search?q=${encodedComp}+(${encodedTitle})+(site:greenhouse.io+OR+site:lever.co+OR+site:ashbyhq.com+OR+site:myworkdayjobs.com)`,
    recentHiresUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodedTitle}+${encodedComp}&origin=FACETED_SEARCH`,
    layoffFreezeRadarUrl: `https://www.google.com/search?q=${encodedComp}+(layoffs+OR+"hiring+freeze"+OR+restructuring)+2025+OR+2026`
  };
}

it('Generates targeted Google Dork queries for native ATS checks', () => {
  const links = buildCandidateLinks({ company: 'Acme Corp', title: 'Data Scientist' });
  assert(links.atsVerificationUrl.includes('site%3Agreenhouse.io') || links.atsVerificationUrl.includes('site:greenhouse.io'), 'Should contain Greenhouse dork');
  assert(links.recentHiresUrl.includes('linkedin.com/search/results/people'), 'Should search people on LinkedIn');
  assert(links.layoffFreezeRadarUrl.includes('layoffs'), 'Should check layoffs');
});

// ----------------------------------------------------
// 4. File Integrity Checks
// ----------------------------------------------------
console.log('\n📄 4. Production File Integrity Checks');

it('Required extension components exist', () => {
  const requiredFiles = [
    'background/service-worker.js',
    'content/content.js',
    'content/content.css',
    'popup/popup.html',
    'popup/popup.css',
    'popup/popup.js',
    'PRIVACY.md',
    'privacy-policy.html',
    'README.md',
    'STORE_SUBMISSION.md'
  ];

  for (const f of requiredFiles) {
    const fullPath = path.join(ROOT_DIR, f);
    assert(fs.existsSync(fullPath), `Required file missing: ${f}`);
  }
});

// Summary
console.log('\n=======================================');
console.log(`Results: ${testsPassed} passed, ${testsFailed} failed`);
console.log('=======================================\n');

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All automated tests passed successfully!');
}
