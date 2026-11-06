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

  var reviews = document.querySelector("[data-reviews]");
  if (reviews) {
    var viewport = reviews.querySelector(".reviews-viewport");
    var track = reviews.querySelector(".reviews-track");
    var slides = Array.prototype.slice.call(reviews.querySelectorAll(".review-card"));
    var prev = reviews.querySelector(".reviews-prev");
    var next = reviews.querySelector(".reviews-next");
    var dotsWrap = reviews.querySelector(".reviews-dots");
    var status = reviews.querySelector(".reviews-status");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var index = 0;
    var timer = null;
    var paused = false;
    var total = slides.length;
    var pointer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "reviews-dot";
      dot.setAttribute("aria-label", "Show review " + (i + 1) + " of " + total);
      dot.addEventListener("click", function () { go(i, true); });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function go(nextIndex, fromUser) {
      index = (nextIndex + total) % total;
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        slide.style.visibility = active ? "visible" : "hidden";
        if (active) slide.removeAttribute("inert");
        else slide.setAttribute("inert", "");
      });
      dots.forEach(function (dot, i) {
        if (i === index) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      if (status && fromUser) status.textContent = "Review " + (index + 1) + " of " + total;
      viewport.style.height = slides[index].offsetHeight + "px";
      if (fromUser) restart();
    }
    window.addEventListener("resize", function () {
      viewport.style.height = slides[index].offsetHeight + "px";
    });

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      if (reduceMotion || paused || timer) return;
      timer = setInterval(function () { go(index + 1, false); }, 8000);
    }

    function restart() {
      stop();
      start();
    }

    prev.addEventListener("click", function () { go(index - 1, true); });
    next.addEventListener("click", function () { go(index + 1, true); });

    reviews.addEventListener("mouseenter", function () { paused = true; stop(); });
    reviews.addEventListener("mouseleave", function () { paused = false; start(); });
    reviews.addEventListener("focusin", function () { paused = true; stop(); });
    reviews.addEventListener("focusout", function (event) {
      if (!reviews.contains(event.relatedTarget)) {
        paused = false;
        start();
      }
    });
    reviews.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(index - 1, true);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        go(index + 1, true);
      }
    });
    reviews.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (event.target.closest("a, button")) return;
      pointer = { x: event.clientX, y: event.clientY };
    });
    reviews.addEventListener("pointerup", function (event) {
      if (!pointer) return;
      var dx = event.clientX - pointer.x;
      var dy = event.clientY - pointer.y;
      pointer = null;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
      go(dx < 0 ? index + 1 : index - 1, true);
    });
    reviews.addEventListener("pointercancel", function () { pointer = null; });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    go(0, false);
    start();
  }

})();
