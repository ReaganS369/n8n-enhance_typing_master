/**
 * TYPE//TANK Modern Defense - Word Dictionaries & Exclusion Engine
 */

const DICTIONARY_ALPHA = [
  'radar', 'laser', 'pulse', 'cyber', 'orbit', 'plasma', 'turret', 'shield',
  'vector', 'matrix', 'sensor', 'beacon', 'glitch', 'photon', 'vortex', 'signal',
  'armor', 'blast', 'drone', 'energy', 'flare', 'gauge', 'heavy', 'ionic',
  'kinetic', 'lock', 'missile', 'nexus', 'optic', 'patrol', 'quantum', 'recoil',
  'sonar', 'target', 'ultra', 'vapor', 'warfare', 'xenon', 'yield', 'zenith',
  'stealth', 'cannon', 'chassis', 'command', 'defense', 'element', 'fighter',
  'gravity', 'hazard', 'impact', 'junction', 'tracker', 'outpost', 'reactor',
  'sector', 'thruster', 'payload', 'overload', 'phantom', 'sentinel', 'protocol',
  'velocity', 'circuit', 'terminal', 'override', 'satellite', 'firewall', 'subsystem'
];

const DICTIONARY_BRAVO = [
  'Tank', 'Radar', 'Laser', 'Shield', 'Drone', 'Cannon', 'Vortex', 'Pulse',
  'CyberHawk', 'DeltaForce', 'AegisOne', 'IronClad', 'NanoTech', 'StarFall',
  'GhostOps', 'TitanMech', 'VortexCore', 'ShadowStrike', 'ApexPredator',
  'HyperBeam', 'SolarFlare', 'NovaBurst', 'VoidRunner', 'ThunderBolt',
  'BattleGroup', 'CryoBlast', 'StormRider', 'BioHazard', 'ZeroPoint',
  'SkyGuard', 'DarkMatter', 'FireStorm', 'NeonSpear', 'DeepSpace',
  'WarMachine', 'PulseRifle', 'HeavyArmor', 'IronShield', 'LaserGrid',
  'AeroStrike', 'GhostBlade', 'OmegaForce', 'PrimeUnit', 'ViperSquad',
  'WARP', 'LOCK', 'FIRE', 'CORE', 'MECH', 'GRID', 'ECHO', 'APEX', 'HULL', 'FLUX'
];

const DICTIONARY_CHARLIE = [
  'Tank99', 'Sector7', 'Squad5', 'Unit404', 'Cipher16', 'Pulse88', 'Node128',
  'RaptorX7', 'SubLevel9', 'Fighter10', 'Alpha01', 'Bravo02', 'Delta04',
  'Omega99', 'Port8080', 'Zone51', 'Base256', 'Core100', 'GigaBit1',
  'Warp9', 'Fleet77', 'Heavy6', 'Drone09', 'Titan44', 'Ghost8', 'Bunker12',
  'Vector3D', 'Phase4', 'Matrix8x8', 'RAM64', 'CPU32', 'Volt220', 'Ampere15',
  'Orbit360', 'Shield95', 'Sensor01', 'Echo7', 'Zenith12', 'Nexus500', 'Vortex3'
];

const DICTIONARY_DELTA = [
  '[tank-01]', '(8+9)', '{cmd-9}', '!alert!', '<root>', '#fire-wall',
  '[void-4]', '(sys*2)', '!purge!', '[sync-ok]', '<host:ip>', '#defend-1',
  'data.hex', 'ping@100', '$bounty$', 'auth:key', '[LOCK#9]', '{core:on}',
  'x=4+5', 'port#80', '!scramble!', '<turret-1>', '(100%)', '[safe_mode]',
  'run(code)', '!breach!', 'v2.4.1', '#sector-9', 'ip:192.1', 'target[0]',
  '&override', '[READY!]', '<ammo+5>', 'err#404', '*burst*', '{shield=max}',
  '[alpha-9]', '(ammo-3)', '$cash_in$', '<laser.on>', '#deploy-now'
];

const DICTIONARY_CODE = [
  'const', 'let', 'function()', 'return', 'async', 'await', 'import', 'export',
  'console.log', 'git.push()', 'npm.install', 'Array.map', 'Promise.all', 'JSON.parse',
  'try/catch', 'typeof', 'document', 'addEventListener', 'status===200', 'fetch(api)',
  'class.extends', 'props=>', 'useState()', 'useEffect', 'null??void', 'math.floor',
  'Object.keys', 'boolean!', 'string:len', 'docker.run', 'localhost:3000', 'sudo.kill',
  'export.default', 'new.Map()', 'Math.random()', 'while(true)', 'process.env', 'npm.start'
];

const POWERUP_WORDS = [
  '[FREEZE]', '[NUKE]', '[SHIELD+]'
];

const DICTIONARY_BOSS_DRONES = [
  'drone', 'pod', 'beam', 'ion', 'orb', 'zap', 'core', 'aim', 'bot', 'sub', 'lock', 'pulse'
];

const DICTIONARY_BOSS_TORPEDOES = [
  'HyperTorpedo', 'ClusterMissile', 'AntiMatterBomb', 'PlasmaWarhead',
  'OrbitalDisruptor', 'QuantumTorpedo', 'VortexDetonator', 'PhotonBuster'
];

const DICTIONARY_RACER = [
  'turbo', 'nitro', 'apex', 'drift', 'shift', 'boost', 'clutch', 'velocity',
  'overtake', 'throttle', 'exhaust', 'vector', 'hyper', 'torque', 'piston',
  'draft', 'racing', 'supercharge', 'asphalt', 'slipstream', 'octane', 'downforce',
  'gearbox', 'redline', 'ignition', 'speedway', 'monaco', 'pitstop', 'finishline'
];

const DICTIONARY_MATRIX = [
  'zion', 'trinity', 'morpheus', 'oracle', 'nebu', 'cypher', 'switch',
  'apoc', 'agent', 'smith', 'matrix', 'sentinel', 'mainframe', 'override',
  'construct', 'simulation', 'glitch', 'redpill', 'bluepill', 'architect',
  'anomaly', 'source', 'operator', 'zion01', 'keymaker', 'subroutine', 'decrypt'
];

class WordManager {
  constructor() {
    this.mode = 1; // 1: Alpha, 2: Bravo, 3: Charlie, 4: Delta
    this.options = {
      uppercase: false,
      numbers: false,
      specials: false
    };
    this.excludedChars = new Map(); // char -> expiration timestamp
    this.activeWords = [];
  }

  setMode(modeNum) {
    this.mode = Math.max(1, Math.min(4, modeNum));
    switch (this.mode) {
      case 1:
        this.options = { uppercase: false, numbers: false, specials: false };
        break;
      case 2:
        this.options = { uppercase: true, numbers: false, specials: false };
        break;
      case 3:
        this.options = { uppercase: true, numbers: true, specials: false };
        break;
      case 4:
        this.options = { uppercase: true, numbers: true, specials: true };
        break;
    }
  }

  setCustomToggles(uppercase, numbers, specials) {
    this.options.uppercase = !!uppercase;
    this.options.numbers = !!numbers;
    this.options.specials = !!specials;

    if (this.options.specials) {
      this.mode = 4;
    } else if (this.options.numbers) {
      this.mode = 3;
    } else if (this.options.uppercase) {
      this.mode = 2;
    } else {
      this.mode = 1;
    }
  }

  getSampleWords(modeNum = this.mode, count = 4) {
    let pool;
    switch (modeNum) {
      case 1: pool = DICTIONARY_ALPHA; break;
      case 2: pool = DICTIONARY_BRAVO; break;
      case 3: pool = DICTIONARY_CHARLIE; break;
      case 4: pool = DICTIONARY_DELTA; break;
      default: pool = DICTIONARY_ALPHA;
    }
    const samples = [];
    const usedIndices = new Set();
    while (samples.length < count && samples.length < pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx);
        samples.push(pool[idx]);
      }
    }
    return samples;
  }

  excludeChar(char, durationMs = 3000) {
    if (!char) return;
    const now = Date.now();
    this.excludedChars.set(char.toLowerCase(), now + durationMs);
  }

  isCharExcluded(char) {
    if (!char) return false;
    const key = char.toLowerCase();
    const expiry = this.excludedChars.get(key);
    if (!expiry) return false;
    if (Date.now() > expiry) {
      this.excludedChars.delete(key);
      return false;
    }
    return true;
  }

  cleanExclusions() {
    const now = Date.now();
    for (const [key, expiry] of this.excludedChars.entries()) {
      if (now > expiry) {
        this.excludedChars.delete(key);
      }
    }
  }

  getRandomWord(isRedBonus = false, existingWords = [], gameMode = 'tank') {
    this.cleanExclusions();

    let pool;
    if (gameMode === 'car' && this.mode === 1) {
      pool = DICTIONARY_RACER;
    } else {
      switch (this.mode) {
        case 1: pool = DICTIONARY_ALPHA; break;
        case 2: pool = DICTIONARY_BRAVO; break;
        case 3: pool = DICTIONARY_CHARLIE; break;
        case 4: pool = DICTIONARY_DELTA; break;
        default: pool = DICTIONARY_ALPHA;
      }
    }

    // Active red words block new words starting with their first char
    const activeRedFirstChars = new Set();
    const activeFirstChars = new Set();
    for (const w of existingWords) {
      if (!w.destroyed && w.text && w.text.length > 0) {
        const fc = w.text[0].toLowerCase();
        activeFirstChars.add(fc);
        if (w.isBonus) {
          activeRedFirstChars.add(fc);
        }
      }
    }

    // Filter candidates
    const candidates = pool.filter(word => {
      // Don't spawn duplicates currently alive
      if (existingWords.some(w => !w.destroyed && w.text === word)) {
        return false;
      }
      const fc = word[0].toLowerCase();

      // Check exclusion cooldown
      if (this.isCharExcluded(fc)) {
        return false;
      }

      // If a red bonus word with this first char is active, block it
      if (activeRedFirstChars.has(fc)) {
        return false;
      }

      // If this new word itself is a red bonus, avoid collision with existing active first chars
      if (isRedBonus && activeFirstChars.has(fc)) {
        return false;
      }

      return true;
    });

    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // Fallback if all candidates filtered
    return pool[Math.floor(Math.random() * pool.length)];
  }
}

window.WordManager = WordManager;
