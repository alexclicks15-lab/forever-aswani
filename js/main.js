/* ====================================================
   Main — Loading Orchestrator, Synthesized Audio, & Eggs
   ==================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ---- 1. Loading Screen & Fade out ----
  const loading = document.getElementById('loading');
  
  function hideLoading() {
    if (loading) {
      loading.classList.add('hidden');
    }
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      setTimeout(hideLoading, 1600);
    });
  } else {
    setTimeout(hideLoading, 2500);
  }

  // ---- 2. Particle Canvas Init ----
  const particleSystem = new ParticleSystem();

  // ---- 3. Scenes & Proposal Init ----
  if (typeof initScenes === 'function') {
    initScenes();
  }
  if (typeof initProposal === 'function') {
    initProposal(particleSystem);
  }

  // ---- 3.5 Begin Story Button Smooth Scroll ----
  const beginBtn = document.getElementById('btn-begin-story');
  if (beginBtn) {
    beginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetScene = document.getElementById('scene-hospital-walk');
      if (targetScene) {
        if (window.gsap && window.ScrollTrigger) {
          const trigger = ScrollTrigger.create({
            trigger: targetScene,
            start: 'top top'
          });
          const scrollObj = { y: window.scrollY || window.pageYOffset || 0 };
          gsap.to(scrollObj, {
            y: trigger.start,
            duration: 1.5,
            ease: 'power2.inOut',
            onUpdate: () => {
              window.scrollTo(0, scrollObj.y);
            },
            onComplete: () => {
              trigger.kill();
            }
          });
        } else {
          targetScene.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  // ---- 4. Easter Egg: Animated Banana ----
  const bananaBtn = document.getElementById('banana-btn');
  const bananaReaction = document.getElementById('banana-reaction');
  const bananaSparkles = document.getElementById('banana-sparkles');
  let bananaTriggered = false;

  if (bananaBtn && bananaReaction) {
    bananaBtn.addEventListener('click', () => {
      if (bananaTriggered) {
        bananaReaction.classList.toggle('show');
        return;
      }
      bananaTriggered = true;

      // Play bubble animation
      bananaBtn.classList.add('tapped');
      if (bananaSparkles) {
        bananaSparkles.classList.add('burst');
      }

      // Spark sound effect
      playProceduralSound('sparkle');

      setTimeout(() => {
        bananaReaction.classList.add('show');
        
        const quotes = bananaReaction.querySelectorAll('.banana-quote-line');
        quotes.forEach((q, i) => {
          setTimeout(() => q.classList.add('reveal'), i * 400);
        });

        setTimeout(() => {
          const her = bananaReaction.querySelector('.banana-her-reaction');
          if (her) her.classList.add('show');

          const emojis = bananaReaction.querySelectorAll('.laugh-emoji');
          emojis.forEach((emoji) => emoji.classList.add('pop'));

          const lText = bananaReaction.querySelector('.banana-laugh');
          if (lText) lText.classList.add('show');

          playProceduralSound('giggle');
        }, quotes.length * 400 + 400);

      }, 600);

      setTimeout(() => {
        bananaBtn.classList.remove('tapped');
      }, 700);
    });
  }

  // ---- 5. Nickname Garden Growth ----
  const flowers = document.querySelectorAll('.flower');
  const gardenObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        flowers.forEach((flower, i) => {
          const stem = flower.querySelector('.flower__stem');
          const bloom = flower.querySelector('.flower__bloom');
          setTimeout(() => {
            stem?.classList.add('grow');
            setTimeout(() => {
              bloom?.classList.add('bloom');
              playProceduralSound('pop');
            }, 600);
          }, i * 250);
        });
        gardenObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const gardenScene = document.getElementById('scene-garden');
  if (gardenScene) gardenObserver.observe(gardenScene);

  // Nickname reveal
  flowers.forEach(flower => {
    flower.addEventListener('click', () => {
      const name = flower.querySelector('.flower__name');
      const nick = flower.getAttribute('data-nickname');
      if (name && nick) {
        name.textContent = nick;
        name.classList.add('show');
        playProceduralSound('sparkle');
      }
    });
  });

  // ---- 6. Dreams Tree Interaction ----
  const treeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelector('.tree__trunk')?.classList.add('grow');
        const branches = document.querySelectorAll('.tree__branch');
        branches.forEach((branch, i) => {
          setTimeout(() => {
            branch.classList.add('visible');
            playProceduralSound('pop');
          }, 1500 + i * 200);
        });
        treeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const dreamsScene = document.getElementById('scene-dreams');
  if (dreamsScene) treeObserver.observe(dreamsScene);

  // Click branch to expand details
  document.querySelectorAll('.tree__branch').forEach(branch => {
    branch.addEventListener('click', () => {
      branch.style.transform = 'scale(1.15)';
      playProceduralSound('sparkle');
      setTimeout(() => {
        branch.style.transform = 'scale(1)';
      }, 300);
    });
  });

  // ---- 7. Audio Engine (Web Audio API Procedural Synthesizer) ----
  const audioToggle = document.getElementById('audio-toggle');
  const iconOn = document.getElementById('audio-icon-on');
  const iconOff = document.getElementById('audio-icon-off');
  
  let audioCtx = null;
  let isPlaying = false;
  let mainGain = null;
  
  // Audio sources
  let padOscillators = [];
  let pianoInterval = null;
  let heartbeatInterval = null;
  let currentTempo = 80;

  function initAudioEngine() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    mainGain = audioCtx.createGain();
    mainGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
    mainGain.connect(audioCtx.destination);
    
    // Smooth gain entry
    mainGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 2);

    // Start background pad drone
    createPadDrone();
    
    // Start procedural piano melody
    startProceduralPiano();
  }

  // Warm movie synth pad (Procedural synthesis)
  function createPadDrone() {
    // Beautiful romantic chords: Cmaj9, Fmaj9, Am9, G6
    const progressions = [
      [130.81, 164.81, 196.00, 246.94, 293.66], // C3, E3, G3, B3, D4
      [174.61, 220.00, 261.63, 329.63, 392.00], // F3, A3, C4, E4, G4
      [110.00, 146.83, 174.61, 220.00, 293.66], // A2, D3, F3, A3, D4
      [196.00, 246.94, 293.66, 392.00, 440.00]  // G3, B3, D4, G4, A4
    ];

    let chordIndex = 0;

    function playChord() {
      if (!isPlaying || !audioCtx) return;
      
      const freqs = progressions[chordIndex];
      const now = audioCtx.currentTime;

      // Stop old pads gently
      padOscillators.forEach(osc => {
        osc.gain.gain.setValueAtTime(osc.gain.gain.value, now);
        osc.gain.gain.exponentialRampToValueAtTime(0.001, now + 3);
        setTimeout(() => {
          try { osc.stop(); } catch(e) {}
        }, 3200);
      });
      padOscillators = [];

      // Start new pad nodes
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        // Low-pass filter for smooth warmth
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450 + Math.sin(now) * 100, now);
        filter.Q.setValueAtTime(1.5, now);

        oscGain.gain.setValueAtTime(0.001, now);
        oscGain.gain.exponentialRampToValueAtTime(0.05 - (idx * 0.008), now + 2);

        // Slow vibrato
        const vibrato = audioCtx.createOscillator();
        const vibratoGain = audioCtx.createGain();
        vibrato.frequency.setValueAtTime(0.18 + (idx * 0.05), now);
        vibratoGain.gain.setValueAtTime(1.8, now);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        
        vibrato.start(now);
        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(mainGain);
        
        osc.start(now);
        padOscillators.push(osc);
      });

      chordIndex = (chordIndex + 1) % progressions.length;
      // Change chords every 12 seconds
      setTimeout(playChord, 12000);
    }

    playChord();
  }

  // Soft random piano melody generators
  function startProceduralPiano() {
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99]; // C major pentatonic scale
    
    function playNote() {
      if (!isPlaying || !audioCtx) return;
      
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      // Random scale index
      const freq = scale[Math.floor(Math.random() * scale.length)];

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      // Instant attack, slow decay
      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(mainGain);

      osc.start(now);
      osc.stop(now + 2);

      // Random delay between piano notes
      const nextTime = 1200 + Math.random() * 2500;
      pianoInterval = setTimeout(playNote, nextTime);
    }

    playNote();
  }

  // Intercept sound effect player for procedural actions
  function playProceduralSound(type) {
    if (!isPlaying || !audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();

    if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      oscGain.gain.setValueAtTime(0.1, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      osc.connect(oscGain);
      oscGain.connect(mainGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } 
    else if (type === 'sparkle') {
      // Shimmer sound
      for (let i = 0; i < 4; i++) {
        const oscS = audioCtx.createOscillator();
        const oscGainS = audioCtx.createGain();
        oscS.type = 'sine';
        oscS.frequency.setValueAtTime(1200 + (i * 200), now + (i * 0.05));
        
        oscGainS.gain.setValueAtTime(0.05, now + (i * 0.05));
        oscGainS.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.05) + 0.3);
        
        oscS.connect(oscGainS);
        oscGainS.connect(mainGain);
        oscS.start(now + (i * 0.05));
        oscS.stop(now + (i * 0.05) + 0.4);
      }
    }
    else if (type === 'giggle') {
      // High pitch cute bounce
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(800, now + 0.1);
      osc.frequency.setValueAtTime(700, now + 0.2);
      
      oscGain.gain.setValueAtTime(0.08, now);
      oscGain.gain.setValueAtTime(0.08, now + 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      osc.connect(oscGain);
      oscGain.connect(mainGain);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  }

  // Active scene audio controller (heartbeat for hospital)
  function startHospitalHeartbeat() {
    if (heartbeatInterval) return;

    function thump() {
      if (!isPlaying || !audioCtx) return;
      const now = audioCtx.currentTime;

      // Heartbeat osc (Double Thump)
      function hit(time) {
        const oscH = audioCtx.createOscillator();
        const gainH = audioCtx.createGain();
        oscH.type = 'sine';
        oscH.frequency.setValueAtTime(58, time); // Low sub thump
        gainH.gain.setValueAtTime(0.4, time);
        gainH.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        oscH.connect(gainH);
        gainH.connect(mainGain);
        oscH.start(time);
        oscH.stop(time + 0.3);
      }

      hit(now);
      hit(now + 0.22); // Second thump

      heartbeatInterval = setTimeout(thump, 1400); // Pulse rate
    }

    thump();
  }

  function stopHospitalHeartbeat() {
    if (heartbeatInterval) {
      clearTimeout(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  // Monitor active scroll sections to trigger sound effects
  const soundSceneObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const sceneId = entry.target.getAttribute('data-scene');
      if (entry.isIntersecting) {
        if (sceneId === 'hospital-see' || sceneId === 'hospital-freeze') {
          startHospitalHeartbeat();
        } else {
          stopHospitalHeartbeat();
        }
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.scene').forEach(sec => soundSceneObserver.observe(sec));

  // Audio Toggle event
  function toggleAudio() {
    if (!isPlaying) {
      initAudioEngine();
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      isPlaying = true;
      if (iconOn) iconOn.style.display = 'block';
      if (iconOff) iconOff.style.display = 'none';
      
      // Sync heartbeat if in hospital scene
      const activeEl = document.querySelector('.scene--hospital-glow');
      const rect = activeEl?.getBoundingClientRect();
      if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
        startHospitalHeartbeat();
      }
    } else {
      if (audioCtx) {
        audioCtx.suspend();
      }
      isPlaying = false;
      stopHospitalHeartbeat();
      if (iconOn) iconOn.style.display = 'none';
      if (iconOff) iconOff.style.display = 'block';
    }
  }

  if (audioToggle) {
    audioToggle.addEventListener('click', toggleAudio);
    if (iconOn) iconOn.style.display = 'none';
    if (iconOff) iconOff.style.display = 'block';
  }

  // ---- 8. Viewport triggers for flowers & 3D Ring ----
  const proposalScene = document.getElementById('scene-proposal');
  let ringSceneInstance = null;
  
  if (proposalScene) {
    const ringObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          particleSystem.addBlossoms(12);
          if (!ringSceneInstance && typeof CinematicRingScene === 'function') {
            ringSceneInstance = new CinematicRingScene();
            window.ringScene = ringSceneInstance;
          }
        }
      });
    }, { threshold: 0.1 });
    ringObserver.observe(proposalScene);
  }

  // ---- 9. Service Worker registration ----
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js?v=2.1').catch(() => {});
  }
});
