'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { viewers, extractCodes, getLinks } = require('../src/core.js');

function firstEntry(input) {
  const { codes } = extractCodes(input);
  assert.equal(codes.length, 1, input);
  return codes[0];
}

test('distinguishes published course and maker codes', () => {
  // These examples are published in NintendoClients, Wizulus, and SMM2 Viewer.
  const result = extractCodes(
    '7WC-8BR-XBG 2J5-3K2-Y9G NGD-SJG-21H S11-N5L-HYF'
  );
  assert.deepEqual(
    result.codes.map(({ code, type }) => ({ code, type })),
    [
      { code: '7WC-8BR-XBG', type: 'course' },
      { code: '2J5-3K2-Y9G', type: 'course' },
      { code: 'NGD-SJG-21H', type: 'maker' },
      { code: 'S11-N5L-HYF', type: 'maker' },
    ]
  );
  assert.equal(result.occurrences, 4);
  assert.equal(result.duplicates, 0);
});

test('normalizes lowercase, compact, and partially hyphenated codes', () => {
  for (const input of ['7wc8brxbg', '7wc-8br-xbg', '7wc8br-xbg', '7wc-8brxbg']) {
    assert.deepEqual(firstEntry(input), {
      code: '7WC-8BR-XBG',
      rawCode: '7WC8BRXBG',
      type: 'course',
      count: 1,
    });
  }
});

test('normalizes fullwidth letters, digits, hyphens, and spaces', () => {
  for (const input of ['７ｗｃ－８ｂｒ－ｘｂｇ', '７ＷＣ８ＢＲＸＢＧ', '７ＷＣ　８ＢＲ　ＸＢＧ']) {
    assert.equal(firstEntry(input).code, '7WC-8BR-XBG');
  }
});

test('accepts common Unicode dashes and minus signs', () => {
  const separators = [
    '\u2010', '\u2011', '\u2012', '\u2013', '\u2014', '\u2015',
    '\u2212', '\uFE58', '\uFE63', '\uFF0D',
  ];
  for (const separator of separators) {
    assert.equal(firstEntry(`7WC${separator}8BR${separator}XBG`).code, '7WC-8BR-XBG');
  }
});

test('accepts spaces and tabs between groups and around hyphens', () => {
  for (const input of ['7WC 8BR XBG', '7WC\t8BR\tXBG', '7WC - 8BR - XBG', '7WC\t- 8BR-\tXBG']) {
    assert.equal(firstEntry(input).code, '7WC-8BR-XBG');
  }
});

test('deduplicates normalized codes, preserves first appearance, and counts repeats', () => {
  const result = extractCodes(
    'ngdsjg21h\n7WC-8BR-XBG\nＮＧＤ－ＳＪＧ－２１Ｈ\n7wc 8br xbg\n2J5-3K2-Y9G\n7WC8BRXBG'
  );
  assert.deepEqual(result.codes.map(({ code, count }) => ({ code, count })), [
    { code: 'NGD-SJG-21H', count: 2 },
    { code: '7WC-8BR-XBG', count: 3 },
    { code: '2J5-3K2-Y9G', count: 1 },
  ]);
  assert.equal(result.occurrences, 6);
  assert.equal(result.duplicates, 3);
});

test('finds codes inside viewer URLs and Japanese sentences', () => {
  const result = extractCodes(
    'このコース7WC-8BR-XBGです。\nhttps://smm2.wizul.us/smm2/maker/NGD-SJG-21H?tab=levels\nhttps://mm2list.cyzon.us/cached-view/2J53K2Y9G'
  );
  assert.deepEqual(result.codes.map(({ code }) => code), [
    '7WC-8BR-XBG', 'NGD-SJG-21H', '2J5-3K2-Y9G',
  ]);
});

test('allows prose separated from a code by a dash', () => {
  for (const input of ['Course - 7WC-8BR-XBG', 'ID - 7WC-8BR-XBG', '7WC-8BR-XBG - hello', '7WC-8BR-XBG — this is fun', '- 7WC-8BR-XBG']) {
    assert.equal(firstEntry(input).code, '7WC-8BR-XBG');
  }
});

test('keeps complete codes separated by a dash, including compact forms', () => {
  for (const input of [
    '7WC-8BR-XBG - XL2-72J-7GF',
    '7WC-8BR-XBG — XL2-72J-7GF',
    '7WC-8BR-XBG - XL272J7GF',
    '7WC8BRXBG - XL2-72J-7GF',
    '7WC8BR-XBG - XL272J-7GF',
  ]) {
    assert.deepEqual(extractCodes(input).codes.map(({ code }) => code), [
      '7WC-8BR-XBG', 'XL2-72J-7GF',
    ], input);
  }
});

test('does not repair forbidden letters or extract fragments of longer identifiers', () => {
  const inputs = [
    'AWC-8BR-XBG', '7EC-8BR-XBG', '7WI-8BR-XBG',
    '7WC-OBR-XBG', '7WC-8UR-XBG', '7WC-8BR-XBZ',
    'A7WC8BRXBG', '7WC8BRXBGA', 'B7WC-8BR-XBG', '7WC-8BR-XBG9',
    '_7WC-8BR-XBG', '7WC-8BR-XBG_', '7WC8BRXBGXYZ',
    '000-7WC-8BR-XBG', '7WC-8BR-XBG-000',
    '000 - 7WC - 8BR - XBG', '7WC - 8BR - XBG - 000',
  ];
  for (const input of inputs) {
    assert.deepEqual(extractCodes(input).codes, [], input);
  }
});

test('never joins code fragments across line breaks', () => {
  for (const input of ['7WC\n8BR\nXBG', '7WC-\n8BR-XBG', '7WC\r\n8BR\r\nXBG', '7WC\r8BR\rXBG', '7WC\u20288BR\u2028XBG']) {
    assert.deepEqual(extractCodes(input).codes, [], input);
  }
  assert.equal(extractCodes('7WC-8BR-XBG\nNGD-SJG-21H').codes.length, 2);
});

test('returns empty results for empty input or text without a code', () => {
  for (const input of ['', ' \t\n', 'コードはありません。', '7WC-8BR']) {
    assert.deepEqual(extractCodes(input), {
      codes: [],
      occurrences: 0,
      duplicates: 0,
    });
  }
});

test('generates the exact course URLs for the three viewers and the thumbnail', () => {
  const links = getLinks(firstEntry('7WC-8BR-XBG'), viewers.map(({ id }) => id));
  assert.deepEqual(links.map(({ viewerId, url }) => ({ viewerId, url })), [
    { viewerId: 'wizulus', url: 'https://smm2.wizul.us/smm2/level/7WC-8BR-XBG' },
    { viewerId: 'smm2-viewer', url: 'https://www.smm2-viewer.com/courses/7WC-8BR-XBG' },
    { viewerId: 'cyzon', url: 'https://mm2list.cyzon.us/cached-view/7WC8BRXBG' },
    { viewerId: 'thumbnail', url: 'https://tgrcode.com/mm2/level_entire_thumbnail/7WC8BRXBG' },
  ]);
});

test('generates maker destinations without generating a course thumbnail', () => {
  const entry = firstEntry('NGD-SJG-21H');
  const links = getLinks(entry, viewers.map(({ id }) => id));
  assert.deepEqual(links.map(({ viewerId, url }) => ({ viewerId, url })), [
    { viewerId: 'wizulus', url: 'https://smm2.wizul.us/smm2/maker/NGD-SJG-21H' },
    { viewerId: 'smm2-viewer', url: 'https://www.smm2-viewer.com/players/NGD-SJG-21H' },
    { viewerId: 'cyzon', url: 'https://mm2list.cyzon.us/search/by_maker/NGDSJG21H' },
  ]);
  assert.deepEqual(getLinks(entry, ['thumbnail']), []);
});

test('honors the selected viewers and ignores unknown or repeated IDs', () => {
  const entry = firstEntry('7WC-8BR-XBG');
  assert.deepEqual(getLinks(entry, []), []);
  assert.deepEqual(getLinks(entry, ['unknown-viewer']), []);
  assert.deepEqual(
    getLinks(entry, ['unknown-viewer', 'cyzon', 'cyzon']).map(({ url }) => url),
    ['https://mm2list.cyzon.us/cached-view/7WC8BRXBG']
  );
});
