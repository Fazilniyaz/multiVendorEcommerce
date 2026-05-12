import prisma from "@multi-vendor-ecommerce/prisma";
import cron from "node-cron";

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily cleanup job for deleted products...");

  try {
    const now = new Date();

    //delete products where 'deletedAt' is older than 24 hours
    const deletedProducts = await prisma.products.deleteMany({
        where: {
            isDeleted : true,
            deletedAt: { lte : now }
        }
    });

    console.log(`Deleted ${deletedProducts.count} products permanently.`);

  } catch (error) {
    console.error("Error during cleanup job:", error);
  }
});