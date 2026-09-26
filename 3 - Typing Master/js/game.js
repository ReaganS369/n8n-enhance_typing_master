/**
 * TYPE//TANK & HIGHWAY RUNNER - Canvas 2D Game Engine
 * Two Focused Game Modes:
 * 1. 'tank' - Turret Kinetic Defense
 * 2. 'car'  - Highway 3-Lane Dodge & Drift
 */

class GameEngine {
  constructor(canvas, wordManager, soundEngine, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.wordManager = wordManager;
    this.sound = soundEngine;
    this.callbacks = callbacks;

    // Canvas scaling & sizing
    this.width = canvas.width;
    this.height = canvas.height;

    // Game Mode: 'tank' or 'car'
    this.gameMode = 'tank';

    // Game State
    this.isRunning = false;
    this.isPaused = false;
    this.lastTime = 0;
    this.gameTime = 0;

    // Player Stats
    this.score = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.combo = 0;
    this.maxCombo = 0;
    this.wordsDestroyed = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.startTime = 0;

    // Tank Mode State
    this.tank = {
      x: 0,
      y: 0,
      radius: 44,
      barrelLength: 54,
      barrelWidth: 12,
      angle: -Math.PI / 2,
      targetAngle: -Math.PI / 2,
      recoil: 0,
      glowPulse: 0
    };

    // Car Mode (3-Lane Highway) State
    this.lanes = []; // Array of 3 lane center X positions
    this.roadLeft = 0;
    this.roadWidth = 0;
    this.playerLane = 1; // 0: Left, 1: Center, 2: Right
    this.carX = 0;
    this.carY = 0;
    this.roadScroll = 0;
    this.nitroFlash = 0;
    this.carSteerAngle = 0; // slight tilt when steering

    // Words & Spawning
    this.words = [];
    this.lockedWord = null;
    this.spawnTimer = 0;
    this.spawnInterval = 2.2;
    this.bonusSpawnTimer = 0;
    this.bonusSpawnInterval = 10.0;

    // Bullets, Particles & Effects
    this.bullets = [];
    this.particles = [];
    this.floatingTexts = [];
    this.screenShake = 0;

    // Defense / Collision Line
    this.defenseY = 0;

    // Theme Colors
    this.themeColors = {
      primary: '#00f0ff',
      secondary: '#ff0055',
      dim: 'rgba(0, 240, 255, 0.15)',
      grid: 'rgba(0, 240, 255, 0.05)'
    };

    this.loop = this.loop.bind(this);
    this.handleResize();
  }

  updateTheme(themeName) {
    switch (themeName) {
      case 'zen-emerald':
        this.themeColors = {
          primary: '#10b981',
          secondary: '#f43f5e',
          dim: 'rgba(16, 185, 129, 0.15)',
          grid: 'rgba(16, 185, 129, 0.05)'
        };
        break;
      case 'solar-sunset':
        this.themeColors = {
          primary: '#f59e0b',
          secondary: '#ef4444',
          dim: 'rgba(245, 158, 11, 0.15)',
          grid: 'rgba(245, 158, 11, 0.05)'
        };
        break;
      case 'oled-frost':
        this.themeColors = {
          primary: '#38bdf8',
          secondary: '#f43f5e',
          dim: 'rgba(56, 189, 248, 0.15)',
          grid: 'rgba(56, 189, 248, 0.05)'
        };
        break;
      default:
        this.themeColors = {
          primary: '#00f0ff',
          secondary: '#ff0055',
          dim: 'rgba(0, 240, 255, 0.15)',
          grid: 'rgba(0, 240, 255, 0.05)'
        };
    }
  }

  handleResize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.width = rect.width;
    this.height = rect.height;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    // Defense baseline
    this.defenseY = this.height - 75;

    // Tank position
    this.tank.x = this.width / 2;
    this.tank.y = this.height - 28;

    // Car 3-Lane Highway calculations
    this.roadWidth = Math.min(this.width * 0.76, 520);
    this.roadLeft = (this.width - this.roadWidth) / 2;
    const laneWidth = this.roadWidth / 3;
    this.lanes = [
      this.roadLeft + laneWidth * 0.5,
      this.roadLeft + laneWidth * 1.5,
      this.roadLeft + laneWidth * 2.5
    ];

    this.carY = this.height - 70;
    this.carX = this.lanes[this.playerLane];
  }

  start(gameMode = 'tank') {
    this.gameMode = (gameMode === 'car' || gameMode === 'racer') ? 'car' : 'tank';
    this.handleResize();
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.startTime = performance.now();
    this.gameTime = 0;

    this.score = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.combo = 0;
    this.maxCombo = 0;
    this.wordsDestroyed = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;

    this.words = [];
    this.bullets = [];
    this.particles = [];
    this.floatingTexts = [];
    this.lockedWord = null;

    // Car mode setup
    if (this.gameMode === 'car') {
      this.playerLane = 1; // Center lane
      this.carX = this.lanes[1];
      this.roadScroll = 0;
      this.nitroFlash = 0;
      this.carSteerAngle = 0;
      this.spawnInterval = 2.0;
    } else {
      this.spawnInterval = 2.4;
    }

    this.spawnTimer = 0.5;
    this.bonusSpawnTimer = 8.0;
    this.screenShake = 0;

    requestAnimationFrame(this.loop);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now();
      requestAnimationFrame(this.loop);
    }
  }

  stop() {
    this.isRunning = false;
  }

  // Handle keystroke from user (STRICTLY CASE-SENSITIVE)
  handleKeyPress(char) {
    if (!this.isRunning || this.isPaused || this.health <= 0) return;
    this.totalKeystrokes++;

    // 1. If currently locked onto a word
    if (this.lockedWord && !this.lockedWord.destroyed) {
      const nextNeededChar = this.lockedWord.text[this.lockedWord.typedIndex];
      // STRICT CASE MATCH
      if (nextNeededChar === char) {
        this.processHit(this.lockedWord);
        return;
      }
    }

    // 2. Not locked or mismatch: find candidate words matching exact case
    const candidates = this.words.filter(w => {
      if (w.destroyed) return false;
      return w.text[w.typedIndex] === char;
    });

    if (candidates.length > 0) {
      // In Car mode, prioritize words that are in the player's current lane!
      if (this.gameMode === 'car') {
        const inLaneWords = candidates.filter(w => w.lane === this.playerLane);
        if (inLaneWords.length > 0) {
          inLaneWords.sort((a, b) => b.y - a.y);
          this.lockedWord = inLaneWords[0];
        } else {
          candidates.sort((a, b) => b.y - a.y);
          this.lockedWord = candidates[0];
        }
      } else {
        // Tank mode: Lowest-First priority
        candidates.sort((a, b) => b.y - a.y);
        this.lockedWord = candidates[0];
      }

      this.processHit(this.lockedWord);
    } else {
      // Wrong key or wrong case: reset combo with subtle shake
      this.combo = 0;
      this.screenShake = 3;
      if (this.callbacks.onStatsUpdate) this.callbacks.onStatsUpdate(this.getStats());
    }
  }

  processHit(word) {
    this.correctKeystrokes++;
    this.combo++;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    const hitCharIndex = word.typedIndex;
    word.typedIndex++;

    const charCoord = word.getCharPos(hitCharIndex, this.ctx);

    if (this.gameMode === 'tank') {
      const dx = charCoord.x - this.tank.x;
      const dy = charCoord.y - this.tank.y;
      this.tank.targetAngle = Math.atan2(dy, dx);
      this.tank.recoil = 8;
      this.spawnBullet(charCoord.x, charCoord.y, word.isBonus);
      this.spawnMuzzleFlash();
    } else {
      // Car mode: laser pulse from car headlights
      this.spawnBulletFromCar(charCoord.x, charCoord.y, word.isBonus);
      this.nitroFlash = 0.25;
    }

    this.sound.laserShot();

    if (word.typedIndex >= word.text.length) {
      this.neutralizeWord(word);
    }

    if (this.callbacks.onStatsUpdate) {
      this.callbacks.onStatsUpdate(this.getStats());
    }
  }

  neutralizeWord(word) {
    word.destroyed = true;
    this.wordsDestroyed++;

    const multiplier = word.isBonus ? 3.5 : 1.0;
    const comboBonus = Math.min(this.combo * 5, 120);
    const basePoints = word.text.length * 20;
    const earnedScore = Math.round((basePoints + comboBonus) * multiplier);

    this.score += earnedScore;

    this.sound.explosion(word.isBonus);
    this.spawnExplosion(word.x, word.y, word.isBonus ? this.themeColors.secondary : this.themeColors.primary, word.isBonus ? 35 : 22);

    if (this.gameMode === 'car') {
      // CAR MODE DODGE MECHANIC:
      // If the word was in the player's current lane, the car SWERVES / DRIFTS away into a clear lane!
      if (word.lane === this.playerLane) {
        // Choose adjacent safe lane
        let newLane;
        if (this.playerLane === 1) {
          // In center: pick left (0) or right (2) based on obstacles
          const leftThreat = this.words.some(w => !w.destroyed && w.lane === 0 && w.y > this.carY - 180);
          newLane = leftThreat ? 2 : 0;
        } else if (this.playerLane === 0) {
          newLane = 1;
        } else {
          newLane = 1;
        }

        const steerDir = (newLane > this.playerLane ? 1 : -1) * 0.28;
        this.playerLane = newLane;
        this.carSteerAngle = steerDir;
        this.nitroFlash = 0.45;
        this.spawnDriftParticles();
        this.spawnFloatingText(`SWERVE DODGE! +${earnedScore}`, this.carX, this.carY - 30, '#00ff88');
      } else {
        this.spawnFloatingText(`BLASTED! +${earnedScore}`, word.x, word.y - 10, '#00f0ff');
      }
    } else {
      // Tank mode floating text
      const label = word.isBonus ? `+${earnedScore} [3.5X BONUS]` : `+${earnedScore}`;
      this.spawnFloatingText(label, word.x, word.y - 10, word.isBonus ? this.themeColors.secondary : '#00ff88');
    }

    if (word.isBonus && word.text.length > 0) {
      this.wordManager.excludeChar(word.text[0], 3000);
    }

    if (this.lockedWord === word) {
      this.lockedWord = null;
    }
  }

  spawnBullet(targetX, targetY, isBonus) {
    const startX = this.tank.x + Math.cos(this.tank.angle) * this.tank.barrelLength;
    const startY = this.tank.y + Math.sin(this.tank.angle) * this.tank.barrelLength;
    const angle = Math.atan2(targetY - startY, targetX - startX);
    const speed = 1300;

    this.bullets.push({
      x: startX,
      y: startY,
      targetX: targetX,
      targetY: targetY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.35,
      isBonus: isBonus
    });
  }

  spawnBulletFromCar(targetX, targetY, isBonus) {
    const startX = this.carX;
    const startY = this.carY - 20;
    const angle = Math.atan2(targetY - startY, targetX - startX);
    const speed = 1400;

    this.bullets.push({
      x: startX,
      y: startY,
      targetX: targetX,
      targetY: targetY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.35,
      isBonus: isBonus
    });
  }

  spawnMuzzleFlash() {
    const tipX = this.tank.x + Math.cos(this.tank.angle) * this.tank.barrelLength;
    const tipY = this.tank.y + Math.sin(this.tank.angle) * this.tank.barrelLength;

    for (let i = 0; i < 8; i++) {
      const spread = (Math.random() - 0.5) * 0.8;
      const speed = 100 + Math.random() * 150;
      const a = this.tank.angle + spread;
      this.particles.push({
        x: tipX,
        y: tipY,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 0.15 + Math.random() * 0.1,
        maxLife: 0.25,
        color: this.themeColors.primary,
        size: 2 + Math.random() * 3
      });
    }
  }

  spawnDriftParticles() {
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: this.carX + (Math.random() - 0.5) * 26,
        y: this.carY + 16,
        vx: (Math.random() - 0.5) * 80,
        vy: 40 + Math.random() * 80,
        life: 0.2 + Math.random() * 0.25,
        maxLife: 0.45,
        color: 'rgba(255, 255, 255, 0.6)',
        size: 3 + Math.random() * 4
      });
    }
  }

  spawnExplosion(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 220;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.4,
        maxLife: 0.7,
        color: color,
        size: 2 + Math.random() * 4
      });
    }
  }

  spawnFloatingText(text, x, y, color = '#00ff88') {
    this.floatingTexts.push({
      text: text,
      x: x,
      y: y,
      vy: -40,
      life: 0.9,
      maxLife: 0.9,
      color: color
    });
  }

  spawnNewWord(isBonus = false) {
    const text = this.wordManager.getRandomWord(isBonus, this.words, this.gameMode);
    if (!text) return;

    this.ctx.font = 'bold 17px "JetBrains Mono", monospace';
    const textWidth = this.ctx.measureText(text).width + 36;

    let x = 0;
    let lane = 1;

    if (this.gameMode === 'car') {
      // CAR MODE: Pick one of the 3 lanes (0: Left, 1: Center, 2: Right)
      // High probability to spawn in or near the player's lane for tension!
      const laneChoices = [0, 1, 2];
      // Filter out lanes that already have an obstacle very near the top
      const validLanes = laneChoices.filter(l => !this.words.some(w => !w.destroyed && w.lane === l && w.y < 90));
      lane = validLanes.length > 0 ? validLanes[Math.floor(Math.random() * validLanes.length)] : Math.floor(Math.random() * 3);
      x = this.lanes[lane];
    } else {
      // TANK MODE: Spread across screen width
      const margin = 30;
      const minX = margin + textWidth / 2;
      const maxX = this.width - margin - textWidth / 2;
      x = Math.max(minX, Math.min(maxX, minX + Math.random() * (maxX - minX)));
    }

    const difficultyMultiplier = 1 + (this.gameTime / 60) * 0.35;
    const baseSpeed = isBonus ? 60 : (this.gameMode === 'car' ? 48 : 34);
    const speed = baseSpeed * difficultyMultiplier + (Math.random() * 6);

    const newWord = {
      text: text,
      typedIndex: 0,
      x: x,
      y: -35,
      lane: lane,
      speed: speed,
      isBonus: isBonus,
      destroyed: false,
      width: textWidth,
      getCharPos: (charIdx, ctx) => {
        ctx.font = 'bold 17px "JetBrains Mono", monospace';
        const fullW = ctx.measureText(text).width;
        const startX = newWord.x - fullW / 2;
        const subStr = text.substring(0, charIdx);
        const preW = ctx.measureText(subStr).width;
        const charW = ctx.measureText(text[charIdx]).width;
        return {
          x: startX + preW + charW / 2,
          y: newWord.y
        };
      }
    };

    if (isBonus) {
      this.sound.bonusChime();
      this.spawnFloatingText('★ 3.5X BONUS HAZARD ★', x, 40, '#ff0055');
    }

    this.words.push(newWord);
  }

  damageHull(amount) {
    this.health = Math.max(0, this.health - amount);
    this.screenShake = 16;
    this.combo = 0;
    this.sound.damageBuzz();

    if (this.health <= 0) {
      this.gameOver(false);
    }
  }

  gameOver(isVictory = false) {
    this.isRunning = false;
    this.sound.explosion(true);

    const deathX = (this.gameMode === 'car') ? this.carX : this.tank.x;
    const deathY = (this.gameMode === 'car') ? this.carY : this.tank.y;
    this.spawnExplosion(deathX, deathY, this.themeColors.secondary, 60);

    if (this.callbacks.onGameOver) {
      this.callbacks.onGameOver(this.getFinalResults(isVictory));
    }
  }

  getStats() {
    const elapsedMinutes = Math.max(0.1, (performance.now() - this.startTime) / 60000);
    const wpm = Math.round((this.correctKeystrokes / 5) / elapsedMinutes);
    const accuracy = this.totalKeystrokes > 0
      ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
      : 100;

    return {
      score: this.score,
      health: this.health,
      maxHealth: this.maxHealth,
      combo: this.combo,
      maxCombo: this.maxCombo,
      wpm: wpm,
      accuracy: accuracy,
      wordsDestroyed: this.wordsDestroyed,
      mode: this.wordManager.mode,
      gameMode: this.gameMode
    };
  }

  getFinalResults(isVictory = false) {
    const stats = this.getStats();
    return {
      ...stats,
      isVictory: isVictory,
      elapsedTime: Math.round((performance.now() - this.startTime) / 1000)
    };
  }

  // Main Loop
  loop(currentTime) {
    if (!this.isRunning) return;

    if (this.isPaused) {
      this.lastTime = currentTime;
      return;
    }

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;
    this.gameTime += dt;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop);
  }

  update(dt) {
    // 1. Spawning
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnNewWord(false);
      const minInterval = (this.gameMode === 'car') ? 1.4 : 1.2;
      const currentInterval = Math.max(minInterval, this.spawnInterval - (this.gameTime / 60) * 0.4);
      this.spawnTimer = currentInterval + Math.random() * 0.4;
    }

    this.bonusSpawnTimer -= dt;
    if (this.bonusSpawnTimer <= 0) {
      this.spawnNewWord(true);
      this.bonusSpawnTimer = this.bonusSpawnInterval + Math.random() * 6;
    }

    // 2. Physics & Player Animations
    if (this.gameMode === 'car') {
      // Smooth lane transition interpolation
      const targetCarX = this.lanes[this.playerLane];
      const dx = targetCarX - this.carX;
      this.carX += dx * Math.min(1, dt * 14);

      // Car tilt / steering angle recovery
      this.carSteerAngle += (0 - this.carSteerAngle) * dt * 8;

      // Road scroll animation
      this.roadScroll += 360 * dt;
      if (this.nitroFlash > 0) {
        this.nitroFlash = Math.max(0, this.nitroFlash - dt * 2);
      }
    } else {
      // Tank Turret smooth angle interpolation
      const angleDiff = this.tank.targetAngle - this.tank.angle;
      this.tank.angle += angleDiff * Math.min(1, dt * 18);
      this.tank.recoil = Math.max(0, this.tank.recoil - dt * 25);
      this.tank.glowPulse += dt * 3;
    }

    // 3. Update Words
    for (let i = this.words.length - 1; i >= 0; i--) {
      const w = this.words[i];
      if (w.destroyed) {
        this.words.splice(i, 1);
        continue;
      }

      w.y += w.speed * dt;

      // COLLISION CHECK
      if (this.gameMode === 'car') {
        // Car Mode: Check if word reaches the car's vertical position
        if (w.y >= this.carY - 18) {
          // If the word is in the player's lane: DIRECT COLLISION!
          if (w.lane === this.playerLane) {
            const damage = w.isBonus ? 35 : 25;
            this.damageHull(damage);
            this.spawnExplosion(this.carX, this.carY, '#ff0055', 28);
            this.spawnFloatingText(`CRASH! -${damage}%`, this.carX, this.carY - 30, '#ff0055');
          } else {
            // Passed in another lane: Near-miss safe pass!
            this.spawnFloatingText('PASS OK', w.x, this.carY - 10, '#88aacc');
          }

          if (this.lockedWord === w) {
            this.lockedWord = null;
          }
          this.words.splice(i, 1);
        }
      } else {
        // Tank Mode: Check perimeter breach
        if (w.y >= this.defenseY) {
          const damage = w.isBonus ? 30 : 20;
          this.damageHull(damage);
          this.spawnExplosion(w.x, this.defenseY, '#ff3344', 24);
          this.spawnFloatingText(`BREACH! -${damage}%`, w.x, this.defenseY - 20, '#ff0055');

          if (this.lockedWord === w) {
            this.lockedWord = null;
          }
          this.words.splice(i, 1);
        }
      }
    }

    if (this.lockedWord && !this.words.includes(this.lockedWord)) {
      this.lockedWord = null;
    }

    // 4. Update Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;

      if (Math.random() < 0.4) {
        this.particles.push({
          x: b.x,
          y: b.y,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          life: 0.15,
          maxLife: 0.15,
          color: b.isBonus ? this.themeColors.secondary : this.themeColors.primary,
          size: 2
        });
      }

      if (b.life <= 0) {
        this.bullets.splice(i, 1);
      }
    }

    // 5. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 6. Update Floating Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 28);
    }

    if (this.callbacks.onStatsUpdate) {
      this.callbacks.onStatsUpdate(this.getStats());
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.save();

    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    ctx.clearRect(0, 0, this.width, this.height);

    if (this.gameMode === 'car') {
      // 3-LANE HIGHWAY RUNNER
      this.renderHighwayRoad(ctx);
      this.renderWords(ctx);
      this.renderBullets(ctx);
      this.renderParticles(ctx);
      this.renderPlayerCar(ctx);
      this.renderFloatingTexts(ctx);
    } else {
      // TURRET DEFENSE
      this.renderBackground(ctx);
      this.renderDefensePerimeter(ctx);
      this.renderWords(ctx);
      this.renderBullets(ctx);
      this.renderParticles(ctx);
      this.renderTank(ctx);
      this.renderFloatingTexts(ctx);
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // TURRET DEFENSE RENDERING
  // -------------------------------------------------------------------------
  renderBackground(ctx) {
    ctx.strokeStyle = this.themeColors.grid;
    ctx.lineWidth = 1;
    const gridSize = 45;

    ctx.beginPath();
    for (let x = 0; x <= this.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
    }
    for (let y = 0; y <= this.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();

    const grad = ctx.createRadialGradient(
      this.tank.x, this.tank.y, 10,
      this.tank.x, this.tank.y, 280
    );
    grad.addColorStop(0, this.themeColors.dim);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  renderDefensePerimeter(ctx) {
    const y = this.defenseY;
    const glow = 0.5 + Math.sin(this.gameTime * 4) * 0.25;

    ctx.save();
    ctx.strokeStyle = `rgba(255, 0, 85, ${glow * 0.6})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(this.width, y);
    ctx.stroke();

    ctx.strokeStyle = this.themeColors.primary;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, y + 2);
    ctx.lineTo(this.width, y + 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 0, 85, 0.4)';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('/// DEFENSE PERIMETER LOCK ///', 20, y - 6);
    ctx.fillText('/// DO NOT BREACH ///', this.width - 160, y - 6);

    ctx.restore();
  }

  renderTank(ctx) {
    ctx.save();
    const x = this.tank.x;
    const y = this.tank.y;

    const chassisW = 100;
    const chassisH = 16;
    ctx.fillStyle = '#0f1724';
    ctx.strokeStyle = this.themeColors.dim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - chassisW / 2, y + 6, chassisW, chassisH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let tx = -chassisW / 2 + 8; tx < chassisW / 2; tx += 12) {
      ctx.beginPath();
      ctx.moveTo(x + tx, y + 7);
      ctx.lineTo(x + tx, y + 21);
      ctx.stroke();
    }

    const radius = this.tank.radius;
    const grad = ctx.createLinearGradient(x - radius, y - radius, x + radius, y);
    grad.addColorStop(0, '#16253b');
    grad.addColorStop(0.5, '#223859');
    grad.addColorStop(1, '#0e1724');

    ctx.fillStyle = grad;
    ctx.strokeStyle = this.themeColors.primary;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(x, y + 8, radius, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(x, y + 6);
    ctx.rotate(this.tank.angle);

    const bLen = this.tank.barrelLength - this.tank.recoil;
    const bWid = this.tank.barrelWidth;

    ctx.fillStyle = '#1c2d47';
    ctx.strokeStyle = this.themeColors.primary;
    ctx.lineWidth = 2;
    ctx.fillRect(0, -bWid / 2, bLen, bWid);
    ctx.strokeRect(0, -bWid / 2, bLen, bWid);

    ctx.fillStyle = this.themeColors.primary;
    ctx.shadowColor = this.themeColors.primary;
    ctx.shadowBlur = 8;
    ctx.fillRect(8, -2, bLen - 14, 4);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#2b4468';
    ctx.fillRect(bLen - 4, -bWid / 2 - 2, 6, bWid + 4);

    ctx.restore();

    const pulse = 0.8 + Math.sin(this.tank.glowPulse) * 0.2;
    ctx.fillStyle = this.themeColors.primary;
    ctx.shadowColor = this.themeColors.primary;
    ctx.shadowBlur = 12 * pulse;
    ctx.beginPath();
    ctx.arc(x, y + 2, 9 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // HIGHWAY 3-LANE RUNNER RENDERING
  // -------------------------------------------------------------------------
  renderHighwayRoad(ctx) {
    const left = this.roadLeft;
    const width = this.roadWidth;
    const laneW = width / 3;

    // Outer verge / dark ground
    ctx.fillStyle = '#060910';
    ctx.fillRect(0, 0, this.width, this.height);

    // Road surface
    ctx.fillStyle = '#0d131f';
    ctx.fillRect(left, 0, width, this.height);

    // Glowing road boundaries
    ctx.strokeStyle = this.themeColors.primary;
    ctx.lineWidth = 3;
    ctx.shadowColor = this.themeColors.primary;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(left, 0);
    ctx.lineTo(left, this.height);
    ctx.moveTo(left + width, 0);
    ctx.lineTo(left + width, this.height);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Animated dashed lane dividers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([28, 22]);
    ctx.lineDashOffset = -this.roadScroll;

    ctx.beginPath();
    // Lane 0/1 divider
    ctx.moveTo(left + laneW, 0);
    ctx.lineTo(left + laneW, this.height);
    // Lane 1/2 divider
    ctx.moveTo(left + laneW * 2, 0);
    ctx.lineTo(left + laneW * 2, this.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Lane indicators at the bottom
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.textAlign = 'center';
    ctx.fillText('LANE 1 [LEFT]', this.lanes[0], this.height - 16);
    ctx.fillText('LANE 2 [CENTER]', this.lanes[1], this.height - 16);
    ctx.fillText('LANE 3 [RIGHT]', this.lanes[2], this.height - 16);
  }

  renderPlayerCar(ctx) {
    const x = this.carX;
    const y = this.carY;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.carSteerAngle);

    // Neon underglow
    ctx.fillStyle = this.nitroFlash > 0 ? '#ff0055' : this.themeColors.primary;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.ellipse(0, 8, 30, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Supercar Body
    const carW = 46;
    const carH = 34;

    ctx.fillStyle = '#152238';
    ctx.strokeStyle = this.themeColors.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-carW / 2, -carH / 2, carW, carH, 6);
    ctx.fill();
    ctx.stroke();

    // Windshield
    ctx.fillStyle = '#09101d';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-carW * 0.35, -carH / 2 + 5, carW * 0.7, 12, 3);
    ctx.fill();
    ctx.stroke();

    // Twin glowing red taillights
    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 10;
    ctx.fillRect(-carW / 2 + 5, carH / 2 - 4, 8, 3);
    ctx.fillRect(carW / 2 - 13, carH / 2 - 4, 8, 3);
    ctx.shadowBlur = 0;

    // Nitro exhaust burst
    if (this.nitroFlash > 0) {
      ctx.fillStyle = '#ffea00';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(-7, carH / 2);
      ctx.lineTo(-4, carH / 2 + 16);
      ctx.lineTo(-1, carH / 2);
      ctx.moveTo(1, carH / 2);
      ctx.lineTo(4, carH / 2 + 16);
      ctx.lineTo(7, carH / 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // SHARED RENDERING (WORDS, BULLETS, PARTICLES, FLOATING TEXTS)
  // -------------------------------------------------------------------------
  renderWords(ctx) {
    ctx.save();
    ctx.font = 'bold 17px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';

    for (const w of this.words) {
      const isLocked = (w === this.lockedWord);
      const isBonus = w.isBonus;
      const isSameLaneAsCar = (this.gameMode === 'car' && w.lane === this.playerLane);

      const fullW = ctx.measureText(w.text).width;
      const padX = 14;
      const padY = 8;
      const boxW = Math.max(fullW + padX * 2, this.gameMode === 'car' ? 110 : 80);
      const boxH = 34;
      const boxX = w.x - boxW / 2;
      const boxY = w.y - boxH / 2;

      // Card Background
      if (isBonus) {
        ctx.fillStyle = 'rgba(40, 5, 15, 0.9)';
        ctx.strokeStyle = this.themeColors.secondary;
      } else if (isSameLaneAsCar) {
        // High alert: direct collision threat in car's lane!
        ctx.fillStyle = 'rgba(35, 20, 10, 0.92)';
        ctx.strokeStyle = '#ffaa00';
      } else {
        ctx.fillStyle = isLocked ? 'rgba(12, 28, 48, 0.9)' : 'rgba(8, 14, 24, 0.85)';
        ctx.strokeStyle = isLocked ? this.themeColors.primary : 'rgba(255, 255, 255, 0.18)';
      }

      ctx.lineWidth = (isLocked || isSameLaneAsCar) ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      // Threat indicator dot
      ctx.fillStyle = isBonus ? this.themeColors.secondary : (isSameLaneAsCar ? '#ffaa00' : (isLocked ? this.themeColors.primary : '#557799'));
      ctx.beginPath();
      ctx.arc(boxX + 9, w.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Reticle corner brackets on active locked target
      if (isLocked) {
        ctx.strokeStyle = this.themeColors.primary;
        ctx.lineWidth = 2;
        const cornerLen = 6;

        ctx.beginPath();
        ctx.moveTo(boxX - 4, boxY - 4 + cornerLen);
        ctx.lineTo(boxX - 4, boxY - 4);
        ctx.lineTo(boxX - 4 + cornerLen, boxY - 4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(boxX + boxW + 4, boxY + boxH + 4 - cornerLen);
        ctx.lineTo(boxX + boxW + 4, boxY + boxH + 4);
        ctx.lineTo(boxX + boxW + 4 - cornerLen, boxY + boxH + 4);
        ctx.stroke();
      }

      // Characters Rendering
      let currentX = w.x - fullW / 2;

      for (let i = 0; i < w.text.length; i++) {
        const char = w.text[i];
        const charW = ctx.measureText(char).width;

        if (i < w.typedIndex) {
          ctx.fillStyle = isBonus ? 'rgba(255, 0, 85, 0.38)' : 'rgba(0, 240, 255, 0.38)';
          ctx.fillText(char, currentX, w.y);
        } else if (i === w.typedIndex && isLocked) {
          ctx.fillStyle = '#ffffff';
          ctx.fillText(char, currentX, w.y);

          ctx.fillStyle = isBonus ? this.themeColors.secondary : this.themeColors.primary;
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 8;
          ctx.fillRect(currentX, w.y + 11, charW, 3);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = isBonus ? '#ff2a6d' : (isLocked ? '#ffffff' : (isSameLaneAsCar ? '#ffddaa' : '#94a3b8'));
          ctx.fillText(char, currentX, w.y);
        }

        currentX += charW;
      }
    }
    ctx.restore();
  }

  renderBullets(ctx) {
    ctx.save();
    for (const b of this.bullets) {
      ctx.strokeStyle = b.isBonus ? this.themeColors.secondary : this.themeColors.primary;
      ctx.lineWidth = 3;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 10;

      const tracerLen = 22;
      const angle = Math.atan2(b.vy, b.vx);
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(
        b.x - Math.cos(angle) * tracerLen,
        b.y - Math.sin(angle) * tracerLen
      );
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderParticles(ctx) {
    ctx.save();
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderFloatingTexts(ctx) {
    ctx.save();
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    for (const ft of this.floatingTexts) {
      const alpha = Math.max(0, ft.life / ft.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }
}

window.GameEngine = GameEngine;
