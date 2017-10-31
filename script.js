var playBtn = document.querySelector('.play'),
    equalizer = document.querySelector('.equalizer');



playBtn.addEventListener('click', function() {
  this.classList.add('play--invisible');
  equalizer.classList.add('equalizer--flex');

  setTimeout( function() {
    playBtn.style.display = "none";
    equalizer.classList.add('equalizer--opaq');
  }, 500);
  
  startSong();

})


function startSong() {
  var visualWidth = 318,
    visualHeight = 100,
    audioCtx = new ( window.AudioContext || window.webkitAudioContext ),
    analyser = audioCtx.createAnalyser();

  analyser.fftSize = 2048;
  analyser.minDecibels = -90;
  analyser.maxDecibels = 0;

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
      analyser.getByteFrequencyData(frequencyData);

      var barcc = 0;
      var numberOfBars = 128;
      var steps = numberOfBars;

      var min = Math.min.apply(Math, frequencyData);
      var max = Math.max.apply(Math, frequencyData);
      var k = max - min;


      for (var i = 0; i < numberOfBars * 2; i += 2) {
        var y = frequencyData[i];
        y = (y - min ) / k * 8 + .5;

        barcc++;

        if (barcc > numberOfBars) {
          barcc = 0;
        }

        var bar = bars[barcc];

        if (bar) {
          bar.style.transform = "scaleY(" + y + ')';
        }
      }

      MusicVisuals.call = requestAnimationFrame(MusicVisuals.start);
    }
  };


  MusicVisuals.start();


  let k = 4430000;
  let bufferSize = 4096;
  let whiteNoise = audioCtx.createScriptProcessor(bufferSize, 1, 1);
  let last_data = [];
  let last_check = 0;
  let fetchInProgress = false;

  whiteNoise.onaudioprocess = function (e) {
    let output = e.outputBuffer.getChannelData(0);
    if (fetchInProgress) return;
    console.log('Start fetching block #' + k);
    fetchInProgress = true;
    $.getJSON('https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=' + k.toString(16) + '&boolean=true&apiKey=PUI5KF35AIYZ5S4Q7FHPAKATWB2DX3CBG1', function (data) {
      data = data.result;
      if (Date.now() - last_check < 500) {
        fetchInProgress = false;
        return;
      }
      console.log('fetched block #', k, 'at', new Date());
      last_check = Date.now();
      if (data === null) return;
      k++;
      if (data.transactions.length) {
        let result = data.transactions.map(function (txData) {
          let arr = parseHexString(txData.input);
          arr = arr.reduce((prev, curr) => prev.concat(longToByteArray(curr)), []);
          arr = arr.map(x => x / 255 / 2);
          return arr;
        });
        let arr = result.reduce((prev, curr) => prev.concat(curr), []);
        last_data = [];
        for (let i = 0; i < arr.length; i++) {
          output[i] = arr[i];
          last_data[i] = arr[i];
        }
      }
      fetchInProgress = false;
    });
  };


  whiteNoise.connect(audioCtx.destination);
  whiteNoise.connect(analyser);

  function parseHexString(str) {
    let result = [];
    while (str.length >= 8) {
      result.push(parseInt(str.substring(0, 8), 16));

      str = str.substring(8, str.length);
    }
    return result;
  }

  longToByteArray = function (long) {
    let byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for (let index = 0; index < byteArray.length; index++) {
      let byte = long & 0xff;
      byteArray [index] = byte;
      long = (long - byte) / 256;
    }

    return byteArray;
  };
}

