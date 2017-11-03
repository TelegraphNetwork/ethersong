(function () {
  let analyser = new Tone.FFT(128);
  let player = new Tone.Synth({
    "oscillator" : {
      "type" : "square"
    },
    "envelope" : {
      "attack" : 0.01,
      "decay" : 0.2,
      "sustain" : 0.2,
      "release" : 0.2
    }
  }).fan(analyser).toMaster();

  let player2 = new Tone.Synth({
    "oscillator" : {
      "type" : "square"
    },
    "envelope" : {
      "attack" : 0.01,
      "decay" : 0.2,
      "sustain" : 0.2,
      "release" : 0.2,
    },
  }).toMaster();

  let osc = new Tone.Oscillator({
    "frequency" : 440,
    "volume" : 0
  }).toMaster();
  // osc.start();

  let blocks = {};
  let k = 4430000;

  function prefetch(k) {
    console.log('downloading ', k);
    $.getJSON('https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=' + k.toString(16) + '&boolean=true&apiKey=PUI5KF35AIYZ5S4Q7FHPAKATWB2DX3CBG1', function (data) {
      if (data === null) setTimeout(prefetch.bind(k), 300);
      console.log('downloaded ', k);
      blocks[k] = data.result;
      setTimeout(prefetch.bind(null, k+1), 300);
    });
  }

  prefetch(k);

  let sfreqs = [];
  let sfreqs2 = [];
  function plosc() {
    let val;
    if (sfreqs.length) {
      val = sfreqs.shift();
      // player.triggerAttack(val);
      // osc.frequency.rampTo(val * 10, 100);
      player2.triggerAttack(val[1]);
      // osc.frequency.rampTo(val[0] * 10, 1);
    }
    let duration = val && val[0] ? (20000 / val[0]) : 200;
    setTimeout(plosc, duration);
  }
  plosc();

  function plosc2() {
    let val;
    if (sfreqs2.length) {
      val = sfreqs2.shift();
      player.triggerAttack(val / 2 / 4);
    }
    setTimeout(plosc2, 0);
  }
  plosc2();

  function playBlock() {
    if (window.stopped) return;
    console.log('Start fetching block #' + k);
    if (!blocks[k]) {
      setTimeout(playBlock, 500);
      return;
    }
    let data = blocks[k];
    console.log('fetched block #', k, 'at', new Date());
    delete blocks[k];
    k++;
    if (data.transactions.length) {
      let result = data.transactions.map(function (txData) {
        return parseHexString(txData.input);
      });
      let arr = result.reduce((prev, curr) => prev.concat(curr), []);
      arr = arr.reduce((prev, curr) => prev.concat(longToByteArray(curr)), []);
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== 0) sfreqs.push([data.transactions.length, arr[i]]);
        if (arr[i] !== 0) sfreqs2.push(arr[i]);
      }
    }
    setTimeout(playBlock, 500);
  }

  window.player = player;
  window.player2 = player2;
  window.analyser = analyser;
  window.osc = osc;
  window.playBlock = playBlock;

  function parseHexString(str) {
    let result = [];
    while (str.length >= 8) {
      result.push(parseInt(str.substring(0, 8), 16));

      str = str.substring(8, str.length);
    }
    return result;
  }

  function longToByteArray(long) {
    let byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for (let index = 0; index < byteArray.length; index++) {
      let byte = long & 0xff;
      byteArray [index] = byte;
      long = (long - byte) / 256;
    }

    return byteArray;
  }
})();
