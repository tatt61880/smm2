import fs from 'fs';

const idsText = fs.readFileSync(`./input/maker-ids.txt`, 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{9}$/.test(line));

const userCodeToName = {};
const clearsCount = {};

for (const id of ids) {
  const filename = `./json/${id}.json`;

  try {
    const jsonText = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(jsonText);
    const courses = json.courses;
    
    let count = 0;
    for (const course of courses) {
      const uploadedTime = course.uploaded_pretty;
      const ret = uploadedTime.match(/\d{4}/);
      const year = ret[0];

      if (year === '2020' && course.clears === 0) {
        count++;
      }
    }

    console.log(count);
    // console.log(json);
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}
