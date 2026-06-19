(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (player) {
            var video = player.querySelector('video');
            var trigger = player.querySelector('[data-player-trigger]');
            var status = player.querySelector('[data-player-status]');
            var source = player.getAttribute('data-video-url');
            var hlsInstance = null;

            if (!video || !trigger || !source) {
                if (status) {
                    status.textContent = '当前播放源暂不可用';
                }
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function playVideo() {
                trigger.classList.add('is-hidden');
                setStatus('正在加载播放源');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.play().then(function () {
                        setStatus('正在播放');
                    }).catch(function () {
                        setStatus('请再次点击播放器开始播放');
                    });
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90
                    });

                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);

                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().then(function () {
                            setStatus('正在播放');
                        }).catch(function () {
                            setStatus('请再次点击播放器开始播放');
                        });
                    });

                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus('播放源加载失败，请稍后重试');
                            if (hlsInstance) {
                                hlsInstance.destroy();
                            }
                        }
                    });
                    return;
                }

                video.src = source;
                video.play().then(function () {
                    setStatus('正在播放');
                }).catch(function () {
                    setStatus('当前浏览器需要 HLS 支持才能播放');
                });
            }

            trigger.addEventListener('click', playVideo);

            video.addEventListener('play', function () {
                trigger.classList.add('is-hidden');
                setStatus('正在播放');
            });

            video.addEventListener('pause', function () {
                setStatus('已暂停');
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
