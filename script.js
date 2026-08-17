/* ============================================================
   Hirad — Portfolio interactions
   Vanilla JS, no dependencies.
   ============================================================ */

(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  /* ---------------------------------------------------------
     1. Particle background
     --------------------------------------------------------- */
  function initCanvas() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas || reducedMotion) return;

    const ctx = canvas.getContext("2d");
    const colors = ["#5D03FF", "#1E91D6", "#E0ACD5", "#D2FDFF"];
    const pointer = { x: -9999, y: -9999 };
    let particles = [];
    let width = 0;
    let height = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(90, Math.floor((width * height) / 18000));
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.9 + 0.7,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // gentle drift away from the pointer
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130 && dist > 0) {
          p.x += (dx / dist) * 0.7;
          p.y += (dy / dist) * 0.7;
        }

        ctx.globalAlpha = 0.65;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // link nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.globalAlpha = (1 - d / 120) * 0.18;
            ctx.strokeStyle = "#5D03FF";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    });
    window.addEventListener("pointerleave", () => {
      pointer.x = pointer.y = -9999;
    });

    resize();
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------
     2. Cursor glow
     --------------------------------------------------------- */
  function initCursorGlow() {
    const glow = document.getElementById("cursor-glow");
    if (!glow || isTouch || reducedMotion) return;

    let targetX = 0, targetY = 0, x = 0, y = 0;

    window.addEventListener("pointermove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      glow.style.opacity = "1";
    });

    (function follow() {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      glow.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    })();
  }

  /* ---------------------------------------------------------
     3. Nav: scrolled state, progress bar, scroll spy
     --------------------------------------------------------- */
  function initNav() {
    const nav = document.getElementById("nav");
    const bar = document.getElementById("progress-bar");
    const links = Array.from(document.querySelectorAll(".nav__link"));
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    function onScroll() {
      const y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 40);

      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = max > 0 ? `${(y / max) * 100}%` : "0%";

      let activeId = sections[0] ? sections[0].id : null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) {
          activeId = section.id;
        }
      }
      links.forEach((link) =>
        link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`)
      );
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------
     4. Mobile menu
     --------------------------------------------------------- */
  function initMenu() {
    const burger = document.getElementById("nav-burger");
    const menu = document.getElementById("nav-links");
    if (!burger || !menu) return;

    function close() {
      burger.classList.remove("is-open");
      menu.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
    window.addEventListener("keydown", (e) => e.key === "Escape" && close());
  }

  /* ---------------------------------------------------------
     5. Typing effect
     --------------------------------------------------------- */
  function initTyping() {
    const el = document.getElementById("typed");
    if (!el) return;

    const phrases = [
      "I build browser games.",
      "I craft 3D worlds with Three.js.",
      "I write AI that fights back.",
      "I ship interactive web experiences."
    ];

    if (reducedMotion) {
      el.textContent = phrases[0];
      return;
    }

    let phrase = 0;
    let char = 0;
    let deleting = false;

    (function tick() {
      const current = phrases[phrase];
      char += deleting ? -1 : 1;
      el.textContent = current.slice(0, char);

      let delay = deleting ? 35 : 65;

      if (!deleting && char === current.length) {
        delay = 1800;
        deleting = true;
      } else if (deleting && char === 0) {
        deleting = false;
        phrase = (phrase + 1) % phrases.length;
        delay = 400;
      }

      setTimeout(tick, delay);
    })();
  }

  /* ---------------------------------------------------------
     6. Scroll reveal + counters + skill bars
     --------------------------------------------------------- */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    (function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    })(start);
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("is-visible");

          el.querySelectorAll("[data-count]").forEach(animateCount);
          el.querySelectorAll(".bar__fill").forEach((fill) => {
            setTimeout(() => {
              fill.style.width = `${fill.dataset.level}%`;
            }, 200);
          });

          observer.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------
     7. Card tilt
     --------------------------------------------------------- */
  function initTilt() {
    if (isTouch || reducedMotion) return;

    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateX(${-py * 7}deg) rotateY(${px * 7}deg) translateY(-6px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------
     8. Contact form (client-side validation only)
     --------------------------------------------------------- */
  function initForm() {
    const form = document.getElementById("contact-form");
    const note = document.getElementById("form-note");
    const button = document.getElementById("submit-btn");
    const label = document.getElementById("submit-label");
    if (!form) return;

    // FormSubmit relays submissions to email — no backend needed on GitHub Pages.
    const ENDPOINT = "https://formsubmit.co/ajax/hiradsamadi20@gmail.com";

    function setError(input, message) {
      const field = input.closest(".field");
      field.classList.toggle("is-invalid", Boolean(message));
      field.querySelector(".field__error").textContent = message;
      return !message;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = form.elements.name;
      const email = form.elements.email;
      const message = form.elements.message;

      const checks = [
        setError(name, name.value.trim() ? "" : "Please enter your name."),
        setError(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? "" : "Enter a valid email address."),
        setError(message, message.value.trim().length >= 10 ? "" : "Message should be at least 10 characters.")
      ];

      if (!checks.every(Boolean)) {
        note.textContent = "";
        note.className = "form__note is-error";
        return;
      }

      // Bots that fill the hidden field get a silent no-op.
      if (form.elements._honey.value) return;

      button.disabled = true;
      label.textContent = "Sending…";
      note.textContent = "";
      note.className = "form__note";

      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name: name.value.trim(),
            email: email.value.trim(),
            message: message.value.trim(),
            _subject: `Portfolio message from ${name.value.trim()}`,
            _template: "table",
            _captcha: "false"
          })
        });

        if (!response.ok) throw new Error(`Request failed (${response.status})`);

        note.textContent = "Thanks! Your message is on its way — I'll get back to you soon.";
        note.className = "form__note is-success";
        form.reset();
      } catch (err) {
        console.error(err);
        note.innerHTML =
          'Something went wrong. Email me directly at <a href="mailto:hiradsamadi20@gmail.com">hiradsamadi20@gmail.com</a>.';
        note.className = "form__note is-error";
      } finally {
        button.disabled = false;
        label.textContent = "Send message";
      }
    });

    form.querySelectorAll("input, textarea").forEach((input) => {
      input.addEventListener("input", () => {
        input.closest(".field").classList.remove("is-invalid");
        input.closest(".field").querySelector(".field__error").textContent = "";
      });
    });
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  function start() {
    // Each feature is isolated so one failure can't take down the rest of the page.
    [initCanvas, initCursorGlow, initNav, initMenu, initTyping, initReveal, initTilt, initForm]
      .forEach((fn) => {
        try {
          fn();
        } catch (err) {
          console.error(fn.name + " failed:", err);
        }
      });

    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
