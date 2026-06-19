function setupNavigation() {
  const button = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.mobile-nav');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', function() {
    const isOpen = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
}

function setupHero() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let activeIndex = 0;
  let timer = null;

  function activate(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function() {
      activate(activeIndex + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
  }

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      const index = Number(dot.getAttribute('data-hero-dot'));
      activate(index);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

function setupFilters() {
  const panels = Array.from(document.querySelectorAll('.filter-panel'));

  panels.forEach(function(panel) {
    const container = panel.parentElement;
    const search = panel.querySelector('.site-search');
    const year = panel.querySelector('.year-filter');
    const region = panel.querySelector('.region-filter');
    const area = container ? container.querySelector('.searchable-area') : null;
    const empty = container ? container.querySelector('.empty-state') : null;

    if (!area) {
      if (search) {
        search.addEventListener('keydown', function(event) {
          if (event.key === 'Enter') {
            const keyword = search.value.trim();
            if (keyword) {
              window.location.href = './movies.html?kw=' + encodeURIComponent(keyword);
            }
          }
        });
      }
      return;
    }

    const cards = Array.from(area.querySelectorAll('.movie-card'));
    const params = new URLSearchParams(window.location.search);
    const initialKeyword = params.get('kw') || params.get('q') || '';

    if (search && initialKeyword) {
      search.value = initialKeyword;
    }

    function matchesYear(card, value) {
      if (!value) {
        return true;
      }

      const cardYear = Number(card.getAttribute('data-year') || 0);

      if (value === 'older') {
        return cardYear > 0 && cardYear < 2020;
      }

      return String(cardYear) === value;
    }

    function apply() {
      const query = search ? search.value.trim().toLowerCase() : '';
      const yearValue = year ? year.value : '';
      const regionValue = region ? region.value : '';
      let visible = 0;

      cards.forEach(function(card) {
        const text = card.getAttribute('data-search') || '';
        const regionText = card.getAttribute('data-region') || '';
        const ok = (!query || text.includes(query)) && matchesYear(card, yearValue) && (!regionValue || regionText.includes(regionValue));
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (search) {
      search.addEventListener('input', apply);
    }

    if (year) {
      year.addEventListener('change', apply);
    }

    if (region) {
      region.addEventListener('change', apply);
    }
  });
}

setupNavigation();
setupHero();
setupFilters();
