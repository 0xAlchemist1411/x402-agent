import "dotenv/config";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";

export async function runAgent(query: string) {
  try {
    // Connect to your MCP server
    const client = new MultiServerMCPClient({
      assets: {
        transport: "sse",
        url: process.env.MCP_URL || "http://localhost:3030/mcp",
        headers: {
          Accept: "application/json, text/event-stream",
        },
      },
    });

    // Fetch all available tools
    const tools = await client.getTools();

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 4000,
    });

    // Create an agent with tools and model
    const agent = createAgent({ model, tools });

    // Define system prompt
    const systemPrompt = `You are MCP Agent — an AI assistant for managing digital assets via MCP.
- Use listAssets or getAssetInfo for queries
- Use uploadAsset for uploads
- Note ATXP validation for transactions
Be concise and helpful.`;

    // Run the agent
    const result = await agent.invoke({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
    });

    console.log("Agent result:", JSON.stringify(result, null, 2));

    if (result?.messages) {
      const lastMessage = result.messages[result.messages.length - 1];
      const responseText = typeof lastMessage?.content === 'string' 
        ? lastMessage.content 
        : JSON.stringify(lastMessage?.content || "No response found");

      return {
        messages: result.messages,
        response: responseText,
      };
    }

    if (typeof result === "string") {
      return { messages: [], response: result };
    }

    return {
      messages: [],
      response: JSON.stringify(result, null, 2),
    };
  } catch (err: any) {
    console.error("runAgent error:", err);
    throw new Error(err?.message ?? "Failed to run agent");
  }
}