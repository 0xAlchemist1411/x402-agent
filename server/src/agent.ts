// src/agent.ts
import "dotenv/config";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";

export async function runAgent(query: string): Promise<string> {
  try {
    // Connect to your MCP server
    const client = new MultiServerMCPClient({
      assets: {
        transport: "sse",
        url: "http://localhost:3030/mcp",
        headers: {
          Accept: "application/json, text/event-stream",
        },
      },
    });

    // Fetch all available tools
    const tools = await client.getTools();

    // Initialize OpenAI model
    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      temperature: 0.7,
    });

    // Create an agent with tools and model
    const agent = createAgent({ model, tools });

    // Define system prompt
    const systemPrompt = `
You are Poseidon MCP Agent — an AI assistant capable of fetching, uploading, and managing digital assets
(images, videos, or documents) using the MCP (Model Context Protocol).
Always reason carefully about the user's intent.
- When asked about assets, use MCP tools like listAssets or getAssetInfo.
- When asked to upload, use uploadAsset if available.
- When asked to perform any action that involves payment or transaction, note that the server may require ATXP validation.
Be concise, structured, and helpful in all responses.
`;

    // Run the agent with both system and user messages
    const result = await agent.invoke({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
    });

    // Handle multiple possible output formats
    if (typeof result === "string") return result;

    return JSON.stringify(result, null, 2);
  } catch (err: any) {
    console.error("runAgent error:", err);
    throw new Error(err?.message ?? "Failed to run agent");
  }
}
