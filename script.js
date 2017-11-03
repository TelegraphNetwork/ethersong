var playBtn = document.querySelector('.play'),
  equalizer = document.querySelector('.equalizer');


playBtn.addEventListener('click', function () {
  this.classList.add('play--invisible');
  equalizer.classList.add('equalizer--flex');

  setTimeout(function () {
    playBtn.style.display = "none";
    equalizer.classList.add('equalizer--opaq');
  }, 500);

  playBlock();
  startSong();

});

function startSong() {
  var visualWidth = 318,
    visualHeight = 100;

  // analyser.fftSize = 2048;
  // analyser.minDecibels = -90;
  // analyser.maxDecibels = 0;

  var bufferLength = analyser.frequencyBinCount,
    frequencyData = new Uint8Array(bufferLength);

  var bars = [];

  for (var i = 1; i <= 128; i++) {
    bars.push(document.getElementById('bar-' + i));
  }

  var ScaleBar = {
    min: 10,
    max: visualHeight,
    sum: 0,
    get: function (fromMin, fromMax, valueIn) {
      var toMin = ScaleBar.min,
        toMax = ScaleBar.max;
      var result = ((toMax - toMin) * (valueIn - fromMin)) / (fromMax - fromMin) + toMin;
      return result;
    }
  };

  var MusicVisuals = {
    call: null,
    start: function () {
      frequencyData = analyser.getValue();
      var numberOfBars = 128;

      var min = Math.min.apply(Math, frequencyData);
      var max = Math.max.apply(Math, frequencyData);
      var k = Math.abs(max - min);

      for (let i = 0; i < numberOfBars / 2; i++) {
        let y = frequencyData[64 + i];
        y = (y - min) / k * 8 + .5;
        y *= 1 + (numberOfBars / 2 - i) / 32;
        // console.log(max, min, k, frequencyData[i], y);
        bars[i].style.transform = "scaleY(" + y + ')';
        bars[numberOfBars - i - 1].style.transform = "scaleY(" + y + ')';
      }

      MusicVisuals.call = requestAnimationFrame(MusicVisuals.start);
    }
  };


  MusicVisuals.start();

  // whiteNoise.connect(audioCtx.destination);
  // whiteNoise.connect(analyser);
}

