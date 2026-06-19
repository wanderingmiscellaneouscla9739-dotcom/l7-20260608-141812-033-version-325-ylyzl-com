(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupMobileNavigation();
        setupHeroCarousel();
        setupLocalFilters();
    });

    function setupMobileNavigation() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');

        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');

        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var previous = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var currentIndex = 0;
        var timer = null;

        function show(index) {
            currentIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === currentIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === currentIndex);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(currentIndex + 1);
            }, 6000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(currentIndex - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(currentIndex + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);

        show(0);
        start();
    }

    function setupLocalFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var yearFilter = scope.querySelector('[data-year-filter]');
            var typeFilter = scope.querySelector('[data-type-filter]');
            var count = scope.querySelector('[data-filter-count]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .horizontal-card'));

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function applyFilter() {
                var keyword = normalize(input && input.value);
                var year = normalize(yearFilter && yearFilter.value);
                var type = normalize(typeFilter && typeFilter.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var matched = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }

                    if (year && cardYear !== year) {
                        matched = false;
                    }

                    if (type && cardType !== type) {
                        matched = false;
                    }

                    card.classList.toggle('is-filter-hidden', !matched);

                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '显示 ' + visible + ' 部影片';
                }
            }

            [input, yearFilter, typeFilter].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilter);
                    control.addEventListener('change', applyFilter);
                }
            });
        });
    }
})();
