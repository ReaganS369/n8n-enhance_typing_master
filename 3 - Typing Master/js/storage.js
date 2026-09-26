/**
 * TYPE//TANK Modern Defense - Local Storage & Performance Logs
 */

class StorageManager {
  constructor() {
    this.KEYS = {
      CALLSIGN: 'typetank_callsign',
      ASPECT_RATIO: 'typetank_aspect_ratio',
      CRT_ENABLED: 'typetank_crt_enabled',
      MODE: 'typetank_mode',
      THEME: 'typetank_theme',
      GAME_OBJECTIVE: 'typetank_game_objective',
      FLIGHT_LOGS: 'typetank_flight_logs'
    };
  }

  // Game Mode ('tank' or 'car')
  getGameObjective() {
    const val = localStorage.getItem(this.KEYS.GAME_OBJECTIVE);
    if (val === 'car' || val === 'racer') return 'car';
    return 'tank';
  }

  setGameObjective(obj) {
    const clean = (obj === 'car' || obj === 'racer') ? 'car' : 'tank';
    localStorage.setItem(this.KEYS.GAME_OBJECTIVE, clean);
  }

  // Visual Theme ('cyber-neon', 'zen-emerald', 'solar-sunset', 'oled-frost')
  getTheme() {
    return localStorage.getItem(this.KEYS.THEME) || 'cyber-neon';
  }

  setTheme(theme) {
    localStorage.setItem(this.KEYS.THEME, theme);
  }

  // Operator Callsign
  getCallsign() {
    return localStorage.getItem(this.KEYS.CALLSIGN) || 'CYBER-01';
  }

  setCallsign(callsign) {
    const clean = (callsign || 'CYBER-01').trim().toUpperCase().substring(0, 16);
    localStorage.setItem(this.KEYS.CALLSIGN, clean);
    return clean;
  }

  // Aspect Ratio ('auto', '16-9', '4-3')
  getAspectRatio() {
    return localStorage.getItem(this.KEYS.ASPECT_RATIO) || 'auto';
  }

  setAspectRatio(ratio) {
    localStorage.setItem(this.KEYS.ASPECT_RATIO, ratio);
  }

  // CRT Scanlines Visual Style Toggle
  isCrtEnabled() {
    return localStorage.getItem(this.KEYS.CRT_ENABLED) === 'true';
  }

  setCrtEnabled(enabled) {
    localStorage.setItem(this.KEYS.CRT_ENABLED, enabled ? 'true' : 'false');
  }

  // Arsenal Mode (1, 2, 3, 4)
  getMode() {
    const m = parseInt(localStorage.getItem(this.KEYS.MODE), 10);
    return isNaN(m) ? 1 : Math.max(1, Math.min(4, m));
  }

  setMode(mode) {
    localStorage.setItem(this.KEYS.MODE, mode);
  }

  // Flight Logs / Records
  getLogs() {
    try {
      const data = localStorage.getItem(this.KEYS.FLIGHT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Error reading flight logs:', e);
      return [];
    }
  }

  // Check if a score/WPM qualifies as personal best for given mode
  isPersonalBest(mode, score) {
    const logs = this.getLogs();
    const modeLogs = logs.filter(l => l.mode === mode);
    if (modeLogs.length === 0) return true;
    const maxScore = Math.max(...modeLogs.map(l => l.score || 0));
    return score > maxScore;
  }

  getModePersonalBest(mode) {
    const logs = this.getLogs();
    const modeLogs = logs.filter(l => l.mode === mode);
    if (modeLogs.length === 0) {
      return { score: 0, wpm: 0, accuracy: 0 };
    }
    let bestScore = 0;
    let bestWpm = 0;
    let bestAcc = 0;
    for (const log of modeLogs) {
      if (log.score > bestScore) bestScore = log.score;
      if (log.wpm > bestWpm) bestWpm = log.wpm;
      if (log.accuracy > bestAcc) bestAcc = log.accuracy;
    }
    return { score: bestScore, wpm: bestWpm, accuracy: bestAcc };
  }

  saveFlightLog(entry) {
    const logs = this.getLogs();
    const isPB = this.isPersonalBest(entry.mode, entry.score);

    const logEntry = {
      id: 'sortie_' + Date.now(),
      timestamp: new Date().toISOString(),
      callsign: this.getCallsign(),
      mode: entry.mode,
      score: Math.round(entry.score),
      wpm: Math.round(entry.wpm),
      accuracy: Math.round(entry.accuracy),
      maxCombo: entry.maxCombo || 0,
      wordsDestroyed: entry.wordsDestroyed || 0,
      isPB: isPB
    };

    logs.unshift(logEntry);
    // Keep last 100 entries
    if (logs.length > 100) logs.pop();

    try {
      localStorage.setItem(this.KEYS.FLIGHT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.warn('Error saving flight log:', e);
    }

    return logEntry;
  }

  getLifetimeStats() {
    const logs = this.getLogs();
    if (logs.length === 0) {
      return {
        totalSorties: 0,
        totalWords: 0,
        peakWpm: 0,
        peakScore: 0,
        avgAccuracy: 0
      };
    }

    let totalWords = 0;
    let peakWpm = 0;
    let peakScore = 0;
    let sumAcc = 0;

    logs.forEach(l => {
      totalWords += l.wordsDestroyed || 0;
      if (l.wpm > peakWpm) peakWpm = l.wpm;
      if (l.score > peakScore) peakScore = l.score;
      sumAcc += l.accuracy || 0;
    });

    return {
      totalSorties: logs.length,
      totalWords: totalWords,
      peakWpm: peakWpm,
      peakScore: peakScore,
      avgAccuracy: Math.round(sumAcc / logs.length)
    };
  }

  clearLogs() {
    localStorage.removeItem(this.KEYS.FLIGHT_LOGS);
  }
}

window.storageManager = new StorageManager();
