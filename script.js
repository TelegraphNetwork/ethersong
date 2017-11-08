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
  var bars = [];

  for (var i = 1; i <= 128; i++) {
    bars.push(document.getElementById('bar-' + i));
  }

  var MusicVisuals = {
    call: null,
    start: function () {
      var frequencyData = analyser.getValue();
      var numberOfBars = 128;

      var min = Math.min.apply(Math, frequencyData);
      var max = Math.max.apply(Math, frequencyData);
      var k = Math.abs(max - min);

      for (let i = 0; i < numberOfBars / 2; i++) {
        let y = frequencyData[64 + i];
        y = (y - min) / k * 8 + .5;
        y *= 1 + (numberOfBars / 2 - i) / 32;
        bars[i].style.transform = "scaleY(" + y + ')';
        bars[numberOfBars - i - 1].style.transform = "scaleY(" + y + ')';
      }

      MusicVisuals.call = requestAnimationFrame(MusicVisuals.start);
    }
  };


  MusicVisuals.start();
}

