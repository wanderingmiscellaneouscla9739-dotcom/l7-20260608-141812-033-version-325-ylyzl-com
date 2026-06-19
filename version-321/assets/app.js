(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMobileNav() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero-slider]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length === 0) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function initFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function (form) {
            var keyword = form.querySelector("[data-filter-keyword]");
            var year = form.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-item"));
            function apply() {
                var key = keyword ? keyword.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre")
                    ].join(" ").toLowerCase();
                    var yearMatch = !yearValue || card.getAttribute("data-year") === yearValue;
                    var keyMatch = !key || text.indexOf(key) !== -1;
                    card.style.display = yearMatch && keyMatch ? "" : "none";
                });
            }
            if (keyword) {
                keyword.addEventListener("input", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });
        });
    }

    function initSearchPage() {
        var root = document.querySelector("[data-search-results]");
        if (!root || !window.SITE_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim().toLowerCase();
        var source = window.SITE_MOVIES;
        var results = query ? source.filter(function (movie) {
            return [movie.title, movie.year, movie.region, movie.genre, movie.tags, movie.summary].join(" ").toLowerCase().indexOf(query) !== -1;
        }) : source.slice(0, 48);
        root.innerHTML = results.slice(0, 96).map(function (movie) {
            return "<article class=\"movie-card movie-item\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\">" +
                "<a class=\"poster\" href=\"" + escapeHtml(movie.url) + "\">" +
                "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                "<span class=\"poster-shade\"></span><span class=\"thumb-play\">▶</span></a>" +
                "<div class=\"card-body\"><a class=\"card-category\" href=\"" + escapeHtml(movie.categoryUrl) + "\">" + escapeHtml(movie.category) + "</a>" +
                "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
                "</div></article>";
        }).join("");
        var label = document.querySelector("[data-search-label]");
        if (label) {
            label.textContent = query ? "关键词：" + query : "精选影片";
        }
        var empty = document.querySelector("[data-search-empty]");
        if (empty) {
            empty.style.display = results.length ? "none" : "block";
        }
    }

    function initPlayer(options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        if (!video || !button) {
            return;
        }
        var attached = false;
        var hls = null;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = options.source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(options.source);
                hls.attachMedia(video);
            } else {
                video.src = options.source;
            }
        }
        function start() {
            attach();
            button.classList.add("is-hidden");
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }
        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.SitePlayer = {
        init: initPlayer
    };

    ready(function () {
        initMobileNav();
        initHero();
        initFilters();
        initSearchPage();
    });
})();
