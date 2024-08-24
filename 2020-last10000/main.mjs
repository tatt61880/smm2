import fs from 'fs';

const idsText = fs.readFileSync(`./input/level-ids.txt`, 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{3}-\w{3}-\w{3}$/.test(line));

const unixTimeForComparing = new Date('2020-03-21T00:00:00').getTime() / 1000 - 9 * 3600;  // 比較用の Unix time (※ process.env.TZ = 'Asia/Tokyo' の環境で実行する前提で調整しています。)
// console.log(unixTimeForComparing);

let count = 0;
for (let id of ids) {
  const id_ = id.replaceAll('-', '');
  const filename = `./json/${id_}.json`;

  try {
    const jsonText = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(jsonText);

    const uploaded = json.uploaded;  // 投稿日時の Unix Time

    const upload_time = json.upload_time;  // 10000 = 10 seconds.
    const country = json.uploader.country;  // 'US', 'JP', 'MX', ...
    const game_style_name = json.game_style_name;  // 'SMB1', 'SMB3', 'SMW', 'NSMBU', 'SM3DW'

    const clears = json.clears;
    const attempts = json.attempts;
    const plays = json.plays;  // footprints

    const likes = json.likes;
    const boos = json.boos;

    if (uploaded <= unixTimeForComparing) {
      console.log(`${id}`);
      count++;
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

console.log(`count = ${count}`);
