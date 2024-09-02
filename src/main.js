(function () {
  'use strict';
  const version = 'Version: 2024.09.03';

  window.onload = function () {
    document.getElementById('version-info').innerText = version;
    document.getElementById('input-text').addEventListener('input', update, false);
    document.getElementById('options-url-only').addEventListener('change', update, false);

    update();
  };

  function update() {
    const inputText = document.getElementById('input-text').value;
    const urlOnly = document.getElementById('options-url-only').checked;

    let result = '';
    const re = /\b([B-DF-HJ-NP-TV-Y0-9]{3})-?([B-DF-HJ-NP-TV-Y0-9]{3})-?([B-DF-HJ-NP-TV-Y0-9]{3})\b/gi;

    const codeInInputStrMap = new Map();
    const codeSet = new Set();
    const codes = [];
    const codeInfoMap = new Map();

    while (true) {
      const m = re.exec(inputText);
      if (!m) break;

      const code = `${m[1].toUpperCase()}${m[2].toUpperCase()}${m[3].toUpperCase()}`;
      const codePretty = `${m[1].toUpperCase()}-${m[2].toUpperCase()}-${m[3].toUpperCase()}`;
      const codeInInputStr = m[0];

      if (!codeInInputStrMap.has(codePretty) || codeInInputStr === codePretty) {
        codeInInputStrMap.set(codePretty, codeInInputStr);
      }

      if (!codeSet.has(codePretty)) {
        codeSet.add(codePretty);
        codes.push(codePretty);
        const codeInfo = getCodeInfo(code);
        codeInfoMap.set(codePretty, codeInfo);
      }
    }

    for (const code of codes) {
      const codeInInputStr = codeInInputStrMap.get(code);
      let textInfo = '';
      if (codeInInputStr !== code) {
        textInfo = ` (${codeInInputStr})`;
      }
      const codeInfo = codeInfoMap.get(code);
      const type = codeInfo.d === 1n ? 'maker' : 'level';
      const viewerUrl = `https://smm2.wizul.us/smm2/${type}/${code}`;
      if (urlOnly) {
        result += `<span class="level-code"><a target="_blank" href="${viewerUrl}">${viewerUrl}</a></span><br>`;
      } else {
        result += `<span class="level-code">${code}: <a target="_blank" href="${viewerUrl}">${viewerUrl}</a>${textInfo}</span><br>`;
      }
    }

    document.getElementById('result').innerHTML = result;
  }

  function getCodeInfo(code) {
    const cToVal = {
      '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
      '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      'B': 10, 'C': 11, 'D': 12, 'F': 13, 'G': 14,
      'H': 15, 'J': 16, 'K': 17, 'L': 18, 'M': 19,
      'N': 20, 'P': 21, 'Q': 22, 'R': 23, 'S': 24,
      'T': 25, 'V': 26, 'W': 27, 'X': 28, 'Y': 29
    };

    let num = 0;
    for (const c of code.split('').reverse()) {
      num *= 30;
      num += cToVal[c];
    }

    const lengths = [12n, 1n, 1n, 20n, 6n, 4n];
    const vals = [];
    let numBigInt = BigInt(num);
    for (const length of lengths) {
      const mask = (1n << length) - 1n;
      const val = numBigInt & mask;
      vals.unshift(val);
      numBigInt >>= length;
    }

    const a = vals[0];
    const b = vals[1];
    const c = vals[2];
    const d = vals[3];
    const e = vals[4];
    const f = vals[5];

    const n = 0x1680E07Cn ^ (c | (f << 20n));

    return { a, b, c, d, e, f, n };
  }
})();
