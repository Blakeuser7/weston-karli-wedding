(() => {
  "use strict";

  const config = window.WEDDING_CONFIG || {};

  const setText = (selector, value) => {
    if (value === undefined || value === null) return;
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  };

  const setLink = (selector, href) => {
    const isConfigured =
      typeof href === "string" &&
      href.trim() !== "" &&
      href !== "#" &&
      !href.includes("PASTE_");

    document.querySelectorAll(selector).forEach((element) => {
      if (isConfigured) {
        element.href = href;
        element.removeAttribute("aria-disabled");
      } else {
        element.href = "#";
        element.setAttribute("aria-disabled", "true");
        element.addEventListener("click", (event) => event.preventDefault());
      }
    });
  };

  function populateConfig() {
    const couple = config.couple || {};
    const wedding = config.wedding || {};
    const rsvp = config.rsvp || {};
    const travel = config.travel || {};
    const registry = config.registry || {};
    const faq = config.faq || {};

    setText("[data-couple-first]", couple.firstName);
    setText("[data-couple-second]", couple.secondName);
    setText("[data-wedding-date-display]", wedding.dateDisplay);
    setText("[data-wedding-city]", wedding.city);
    setText("[data-ceremony-time]", wedding.ceremonyTime);
    setText("[data-cocktail-time]", wedding.cocktailTime);
    setText("[data-reception-time]", wedding.receptionTime);
    setText("[data-venue-name]", wedding.venueName);
    setText("[data-venue-location]", wedding.venueLocation);
    setText("[data-rsvp-deadline-display]", rsvp.deadlineDisplay);
    setLink("[data-rsvp-link]", rsvp.formUrl);

    setText("[data-hotel-name]", travel.hotelName);
    setText("[data-parking-info]", travel.parkingInfo);
    setText("[data-airport-info]", travel.airportInfo);
    setText("[data-dress-code]", faq.dressCode);
    setText("[data-children-policy]", faq.childrenPolicy);

    setLink("[data-map-link]", wedding.mapUrl);
    setLink("[data-hotel-link]", travel.hotelUrl);
    setLink("[data-registry-one]", registry.registryOneUrl);
    setLink("[data-registry-two]", registry.registryTwoUrl);

    document.querySelectorAll("[data-contact-email]").forEach((element) => {
      element.textContent = faq.contactEmail || "wedding@example.com";
      element.href = `mailto:${faq.contactEmail || "wedding@example.com"}`;
    });

    if (!config.setupMode) {
      document.body.classList.add("site-ready");
    }
  }

  function setupMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const navigation = document.querySelector(".primary-navigation");
    if (!toggle || !navigation) return;

    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    };

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      navigation.classList.toggle("is-open", !open);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1080) closeMenu();
    });
  }

  function setupHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const update = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function setupCountdown() {
    const dateString = config?.wedding?.dateTime;
    if (!dateString) return;

    const target = new Date(dateString).getTime();
    if (Number.isNaN(target)) return;

    const days = document.querySelector("[data-countdown-days]");
    const hours = document.querySelector("[data-countdown-hours]");
    const minutes = document.querySelector("[data-countdown-minutes]");
    const seconds = document.querySelector("[data-countdown-seconds]");
    if (!days || !hours || !minutes || !seconds) return;

    const pad = (value, length = 2) => String(value).padStart(length, "0");

    const update = () => {
      const distance = target - Date.now();

      if (distance <= 0) {
        days.textContent = "000";
        hours.textContent = "00";
        minutes.textContent = "00";
        seconds.textContent = "00";
        return;
      }

      days.textContent = pad(Math.floor(distance / 86_400_000), 3);
      hours.textContent = pad(Math.floor((distance % 86_400_000) / 3_600_000));
      minutes.textContent = pad(Math.floor((distance % 3_600_000) / 60_000));
      seconds.textContent = pad(Math.floor((distance % 60_000) / 1_000));
    };

    update();
    window.setInterval(update, 1000);
  }

  function setupReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            instance.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );

    items.forEach((item) => observer.observe(item));
  }

  document.addEventListener("DOMContentLoaded", () => {
    populateConfig();
    setupMenu();
    setupHeader();
    setupCountdown();
    setupReveal();
  });
})();
