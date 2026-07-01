/**
 * app.js - Digital Wedding Invitation Core Script
 * Designed with a premium, high-end Apple-style UI aesthetic,
 * featuring smooth animations, custom interactions, and data-driven rendering.
 */

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registered successfully:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Config state
  let weddingData = null;
  let audioPlayer = null;
  let isMusicPlaying = false;
  let petals = [];
  let petalsCanvas = null;
  let petalsCtx = null;
  let petalsAnimationId = null;

  // 1. Fetch wedding data from JSON and initialize application
  fetch("data/wedding.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load wedding data JSON.");
      }
      return response.json();
    })
    .then((data) => {
      weddingData = data;
      // Populate all dynamic fields
      populateInvitation(data);
      // Initialize systems
      initCountdown(data.countdown.target_date);
      initCalendarSync(data);
      initEnvelopeCopy(data);
      setupMusic(data.music);
      initLazyLoadSVG();
      initPetals();
      initCustomCursor();
      initScrollProgressBar();
      initRSVP();
      initNavigation();
      
      // Hide global page loading screen, fade to cover screen
      setTimeout(() => {
        const loader = document.getElementById("loading-screen");
        if (loader) {
          loader.classList.add("opacity-0", "invisible");
        }
      }, 1500);
    })
    .catch((err) => {
      console.error("Error initializing invitation:", err);
    });

  // 2. Populate DOM with wedding.json data
  function populateInvitation(data) {
    // Set Document Title and metadata
    document.title = data.meta.title;
    
    // Guest Name logic: parse '?to=Guest%20Name'
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get("to") || "Tamu Undangan";
    
    // Inject Guest Name into HTML
    const guestElements = document.querySelectorAll(".guest-name-placeholder");
    guestElements.forEach(el => el.innerText = guestName);
    
    // Set WhatsApp Share text link for invitations
    const shareText = `Halo, kami mengundang Anda untuk menghadiri pernikahan kami:\n\n*${data.mempelai.pria.nama_panggilan} & ${data.mempelai.wanita.nama_panggilan}*\n\nBerikut tautan undangan online kami:\n${window.location.origin}${window.location.pathname}?to=${encodeURIComponent(guestName)}\n\nMerupakan suatu kehormatan jika Anda berkenan hadir. Terima kasih!`;
    const shareBtn = document.getElementById("share-invitation-btn");
    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
      });
    }

    // Cover Page Names & Date
    document.getElementById("cover-pria-nama").innerText = data.mempelai.pria.nama_panggilan;
    document.getElementById("cover-wanita-nama").innerText = data.mempelai.wanita.nama_panggilan;
    document.getElementById("cover-wedding-date").innerText = data.acara.akad.tanggal;

    // Hero / Header Section Names
    document.getElementById("hero-pria-nama").innerText = data.mempelai.pria.nama_panggilan;
    document.getElementById("hero-wanita-nama").innerText = data.mempelai.wanita.nama_panggilan;

    // Ayat / Quote Section
    document.getElementById("ayat-teks-ar").innerText = data.ayat.teks_ar;
    document.getElementById("ayat-teks-id").innerText = data.ayat.teks_id;
    document.getElementById("ayat-sumber").innerText = data.ayat.sumber;

    // Mempelai Profiles
    // Groom (Pria) - Use JPG placeholder, lazy load SVG
    const groomImg = document.getElementById("groom-img");
    groomImg.src = data.mempelai.pria.foto.replace('.svg', '.jpg');
    groomImg.dataset.srcSvg = data.mempelai.pria.foto;
    document.getElementById("groom-fullname").innerText = data.mempelai.pria.nama_lengkap;
    document.getElementById("groom-parents").innerText = `Putra dari ${data.mempelai.pria.ayah} & ${data.mempelai.pria.ibu}`;
    const groomIg = document.getElementById("groom-instagram");
    if (data.mempelai.pria.instagram) {
      groomIg.href = `https://instagram.com/${data.mempelai.pria.instagram}`;
      groomIg.innerHTML = `<i class="fab fa-instagram mr-2"></i>@${data.mempelai.pria.instagram}`;
    } else {
      groomIg.style.display = "none";
    }

    // Bride (Wanita) - Use JPG placeholder, lazy load SVG
    const brideImg = document.getElementById("bride-img");
    brideImg.src = data.mempelai.wanita.foto.replace('.svg', '.jpg');
    brideImg.dataset.srcSvg = data.mempelai.wanita.foto;
    document.getElementById("bride-fullname").innerText = data.mempelai.wanita.nama_lengkap;
    document.getElementById("bride-parents").innerText = data.mempelai.wanita.ibu 
      ? `Putri dari ${data.mempelai.wanita.ayah} & ${data.mempelai.wanita.ibu}`
      : `Putri dari ${data.mempelai.wanita.ayah}`;
    const brideIg = document.getElementById("bride-instagram");
    if (data.mempelai.wanita.instagram) {
      brideIg.href = `https://instagram.com/${data.mempelai.wanita.instagram}`;
      brideIg.innerHTML = `<i class="fab fa-instagram mr-2"></i>@${data.mempelai.wanita.instagram}`;
    } else {
      brideIg.style.display = "none";
    }

    // Event Details (Acara)
    // Akad
    document.getElementById("akad-hari").innerText = data.acara.akad.hari;
    document.getElementById("akad-tanggal").innerText = data.acara.akad.tanggal;
    document.getElementById("akad-jam").innerText = data.acara.akad.jam;
    document.getElementById("akad-tempat").innerText = data.acara.akad.tempat;
    document.getElementById("akad-alamat").innerText = data.acara.akad.alamat;
    document.getElementById("akad-map-btn").href = data.acara.akad.map_link;

    // Resepsi
    document.getElementById("resepsi-hari").innerText = data.acara.resepsi.hari;
    document.getElementById("resepsi-tanggal").innerText = data.acara.resepsi.tanggal;
    document.getElementById("resepsi-jam").innerText = data.acara.resepsi.jam;
    document.getElementById("resepsi-tempat").innerText = data.acara.resepsi.tempat;
    document.getElementById("resepsi-alamat").innerText = data.acara.resepsi.alamat;
    document.getElementById("resepsi-map-btn").href = data.acara.resepsi.map_link;
    
    // Embed Maps
    // For simplicity and premium loading, we use an embed layout of Jakarta Kuningan place
    const embedIframe = document.getElementById("maps-iframe");
    if (embedIframe) {
      embedIframe.src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.5229614488344!2d106.73068071131102!3d-6.293168561440854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f15bd0a224ef%3A0x8722c31febc4a0cc!2sIndomaret+Cendrawasih+74!5e0!3m2!1sid!2sid!4v1719230000000!5m2!1sid!2sid";
    }
    const mapGlobalBtn = document.getElementById("global-map-btn");
    if (mapGlobalBtn) {
      mapGlobalBtn.href = data.acara.resepsi.map_link;
    }
    const navGlobalBtn = document.getElementById("global-nav-btn");
    if (navGlobalBtn) {
      navGlobalBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(data.acara.resepsi.alamat)}`;
    }

    // Love Story
    const storyTimeline = document.getElementById("story-timeline");
    storyTimeline.innerHTML = "";
    data.love_story.forEach((story, idx) => {
      const isEven = idx % 2 === 0;
      const timelineItem = `
        <div class="mb-12 flex justify-between items-center w-full ${isEven ? 'flex-row-reverse' : ''} aos-init" data-aos="${isEven ? 'fade-left' : 'fade-right'}">
          <div class="w-5/12 hidden md:block"></div>
          <div class="z-20 flex items-center order-1 bg-bw-900 w-10 h-10 rounded-full timeline-dot border-2 border-white justify-center text-white text-sm font-semibold">
            ${idx + 1}
          </div>
          <div class="order-1 glass rounded-2xl w-full md:w-5/12 px-6 py-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-bw-100">
            <span class="mb-1 text-xs font-semibold text-bw-600 block tracking-widest">${story.tanggal}</span>
            <h3 class="mb-2 font-bold text-lg font-title tracking-wide text-bw-900">${story.judul}</h3>
            <p class="text-xs leading-relaxed text-bw-500 font-light">${story.deskripsi}</p>
          </div>
        </div>
      `;
      storyTimeline.innerHTML += timelineItem;
    });

    // Gallery Lightbox setup
    const galleryGrid = document.getElementById("gallery-grid");
    galleryGrid.innerHTML = "";
    data.galeri.forEach((imgSrc, idx) => {
      const jpgSrc = imgSrc.replace('.svg', '.jpg');
      const item = `
        <div class="overflow-hidden rounded-2xl cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-500 relative lazy-svg-wrapper aos-init" data-aos="fade-up" data-aos-delay="${idx * 150}">
          <img src="${jpgSrc}" data-src-svg="${imgSrc}" alt="Prewedding Burhan & Fira ${idx + 1}" class="w-full h-72 object-cover transition-transform duration-700 ease-out group-hover:scale-110 lazy-svg grayscale group-hover:grayscale-0 transition-all" loading="lazy" />
          <div class="absolute inset-0 bg-bw-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <div class="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-bw-900 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <i class="fas fa-search-plus"></i>
            </div>
          </div>
        </div>
      `;
      const div = document.createElement("div");
      div.innerHTML = item;
      const child = div.firstElementChild;
      child.addEventListener("click", () => openLightbox(imgSrc, idx, data.galeri));
      galleryGrid.appendChild(child);
    });

    // Video Youtube Setup
    const videoContainer = document.getElementById("video-iframe-container");
    if (videoContainer) {
      videoContainer.src = `https://www.youtube.com/embed/${data.video.youtube_id}?enablejsapi=1&origin=${window.location.origin}`;
    }

    // Audio text details
    document.getElementById("music-name-title").innerText = data.music.judul;

    // Closing section names
    document.getElementById("closing-pria-nama").innerText = data.mempelai.pria.nama_panggilan;
    document.getElementById("closing-wanita-nama").innerText = data.mempelai.wanita.nama_panggilan;
  }

  // 3. Countdown timer logic
  function initCountdown(targetDateStr) {
    const countdownDate = new Date(targetDateStr).getTime();

    function updateTimer() {
      const now = new Date().getTime();
      const distance = countdownDate - now;

      if (distance < 0) {
        clearInterval(timerInterval);
        document.getElementById("countdown-container").innerHTML = `<div class="text-center font-title text-2xl text-white">Hari Bahagia Telah Tiba!</div>`;
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      document.getElementById("days").innerText = days.toString().padStart(2, "0");
      document.getElementById("hours").innerText = hours.toString().padStart(2, "0");
      document.getElementById("minutes").innerText = minutes.toString().padStart(2, "0");
      document.getElementById("seconds").innerText = seconds.toString().padStart(2, "0");
    }

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
  }

  // 4. Custom smooth cursor
  function initCustomCursor() {
    const cursor = document.getElementById("custom-cursor");
    const dot = document.getElementById("custom-cursor-dot");
    
    if (!cursor || !dot) return;

    // Check if device supports hover events (not touch-only)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    document.body.classList.add("has-custom-cursor");

    document.addEventListener("mousemove", (e) => {
      // Small delay on outer ring for luxury inertia feel
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
    });

    const addHoverEffect = () => cursor.classList.add("cursor-hover");
    const removeHoverEffect = () => cursor.classList.remove("cursor-hover");

    // Scan the DOM for hoverable items
    const setupInteractiveElements = () => {
      const targets = document.querySelectorAll("a, button, input, select, textarea, [role='button'], .cursor-pointer");
      targets.forEach(target => {
        target.removeEventListener("mouseenter", addHoverEffect);
        target.removeEventListener("mouseleave", removeHoverEffect);
        target.addEventListener("mouseenter", addHoverEffect);
        target.addEventListener("mouseleave", removeHoverEffect);
      });
    };

    setupInteractiveElements();
    // Observe DOM changes to apply cursor hover state on newly added elements
    const observer = new MutationObserver(setupInteractiveElements);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // 5. Scroll progress indicator bar
  function initScrollProgressBar() {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return;
    
    window.addEventListener("scroll", () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const scrollVal = (window.scrollY / scrollTotal) * 100;
      bar.style.width = `${scrollVal}%`;
    });
  }

  // 6. Floating Navigation Bar show/hide on scroll & active states
  function initNavigation() {
    const navbar = document.getElementById("floating-nav");
    if (!navbar) return;

    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 150) {
        // Shrink navigation when scrolling
        navbar.classList.add("py-2");
        navbar.classList.remove("py-4");

        if (currentScrollY > lastScrollY) {
          // Scrolling down: hide navigation
          navbar.style.transform = "translate(-50%, 150%)";
        } else {
          // Scrolling up: show navigation
          navbar.style.transform = "translate(-50%, 0)";
        }
      } else {
        navbar.classList.remove("py-2");
        navbar.classList.add("py-4");
        navbar.style.transform = "translate(-50%, 0)";
      }

      lastScrollY = currentScrollY;
      highlightNavOnScroll();
    });

    // Active state highlighting
    const navItems = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section[id]");

    function highlightNavOnScroll() {
      let currentSectionId = "";
      sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        const height = sec.offsetHeight;
        const scrollY = window.scrollY;
        if (scrollY >= top && scrollY < top + height) {
          currentSectionId = sec.getAttribute("id");
        }
      });

      navItems.forEach(item => {
        item.classList.remove("text-bw-900", "font-semibold");
        item.classList.add("text-bw-400");
        if (item.getAttribute("href") === `#${currentSectionId}`) {
          item.classList.remove("text-bw-400");
          item.classList.add("text-bw-900", "font-semibold");
        }
      });
    }

    // Scroll to section smoothly
    navItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = item.getAttribute("href");
        const targetSec = document.querySelector(targetId);
        if (targetSec) {
          window.scrollTo({
            top: targetSec.offsetTop - 80,
            behavior: "smooth"
          });
        }
      });
    });
  }

  // 7. Lightbox for Masonry Gallery
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  let currentGalleryIndex = 0;
  let activeGalleryList = [];

  function openLightbox(imgSrc, index, list) {
    if (!lightbox || !lightboxImg) return;
    currentGalleryIndex = index;
    activeGalleryList = list;
    
    lightboxImg.src = imgSrc;
    lightbox.style.display = "flex";
    setTimeout(() => {
      lightbox.classList.add("active");
    }, 10);
    document.body.style.overflow = "hidden"; // disable scrolling
  }

  // Close Lightbox
  const closeBtn = document.getElementById("lightbox-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    setTimeout(() => {
      lightbox.style.display = "none";
    }, 300);
    document.body.style.overflow = ""; // enable scrolling
  }

  // Prev / Next Lightbox
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (activeGalleryList.length === 0) return;
      currentGalleryIndex = (currentGalleryIndex - 1 + activeGalleryList.length) % activeGalleryList.length;
      lightboxImg.src = activeGalleryList[currentGalleryIndex];
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (activeGalleryList.length === 0) return;
      currentGalleryIndex = (currentGalleryIndex + 1) % activeGalleryList.length;
      lightboxImg.src = activeGalleryList[currentGalleryIndex];
    });
  }

  // Swipe support for Lightbox (Mobile)
  let touchStartX = 0;
  let touchEndX = 0;
  if (lightboxImg) {
    lightboxImg.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    lightboxImg.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });
  }

  function handleSwipe() {
    if (touchStartX - touchEndX > 50) {
      // Swipe left -> Next
      nextBtn && nextBtn.click();
    }
    if (touchEndX - touchStartX > 50) {
      // Swipe right -> Prev
      prevBtn && prevBtn.click();
    }
  }

  // 8. Background Music Configuration — YouTube IFrame Player API
  function setupMusic(musicConfig) {
    const youtubeId = musicConfig.youtube_id;
    if (!youtubeId) return;

    const eqBars      = document.querySelectorAll(".eq-bar");
    const toggleBtns  = document.querySelectorAll(".music-toggle-btn");
    const btnIcons     = document.querySelectorAll(".music-btn-icon");
    const volumeSlider = document.getElementById("volume-slider");

    // Update widget title
    const titleEl = document.getElementById("music-name-title");
    if (titleEl) titleEl.innerText = musicConfig.judul || "Music Pernikahan";

    let ytPlayer    = null;
    let ytReady     = false;
    let pendingPlay = false;

    function startEqualizerAnim() { eqBars.forEach(b => b.classList.add("animating")); }
    function stopEqualizerAnim()  { eqBars.forEach(b => b.classList.remove("animating")); }

    // Inject hidden YouTube iframe container
    const iframeWrap = document.createElement("div");
    iframeWrap.id = "yt-music-container";
    iframeWrap.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;pointer-events:none;z-index:-1;";
    iframeWrap.innerHTML = '<div id="yt-music-player"></div>';
    document.body.appendChild(iframeWrap);

    function initYTPlayer() {
      ytPlayer = new YT.Player("yt-music-player", {
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          loop: 1,
          playlist: youtubeId,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: function(e) {
            ytReady = true;
            e.target.setVolume(70);
            if (pendingPlay) { e.target.playVideo(); pendingPlay = false; }
          },
          onStateChange: function(e) {
            if (e.data === YT.PlayerState.PLAYING) {
              isMusicPlaying = true;
              btnIcons.forEach(ic => { ic.classList.remove("fa-play"); ic.classList.add("fa-pause"); });
              startEqualizerAnim();
            } else if (e.data === YT.PlayerState.PAUSED) {
              isMusicPlaying = false;
              btnIcons.forEach(ic => { ic.classList.remove("fa-pause"); ic.classList.add("fa-play"); });
              stopEqualizerAnim();
            } else if (e.data === YT.PlayerState.ENDED) {
              // Manual loop fallback
              if (ytReady) { ytPlayer.seekTo(0); ytPlayer.playVideo(); }
            }
          }
        }
      });
    }

    function loadYTAPI() {
      if (window.YT && window.YT.Player) { initYTPlayer(); return; }
      // Set global callback for when YT API loads
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function() {
        if (prevCallback) prevCallback();
        initYTPlayer();
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }

    function playMusic() {
      if (!ytReady) { pendingPlay = true; loadYTAPI(); return; }
      ytPlayer.playVideo();
    }

    function pauseMusic() {
      if (ytReady && ytPlayer) ytPlayer.pauseVideo();
    }

    function toggleMusic() {
      if (isMusicPlaying) { pauseMusic(); showToast("Musik Dijeda"); }
      else { playMusic(); showToast("Musik Diputar"); }
    }

    toggleBtns.forEach(btn => btn.addEventListener("click", toggleMusic));

    // Volume slider (YT API uses 0-100)
    if (volumeSlider) {
      volumeSlider.addEventListener("input", (e) => {
        const vol = Math.round(parseFloat(e.target.value) * 100);
        if (ytReady && ytPlayer) ytPlayer.setVolume(vol);
        if (vol === 0) stopEqualizerAnim();
        else if (isMusicPlaying) startEqualizerAnim();
      });
    }

    // Buka Undangan: open cover + auto-play music
    const openBtn = document.getElementById("btn-buka-undangan");
    const cover   = document.getElementById("cover-screen");

    if (openBtn && cover) {
      openBtn.addEventListener("click", () => {
        // Load API and schedule play
        pendingPlay = true;
        loadYTAPI();

        // Lift cover
        cover.classList.add("-translate-y-full", "opacity-0");
        setTimeout(() => {
          cover.style.display = "none";
          if (typeof AOS !== "undefined") {
            AOS.init({ duration: 800, easing: "ease-out-cubic", once: true, delay: 50 });
          }
          triggerGSAPEntrance();
        }, 1200);

        // Show floating controls & navbar
        document.getElementById("floating-nav").classList.remove("translate-y-40");
        document.getElementById("music-widget").classList.remove("translate-y-40");

        // Show Back to Top
        const btt = document.getElementById("back-to-top");
        if (btt) {
          window.addEventListener("scroll", () => {
            if (window.scrollY > 500) {
              btt.classList.remove("translate-y-40", "opacity-0");
              btt.classList.add("translate-y-0", "opacity-100");
            } else {
              btt.classList.add("translate-y-40", "opacity-0");
              btt.classList.remove("translate-y-0", "opacity-100");
            }
          });
          btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
        }
      });
    }
  }

  // 9. GSAP Entrance Animations
  function triggerGSAPEntrance() {
    if (typeof gsap === "undefined") return;

    // Elegant entrance for Hero banner elements
    const tl = gsap.timeline();
    tl.from("#hero-subtitle", { y: 30, opacity: 0, duration: 1.2, ease: "power3.out" })
      .from("#hero-title-group", { y: 40, opacity: 0, duration: 1.5, ease: "power3.out" }, "-=0.8")
      .from("#hero-date", { y: 20, opacity: 0, duration: 1, ease: "power3.out" }, "-=1")
      .from("#hero-quote-ornament", { scale: 0.8, opacity: 0, duration: 1.5, ease: "back.out(1.5)" }, "-=0.8");
  }

  // 10. Copy Bank details & QRIS download
  function initEnvelopeCopy(data) {
    const copyButtons = document.querySelectorAll(".btn-copy-account");
    copyButtons.forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        const bankData = data.amplop.bank[idx];
        if (!bankData) return;
        
        navigator.clipboard.writeText(bankData.no_rekening).then(() => {
          showToast(`Nomor Rekening ${bankData.nama_bank} disalin!`);
        }).catch(err => {
          console.error("Copy failed:", err);
          showToast("Gagal menyalin.");
        });
      });
    });

    // QRIS graphic dynamically generated using custom inline SVG layout (highly clean and premium)
    const qrisContainer = document.getElementById("qris-qr-container");
    if (qrisContainer) {
      qrisContainer.innerHTML = `
        <svg viewBox="0 0 200 200" class="w-44 h-44 mx-auto border-4 border-bw-100 rounded-lg p-2 bg-white">
          <!-- Background QR blocks visual representation -->
          <rect x="10" y="10" width="40" height="40" fill="#1A1A17" />
          <rect x="20" y="20" width="20" height="20" fill="#fff" />
          <rect x="25" y="25" width="10" height="10" fill="#1A1A17" />
          
          <rect x="150" y="10" width="40" height="40" fill="#1A1A17" />
          <rect x="160" y="20" width="20" height="20" fill="#fff" />
          <rect x="165" y="25" width="10" height="10" fill="#1A1A17" />
          
          <rect x="10" y="150" width="40" height="40" fill="#1A1A17" />
          <rect x="20" y="160" width="20" height="20" fill="#fff" />
          <rect x="25" y="165" width="10" height="10" fill="#1A1A17" />
          
          <!-- Middle dummy code representation -->
          <path d="M 60,20 H 140 M 60,30 H 100 M 110,35 H 140 M 60,60 H 80 M 100,60 H 120 M 130,65 H 180" stroke="#1A1A17" stroke-width="4" stroke-linecap="round"/>
          <path d="M 20,60 V 140 M 30,60 V 90 M 35,110 V 140 M 60,80 V 120 M 120,80 V 140 M 140,80 V 120" stroke="#1A1A17" stroke-width="4" stroke-linecap="round"/>
          <path d="M 60,100 H 140 M 60,120 H 100 M 110,130 H 180 M 60,140 H 80 M 100,150 H 120 M 130,165 H 180" stroke="#1A1A17" stroke-width="4" stroke-linecap="round"/>
          <path d="M 160,60 V 140 M 170,60 V 90 M 175,110 V 140 M 150,80 V 120 M 180,80 V 140" stroke="#1A1A17" stroke-width="4" stroke-linecap="round"/>
          
          <!-- Central Monochrome Heart Badge -->
          <circle cx="100" cy="100" r="16" fill="#1A1A17" />
          <path d="M 100,106 C 96,102 92,100 92,96 C 92,93 94.5,91 97.5,91 C 99.2,91 100,92.5 100,92.5 C 100,92.5 100.8,91 102.5,91 C 105.5,91 108,93 108,96 C 108,100 104,102 100,106 Z" fill="#fff" />
        </svg>
        <span class="text-[10px] text-bw-400 mt-2 block tracking-widest">PINDAI QRIS UNTUK DONASI</span>
      `;
    }
  }

  // 11. Toast Notifications System
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    
    toast.querySelector(".toast-text").innerText = message;
    
    toast.classList.remove("translate-y-100", "opacity-0");
    toast.classList.add("active");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("active");
    }, 2500);
  }

  // 12. Calendar Sync logic (Google, ICS, Outlook)
  function initCalendarSync(data) {
    // Generate .ICS file format content for local devices download (Apple Calendar)
    const startDate = "20260808T080000+0700";
    const endDate = "20260809T140000+0700";
    const title = `Pernikahan ${data.mempelai.pria.nama_panggilan} & ${data.mempelai.wanita.nama_panggilan}`;
    const description = `Mohon doa restu Anda pada hari bahagia kami. Resepsi diselenggarakan di ${data.acara.resepsi.tempat}, Alamat: ${data.acara.resepsi.alamat}`;
    const location = data.acara.resepsi.tempat;

    const icsContent = 
      "BEGIN:VCALENDAR\n" +
      "VERSION:2.0\n" +
      "PRODID:-//Digital Wedding Invitation//EN\n" +
      "BEGIN:VEVENT\n" +
      `UID:wedding-${Date.now()}@weddinginvitation.com\n` +
      `DTSTAMP:${startDate}\n` +
      `DTSTART:${startDate}\n` +
      `DTEND:${endDate}\n` +
      `SUMMARY:${title}\n` +
      `DESCRIPTION:${description}\n` +
      `LOCATION:${location}\n` +
      "END:VEVENT\n" +
      "END:VCALENDAR";

    const icsDataUri = "data:text/calendar;charset=utf-8," + encodeURIComponent(icsContent);

    // Bind Google Calendar button
    const googleBtn = document.getElementById("cal-google");
    if (googleBtn) {
      const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=20260808T010000Z/20260809T070000Z&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
      googleBtn.href = gCalUrl;
    }

    // Bind Apple / ICS Calendar button
    const appleBtn = document.getElementById("cal-apple");
    if (appleBtn) {
      appleBtn.href = icsDataUri;
      appleBtn.setAttribute("download", "wedding-event.ics");
    }

    // Bind Outlook Calendar button
    const outlookBtn = document.getElementById("cal-outlook");
    if (outlookBtn) {
      const outCalUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(title)}&startdt=2026-08-08T08:00:00&enddt=2026-08-09T14:00:00&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
      outlookBtn.href = outCalUrl;
    }
  }

  // 13. RSVP and Guest Wishes submission (saved to LocalStorage & rendered live)
  function initRSVP() {
    const rsvpForm = document.getElementById("rsvp-form");
    const wishesContainer = document.getElementById("wishes-container");
    
    // Load existing wishes from LocalStorage or default pre-loaded mock list
    let wishes = JSON.parse(localStorage.getItem("wedding_wishes")) || [
      { nama: "Bapak Lukman Prasetyo", kehadiran: "hadir", ucapan: "Selamat menempuh hidup baru Burhan & Fira! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Maaf belum bisa hadir langsung karena masih di luar kota.", waktu: "2 jam yang lalu" },
      { nama: "Nadia & Rian", kehadiran: "hadir", ucapan: "Happy wedding Fira & Burhan! Senang sekali melihat perjalanan cinta kalian berdua akhirnya bermuara di pelaminan. Cantik dan ganteng sekali hari ini! See you guys soon!", waktu: "3 jam yang lalu" },
      { nama: "Alifia Zahra", kehadiran: "hadir", ucapan: "Selamat ya Fira sayangg! Lancar-lancar sampai hari H dan bahagia selamanya bareng suami! Amin yra 🤍", waktu: "5 jam yang lalu" }
    ];

    function renderWishes() {
      if (!wishesContainer) return;
      wishesContainer.innerHTML = "";
      
      if (wishes.length === 0) {
        wishesContainer.innerHTML = `<p class="text-stone-400 text-center italic py-6 text-sm font-light">Belum ada ucapan. Jadilah yang pertama memberikan doa!</p>`;
        return;
      }

      wishes.forEach(wish => {
        const hadirBadge = wish.kehadiran === "hadir" 
          ? `<span class="bg-bw-900 text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium tracking-wide">Hadir</span>`
          : `<span class="bg-bw-100 text-bw-600 text-[10px] px-2.5 py-0.5 rounded-full border border-bw-200 font-medium tracking-wide">Berhalangan</span>`;

        const wishCard = `
          <div class="glass p-5 rounded-2xl border border-bw-100 relative shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-center justify-between gap-2 mb-2">
              <h4 class="font-semibold text-bw-900 text-sm font-title tracking-wide">${wish.nama}</h4>
              <div class="flex items-center gap-2">
                ${hadirBadge}
                <span class="text-[10px] text-bw-400 font-light">${wish.waktu}</span>
              </div>
            </div>
            <p class="text-xs text-bw-600 leading-relaxed font-light whitespace-pre-wrap">${wish.ucapan}</p>
          </div>
        `;
        wishesContainer.innerHTML += wishCard;
      });
    }

    renderWishes();

    if (rsvpForm) {
      rsvpForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Retrieve field values
        const namaInput = document.getElementById("rsvp-nama");
        const waInput = document.getElementById("rsvp-wa");
        const kehadiranSelect = document.getElementById("rsvp-kehadiran");
        const ucapanText = document.getElementById("rsvp-ucapan");

        if (!namaInput.value.trim() || !ucapanText.value.trim()) {
          showToast("Mohon lengkapi nama dan ucapan Anda.");
          return;
        }

        // Add to wishes array
        const newWish = {
          nama: namaInput.value.trim(),
          kehadiran: kehadiranSelect.value,
          ucapan: ucapanText.value.trim(),
          waktu: "Baru saja"
        };

        wishes.unshift(newWish);
        localStorage.setItem("wedding_wishes", JSON.stringify(wishes));

        // Rerender wishes list
        renderWishes();

        // Reset form
        rsvpForm.reset();

        // Floating label adjustment after reset
        const floatingLabels = rsvpForm.querySelectorAll("label");
        floatingLabels.forEach(label => {
          label.style.top = "1rem";
          label.style.fontSize = "0.95rem";
          label.style.opacity = "0.6";
        });

        // Trigger Success feedback
        showToast("RSVP & Doa Berhasil Dikirim!");
        
        // Dynamic confetti/success reveal
        const successMessage = document.getElementById("rsvp-success");
        if (successMessage) {
          successMessage.classList.remove("hidden", "opacity-0");
          successMessage.classList.add("flex", "opacity-100");
          setTimeout(() => {
            successMessage.classList.remove("opacity-100");
            successMessage.classList.add("opacity-0");
            setTimeout(() => {
              successMessage.classList.add("hidden");
            }, 500);
          }, 3000);
        }
      });
    }
  }

  // 14. Falling Gold Petals Simulation (HTML5 Canvas)
  function initPetals() {
    petalsCanvas = document.getElementById("petals-canvas");
    if (!petalsCanvas) return;

    petalsCtx = petalsCanvas.getContext("2d");
    resizeCanvas();

    window.addEventListener("resize", () => {
      resizeCanvas();
    });

    const isMobile = window.innerWidth < 768;
    const petalCount = isMobile ? 20 : 50;

    for (let i = 0; i < petalCount; i++) {
      petals.push(createPetal());
    }

    animatePetals();
  }

  function resizeCanvas() {
    if (!petalsCanvas) return;
    petalsCanvas.width = window.innerWidth;
    petalsCanvas.height = window.innerHeight;
  }

  function createPetal() {
    // Elegant monochrome petals: white, light gray, or dark near-black
    const palette = ["#FFFFFF", "#E8E8E4", "#C2C2BA", "#9A9A90", "#1A1A17"];
    const color = palette[Math.floor(Math.random() * palette.length)];
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight - 20,
      size: Math.random() * 7 + 4,
      opacity: Math.random() * 0.35 + 0.12,
      speedY: Math.random() * 1.0 + 0.6,
      speedX: Math.random() * 0.8 - 0.4,
      angle: Math.random() * Math.PI,
      spinSpeed: Math.random() * 0.02 - 0.01,
      color: color
    };
  }

  function animatePetals() {
    petalsCtx.clearRect(0, 0, petalsCanvas.width, petalsCanvas.height);

    petals.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y / 30) * 0.5; // gentle swaying drift
      p.angle += p.spinSpeed;

      // Draw elegant monochrome petal
      petalsCtx.save();
      petalsCtx.translate(p.x, p.y);
      petalsCtx.rotate(p.angle);
      petalsCtx.beginPath();
      
      // Flower petal shape using bezier curves
      petalsCtx.moveTo(0, -p.size);
      petalsCtx.bezierCurveTo(p.size * 0.6, -p.size * 0.6, p.size * 0.6, p.size * 0.6, 0, p.size);
      petalsCtx.bezierCurveTo(-p.size * 0.6, p.size * 0.6, -p.size * 0.6, -p.size * 0.6, 0, -p.size);
      
      petalsCtx.fillStyle = p.color + Math.round(p.opacity * 255).toString(16).padStart(2, '0');
      petalsCtx.fill();
      petalsCtx.restore();

      // Recycle petals that fall off the screen
      if (p.y > window.innerHeight + 20) {
        p.y = -20;
        p.x = Math.random() * window.innerWidth;
        p.opacity = Math.random() * 0.5 + 0.3;
      }
    });

    petalsAnimationId = requestAnimationFrame(animatePetals);
  }

  // 15. Lazy Loading SVG Images with IntersectionObserver
  function initLazyLoadSVG() {
    const lazyImages = document.querySelectorAll('img.lazy-svg[data-src-svg]');
    
    if (!lazyImages.length) return;

    // Use IntersectionObserver for efficient viewport-based loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const svgSrc = img.dataset.srcSvg;
            
            if (svgSrc) {
              // Preload the SVG in background
              const preloadImg = new Image();
              preloadImg.onload = () => {
                // Swap to SVG source
                img.src = svgSrc;
                // Trigger blur-up transition
                img.classList.add('loaded');
                // Mark wrapper as loaded to hide shimmer
                const wrapper = img.closest('.lazy-svg-wrapper');
                if (wrapper) {
                  wrapper.classList.add('loaded');
                }
                // Clean up data attribute
                delete img.dataset.srcSvg;
              };
              preloadImg.onerror = () => {
                // Fallback: keep JPG, still remove blur
                img.classList.add('loaded');
                const wrapper = img.closest('.lazy-svg-wrapper');
                if (wrapper) {
                  wrapper.classList.add('loaded');
                }
                console.warn('Failed to load SVG:', svgSrc);
              };
              preloadImg.src = svgSrc;
            }
            
            // Stop observing this image
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '200px 0px', // Start loading 200px before entering viewport
        threshold: 0.01
      });

      lazyImages.forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyImages.forEach(img => {
        const svgSrc = img.dataset.srcSvg;
        if (svgSrc) {
          img.src = svgSrc;
          img.classList.add('loaded');
          const wrapper = img.closest('.lazy-svg-wrapper');
          if (wrapper) {
            wrapper.classList.add('loaded');
          }
        }
      });
    }
  }

  // Micro interaction - Button ripple effects
  document.addEventListener("click", (e) => {
    const button = e.target.closest(".ripple-btn");
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add("ripple");

    // Remove existing ripple
    const prevRipple = button.querySelector(".ripple");
    if (prevRipple) prevRipple.remove();

    button.appendChild(ripple);
  });
});
