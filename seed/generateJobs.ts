import path from "path";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";
import { appendFile } from "node:fs/promises";

const fileName = path.join(path.resolve(__dirname), "./data/Job.csv");

const generateJobs = async () => {
  const companyList = ["FjcJCHJALA4i", "Gu7QW9LcnF5d"];

  let timeObject = new Date();

  const jobs = new Array(50)
    .fill(0)
    .map((_, index) => {
      const list = [
        randomUUID(),
        companyList[Math.floor(Math.random() * 2)],
        `Jobs ${index + 1}`,
        faker.company.catchPhraseDescriptor(),
        new Date(timeObject.getTime() + index * 1000).toISOString(),
      ];

      return list.map((item) => JSON.stringify(item)).join(", ");
    })
    .join("\r\n");

  await appendFile(fileName, jobs);

  console.log("Jobs written to csv");
};

generateJobs();
