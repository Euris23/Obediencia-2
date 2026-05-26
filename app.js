document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const playBtn = document.getElementById('play-btn');
  const soundBtn = document.getElementById('sound-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const thumbBtn = document.getElementById('thumb-btn');
  const currentCount = document.getElementById('current-count');
  const totalCount = document.getElementById('total-count');
  const progressBar = document.querySelector('.progress-bar-fill');
  const controlsOverlay = document.querySelector('.controls-overlay');
  const thumbnailsDrawer = document.getElementById('thumbnails-drawer');
  const toastMsg = document.getElementById('toast-msg');
  const presentationContainer = document.querySelector('.presentation-container');
  const notesBtn = document.getElementById('notes-btn');
  const speakerNotesPanel = document.getElementById('speaker-notes-panel');
  const currentNote = document.getElementById('current-note');

  let currentSlideIndex = 0;
  const totalSlides = slides.length;
  totalCount.textContent = totalSlides;

  // --- Clean Sermon Speaker Notes ---
  const speakerNotes = [
    "Portada - Introducción: Bienvenidos al estudio. Enfocaremos esta enseñanza en comprender que la obediencia no depende del proceso o de las circunstancias difíciles, sino de nuestra absoluta confianza en el carácter de Dios.",
    "Moisés y la Zarza: Reflexionar sobre el miedo y la sensación de insuficiencia humana ante el llamado. Destacar que la respuesta de Dios no es inflar el ego de Moisés, sino asegurarle Su presencia constante: 'Yo estaré contigo'.",
    "Gedeón en el lagar: Explicar cómo Gedeón se escondía por temor a los madianitas. Resaltar que Dios no nos define por nuestros temores o inseguridades de hoy, sino por el potencial de fe y valentía que Él pone en nosotros.",
    "Abraham y el desierto: La valentía de caminar hacia lo desconocido. Abraham obedece sin un mapa detallado del camino, confiando únicamente en la voz y fidelidad de Aquel que lo llamó a salir.",
    "Job y el quebranto: Adoración y fidelidad en medio de las ruinas. Exponer que nuestra relación con Dios no puede ser un intercambio comercial; le adoramos por Quién es Él, y no solo por Sus bendiciones.",
    "Daniel orando: Daniel decide orar a pesar de la ley imperial de muerte. Resaltar la importancia de la consistencia espiritual: la fuerza para resistir la crisis pública se construye en la vida privada diaria.",
    "Pedro y la red vacía: La frustración y el cansancio de Pedro tras fallar toda la noche. Su decisión de rendir su pericia humana y lógica ante la palabra de Jesús: 'Mas en tu palabra echaré la red'.",
    "Jeremías y la soledad: La firmeza ante el rechazo social. Dios llama a Jeremías a proclamar Su palabra por encima de la opinión y aprobación de la multitud. La fidelidad de un solo hombre sostiene la verdad.",
    "Noé construyendo el Arca: La perseverancia y paciencia en la espera. Construir un arca monumental durante décadas bajo la burla de todos y sin lluvia visible. La constancia diaria en el plan de Dios.",
    "Saúl y la impaciencia: La desesperación lleva a Saúl a tomar atajos y ofrecer sacrificios antes de tiempo. Mostrar cómo la prisa por miedo al enemigo militar lo sacó de la cobertura divina. El costo de adelantarse.",
    "Conclusión: Cierre y ministración del mensaje. Ciertamente la obediencia sincera tiene mayor valor para Dios que cualquier formalidad externa o ritual religioso. El atajo de la desobediencia siempre costará más caro."
  ];

  // --- Auto-Hide Controls on Idle ---
  let idleTimer;
  function resetIdleTimer() {
    controlsOverlay.classList.remove('hide-idle');
    document.body.style.cursor = 'default';
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!thumbnailsDrawer.classList.contains('visible') && !speakerNotesPanel.classList.contains('visible')) {
        controlsOverlay.classList.add('hide-idle');
        document.body.style.cursor = 'none';
      }
    }, 4500);
  }
  
  window.addEventListener('mousemove', resetIdleTimer);
  window.addEventListener('click', resetIdleTimer);
  window.addEventListener('keydown', resetIdleTimer);
  resetIdleTimer();

  // --- Thumbnail Grid Drawer Creation ---
  function buildThumbnails() {
    thumbnailsDrawer.innerHTML = '';
    slides.forEach((slide, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `thumb-item ${idx === 0 ? 'active' : ''}`;
      thumb.setAttribute('data-index', idx + 1);
      
      // Get slide background image
      const bgElement = slide.querySelector('.slide-bg') || slide.querySelector('.visual-bg-image');
      if (bgElement && bgElement.style.backgroundImage) {
        thumb.style.backgroundImage = bgElement.style.backgroundImage;
      } else {
        thumb.style.background = 'linear-gradient(135deg, #090c12 0%, #0e121a 100%)';
        thumb.style.borderLeft = '2.5px solid var(--gold-bright)';
      }
      
      thumb.addEventListener('click', () => {
        goToSlide(idx);
        thumbnailsDrawer.classList.remove('visible');
      });
      
      thumbnailsDrawer.appendChild(thumb);
    });
  }

  // --- Slide Navigation Lógica ---
  function updateSlideState() {
    slides.forEach((slide, idx) => {
      if (idx === currentSlideIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update Counter & Progress Bar
    currentCount.textContent = currentSlideIndex + 1;
    const progressPercent = ((currentSlideIndex + 1) / totalSlides) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Update Active Thumbnail
    const thumbs = document.querySelectorAll('.thumb-item');
    thumbs.forEach((thumb, idx) => {
      if (idx === currentSlideIndex) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });

    // Update Speaker Note
    currentNote.textContent = speakerNotes[currentSlideIndex];

    // Adapt sound drone
    updateSynthAtmosphere();
  }

  function goToSlide(index) {
    if (index >= 0 && index < totalSlides) {
      currentSlideIndex = index;
      updateSlideState();
    }
  }

  function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      goToSlide(currentSlideIndex + 1);
    } else {
      goToSlide(0);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    } else {
      goToSlide(totalSlides - 1);
    }
  }

  // Bind Buttons
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);
  
  // Clickable slide margins
  document.getElementById('trigger-left').addEventListener('click', prevSlide);
  document.getElementById('trigger-right').addEventListener('click', nextSlide);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      prevSlide();
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    } else if (e.key === 'm' || e.key === 'M') {
      toggleSound();
    } else if (e.key === 't' || e.key === 'T') {
      thumbnailsDrawer.classList.toggle('visible');
    } else if (e.key === 'n' || e.key === 'N') {
      speakerNotesPanel.classList.toggle('visible');
    }
  });

  // Touch Swipe Navigation
  let touchStartX = 0;
  let touchEndX = 0;

  presentationContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  presentationContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 55;
    if (touchEndX < touchStartX - swipeThreshold) {
      nextSlide();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      prevSlide();
    }
  }

  // --- Slideshow Autoplay ---
  let slideshowInterval;
  let isPlaying = false;

  function togglePlay() {
    if (isPlaying) {
      clearInterval(slideshowInterval);
      playBtn.innerHTML = '&#9654;';
      playBtn.classList.remove('active');
      isPlaying = false;
    } else {
      playBtn.innerHTML = '&#10074;&#10074;';
      playBtn.classList.add('active');
      isPlaying = true;
      slideshowInterval = setInterval(nextSlide, 8000); // 8s per slide
    }
  }

  playBtn.addEventListener('click', togglePlay);

  // --- Fullscreen ---
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      presentationContainer.requestFullscreen()
        .then(() => {
          fullscreenBtn.classList.add('active');
          showToast('Pantalla Completa Activa');
        })
        .catch(err => {
          console.error(`Error entering fullscreen: ${err.message}`);
        });
    } else {
      document.exitFullscreen();
      fullscreenBtn.classList.remove('active');
    }
  }

  fullscreenBtn.addEventListener('click', toggleFullscreen);

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      fullscreenBtn.classList.remove('active');
    }
  });

  // Toggle Panel Drawers
  thumbBtn.addEventListener('click', () => {
    thumbnailsDrawer.classList.toggle('visible');
    speakerNotesPanel.classList.remove('visible');
  });

  notesBtn.addEventListener('click', () => {
    speakerNotesPanel.classList.toggle('visible');
    thumbnailsDrawer.classList.remove('visible');
  });

  // Close drawers when clicking outside
  presentationContainer.addEventListener('click', (e) => {
    if (!e.target.closest('.control-btn') && 
        !e.target.closest('.thumbnails-drawer') && 
        !e.target.closest('.speaker-notes-panel') &&
        !e.target.closest('.nav-trigger')) {
      thumbnailsDrawer.classList.remove('visible');
      speakerNotesPanel.classList.remove('visible');
    }
  });

  // Floating notifications
  function showToast(msg) {
    toastMsg.textContent = msg;
    toastMsg.classList.add('show');
    setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 2500);
  }

  // --- SOBER WEBAUDIO DRONE SYSTEM ---
  let audioCtx = null;
  let masterGain = null;
  let osc1 = null;
  let osc2 = null;
  let lowpassFilter = null;
  let isSoundActive = false;

  // Cinematic slow chords (low base registers, very warm fifth intervals)
  const chordFrequencies = [
    { root: 65.41, fifth: 97.99 },   // Slide 0: C2 / G2 (Portada)
    { root: 55.00, fifth: 82.41 },   // Slide 1: A1 / E2 (Moisés)
    { root: 55.00, fifth: 82.41 },   // Slide 2: A1 / E2 (Gedeón)
    { root: 58.27, fifth: 87.31 },   // Slide 3: A#1 / F2 (Abraham)
    { root: 43.65, fifth: 65.41 },   // Slide 4: F1 / C2 (Job)
    { root: 48.99, fifth: 73.42 },   // Slide 5: G1 / D2 (Daniel)
    { root: 51.91, fifth: 77.78 },   // Slide 6: G#1 / D#2 (Pedro)
    { root: 61.74, fifth: 92.50 },   // Slide 7: B1 / F#2 (Jeremías)
    { root: 65.41, fifth: 97.99 },   // Slide 8: C2 / G2 (Noé)
    { root: 69.30, fifth: 103.83 },  // Slide 9: C#2 / G#2 (Saúl)
    { root: 65.41, fifth: 97.99 }    // Slide 10: C2 / G2 (Conclusión)
  ];

  function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    
    lowpassFilter = audioCtx.createBiquadFilter();
    lowpassFilter.type = 'lowpass';
    lowpassFilter.frequency.setValueAtTime(140, audioCtx.currentTime);
    lowpassFilter.Q.setValueAtTime(1, audioCtx.currentTime);

    // Triangle wave root voice
    osc1 = audioCtx.createOscillator();
    osc1.type = 'triangle';
    
    // Sine wave fifth interval voice
    osc2 = audioCtx.createOscillator();
    osc2.type = 'sine';

    // Slow vibrato
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.15; // slow organic sweep
    
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 1.0;

    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    osc1.connect(lowpassFilter);
    osc2.connect(lowpassFilter);
    lowpassFilter.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    lfo.start();
  }

  function toggleSound() {
    if (!audioCtx) {
      initAudio();
    }

    if (isSoundActive) {
      masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.9);
      soundBtn.classList.remove('active');
      isSoundActive = false;
      showToast("Ambiente Silenciado");
    } else {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      updateSynthAtmosphere(true);
      
      masterGain.gain.setTargetAtTime(0.25, audioCtx.currentTime, 1.5);
      soundBtn.classList.add('active');
      isSoundActive = true;
      showToast("Atmósfera Activa");
    }
  }

  function updateSynthAtmosphere(immediate = false) {
    if (!audioCtx || !isSoundActive) return;

    const currentChord = chordFrequencies[currentSlideIndex];
    const timeToTransition = immediate ? 0.05 : 1.8; // slow smooth glide

    osc1.frequency.setTargetAtTime(currentChord.root, audioCtx.currentTime, timeToTransition);
    osc2.frequency.setTargetAtTime(currentChord.fifth, audioCtx.currentTime, timeToTransition);
    
    let cutoffFreq = 145;
    if (currentSlideIndex === 4 || currentSlideIndex === 9) {
      cutoffFreq = 115; // deeper gravity for suffering/Saul
    } else if (currentSlideIndex === 10 || currentSlideIndex === 8 || currentSlideIndex === 0) {
      cutoffFreq = 175; // slightly brighter for glory/portada
    }
    lowpassFilter.frequency.setTargetAtTime(cutoffFreq, audioCtx.currentTime, 2.5);
  }

  soundBtn.addEventListener('click', toggleSound);

  // Initialize
  buildThumbnails();
  updateSlideState();
});
