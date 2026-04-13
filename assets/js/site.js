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
    markActiveLinks();
    setupMobileMenu();
  });
})();
