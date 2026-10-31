(function () {
  'use strict';

  const alphabet = '0123456789BCDFGHJKLMNPQRSTVWXY';
  const viewers = Object.freeze([
    Object.freeze({
      id: 'wizulus',
      name: 'Wizulus',
      course: 'https://smm2.wizul.us/smm2/level/',
      maker: 'https://smm2.wizul.us/smm2/maker/',
      courseNote: 'Course viewer',
      makerNote: 'Maker profile',
    }),
    Object.freeze({
      id: 'smm2-viewer',
      name: 'SMM2 Viewer',
      course: 'https://www.smm2-viewer.com/courses/',
      maker: 'https://www.smm2-viewer.com/players/',
      courseNote: 'Course viewer',
      makerNote: 'Maker profile',
    }),
    Object.freeze({
      id: 'cyzon',
      name: 'Cyzon',
      course: 'https://mm2list.cyzon.us/cached-view/',
      maker: 'https://mm2list.cyzon.us/search/by_maker/',
      compact: true,
      courseNote: 'Cached courses only',
      makerNote: 'Uncleared courses by this maker',
    }),
    Object.freeze({
      id: 'thumbnail',
      name: 'Course thumbnail',
      course: 'https://tgrcode.com/mm2/level_entire_thumbnail/',
      compact: true,
      courseNote: 'Full-course image',
    }),
  ]);

  function getCodeType(rawCode) {
    let value = 0n;
    for (const character of [...rawCode].reverse()) {
      value = value * 30n + BigInt(alphabet.indexOf(character));
    }

    // SMM2 stores the course/maker flag at bit 13 of its little-endian base-30 code.
    return (value >> 13n) & 1n ? 'maker' : 'course';
  }

  function hasExtraCodeGroup(text, index, direction) {
    let cursor = index;
    let groups = 0;
    while (true) {
      while (text[cursor] === ' ' || text[cursor] === '\t') cursor += direction;
      if (text[cursor] !== '-') break;
      cursor += direction;
      while (text[cursor] === ' ' || text[cursor] === '\t') cursor += direction;
      const start = cursor;
      while (text[cursor] && alphabet.includes(text[cursor].toUpperCase())) cursor += direction;
      const length = Math.abs(cursor - start);
      if (!length || length % 3 || /[A-Z0-9_]/i.test(text[cursor] || '')) break;
      groups += length / 3;
    }
    // Three extra groups are another complete code, not a malformed extension.
    return groups % 3 !== 0;
  }

  function extractCodes(input) {
    const text = input
      .normalize('NFKC')
      .replace(/[\u2010-\u2015\u2212\uFE58\uFE63]/g, '-');
    // Spaces and tabs may separate groups; newlines must never join separate IDs.
    const pattern = /(?<![A-Z0-9_])([B-DF-HJ-NP-TV-Y0-9]{3})(?:[ \t]*-[ \t]*|[ \t]+)?([B-DF-HJ-NP-TV-Y0-9]{3})(?:[ \t]*-[ \t]*|[ \t]+)?([B-DF-HJ-NP-TV-Y0-9]{3})(?![A-Z0-9_])/gi;
    const byCode = new Map();
    let occurrences = 0;

    for (const match of text.matchAll(pattern)) {
      // Reject a fragment of a longer, spaced, hyphen-separated code.
      if (hasExtraCodeGroup(text, match.index - 1, -1) || hasExtraCodeGroup(text, match.index + match[0].length, 1)) {
        continue;
      }

      const rawCode = (match[1] + match[2] + match[3]).toUpperCase();
      occurrences += 1;
      if (byCode.has(rawCode)) {
        byCode.get(rawCode).count += 1;
        continue;
      }

      byCode.set(rawCode, {
        code: `${rawCode.slice(0, 3)}-${rawCode.slice(3, 6)}-${rawCode.slice(6)}`,
        rawCode,
        type: getCodeType(rawCode),
        count: 1,
      });
    }

    const codes = [...byCode.values()];
    return { codes, occurrences, duplicates: occurrences - codes.length };
  }

  function getLinks(entry, selectedViewers) {
    return viewers
      .filter((viewer) => selectedViewers.includes(viewer.id) && viewer[entry.type])
      .map((viewer) => ({
        viewerId: viewer.id,
        name: viewer.name,
        note: viewer[`${entry.type}Note`],
        url: viewer[entry.type] + (viewer.compact ? entry.rawCode : entry.code),
      }));
  }

  const api = Object.freeze({ viewers, extractCodes, getLinks });
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.Smm2Tool = api;
  }
})();
