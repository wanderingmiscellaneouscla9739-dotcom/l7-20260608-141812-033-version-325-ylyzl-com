
(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === currentSlide);
        });

        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var filterForm = document.querySelector('[data-filter-form]');

    if (filterForm) {
        var input = filterForm.querySelector('[data-filter-input]');
        var typeSelect = filterForm.querySelector('[data-filter-type]');
        var regionSelect = filterForm.querySelector('[data-filter-region]');
        var yearSelect = filterForm.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (input && query) {
            input.value = query;
        }

        function filterCards() {
            var text = input ? input.value.trim().toLowerCase() : '';
            var type = typeSelect ? typeSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var search = card.getAttribute('data-search') || '';
                var cardType = card.getAttribute('data-type') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var ok = true;

                if (text && search.indexOf(text) === -1) {
                    ok = false;
                }

                if (type && cardType !== type) {
                    ok = false;
                }

                if (region && cardRegion !== region) {
                    ok = false;
                }

                if (year && cardYear !== year) {
                    ok = false;
                }

                card.style.display = ok ? '' : 'none';
            });
        }

        [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filterCards);
                control.addEventListener('change', filterCards);
            }
        });

        filterCards();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var layer = player.querySelector('.play-layer');
        var started = false;

        function begin() {
            if (!video || started) {
                return;
            }

            started = true;
            player.classList.add('is-playing');
            video.setAttribute('controls', 'controls');

            var url = video.getAttribute('data-hls');

            if (!url) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = url;
            video.play().catch(function () {});
        }

        if (layer) {
            layer.addEventListener('click', begin);
        }

        player.addEventListener('click', function (event) {
            if (!started && event.target !== video) {
                begin();
            }
        });
    });
}());
