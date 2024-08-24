import fs from 'fs';

const idsText = fs.readFileSync(`./input/level-ids.txt`, 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{3}-\w{3}-\w{3}$/.test(line));

for (let id of ids) {
  const id_ = id.replaceAll('-', '');
  const filename = `./json/${id_}.json`;

  try {
    const jsonText = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(jsonText);
    const clears = json.clears;

    if (clears !== 0) {
      console.log(id);
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}
