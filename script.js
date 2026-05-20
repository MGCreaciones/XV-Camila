const countdown = document.querySelector("[data-countdown]");
const magicRoot = document.createElement("div");

magicRoot.className = "floating-magic";
document.body.appendChild(magicRoot);

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  if (!countdown) return;

  const target = new Date(countdown.dataset.countdown).getTime();
  const now = Date.now();
  const distance = Math.max(0, target - now);

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  countdown.querySelector("[data-days]").textContent = pad(days);
  countdown.querySelector("[data-hours]").textContent = pad(hours);
  countdown.querySelector("[data-minutes]").textContent = pad(minutes);
  countdown.querySelector("[data-seconds]").textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createSpark(x, y) {
  const spark = document.createElement("span");
  spark.className = "spark";
  spark.style.left = `${x}px`;
  spark.style.top = `${y}px`;
  spark.style.setProperty("--spark-x", `${randomBetween(-34, 34)}px`);
  spark.style.setProperty("--spark-y", `${randomBetween(-72, -24)}px`);

  magicRoot.appendChild(spark);
  spark.addEventListener("animationend", () => spark.remove());
}

function createSparkBurst(x, y, amount = 9) {
  for (let index = 0; index < amount; index += 1) {
    window.setTimeout(() => {
      createSpark(x + randomBetween(-18, 18), y + randomBetween(-16, 16));
    }, index * 45);
  }
}

function createButterfly(delay = 0) {
  const butterfly = document.createElement("span");
  butterfly.className = "mini-butterfly";
  butterfly.style.top = `${randomBetween(14, 68)}vh`;
  butterfly.style.left = `${randomBetween(-18, -6)}vw`;
  butterfly.style.animationDelay = `${delay}s`;

  magicRoot.appendChild(butterfly);
  butterfly.addEventListener("animationend", () => butterfly.remove());
}

function startAmbientMagic() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  window.setInterval(() => {
    createSparkBurst(
      randomBetween(window.innerWidth * 0.12, window.innerWidth * 0.88),
      randomBetween(window.innerHeight * 0.18, window.innerHeight * 0.72),
      4
    );
  }, 5200);

  window.setInterval(() => {
    createButterfly(0);
  }, 7600);
}

function setupInteractiveBackground() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  function updatePointerGlow(event) {
    const point = event.touches ? event.touches[0] : event;
    if (!point) return;

    const x = Math.round((point.clientX / window.innerWidth) * 100);
    const y = Math.round((point.clientY / window.innerHeight) * 100);

    document.documentElement.style.setProperty("--pointer-x", `${x}%`);
    document.documentElement.style.setProperty("--pointer-y", `${y}%`);
  }

  window.addEventListener("pointermove", updatePointerGlow, { passive: true });
  window.addEventListener("touchmove", updatePointerGlow, { passive: true });
}

function startOpeningMagic() {
  document.body.classList.add("magic-opening");

  createSparkBurst(window.innerWidth * 0.5, window.innerHeight * 0.52, 18);

  for (let index = 0; index < 4; index += 1) {
    createButterfly(index * 0.45);
  }

  window.setTimeout(() => {
    document.body.classList.remove("magic-opening");
  }, 1900);
}

function revealOnScroll() {
  const elements = document.querySelectorAll(
    ".section-heading, .countdown, .message__photo, .message__text, .church-banner__content, .event-item, .family__grid article, .info-block, .rsvp__content, .gallery-carousel, .farewell__content"
  );

  elements.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${(index % 4) * 90}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  elements.forEach((element) => observer.observe(element));
}

window.addEventListener("pointerdown", (event) => {
  createSparkBurst(event.clientX, event.clientY, 7);
});

function setupWishCard() {
  const wishCard = document.querySelector("[data-wish-card]");
  if (!wishCard) return;

  wishCard.addEventListener("pointerdown", (event) => {
    wishCard.parentElement.classList.add("is-wishing");
    createSparkBurst(event.clientX, event.clientY, 16);

    window.setTimeout(() => {
      wishCard.parentElement.classList.remove("is-wishing");
    }, 720);
  });
}

function setupMusicPlayer() {
  const music = document.querySelector("#invitation-music");
  const player = document.querySelector(".music-player");
  if (!music || !player) return;
  if (player.dataset.musicReady === "true") return;
  player.dataset.musicReady = "true";

  let isPrepared = false;
  const startupEvents = ["pointerdown", "touchstart", "click", "keydown", "scroll"];

  function prepareMusic() {
    if (isPrepared) return;
    isPrepared = true;
    music.preload = "auto";
    music.load();
  }

  function removeStartupListeners() {
    startupEvents.forEach((eventName) => {
      window.removeEventListener(eventName, startFromInteraction);
    });
  }

  function setPlayingState(isPlaying) {
    player.classList.toggle("is-playing", isPlaying);
    player.classList.toggle("is-dismissed", isPlaying);
  }

  async function playMusic() {
    prepareMusic();
    try {
      await music.play();
      setPlayingState(true);
      return true;
    } catch {
      setPlayingState(false);
      return false;
    }
  }

  async function startFromInteraction(event) {
    if (!music.paused) {
      removeStartupListeners();
      return;
    }

    if (event.target instanceof Element && event.target.closest(".music-player")) return;

    const started = await playMusic();
    if (started) {
      removeStartupListeners();
    }
  }

  startupEvents.forEach((eventName) => {
    window.addEventListener(eventName, startFromInteraction, { passive: true });
  });
  window.addEventListener("pointerdown", prepareMusic, { once: true, passive: true });
  window.addEventListener("touchstart", prepareMusic, { once: true, passive: true });

  prepareMusic();
  playMusic().then((started) => {
    if (started) removeStartupListeners();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupMusicPlayer();
  setupInteractiveBackground();
  revealOnScroll();
  setupCarousel();
  setupWishCard();
});

window.addEventListener("load", () => {
  startOpeningMagic();
  startAmbientMagic();
});

function setupCarousel() {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector(".gallery-carousel__track");
  const slides = Array.from(track.querySelectorAll("img"));
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const dotsContainer = carousel.querySelector("[data-carousel-dots]");
  let currentIndex = 0;
  let startX = 0;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentIndex);
      dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
    });
  }

  function goToSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    updateCarousel();
  }

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "carousel-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Ver foto ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  previousButton.addEventListener("click", () => goToSlide(currentIndex - 1));
  nextButton.addEventListener("click", () => goToSlide(currentIndex + 1));

  track.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
  });

  track.addEventListener("pointerup", (event) => {
    const distance = event.clientX - startX;
    if (Math.abs(distance) < 40) return;
    goToSlide(currentIndex + (distance < 0 ? 1 : -1));
  });

  updateCarousel();
}
