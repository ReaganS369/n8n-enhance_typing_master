/**
 * ==========================================================================
 * Minimalist Pastel Pomodoro Focus Dashboard Engine
 * ==========================================================================
 */

// ==========================================================================
// 1. Settings & Configurations
// ==========================================================================

/**
 * Default timer configurations (in minutes) and automation preferences.
 * @type {Readonly<{focusDuration: number, shortBreakDuration: number, longBreakDuration: number, autoStartBreaks: boolean, autoStartFocus: boolean}>}
 */
const DEFAULT_SETTINGS = Object.freeze({
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  autoStartFocus: false
});

/** @type {{focusDuration: number, shortBreakDuration: number, longBreakDuration: number, autoStartBreaks: boolean, autoStartFocus: boolean}} */
let settings = { ...DEFAULT_SETTINGS };
try {
  const savedSettings = localStorage.getItem('pomodoro_settings');
  if (savedSettings) {
    settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
  }
} catch (e) {
  settings = { ...DEFAULT_SETTINGS };
}

/**
 * Persists user timer and automation settings to localStorage.
 * @returns {void}
 */
function saveSettings() {
  try {
    localStorage.setItem('pomodoro_settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

/**
 * Generates the configuration dictionary for all timer modes (durations in seconds, labels, messages).
 * @returns {Record<string, {name: string, label: string, duration: number, hint: string, runningHint: string, completedHint: string}>}
 */
function getModesConfig() {
  return {
    focus: {
      name: 'focus',
      label: 'Focus Session',
      duration: settings.focusDuration * 60,
      hint: 'Ready to focus',
      runningHint: 'Stay in the flow',
      completedHint: 'Great work! Time for a break.'
    },
    shortBreak: {
      name: 'shortBreak',
      label: 'Short Break',
      duration: settings.shortBreakDuration * 60,
      hint: 'Take a breath',
      runningHint: 'Relax and recharge',
      completedHint: 'Break over! Ready to focus?'
    },
    longBreak: {
      name: 'longBreak',
      label: 'Long Break',
      duration: settings.longBreakDuration * 60,
      hint: 'Well-deserved rest',
      runningHint: 'Unwind completely',
      completedHint: 'Long break finished!'
    }
  };
}

let MODES = getModesConfig();

// ==========================================================================
// 2. DOM Elements
// ==========================================================================

// Header & Controls
const soundToggle = document.getElementById('soundToggle');
const themeToggle = document.getElementById('themeToggle');
const settingsBtn = document.getElementById('settingsBtn');
const tabButtons = document.querySelectorAll('.tab-btn');
const timerPanel = document.getElementById('timerPanel');
const timeDisplay = document.getElementById('timeDisplay');
const modeLabel = document.getElementById('modeLabel');
const statusHint = document.getElementById('statusHint');
const startPauseBtn = document.getElementById('startPauseBtn');
const startPauseText = document.getElementById('startPauseText');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const resetBtn = document.getElementById('resetBtn');
const progressRing = document.getElementById('progressRing');
const clockCard = document.querySelector('.clock-card');

// Active Task Spotlight
const activeTaskSpotlight = document.getElementById('activeTaskSpotlight');
const spotlightTaskText = document.getElementById('spotlightTaskText');
const clearSpotlightBtn = document.getElementById('clearSpotlightBtn');

// Task Tracker
const addTaskForm = document.getElementById('addTaskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyTasks = document.getElementById('emptyTasks');
const taskStats = document.getElementById('taskStats');

// Analytics Elements
const streakBadge = document.getElementById('streakBadge');
const todayFocusTime = document.getElementById('todayFocusTime');
const todaySessions = document.getElementById('todaySessions');
const weeklyBarChart = document.getElementById('weeklyBarChart');
const weeklyTotalHint = document.getElementById('weeklyTotalHint');

// Ambient Sound Elements
const muteAllSoundsBtn = document.getElementById('muteAllSoundsBtn');
const soundChannels = document.querySelectorAll('.sound-channel');

// Settings Modal
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsForm = document.getElementById('settingsForm');
const focusDurationInput = document.getElementById('focusDuration');
const shortBreakDurationInput = document.getElementById('shortBreakDuration');
const longBreakDurationInput = document.getElementById('longBreakDuration');
const autoStartBreaksInput = document.getElementById('autoStartBreaks');
const autoStartFocusInput = document.getElementById('autoStartFocus');
const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');

// ==========================================================================
// 3. State Variables
// ==========================================================================

const RING_RADIUS = 136;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 854.513px

let currentMode = 'focus';
let totalDuration = MODES[currentMode].duration;
let remainingSeconds = totalDuration;
let timerInterval = null;
let isRunning = false;
let isMuted = false;
let targetEndTime = null;
let autoStartTimeout = null;
let completedFocusSessionsCount = 0;

// Tasks state
let tasks = [];
let activeTaskId = null;
try {
  const storedTasks = localStorage.getItem('pomodoro_tasks');
  tasks = storedTasks ? JSON.parse(storedTasks) : [];
  activeTaskId = localStorage.getItem('pomodoro_active_task') || null;
} catch (e) {
  tasks = [];
}

// Analytics state
let analytics = { history: {} };
try {
  const storedAnalytics = localStorage.getItem('pomodoro_analytics');
  if (storedAnalytics) {
    analytics = JSON.parse(storedAnalytics);
  }
} catch (e) {
  analytics = { history: {} };
}

// ==========================================================================
// 4. Date Helpers
// ==========================================================================

/**
 * Formats a Date object into a YYYY-MM-DD string key.
 * @param {Date} date - The date to format.
 * @returns {string} Formatted date key (e.g., "2026-09-22").
 */
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns today's date formatted as a YYYY-MM-DD string key.
 * @returns {string} Today's date key.
 */
function getTodayKey() {
  return formatDateKey(new Date());
}

// ==========================================================================
// 5. Timer Logic & Formatting
// ==========================================================================

/**
 * Formats a duration in seconds into standard MM:SS display format.
 * Clamps negative numbers to zero.
 * @param {number} seconds - Number of seconds remaining.
 * @returns {string} Padded time string (e.g., "25:00").
 */
function formatTime(seconds) {
  const clamped = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Updates the SVG circular progress ring stroke offset.
 * @param {number} fraction - Ratio of remaining time between 0.0 and 1.0.
 * @returns {void}
 */
function setProgress(fraction) {
  const clampedFraction = Math.max(0, Math.min(1, fraction));
  const offset = RING_CIRCUMFERENCE * (1 - clampedFraction);
  progressRing.style.strokeDashoffset = `${offset}px`;
}

/**
 * Refreshes the countdown text display, progress ring, and browser document title.
 * @returns {void}
 */
function updateDisplay() {
  timeDisplay.textContent = formatTime(remainingSeconds);
  const fraction = totalDuration > 0 ? remainingSeconds / totalDuration : 0;
  setProgress(fraction);

  const modeObj = MODES[currentMode];
  document.title = `${formatTime(remainingSeconds)} • ${modeObj.label}`;
}

/**
 * Main timer tick function triggered by setInterval.
 * Calculates exact remaining time via Date.now() to prevent drift.
 * @returns {void}
 */
function tick() {
  const now = Date.now();
  const diffMs = targetEndTime - now;
  const remaining = Math.max(0, diffMs / 1000);

  remainingSeconds = remaining;
  updateDisplay();

  if (remainingSeconds <= 0) {
    completeTimer();
  }
}

/**
 * Clears any pending auto-start timeout to eliminate race conditions.
 * @returns {void}
 */
function clearAutoStartTimeout() {
  if (autoStartTimeout) {
    clearTimeout(autoStartTimeout);
    autoStartTimeout = null;
  }
}

/**
 * Starts the countdown timer and unlocks audio capabilities.
 * @returns {void}
 */
function startTimer() {
  if (isRunning) return;

  clearAutoStartTimeout();
  initOrResumeAudio();

  targetEndTime = Date.now() + remainingSeconds * 1000;
  isRunning = true;
  timerInterval = setInterval(tick, 200);

  startPauseText.textContent = 'Pause';
  playIcon.classList.add('hidden');
  pauseIcon.classList.remove('hidden');
  startPauseBtn.setAttribute('aria-label', 'Pause Timer');
  statusHint.textContent = MODES[currentMode].runningHint;
}

/**
 * Pauses the countdown timer without resetting progress.
 * @returns {void}
 */
function pauseTimer() {
  if (!isRunning) return;

  clearAutoStartTimeout();
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;

  // Accurately lock remaining time on pause
  if (targetEndTime) {
    remainingSeconds = Math.max(0, (targetEndTime - Date.now()) / 1000);
    targetEndTime = null;
  }

  startPauseText.textContent = 'Resume';
  playIcon.classList.remove('hidden');
  pauseIcon.classList.add('hidden');
  startPauseBtn.setAttribute('aria-label', 'Resume Timer');
  statusHint.textContent = 'Paused';
}

/**
 * Toggles the timer between active and paused states.
 * @returns {void}
 */
function toggleStartPause() {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

/**
 * Resets the timer back to the start duration of the current mode.
 * @returns {void}
 */
function resetTimer() {
  clearAutoStartTimeout();
  pauseTimer();
  remainingSeconds = totalDuration;
  startPauseText.textContent = 'Start';
  playIcon.classList.remove('hidden');
  pauseIcon.classList.add('hidden');
  startPauseBtn.setAttribute('aria-label', 'Start Timer');
  statusHint.textContent = MODES[currentMode].hint;
  clockCard.classList.remove('completed');
  updateDisplay();
}

/**
 * Switches between timer modes (focus, shortBreak, longBreak).
 * @param {'focus'|'shortBreak'|'longBreak'} newMode - Target mode identifier.
 * @param {boolean} [keepRunning=false] - Whether to automatically start the timer after switching.
 * @returns {void}
 */
function switchMode(newMode, keepRunning = false) {
  if (!MODES[newMode]) return;

  clearAutoStartTimeout();
  currentMode = newMode;
  document.body.setAttribute('data-theme', newMode);

  tabButtons.forEach(btn => {
    const isActive = btn.dataset.mode === newMode;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    if (isActive && timerPanel) {
      timerPanel.setAttribute('aria-labelledby', btn.id || `tab-${newMode}`);
    }
  });

  const config = MODES[currentMode];
  totalDuration = config.duration;
  remainingSeconds = totalDuration;
  modeLabel.textContent = config.label;
  statusHint.textContent = config.hint;

  clockCard.classList.remove('completed');
  pauseTimer();
  startPauseText.textContent = 'Start';
  playIcon.classList.remove('hidden');
  pauseIcon.classList.add('hidden');

  updateDisplay();

  if (keepRunning) {
    startTimer();
  }
}

/**
 * Handles timer completion: plays chime, records analytics, and handles auto-start progression.
 * Follows the classic Pomodoro cycle (every 4th focus session transitions to long break).
 * @returns {void}
 */
function completeTimer() {
  pauseTimer();
  remainingSeconds = 0;
  updateDisplay();

  statusHint.textContent = MODES[currentMode].completedHint;
  clockCard.classList.add('completed');
  playCompletionChime();

  // If focus session just finished, record analytics & increment cycle count
  if (currentMode === 'focus') {
    recordFocusSession(settings.focusDuration);
    completedFocusSessionsCount += 1;

    if (settings.autoStartBreaks) {
      // Every 4th completed focus session transitions to Long Break, otherwise Short Break
      const nextBreakMode = (completedFocusSessionsCount % 4 === 0) ? 'longBreak' : 'shortBreak';
      autoStartTimeout = setTimeout(() => {
        switchMode(nextBreakMode, true);
      }, 1200);
    }
  } else {
    // Break finished; auto-start next focus session if enabled
    if (settings.autoStartFocus) {
      autoStartTimeout = setTimeout(() => {
        switchMode('focus', true);
      }, 1200);
    }
  }
}

// ==========================================================================
// 6. Audio Notifications (Chime & Autoplay Unlock)
// ==========================================================================

let audioCtx = null;

/**
 * Lazily creates or returns the shared Web Audio Context.
 * @returns {AudioContext|null} Active audio context, or null if unsupported.
 */
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

/**
 * Ensures the Web Audio context is initialized and resumed inside a user gesture,
 * preventing browser autoplay policy restrictions from silencing the completion chime.
 * @returns {void}
 */
function initOrResumeAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(e => console.warn('AudioContext resume failed:', e));
  }
}

/**
 * Plays a melodic 4-note ascending chime sequence upon timer completion.
 * @returns {void}
 */
function playCompletionChime() {
  if (isMuted) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const startTime = ctx.currentTime + 0.05;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.12);

      const noteStart = startTime + idx * 0.12;
      const noteEnd = noteStart + 0.8;

      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.18, noteStart + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteEnd);
    });
  } catch (err) {
    console.warn('Audio chime playback failed:', err);
  }
}

// Sound toggle button (single SVG icon swap)
const SOUND_ICONS = {
  on: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </svg>`,
  off: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="22" y1="9" x2="16" y2="15"></line>
        <line x1="16" y1="9" x2="22" y2="15"></line>
      </svg>`
};

/**
 * Synchronizes the sound toggle button icon, title, and ARIA attributes with mute state.
 * @returns {void}
 */
function updateSoundButton() {
  soundToggle.innerHTML = isMuted ? SOUND_ICONS.off : SOUND_ICONS.on;
  const stateText = isMuted ? 'Sound muted (Click to unmute)' : 'Sound enabled (Click to mute)';
  soundToggle.title = stateText;
  soundToggle.setAttribute('aria-label', stateText);
}

soundToggle.addEventListener('click', () => {
  initOrResumeAudio();
  isMuted = !isMuted;
  updateSoundButton();
  updateAmbientMasterMute();
});

// ==========================================================================
// 7. Theme Management (Light / Dark Theme)
// ==========================================================================

let colorScheme = 'light';
try {
  const savedScheme = localStorage.getItem('pomodoro_color_scheme');
  if (savedScheme) {
    colorScheme = savedScheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    colorScheme = 'dark';
  }
} catch (e) {
  colorScheme = 'light';
}

const THEME_ICONS = {
  light: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>`,
  dark: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <circle cx="12" cy="12" r="5"></circle>
           <line x1="12" y1="1" x2="12" y2="3"></line>
           <line x1="12" y1="21" x2="12" y2="23"></line>
           <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
           <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
           <line x1="1" y1="12" x2="3" y2="12"></line>
           <line x1="21" y1="12" x2="23" y2="12"></line>
           <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
           <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
         </svg>`
};

/**
 * Applies the color scheme ('light' or 'dark') to the DOM and stores preference in localStorage.
 * @param {'light'|'dark'} scheme - Color scheme to apply.
 * @returns {void}
 */
function applyColorScheme(scheme) {
  colorScheme = scheme;
  document.body.setAttribute('data-color-scheme', scheme);
  if (themeToggle) {
    themeToggle.innerHTML = scheme === 'dark' ? THEME_ICONS.dark : THEME_ICONS.light;
    const titleText = scheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    themeToggle.title = titleText;
    themeToggle.setAttribute('aria-label', titleText);
  }
  try {
    localStorage.setItem('pomodoro_color_scheme', scheme);
  } catch (e) {
    console.warn('Failed to save color scheme:', e);
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    applyColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  });
}

// ==========================================================================
// 8. Procedural Web Audio Soundscapes (100% Offline & Leak-Free)
// ==========================================================================

/**
 * Audio graph nodes and state for each procedural sound generator channel.
 * @type {Record<string, {playing: boolean, volume: number, source: AudioBufferSourceNode|null, gain: GainNode|null, filter: BiquadFilterNode|null, lfo: OscillatorNode|null, lfoGain: GainNode|null}>}
 */
const soundNodes = {
  rain: { playing: false, volume: 0.5, source: null, gain: null, filter: null, lfo: null, lfoGain: null },
  waves: { playing: false, volume: 0.4, source: null, gain: null, filter: null, lfo: null, lfoGain: null },
  wind: { playing: false, volume: 0.35, source: null, gain: null, filter: null, lfo: null, lfoGain: null },
  brown: { playing: false, volume: 0.4, source: null, gain: null, filter: null, lfo: null, lfoGain: null }
};

/**
 * Cache for generated 2-second looped audio buffers to avoid redundant calculations.
 * @type {Map<string, AudioBuffer>}
 */
const noiseBufferCache = new Map();

/**
 * Retrieves a cached noise buffer or computes a new one if not present.
 * @param {AudioContext} ctx - Web Audio Context.
 * @param {'white'|'pink'|'brown'} [type='white'] - Noise spectrum algorithm.
 * @returns {AudioBuffer} 2-second looped audio buffer.
 */
function getOrCreateNoiseBuffer(ctx, type = 'white') {
  const cacheKey = `${type}_${ctx.sampleRate}`;
  if (noiseBufferCache.has(cacheKey)) {
    return noiseBufferCache.get(cacheKey);
  }
  const buffer = createNoiseBuffer(ctx, type);
  noiseBufferCache.set(cacheKey, buffer);
  return buffer;
}

/**
 * Procedural noise buffer generator algorithm.
 * @param {AudioContext} ctx - Web Audio Context.
 * @param {'white'|'pink'|'brown'} [type='white'] - Noise spectrum algorithm.
 * @returns {AudioBuffer} Generated audio buffer.
 */
function createNoiseBuffer(ctx, type = 'white') {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds looping buffer
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0.0;
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;

    if (type === 'brown') {
      // Brown noise integration
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    } else if (type === 'pink') {
      // Paul Kellet's pink noise filter
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    } else {
      // White noise
      data[i] = white * 0.2;
    }
  }

  return buffer;
}

/**
 * Synthesizes and starts playback of a procedural ambient soundscape channel.
 * @param {'rain'|'waves'|'wind'|'brown'} name - Channel identifier.
 * @returns {void}
 */
function startProceduralSound(name) {
  initOrResumeAudio();
  const ctx = getAudioContext();
  if (!ctx) return;

  const nodeObj = soundNodes[name];
  if (nodeObj.playing) return;

  const gain = ctx.createGain();
  const effectiveGain = isMuted ? 0 : nodeObj.volume * 0.4;
  gain.gain.setValueAtTime(effectiveGain, ctx.currentTime);

  let sourceNode = null;
  let filter = null;
  let lfo = null;
  let lfoGain = null;

  if (name === 'rain') {
    // Pink noise with lowpass filter
    const noiseBuffer = getOrCreateNoiseBuffer(ctx, 'pink');
    sourceNode = ctx.createBufferSource();
    sourceNode.buffer = noiseBuffer;
    sourceNode.loop = true;

    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    sourceNode.connect(filter);
    filter.connect(gain);
  } else if (name === 'waves') {
    // Brown noise with rhythmic LFO filter modulation
    const noiseBuffer = getOrCreateNoiseBuffer(ctx, 'brown');
    sourceNode = ctx.createBufferSource();
    sourceNode.buffer = noiseBuffer;
    sourceNode.loop = true;

    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    // LFO to modulate filter frequency
    lfo = ctx.createOscillator();
    lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8s cycle
    lfoGain.gain.setValueAtTime(250, ctx.currentTime);

    lfo.connect(filter.frequency);
    sourceNode.connect(filter);
    filter.connect(gain);
    lfo.start();
  } else if (name === 'wind') {
    // Pink noise with resonant bandpass & sweeping LFO
    const noiseBuffer = getOrCreateNoiseBuffer(ctx, 'pink');
    sourceNode = ctx.createBufferSource();
    sourceNode.buffer = noiseBuffer;
    sourceNode.loop = true;

    filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    filter.Q.setValueAtTime(1.8, ctx.currentTime);

    lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, ctx.currentTime);
    lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(180, ctx.currentTime);

    lfo.connect(filter.frequency);
    sourceNode.connect(filter);
    filter.connect(gain);
    lfo.start();
  } else if (name === 'brown') {
    // Deep Brown Noise
    const noiseBuffer = getOrCreateNoiseBuffer(ctx, 'brown');
    sourceNode = ctx.createBufferSource();
    sourceNode.buffer = noiseBuffer;
    sourceNode.loop = true;

    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    sourceNode.connect(filter);
    filter.connect(gain);
  }

  gain.connect(ctx.destination);
  sourceNode.start();

  nodeObj.source = sourceNode;
  nodeObj.gain = gain;
  nodeObj.filter = filter;
  nodeObj.lfo = lfo;
  nodeObj.lfoGain = lfoGain;
  nodeObj.playing = true;
}

/**
 * Stops an active procedural ambient sound channel and cleans up all audio nodes.
 * Stops any active LFO oscillators and disconnects all nodes to prevent leaks.
 * @param {'rain'|'waves'|'wind'|'brown'} name - Channel identifier.
 * @returns {void}
 */
function stopProceduralSound(name) {
  const nodeObj = soundNodes[name];
  if (!nodeObj.playing) return;

  try {
    if (nodeObj.lfo) {
      nodeObj.lfo.stop();
      nodeObj.lfo.disconnect();
    }
    if (nodeObj.lfoGain) {
      nodeObj.lfoGain.disconnect();
    }
    if (nodeObj.source) {
      nodeObj.source.stop();
      nodeObj.source.disconnect();
    }
    if (nodeObj.filter) {
      nodeObj.filter.disconnect();
    }
    if (nodeObj.gain) {
      nodeObj.gain.disconnect();
    }
  } catch (e) {
    console.warn(`Error stopping procedural sound "${name}":`, e);
  }

  nodeObj.playing = false;
  nodeObj.source = null;
  nodeObj.gain = null;
  nodeObj.filter = null;
  nodeObj.lfo = null;
  nodeObj.lfoGain = null;
}

/**
 * Updates master mute / volume on all currently running procedural audio channels.
 * @returns {void}
 */
function updateAmbientMasterMute() {
  const ctx = getAudioContext();
  if (!ctx) return;

  Object.keys(soundNodes).forEach(name => {
    const nodeObj = soundNodes[name];
    if (nodeObj.gain) {
      const vol = isMuted ? 0 : nodeObj.volume * 0.4;
      nodeObj.gain.gain.setValueAtTime(vol, ctx.currentTime);
    }
  });
}

/**
 * Sets volume for a specific sound channel and adjusts gain in real-time.
 * @param {'rain'|'waves'|'wind'|'brown'} name - Sound channel identifier.
 * @param {number|string} valPercent - Volume percentage (0-100).
 * @returns {void}
 */
function setSoundVolume(name, valPercent) {
  const vol = Math.max(0, Math.min(100, Number(valPercent))) / 100;
  soundNodes[name].volume = vol;

  if (soundNodes[name].gain && !isMuted) {
    const ctx = getAudioContext();
    if (ctx) {
      soundNodes[name].gain.gain.setValueAtTime(vol * 0.4, ctx.currentTime);
    }
  }
}

// Soundscape UI Bindings
soundChannels.forEach(channelEl => {
  const soundName = channelEl.dataset.sound;
  const toggleBtn = channelEl.querySelector('.channel-toggle');
  const slider = channelEl.querySelector('.channel-slider');

  toggleBtn.addEventListener('click', () => {
    if (soundNodes[soundName].playing) {
      stopProceduralSound(soundName);
      toggleBtn.textContent = 'Play';
      toggleBtn.classList.remove('playing');
      channelEl.classList.remove('active');
    } else {
      startProceduralSound(soundName);
      toggleBtn.textContent = 'Playing';
      toggleBtn.classList.add('playing');
      channelEl.classList.add('active');
    }
  });

  slider.addEventListener('input', (e) => {
    setSoundVolume(soundName, e.target.value);
  });
});

muteAllSoundsBtn.addEventListener('click', () => {
  Object.keys(soundNodes).forEach(name => {
    stopProceduralSound(name);
  });
  soundChannels.forEach(channelEl => {
    channelEl.classList.remove('active');
    const toggleBtn = channelEl.querySelector('.channel-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = 'Play';
      toggleBtn.classList.remove('playing');
    }
  });
});

// ==========================================================================
// 9. Productivity Analytics & 7-Day Mini Bar Chart
// ==========================================================================

/**
 * Persists analytics history data to localStorage.
 * @returns {void}
 */
function saveAnalytics() {
  try {
    localStorage.setItem('pomodoro_analytics', JSON.stringify(analytics));
  } catch (e) {
    console.warn('Failed to save analytics:', e);
  }
}

/**
 * Records a completed focus session and updates productivity analytics.
 * @param {number} minutes - Duration of the completed session in minutes.
 * @returns {void}
 */
function recordFocusSession(minutes) {
  const todayKey = getTodayKey();
  if (!analytics.history[todayKey]) {
    analytics.history[todayKey] = { minutes: 0, sessions: 0 };
  }

  analytics.history[todayKey].minutes += Math.round(minutes);
  analytics.history[todayKey].sessions += 1;
  saveAnalytics();
  renderAnalytics();
}

/**
 * Calculates consecutive active days of focus sessions from analytics history.
 * Normalizes date to midday (12:00) to eliminate Daylight Saving Time offset anomalies.
 * @returns {number} Consecutive active streak in days.
 */
function calculateStreak() {
  const todayKey = getTodayKey();
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  const yesterdayKey = formatDateKey(d);

  const checkDate = new Date();
  checkDate.setHours(12, 0, 0, 0);

  // If no sessions today, check starting from yesterday
  const todayData = analytics.history[todayKey];
  if (!todayData || todayData.sessions === 0) {
    const yesterdayData = analytics.history[yesterdayKey];
    if (!yesterdayData || yesterdayData.sessions === 0) {
      return 0;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    const key = formatDateKey(checkDate);
    if (Object.prototype.hasOwnProperty.call(analytics.history, key) && analytics.history[key].sessions > 0) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Renders productivity metrics chips and the 7-day mini bar chart into the DOM.
 * @returns {void}
 */
function renderAnalytics() {
  const todayKey = getTodayKey();
  const todayData = analytics.history[todayKey] || { minutes: 0, sessions: 0 };

  // Update metric chips
  todayFocusTime.textContent = todayData.minutes >= 60
    ? `${(todayData.minutes / 60).toFixed(1)}h`
    : `${todayData.minutes}m`;
  todaySessions.textContent = todayData.sessions;

  // Update streak
  const streak = calculateStreak();
  streakBadge.textContent = `🔥 ${streak} ${streak === 1 ? 'day' : 'days'}`;

  // Build 7-day mini bar chart
  weeklyBarChart.innerHTML = '';
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  now.setHours(12, 0, 0, 0);

  const last7Days = [];
  let totalWeekMins = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = formatDateKey(d);
    const dayData = analytics.history[key] || { minutes: 0, sessions: 0 };
    totalWeekMins += dayData.minutes;

    last7Days.push({
      key,
      label: i === 0 ? 'Today' : daysOfWeek[d.getDay()],
      minutes: dayData.minutes,
      isToday: i === 0
    });
  }

  weeklyTotalHint.textContent = `${(totalWeekMins / 60).toFixed(1)}h total`;

  const maxMins = Math.max(30, ...last7Days.map(d => d.minutes));

  last7Days.forEach(day => {
    const col = document.createElement('div');
    col.className = `bar-col ${day.isToday ? 'today' : ''}`;
    col.title = `${day.label}: ${day.minutes} min`;

    const track = document.createElement('div');
    track.className = 'bar-track';

    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    const pct = Math.max(6, Math.min(100, (day.minutes / maxMins) * 100));
    fill.style.height = `${pct}%`;

    const label = document.createElement('span');
    label.className = 'bar-label';
    label.textContent = day.label;

    track.appendChild(fill);
    col.appendChild(track);
    col.appendChild(label);
    weeklyBarChart.appendChild(col);
  });
}

// ==========================================================================
// 10. Task Tracker & Active Task Spotlight
// ==========================================================================

/**
 * Persists session tasks and active task ID to localStorage.
 * @returns {void}
 */
function saveTasks() {
  try {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
    if (activeTaskId) {
      localStorage.setItem('pomodoro_active_task', activeTaskId);
    } else {
      localStorage.removeItem('pomodoro_active_task');
    }
  } catch (err) {
    console.warn('Failed to save tasks:', err);
  }
}

/**
 * Updates the task completion statistics badge.
 * @returns {void}
 */
function updateTaskStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  if (total === 0) {
    taskStats.textContent = '0 tasks';
  } else {
    taskStats.textContent = `${completed} / ${total} completed`;
  }
}

/**
 * Synchronizes the Active Task Spotlight banner with the currently pinned task.
 * @returns {void}
 */
function updateSpotlightUI() {
  if (!activeTaskId) {
    activeTaskSpotlight.classList.add('hidden');
    return;
  }

  const activeTask = tasks.find(t => t.id === activeTaskId);
  if (!activeTask || activeTask.completed) {
    activeTaskId = null;
    activeTaskSpotlight.classList.add('hidden');
    saveTasks();
    return;
  }

  spotlightTaskText.textContent = activeTask.text;
  activeTaskSpotlight.classList.remove('hidden');
}

/**
 * Renders the interactive task list in the Session Tasks card.
 * @returns {void}
 */
function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    emptyTasks.classList.remove('hidden');
  } else {
    emptyTasks.classList.add('hidden');
    tasks.forEach(task => {
      const li = document.createElement('li');
      const isPinned = task.id === activeTaskId;
      li.className = `task-item ${task.completed ? 'completed' : ''} ${isPinned ? 'pinned' : ''}`;
      li.dataset.id = task.id;

      // Checkbox button
      const checkBtn = document.createElement('button');
      checkBtn.className = 'task-checkbox-btn';
      checkBtn.setAttribute('type', 'button');
      checkBtn.setAttribute('aria-label', task.completed ? 'Mark incomplete' : 'Mark complete');
      checkBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      // Task text
      const textSpan = document.createElement('span');
      textSpan.className = 'task-text';
      textSpan.textContent = task.text;

      // Pin button (Target / Focus)
      const pinBtn = document.createElement('button');
      pinBtn.className = `task-pin-btn ${isPinned ? 'active' : ''}`;
      pinBtn.setAttribute('type', 'button');
      pinBtn.setAttribute('aria-label', isPinned ? 'Unpin from focus' : 'Pin to focus timer');
      pinBtn.setAttribute('title', isPinned ? 'Unpin from focus' : 'Pin as focus target');
      pinBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      `;

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'task-delete-btn';
      deleteBtn.setAttribute('type', 'button');
      deleteBtn.setAttribute('aria-label', 'Delete task');
      deleteBtn.setAttribute('title', 'Delete task');
      deleteBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;

      li.appendChild(checkBtn);
      li.appendChild(textSpan);
      li.appendChild(pinBtn);
      li.appendChild(deleteBtn);
      taskList.appendChild(li);
    });
  }

  updateTaskStats();
  updateSpotlightUI();
}

/**
 * Adds a new task to the task list and automatically pins it if none is active.
 * @param {string} text - Task description.
 * @returns {void}
 */
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newTask = {
    id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    text: trimmed,
    completed: false
  };

  tasks.unshift(newTask);

  // If no task is active, automatically pin the newly added task
  if (!activeTaskId) {
    activeTaskId = newTask.id;
  }

  saveTasks();
  renderTasks();
}

/**
 * Toggles a task's completed status.
 * @param {string} id - Task identifier.
 * @returns {void}
 */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  if (task.completed && activeTaskId === id) {
    activeTaskId = null;
  }

  saveTasks();
  renderTasks();
}

/**
 * Pins or unpins a task as the active focus target.
 * @param {string} id - Task identifier.
 * @returns {void}
 */
function togglePinTask(id) {
  if (activeTaskId === id) {
    activeTaskId = null;
  } else {
    activeTaskId = id;
  }
  saveTasks();
  renderTasks();
}

/**
 * Removes a task from the session task list.
 * @param {string} id - Task identifier.
 * @returns {void}
 */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  if (activeTaskId === id) {
    activeTaskId = null;
  }
  saveTasks();
  renderTasks();
}

// Add task form submit
addTaskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addTask(taskInput.value);
  taskInput.value = '';
  taskInput.focus();
});

// Task list interaction delegation
taskList.addEventListener('click', (e) => {
  const li = e.target.closest('.task-item');
  if (!li) return;
  const id = li.dataset.id;

  const deleteBtn = e.target.closest('.task-delete-btn');
  if (deleteBtn) {
    deleteTask(id);
    return;
  }

  const pinBtn = e.target.closest('.task-pin-btn');
  if (pinBtn) {
    togglePinTask(id);
    return;
  }

  const checkBtn = e.target.closest('.task-checkbox-btn');
  const textSpan = e.target.closest('.task-text');
  if (checkBtn || textSpan) {
    toggleTask(id);
  }
});

// Clear active spotlight button in timer
clearSpotlightBtn.addEventListener('click', () => {
  activeTaskId = null;
  saveTasks();
  renderTasks();
});

// ==========================================================================
// 11. Settings Modal Management & Accessibility
// ==========================================================================

let previousActiveElement = null;

/**
 * Opens the timer settings modal dialog and focuses the first input.
 * @returns {void}
 */
function openSettings() {
  previousActiveElement = document.activeElement;

  focusDurationInput.value = settings.focusDuration;
  shortBreakDurationInput.value = settings.shortBreakDuration;
  longBreakDurationInput.value = settings.longBreakDuration;
  autoStartBreaksInput.checked = settings.autoStartBreaks;
  autoStartFocusInput.checked = settings.autoStartFocus;

  settingsModal.classList.remove('hidden');
  focusDurationInput.focus();
}

/**
 * Closes the timer settings modal dialog and restores focus to trigger element.
 * @returns {void}
 */
function closeSettings() {
  settingsModal.classList.add('hidden');
  if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
    previousActiveElement.focus();
  }
}

settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);

// Close modal when clicking backdrop outside card
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    closeSettings();
  }
});

// Reset defaults button
resetDefaultsBtn.addEventListener('click', () => {
  focusDurationInput.value = DEFAULT_SETTINGS.focusDuration;
  shortBreakDurationInput.value = DEFAULT_SETTINGS.shortBreakDuration;
  longBreakDurationInput.value = DEFAULT_SETTINGS.longBreakDuration;
  autoStartBreaksInput.checked = DEFAULT_SETTINGS.autoStartBreaks;
  autoStartFocusInput.checked = DEFAULT_SETTINGS.autoStartFocus;
});

// Save settings form
settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const oldTotal = totalDuration;
  const newFocus = Math.max(1, Math.min(120, parseInt(focusDurationInput.value, 10) || 25));
  const newShort = Math.max(1, Math.min(60, parseInt(shortBreakDurationInput.value, 10) || 5));
  const newLong = Math.max(1, Math.min(90, parseInt(longBreakDurationInput.value, 10) || 15));

  settings.focusDuration = newFocus;
  settings.shortBreakDuration = newShort;
  settings.longBreakDuration = newLong;
  settings.autoStartBreaks = autoStartBreaksInput.checked;
  settings.autoStartFocus = autoStartFocusInput.checked;

  saveSettings();
  MODES = getModesConfig();

  // If timer is not running, adjust remaining duration while preserving progress
  if (!isRunning) {
    const newTotal = MODES[currentMode].duration;
    if (remainingSeconds >= oldTotal) {
      // Timer was pristine / unstarted -> update to full new duration
      totalDuration = newTotal;
      remainingSeconds = newTotal;
    } else {
      // Timer was paused mid-session -> preserve elapsed progress without wiping time
      const elapsed = Math.max(0, oldTotal - remainingSeconds);
      totalDuration = newTotal;
      remainingSeconds = Math.max(1, newTotal - elapsed);
    }
    updateDisplay();
  }

  closeSettings();
});

// ==========================================================================
// 12. General Listeners, ARIA Tab Navigation & Initialization
// ==========================================================================

// Timer Controls
startPauseBtn.addEventListener('click', toggleStartPause);
resetBtn.addEventListener('click', resetTimer);

// Tab switching click handlers
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetMode = btn.dataset.mode;
    if (targetMode !== currentMode) {
      switchMode(targetMode);
    }
  });
});

/**
 * Handles keyboard arrow navigation for mode tabs in accordance with W3C ARIA Tab pattern.
 * @param {KeyboardEvent} e - Keyboard event.
 * @returns {void}
 */
function handleTabKeydown(e) {
  const tabs = Array.from(tabButtons);
  const currentIndex = tabs.findIndex(btn => btn === document.activeElement);
  if (currentIndex === -1) return;

  let targetIndex = -1;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    targetIndex = (currentIndex + 1) % tabs.length;
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  } else if (e.key === 'Home') {
    e.preventDefault();
    targetIndex = 0;
  } else if (e.key === 'End') {
    e.preventDefault();
    targetIndex = tabs.length - 1;
  }

  if (targetIndex !== -1) {
    tabs[targetIndex].focus();
    switchMode(tabs[targetIndex].dataset.mode);
  }
}

const modeTabsNav = document.querySelector('.mode-tabs');
if (modeTabsNav) {
  modeTabsNav.addEventListener('keydown', handleTabKeydown);
}

// Global keyboard shortcuts (Space: Start/Pause, R: Reset, Esc: Close modal)
window.addEventListener('keydown', (e) => {
  // If settings modal is open, handle Escape to dismiss and suppress global shortcuts
  if (!settingsModal.classList.contains('hidden')) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSettings();
    }
    return;
  }

  // Ignore shortcuts when user is typing in inputs or textareas
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.code === 'Space') {
    e.preventDefault();
    initOrResumeAudio();
    toggleStartPause();
  } else if (e.code === 'KeyR') {
    e.preventDefault();
    resetTimer();
  }
});

// Initial boot
renderTasks();
renderAnalytics();
applyColorScheme(colorScheme);
switchMode('focus');
