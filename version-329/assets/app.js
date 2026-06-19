(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function bindMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", opened ? "false" : "true");
            panel.hidden = opened;
        });
    }

    function bindHero() {
        var carousel = document.querySelector("[data-hero]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
        var prev = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                play();
            });
        });
        show(0);
        play();
    }

    function bindPageFilter() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var keyword = panel.querySelector("[data-filter-keyword]");
        var genre = panel.querySelector("[data-filter-genre]");
        var year = panel.querySelector("[data-filter-year]");
        var clear = panel.querySelector("[data-filter-clear]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty]");

        function normalize(value) {
            return String(value || "").toLowerCase();
        }

        function apply() {
            var q = normalize(keyword && keyword.value);
            var g = normalize(genre && genre.value);
            var y = normalize(year && year.value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type")
                ].join(" "));
                var matched = (!q || text.indexOf(q) !== -1) && (!g || text.indexOf(g) !== -1) && (!y || text.indexOf(y) !== -1);
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [keyword, genre, year].forEach(function (node) {
            if (node) {
                node.addEventListener("input", apply);
                node.addEventListener("change", apply);
            }
        });
        if (clear) {
            clear.addEventListener("click", function () {
                if (keyword) {
                    keyword.value = "";
                }
                if (genre) {
                    genre.value = "";
                }
                if (year) {
                    year.value = "";
                }
                apply();
            });
        }
        apply();
    }

    function bindPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var cover = player.querySelector(".player-cover");
        var playButton = player.querySelector(".big-play");
        var sourceNode = video ? video.querySelector("source") : null;
        var source = sourceNode ? sourceNode.getAttribute("src") : "";
        var prepared = false;
        var hls = null;

        function prepare() {
            if (!video || prepared || !source) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            if (!video) {
                return;
            }
            prepare();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        if (playButton) {
            playButton.addEventListener("click", function (event) {
                event.stopPropagation();
                start();
            });
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls && hls.destroy) {
                    hls.destroy();
                }
            });
        }
    }

    function bindSearchPage() {
        var root = document.querySelector("[data-search-page]");
        if (!root || !window.SITE_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var input = document.querySelector("[data-search-input]");
        var grid = document.querySelector("[data-search-results]");
        var empty = document.querySelector("[data-empty]");
        var prev = document.querySelector("[data-page-prev]");
        var next = document.querySelector("[data-page-next]");
        var pageInfo = document.querySelector("[data-page-info]");
        if (!grid) {
            return;
        }
        var currentPage = 1;
        var pageSize = 24;
        var results = [];

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function card(movie) {
            return [
                '<article class="movie-card">',
                '    <a class="poster-link" href="' + movie.href + '" aria-label="观看' + movie.title + '">',
                '        <img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy">',
                '        <span class="poster-shade"></span>',
                '        <span class="play-dot">▶</span>',
                '        <span class="poster-type">' + movie.type + '</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <h3><a href="' + movie.href + '">' + movie.title + '</a></h3>',
                '        <p>' + movie.oneLine + '</p>',
                '        <div class="movie-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.genre + '</span></div>',
                '    </div>',
                '</article>'
            ].join('');
        }

        function render() {
            var start = (currentPage - 1) * pageSize;
            var pageItems = results.slice(start, start + pageSize);
            grid.innerHTML = pageItems.map(card).join("");
            var totalPages = Math.max(1, Math.ceil(results.length / pageSize));
            if (empty) {
                empty.classList.toggle("is-visible", results.length === 0);
            }
            if (prev) {
                prev.disabled = currentPage <= 1;
            }
            if (next) {
                next.disabled = currentPage >= totalPages;
            }
            if (pageInfo) {
                pageInfo.textContent = currentPage + " / " + totalPages;
            }
        }

        function search() {
            var q = normalize(input && input.value);
            results = window.SITE_MOVIES.filter(function (movie) {
                if (!q) {
                    return true;
                }
                return normalize(movie.title + " " + movie.genre + " " + movie.region + " " + movie.year + " " + movie.type + " " + movie.oneLine).indexOf(q) !== -1;
            });
            currentPage = 1;
            render();
        }

        if (input) {
            input.value = params.get("q") || "";
            input.addEventListener("input", search);
        }
        if (prev) {
            prev.addEventListener("click", function () {
                if (currentPage > 1) {
                    currentPage -= 1;
                    render();
                }
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                var totalPages = Math.max(1, Math.ceil(results.length / pageSize));
                if (currentPage < totalPages) {
                    currentPage += 1;
                    render();
                }
            });
        }
        search();
    }

    ready(function () {
        bindMenu();
        bindHero();
        bindPageFilter();
        bindPlayer();
        bindSearchPage();
    });
})();
