(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav-links]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length > 1) {
      var active = 0;
      var show = function (index) {
        active = index % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");
    if (input && cards.length) {
      var filter = function () {
        var q = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var match = !q || haystack.indexOf(q) !== -1;
          card.classList.toggle("hidden-card", !match);
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      input.addEventListener("input", filter);
      filter();
    }
  });
})();

function initMoviePlayer(source) {
  var bind = function () {
    var video = document.querySelector(".player-video");
    var cover = document.querySelector(".player-cover");
    var button = document.querySelector(".play-button");
    if (!video) {
      return;
    }

    var connected = false;
    var connect = function () {
      if (connected) {
        return;
      }
      connected = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    var start = function () {
      connect();
      video.controls = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    };

    if (button) {
      button.addEventListener("click", start);
    }
    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };

  if (document.readyState !== "loading") {
    bind();
  } else {
    document.addEventListener("DOMContentLoaded", bind);
  }
}
