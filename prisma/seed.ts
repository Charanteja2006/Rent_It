import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo users
  const password = await bcrypt.hash("password123", 12);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "alice@example.com",
      passwordHash: password,
      image: null,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Smith",
      email: "bob@example.com",
      passwordHash: password,
      image: null,
    },
  });

  // Create sample items
  const items = [
    {
      ownerId: alice.id,
      name: "Sony A7III Camera",
      description: "Professional mirrorless camera in excellent condition. Includes body, 28-70mm kit lens, two batteries, and charger. Perfect for photography enthusiasts or events.",
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
      tags: ["camera", "electronics", "photography"],
      rentPerDay: 45.00,
      isAvailable: true,
    },
    {
      ownerId: alice.id,
      name: "Mountain Bike - Trek",
      description: "Trek Marlin 7 mountain bike, 29\" wheels, 27-speed Shimano gears. Great for trails and road riding. Recently serviced.",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      tags: ["bicycle", "sports", "outdoor"],
      rentPerDay: 25.00,
      isAvailable: true,
    },
    {
      ownerId: bob.id,
      name: "Camping Tent (4-Person)",
      description: "REI Co-op Base Camp 4 tent. Weather-resistant, easy setup, includes footprint. Sleeps 4 adults comfortably.",
      imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
      tags: ["outdoor", "camping", "sports"],
      rentPerDay: 20.00,
      isAvailable: true,
    },
    {
      ownerId: bob.id,
      name: "Power Drill Set - DeWalt",
      description: "DeWalt 20V MAX cordless drill/driver kit. Includes drill, two batteries, charger, and 100-piece accessory set.",
      imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800",
      tags: ["tools", "electronics"],
      rentPerDay: 15.00,
      isAvailable: true,
    },
  ];

  for (const item of items) {
    await prisma.item.create({ data: item });
  }

  console.log(`✅ Created ${items.length} items`);
  console.log("👤 Demo accounts:");
  console.log("   alice@example.com / password123");
  console.log("   bob@example.com / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
