const path = require("path");
const { readdir } = require("node:fs/promises");
const csvToJson = require("csvtojson/v2");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const pathToCSV = path.join(path.resolve(__dirname), "data") + "/";
  const files: String[] = await readdir(pathToCSV);

  for (const file of files) {
    const jsonArray = await csvToJson().fromFile(pathToCSV + file);
    const modelName = file.split(".")[0].toLowerCase();

    await prisma[modelName].createMany({ data: jsonArray });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
