/**
 * TYPE//TANK Modern Defense - Main Application Controller
 */

class AppController {
  constructor() {
    this.currentScreen = 'login';
    this.wordManager = new WordManager();
    this.storage = window.storageManager;
    this.sound = window.soundEngine;
    this.game = null;
    this.currentLogFilter = 'all';

    this.initDOM();
    this.loadPreferences();
    this.bindEvents();
    this.showScreen('login');
  }

  initDOM() {
    // Containers & Screens
    this.cabinet = document.getElementById('arcade-cabinet');
    this.screens = {
      login: document.getElementById('screen-login'),
      settings: document.getElementById('screen-settings'),
      instructions: document.getElementById('screen-instructions'),
      game: document.getElementById('screen-game'),
      result: document.getElementById('screen-result'),
      records: document.getElementById('screen-records')
    };

    // Header HUD controls
    this.callsignDisplay = document.getElementById('hud-callsign');
    this.btnSwitchCallsign = document.getElementById('btn-switch-callsign');
    this.btnAspectAuto = document.getElementById('btn-aspect-auto');
    this.btnAspect169 = document.getElementById('btn-aspect-169');
    this.btnAspect43 = document.getElementById('btn-aspect-43');
    this.btnToggleCrt = document.getElementById('btn-toggle-crt');
    this.btnToggleMute = document.getElementById('btn-toggle-mute');
    this.themePills = document.querySelectorAll('.btn-theme-pill');

    // Login Elements
    this.inputCallsign = document.getElementById('input-callsign');
    this.btnLoginSubmit = document.getElementById('btn-login-submit');
    this.btnQuickPlay = document.getElementById('btn-quick-play');

    // Settings Elements
    this.modeCards = document.querySelectorAll('.mode-card');
    this.chkUppercase = document.getElementById('chk-uppercase');
    this.chkNumbers = document.getElementById('chk-numbers');
    this.chkSpecials = document.getElementById('chk-specials');
    this.previewWordsContainer = document.getElementById('preview-words-list');
    this.objectiveCards = document.querySelectorAll('.objective-card');
    this.btnSettingsStart = document.getElementById('btn-settings-start');
    this.btnSettingsBack = document.getElementById('btn-settings-back');

    // Instructions Elements
    this.btnEngageGame = document.getElementById('btn-engage-game');
    this.btnInstructionsBack = document.getElementById('btn-instructions-back');

    // In-Game HUD Elements
    this.canvas = document.getElementById('game-canvas');
    this.hudScore = document.getElementById('game-hud-score');
    this.hudHealthFill = document.getElementById('game-hud-health-fill');
    this.hudHealthVal = document.getElementById('game-hud-health-val');
    this.hudWpm = document.getElementById('game-hud-wpm');
    this.hudAcc = document.getElementById('game-hud-acc');
    this.hudCombo = document.getElementById('game-hud-combo');
    this.hudModeBadge = document.getElementById('game-hud-mode-badge');
    this.hudObjectiveBadge = document.getElementById('game-hud-objective-badge');
    this.pauseModal = document.getElementById('modal-pause');
    this.btnResume = document.getElementById('btn-resume');
    this.btnAbort = document.getElementById('btn-abort');

    // Result Elements
    this.resultRecordBanner = document.getElementById('result-record-banner');
    this.resultScore = document.getElementById('result-score');
    this.resultWpm = document.getElementById('result-wpm');
    this.resultAcc = document.getElementById('result-acc');
    this.resultWords = document.getElementById('result-words');
    this.resultCombo = document.getElementById('result-combo');
    this.resultModeBadge = document.getElementById('result-mode-badge');
    this.resultDeltaMsg = document.getElementById('result-delta-msg');
    this.btnResultPlayAgain = document.getElementById('btn-result-play-again');
    this.btnResultRecords = document.getElementById('btn-result-records');
    this.btnResultSettings = document.getElementById('btn-result-settings');
    this.confettiCanvas = document.getElementById('confetti-canvas');

    // Records Elements
    this.statLifetimeSorties = document.getElementById('stat-lifetime-sorties');
    this.statLifetimeWords = document.getElementById('stat-lifetime-words');
    this.statLifetimePeakWpm = document.getElementById('stat-lifetime-peak-wpm');
    this.statLifetimePeakScore = document.getElementById('stat-lifetime-peak-score');
    this.quadModeBests = document.getElementById('quad-mode-bests');
    this.recordsTableBody = document.getElementById('records-table-body');
    this.btnRecordsBack = document.getElementById('btn-records-back');
    this.btnClearLogs = document.getElementById('btn-clear-logs');
    this.filterTabs = document.querySelectorAll('.filter-tab');

    // Initialize Canvas Game Engine
    this.game = new GameEngine(this.canvas, this.wordManager, this.sound, {
      onStatsUpdate: (stats) => this.updateInGameHUD(stats),
      onGameOver: (results) => this.handleGameOver(results)
    });
  }

  loadPreferences() {
    // Callsign
    const callsign = this.storage.getCallsign();
    this.callsignDisplay.textContent = callsign;
    this.inputCallsign.value = callsign;

    // Aspect Ratio
    const aspect = this.storage.getAspectRatio();
    this.setAspectRatio(aspect);

    // CRT Mode
    const crt = this.storage.isCrtEnabled();
    this.setCrtMode(crt);

    // Visual Theme
    const theme = this.storage.getTheme();
    this.setTheme(theme);

    // Audio Mute
    this.updateMuteButtonUI();

    // Game Objective
    const obj = this.storage.getGameObjective();
    this.selectObjective(obj);

    // Mode
    const savedMode = this.storage.getMode();
    this.selectMode(savedMode);
  }

  selectObjective(obj) {
    const target = (obj === 'car' || obj === 'racer') ? 'car' : 'tank';
    this.gameObjective = target;
    this.storage.setGameObjective(this.gameObjective);
    this.objectiveCards.forEach(card => {
      if (card.dataset.obj === this.gameObjective) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  }

  setTheme(themeName) {
    const valid = ['cyber-neon', 'zen-emerald', 'solar-sunset', 'oled-frost'];
    const selected = valid.includes(themeName) ? themeName : 'cyber-neon';
    this.storage.setTheme(selected);
    document.body.dataset.theme = selected;
    this.themePills.forEach(pill => {
      if (pill.dataset.theme === selected) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
    if (this.game) {
      this.game.updateTheme(selected);
    }
  }

  bindEvents() {
    // Objective Cards
    this.objectiveCards.forEach(card => {
      card.addEventListener('click', () => {
        this.sound.uiClick();
        this.selectObjective(card.dataset.obj);
      });
    });

    // Theme Selector
    this.themePills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.sound.uiClick();
        this.setTheme(pill.dataset.theme);
      });
    });

    // Header HUD
    this.btnAspectAuto.addEventListener('click', () => this.setAspectRatio('auto'));
    this.btnAspect169.addEventListener('click', () => this.setAspectRatio('16-9'));
    this.btnAspect43.addEventListener('click', () => this.setAspectRatio('4-3'));

    this.btnToggleCrt.addEventListener('click', () => {
      this.sound.uiClick();
      const enabled = !this.storage.isCrtEnabled();
      this.setCrtMode(enabled);
    });

    this.btnToggleMute.addEventListener('click', () => {
      this.sound.toggleMute();
      this.updateMuteButtonUI();
    });

    this.btnSwitchCallsign.addEventListener('click', () => {
      this.sound.uiClick();
      this.showScreen('login');
    });

    // Login screen
    if (this.btnQuickPlay) {
      this.btnQuickPlay.addEventListener('click', () => {
        this.sound.uiClick();
        this.submitLogin();
        this.startGame();
      });
    }

    this.btnLoginSubmit.addEventListener('click', () => this.submitLogin());
    this.inputCallsign.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.submitLogin();
    });

    // Settings screen
    this.modeCards.forEach(card => {
      card.addEventListener('click', () => {
        this.sound.uiClick();
        const mode = parseInt(card.dataset.mode, 10);
        this.selectMode(mode);
      });
    });

    const onToggleChange = () => {
      this.sound.uiClick();
      this.wordManager.setCustomToggles(
        this.chkUppercase.checked,
        this.chkNumbers.checked,
        this.chkSpecials.checked
      );
      this.storage.setMode(this.wordManager.mode);
      this.updateModeCardsUI();
      this.updateWordPreviews();
    };

    this.chkUppercase.addEventListener('change', onToggleChange);
    this.chkNumbers.addEventListener('change', onToggleChange);
    this.chkSpecials.addEventListener('change', onToggleChange);

    this.btnSettingsStart.addEventListener('click', () => {
      this.sound.uiClick();
      this.showScreen('instructions');
    });

    this.btnSettingsBack.addEventListener('click', () => {
      this.sound.uiClick();
      this.showScreen('login');
    });

    // Instructions screen
    this.btnEngageGame.addEventListener('click', () => {
      this.sound.uiClick();
      this.startGame();
    });

    this.btnInstructionsBack.addEventListener('click', () => {
      this.sound.uiClick();
      this.showScreen('settings');
    });

    // Pause Modal
    this.btnResume.addEventListener('click', () => {
      this.sound.uiClick();
      this.pauseModal.classList.add('hidden');
      this.game.resume();
    });

    this.btnAbort.addEventListener('click', () => {
      this.sound.uiClick();
      this.pauseModal.classList.add('hidden');
      this.game.stop();
      this.showScreen('settings');
    });

    // Result screen
    this.btnResultPlayAgain.addEventListener('click', () => {
      this.sound.uiClick();
      this.startGame();
    });

    this.btnResultRecords.addEventListener('click', () => {
      this.sound.uiClick();
      this.showScreen('records');
    });

    this.btnResultSettings.addEventListener('click', () => {
      this.sound.uiClick();
      this.showScreen('settings');
    });

    // Records screen
    this.btnRecordsBack.addEventListener('click', () => {
      this.sound.uiClick();
      this.showScreen('settings');
    });

    this.btnClearLogs.addEventListener('click', () => {
      if (confirm('CONFIRM PURGE: Clear all flight records and operational logs?')) {
        this.sound.uiClick();
        this.storage.clearLogs();
        this.renderRecordsScreen();
      }
    });

    this.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.sound.uiClick();
        this.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentLogFilter = tab.dataset.filter;
        this.renderFlightLogTable();
      });
    });

    // Global Keyboard Routing
    window.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
    window.addEventListener('resize', () => {
      if (this.game && this.currentScreen === 'game') {
        this.game.handleResize();
      }
    });
  }

  setAspectRatio(ratio) {
    this.sound.uiClick();
    this.storage.setAspectRatio(ratio);

    this.cabinet.classList.remove('aspect-auto', 'aspect-16-9', 'aspect-4-3');
    this.btnAspectAuto.classList.remove('active');
    this.btnAspect169.classList.remove('active');
    this.btnAspect43.classList.remove('active');

    if (ratio === '16-9') {
      this.cabinet.classList.add('aspect-16-9');
      this.btnAspect169.classList.add('active');
    } else if (ratio === '4-3') {
      this.cabinet.classList.add('aspect-4-3');
      this.btnAspect43.classList.add('active');
    } else {
      this.cabinet.classList.add('aspect-auto');
      this.btnAspectAuto.classList.add('active');
    }

    if (this.game) {
      setTimeout(() => this.game.handleResize(), 50);
    }
  }

  setCrtMode(enabled) {
    this.storage.setCrtEnabled(enabled);
    if (enabled) {
      document.body.classList.add('crt-mode');
      this.btnToggleCrt.classList.add('active');
      this.btnToggleCrt.textContent = 'CRT: ON';
    } else {
      document.body.classList.remove('crt-mode');
      this.btnToggleCrt.classList.remove('active');
      this.btnToggleCrt.textContent = 'CRT: OFF';
    }
  }

  updateMuteButtonUI() {
    const isMuted = this.sound.isMuted();
    if (isMuted) {
      this.btnToggleMute.textContent = 'AUDIO: MUTED';
      this.btnToggleMute.classList.add('muted');
    } else {
      this.btnToggleMute.textContent = 'AUDIO: ON';
      this.btnToggleMute.classList.remove('muted');
    }
  }

  showScreen(screenName) {
    this.currentScreen = screenName;
    Object.keys(this.screens).forEach(key => {
      if (key === screenName) {
        this.screens[key].classList.remove('hidden');
      } else {
        this.screens[key].classList.add('hidden');
      }
    });

    if (screenName === 'records') {
      this.renderRecordsScreen();
    } else if (screenName === 'settings') {
      this.updateWordPreviews();
    }
  }

  submitLogin() {
    this.sound.uiClick();
    const val = this.inputCallsign.value.trim() || 'CYBER-01';
    const clean = this.storage.setCallsign(val);
    this.callsignDisplay.textContent = clean;
    this.showScreen('settings');
  }

  selectMode(modeNum) {
    this.wordManager.setMode(modeNum);
    this.storage.setMode(modeNum);

    // Sync checkboxes
    this.chkUppercase.checked = this.wordManager.options.uppercase;
    this.chkNumbers.checked = this.wordManager.options.numbers;
    this.chkSpecials.checked = this.wordManager.options.specials;

    this.updateModeCardsUI();
    this.updateWordPreviews();
  }

  updateModeCardsUI() {
    const current = this.wordManager.mode;
    this.modeCards.forEach(card => {
      const m = parseInt(card.dataset.mode, 10);
      if (m === current) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  }

  updateWordPreviews() {
    const samples = this.wordManager.getSampleWords(this.wordManager.mode, 6);
    this.previewWordsContainer.innerHTML = '';
    samples.forEach(s => {
      const chip = document.createElement('span');
      chip.className = 'sample-chip';
      chip.textContent = s;
      this.previewWordsContainer.appendChild(chip);
    });
  }

  startGame() {
    this.showScreen('game');
    this.pauseModal.classList.add('hidden');
    this.hudModeBadge.textContent = `MODE ${this.wordManager.mode}`;

    const objLabels = {
      tank: 'TURRET DEFENSE',
      car: 'HIGHWAY RUNNER'
    };
    if (this.hudObjectiveBadge) {
      this.hudObjectiveBadge.textContent = objLabels[this.gameObjective] || 'TURRET DEFENSE';
    }

    // Reset HUD
    this.updateInGameHUD({
      score: 0,
      health: 100,
      maxHealth: 100,
      combo: 0,
      wpm: 0,
      accuracy: 100,
      gameMode: this.gameObjective
    });

    // Start engine with selected game objective ('tank' or 'car')
    setTimeout(() => {
      this.game.start(this.gameObjective);
    }, 50);
  }

  updateInGameHUD(stats) {
    this.hudScore.textContent = stats.score.toString().padStart(6, '0');

    // Health bar & reactive color
    this.hudHealthFill.style.width = `${Math.max(0, stats.health)}%`;
    this.hudHealthVal.textContent = `${Math.round(stats.health)}%`;

    if (stats.health > 50) {
      this.hudHealthFill.style.background = 'linear-gradient(90deg, #00ff88, #00f0ff)';
    } else if (stats.health > 25) {
      this.hudHealthFill.style.background = 'linear-gradient(90deg, #ffaa00, #ff5500)';
    } else {
      this.hudHealthFill.style.background = 'linear-gradient(90deg, #ff0055, #ff3300)';
    }

    this.hudWpm.textContent = stats.wpm;
    this.hudAcc.textContent = `${stats.accuracy}%`;

    if (this.hudObjectiveBadge) {
      if (stats.gameMode === 'car') {
        const laneNum = this.game ? (this.game.playerLane + 1) : 2;
        this.hudObjectiveBadge.textContent = `RUNNER [LANE ${laneNum}]`;
      } else {
        this.hudObjectiveBadge.textContent = `TURRET DEFENSE`;
      }
    }

    if (stats.combo > 1) {
      this.hudCombo.textContent = `${stats.combo}X`;
      this.hudCombo.parentElement.classList.add('active');
    } else {
      this.hudCombo.textContent = '0X';
      this.hudCombo.parentElement.classList.remove('active');
    }
  }

  handleGameOver(results) {
    const isPB = this.storage.isPersonalBest(results.mode, results.score);
    const oldPB = this.storage.getModePersonalBest(results.mode);

    // Save sortie record
    this.storage.saveFlightLog(results);

    // Populate Debrief Screen
    this.resultScore.textContent = results.score.toLocaleString();
    this.resultWpm.textContent = results.wpm;
    this.resultAcc.textContent = `${results.accuracy}%`;
    this.resultWords.textContent = results.wordsDestroyed;
    this.resultCombo.textContent = `${results.maxCombo}x`;
    this.resultModeBadge.textContent = `MODE ${results.mode}`;

    if (isPB && results.score > 0) {
      this.resultRecordBanner.classList.remove('hidden');
      this.resultDeltaMsg.textContent = oldPB.score > 0
        ? `★ SURPASSED PREVIOUS RECORD BY +${results.score - oldPB.score} PTS!`
        : '★ FIRST SORTIE RECORD LOGGED!';
      this.sound.recordFanfare();
      this.triggerConfetti();
    } else {
      this.resultRecordBanner.classList.add('hidden');
      const diff = oldPB.score - results.score;
      this.resultDeltaMsg.textContent = diff > 0
        ? `PERSONAL BEST: ${oldPB.score.toLocaleString()} PTS (${diff.toLocaleString()} to beat)`
        : `MATCHED PERSONAL BEST: ${oldPB.score.toLocaleString()} PTS`;
    }

    this.showScreen('result');
  }

  triggerConfetti() {
    const c = this.confettiCanvas;
    const ctx = c.getContext('2d');
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    const confettiPieces = [];
    const colors = ['#00f0ff', '#ff0055', '#00ff88', '#ffaa00', '#ffffff'];

    for (let i = 0; i < 120; i++) {
      confettiPieces.push({
        x: c.width / 2,
        y: c.height * 0.4,
        vx: (Math.random() - 0.5) * 800,
        vy: -300 - Math.random() * 400,
        gravity: 600,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 6,
        life: 2.2
      });
    }

    let lastT = performance.now();
    const renderConfetti = (t) => {
      const dt = (t - lastT) / 1000;
      lastT = t;
      ctx.clearRect(0, 0, c.width, c.height);

      let alive = false;
      for (const p of confettiPieces) {
        if (p.life > 0) {
          alive = true;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += p.gravity * dt;
          p.rot += p.rotSpeed * dt;
          p.life -= dt;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.life / 2.2);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
          ctx.restore();
        }
      }

      if (alive) {
        requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, c.width, c.height);
      }
    };

    requestAnimationFrame(renderConfetti);
  }

  renderRecordsScreen() {
    const stats = this.storage.getLifetimeStats();
    this.statLifetimeSorties.textContent = stats.totalSorties;
    this.statLifetimeWords.textContent = stats.totalWords;
    this.statLifetimePeakWpm.textContent = stats.peakWpm;
    this.statLifetimePeakScore.textContent = stats.peakScore.toLocaleString();

    // Mode Bests Quad
    this.quadModeBests.innerHTML = '';
    const modeNames = ['ALPHA (LOWER)', 'BRAVO (MIXED)', 'CHARLIE (NUMS)', 'DELTA (SPEC)'];
    for (let m = 1; m <= 4; m++) {
      const pb = this.storage.getModePersonalBest(m);
      const card = document.createElement('div');
      card.className = 'mode-pb-card';
      card.innerHTML = `
        <div class="pb-mode-title">MODE ${m}: ${modeNames[m - 1]}</div>
        <div class="pb-score">${pb.score.toLocaleString()} <span class="pb-unit">PTS</span></div>
        <div class="pb-sub">PEAK WPM: <strong>${pb.wpm}</strong> | ACC: <strong>${pb.accuracy}%</strong></div>
      `;
      this.quadModeBests.appendChild(card);
    }

    this.renderFlightLogTable();
  }

  renderFlightLogTable() {
    const logs = this.storage.getLogs();
    const filter = this.currentLogFilter;
    const filtered = filter === 'all'
      ? logs
      : logs.filter(l => l.mode.toString() === filter);

    this.recordsTableBody.innerHTML = '';

    if (filtered.length === 0) {
      this.recordsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-table-msg">NO FLIGHT LOGS RECORDED FOR THIS CRITERIA</td>
        </tr>
      `;
      return;
    }

    filtered.forEach(log => {
      const tr = document.createElement('tr');
      const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const pbTag = log.isPB ? '<span class="pb-badge">★ PB</span>' : '';

      tr.innerHTML = `
        <td>${timeStr}</td>
        <td><span class="mode-tag-pill">M${log.mode}</span></td>
        <td><strong>${log.score.toLocaleString()}</strong> ${pbTag}</td>
        <td>${log.wpm}</td>
        <td>${log.accuracy}%</td>
        <td>${log.maxCombo}x</td>
        <td>${log.wordsDestroyed}</td>
      `;
      this.recordsTableBody.appendChild(tr);
    });
  }

  handleGlobalKeyDown(e) {
    // 1. In-game typing interception
    if (this.currentScreen === 'game') {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (this.game.isPaused) {
          this.pauseModal.classList.add('hidden');
          this.game.resume();
        } else {
          this.game.pause();
          this.pauseModal.classList.remove('hidden');
        }
        return;
      }

      // If paused, don't type
      if (this.game.isPaused) return;

      // Allow single typing character keys
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        this.game.handleKeyPress(e.key);
      }
      return;
    }

    // 2. Global Hotkeys for navigation
    if (this.currentScreen === 'instructions') {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.btnEngageGame.click();
      }
    } else if (this.currentScreen === 'result') {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.btnResultPlayAgain.click();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        this.btnResultRecords.click();
      }
    } else if (this.currentScreen === 'settings') {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.btnSettingsStart.click();
      }
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
