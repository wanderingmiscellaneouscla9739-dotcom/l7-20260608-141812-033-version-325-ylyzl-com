(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function hideMissingImages() {
    $all('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.opacity = '0';
      }, { once: true });
    });
  }

  function setupMenu() {
    var toggle = $('[data-menu-toggle]');
    var menu = $('[data-mobile-menu]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      menu.hidden = !menu.hidden;
    });
  }

  function setupHero() {
    var root = $('[data-hero]');
    if (!root) return;
    var slides = $all('[data-hero-slide]', root);
    var dots = $all('[data-hero-dot]', root);
    if (!slides.length) return;
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    var prev = $('[data-hero-prev]', root);
    var next = $('[data-hero-next]', root);
    if (prev) prev.addEventListener('click', function () { show(current - 1); play(); });
    if (next) next.addEventListener('click', function () { show(current + 1); play(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); play(); });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function createSearchItem(item) {
    var a = document.createElement('a');
    a.className = 'search-item';
    a.href = './' + item.url;
    var tags = Array.isArray(item.tags) ? item.tags.slice(0, 3).join(' · ') : '';
    a.innerHTML = '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
      '<span><strong>' + escapeHtml(item.title) + '</strong><span>' +
      escapeHtml([item.year, item.region, item.genre, tags].filter(Boolean).join(' · ')) +
      '</span></span>';
    return a;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function searchItems(query, limit) {
    var q = String(query || '').trim().toLowerCase();
    var index = window.searchIndex || [];
    if (!q) return index.slice(0, limit || 8);
    var terms = q.split(/\s+/).filter(Boolean);
    return index.filter(function (item) {
      var hay = [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(' ')].join(' ').toLowerCase();
      return terms.every(function (term) { return hay.indexOf(term) !== -1; });
    }).slice(0, limit || 8);
  }

  function setupHeaderSearch() {
    $all('[data-search-box]').forEach(function (form) {
      var input = $('[data-site-search]', form);
      var panel = $('[data-search-results]', form);
      if (!input || !panel) return;

      function render() {
        var results = searchItems(input.value, 8);
        panel.innerHTML = '';
        if (!input.value.trim()) {
          panel.hidden = true;
          return;
        }
        if (!results.length) {
          var empty = document.createElement('div');
          empty.className = 'search-empty';
          empty.textContent = '暂无匹配影片';
          panel.appendChild(empty);
        } else {
          results.forEach(function (item) { panel.appendChild(createSearchItem(item)); });
        }
        panel.hidden = false;
      }

      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      document.addEventListener('click', function (event) {
        if (!form.contains(event.target)) panel.hidden = true;
      });
    });
  }

  function setupLocalFilter() {
    var input = $('[data-local-search]');
    var cards = $all('[data-card]');
    if (!cards.length) return;
    var activeChip = '';

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var hay = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();
        var okText = !q || hay.indexOf(q) !== -1;
        var okChip = !activeChip || hay.indexOf(activeChip.toLowerCase()) !== -1;
        card.hidden = !(okText && okChip);
      });
    }

    if (input) input.addEventListener('input', apply);
    $all('[data-filter-chip]').forEach(function (button) {
      button.addEventListener('click', function () {
        $all('[data-filter-chip]').forEach(function (b) { b.classList.remove('is-active'); });
        button.classList.add('is-active');
        activeChip = button.getAttribute('data-filter-chip') || '';
        apply();
      });
    });
    var sortButton = $('[data-sort-year]');
    if (sortButton) {
      sortButton.addEventListener('click', function () {
        var grids = $all('.movie-grid, .wide-rank-list');
        grids.forEach(function (grid) {
          var items = $all('[data-card]', grid).sort(function (a, b) {
            return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
          });
          items.forEach(function (item) { grid.appendChild(item); });
        });
      });
    }
  }

  function setupSearchPage() {
    var form = $('[data-page-search]');
    var resultsRoot = $('[data-page-search-results]');
    if (!form || !resultsRoot) return;
    var input = $('input[name="q"]', form);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (input) input.value = q;

    function render(query) {
      var items = searchItems(query, query ? 120 : 24);
      resultsRoot.innerHTML = '';
      if (!items.length) {
        var empty = document.createElement('div');
        empty.className = 'text-card';
        empty.innerHTML = '<h2>暂无匹配结果</h2><p>可以尝试更换影片名、年份、地区或题材关键词。</p>';
        resultsRoot.appendChild(empty);
        return;
      }
      items.forEach(function (item) {
        var article = document.createElement('article');
        article.className = 'movie-card';
        article.setAttribute('data-card', '');
        article.setAttribute('data-title', item.title);
        article.setAttribute('data-year', item.year);
        article.setAttribute('data-region', item.region);
        article.setAttribute('data-genre', item.genre);
        article.innerHTML = '<a href="./' + item.url + '" class="movie-poster" aria-label="观看 ' + escapeHtml(item.title) + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="play-chip">播放</span></a>' +
          '<div class="movie-body"><div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
          '<h3><a href="./' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p>' + escapeHtml(item.genre) + '</p><div class="tag-row">' + (item.tags || []).slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div></div>';
        resultsRoot.appendChild(article);
      });
      hideMissingImages();
    }

    render(q);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input ? input.value.trim() : '';
      var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState(null, '', url);
      render(query);
    });
  }

  function setupPlayers() {
    $all('[data-player]').forEach(function (player) {
      var video = $('video', player);
      var start = $('[data-player-start]', player);
      var message = $('[data-player-message]', player);
      if (!video || !start) return;
      var source = video.getAttribute('data-video-src') || '';
      var hlsInstance = null;
      var loading = false;

      function showMessage(text) {
        if (!message) return;
        message.textContent = text;
        message.hidden = !text;
      }

      function attachSource() {
        if (!source || loading || video.getAttribute('src')) return Promise.resolve();
        loading = true;
        showMessage('');
        return new Promise(function (resolve, reject) {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              loading = false;
              resolve();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                loading = false;
                reject(new Error('播放暂时不可用，请稍后重试'));
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
              loading = false;
              resolve();
            }, { once: true });
            video.addEventListener('error', function () {
              loading = false;
              reject(new Error('播放暂时不可用，请稍后重试'));
            }, { once: true });
          } else {
            loading = false;
            reject(new Error('播放暂时不可用，请稍后重试'));
          }
        });
      }

      function play() {
        attachSource().then(function () {
          return video.play();
        }).then(function () {
          start.hidden = true;
          showMessage('');
        }).catch(function (error) {
          showMessage(error && error.message ? error.message : '播放暂时不可用，请稍后重试');
        });
      }

      start.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) play();
      });
      video.addEventListener('play', function () {
        start.hidden = true;
      });
      video.addEventListener('pause', function () {
        if (!video.ended) start.hidden = false;
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) hlsInstance.destroy();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    hideMissingImages();
    setupMenu();
    setupHero();
    setupHeaderSearch();
    setupLocalFilter();
    setupSearchPage();
    setupPlayers();
  });
})();
