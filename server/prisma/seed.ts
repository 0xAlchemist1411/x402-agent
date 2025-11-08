import { AssetType, PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create users
  const users = await prisma.user.createMany({
    data: [
      {
        name: "Alice",
        walletAddress: "0xA1b2C3d4E5F6a7B8C9D0E1F2A3B4C5D6E7F8A9B0",
        email: "alice@example.com",
      },
      {
        name: "Bob",
        walletAddress: "0xB1c2D3e4F5A6b7C8D9E0F1A2B3C4D5E6F7A8B9C0",
        email: "bob@example.com",
      },
    ],
  });

  console.log(`✅ Created ${users.count} users`);

  // 2. Fetch users
  const alice = await prisma.user.findUnique({ where: { walletAddress: "0xA1b2C3d4E5F6a7B8C9D0E1F2A3B4C5D6E7F8A9B0" } });
  const bob = await prisma.user.findUnique({ where: { walletAddress: "0xB1c2D3e4F5A6b7C8D9E0F1A2B3C4D5E6F7A8B9C0" } });

  // 3. Create assets
  if (alice && bob) {
    await prisma.asset.createMany({
      data: [
        {
          filename: "nft_art_1.png",
          originalName: "Art #1",
          title: "Digital Sunrise",
          description: "A beautiful AI-generated sunrise over the ocean.",
          filePath: "/uploads/nft_art_1.png",
          assetType: AssetType.IMAGE,
          price: 0.000001,
          metadata: { resolution: "4K", format: "PNG" },
          tags: ["art", "sunrise", "AI"],
          creatorId: alice.id,
        },
        {
          filename: "video_demo.mp4",
          originalName: "Demo Video",
          title: "AI Explainer Video",
          description: "Short video explaining how ATXP payments work.",
          filePath: "/uploads/video_demo.mp4",
          assetType: AssetType.VIDEO,
          price: 0.000001,
          metadata: { duration: "2m30s", codec: "H.264" },
          tags: ["demo", "education", "AI"],
          creatorId: bob.id,
        },
        {
          filename: "paper_ai_research.pdf",
          originalName: "AI Research Paper",
          title: "Exploring Multi-Agent Systems",
          description: "A deep dive into MCP and ATXP integrations.",
          filePath: "/uploads/paper_ai_research.pdf",
          assetType: AssetType.PDF,
          price: 0.000001,
          metadata: { pages: 12, format: "PDF" },
          tags: ["AI", "research", "paper"],
          creatorId: alice.id,
        },
      ],
    });

    console.log("✅ Seeded assets successfully");
  }

  console.log("🌱 Seeding completed.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
