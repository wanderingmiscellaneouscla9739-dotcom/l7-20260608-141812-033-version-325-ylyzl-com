(function () {
  function loadVideo(video, stream) {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.setAttribute('data-ready', '1');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      video.setAttribute('data-ready', '1');
      return;
    }

    video.src = stream;
    video.setAttribute('data-ready', '1');
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video[data-play]');
    var overlay = player.querySelector('[data-play-overlay]');
    var button = player.querySelector('[data-play-button]');

    function start() {
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-play');
      if (!stream) {
        return;
      }
      loadVideo(video, stream);
      video.setAttribute('controls', 'controls');
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (overlay && overlay !== button) {
      overlay.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.getAttribute('data-ready') !== '1') {
          start();
        }
      });
    }
  });
})();
