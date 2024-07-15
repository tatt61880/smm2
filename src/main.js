(function () {
  'use strict';
  const version = 'Version: 2024.07.16';

  window.onload = function () {
    document.getElementById('version-info').innerText = version;
    document.getElementById('input-text').addEventListener('input', update, false);

    update();
  };

  function update() {
    const inputText = document.getElementById('input-text').value;

    let result = '';
    const re = /\b([A-HJ-NP-Y0-9]{3})-?([A-HJ-NP-Y0-9]{3})-?([A-HJ-NP-Y0-9]{3})\b/gi;

    const codeInInputStrMap = new Map();
    const levelCodeSet = new Set();
    const levelCodes = []; 

    let m;
    while (m = re.exec(inputText)) {
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
      result += `<a target="_blank" href="https://smm2.wizul.us/smm2/level/${levelCode}">${levelCode}</a>${codeInfo}<br>`;
    }

    document.getElementById('result').innerHTML = result;
  }
})();
