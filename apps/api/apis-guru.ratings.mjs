/* eslint-env node */
import fs from "fs";
import path from "path";

const outputPath = path.resolve(process.cwd(), "../../apis-guru");
const ratingsPath = path.resolve(outputPath, "ratings.json");
const logPath = path.resolve(outputPath, `${process.env.RUN_ID}.log`);

if (!fs.existsSync(ratingsPath)) {
  console.log("Ratings file not found, skipping");
  process.exit();
}

const ratings = await fetch(
  "https://storage.googleapis.com/rate-my-openapi-public/apis-guru/ratings.json",
  {
    cache: "no-cache",
  },
).then((response) => response.json());

let updatedRatings = [];
const logLines = await fs.promises.readFile(logPath, "utf-8");
for (const line of logLines.split("\n")) {
  if (line) {
    const report = JSON.parse(line);
    updatedRatings.push(report);
  }
}

updatedRatings.forEach((r) => {
  const oldRating = ratings.find(
    (ur) => ur.name === r.name && ur.version === r.version,
  );
  if (oldRating) {
    oldRating.score = r.score;
    oldRating.reportId = r.reportId;
    oldRating.hash = r.hash;
  } else {
    ratings.push(r);
  }
});

console.log(`Found ${updatedRatings.length} updated ratings`);
console.log(`Total ratings after merge: ${ratings.length}`);

// Just to make sure we create fully valid json without undefined values
const response = new Response(JSON.stringify(ratings));
const result = await response.json();
const reportJson = JSON.stringify(result, null, 2);
await fs.promises.writeFile(ratingsPath, reportJson, "utf-8");
