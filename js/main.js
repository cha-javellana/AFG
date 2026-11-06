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
    var dots = [];

    function perView() {
      var width = viewport.clientWidth;
      if (width < 701) return 1;
      if (width < 960) return 2;
      return 3;
    }

    function maxIndex() {
      return Math.max(0, total - perView());
    }

    function pageStarts() {
      var step = perView();
      var max = maxIndex();
      var starts = [];
      for (var i = 0; i < max; i += step) starts.push(i);
      if (!starts.length || starts[starts.length - 1] !== max) starts.push(max);
      return starts;
    }

    function rebuildDots() {
      var starts = pageStarts();
      var view = perView();
      dotsWrap.innerHTML = "";
      starts.forEach(function (start) {
        var end = Math.min(total, start + view);
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "reviews-dot";
        dot.setAttribute("aria-label", "Show reviews " + (start + 1) + " to " + end + " of " + total);
        dot.addEventListener("click", function () { go(start, true); });
        dotsWrap.appendChild(dot);
      });
      dots = Array.prototype.slice.call(dotsWrap.children);
    }

    function go(target, fromUser) {
      var view = perView();
      var max = maxIndex();
      if (target > max) target = 0;
      if (target < 0) target = max;
      index = target;
      track.style.setProperty("--reviews-per", String(view));
      var card = slides[0].getBoundingClientRect().width;
      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      track.style.transform = "translateX(" + (-index * (card + gap)) + "px)";
      var end = Math.min(total, index + view);
      slides.forEach(function (slide, i) {
        var active = i >= index && i < end;
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        if (active) slide.removeAttribute("inert");
        else slide.setAttribute("inert", "");
      });
      var starts = pageStarts();
      dots.forEach(function (dot, i) {
        if (starts[i] === index) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      if (status && fromUser) {
        status.textContent = "Showing reviews " + (index + 1) + " to " + end + " of " + total;
      }
      if (fromUser) restart();
    }

    function advance(direction, fromUser) {
      var view = perView();
      var max = maxIndex();
      if (direction > 0) {
        if (index >= max) go(0, fromUser);
        else go(Math.min(index + view, max), fromUser);
      } else if (index <= 0) {
        go(max, fromUser);
      } else {
        go(Math.max(index - view, 0), fromUser);
      }
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      if (reduceMotion || paused || timer) return;
      timer = setInterval(function () { advance(1, false); }, 8000);
    }

    function restart() {
      stop();
      start();
    }

    function relayout() {
      var starts = pageStarts();
      var snapped = 0;
      starts.forEach(function (start) {
        if (start <= index) snapped = start;
      });
      rebuildDots();
      go(snapped, false);
    }

    prev.addEventListener("click", function () { advance(-1, true); });
    next.addEventListener("click", function () { advance(1, true); });

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
        advance(-1, true);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        advance(1, true);
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
      advance(dx < 0 ? 1 : -1, true);
    });
    reviews.addEventListener("pointercancel", function () { pointer = null; });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
    window.addEventListener("resize", relayout);

    relayout();
    start();
  }

})();
