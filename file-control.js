import fs from "fs";

export function createFile(name) {
  fs.open(`${name}.json`, "w", (err) => {
    if (err) throw err;
    console.log("File created");
  });
}

export function writeToFile(name, data, pageNumber) {
  fs.appendFile(`${name}.json`, JSON.stringify(data), (err) => {
    if (err) throw err;
    console.log(`${pageNumber} page data has been added!`);
  });
}
