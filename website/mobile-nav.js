(function () {
  const navs = document.querySelectorAll(".mobile-bottom-nav");

  navs.forEach((nav) => {
    if (nav.dataset.enhanced === "true") {
      return;
    }

    nav.dataset.enhanced = "true";
    nav.setAttribute("data-expanded", "false");

    const links = Array.from(nav.querySelectorAll("a"));
    const linksWrapper = document.createElement("div");
    linksWrapper.className = "mobile-bottom-nav-links";

    links.forEach((link) => linksWrapper.appendChild(link));

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "mobile-bottom-nav-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    toggle.innerHTML =
      '<span class="mobile-bottom-nav-toggle-chip"><span class="mobile-bottom-nav-toggle-icon" aria-hidden="true"><span></span><span></span><span></span></span><span class="mobile-bottom-nav-toggle-text"><strong>Menu</strong><small>Open sections</small></span></span><span class="mobile-bottom-nav-toggle-arrow" aria-hidden="true"></span>';

    toggle.addEventListener("click", () => {
      const expanded = nav.getAttribute("data-expanded") === "true";
      nav.setAttribute("data-expanded", expanded ? "false" : "true");
      toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
      toggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
      const detail = toggle.querySelector("small");

      if (detail) {
        detail.textContent = expanded ? "Open sections" : "Close sections";
      }
    });

    nav.innerHTML = "";
    nav.appendChild(toggle);
    nav.appendChild(linksWrapper);
  });
})();
