const STORAGE_KEY = 'salesRaceTracker.v1';
const POINTS = {
  base: { new: 100, used: 80, ev: 120 },
  highValueThreshold: 600_000,
  highValueBonus: 20,
  earlyBirdBonus: 10,
  tierSize: 1000,
};

const BADGES = {
  season: [
    { id: 'rising-star', label: 'Rising Star', icon: '⭐', rule: (s) => s.totalPoints >= 500 },
    { id: 'closer', label: 'Closer', icon: '🏁', rule: (s) => s.totalPoints >= 1500 },
    { id: 'sales-warrior', label: 'Sales Warrior', icon: '🏎️', rule: (s) => s.totalPoints >= 3000 },
    { id: 'ev-specialist', label: 'EV Specialist', icon: '⚡', rule: (s) => s.evCount >= 10 },
    { id: 'early-bird', label: 'Early Bird', icon: '🌅', rule: (s) => s.earlyBirdCount >= 5 },
  ],
  allTime: [
    { id: 'consistency', label: 'Consistency', icon: '🎯', rule: (_, allStats) => allStats.months1500Plus >= 6 },
  ],
};


const RIVAL_DRIVERS = [
  { name: 'Maja Nilsen', seed: 1900 },
  { name: 'Eirik Hansen', seed: 1780 },
  { name: 'Sana Berg', seed: 1650 },
  { name: 'Jonas Lunde', seed: 1540 },
];

const RACE_CALENDAR = [
  { name: 'Bahrain GP', date: '2026-03-08T15:00:00Z' },
  { name: 'Saudi Arabian GP', date: '2026-03-15T17:00:00Z' },
  { name: 'Australian GP', date: '2026-03-29T04:00:00Z' },
  { name: 'Japanese GP', date: '2026-04-12T05:00:00Z' },
  { name: 'Miami GP', date: '2026-05-03T20:00:00Z' },
  { name: 'Monaco GP', date: '2026-06-07T13:00:00Z' },
  { name: 'British GP', date: '2026-07-05T14:00:00Z' },
  { name: 'Italian GP', date: '2026-09-06T14:00:00Z' },
  { name: 'Singapore GP', date: '2026-10-11T12:00:00Z' },
  { name: 'Abu Dhabi GP', date: '2026-12-06T13:00:00Z' },
];

const el = {
  profileSetup: document.getElementById('profileSetup'),
  dashboard: document.getElementById('dashboard'),
  profileForm: document.getElementById('profileForm'),
  nameInput: document.getElementById('nameInput'),
  nicknameInput: document.getElementById('nicknameInput'),
  accentSelect: document.getElementById('accentSelect'),
  raceModeInput: document.getElementById('raceModeInput'),
  seasonSelect: document.getElementById('seasonSelect'),
  raceModeToggle: document.getElementById('raceModeToggle'),
  profileChip: document.getElementById('profileChip'),
  editProfileBtn: document.getElementById('editProfileBtn'),
  logoutBtn: document.getElementById('logoutBtn'),
  profileModal: document.getElementById('profileModal'),
  profileEditForm: document.getElementById('profileEditForm'),
  editNameInput: document.getElementById('editNameInput'),
  editNicknameInput: document.getElementById('editNicknameInput'),
  editAccentSelect: document.getElementById('editAccentSelect'),
  editRaceModeInput: document.getElementById('editRaceModeInput'),
  dateInput: document.getElementById('dateInput'),
  valueInput: document.getElementById('valueInput'),
  notesInput: document.getElementById('notesInput'),
  logForm: document.getElementById('logForm'),
  logSubmit: document.getElementById('logSubmit'),
  totalPoints: document.getElementById('totalPoints'),
  tierValue: document.getElementById('tierValue'),
  progressBar: document.getElementById('progressBar'),
  progressLabel: document.getElementById('progressLabel'),
  streakValue: document.getElementById('streakValue'),
  bestStreakValue: document.getElementById('bestStreakValue'),
  activityList: document.getElementById('activityList'),
  confirmDialog: document.getElementById('confirmDialog'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
  badgesGrid: document.getElementById('badgesGrid'),
  leaderboardList: document.getElementById('leaderboardList'),
  toast: document.getElementById('toast'),
  sessionLine: document.getElementById('sessionLine'),
  nextRaceName: document.getElementById('nextRaceName'),
  nextRaceDate: document.getElementById('nextRaceDate'),
  countdownLabel: document.getElementById('countdownLabel'),
  seasonWins: document.getElementById('seasonWins'),
  avgPointsPerLog: document.getElementById('avgPointsPerLog'),
  paceLabel: document.getElementById('paceLabel'),
};

let state = loadState();
let selectedSeason = getCurrentSeasonKey();
let pendingDeleteId = null;
let prevEarnedBadgeIds = new Set();

init();

function init() {
  ensureCurrentSeasonExists();
  bindEvents();
  integrateVisualMood();
  if (!state.profile?.name) {
    el.profileSetup.classList.remove('hidden');
  } else {
    el.dashboard.classList.remove('hidden');
    render();
  }
  el.dateInput.value = formatDateForInput(new Date());
  el.valueInput.focus();
}


function integrateVisualMood() {
  const vibeSection = document.querySelector('.vibe-gallery');
  if (vibeSection) vibeSection.remove();

  injectPremiumVisualStyles();

  insertCardVisual('.stats-card', 'assets/vibe-speed.svg', 'Abstract F1 inspired speed lines behind the performance metrics', 'card-hero-media');
  insertCardVisual('.leaderboard', 'assets/vibe-podium.svg', 'Premium podium scene reinforcing top seller competition', 'inline-media media-podium');
  insertCardVisual('.quick-log', 'assets/vibe-electric.svg', 'Electric inspired futuristic grid theme for the logging panel', 'inline-media media-electric');
}

function insertCardVisual(selector, src, alt, className) {
  const card = document.querySelector(selector);
  if (!card || card.querySelector(`.${className.split(' ')[0]}`)) return;
  const media = document.createElement('figure');
  media.className = className;
  media.innerHTML = `<img src="${src}" alt="${alt}" loading="lazy" />`;

  const sectionHeader = card.querySelector('.section-header');
  if (sectionHeader) {
    sectionHeader.insertAdjacentElement('afterend', media);
  } else {
    card.insertAdjacentElement('afterbegin', media);
  }
}

function injectPremiumVisualStyles() {
  if (document.getElementById('premiumVisualStyles')) return;
  const style = document.createElement('style');
  style.id = 'premiumVisualStyles';
  style.textContent = `
    .quick-log, .activity, .badges, .leaderboard {
      background: color-mix(in srgb, var(--panel) 92%, transparent);
    }
    .card-hero-media, .inline-media {
      margin: 0 0 0.85rem;
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      background: var(--panel-2);
    }
    .card-hero-media img, .inline-media img {
      width: 100%;
      display: block;
      object-fit: cover;
    }
    .card-hero-media img { aspect-ratio: 18 / 5; }
    .inline-media img { aspect-ratio: 21 / 5; }
    .media-podium { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 15%, transparent); }
    .media-electric { box-shadow: inset 0 0 0 1px color-mix(in srgb, #2c8fff 20%, transparent); }
  `;
  document.head.append(style);
}

function bindEvents() {
  el.profileForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.profile = {
      name: el.nameInput.value.trim(),
      nickname: el.nicknameInput.value.trim(),
      accentTheme: el.accentSelect.value,
      raceMode: el.raceModeInput.checked,
    };
    persist();
    el.profileSetup.classList.add('hidden');
    el.dashboard.classList.remove('hidden');
    render();
    toast('Profile saved');
  });

  el.editProfileBtn.addEventListener('click', () => {
    el.editNameInput.value = state.profile.name;
    el.editNicknameInput.value = state.profile.nickname || '';
    el.editAccentSelect.value = state.profile.accentTheme || 'f1-red';
    el.editRaceModeInput.checked = !!state.profile.raceMode;
    el.profileModal.showModal();
  });

  el.profileEditForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.profile.name = el.editNameInput.value.trim();
    state.profile.nickname = el.editNicknameInput.value.trim();
    state.profile.accentTheme = el.editAccentSelect.value;
    state.profile.raceMode = el.editRaceModeInput.checked;
    persist();
    el.profileModal.close();
    render();
    toast('Profile updated');
  });

  el.raceModeToggle.addEventListener('change', () => {
    state.profile.raceMode = el.raceModeToggle.checked;
    persist();
    render();
  });

  el.seasonSelect.addEventListener('change', () => {
    selectedSeason = el.seasonSelect.value;
    render();
  });


  el.logoutBtn.addEventListener('click', () => {
    const ok = window.confirm('Log out and clear this local session?');
    if (!ok) return;
    localStorage.removeItem(STORAGE_KEY);
    state = { profile: null, seasons: {} };
    selectedSeason = getCurrentSeasonKey();
    document.body.classList.remove('race-mode', 'accent-f1-red', 'accent-ice-blue', 'accent-gold');
    el.dashboard.classList.add('hidden');
    el.profileSetup.classList.remove('hidden');
    el.profileForm.reset();
    el.accentSelect.value = 'f1-red';
    el.raceModeInput.checked = true;
    el.nameInput.focus();
    toast('Logged out');
  });

  el.logForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const type = document.querySelector('input[name="saleType"]:checked').value;
    const value = Number(el.valueInput.value);
    if (!value || value < 0) return;
    const date = el.dateInput.value || formatDateForInput(new Date());
    const timestamp = new Date().toISOString();
    const points = calcPoints({ type, value, timestamp });
    const season = date.slice(0, 7);
    if (!state.seasons[season]) state.seasons[season] = { logs: [] };
    state.seasons[season].logs.push({
      id: crypto.randomUUID(),
      date,
      type,
      value,
      notes: el.notesInput.value.trim(),
      timestamp,
      points,
      earlyBird: new Date(timestamp).getHours() < 12,
    });

    persist();
    selectedSeason = season;
    render();
    el.valueInput.value = '';
    el.notesInput.value = '';
    el.valueInput.focus();
    toast(state.profile.raceMode ? 'Lap registered' : 'Sale logged');
  });

  el.confirmDialog.addEventListener('close', () => {
    if (el.confirmDialog.returnValue === 'confirm' && pendingDeleteId) {
      for (const season of Object.values(state.seasons)) {
        season.logs = season.logs.filter((log) => log.id !== pendingDeleteId);
      }
      pendingDeleteId = null;
      persist();
      render();
      toast('Log removed');
    }
  });
}

function render() {
  applyTheme();
  renderSeasonOptions();
  const stats = getStatsForSeason(selectedSeason);
  const allStats = getAllTimeStats();
  renderTerms();
  renderRaceHub(stats);

  el.profileChip.textContent = state.profile.nickname || state.profile.name;
  el.totalPoints.textContent = formatNumber(stats.totalPoints);
  el.tierValue.textContent = String(Math.floor(stats.totalPoints / POINTS.tierSize) + 1);
  el.streakValue.textContent = String(stats.currentStreak);
  el.bestStreakValue.textContent = String(stats.bestStreak);
  el.progressLabel.textContent = `${stats.totalPoints % POINTS.tierSize} / ${POINTS.tierSize}`;
  el.progressBar.style.width = `${((stats.totalPoints % POINTS.tierSize) / POINTS.tierSize) * 100}%`;

  const label = selectedSeason === 'all-time' ? 'All-time' : friendlySeason(selectedSeason);
  const sessionPrefix = state.profile.raceMode ? 'Championship' : 'Session';
  el.sessionLine.textContent = `${sessionPrefix}: ${label}`;

  renderActivity(stats.latestLogs);
  renderBadges(stats, allStats);
  renderLeaderboard(stats.totalPoints);
}

function renderRaceHub(stats) {
  const upcomingRace = getUpcomingRace();
  if (upcomingRace) {
    el.nextRaceName.textContent = upcomingRace.name;
    el.nextRaceDate.textContent = new Date(upcomingRace.date).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    el.countdownLabel.textContent = formatCountdown(upcomingRace.date);
  } else {
    el.nextRaceName.textContent = 'Season complete';
    el.nextRaceDate.textContent = '--';
    el.countdownLabel.textContent = 'See you next year';
  }

  const wins = Math.floor(stats.totalPoints / 900);
  const average = stats.logsCount ? Math.round(stats.totalPoints / stats.logsCount) : 0;
  el.seasonWins.textContent = String(wins);
  el.avgPointsPerLog.textContent = String(average);
  el.paceLabel.textContent = average >= 130 ? 'Attack' : average >= 95 ? 'Balanced' : 'Build-up';
}

function getUpcomingRace() {
  const now = Date.now();
  return RACE_CALENDAR.find((race) => new Date(race.date).getTime() > now) || null;
}

function formatCountdown(dateISO) {
  const diff = new Date(dateISO).getTime() - Date.now();
  if (diff <= 0) return 'Live now';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h`;
}


function renderLeaderboard(myPoints) {
  const myName = state.profile.nickname || state.profile.name;
  const board = [
    { name: myName, points: myPoints, me: true },
    ...RIVAL_DRIVERS.map((rival, index) => {
      const seasonalBias = ((selectedSeason || '').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 160) - 80;
      const variation = (index * 47) - 70;
      const points = Math.max(120, rival.seed + seasonalBias + variation);
      return { name: rival.name, points, me: false };
    }),
  ].sort((a, b) => b.points - a.points);

  el.leaderboardList.innerHTML = '';
  board.forEach((entry, idx) => {
    const row = document.createElement('div');
    row.className = `leaderboard-row${entry.me ? ' me' : ''}`;
    row.innerHTML = `
      <span class="rank">#${idx + 1}</span>
      <span class="name">${entry.me ? '🫵' : '👤'} ${entry.name}</span>
      <span class="points">${formatNumber(entry.points)} pts</span>
    `;
    el.leaderboardList.append(row);
  });
}

function renderTerms() {
  const raceMode = !!state.profile.raceMode;
  el.logSubmit.textContent = raceMode ? 'Register Lap' : 'Log';
  const terms = {
    points: raceMode ? 'Race Points' : 'Points',
    level: raceMode ? 'Driver Tier' : 'Level',
    streak: raceMode ? 'Momentum' : 'Streak',
    season: raceMode ? 'Championship' : 'Season',
    log: raceMode ? 'Register Lap' : 'Log Sale',
  };
  document.querySelectorAll('[data-term]').forEach((node) => {
    node.textContent = terms[node.dataset.term] || node.textContent;
  });
}

function renderActivity(logs) {
  el.activityList.innerHTML = '';
  if (!logs.length) {
    el.activityList.innerHTML = `<p class="muted">No activity yet for this selection.</p>`;
    return;
  }

  logs.forEach((log) => {
    const row = document.createElement('div');
    row.className = 'activity-row';
    row.innerHTML = `
      <span>${log.date}</span>
      <span class="type-chip type-${log.type}">${saleTypeLabel(log.type)}</span>
      <span>${formatNumber(log.value)} NOK</span>
      <strong>+${log.points}</strong>
      <button class="btn ghost" data-delete-id="${log.id}" aria-label="Delete log">🗑</button>
    `;
    row.querySelector('button').addEventListener('click', () => {
      pendingDeleteId = log.id;
      el.confirmDialog.showModal();
    });
    el.activityList.append(row);
  });
}


function saleTypeLabel(type) {
  const labels = {
    new: '🏎️ New',
    used: '🔧 Used',
    ev: '⚡ EV',
  };
  return labels[type] || type.toUpperCase();
}

function renderBadges(stats, allStats) {
  const seasonBadges = BADGES.season.map((badge) => ({ ...badge, earned: badge.rule(stats, allStats) }));
  const consistency = BADGES.allTime[0];
  const all = [...seasonBadges, { ...consistency, earned: consistency.rule(stats, allStats), allTime: true }];
  const earnedIds = new Set(all.filter((b) => b.earned).map((b) => b.id));

  el.badgesGrid.innerHTML = '';
  all.forEach((badge) => {
    const node = document.createElement('article');
    node.className = `badge ${badge.earned ? 'earned' : 'locked'}`;
    if (badge.earned && !prevEarnedBadgeIds.has(badge.id)) {
      node.classList.add('pop');
      if (state.profile.raceMode) confettiBurst(node);
    }
    node.innerHTML = `<strong>${badge.icon || '🏆'} ${badge.label}</strong><p class="muted">${badge.allTime ? 'All-time' : 'Season'}</p>`;
    el.badgesGrid.append(node);
  });
  prevEarnedBadgeIds = earnedIds;
}

function confettiBurst(anchor) {
  const burst = document.createElement('div');
  burst.style.position = 'absolute';
  burst.style.inset = '0';
  burst.style.pointerEvents = 'none';
  burst.innerHTML = '<span style="position:absolute;right:6px;top:4px;color:var(--accent)">✦ ✦ ✦</span>';
  anchor.append(burst);
  setTimeout(() => burst.remove(), 900);
}

function renderSeasonOptions() {
  const monthKeys = Object.keys(state.seasons).sort().reverse();
  if (!monthKeys.includes(getCurrentSeasonKey())) ensureCurrentSeasonExists();
  const options = [...new Set([getCurrentSeasonKey(), ...Object.keys(state.seasons).sort().reverse()])];
  el.seasonSelect.innerHTML = options
    .map((key) => `<option value="${key}">${friendlySeason(key)}</option>`)
    .join('') + '<option value="all-time">All-time</option>';

  if (![...options, 'all-time'].includes(selectedSeason)) selectedSeason = getCurrentSeasonKey();
  el.seasonSelect.value = selectedSeason;
}

function getStatsForSeason(seasonKey) {
  if (seasonKey === 'all-time') {
    const logs = Object.values(state.seasons).flatMap((s) => s.logs);
    return computeStats(logs);
  }
  return computeStats(state.seasons[seasonKey]?.logs || []);
}

function getAllTimeStats() {
  const seasons = Object.entries(state.seasons).map(([key, value]) => ({ key, stats: computeStats(value.logs) }));
  const months1500Plus = seasons.filter((s) => s.stats.totalPoints >= 1500).length;
  return { months1500Plus };
}

function computeStats(logs) {
  const sorted = [...logs].sort((a, b) => (a.date < b.date ? -1 : 1));
  const totalPoints = sorted.reduce((sum, l) => sum + l.points, 0);
  const evCount = sorted.filter((l) => l.type === 'ev').length;
  const earlyBirdCount = sorted.filter((l) => l.earlyBird).length;

  const uniqueDays = [...new Set(sorted.map((l) => l.date))].sort();
  let bestStreak = 0;
  let currentStreak = 0;
  let running = 0;

  uniqueDays.forEach((day, idx) => {
    if (idx === 0) {
      running = 1;
    } else {
      const prev = new Date(uniqueDays[idx - 1]);
      const curr = new Date(day);
      const diffDays = Math.round((curr - prev) / 86_400_000);
      running = diffDays === 1 ? running + 1 : 1;
    }
    bestStreak = Math.max(bestStreak, running);
  });

  if (uniqueDays.length) {
    running = 1;
    for (let i = uniqueDays.length - 1; i > 0; i -= 1) {
      const prev = new Date(uniqueDays[i - 1]);
      const curr = new Date(uniqueDays[i]);
      const diffDays = Math.round((curr - prev) / 86_400_000);
      if (diffDays === 1) running += 1;
      else break;
    }
    const lastDate = uniqueDays[uniqueDays.length - 1];
    const today = formatDateForInput(new Date());
    const yesterday = formatDateForInput(new Date(Date.now() - 86_400_000));
    currentStreak = [today, yesterday].includes(lastDate) ? running : 0;
  }

  const latestLogs = [...sorted].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).slice(0, 10);
  return { totalPoints, evCount, earlyBirdCount, bestStreak, currentStreak, latestLogs };
}

function calcPoints({ type, value, timestamp }) {
  let points = POINTS.base[type] || 0;
  if (value > POINTS.highValueThreshold) points += POINTS.highValueBonus;
  if (new Date(timestamp).getHours() < 12) points += POINTS.earlyBirdBonus;
  return points;
}

function applyTheme() {
  document.body.classList.toggle('race-mode', !!state.profile.raceMode);
  document.body.classList.remove('accent-f1-red', 'accent-ice-blue', 'accent-gold');
  document.body.classList.add(`accent-${state.profile.accentTheme || 'f1-red'}`);
  el.raceModeToggle.checked = !!state.profile.raceMode;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { profile: null, seasons: {} };
  try {
    const parsed = JSON.parse(raw);
    return { profile: parsed.profile || null, seasons: parsed.seasons || {} };
  } catch {
    return { profile: null, seasons: {} };
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureCurrentSeasonExists() {
  const key = getCurrentSeasonKey();
  if (!state.seasons[key]) {
    state.seasons[key] = { logs: [] };
    persist();
  }
}

function getCurrentSeasonKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatDateForInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function friendlySeason(seasonKey) {
  if (seasonKey === 'all-time') return 'All-time';
  const [year, month] = seasonKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function formatNumber(value) {
  return new Intl.NumberFormat('nb-NO').format(value);
}

function toast(message) {
  el.toast.textContent = message;
  el.toast.classList.add('show');
  setTimeout(() => el.toast.classList.remove('show'), 1700);
}
