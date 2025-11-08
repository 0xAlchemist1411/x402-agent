# Creator Asset Platform MCP Server

This MCP server provides paid access to creator assets through the Agent Transaction Protocol (ATXP).

## Features

- **Browse Assets**: Free browsing of available assets with metadata
- **Asset Metadata**: Get detailed information about specific assets
- **Retrieve Assets**: Paid access to asset content (requires USDC payment)
- **Upload Assets**: Upload new assets with platform fee

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```bash
DATABASE_URL="your_database_url"
ATXP_CONNECTION="your_atxp_wallet_address"
BASE_URL="http://localhost:3000"
MCP_PORT=3001
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

## Running the MCP Server

### Development Mode
```bash
npm run dev:mcp
```

### Production Mode
```bash
npm run start:mcp
```

The MCP server will start on port 3001 (or the port specified in MCP_PORT).

## Available Tools

### 1. browse_assets (Free)
Browse available assets on the platform.

**Parameters:**
- `category` (optional): Filter by asset type (image, video, paper, link)
- `creator` (optional): Filter by creator name or ID
- `limit` (optional): Maximum results (default: 10)
- `offset` (optional): Pagination offset (default: 0)

### 2. get_asset_metadata (Free)
Get detailed metadata for a specific asset.

**Parameters:**
- `assetId`: The ID of the asset

### 3. retrieve_asset (Paid)
Retrieve the actual content of an asset. Requires payment of the listed price.

**Parameters:**
- `assetId`: The ID of the asset to retrieve

**Payment:** Asset price in USDC (varies per asset)

### 4. upload_asset (Paid)
Upload a new asset to the platform.

**Parameters:**
- `filename`: Name of the file
- `mimeType`: MIME type of the file
- `price`: Price in USDC for others to access
- `description` (optional): Asset description

**Payment:** 0.05 USDC platform fee

## Testing with ngrok

To test the MCP server externally:

1. Start the MCP server:
```bash
npm run start:mcp
```

2. In another terminal, expose it with ngrok:
```bash
ngrok http http://127.0.0.1:3001
```

3. Use the ngrok HTTPS URL to connect from MCP clients like Goose.

## Payment Flow

1. Client calls a paid tool (retrieve_asset or upload_asset)
2. Server responds with payment requirement and ATXP payment URL
3. Client completes payment through ATXP
4. Server verifies payment and provides access to the requested resource
5. Transaction receipt and logs are maintained for reporting

## Integration with Existing API

The MCP server works alongside your existing Express API (`src/index.ts`). Both servers can run simultaneously:

- Main API: `http://localhost:3000` (file uploads, direct access)
- MCP Server: `http://localhost:3001` (agent access with payments)

Assets uploaded through either interface are stored in the same database and accessible through both APIs.