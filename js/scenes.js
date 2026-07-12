/* ====================================================
   Scenes — GSAP ScrollTrigger Cinematic Timelines
   ==================================================== */

// Helper to animate lines sequentially, fading the previous sentence out of focus
function animateNarrationLines(tl, lines, startOffset, lineSpacing) {
  if (!lines || lines.length === 0) return;
  startOffset = startOffset || 0;
  lineSpacing = lineSpacing || 0.4;

  lines.forEach((line, index) => {
    // Fade out previous line as current line comes in
    if (index > 0) {
      tl.to(lines[index - 1], {
        opacity: 0.15,
        filter: 'blur(5px)',
        y: -12,
        duration: 0.7,
        ease: 'power2.out'
      }, `+=${lineSpacing + 0.4}`);
    }
    
    // Fade in current line (blur to sharp + slide up)
    tl.to(line, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.8,
      ease: 'power2.out'
    }, index === 0 ? `+=${startOffset}` : '<+=0.15');
  });
}

// Safe wrapper for gsap.set — skips if targets are null/empty
function safeSet(targets, props) {
  if (!targets) return;
  // If it's a NodeList/array, check if non-empty
  if (typeof targets.length !== 'undefined' && targets.length === 0) return;
  gsap.set(targets, props);
}

function initScenes() {
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch (e) {
    console.error('GSAP ScrollTrigger failed to register:', e);
    return;
  }

  const scenes = document.querySelectorAll('.scene');
  
  // Pin each scene and cross-fade its content for a slide-film theater feel
  scenes.forEach((scene) => {
    try {
      const id = scene.getAttribute('data-scene');
      if (!id || id === 'celebration') return; // Celebration handles its own scroll

      // Create a pinned timeline for this section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scene,
          start: 'top top',
          end: '+=150%', // Scroll distance to complete scene animations
          pin: true,
          scrub: 1, // Smooth scrub interaction
          anticipatePin: 1
        }
      });

      // Handle generic text entry animations per scene
      const lines = scene.querySelectorAll('.n-line');
      const chDate = scene.querySelector('.chapter-date');
      const heading = scene.querySelector('.scene-heading');

      // Make sure elements start with their initial cinematic state before animation
      safeSet(lines, { opacity: 0, y: 30, filter: 'blur(8px)' });

      // 1. Chapter date fade in & rise
      if (chDate) {
        tl.fromTo(chDate, { opacity: 0, y: 15, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5 });
      }

      // 2. Heading fade in
      if (heading) {
        tl.fromTo(heading, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.25');
      }

      // --- Scene-Specific Inner Timelines ---

      if (id === 'prologue') {
        // Entrance animation on load (starts as loading screen fades)
        const entranceTl = gsap.timeline({ delay: 2.2 });
        animateNarrationLines(entranceTl, lines, 0.5, 0.65);
      }

      else if (id === 'hospital-walk') {
        const foodBox = scene.querySelector('.food-box-float');
        if (foodBox) safeSet(foodBox, { opacity: 0, scale: 0.7, y: 50 });

        animateNarrationLines(tl, lines, 0, 0.45);
        if (foodBox) tl.to(foodBox, { opacity: 1, scale: 1, y: 0, duration: 1 }, '-=1.5');
      }

      else if (id === 'hospital-see') {
        const sils = scene.querySelectorAll('.sil');
        const orb = scene.querySelector('.golden-orb');
        const hbLine = scene.querySelector('.heartbeat-vis');
        const hbPath = scene.querySelector('.hb-path');

        if (orb) tl.to(orb, { opacity: 1, duration: 1.5 });
        
        if (hbLine) {
          tl.fromTo(hbLine, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1 }, '-=0.8');
        }
        if (hbPath) {
          tl.add(() => { hbPath.classList.add('animate'); }, '-=0.3');
        }

        animateNarrationLines(tl, lines, 0.4, 0.45);

        if (sils.length > 0) {
          tl.to(sils, { opacity: 0.02, filter: 'blur(15px)', duration: 1.5, stagger: 0.2 }, '-=1.8');
        }
      }

      else if (id === 'hospital-freeze') {
        const orb = scene.querySelector('.golden-orb');
        if (orb) tl.to(orb, { opacity: 1, duration: 1 });
        animateNarrationLines(tl, lines, 0.2, 0.45);
      }

      else if (id === 'familiar') {
        const ring = scene.querySelector('.familiar-glow-ring');
        if (ring) {
          safeSet(ring, { opacity: 0, scale: 0.6 });
          tl.to(ring, { opacity: 1, scale: 1.1, duration: 1.5 });
        }
        animateNarrationLines(tl, lines, 0.3, 0.45);
      }

      else if (id === 'first-talk') {
        animateNarrationLines(tl, lines, 0, 0.45);
      }

      else if (id === 'chat') {
        const chatDays = scene.querySelectorAll('.chat-day');
        const typingIndicator = scene.querySelector('.chat-typing');
        const chatScroll = document.getElementById('chat-scroll');

        safeSet(chatDays, { opacity: 0, y: 20 });

        chatDays.forEach((day, index) => {
          if (index === 6 && typingIndicator) {
            tl.add(() => { typingIndicator.classList.add('active'); }, `+=${index * 0.5}`);
            tl.to({}, { duration: 0.8 });
            tl.add(() => { typingIndicator.classList.remove('active'); });
          }
          
          tl.to(day, { opacity: 1, y: 0, duration: 0.8 });
          
          if (chatScroll) {
            tl.add(() => {
              chatScroll.scrollTo({ top: chatScroll.scrollHeight, behavior: 'smooth' });
            }, '-=0.3');
          }
        });
      }

      else if (id === 'chat-reflect') {
        animateNarrationLines(tl, lines, 0, 0.45);
      }

      else if (id === 'falling') {
        animateNarrationLines(tl, lines, 0, 0.45);
      }

      else if (id === 'brownie-kitchen') {
        const steps = scene.querySelectorAll('.b-step');
        safeSet(steps, { opacity: 0, y: 20 });
        steps.forEach((step, index) => {
          tl.to(step, { opacity: 1, y: 0, duration: 0.6 }, `+=${index * 0.3}`);
        });
      }

      else if (id === 'brownie-narrate') {
        animateNarrationLines(tl, lines, 0, 0.45);
      }

      else if (id === 'joke') {
        const brownie = scene.querySelector('.joke-brownie-icon');
        const himLine1 = scene.querySelector('[data-jk="1"]');
        const himLine2 = scene.querySelector('[data-jk="2"]');
        const herLaugh = scene.querySelector('[data-jk="3"]');
        const dots = scene.querySelector('[data-jk="4"]');
        const reveal = scene.querySelector('.joke-reveal');

        // Only set elements that exist
        const jokeElements = [brownie, himLine1, himLine2, herLaugh, dots, reveal].filter(Boolean);
        if (jokeElements.length > 0) {
          safeSet(jokeElements, { opacity: 0, y: 15 });
        }

        if (brownie) tl.to(brownie, { opacity: 1, y: 0, scale: 1, duration: 0.8 });
        if (himLine1) tl.to(himLine1, { opacity: 1, y: 0, duration: 0.8 }, '+=0.2');
        if (himLine2) tl.to(himLine2, { opacity: 1, y: 0, duration: 0.8 }, '+=0.2');
        if (herLaugh) tl.to(herLaugh, { opacity: 1, y: 0, duration: 0.6 }, '+=0.3');
        if (dots) tl.to(dots, { opacity: 1, y: 0, duration: 1.2 }, '+=0.4');
        if (reveal) {
          tl.to(reveal, { opacity: 1, y: 0, duration: 0.5 }, '+=0.4');
          const jokeReflectionLines = reveal.querySelectorAll('.n-line');
          animateNarrationLines(tl, jokeReflectionLines, 4.0, 0.45);
        }
      }

      else if (id === 'cooking') {
        const steps = scene.querySelectorAll('.ck-step');
        steps.forEach((step, index) => {
          tl.fromTo(step, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5 }, `+=${index * 0.25}`);
        });
        animateNarrationLines(tl, lines, 2.0, 0.45);
      }

      else if (id === 'timeline') {
        const nodes = scene.querySelectorAll('.tl-node');
        const timelineLine = scene.querySelector('.timeline__line');
        if (timelineLine) {
          tl.add(() => { timelineLine.classList.add('grow'); }, 0.2);
        }
        nodes.forEach((node, index) => {
          tl.to(node, { opacity: 1, x: 0, duration: 0.6 }, `+=${index * 0.3}`);
        });
      }

      else if (id === 'healing-dark') {
        animateNarrationLines(tl, lines, 0, 0.45);
      }

      else if (id === 'healing-light') {
        const shards = scene.querySelectorAll('.sh');
        const light = scene.querySelector('.healing-radiance');
        const flowers = scene.querySelectorAll('.bl');
        
        safeSet(flowers, { opacity: 0, scale: 0 });

        if (shards.length > 0) {
          tl.to(shards, { opacity: 0, scale: 0, rotate: 120, filter: 'blur(6px)', duration: 1 });
        }
        
        if (light) {
          tl.to(light, { scale: 1.5, opacity: 1, duration: 2.2 }, '+=0.2');
        }
        
        flowers.forEach((flower, index) => {
          tl.to(flower, { opacity: 1, scale: 1, duration: 0.8 }, `+=${index * 0.3}`);
        });

        animateNarrationLines(tl, lines, 2.0, 0.45);
      }

      else if (id === 'dreams') {
        animateNarrationLines(tl, lines, 0, 0.45);

        const trunk = scene.querySelector('.tree__trunk');
        if (trunk) {
          tl.add(() => { trunk.classList.add('grow'); }, '+=0.2');
        }

        const branches = scene.querySelectorAll('.tree__branch');
        branches.forEach((branch, index) => {
          tl.to(branch, { opacity: 1, scale: 1, duration: 0.6 }, `+=${index * 0.2}`);
        });
      }

      else if (id === 'dream-seq') {
        animateNarrationLines(tl, lines, 0, 0.45);
      }

      else if (id === 'success') {
        animateNarrationLines(tl, lines, 0, 0.45);
      }

      else if (id === 'thankyou') {
        animateNarrationLines(tl, lines, 0, 0.5);
      }

      else if (id === 'promise') {
        animateNarrationLines(tl, lines, 0, 0.5);
      }

      else if (id === 'proposal') {
        const ring = scene.querySelector('.proposal-ring');
        const question = scene.querySelector('.proposal-question');
        const buttons = scene.querySelector('.proposal-buttons');

        if (ring) {
          tl.fromTo(ring, { opacity: 0, scale: 0, rotation: -180 }, { opacity: 1, scale: 1, rotation: 0, duration: 1.5, ease: 'back.out(1.5)' });
          tl.add(() => { ring.classList.add('show'); });
        }
        if (question) {
          tl.fromTo(question, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2 }, '+=0.4');
        }
        if (buttons) {
          tl.fromTo(buttons, { opacity: 0 }, { opacity: 1, duration: 0.8 }, '+=0.4');
        }
      }

      // Default: for any unmatched scene, just animate the narration lines
      else {
        animateNarrationLines(tl, lines, 0, 0.45);
      }

      // Gentle fade out at the end of each pinned section
      const sceneContent = scene.querySelector('.scene__content');
      if (sceneContent) {
        tl.to(sceneContent, { opacity: 0, scale: 0.96, filter: 'blur(10px)', duration: 0.8 }, '+=0.5');
      }

    } catch (sceneErr) {
      console.warn('Scene animation error for', scene.getAttribute('data-scene'), ':', sceneErr);
    }
  });

  console.log('✅ initScenes completed successfully');
}

window.initScenes = initScenes;
