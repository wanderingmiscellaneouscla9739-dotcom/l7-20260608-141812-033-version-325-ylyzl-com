(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = './search.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
        showHero(index);
      });
    });

    window.setInterval(function () {
      showHero(current + 1);
    }, 5200);
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterForm && filterList) {
    var cards = Array.prototype.slice.call(filterList.children);
    var searchParams = new URLSearchParams(window.location.search);
    var initialQuery = searchParams.get('q') || '';
    var input = filterForm.querySelector('input[name="q"]');
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(input ? input.value : '');
      var yearSelect = filterForm.querySelector('select[name="year"]');
      var categorySelect = filterForm.querySelector('select[name="category"]');
      var year = yearSelect ? normalize(yearSelect.value) : '';
      var category = categorySelect ? normalize(categorySelect.value) : '';

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' '));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (year && cardYear.indexOf(year) === -1) {
          matched = false;
        }
        if (category && cardCategory !== category) {
          matched = false;
        }

        card.classList.toggle('is-filter-hidden', !matched);
      });
    }

    filterForm.addEventListener('input', applyFilters);
    filterForm.addEventListener('change', applyFilters);
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilters();
    });
    applyFilters();
  }
})();
