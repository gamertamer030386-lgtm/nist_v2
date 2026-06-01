import { config } from "dotenv";
config();
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import nistData from "./data/nist-csf-2.0.json";

const sql = neon(process.env.DATABASE_URL!);
const adapter = new PrismaNeon(sql as any);
const prisma = new PrismaClient({ adapter } as any);


async function main() {
  console.log("Seeding NIST CSF 2.0 reference data...");

  // Upsert functions
  for (const func of nistData.functions) {
    await prisma.nistFunction.upsert({
      where: { id: func.id },
      update: {
        name: func.name,
        description: func.description,
        sortOrder: func.sortOrder,
      },
      create: {
        id: func.id,
        name: func.name,
        description: func.description,
        sortOrder: func.sortOrder,
      },
    });
  }
  console.log(`  ✓ Upserted ${nistData.functions.length} functions`);

  // Upsert categories
  for (const cat of nistData.categories) {
    await prisma.nistCategory.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        functionId: cat.functionId,
      },
      create: {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        functionId: cat.functionId,
      },
    });
  }
  console.log(`  ✓ Upserted ${nistData.categories.length} categories`);

  // Upsert subcategories
  for (const sub of nistData.subcategories) {
    await prisma.nistSubcategory.upsert({
      where: { id: sub.id },
      update: {
        name: sub.name,
        description: sub.description,
        implementationExamples: sub.implementationExamples,
        informativeReferences: sub.informativeReferences,
        sortOrder: sub.sortOrder,
        categoryId: sub.categoryId,
      },
      create: {
        id: sub.id,
        name: sub.name,
        description: sub.description,
        implementationExamples: sub.implementationExamples,
        informativeReferences: sub.informativeReferences,
        sortOrder: sub.sortOrder,
        categoryId: sub.categoryId,
      },
    });
  }
  console.log(`  ✓ Upserted ${nistData.subcategories.length} subcategories`);

  // Seed default Super Admin user (idempotent upsert)
  const superAdminEmail = "admin@system.local";
  const superAdminPassword = await bcrypt.hash("Admin123!", 10);

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      role: "SUPER_ADMIN",
      isActive: true,
    },
    create: {
      email: superAdminEmail,
      passwordHash: superAdminPassword,
      name: "System Administrator",
      role: "SUPER_ADMIN",
      isActive: true,
      themeMode: "DAY",
    },
  });
  console.log(`  ✓ Upserted Super Admin user (${superAdminEmail})`);

  // Seed demo office
  const demoOffice = await prisma.office.upsert({
    where: { id: "demo-office" },
    update: { name: "Demo Office" },
    create: {
      id: "demo-office",
      name: "Demo Office",
      description: "Default demo office for testing purposes",
    },
  });
  console.log(`  ✓ Upserted Demo Office`);

  // Seed demo Admin user
  const demoAdminEmail = "demo.admin@example.com";
  const demoAdminPassword = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: demoAdminEmail },
    update: {
      role: "ADMIN",
      isActive: true,
      officeId: demoOffice.id,
    },
    create: {
      email: demoAdminEmail,
      passwordHash: demoAdminPassword,
      name: "Demo Admin",
      role: "ADMIN",
      isActive: true,
      themeMode: "DAY",
      officeId: demoOffice.id,
    },
  });
  console.log(`  ✓ Upserted Demo Admin user (${demoAdminEmail})`);

  // Seed demo End User
  const demoUserEmail = "demo.user@example.com";
  const demoUserPassword = await bcrypt.hash("User123!", 10);
  await prisma.user.upsert({
    where: { email: demoUserEmail },
    update: {
      role: "END_USER",
      isActive: true,
      officeId: demoOffice.id,
    },
    create: {
      email: demoUserEmail,
      passwordHash: demoUserPassword,
      name: "Demo User",
      role: "END_USER",
      isActive: true,
      themeMode: "DAY",
      officeId: demoOffice.id,
    },
  });
  console.log(`  ✓ Upserted Demo End User (${demoUserEmail})`);

  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
