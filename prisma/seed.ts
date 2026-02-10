import { PrismaClient } from "../src/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { cities } from "../data/cities";
import { streets } from "../data/streets";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const forceReseed = process.env.FORCE_RESEED === "true";
  const cityCount = await prisma.city.count();

  if (!forceReseed && cityCount > 0) {
    console.log(
      "🏙️ Data exists. Skipping seed. (Set FORCE_RESEED=true to override)",
    );
    return;
  }
  if (forceReseed) {
    console.log("⚠️ FORCE_RESEED detected. Emptying database...");
    await prisma.street.deleteMany();
    await prisma.city.deleteMany();
  }

  console.log("Seeding cities...");

  await prisma.city.createMany({
    data: cities.map((city: any) => ({
      id: city._id,
      citySymbol: city.סמל_ישוב,
      cityName: city.שם_ישוב.trim(),
      cityEnglishName: city.שם_ישוב_לועזי?.trim() || "",
      districtSymbol: city.סמל_נפה || 0,
      districtName: city.שם_נפה?.trim() || "",
      bureauSymbol: city.סמל_לשכת_מנא || 0,
      bureauName: city.לשכה?.trim() || "",
      councilSymbol: city.סמל_מועצה_איזורית || 0,
      councilName: city.שם_מועצה?.trim() || "",
    })),
    skipDuplicates: true,
  });

  console.log("Seeding streets...");
  await prisma.street.createMany({
    data: streets.map((street: any) => ({
      id: street._id,
      streetSymbol: street.סמל_רחוב,
      streetName: street.שם_רחוב.trim(),
      citySymbol: street.סמל_ישוב,
    })),
    skipDuplicates: true,
  });

  console.log("Seeding completed successfully.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
