(function () {
  const navs = document.querySelectorAll(".mobile-bottom-nav");
  const transitionDurationMs = 180;
  const iconMap = {
    Main: "\u25CC",
    Home: "\u25CC",
    Prayer: "\u25D3",
    Quran: "\u06DE",
    Qibla: "\u2302",
    Tasbeeh: "\u25CE",
    Account: "\u25CD",
    Dua: "\u2726",
    Help: "?",
    Contact: "\u2709",
  };

  function navigateWithTransition(href) {
    if (!href || href.startsWith("#")) {
      window.location.href = href;
      return;
    }

    document.body.classList.add("page-is-transitioning");
    window.setTimeout(() => {
      window.location.href = href;
    }, transitionDurationMs);
  }

  navs.forEach((nav) => {
    if (nav.dataset.enhanced === "true") return;

    nav.dataset.enhanced = "true";
    nav.classList.add("mobile-bottom-nav-persistent");

    const main = nav.closest("main");
    if (main && main.firstElementChild !== nav) {
      main.insertBefore(nav, main.firstElementChild || null);
    }

    const existingWrapper = nav.querySelector(".mobile-bottom-nav-links");
    const links = Array.from(nav.querySelectorAll("a"));
    let linksWrapper = existingWrapper;

    if (!linksWrapper) {
      linksWrapper = document.createElement("div");
      linksWrapper.className = "mobile-bottom-nav-links";
      links.forEach((link) => {
        linksWrapper.appendChild(link);
      });
      nav.appendChild(linksWrapper);
    }

    const currentLink = links.find((link) => link.getAttribute("aria-current") === "page");
    if (currentLink) {
      nav.setAttribute("data-current", currentLink.textContent?.trim() || "Main");
    }

    links.forEach((link) => {
      const label = link.textContent?.trim() || "";
      const icon = iconMap[label] || "\u2022";
      link.innerHTML = `<span class="mobile-bottom-nav-link-icon" aria-hidden="true">${icon}</span><span class="mobile-bottom-nav-link-label">${label}</span>`;
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("#")) return;
        event.preventDefault();
        navigateWithTransition(href);
      });
    });
  });
})();
