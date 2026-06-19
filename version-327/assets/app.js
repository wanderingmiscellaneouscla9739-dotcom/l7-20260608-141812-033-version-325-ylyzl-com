(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNav() {
    var button = qs('[data-nav-toggle]');
    var menu = qs('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-search-box]', scope);
      var region = qs('[data-filter-region]', scope);
      var type = qs('[data-filter-type]', scope);
      var cards = qsa('[data-filter-card]', scope);

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        var regionValue = normalize(region ? region.value : '');
        var typeValue = normalize(type ? type.value : '');

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var cardType = normalize(card.getAttribute('data-type'));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
          var matchesType = !typeValue || cardType.indexOf(typeValue) !== -1;
          card.classList.toggle('is-hidden', !(matchesQuery && matchesRegion && matchesType));
        });
      }

      [input, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function attachHls(video, source) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return null;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          hls.destroy();
          video.src = source;
        }
      });
      return hls;
    }

    video.src = source;
    return null;
  }

  window.setupMoviePlayer = function (videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !source) {
      return;
    }

    var frame = video.closest('.video-frame');
    var message = frame ? qs('.player-message', frame) : null;
    var attached = false;
    var hls = null;

    function prepare() {
      if (!attached) {
        hls = attachHls(video, source);
        attached = true;
      }
    }

    function hideButton() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function play() {
      prepare();
      hideButton();
      var started = video.play();
      if (started && typeof started.catch === 'function') {
        started.catch(function () {
          if (message) {
            message.textContent = '轻触播放键继续观看';
          }
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('play', hideButton);
    video.addEventListener('error', function () {
      if (message) {
        message.textContent = '暂时无法播放，请稍后再试';
      }
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    prepare();
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupNav();
    setupHero();
    setupFilters();
  });
})();
