/* ====================================================
   Proposal — YES/NO buttons, celebration, future montage
   ==================================================== */

function initProposal(particleSystem) {
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const celebrationScene = document.getElementById('scene-celebration');
  const proposalScene = document.getElementById('scene-proposal');

  if (!btnYes || !btnNo) return;

  // Don't auto-skip to celebration — always let the story play from the beginning

  // ---- YES Button ----
  btnYes.addEventListener('click', () => {
    localStorage.setItem('foreverAswani_yes', 'true');
    showCelebration(particleSystem);
  });

  // ---- NO Button — dodges away ----
  let dodgeCount = 0;

  function dodgeNo(e) {
    e.preventDefault();
    dodgeCount++;

    const parentRect = proposalScene.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();
    const maxX = parentRect.width - btnRect.width - 20;
    const maxY = parentRect.height - btnRect.height - 20;

    let newX = Math.random() * maxX;
    let newY = Math.random() * maxY;

    // Make sure it doesn't land on the YES button
    const yesRect = btnYes.getBoundingClientRect();
    if (Math.abs(newX - (yesRect.left - parentRect.left)) < 100 &&
        Math.abs(newY - (yesRect.top - parentRect.top)) < 60) {
      newX = (newX + 150) % maxX;
    }

    btnNo.classList.add('dodge');
    btnNo.style.left = newX + 'px';
    btnNo.style.top = newY + 'px';

    // Change text after multiple dodges
    const texts = ['Nope!', 'Try again!', 'Nice try 😏', 'Not happening!', 'Only YES! ❤️', 'Can\'t catch me!', '🤭'];
    btnNo.textContent = texts[dodgeCount % texts.length];

    // Increase YES button size slightly each time
    const scale = 1 + dodgeCount * 0.05;
    btnYes.style.transform = `scale(${Math.min(scale, 1.4)})`;
  }

  btnNo.addEventListener('mouseenter', dodgeNo);
  btnNo.addEventListener('touchstart', dodgeNo, { passive: false });
  btnNo.addEventListener('click', dodgeNo);
}

function showCelebration(particleSystem) {
  const celebrationScene = document.getElementById('scene-celebration');
  const proposalButtons = document.querySelector('.proposal-buttons');

  if (!celebrationScene) return;

  // Hide proposal buttons
  if (proposalButtons) proposalButtons.style.display = 'none';

  // Show celebration scene
  celebrationScene.style.display = 'block';

  // Scroll to celebration
  setTimeout(() => {
    celebrationScene.scrollIntoView({ behavior: 'smooth' });
  }, 300);

  // Intensify particles
  if (particleSystem) {
    particleSystem.intensify();
    particleSystem.addBlossoms(20);
  }

  // Animate Three.js stars explosion
  if (window.ringScene && typeof window.ringScene.explodeStars === 'function') {
    window.ringScene.explodeStars();
  }

  // Fire confetti!
  launchCelebrationConfetti();

  // Animate future cards
  const futureCards = document.querySelectorAll('.future-card');
  futureCards.forEach((card, i) => {
    setTimeout(() => card.classList.add('show'), 2000 + i * 400);
  });

  // Final message
  const finalMessage = document.querySelector('.final-message');
  if (finalMessage) {
    setTimeout(() => finalMessage.classList.add('show'), 2000 + futureCards.length * 400 + 1000);
  }

  // Setup WhatsApp share
  setupShareButton();
}

function launchCelebrationConfetti() {
  if (typeof confetti !== 'function') return;

  const duration = 8000;
  const end = Date.now() + duration;

  // Initial burst
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#C2185B', '#D4A574', '#FFD700', '#E91E63', '#FF6F00', '#FFF8F0']
  });

  // Continuous celebration
  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }

    // Left side
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#C2185B', '#FFD700', '#E91E63']
    });

    // Right side
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#D4A574', '#FF6F00', '#FFF8F0']
    });
  }, 100);

  // Extra bursts
  setTimeout(() => {
    confetti({ particleCount: 80, spread: 120, origin: { y: 0.5 }, colors: ['#FFD700', '#FFF8F0'] });
  }, 2000);

  setTimeout(() => {
    confetti({ particleCount: 60, spread: 90, origin: { y: 0.4, x: 0.3 }, colors: ['#C2185B', '#E91E63'] });
  }, 4000);

  setTimeout(() => {
    confetti({ particleCount: 60, spread: 90, origin: { y: 0.4, x: 0.7 }, colors: ['#D4A574', '#FFD700'] });
  }, 6000);
}

function setupShareButton() {
  const shareBtn = document.getElementById('share-whatsapp');
  if (!shareBtn) return;

  const message = encodeURIComponent(
    '❤️ I just said YES! Our love story is written in the stars. Read it here: '
  );
  const url = encodeURIComponent(window.location.href);
  shareBtn.href = `https://api.whatsapp.com/send?text=${message}${url}`;
}

window.initProposal = initProposal;
