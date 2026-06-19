(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var input = document.getElementById('global-search');
        var category = document.getElementById('global-category');
        var button = document.getElementById('global-search-button');
        var count = document.getElementById('global-search-count');
        var results = document.getElementById('global-search-results');
        var movies = window.MOVIE_INDEX || [];

        if (!input || !category || !button || !count || !results) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get('q') || '';

        if (queryFromUrl) {
            input.value = queryFromUrl;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function renderCard(movie) {
            var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
                return escapeHtml(tag);
            }).join(' ');

            return '' +
                '<article class="movie-card movie-card--search" data-title="' + escapeHtml(movie.title) + '">' +
                    '<a class="poster-frame" href="' + escapeHtml(movie.url) + '">' +
                        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\'; this.closest(\'.poster-frame\').classList.add(\'is-missing\');">' +
                        '<span class="poster-badge">' + escapeHtml(movie.category) + '</span>' +
                        '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
                        '<span class="poster-play" aria-hidden="true">▶</span>' +
                    '</a>' +
                    '<div class="movie-card-body">' +
                        '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                        '<p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>' +
                        '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                        '<div class="movie-tags">' + tags + '</div>' +
                        '<a class="category-mini-link" href="category/' + escapeHtml(movie.categorySlug) + '.html">' + escapeHtml(movie.category) + '</a>' +
                    '</div>' +
                '</article>';
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function search() {
            var keyword = normalize(input.value);
            var selectedCategory = normalize(category.value);
            var matched = movies.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    movie.oneLine,
                    (movie.tags || []).join(' ')
                ].join(' '));

                if (selectedCategory && normalize(movie.category) !== selectedCategory) {
                    return false;
                }

                if (keyword && haystack.indexOf(keyword) === -1) {
                    return false;
                }

                return true;
            }).slice(0, 120);

            results.innerHTML = matched.map(renderCard).join('');
            count.textContent = '显示 ' + matched.length + ' 部影片' + (matched.length === 120 ? '，可继续输入关键词缩小范围' : '');
        }

        input.addEventListener('input', search);
        category.addEventListener('change', search);
        button.addEventListener('click', search);

        search();
    });
})();
