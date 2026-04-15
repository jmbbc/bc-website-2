(function () {
  function normalizePath(pathname) {
    if (!pathname || pathname === "/") {
      return "index.html";
    }
    var parts = pathname.split("/");
    return parts[parts.length - 1] || "index.html";
  }

  function markActiveLinks() {
    var current = normalizePath(window.location.pathname);
    var navLinks = document.querySelectorAll("header nav a[href], #mobileNav a[href]");

    navLinks.forEach(function (link) {
      var href = (link.getAttribute("href") || "").trim();
      var isCurrent = href === current;
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
        link.classList.add("active");
      } else {
        link.removeAttribute("aria-current");
        link.classList.remove("active");
      }
    });
  }

  function loadNoticeItems() {
    var selection = loadAnnouncementSelection();

    try {
      var saved = localStorage.getItem("notices");
      if (!saved) {
        return [];
      }

      var parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        return [];
      }

      var source = parsed;
      if (selection !== null) {
        if (!selection.length) {
          source = [];
        } else {
          var byId = {};
          parsed.forEach(function (notice) {
            var id = String((notice && notice.id) || "").trim();
            if (id) {
              byId[id] = notice;
            }
          });

          var ordered = selection
            .map(function (id) {
              return byId[id];
            })
            .filter(Boolean);

          if (ordered.length) {
            source = ordered;
          }
        }
      }

      return source
        .map(function (notice) {
          if (!notice || typeof notice !== "object") {
            return null;
          }

          var id = String(notice.id || "").trim();
          var title = String(notice.title || "").trim();
          var summary = String(notice.summary || "").trim();
          var text = title || summary;
          if (!text) {
            return null;
          }

          return {
            id: id,
            text: text
          };
        })
        .filter(Boolean);
    } catch (_) {
      return [];
    }
  }

  function loadAnnouncementSelection() {
    try {
      var saved = localStorage.getItem("announcementNoticeIds");
      if (!saved) {
        return null;
      }
      var parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        return null;
      }
      return parsed
        .map(function (id) {
          return String(id).trim();
        })
        .filter(Boolean);
    } catch (_) {
      return null;
    }
  }

  function defaultNoticeItems() {
    return [
      { id: "", text: "Gangguan Bekalan Air Sementara" },
      { id: "", text: "Mesyuarat Agung Tahunan (AGM)" },
      { id: "", text: "Projek Keceriaan Taman" },
      { id: "", text: "Sistem Kawalan Akses Baru" },
      { id: "", text: "Program Gotong-Royong Perdana" },
      { id: "", text: "Yuran Penyelenggaraan Suku Ke-4" }
    ];
  }

  function resolveAnnouncementBar() {
    var byId = document.getElementById("announcementBar");
    if (byId) {
      return byId;
    }

    var header = document.querySelector("header.site-header");
    if (!header) {
      return null;
    }

    var candidate = header.previousElementSibling;
    if (!candidate) {
      return null;
    }

    var text = String(candidate.textContent || "").toLowerCase();
    if (text.indexOf("notis") === -1 && text.indexOf("notice") === -1) {
      return null;
    }

    candidate.id = "announcementBar";
    return candidate;
  }

  function ensureAnnouncementTickerStructure(bar) {
    if (!bar) {
      return null;
    }

    ["bg-primary/5", "py-2", "px-4", "border-b", "border-primary/10"].forEach(function (cls) {
      bar.classList.add(cls);
    });

    var existingTicker = bar.querySelector("#announcementTicker");
    if (existingTicker) {
      var existingRow = existingTicker.parentElement && existingTicker.parentElement.parentElement;
      if (existingRow) {
        existingRow.classList.add("announcement-row");
      }
      return existingTicker;
    }

    bar.innerHTML = "";

    var row = document.createElement("div");
    row.className = "announcement-row max-w-7xl mx-auto flex items-center gap-2 text-primary";

    var icon = document.createElement("span");
    icon.className = "material-symbols-outlined text-sm shrink-0";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "campaign";

    var marquee = document.createElement("div");
    marquee.className = "announcement-marquee text-xs md:text-sm font-medium";
    marquee.setAttribute("aria-live", "polite");
    marquee.setAttribute("aria-label", "Notis semasa");

    var track = document.createElement("div");
    track.id = "announcementTicker";
    track.className = "announcement-marquee-track";
    track.setAttribute("data-fallback", "Notis: Penjagaan taman tahunan dijalankan hujung minggu ini.");

    marquee.appendChild(track);
    row.appendChild(icon);
    row.appendChild(marquee);
    bar.appendChild(row);

    return track;
  }

  function ensureAnnouncementPauseControl(bar) {
    if (!bar) {
      return null;
    }

    var row = bar.querySelector(".announcement-row");
    if (!row) {
      return null;
    }

    var existing = bar.querySelector("#announcementPauseBtn");
    if (existing) {
      return existing;
    }

    var button = document.createElement("button");
    button.type = "button";
    button.id = "announcementPauseBtn";
    button.className = "announcement-pause-btn shrink-0 rounded-full border border-primary/20 px-2.5 py-1 text-[11px] md:text-xs font-bold";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Jeda ticker notis");
    button.textContent = "Jeda";
    row.appendChild(button);

    return button;
  }

  function setupAnnouncementTickerControls(bar, ticker, disableControls) {
    var pauseButton = ensureAnnouncementPauseControl(bar);
    if (!pauseButton || !ticker) {
      return;
    }

    if (disableControls) {
      pauseButton.classList.add("hidden");
      return;
    }

    var manualPause = false;
    var touchResumeTimer = null;

    function updatePauseUI(isPaused) {
      ticker.classList.toggle("is-paused", isPaused);
      pauseButton.setAttribute("aria-pressed", isPaused ? "true" : "false");
      pauseButton.setAttribute("aria-label", isPaused ? "Sambung ticker notis" : "Jeda ticker notis");
      pauseButton.textContent = isPaused ? "Sambung" : "Jeda";
    }

    updatePauseUI(false);

    pauseButton.addEventListener("click", function () {
      manualPause = !manualPause;
      if (touchResumeTimer) {
        window.clearTimeout(touchResumeTimer);
        touchResumeTimer = null;
      }
      updatePauseUI(manualPause);
    });

    bar.addEventListener("pointerdown", function (event) {
      if (event.pointerType !== "touch" || manualPause) {
        return;
      }
      updatePauseUI(true);
    });

    bar.addEventListener("pointerup", function (event) {
      if (event.pointerType !== "touch" || manualPause) {
        return;
      }

      if (touchResumeTimer) {
        window.clearTimeout(touchResumeTimer);
      }

      touchResumeTimer = window.setTimeout(function () {
        if (!manualPause) {
          updatePauseUI(false);
        }
      }, 1600);
    });
  }

  function stickAnnouncementWithHeader(bar) {
    var header = document.querySelector("header.site-header");
    if (!bar || !header) {
      return;
    }

    var existingWrapper = header.parentElement;
    if (existingWrapper && existingWrapper.classList.contains("site-header-stack")) {
      return;
    }

    var parent = header.parentElement;
    if (!parent || bar.parentElement !== parent) {
      return;
    }

    var wrapper = document.createElement("div");
    wrapper.className = "site-header-stack sticky top-0 z-50";

    parent.insertBefore(wrapper, bar);
    wrapper.appendChild(bar);
    wrapper.appendChild(header);

    header.classList.remove("sticky", "top-0", "z-50");
  }

  function setupAnnouncementTicker() {
    var bar = resolveAnnouncementBar();
    if (!bar) {
      return;
    }

    stickAnnouncementWithHeader(bar);

    var ticker = ensureAnnouncementTickerStructure(bar);
    if (!ticker) {
      return;
    }

    var fallback = String(ticker.getAttribute("data-fallback") || "").trim();
    var selection = loadAnnouncementSelection();
    var notices = loadNoticeItems();
    var seen = {};
    var uniqueItems = notices.filter(function (item) {
      var key = (item && item.id ? "id:" + item.id : "text:" + String(item && item.text || "")).trim();
      if (!key || seen[key]) {
        return false;
      }
      seen[key] = true;
      return true;
    });

    if (!uniqueItems.length && selection !== null && !selection.length) {
      uniqueItems = [{ id: "", text: "Tiada notis dipilih untuk announcement bar." }];
    }

    if (!uniqueItems.length) {
      uniqueItems = defaultNoticeItems();
    }

    if (!uniqueItems.length && fallback) {
      uniqueItems = [{ id: "", text: fallback }];
    }

    if (!uniqueItems.length) {
      return;
    }

    ticker.textContent = "";

    function appendSequence(hidden) {
      uniqueItems.forEach(function (item) {
        var node = document.createElement("a");
        node.className = "announcement-item";

        var targetUrl = item.id
          ? "halaman_notis_kediaman.html?notice=" + encodeURIComponent(item.id)
          : "halaman_notis_kediaman.html";
        node.href = targetUrl;
        node.textContent = "Notis: " + String(item.text || "") + "  •  ";

        if (hidden) {
          node.setAttribute("aria-hidden", "true");
          node.tabIndex = -1;
        }

        ticker.appendChild(node);
      });
    }

    appendSequence(false);
    appendSequence(true);

    var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ticker.style.animation = "none";
      setupAnnouncementTickerControls(bar, ticker, true);
      return;
    }

    var sequenceWidth = ticker.scrollWidth / 2;
    if (!sequenceWidth || sequenceWidth <= 0) {
      return;
    }

    var duration = Math.max(18, Math.round(sequenceWidth / 75));
    ticker.style.animationDuration = duration + "s";
    setupAnnouncementTickerControls(bar, ticker, prefersReducedMotion);
  }

  function setupMobileMenu() {
    var mobileMenuBtn = document.getElementById("mobileMenuBtn");
    var mobileNav = document.getElementById("mobileNav");

    if (!mobileMenuBtn || !mobileNav) {
      var header = document.querySelector("header");
      var desktopNav = header ? header.querySelector("nav.hidden.lg\\:flex") : null;
      var fallbackBtn = header ? header.querySelector("button.lg\\:hidden") : null;

      if (desktopNav && fallbackBtn) {
        if (!fallbackBtn.id) {
          fallbackBtn.id = "mobileMenuBtn";
        }

        var generatedNav = document.createElement("div");
        generatedNav.id = "mobileNav";
        generatedNav.className = "lg:hidden hidden bg-white border-b border-stone-200 shadow-sm";

        var navInner = document.createElement("div");
        navInner.className = "max-w-7xl mx-auto px-6 py-3 flex flex-col gap-3 text-sm font-semibold text-[#2C3333]";

        desktopNav.querySelectorAll("a[href]").forEach(function (link) {
          var clone = document.createElement("a");
          clone.href = link.getAttribute("href") || "#";
          clone.textContent = (link.textContent || "").trim();
          clone.className = "hover:text-primary";
          navInner.appendChild(clone);
        });

        generatedNav.appendChild(navInner);
        header.insertAdjacentElement("afterend", generatedNav);

        mobileMenuBtn = document.getElementById("mobileMenuBtn");
        mobileNav = document.getElementById("mobileNav");
      }
    }

    if (!mobileMenuBtn || !mobileNav) {
      return;
    }

    function setExpanded(expanded) {
      mobileMenuBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      mobileNav.classList.toggle("hidden", !expanded);
    }

    function isExpanded() {
      return !mobileNav.classList.contains("hidden");
    }

    mobileMenuBtn.setAttribute("aria-controls", "mobileNav");
    if (!mobileMenuBtn.hasAttribute("aria-label")) {
      mobileMenuBtn.setAttribute("aria-label", "Toggle menu");
    }
    if (!mobileMenuBtn.hasAttribute("aria-expanded")) {
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    }

    mobileMenuBtn.addEventListener("click", function () {
      setExpanded(!isExpanded());
    });

    document.addEventListener("click", function (event) {
      if (!isExpanded()) {
        return;
      }

      var clickInsideNav = mobileNav.contains(event.target);
      var clickOnToggle = mobileMenuBtn.contains(event.target);
      if (!clickInsideNav && !clickOnToggle) {
        setExpanded(false);
      }
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setExpanded(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isExpanded()) {
        setExpanded(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024 && isExpanded()) {
        setExpanded(false);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupAnnouncementTicker();
    setupMobileMenu();
    markActiveLinks();
  });
})();
