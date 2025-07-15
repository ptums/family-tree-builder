const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const API_URL = "http://localhost:3000/api/family";
const OUTPUT_PATH = path.join(__dirname, "../data/db.json");

function fetchData(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function main() {
  try {
    const data = await fetchData(API_URL);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
    console.log(`Data written to ${OUTPUT_PATH}`);
  } catch (err) {
    console.error("Error fetching or writing data:", err);
    process.exit(1);
  }
}

main();
