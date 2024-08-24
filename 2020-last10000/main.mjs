import fs from 'fs';

const idsText = fs.readFileSync(`./input/level-ids.txt`, 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{3}-\w{3}-\w{3}$/.test(line));

let count = 0;
for (let id of ids) {
  const id_ = id.replaceAll('-', '');
  const filename = `./json/${id_}.json`;

  try {
    const jsonText = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(jsonText);

    const upload_time = json.upload_time;  // 10000 = 10 seconds.
    const country = json.uploader.country;  // US, JP, MX, ...
    const likes = json.likes;
    const boos = json.boos;

    if (upload_time <= 20000) {
      console.log(id);
      count++;
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

console.log(`count = ${count}`);
