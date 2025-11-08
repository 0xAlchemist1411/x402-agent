# Database Setup

## Quick Setup

1. Make sure you have PostgreSQL running and your `DATABASE_URL` set in `.env`

2. Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma db push
```

3. (Optional) Seed some sample data:
```bash
npx prisma db seed
```

## Sample Data

You can add sample assets directly through the API or create a seed script. Here's an example of inserting sample data:

```sql
INSERT INTO assets (filename, "mimeType", "assetType", price, title, description, "filePath", tags) VALUES
('sample-image.jpg', 'image/jpeg', 'IMAGE', 0.05, 'Beautiful Sunset', 'A stunning sunset photograph', '/uploads/sample-image.jpg', ARRAY['nature', 'sunset', 'photography']),
('research-paper.pdf', 'application/pdf', 'DOCUMENT', 0.10, 'AI Research Paper', 'Latest findings in machine learning', '/uploads/research-paper.pdf', ARRAY['ai', 'research', 'ml']),
('demo-video.mp4', 'video/mp4', 'VIDEO', 0.25, 'Product Demo', 'Complete product walkthrough', '/uploads/demo-video.mp4', ARRAY['demo', 'product', 'tutorial']);
```

## Schema Overview

The simplified schema includes:

- **Asset**: Main table for storing files and metadata
  - Basic file info (filename, mimeType, filePath, fileSize)
  - Pricing (price in USDC)
  - Metadata (title, description, tags, custom JSON metadata)
  - Analytics (viewCount, downloadCount)
  - Timestamps (createdAt, updatedAt)

This minimal schema focuses on just storing assets and their metadata as requested, without the complexity of users, transactions, or reviews.