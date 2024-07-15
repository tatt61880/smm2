(function () {
  'use strict';
  const version = 'Version: 2024.07.15';

  window.onload = function () {
    document.getElementById('version-info').innerText = version;
    document.getElementById('input-text').addEventListener('input', update, false);

    update();
  };

  function update() {
    const inputText = document.getElementById('input-text').value;

    let result = '';
    const re = /(\w{3}-\w{3}-\w{3})/g;

    const levelCodeSet = new Set();
    const levelCodes = []; 

    let m;
    while (m = re.exec(inputText)) {
      const levelCode = m[0];
      if (!levelCodeSet.has(levelCode)) {
        levelCodeSet.add(levelCode);
        levelCodes.push(levelCode);
      }
    }

    for (const levelCode of levelCodes) {
      result += `<a target="_blank" href="https://smm2.wizul.us/smm2/level/${levelCode}">${levelCode}</a><br>`;
    }

    document.getElementById('result').innerHTML = result;
  }
})();
