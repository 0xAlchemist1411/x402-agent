# x404 ATXP MCP  
AI-Powered Digital Asset Marketplace with MCP Agent

## 🚀 Project Overview  
x404 ATXP MCP is a web application built to enable creators and users to upload, browse, and manage digital assets (images, PDFs, videos, links) in a marketplace-style environment. It also integrates an intelligent MCP (“Marketplace Companion”) agent powered by AI to assist with asset management, discovery, and user engagement.

From the homepage:  
> “Upload Assets – Images, PDF, Videos, Links”  

This suggests the core focus: handling different asset types and enabling their upload and categorisation.

---

## 📦 Features  
- Upload multiple asset types:  
  - Images  
  - PDFs  
  - Videos  
  - External links  
- Asset management interface: categorised by asset type (images, PDF, videos, links)  
- AI-powered MCP agent:  
  - Assists users in discovering assets  
  - Provides recommendations / insights? (depending on implementation)  
- Clean, modern UI using Next.js (as indicated by “Create Next App”)  
- Deployment ready for Vercel (or similar hosting)  

---

## 🧱 Technology Stack  
- Frontend & backend framework: Next.js  
- Possibly TypeScript (if configured)  
- Hosted/deployed on Vercel  
- Asset storage: (you may use e.g. AWS S3, Cloudinary, or Vercel Storage)  
- AI agent backend: (e.g. OpenAI API, LangChain, or custom)  
- Database: (not explicitly shown — e.g. PostgreSQL, MongoDB)  
- Authentication & user management: (add if implemented)  

---

## 📥 Getting Started  

### Prerequisites  
- Node.js (version 16+ recommended)  
- Yarn or npm  
- A `.env.local` file for environment variables (see Configuration below)  
- API keys and storage credentials (for asset upload/storage + AI agent)  

### Installation  
```bash
# Clone the repository  
git clone https://github.com/0xAlchemist1411/x402-agent.git
cd x402-agent

# Install dependencies  
npm install -> for each folders
