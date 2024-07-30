import https from "https";
import fs from 'fs';
import { setTimeout } from 'node:timers/promises';

const idsText = fs.readFileSync(`./input/level-ids.txt`, 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{3}-\w{3}-\w{3}$/.test(line));

let count = 0;
let breakFlag = false;
for (let id of ids) {
  id = id.replaceAll('-', '');

  if (breakFlag) break;
  await setTimeout(10000);
  console.log(`${++count} ${id}`);

  const url = `https://tgrcode.com/mm2/level_info/${id}`;

  https.get(url, (res) => {
      if (res.statusCode !== 200) {
        breakFlag = true;
        return;
      }

      let body = '';

      res.on('data', function (d) {
        body += d;
      });
      
      res.on('end', function () {
        fs.writeFileSync(`./json/${id}.json`, body);
      })
  })
  .on("error", (e) => {
      console.error(e);
  });  
}
