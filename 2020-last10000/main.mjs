import fs from 'fs';

const idsText = fs.readFileSync(`./input/level-ids.txt`, 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{3}-\w{3}-\w{3}$/.test(line));

const unixTimeForComparing = new Date('2020-03-21T00:00:00').getTime() / 1000 - 9 * 3600;  // 比較用の Unix time (※ process.env.TZ = 'Asia/Tokyo' の環境で実行する前提で調整しています。)
// console.log(unixTimeForComparing);

const makerInfo = true;
const countryInfo = true;

const makerLevelNums = new Map();
const makerCodeToName = new Map();
const countryLevelNums = new Map();

let count = 0;
for (let id of ids) {
  const id_ = id.replaceAll('-', '');
  const filename = `./json/${id_}.json`;

  try {
    const jsonText = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(jsonText);

    const levelName = json.name;
    const uploaded = json.uploaded;  // 投稿日時の Unix Time

    const upload_time = json.upload_time;  // 10000 = 10 seconds.
    const game_style_name = json.game_style_name;  // 'SMB1', 'SMB3', 'SMW', 'NSMBU', 'SM3DW'
    const theme_name = json.theme_name;  // 'Castle', 'Ghost house', 'Airship', 'Overworld', 'Sky', 'Desert', 'Snow', 'Underground'

    const clears = json.clears;
    const attempts = json.attempts;
    const plays = json.plays;  // footprints
    const versus_matches = json.versus_matches;

    const likes = json.likes;
    const boos = json.boos;

    const country = json.uploader.country;  // 'US', 'JP', 'MX', ...
    const uploader_code = json.uploader.code;
    const uploader_name = json.uploader.name;
    const versus_rank = json.uploader.versus_rank;  // 3 => B
    const versus_rating = json.uploader.versus_rating;
    
    if (makerInfo) {
      makerCodeToName.set(uploader_code, uploader_name);

      if (makerLevelNums.has(uploader_code)) {
        makerLevelNums.set(uploader_code, makerLevelNums.get(uploader_code) + 1);
      } else {
        makerLevelNums.set(uploader_code, 1);
      }
    }

    if (countryInfo) {
      if (countryLevelNums.has(country)) {
        countryLevelNums.set(country, countryLevelNums.get(country) + 1);
      } else {
        countryLevelNums.set(country, 1);
      }
    }

    if (versus_rating !== 0 && versus_rating < 100) {
      console.log(`${id}\t${versus_rating}\t${levelName}`);
      count++;
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

console.log(`count = ${count}`);

if (makerInfo) {
  console.log(`----------------------------------------`);
  console.log(`Maker info`);
  let count2 = 0;
  const nums = new Map();
  for (const uploader_code of [...makerLevelNums.keys()].sort((a, b) => makerLevelNums.get(b) - makerLevelNums.get(a))) {
    const name = makerCodeToName.get(uploader_code);
    const num = makerLevelNums.get(uploader_code);
    if (nums.has(num)) {
      nums.set(num, nums.get(num) + 1);
    } else {
      nums.set(num, 1);
    }
    if (num > 3) {
      console.log(`${uploader_code} ${num} ${name}`);
      count2++;
    }
  }
  
  console.log(`count2 = ${count2}`);
  
  console.log('');
  let sum = 0;
  for (const num of [...nums.keys()].sort((a, b) => nums.get(a) - nums.get(b))) {
    const count3 = nums.get(num);
    sum += count3;
    console.log(`${num}: ${count3}`);
  }
  console.log(`(1+: ${sum})`); 
  console.log(`(2+: ${sum - nums.get(1)})`); 
}

if (countryInfo) {
  console.log(`----------------------------------------`);
  console.log(`Country info`);

  let count2 = 0;
  const nums = new Map();
  for (const country of [...countryLevelNums.keys()].sort((a, b) => countryLevelNums.get(b) - countryLevelNums.get(a))) {
  const num = countryLevelNums.get(country);
  console.log(`${country} ${num}`);
  }
}

console.log(`----------------------------------------`);
console.log(`Level nums: ${ids.length}`)
