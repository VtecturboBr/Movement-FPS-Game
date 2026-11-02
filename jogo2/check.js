
    /* ==========================================================================
       VOID RUNNER - COMPLETE STANDALONE CYBERPUNK HIGH-MOBILITY FPS
       ========================================================================== */

    // --------------------------------------------------------------------------
    // 1. PROCEDURAL WEB AUDIO SYSTEM (Zero External Assets)
    // --------------------------------------------------------------------------
    class SoundEngine {
      constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.bgmGain = null;
        this.bgmNodes = [];
        this.isMuted = false;
      }

      init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.startAmbientDrone();
      }

      resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }

      playGunshot() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        // Sharp transient click
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.09);

        // Noise crackle
        const bufferSize = this.ctx.sampleRate * 0.06;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1200, t);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.6, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(t);
      }

      playHitmarker() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, t);
        osc.frequency.exponentialRampToValueAtTime(1800, t + 0.05);

        gain.gain.setValueAtTime(0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.06);
      }

      playEnemyDeath() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        // Sub bass drop
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'triangle';
        sub.frequency.setValueAtTime(220, t);
        sub.frequency.exponentialRampToValueAtTime(30, t + 0.28);
        subGain.gain.setValueAtTime(0.8, t);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        sub.connect(subGain);
        subGain.connect(this.masterGain);
        sub.start(t);
        sub.stop(t + 0.3);

        // Digital crunch / bit noise
        const bufferSize = this.ctx.sampleRate * 0.18;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.sin(i * 0.08);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, t);
        filter.Q.setValueAtTime(4, t);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.65, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(t);
      }

      playDash() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.22;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(350, t);
        filter.frequency.exponentialRampToValueAtTime(2200, t + 0.08);
        filter.frequency.exponentialRampToValueAtTime(400, t + 0.22);
        filter.Q.setValueAtTime(3, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(t);
      }

      playJump(isDouble = false) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        if (!isDouble) {
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.exponentialRampToValueAtTime(440, t + 0.12);
          gain.gain.setValueAtTime(0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        } else {
          osc.frequency.setValueAtTime(350, t);
          osc.frequency.exponentialRampToValueAtTime(780, t + 0.14);
          gain.gain.setValueAtTime(0.4, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        }

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.15);
      }

      playWallJump() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(150, t + 0.1);
        gain.gain.setValueAtTime(0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.11);
      }

      playReloadStage(stage) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';

        if (stage === 1) { // Eject
          osc.frequency.setValueAtTime(450, t);
          osc.frequency.exponentialRampToValueAtTime(200, t + 0.06);
          gain.gain.setValueAtTime(0.3, t);
        } else if (stage === 2) { // Insert
          osc.frequency.setValueAtTime(320, t);
          osc.frequency.exponentialRampToValueAtTime(700, t + 0.08);
          gain.gain.setValueAtTime(0.4, t);
        } else { // Cock / Lock
          osc.frequency.setValueAtTime(800, t);
          osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
          gain.gain.setValueAtTime(0.45, t);
        }

        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.09);
      }

      playPlayerHurt() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.16);
      }

      playWaveClear() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + idx * 0.08);
          gain.gain.setValueAtTime(0.3, t + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t + idx * 0.08);
          osc.stop(t + idx * 0.08 + 0.4);
        });
      }

      startAmbientDrone() {
        if (!this.ctx) return;
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);

        // Dark cyberpunk bass drone: detuned oscillators + lowpass filter
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(55.6, this.ctx.currentTime); // Slight detune for thick beating

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(240, this.ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(this.bgmGain);

        osc1.start();
        osc2.start();
        this.bgmNodes = [osc1, osc2, filter];
      }
    }

    const sound = new SoundEngine();

    // --------------------------------------------------------------------------
    // 2. PROCEDURAL TEXTURES (Sharp, Glowing Cyberpunk Surfaces)
    // --------------------------------------------------------------------------
    function createGridFloorTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Dark background
      ctx.fillStyle = '#06070d';
      ctx.fillRect(0, 0, 512, 512);

      // Micro grid
      ctx.strokeStyle = '#0a1826';
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x <= 512; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y <= 512; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Major neon cyan grid lines
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      for (let x = 0; x <= 512; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y <= 512; y += 128) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Intersection glowing nodes
      ctx.fillStyle = '#ffffff';
      for (let x = 0; x <= 512; x += 128) {
        for (let y = 0; y <= 512; y += 128) {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(16, 16);
      return tex;
    }

    function createWallTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#07060f';
      ctx.fillRect(0, 0, 512, 512);

      // Tech panel segmentation
      ctx.strokeStyle = '#141226';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, 504, 504);
      ctx.strokeRect(32, 32, 448, 448);

      // Glowing purple neon circuit conduits
      ctx.strokeStyle = '#b300ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#b300ff';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(0, 64);
      ctx.lineTo(160, 64);
      ctx.lineTo(224, 128);
      ctx.lineTo(512, 128);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 448);
      ctx.lineTo(256, 448);
      ctx.lineTo(320, 384);
      ctx.lineTo(512, 384);
      ctx.stroke();

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(8, 2);
      return tex;
    }

    function createPlatformTexture(accentColor = '#00f0ff') {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#0b0c16';
      ctx.fillRect(0, 0, 256, 256);

      ctx.strokeStyle = '#1d2238';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, 244, 244);

      // Glowing corner brackets
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 5;
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 8;

      const corner = 36;
      // Top left
      ctx.beginPath();
      ctx.moveTo(8, 8 + corner);
      ctx.lineTo(8, 8);
      ctx.lineTo(8 + corner, 8);
      ctx.stroke();

      // Top right
      ctx.beginPath();
      ctx.moveTo(248 - corner, 8);
      ctx.lineTo(248, 8);
      ctx.lineTo(248, 8 + corner);
      ctx.stroke();

      // Bottom left
      ctx.beginPath();
      ctx.moveTo(8, 248 - corner);
      ctx.lineTo(8, 248);
      ctx.lineTo(8 + corner, 248);
      ctx.stroke();

      // Bottom right
      ctx.beginPath();
      ctx.moveTo(248 - corner, 248);
      ctx.lineTo(248, 248);
      ctx.lineTo(248, 248 - corner);
      ctx.stroke();

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    // --------------------------------------------------------------------------
    // 3. GAME STATE & VARIABLES
    // --------------------------------------------------------------------------
    const GameState = {
      MENU: 'MENU',
      PLAYING: 'PLAYING',
      PAUSED: 'PAUSED',
      GAMEOVER: 'GAMEOVER'
    };
    let currentState = GameState.MENU;

    let scene, camera, renderer;
    let clock;
    let timeScale = 1.0;
    let hitstopTimer = 0;

    // Arena Obstacles (AABB boxes for collision)
    const obstacles = [];

    // Enemies & Projectiles & Particles
    const enemies = [];
    const enemyProjectiles = [];
    const particles = [];
    const decorativeMeshes = [];

    // Stats
    let currentWave = 1;
    let killsCount = 0;
    let score = 0;
    let shotsFired = 0;
    let shotsHit = 0;
    let enemiesRemainingInWave = 0;
    let waveSpawning = false;
    let waveCountdown = 0;

    // --------------------------------------------------------------------------
    // 4. PLAYER CONTROLLER & MOVEMENT PHYSICS
    // --------------------------------------------------------------------------
    class Player {
      constructor() {
        this.position = new THREE.Vector3(0, 1.7, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.radius = 0.55;
        this.standHeight = 1.75;
        this.slideHeight = 0.85;
        this.currentHeight = this.standHeight;

        // View angles (Mouse look)
        this.yaw = 0;
        this.pitch = 0;
        this.sensitivity = 0.002;

        // Attributes
        this.maxHealth = 100;
        this.health = 100;
        this.isDead = false;

        // Speeds
        this.baseSpeed = 12.0;
        this.sprintSpeed = 21.0;
        this.slideInitialSpeed = 24.0;
        this.jumpForce = 10.0;
        this.doubleJumpForce = 9.2;
        this.wallJumpForceY = 9.5;
        this.wallJumpForceH = 15.0;
        this.dashSpeed = 34.0;
        this.gravity = 25.0;

        // Movement State
        this.onGround = false;
        this.isSprinting = false;
        this.isSliding = false;
        this.slideTimer = 0;
        this.slideDuration = 0.85;
        this.slideDirection = new THREE.Vector3();

        // Air mobility
        this.canDoubleJump = true;
        this.coyoteTime = 0.15; // 150ms
        this.lastGroundedTime = 0;
        this.nearWall = false;
        this.wallNormal = new THREE.Vector3();

        // Dash / Blink
        this.dashCooldown = 0;
        this.maxDashCooldown = 0.8; // Fast reactive dash
        this.dashDuration = 0.18;
        this.dashTimer = 0;
        this.isDashing = false;

        // Screen shake
        this.screenShake = 0;

        // Weapon
        this.weapon = null;
      }

      reset() {
        this.position.set(0, 1.7, 0);
        this.velocity.set(0, 0, 0);
        this.yaw = 0;
        this.pitch = 0;
        this.health = this.maxHealth;
        this.isDead = false;
        this.dashCooldown = 0;
        this.isSliding = false;
        this.isDashing = false;
        this.canDoubleJump = true;
        this.currentHeight = this.standHeight;
      }

      takeDamage(amount) {
        if (this.isDead || this.isDashing) return;
        this.health = Math.max(0, this.health - amount);
        this.screenShake = 0.22;
        sound.playPlayerHurt();

        // Damage flash UI
        const overlay = document.getElementById('damage-overlay');
        overlay.style.opacity = '0.8';
        setTimeout(() => { overlay.style.opacity = '0'; }, 120);

        updateHUD();

        if (this.health <= 0) {
          this.die();
        }
      }

      die() {
        this.isDead = true;
        triggerGameOver();
      }

      triggerDash(inputDir) {
        if (this.dashCooldown > 0 || this.isDead) return;
        this.dashCooldown = this.maxDashCooldown;
        this.isDashing = true;
        this.dashTimer = this.dashDuration;

        // Dash in movement direction or facing direction
        let dir = new THREE.Vector3();
        if (inputDir.lengthSq() > 0.1) {
          dir.copy(inputDir).normalize();
        } else {
          dir.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
        }

        this.velocity.x = dir.x * this.dashSpeed;
        this.velocity.z = dir.z * this.dashSpeed;
        this.velocity.y = Math.max(this.velocity.y, 2.0); // Slight lift

        sound.playDash();

        // Screen FX
        const dashOverlay = document.getElementById('dash-overlay');
        dashOverlay.style.opacity = '1';
        setTimeout(() => { dashOverlay.style.opacity = '0'; }, 160);

        // Spawn dash trail particles
        for (let i = 0; i < 8; i++) {
          spawnParticle(
            this.position.clone().add(new THREE.Vector3((Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8)),
            dir.clone().multiplyScalar(-3).add(new THREE.Vector3((Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*2)),
            0x00f0ff,
            0.15,
            0.35
          );
        }
      }

      update(dt, input) {
        if (this.isDead) return;

        const currentTime = performance.now() / 1000;

        // Timers
        if (this.dashCooldown > 0) this.dashCooldown -= dt;
        if (this.isDashing) {
          this.dashTimer -= dt;
          if (this.dashTimer <= 0) this.isDashing = false;
        }

        // 1. Calculate horizontal movement directions from Yaw
        const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
        const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

        const moveDir = new THREE.Vector3();
        if (input.forward) moveDir.add(forward);
        if (input.backward) moveDir.sub(forward);
        if (input.right) moveDir.add(right);
        if (input.left) moveDir.sub(right);

        const hasMoveInput = moveDir.lengthSq() > 0.001;
        if (hasMoveInput) moveDir.normalize();

        // 2. Dash Check
        if (input.dashPressed) {
          this.triggerDash(moveDir);
          input.dashPressed = false;
        }

        // 3. Sprint & Slide Handling
        this.isSprinting = input.sprint && hasMoveInput && !this.isSliding && this.onGround;

        // Slide Trigger (Ctrl or C while moving)
        if (input.slide && !this.isSliding && this.onGround && hasMoveInput) {
          this.isSliding = true;
          this.slideTimer = this.slideDuration;
          this.slideDirection.copy(moveDir);
          this.velocity.x = this.slideDirection.x * this.slideInitialSpeed;
          this.velocity.z = this.slideDirection.z * this.slideInitialSpeed;
          sound.playJump(); // low whoosh
        }

        // Update Slide
        if (this.isSliding) {
          this.slideTimer -= dt;
          this.currentHeight = THREE.MathUtils.lerp(this.currentHeight, this.slideHeight, 0.2);

          // Friction during slide
          const slideFriction = 0.965;
          this.velocity.x *= Math.pow(slideFriction, dt * 60);
          this.velocity.z *= Math.pow(slideFriction, dt * 60);

          if (this.slideTimer <= 0 || !this.onGround || this.velocity.length() < 5) {
            this.isSliding = false;
          }
        } else {
          this.currentHeight = THREE.MathUtils.lerp(this.currentHeight, this.standHeight, 0.2);
        }

        // 4. Jump & Double Jump & Wall Jump
        if (this.onGround) {
          this.lastGroundedTime = currentTime;
          this.canDoubleJump = true;
        }

        const canCoyoteJump = (currentTime - this.lastGroundedTime) <= this.coyoteTime;

        if (input.jumpPressed) {
          input.jumpPressed = false;

          if (this.onGround || canCoyoteJump) {
            // Normal ground jump
            this.velocity.y = this.jumpForce;
            this.onGround = false;
            this.lastGroundedTime = 0;
            if (this.isSliding) {
              // Slide-jump momentum boost! (Titanfall feel)
              this.velocity.add(this.slideDirection.clone().multiplyScalar(4.0));
              this.isSliding = false;
            }
            sound.playJump(false);
          } else if (this.nearWall) {
            // Wall Jump!
            this.velocity.y = this.wallJumpForceY;
            this.velocity.x = this.wallNormal.x * this.wallJumpForceH;
            this.velocity.z = this.wallNormal.z * this.wallJumpForceH;
            this.canDoubleJump = true; // resets air jump
            sound.playWallJump();

            // Spawn wall sparks
            for (let i = 0; i < 10; i++) {
              spawnParticle(
                this.position.clone().add(this.wallNormal.clone().multiplyScalar(-0.4)),
                this.wallNormal.clone().multiplyScalar(4).add(new THREE.Vector3((Math.random()-0.5)*3, Math.random()*3, (Math.random()-0.5)*3)),
                0xff007f,
                0.2,
                0.4
              );
            }
          } else if (this.canDoubleJump) {
            // Double Jump
            this.velocity.y = this.doubleJumpForce;
            this.canDoubleJump = false;
            sound.playJump(true);

            // Double jump air blast particle ring
            for (let i = 0; i < 14; i++) {
              const angle = (i / 14) * Math.PI * 2;
              spawnParticle(
                this.position.clone().setY(this.position.y),
                new THREE.Vector3(Math.cos(angle) * 5, -1, Math.sin(angle) * 5),
                0x00f0ff,
                0.15,
                0.3
              );
            }
          }
        }

        // 5. Horizontal Acceleration & Friction (When not sliding or dashing)
        if (!this.isSliding && !this.isDashing) {
          let targetSpeed = this.baseSpeed;
          if (this.isSprinting) targetSpeed = this.sprintSpeed;

          const accel = this.onGround ? 85.0 : 45.0; // Responsive air control
          const friction = this.onGround ? 12.0 : 2.5;

          if (hasMoveInput) {
            const targetVelX = moveDir.x * targetSpeed;
            const targetVelZ = moveDir.z * targetSpeed;
            this.velocity.x += (targetVelX - this.velocity.x) * Math.min(1.0, accel * dt);
            this.velocity.z += (targetVelZ - this.velocity.z) * Math.min(1.0, accel * dt);
          } else {
            // Apply friction deceleration
            this.velocity.x += (0 - this.velocity.x) * Math.min(1.0, friction * dt);
            this.velocity.z += (0 - this.velocity.z) * Math.min(1.0, friction * dt);
          }
        }

        // 6. Gravity
        this.velocity.y -= this.gravity * dt;

        // 7. Physics Collision Detection & Resolution (AABB Sliding)
        this.resolveCollision(dt);

        // 8. Update Camera Position & Rotation
        camera.position.x = this.position.x;
        camera.position.y = this.position.y + this.currentHeight;
        camera.position.z = this.position.z;

        // Screen Shake
        if (this.screenShake > 0) {
          camera.position.x += (Math.random() - 0.5) * this.screenShake;
          camera.position.y += (Math.random() - 0.5) * this.screenShake;
          this.screenShake = Math.max(0, this.screenShake - dt * 2.0);
        }

        // Camera Orientation
        camera.rotation.order = 'YXZ';
        camera.rotation.y = this.yaw;
        camera.rotation.x = this.pitch;

        // Camera Tilt on Strafe / Slide for juice
        let targetTilt = 0;
        if (input.left) targetTilt += 0.025;
        if (input.right) targetTilt -= 0.025;
        if (this.isSliding) targetTilt += 0.04;
        camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetTilt, 0.15);

        // Dynamic FOV (speed-based sense of speed)
        let targetFov = 75;
        if (this.isDashing) targetFov = 94;
        else if (this.isSliding) targetFov = 82;
        else if (this.isSprinting) targetFov = 86;
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.12);
        camera.updateProjectionMatrix();

        // Wall Jump Indicator UI
        const wallInd = document.getElementById('wall-indicator');
        if (this.nearWall && !this.onGround) {
          wallInd.style.opacity = '1';
        } else {
          wallInd.style.opacity = '0';
        }
      }

      resolveCollision(dt) {
        this.nearWall = false;
        this.wallNormal.set(0, 0, 0);

        // Step 1: Vertical Collision (Y)
        this.position.y += this.velocity.y * dt;
        this.onGround = false;

        // Ground floor
        if (this.position.y <= 0) {
          this.position.y = 0;
          this.velocity.y = 0;
          this.onGround = true;
        }

        // Obstacle platforms Y
        for (const obs of obstacles) {
          const minX = obs.box.min.x - this.radius;
          const maxX = obs.box.max.x + this.radius;
          const minZ = obs.box.min.z - this.radius;
          const maxZ = obs.box.max.z + this.radius;

          if (this.position.x > minX && this.position.x < maxX && this.position.z > minZ && this.position.z < maxZ) {
            // Landing on top of platform
            if (this.velocity.y <= 0 && this.position.y >= obs.box.max.y - 0.4 && this.position.y <= obs.box.max.y + 0.3) {
              this.position.y = obs.box.max.y;
              this.velocity.y = 0;
              this.onGround = true;
            }
            // Hitting bottom of floating platform
            else if (this.velocity.y > 0 && (this.position.y + this.currentHeight) >= obs.box.min.y && this.position.y < obs.box.min.y) {
              this.position.y = obs.box.min.y - this.currentHeight - 0.02;
              this.velocity.y = 0;
            }
          }
        }

        // Step 2: Horizontal Collision (X)
        this.position.x += this.velocity.x * dt;
        // Arena outer boundary
        const boundary = 38.8;
        if (this.position.x < -boundary) {
          this.position.x = -boundary;
          this.velocity.x = 0;
          this.nearWall = true;
          this.wallNormal.set(1, 0, 0);
        } else if (this.position.x > boundary) {
          this.position.x = boundary;
          this.velocity.x = 0;
          this.nearWall = true;
          this.wallNormal.set(-1, 0, 0);
        }

        for (const obs of obstacles) {
          if (this.checkAABBOverlap(obs.box)) {
            if (this.velocity.x > 0) {
              this.position.x = obs.box.min.x - this.radius;
              this.wallNormal.set(-1, 0, 0);
            } else if (this.velocity.x < 0) {
              this.position.x = obs.box.max.x + this.radius;
              this.wallNormal.set(1, 0, 0);
            }
            this.velocity.x = 0;
            this.nearWall = true;
          }
        }

        // Step 3: Horizontal Collision (Z)
        this.position.z += this.velocity.z * dt;
        if (this.position.z < -boundary) {
          this.position.z = -boundary;
          this.velocity.z = 0;
          this.nearWall = true;
          this.wallNormal.set(0, 0, 1);
        } else if (this.position.z > boundary) {
          this.position.z = boundary;
          this.velocity.z = 0;
          this.nearWall = true;
          this.wallNormal.set(0, 0, -1);
        }

        for (const obs of obstacles) {
          if (this.checkAABBOverlap(obs.box)) {
            if (this.velocity.z > 0) {
              this.position.z = obs.box.min.z - this.radius;
              this.wallNormal.set(0, 0, -1);
            } else if (this.velocity.z < 0) {
              this.position.z = obs.box.max.z + this.radius;
              this.wallNormal.set(0, 0, 1);
            }
            this.velocity.z = 0;
            this.nearWall = true;
          }
        }

        // Proximity check for wall jumping (forgiving detection in air)
        if (!this.onGround && !this.nearWall) {
          const proximity = 0.38;
          // Check outer arena boundaries
          if (this.position.x <= -boundary + proximity) {
            this.nearWall = true;
            this.wallNormal.set(1, 0, 0);
          } else if (this.position.x >= boundary - proximity) {
            this.nearWall = true;
            this.wallNormal.set(-1, 0, 0);
          } else if (this.position.z <= -boundary + proximity) {
            this.nearWall = true;
            this.wallNormal.set(0, 0, 1);
          } else if (this.position.z >= boundary - proximity) {
            this.nearWall = true;
            this.wallNormal.set(0, 0, -1);
          } else {
            // Check obstacle platforms
            for (const obs of obstacles) {
              const b = obs.box;
              const playerBottom = this.position.y;
              const playerTop = this.position.y + this.currentHeight;
              if (playerBottom < b.max.y && playerTop > b.min.y) {
                const distMinX = Math.abs((this.position.x + this.radius) - b.min.x);
                const distMaxX = Math.abs((this.position.x - this.radius) - b.max.x);
                const distMinZ = Math.abs((this.position.z + this.radius) - b.min.z);
                const distMaxZ = Math.abs((this.position.z - this.radius) - b.max.z);
                const withinZ = this.position.z >= (b.min.z - 0.2) && this.position.z <= (b.max.z + 0.2);
                const withinX = this.position.x >= (b.min.x - 0.2) && this.position.x <= (b.max.x + 0.2);

                if (withinZ && distMinX < proximity) {
                  this.nearWall = true;
                  this.wallNormal.set(-1, 0, 0);
                  break;
                } else if (withinZ && distMaxX < proximity) {
                  this.nearWall = true;
                  this.wallNormal.set(1, 0, 0);
                  break;
                } else if (withinX && distMinZ < proximity) {
                  this.nearWall = true;
                  this.wallNormal.set(0, 0, -1);
                  break;
                } else if (withinX && distMaxZ < proximity) {
                  this.nearWall = true;
                  this.wallNormal.set(0, 0, 1);
                  break;
                }
              }
            }
          }
        }
      }

      checkAABBOverlap(box) {
        const playerBottom = this.position.y;
        const playerTop = this.position.y + this.currentHeight;

        // Vertical overlap check
        if (playerBottom >= box.max.y || playerTop <= box.min.y) return false;

        // Horizontal overlap check
        if ((this.position.x + this.radius) <= box.min.x || (this.position.x - this.radius) >= box.max.x) return false;
        if ((this.position.z + this.radius) <= box.min.z || (this.position.z - this.radius) >= box.max.z) return false;

        return true;
      }
    }

    // --------------------------------------------------------------------------
    // 5. WEAPON SYSTEM (PULSE RIFLE - HITSCAN)
    // --------------------------------------------------------------------------
    class PulseRifle {
      constructor(player) {
        this.player = player;
        this.maxAmmo = 30;
        this.currentAmmo = 30;
        this.fireRate = 8; // 8 rounds/sec = 125ms interval
        this.fireInterval = 1 / this.fireRate;
        this.lastFireTime = 0;

        this.isReloading = false;
        this.reloadDuration = 1.2;
        this.reloadTimer = 0;

        this.damage = 35; // Cube Drone takes 2 shots, Spiker takes 3, Sentry takes 5

        // Gun Model Group (attached to camera)
        this.mesh = this.buildGunModel();
        camera.add(this.mesh);

        // Recoil state
        this.restPos = new THREE.Vector3(0.32, -0.28, -0.6);
        this.restRot = new THREE.Vector3(0, 0, 0);
        this.recoilZ = 0;
        this.recoilRotX = 0;

        // Muzzle Flash
        this.muzzleFlash = this.buildMuzzleFlash();
        this.mesh.add(this.muzzleFlash);
        this.muzzleFlashTimer = 0;

        // Laser tracer beam
        this.tracerMaterial = new THREE.LineBasicMaterial({
          color: 0x00f0ff,
          linewidth: 2,
          transparent: true,
          opacity: 0.9
        });
      }

      buildGunModel() {
        const gun = new THREE.Group();

        // Main body (dark carbon block)
        const bodyGeo = new THREE.BoxGeometry(0.12, 0.16, 0.55);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0x11131c,
          roughness: 0.3,
          metalness: 0.85
        });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.position.set(0, 0, 0);
        gun.add(bodyMesh);

        // Dual rail barrels
        const barrelGeo = new THREE.BoxGeometry(0.035, 0.04, 0.45);
        const barrelMat = new THREE.MeshStandardMaterial({
          color: 0x242838,
          roughness: 0.2,
          metalness: 0.9
        });
        const barrelTop = new THREE.Mesh(barrelGeo, barrelMat);
        barrelTop.position.set(0, 0.045, -0.42);
        const barrelBottom = new THREE.Mesh(barrelGeo, barrelMat);
        barrelBottom.position.set(0, -0.045, -0.42);
        gun.add(barrelTop);
        gun.add(barrelBottom);

        // Glowing cyan plasma core rail in between
        const coreGeo = new THREE.BoxGeometry(0.015, 0.02, 0.42);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.position.set(0, 0, -0.4);
        gun.add(coreMesh);

        // Energy battery clip
        const magGeo = new THREE.BoxGeometry(0.08, 0.18, 0.12);
        const magMat = new THREE.MeshStandardMaterial({
          color: 0xff007f,
          emissive: 0xff007f,
          emissiveIntensity: 0.4,
          roughness: 0.4
        });
        const magMesh = new THREE.Mesh(magGeo, magMat);
        magMesh.position.set(0, -0.12, 0.08);
        magMesh.rotation.x = 0.2;
        gun.add(magMesh);

        // Holographic sight ring
        const sightGeo = new THREE.RingGeometry(0.025, 0.035, 16);
        const sightMat = new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const sightMesh = new THREE.Mesh(sightGeo, sightMat);
        sightMesh.position.set(0, 0.12, -0.15);
        gun.add(sightMesh);

        gun.position.copy(this.restPos);
        return gun;
      }

      buildMuzzleFlash() {
        const flashGeo = new THREE.ConeGeometry(0.12, 0.28, 8);
        flashGeo.rotateX(-Math.PI / 2);
        const flashMat = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.9
        });
        const flash = new THREE.Mesh(flashGeo, flashMat);
        flash.position.set(0, 0, -0.72);
        flash.visible = false;
        return flash;
      }

      fire() {
        if (this.isReloading) return;
        if (this.currentAmmo <= 0) {
          this.reload();
          return;
        }

        const now = performance.now() / 1000;
        if (now - this.lastFireTime < this.fireInterval) return;

        this.lastFireTime = now;
        this.currentAmmo--;
        shotsFired++;
        sound.playGunshot();

        // Muzzle Flash
        this.muzzleFlash.visible = true;
        this.muzzleFlashTimer = 0.04;
        this.muzzleFlash.rotation.z = Math.random() * Math.PI;

        // Recoil kick
        this.recoilZ = 0.12;
        this.recoilRotX = 0.14;
        this.player.screenShake = Math.max(this.player.screenShake, 0.06);

        // Hitscan Raycast from camera center
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

        // Gather enemy meshes and obstacle meshes
        const targetObjects = [];
        for (const enemy of enemies) {
          if (!enemy.isDead && enemy.hitMesh) {
            targetObjects.push(enemy.hitMesh);
          }
        }
        for (const obs of obstacles) {
          targetObjects.push(obs.mesh);
        }

        const intersects = raycaster.intersectObjects(targetObjects, false);
        let hitPoint = null;

        if (intersects.length > 0) {
          const hit = intersects[0];
          hitPoint = hit.point;

          // Check if it's an enemy
          let hitEnemy = null;
          for (const enemy of enemies) {
            if (enemy.hitMesh === hit.object) {
              hitEnemy = enemy;
              break;
            }
          }

          if (hitEnemy) {
            shotsHit++;
            hitEnemy.takeDamage(this.damage, hit.point);
            triggerHitmarker();
          } else {
            // Hit world/obstacle -> sparks
            spawnSparks(hit.point, hit.face ? hit.face.normal : new THREE.Vector3(0, 1, 0), 0x00f0ff, 12);
          }
        } else {
          // Into the void
          hitPoint = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(80));
        }

        // Spawn instant glowing pulse tracer beam
        this.createTracer(hitPoint);

        updateHUD();

        if (this.currentAmmo <= 0) {
          this.reload();
        }
      }

      createTracer(targetPos) {
        // World position of gun barrel tip
        const barrelWorldPos = new THREE.Vector3();
        this.muzzleFlash.getWorldPosition(barrelWorldPos);

        const points = [barrelWorldPos, targetPos];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geo, this.tracerMaterial.clone());
        scene.add(line);

        // Fade out and remove tracer
        let life = 0.06;
        const tracerObj = {
          line,
          life,
          update(dt) {
            life -= dt;
            line.material.opacity = Math.max(0, life / 0.06);
            if (life <= 0) {
              scene.remove(line);
              line.geometry.dispose();
              line.material.dispose();
              return true; // remove
            }
            return false;
          }
        };
        particles.push(tracerObj);
      }

      reload() {
        if (this.isReloading || this.currentAmmo === this.maxAmmo) return;
        this.isReloading = true;
        this.reloadTimer = this.reloadDuration;
        sound.playReloadStage(1);

        // UI reload bar
        document.getElementById('reload-bar-container').style.display = 'block';
        document.getElementById('reload-text').style.display = 'block';
      }

      update(dt, input) {
        // Muzzle Flash Timer
        if (this.muzzleFlash.visible) {
          this.muzzleFlashTimer -= dt;
          if (this.muzzleFlashTimer <= 0) {
            this.muzzleFlash.visible = false;
          }
        }

        // Reload Logic
        if (this.isReloading) {
          this.reloadTimer -= dt;
          const progress = 1.0 - (this.reloadTimer / this.reloadDuration);
          document.getElementById('reload-bar-fill').style.width = `${Math.min(100, progress * 100)}%`;

          if (progress > 0.45 && progress < 0.55 && !this._reloadedStage2) {
            sound.playReloadStage(2);
            this._reloadedStage2 = true;
          }
          if (progress > 0.85 && !this._reloadedStage3) {
            sound.playReloadStage(3);
            this._reloadedStage3 = true;
          }

          if (this.reloadTimer <= 0) {
            this.currentAmmo = this.maxAmmo;
            this.isReloading = false;
            this._reloadedStage2 = false;
            this._reloadedStage3 = false;
            document.getElementById('reload-bar-container').style.display = 'none';
            document.getElementById('reload-text').style.display = 'none';
            updateHUD();
          }
        }

        // Auto Fire when mouse is held down
        if (input.firing) {
          this.fire();
        }

        // Gun Recoil & Sway Animation
        this.recoilZ = THREE.MathUtils.lerp(this.recoilZ, 0, dt * 14);
        this.recoilRotX = THREE.MathUtils.lerp(this.recoilRotX, 0, dt * 14);

        // Movement bobbing
        const speed = this.player.velocity.length();
        const time = performance.now() * 0.006;
        let bobX = 0;
        let bobY = 0;
        if (this.player.onGround && speed > 1) {
          bobX = Math.sin(time) * 0.015;
          bobY = Math.abs(Math.cos(time)) * 0.018;
        }

        // Reload drop animation
        let reloadOffsetY = 0;
        if (this.isReloading) {
          const reloadCycle = Math.sin((this.reloadTimer / this.reloadDuration) * Math.PI);
          reloadOffsetY = -0.25 * reloadCycle;
        }

        this.mesh.position.set(
          this.restPos.x + bobX,
          this.restPos.y + bobY + reloadOffsetY,
          this.restPos.z + this.recoilZ
        );
        this.mesh.rotation.x = this.restRot.x + this.recoilRotX + (reloadOffsetY * 1.5);
      }
    }

    // --------------------------------------------------------------------------
    // 6. ENEMY AI & HIERARCHY (CUBE DRONE, SPIKER, SENTRY)
    // --------------------------------------------------------------------------
    class Enemy {
      constructor(type, x, y, z) {
        this.type = type;
        this.position = new THREE.Vector3(x, y, z);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.isDead = false;
        this.flashTimer = 0;

        this.group = new THREE.Group();
        this.group.position.copy(this.position);
        scene.add(this.group);

        this.buildMesh();
      }

      buildMesh() {
        if (this.type === 'CUBE') {
          this.maxHealth = 50;
          this.health = this.maxHealth;
          this.speed = 7.5;
          this.shootInterval = 2.0;
          this.shootTimer = Math.random() * 1.5;

          // Red glowing floating cube
          const geo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
          this.material = new THREE.MeshStandardMaterial({
            color: 0xff1133,
            emissive: 0xaa0022,
            roughness: 0.2,
            metalness: 0.8
          });
          this.hitMesh = new THREE.Mesh(geo, this.material);
          this.group.add(this.hitMesh);

          // Outer rotating wireframe frame
          const wireGeo = new THREE.BoxGeometry(1.85, 1.85, 1.85);
          const wireMat = new THREE.MeshBasicMaterial({ color: 0xff3355, wireframe: true });
          this.wireMesh = new THREE.Mesh(wireGeo, wireMat);
          this.group.add(this.wireMesh);

          // Floating bobbing offset
          this.hoverY = 2.6 + Math.random() * 1.5;

        } else if (this.type === 'SPIKER') {
          this.maxHealth = 80;
          this.health = this.maxHealth;
          this.speed = 14.5; // Fast melee charger!
          this.attackCooldown = 0;

          // Elongated diamond (octahedron)
          const geo = new THREE.OctahedronGeometry(1.4, 0);
          this.material = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff4400,
            emissiveIntensity: 0.6,
            roughness: 0.15,
            metalness: 0.9
          });
          this.hitMesh = new THREE.Mesh(geo, this.material);
          this.hitMesh.scale.set(0.8, 1.8, 0.8);
          this.group.add(this.hitMesh);

          // Wireframe outline
          const wireGeo = new THREE.OctahedronGeometry(1.5, 0);
          const wireMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true });
          this.wireMesh = new THREE.Mesh(wireGeo, wireMat);
          this.wireMesh.scale.set(0.85, 1.85, 0.85);
          this.group.add(this.wireMesh);

          this.hoverY = 1.4;

        } else if (this.type === 'SENTRY') {
          this.maxHealth = 150;
          this.health = this.maxHealth;
          this.speed = 0; // Stationary
          this.burstInterval = 3.2;
          this.burstTimer = 1.0;
          this.burstShotsRemaining = 0;
          this.burstShotTimer = 0;

          // Hexagonal base pillar
          const baseGeo = new THREE.CylinderGeometry(1.5, 1.8, 3.2, 6);
          const baseMat = new THREE.MeshStandardMaterial({
            color: 0x1f1235,
            roughness: 0.3,
            metalness: 0.9
          });
          const baseMesh = new THREE.Mesh(baseGeo, baseMat);
          baseMesh.position.y = 1.6;
          this.group.add(baseMesh);

          // Glowing purple trims
          const trimGeo = new THREE.CylinderGeometry(1.55, 1.55, 0.2, 6);
          const trimMat = new THREE.MeshBasicMaterial({ color: 0xb300ff });
          const trimMesh = new THREE.Mesh(trimGeo, trimMat);
          trimMesh.position.y = 2.4;
          this.group.add(trimMesh);

          // Rotating turret head
          const headGeo = new THREE.BoxGeometry(1.3, 1.1, 1.8);
          this.material = new THREE.MeshStandardMaterial({
            color: 0x8a2be2,
            emissive: 0x5a009d,
            roughness: 0.2,
            metalness: 0.8
          });
          this.headMesh = new THREE.Mesh(headGeo, this.material);
          this.headMesh.position.y = 3.6;
          this.group.add(this.headMesh);

          // Glowing eye/barrel
          const barrelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
          barrelGeo.rotateX(Math.PI / 2);
          const barrelMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
          const barrelMesh = new THREE.Mesh(barrelGeo, barrelMat);
          barrelMesh.position.set(0, 0, 0.9);
          this.headMesh.add(barrelMesh);

          this.hitMesh = baseMesh; // primary collision
        }
      }

      takeDamage(amount, hitPoint) {
        if (this.isDead) return;
        this.health -= amount;

        // White hit flash
        this.flashTimer = 0.08;
        if (this.material) {
          this.originalColor = this.material.color.clone();
          this.material.color.setHex(0xffffff);
          if (this.material.emissive) this.material.emissive.setHex(0xffffff);
        }

        // Spark particles at hit point
        spawnSparks(hitPoint, new THREE.Vector3(0, 1, 0), 0xffaa00, 14);

        if (this.health <= 0) {
          this.die();
        }
      }

      die() {
        this.isDead = true;
        killsCount++;
        score += (this.type === 'CUBE' ? 100 : this.type === 'SPIKER' ? 180 : 300);
        enemiesRemainingInWave--;

        sound.playEnemyDeath();

        // Hitstop slow-motion & white screen flash (feels amazing!)
        triggerKillFX();

        // Shatter Disintegration Particles
        const count = 32;
        const color = (this.type === 'CUBE' ? 0xff2244 : this.type === 'SPIKER' ? 0xff7700 : 0xb300ff);
        for (let i = 0; i < count; i++) {
          const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 16,
            Math.random() * 12 + 2,
            (Math.random() - 0.5) * 16
          );
          spawnParticle(this.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)), vel, color, 0.35, 0.65, true);
        }

        // Clean up from scene
        scene.remove(this.group);
        updateHUD();

        // Check wave cleared
        if (enemiesRemainingInWave <= 0 && !waveSpawning) {
          onWaveCleared();
        }
      }

      update(dt, player) {
        if (this.isDead) return;

        // Restore material flash
        if (this.flashTimer > 0) {
          this.flashTimer -= dt;
          if (this.flashTimer <= 0 && this.material) {
            if (this.type === 'CUBE') {
              this.material.color.setHex(0xff1133);
              this.material.emissive.setHex(0xaa0022);
            } else if (this.type === 'SPIKER') {
              this.material.color.setHex(0xff6600);
              this.material.emissive.setHex(0xff4400);
            } else if (this.type === 'SENTRY') {
              this.material.color.setHex(0x8a2be2);
              this.material.emissive.setHex(0x5a009d);
            }
          }
        }

        const toPlayer = new THREE.Vector3().subVectors(player.position, this.group.position);
        const distToPlayer = toPlayer.length();

        // AI Logic by Type
        if (this.type === 'CUBE') {
          // Hover and drift toward player
          const time = performance.now() * 0.003;
          this.group.position.y = this.hoverY + Math.sin(time + this.group.position.x) * 0.6;

          if (distToPlayer > 8.0) {
            const moveDir = toPlayer.clone().normalize();
            this.group.position.x += moveDir.x * this.speed * dt;
            this.group.position.z += moveDir.z * this.speed * dt;
          }

          // Spin outer wireframe
          if (this.wireMesh) {
            this.wireMesh.rotation.x += dt * 1.5;
            this.wireMesh.rotation.y += dt * 2.0;
          }

          // Shoot projectile at player
          this.shootTimer -= dt;
          if (this.shootTimer <= 0) {
            this.shootTimer = this.shootInterval;
            this.shootProjectile(player.position.clone().add(new THREE.Vector3(0, player.currentHeight * 0.5, 0)));
          }

        } else if (this.type === 'SPIKER') {
          // Fast ground charger!
          this.group.position.y = this.hoverY;

          if (this.attackCooldown > 0) this.attackCooldown -= dt;

          const moveDir = toPlayer.clone().normalize();
          this.group.position.x += moveDir.x * this.speed * dt;
          this.group.position.z += moveDir.z * this.speed * dt;

          // Aggressive spin
          this.hitMesh.rotation.y += dt * 6.0;
          this.wireMesh.rotation.y -= dt * 6.0;

          // Melee attack if within range
          if (distToPlayer < 2.0 && this.attackCooldown <= 0) {
            player.takeDamage(20);
            this.attackCooldown = 1.0;
            // Push player back
            player.velocity.add(moveDir.clone().multiplyScalar(10));
          }

        } else if (this.type === 'SENTRY') {
          // Rotate head towards player
          if (this.headMesh) {
            this.headMesh.lookAt(player.position.x, player.position.y + player.currentHeight * 0.5, player.position.z);
          }

          // Burst fire
          this.burstTimer -= dt;
          if (this.burstTimer <= 0) {
            this.burstShotsRemaining = 3;
            this.burstShotTimer = 0;
            this.burstTimer = this.burstInterval;
          }

          if (this.burstShotsRemaining > 0) {
            this.burstShotTimer -= dt;
            if (this.burstShotTimer <= 0) {
              this.burstShotsRemaining--;
              this.burstShotTimer = 0.16; // 160ms between burst shots
              const targetAim = player.position.clone().add(new THREE.Vector3(0, player.currentHeight * 0.5, 0));
              this.shootLaserDart(targetAim);
            }
          }
        }
      }

      shootProjectile(targetPos) {
        const spawnPos = this.group.position.clone().add(new THREE.Vector3(0, 0.4, 0));
        const dir = new THREE.Vector3().subVectors(targetPos, spawnPos).normalize();

        const geo = new THREE.SphereGeometry(0.35, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(spawnPos);
        scene.add(mesh);

        enemyProjectiles.push({
          mesh,
          velocity: dir.multiplyScalar(15.0),
          life: 5.0,
          radius: 0.35,
          damage: 15,
          color: 0xff0044
        });
      }

      shootLaserDart(targetPos) {
        const spawnPos = this.group.position.clone().add(new THREE.Vector3(0, 3.6, 0));
        const dir = new THREE.Vector3().subVectors(targetPos, spawnPos).normalize();

        const geo = new THREE.SphereGeometry(0.28, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: 0xb300ff });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(spawnPos);
        scene.add(mesh);

        enemyProjectiles.push({
          mesh,
          velocity: dir.multiplyScalar(22.0),
          life: 4.0,
          radius: 0.28,
          damage: 12,
          color: 0xb300ff
        });
      }
    }

    // --------------------------------------------------------------------------
    // 7. PARTICLES & VISUAL FX SYSTEMS
    // --------------------------------------------------------------------------
    function spawnParticle(pos, vel, color, size = 0.2, maxLife = 0.5, isShard = false) {
      let mesh;
      if (isShard) {
        const geo = new THREE.BoxGeometry(size, size, size);
        const mat = new THREE.MeshBasicMaterial({ color });
        mesh = new THREE.Mesh(geo, mat);
      } else {
        const geo = new THREE.SphereGeometry(size, 4, 4);
        const mat = new THREE.MeshBasicMaterial({ color });
        mesh = new THREE.Mesh(geo, mat);
      }
      mesh.position.copy(pos);
      scene.add(mesh);

      particles.push({
        mesh,
        velocity: vel,
        life: maxLife,
        maxLife,
        rotSpeed: isShard ? new THREE.Vector3(Math.random()*15, Math.random()*15, Math.random()*15) : null,
        update(dt) {
          this.life -= dt;
          this.velocity.y -= 18.0 * dt; // gravity
          this.mesh.position.addScaledVector(this.velocity, dt);

          if (this.rotSpeed) {
            this.mesh.rotation.x += this.rotSpeed.x * dt;
            this.mesh.rotation.y += this.rotSpeed.y * dt;
          }

          const scale = Math.max(0.001, this.life / this.maxLife);
          this.mesh.scale.set(scale, scale, scale);

          if (this.life <= 0 || this.mesh.position.y < 0) {
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            return true;
          }
          return false;
        }
      });
    }

    function spawnSparks(pos, normal, color, count = 10) {
      for (let i = 0; i < count; i++) {
        const dir = normal.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 1.6,
          (Math.random() - 0.5) * 1.6,
          (Math.random() - 0.5) * 1.6
        )).normalize();
        const speed = Math.random() * 12 + 4;
        spawnParticle(pos, dir.multiplyScalar(speed), color, 0.12, 0.35);
      }
    }

    function triggerHitmarker() {
      sound.playHitmarker();
      const hm = document.getElementById('hitmarker');
      hm.classList.add('active');
      setTimeout(() => {
        hm.classList.remove('active');
      }, 90);
    }

    function triggerKillFX() {
      // Slow motion hitstop
      timeScale = 0.28;
      hitstopTimer = 0.14; // in real seconds

      // White kill flash
      const killOverlay = document.getElementById('kill-overlay');
      killOverlay.style.opacity = '0.35';
      setTimeout(() => {
        killOverlay.style.opacity = '0';
      }, 140);
    }

    // --------------------------------------------------------------------------
    // 8. MAP & LEVEL DESIGN (80x80 ARENA WITH ELEVATED PLATFORMS)
    // --------------------------------------------------------------------------
    function buildArena() {
      // 1. Grid Floor
      const floorGeo = new THREE.PlaneGeometry(80, 80);
      floorGeo.rotateX(-Math.PI / 2);
      const floorMat = new THREE.MeshStandardMaterial({
        map: createGridFloorTexture(),
        roughness: 0.3,
        metalness: 0.8
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.position.y = 0;
      scene.add(floor);

      // 2. Outer Walls (Height: 20 units)
      const wallTex = createWallTexture();
      const wallMat = new THREE.MeshStandardMaterial({
        map: wallTex,
        roughness: 0.4,
        metalness: 0.7
      });

      const wallDefs = [
        { w: 80, h: 20, d: 2, x: 0, y: 10, z: -40 },
        { w: 80, h: 20, d: 2, x: 0, y: 10, z: 40 },
        { w: 2, h: 20, d: 80, x: -40, y: 10, z: 0 },
        { w: 2, h: 20, d: 80, x: 40, y: 10, z: 0 }
      ];

      wallDefs.forEach(def => {
        const geo = new THREE.BoxGeometry(def.w, def.h, def.d);
        const wall = new THREE.Mesh(geo, wallMat);
        wall.position.set(def.x, def.y, def.z);
        scene.add(wall);
      });

      // 3. Tactical Obstacles & Elevated Platforms
      const platformTexCyan = createPlatformTexture('#00f0ff');
      const platformTexPink = createPlatformTexture('#ff007f');

      const obstacleDefs = [
        // Center raised dais
        { x: 0, y: 1.5, z: 0, w: 10, h: 3, d: 10, mat: platformTexCyan },
        
        // 4 Raised Corner Towers
        { x: -24, y: 3.0, z: -24, w: 8, h: 6, d: 8, mat: platformTexPink },
        { x: 24, y: 2.5, z: -24, w: 7, h: 5, d: 10, mat: platformTexCyan },
        { x: -24, y: 2.0, z: 24, w: 10, h: 4, d: 6, mat: platformTexCyan },
        { x: 24, y: 3.5, z: 24, w: 8, h: 7, d: 8, mat: platformTexPink },

        // Mid-field tactical parkour boxes
        { x: -14, y: 1.5, z: 8, w: 4, h: 3, d: 5, mat: platformTexCyan },
        { x: 14, y: 1.25, z: -8, w: 5, h: 2.5, d: 5, mat: platformTexCyan },
        { x: -8, y: 1.75, z: -16, w: 6, h: 3.5, d: 4, mat: platformTexPink },
        { x: 10, y: 1.5, z: 16, w: 5, h: 3, d: 5, mat: platformTexPink },

        // Floating aerial jump pads (4.5 to 6 units high)
        { x: 0, y: 5.5, z: -18, w: 6, h: 1.0, d: 6, mat: platformTexCyan },
        { x: 0, y: 5.5, z: 18, w: 6, h: 1.0, d: 6, mat: platformTexPink },
        { x: -16, y: 4.5, z: 0, w: 4, h: 1.0, d: 10, mat: platformTexCyan },
        { x: 16, y: 4.5, z: 0, w: 4, h: 1.0, d: 10, mat: platformTexCyan }
      ];

      obstacleDefs.forEach(def => {
        const geo = new THREE.BoxGeometry(def.w, def.h, def.d);
        const mat = new THREE.MeshStandardMaterial({
          map: def.mat,
          roughness: 0.35,
          metalness: 0.8
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(def.x, def.y, def.z);
        scene.add(mesh);

        // Edges wireframe highlight for sharp neon look
        const edges = new THREE.EdgesGeometry(geo);
        const lineMat = new THREE.LineBasicMaterial({
          color: (def.mat === platformTexPink ? 0xff007f : 0x00f0ff),
          linewidth: 1.5
        });
        const wire = new THREE.LineSegments(edges, lineMat);
        mesh.add(wire);

        // Compute AABB box for collision
        const box = new THREE.Box3().setFromObject(mesh);
        obstacles.push({ mesh, box, def });
      });

      // 4. Dramatic Atmospheric Lighting (Pointlights)
      const lightConfigs = [
        { color: 0x00f0ff, intensity: 2.0, x: -24, y: 10, z: -24 },
        { color: 0xff007f, intensity: 2.0, x: 24, y: 10, z: -24 },
        { color: 0x00f0ff, intensity: 2.0, x: -24, y: 10, z: 24 },
        { color: 0xff007f, intensity: 2.0, x: 24, y: 10, z: 24 },
        { color: 0x8a2be2, intensity: 3.0, x: 0, y: 14, z: 0 },
        { color: 0x00ff88, intensity: 1.5, x: 0, y: 8, z: -35 },
        { color: 0x00ff88, intensity: 1.5, x: 0, y: 8, z: 35 }
      ];

      lightConfigs.forEach(cfg => {
        const light = new THREE.PointLight(cfg.color, cfg.intensity, 45);
        light.position.set(cfg.x, cfg.y, cfg.z);
        scene.add(light);

        // Small glowing orb mesh for the light source
        const orbGeo = new THREE.SphereGeometry(0.35, 8, 8);
        const orbMat = new THREE.MeshBasicMaterial({ color: cfg.color });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orb.position.copy(light.position);
        scene.add(orb);
      });

      // Ambient light
      const ambLight = new THREE.AmbientLight(0x0a1020, 1.2);
      scene.add(ambLight);

      // 5. Decorative rotating cyber crystals
      const crystalGeo = new THREE.OctahedronGeometry(1.8, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x005577,
        roughness: 0.1,
        metalness: 0.9,
        wireframe: true
      });

      const crystalLocs = [
        { x: -32, y: 14, z: -32 },
        { x: 32, y: 14, z: -32 },
        { x: -32, y: 14, z: 32 },
        { x: 32, y: 14, z: 32 }
      ];

      crystalLocs.forEach(loc => {
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.position.set(loc.x, loc.y, loc.z);
        scene.add(crystal);
        decorativeMeshes.push(crystal);
      });

      // 6. Ambient Floating Dust Particles (Cyber Motes)
      const dustGeo = new THREE.BufferGeometry();
      const dustCount = 450;
      const dustPositions = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount * 3; i += 3) {
        dustPositions[i] = (Math.random() - 0.5) * 78;
        dustPositions[i + 1] = Math.random() * 18;
        dustPositions[i + 2] = (Math.random() - 0.5) * 78;
      }
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
      const dustMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.18,
        transparent: true,
        opacity: 0.5
      });
      const dustSystem = new THREE.Points(dustGeo, dustMat);
      scene.add(dustSystem);
      dustSystem.update = (dt) => {
        const pos = dustGeo.attributes.position.array;
        for (let i = 1; i < dustCount * 3; i += 3) {
          pos[i] += dt * 0.4;
          if (pos[i] > 18) pos[i] = 0.5;
        }
        dustGeo.attributes.position.needsUpdate = true;
      };
      decorativeMeshes.push(dustSystem);
    }

    // --------------------------------------------------------------------------
    // 9. WAVE MANAGER & ENEMY SPAWNER
    // --------------------------------------------------------------------------
    const waveSpawnTimeouts = [];

    // Tactical spawn locations across the arena (ground + elevated vantage points)
    const tacticalSpawnPoints = [
      { x: -28, y: 0, z: -28 },
      { x: 28, y: 0, z: -28 },
      { x: -28, y: 0, z: 28 },
      { x: 28, y: 0, z: 28 },
      { x: 0, y: 0, z: -30 },
      { x: 0, y: 0, z: 30 },
      { x: -30, y: 0, z: 0 },
      { x: 30, y: 0, z: 0 },
      { x: -24, y: 6.0, z: -24 }, // on NW tower
      { x: 24, y: 5.0, z: -24 },  // on NE platform
      { x: 24, y: 7.0, z: 24 },   // on SE tower
      { x: -24, y: 4.0, z: 24 }   // on SW platform
    ];

    function clearWaveTimeouts() {
      waveSpawnTimeouts.forEach(t => clearTimeout(t));
      waveSpawnTimeouts.length = 0;
    }

    function startWave(waveNum) {
      currentWave = waveNum;
      waveSpawning = false;
      clearWaveTimeouts();

      // Start with 5, add 3 each wave
      const totalEnemies = 5 + (waveNum - 1) * 3;
      enemiesRemainingInWave = totalEnemies;

      // Banner UI
      showBanner(`WAVE ${waveNum < 10 ? '0' + waveNum : waveNum}`, `INCOMING HOSTILES // PURGE ALL`);

      // Spawn distribution
      for (let i = 0; i < totalEnemies; i++) {
        const timeoutId = setTimeout(() => {
          if (currentState !== GameState.PLAYING) return;

          // Pick a random tactical spawn point
          const spawnPt = tacticalSpawnPoints[Math.floor(Math.random() * tacticalSpawnPoints.length)];
          const jitterX = (Math.random() - 0.5) * 4;
          const jitterZ = (Math.random() - 0.5) * 4;
          const spawnX = Math.max(-36, Math.min(36, spawnPt.x + jitterX));
          const spawnZ = Math.max(-36, Math.min(36, spawnPt.z + jitterZ));

          // Determine enemy type based on wave & randomness
          let type = 'CUBE';
          const r = Math.random();
          if (waveNum >= 3 && r > 0.75) {
            type = 'SENTRY';
          } else if (waveNum >= 2 && r > 0.4) {
            type = 'SPIKER';
          }

          let spawnY = spawnPt.y;
          if (type === 'CUBE') {
            spawnY = Math.max(spawnY, 2.5);
          }

          const enemy = new Enemy(type, spawnX, spawnY, spawnZ);
          enemies.push(enemy);

          // Spawn teleport particles
          for (let p = 0; p < 18; p++) {
            spawnParticle(
              new THREE.Vector3(spawnX, spawnY + 1.2, spawnZ),
              new THREE.Vector3((Math.random()-0.5)*9, Math.random()*8, (Math.random()-0.5)*9),
              type === 'CUBE' ? 0xff2244 : type === 'SPIKER' ? 0xff7700 : 0xb300ff,
              0.22,
              0.45
            );
          }

          updateHUD();
        }, i * 280); // Stagger spawns smoothly

        waveSpawnTimeouts.push(timeoutId);
      }

      updateHUD();
    }

    function onWaveCleared() {
      waveSpawning = true;
      score += currentWave * 500;
      sound.playWaveClear();

      showBanner('WAVE PURGED', `+${currentWave * 500} DATA CORE BONUS`);

      // 3 second respite before next wave
      setTimeout(() => {
        if (currentState === GameState.PLAYING) {
          startWave(currentWave + 1);
        }
      }, 3200);
    }

    function showBanner(title, sub) {
      const banner = document.getElementById('banner-container');
      const bTitle = document.getElementById('banner-title');
      const bSub = document.getElementById('banner-sub');

      bTitle.innerText = title;
      bSub.innerText = sub;
      banner.classList.add('show');

      setTimeout(() => {
        banner.classList.remove('show');
      }, 2200);
    }

    // --------------------------------------------------------------------------
    // 10. HUD MANAGEMENT
    // --------------------------------------------------------------------------
    function updateHUD() {
      // Wave & Hostiles
      document.getElementById('hud-wave').innerText = `WAVE ${currentWave < 10 ? '0' + currentWave : currentWave}`;
      document.getElementById('hud-enemies-left').innerText = `HOSTILES: ${enemiesRemainingInWave}`;

      // Kills & Score
      document.getElementById('hud-kills').innerHTML = `<span>ðŸ’€</span> ${killsCount}`;
      document.getElementById('hud-score').innerText = String(score).padStart(5, '0');

      // Health
      document.getElementById('hud-hp-num').innerText = Math.ceil(player.health);
      const healthPct = Math.max(0, (player.health / player.maxHealth) * 100);
      document.getElementById('health-fill').style.width = `${healthPct}%`;

      const healthTrack = document.getElementById('health-track');
      if (healthPct < 30) {
        healthTrack.classList.add('critical');
      } else {
        healthTrack.classList.remove('critical');
      }

      // Ammo
      document.getElementById('hud-ammo-cur').innerText = player.weapon.currentAmmo;
      if (player.weapon.currentAmmo <= 6) {
        document.getElementById('hud-ammo-cur').style.color = '#ff2a4b';
      } else {
        document.getElementById('hud-ammo-cur').style.color = '#ffffff';
      }
    }

    function updateDynamicHUD(dt) {
      // Speedometer
      const horizVel = Math.sqrt(player.velocity.x * player.velocity.x + player.velocity.z * player.velocity.z);
      document.getElementById('hud-speed').innerText = horizVel.toFixed(1);

      // Dash Cooldown Circle
      const circleBar = document.getElementById('dash-circle-bar');
      const dashText = document.getElementById('dash-status-text');
      const maxDash = player.maxDashCooldown;
      const curDash = Math.max(0, player.dashCooldown);

      const pct = (maxDash - curDash) / maxDash; // 1.0 = ready, 0.0 = on cooldown
      const circumference = 113.1;
      circleBar.style.strokeDashoffset = `${circumference * (1 - pct)}`;

      if (curDash <= 0) {
        dashText.innerText = 'BLINK READY';
        dashText.style.color = '#00f0ff';
        circleBar.style.stroke = '#00f0ff';
      } else {
        dashText.innerText = 'CHARGING...';
        dashText.style.color = '#6d859f';
        circleBar.style.stroke = '#ff007f';
      }
    }

    // --------------------------------------------------------------------------
    // 11. USER INPUT HANDLING & POINTER LOCK
    // --------------------------------------------------------------------------
    const input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      slide: false,
      jumpPressed: false,
      dashPressed: false,
      firing: false
    };

    let isPointerLocked = false;

    function setupInputs() {
      window.addEventListener('keydown', (e) => {
        if (currentState !== GameState.PLAYING) {
          if (e.code === 'Enter' && currentState === GameState.GAMEOVER) {
            restartGame();
          }
          return;
        }

        // Prevent default for game keys
        if (['Space','KeyW','KeyS','KeyA','KeyD','KeyQ','KeyR','ShiftLeft','ShiftRight','ControlLeft','ControlRight','KeyC'].includes(e.code)) {
          e.preventDefault();
        }

        switch (e.code) {
          case 'KeyW': input.forward = true; break;
          case 'KeyS': input.backward = true; break;
          case 'KeyA': input.left = true; break;
          case 'KeyD': input.right = true; break;
          case 'ShiftLeft':
          case 'ShiftRight':
            input.sprint = true;
            break;
          case 'ControlLeft':
          case 'ControlRight':
          case 'KeyC':
            input.slide = true;
            break;
          case 'Space':
            input.jumpPressed = true;
            break;
          case 'KeyQ':
            input.dashPressed = true;
            break;
          case 'KeyR':
            player.weapon.reload();
            break;
          case 'Escape':
            pauseGame();
            break;
        }
      });

      window.addEventListener('keyup', (e) => {
        switch (e.code) {
          case 'KeyW': input.forward = false; break;
          case 'KeyS': input.backward = false; break;
          case 'KeyA': input.left = false; break;
          case 'KeyD': input.right = false; break;
          case 'ShiftLeft':
          case 'ShiftRight':
            input.sprint = false;
            break;
          case 'ControlLeft':
          case 'ControlRight':
          case 'KeyC':
            input.slide = false;
            break;
        }
      });

      window.addEventListener('mousedown', (e) => {
        if (currentState === GameState.PLAYING) {
          if (e.button === 0) { // Left click
            input.firing = true;
          }
        }
      });

      window.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
          input.firing = false;
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (currentState === GameState.PLAYING && (isPointerLocked || document.pointerLockElement === document.body)) {
          player.yaw -= e.movementX * player.sensitivity;
          player.pitch -= e.movementY * player.sensitivity;

          // Clamp vertical look
          const maxPitch = Math.PI / 2 - 0.05;
          player.pitch = Math.max(-maxPitch, Math.min(maxPitch, player.pitch));
        }
      });

      // Pointer lock state changes
      document.addEventListener('pointerlockchange', () => {
        isPointerLocked = (document.pointerLockElement === document.body);
        if (!isPointerLocked && currentState === GameState.PLAYING) {
          // Don't auto-pause â€” let user click to re-lock
          // pauseGame(); <-- removed so game doesn't pause on failed lock
        }
      });

      document.addEventListener('pointerlockerror', () => {
        // If pointer lock fails, still allow game to run â€” user clicks game area to re-try
        console.warn('Pointer lock failed. Click the game area to try again.');
        if (currentState === GameState.PLAYING) {
          isPointerLocked = true; // allow game input to work
        }
      });

      // UI Buttons
      document.getElementById('start-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        sound.init();
        sound.resume();
        startGame();
      });

      document.getElementById('resume-btn').addEventListener('click', () => {
        resumeGame();
      });

      document.getElementById('restart-btn').addEventListener('click', () => {
        restartGame();
      });

      // Window click to re-lock pointer during gameplay
      window.addEventListener('click', (e) => {
        if (currentState === GameState.PLAYING && !isPointerLocked) {
          if (e.target.tagName !== 'BUTTON') {
            document.body.requestPointerLock();
          }
        }
      });    }

    // --------------------------------------------------------------------------
    // 12. GAME FLOW & STATE CONTROL
    // --------------------------------------------------------------------------
    function startGame() {
      currentState = GameState.PLAYING;
      document.getElementById('start-screen').style.display = 'none';
      document.getElementById('hud').style.display = 'block';

      // Request pointer lock â€” if it fails, allow playing without it
      // (mouse will still work but won't be captured)
      try {
        const lockPromise = document.body.requestPointerLock();
        if (lockPromise && typeof lockPromise.catch === 'function') {
          lockPromise.catch(() => {
            // Pointer lock rejected (e.g. browser policy) â€” set flag manually so game still runs
            isPointerLocked = true;
          });
        }
      } catch(err) {
        isPointerLocked = true;
      }

      player.reset();
      player.weapon.currentAmmo = player.weapon.maxAmmo;
      killsCount = 0;
      score = 0;
      shotsFired = 0;
      shotsHit = 0;

      // Clear any remaining enemies
      enemies.forEach(e => scene.remove(e.group));
      enemies.length = 0;
      enemyProjectiles.forEach(p => scene.remove(p.mesh));
      enemyProjectiles.length = 0;

      startWave(1);
    }

    function pauseGame() {
      if (currentState !== GameState.PLAYING) return;
      currentState = GameState.PAUSED;
      document.getElementById('pause-screen').style.display = 'flex';
    }

    function resumeGame() {
      if (currentState !== GameState.PAUSED) return;
      currentState = GameState.PLAYING;
      document.getElementById('pause-screen').style.display = 'none';
      document.body.requestPointerLock();
    }

    function triggerGameOver() {
      currentState = GameState.GAMEOVER;
      document.exitPointerLock();

      document.getElementById('hud').style.display = 'none';
      document.getElementById('death-screen').style.display = 'flex';

      const accuracy = shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 0;
      document.getElementById('death-stat-waves').innerText = currentWave;
      document.getElementById('death-stat-kills').innerText = killsCount;
      document.getElementById('death-stat-acc').innerText = `${accuracy}%`;
      document.getElementById('death-stat-score').innerText = score;
    }

    function restartGame() {
      document.getElementById('death-screen').style.display = 'none';
      startGame();
    }

    // --------------------------------------------------------------------------
    // 13. MAIN LOOP & SCENE INITIALIZATION
    // --------------------------------------------------------------------------
    let player;

    function initScene() {
      const container = document.getElementById('canvas-container');

      // Three.js Scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x04040a);
      scene.fog = new THREE.FogExp2(0x04040a, 0.018);

      // Camera
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 150);
      scene.add(camera);

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      container.appendChild(renderer.domElement);

      clock = new THREE.Clock();

      // Build Map
      buildArena();

      // Instantiate Player & Gun
      player = new Player();
      player.weapon = new PulseRifle(player);

      // Setup Inputs
      setupInputs();

      // Window resize
      window.addEventListener('resize', onWindowResize);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      requestAnimationFrame(animate);

      let delta = clock.getDelta();
      if (delta > 0.1) delta = 0.1; // Clamp lag spikes

      // Hitstop slow-motion management
      if (hitstopTimer > 0) {
        hitstopTimer -= delta;
        if (hitstopTimer <= 0) {
          timeScale = 1.0;
        }
      }

      const effectiveDelta = delta * timeScale;

      // 1. Decorative animations
      decorativeMeshes.forEach(mesh => {
        if (mesh.update) {
          mesh.update(delta);
        } else {
          mesh.rotation.y += delta * 0.8;
          mesh.rotation.x += delta * 0.5;
        }
      });

      // 2. Game State Updates
      if (currentState === GameState.PLAYING) {
        // Update Player & Weapon
        player.update(effectiveDelta, input);
        player.weapon.update(effectiveDelta, input);

        // Update Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
          const enemy = enemies[i];
          if (enemy.isDead) {
            enemies.splice(i, 1);
          } else {
            enemy.update(effectiveDelta, player);
          }
        }

        // Update Enemy Projectiles
        for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
          const p = enemyProjectiles[i];
          p.life -= effectiveDelta;
          p.mesh.position.addScaledVector(p.velocity, effectiveDelta);

          // Check hit with player
          const distToPlayer = p.mesh.position.distanceTo(
            new THREE.Vector3(player.position.x, player.position.y + player.currentHeight * 0.5, player.position.z)
          );

          if (distToPlayer < (p.radius + player.radius)) {
            player.takeDamage(p.damage);
            spawnSparks(p.mesh.position, new THREE.Vector3(0, 1, 0), p.color, 12);
            scene.remove(p.mesh);
            enemyProjectiles.splice(i, 1);
            continue;
          }

          // Check hit with floor or arena walls
          if (p.mesh.position.y <= 0 || p.mesh.position.lengthSq() > 3600 || p.life <= 0) {
            spawnSparks(p.mesh.position, new THREE.Vector3(0, 1, 0), p.color, 8);
            scene.remove(p.mesh);
            enemyProjectiles.splice(i, 1);
            continue;
          }

          // Check hit with obstacle blocks/platforms
          let hitObstacle = false;
          for (const obs of obstacles) {
            if (obs.box.containsPoint(p.mesh.position)) {
              hitObstacle = true;
              break;
            }
          }
          if (hitObstacle) {
            spawnSparks(p.mesh.position, new THREE.Vector3(0, 1, 0), p.color, 8);
            scene.remove(p.mesh);
            enemyProjectiles.splice(i, 1);
            continue;
          }
        }

        // Update Dynamic HUD elements
        updateDynamicHUD(effectiveDelta);

      } else if (currentState === GameState.MENU) {
        // Slow cinematic orbit camera for menu backdrop
        const t = performance.now() * 0.0003;
        camera.position.x = Math.sin(t) * 25;
        camera.position.z = Math.cos(t) * 25;
        camera.position.y = 12 + Math.sin(t * 1.5) * 3;
        camera.lookAt(0, 3, 0);
      }

      // 3. Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.update(effectiveDelta)) {
          particles.splice(i, 1);
        }
      }

      // Render 3D Scene
      renderer.render(scene, camera);
    }

    // Start Everything on Load
    window.addEventListener('load', () => {
      initScene();
      animate();
    });
  
