(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var controls = Array.prototype.slice.call(document.querySelectorAll('[data-hero-target]'));
    var activeHero = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        activeHero = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeHero);
        });
        controls.forEach(function (button, buttonIndex) {
            button.classList.toggle('is-active', buttonIndex === activeHero);
        });
    }

    controls.forEach(function (button) {
        button.addEventListener('click', function () {
            showHero(parseInt(button.getAttribute('data-hero-target'), 10) || 0);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showHero(activeHero + 1);
        }, 5200);
    }

    var searchInput = document.getElementById('movie-search');
    var yearFilter = document.getElementById('year-filter');
    var regionFilter = document.getElementById('region-filter');
    var typeFilter = document.getElementById('type-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function matchCard(card) {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var region = regionFilter ? regionFilter.value : '';
        var type = typeFilter ? typeFilter.value : '';
        var haystack = (card.textContent || '').toLowerCase();
        var sameQuery = !query || haystack.indexOf(query) !== -1;
        var sameYear = !year || card.getAttribute('data-year') === year;
        var sameRegion = !region || card.getAttribute('data-region') === region;
        var sameType = !type || card.getAttribute('data-type') === type;
        return sameQuery && sameYear && sameRegion && sameType;
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        cards.forEach(function (card) {
            card.classList.toggle('hidden', !matchCard(card));
        });
    }

    [searchInput, yearFilter, regionFilter, typeFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    window.startInlineMovie = function (videoId, coverId, streamUrl) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var loaded = false;
        var hlsInstance = null;

        function loadStream() {
            if (!video || !streamUrl) {
                return;
            }

            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                video.controls = true;
                loaded = true;
            }

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', loadStream);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    loadStream();
                }
            });
        }
    };
})();
