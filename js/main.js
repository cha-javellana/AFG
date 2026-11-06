(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    img.addEventListener("error", function onErr() {
      img.removeEventListener("error", onErr);
      var fb = img.getAttribute("data-fallback");
      if (!fb) {
        fb = (img.getAttribute("src") || "").indexOf("../") === 0
          ? "../images/placeholder.svg"
          : "images/placeholder.svg";
      }
      img.src = fb;
    });
  });

  var jumps = document.querySelectorAll(".jump-bar a");
  var sections = [];
  jumps.forEach(function (a) {
    var id = a.getAttribute("href");
    if (id && id.charAt(0) === "#") {
      var el = document.querySelector(id);
      if (el) sections.push({ link: a, el: el });
    }
  });
  if (sections.length) {
    var onScroll = function () {
      var y = window.scrollY + 140;
      var current = sections[0];
      sections.forEach(function (s) {
        if (s.el.offsetTop <= y) current = s;
      });
      jumps.forEach(function (a) { a.classList.remove("is-active"); });
      if (current) current.link.classList.add("is-active");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

})();
