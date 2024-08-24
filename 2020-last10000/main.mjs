import fs from 'fs';

const idsText = fs.readFileSync(`./input/level-ids.txt`, 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{3}-\w{3}-\w{3}$/.test(line));

const unixTimeForComparing = new Date('2020-03-21T00:00:00').getTime() / 1000 - 9 * 3600;  // 比較用の Unix time (※ process.env.TZ = 'Asia/Tokyo' の環境で実行する前提で調整しています。)
// console.log(unixTimeForComparing);

const makerInfo = true;
const makerLevelNums = new Map();

let count = 0;
for (let id of ids) {
  const id_ = id.replaceAll('-', '');
  const filename = `./json/${id_}.json`;

  try {
    const jsonText = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(jsonText);

    const uploaded = json.uploaded;  // 投稿日時の Unix Time

    const upload_time = json.upload_time;  // 10000 = 10 seconds.
    const game_style_name = json.game_style_name;  // 'SMB1', 'SMB3', 'SMW', 'NSMBU', 'SM3DW'
    const theme_name = json.theme_name;  // 'Castle', 'Ghost house', 'Airship', 'Overworld', 'Sky', 'Desert', 'Snow', 'Underground'
    
    const clears = json.clears;
    const attempts = json.attempts;
    const plays = json.plays;  // footprints

    const likes = json.likes;
    const boos = json.boos;

    const country = json.uploader.country;  // 'US', 'JP', 'MX', ...
    const uploader_code = json.uploader.code;

    if (makerInfo) {
      if (makerLevelNums.has(uploader_code)) {
        makerLevelNums.set(uploader_code, makerLevelNums.get(uploader_code) + 1);
      } else {
        makerLevelNums.set(uploader_code, 1);
      }
    }

    if (upload_time < 20000) {
      console.log(`${id}`);
      count++;
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

console.log(`count = ${count}`);

if (makerInfo) {
  console.log(`----------------------------------------`);
  let count2 = 0;
  const nums = new Map();
  for (const uploader_code of [...makerLevelNums.keys()].sort((a, b) => makerLevelNums.get(b) - makerLevelNums.get(a))) {
    const num = makerLevelNums.get(uploader_code);
    if (nums.has(num)) {
      nums.set(num, nums.get(num) + 1);
    } else {
      nums.set(num, 1);
    }
    if (num > 3) {
      console.log(`${uploader_code} ${num}`);
      count2++;
    }
  }
  
  console.log(`count2 = ${count2}`);
  
  console.log(`----------------------------------------`);
  let sum = 0;
  for (const num of [...nums.keys()].sort((a, b) => nums.get(a) - nums.get(b))) {
    const count3 = nums.get(num);
    sum += count3;
    console.log(`${num}: ${count3}`);
  }
  console.log(`(1+: ${sum})`); 
}