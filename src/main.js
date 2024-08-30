(function () {
  'use strict';
  const version = 'Version: 2024.08.30';

  window.onload = function () {
    document.getElementById('version-info').innerText = version;
    document.getElementById('input-text').addEventListener('input', update, false);

    update();
  };

  function update() {
    const inputText = document.getElementById('input-text').value;

    let result = '';
    const re = /\b([B-DF-HJ-NP-TV-Y0-9]{3})-?([B-DF-HJ-NP-TV-Y0-9]{3})-?([B-DF-HJ-NP-TV-Y0-9]{3})\b/gi;

    const codeInInputStrMap = new Map();
    const levelCodeSet = new Set();
    const levelCodes = [];

    while (true) {
      const m = re.exec(inputText);
      if (!m) break;

      const levelCode = `${m[1].toUpperCase()}-${m[2].toUpperCase()}-${m[3].toUpperCase()}`;
      const codeInInputStr = m[0];

      if (!codeInInputStrMap.has(levelCode) || codeInInputStr === levelCode) {
        codeInInputStrMap.set(levelCode, codeInInputStr);
      }

      if (!levelCodeSet.has(levelCode)) {
        levelCodeSet.add(levelCode);
        levelCodes.push(levelCode);
      }
    }

    for (const levelCode of levelCodes) {
      const codeInInputStr = codeInInputStrMap.get(levelCode);
      let codeInfo = '';
      if (codeInInputStr !== levelCode) {
        codeInfo = ` (${codeInInputStr})`;
      }
      const viewerUrl = `https://smm2.wizul.us/smm2/level/${levelCode}`;
      result += `<span class="level-code">${levelCode}: <a target="_blank" href="${viewerUrl}">${viewerUrl}</a>${codeInfo}</span><br>`;
    }

    document.getElementById('result').innerHTML = result;
  }
})();
