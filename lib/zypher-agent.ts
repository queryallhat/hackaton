import { AnthropicModelProvider, ZypherAgent } from "@corespeed/zypher";
import { eachValueFrom } from "rxjs-for-await";
import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";

// Load environment variables from .env file
const env = await load();

// Helper function to safely get environment variables
function getRequiredEnv(name: string): string {
  const value = env[name] || Deno.env.get(name);
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

// Create the agent with your preferred LLM provider
const agent = new ZypherAgent(
  new AnthropicModelProvider({
    apiKey: getRequiredEnv("ANTHROPIC_API_KEY"),
  }),
);

// Register and connect to an MCP server to give the agent web crawling capabilities
await agent.mcpServerManager.registerServer({
  id: "postgres-server",
  type: "command",
  command: {
    command: "npx",
    args: ["-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://localhost/users"],
    // env: {
    //   FIRECRAWL_API_KEY: getRequiredEnv("FIRECRAWL_API_KEY"),
    // },
  },
});

// Initialize the agent
await agent.init();

// Run first task - email validation on users table
const emailValidationEvent$ = agent.runTask(
  `Check if the format of emails in the users table is correct. Query the users table to get all email addresses and validate that each email follows proper email format (contains @ symbol, valid domain structure, etc.). Report any invalid email formats found.`,
  "claude-sonnet-4-20250514",
);

// Stream the results for first task
console.log("=== EMAIL VALIDATION TASK ===");
for await (const event of eachValueFrom(emailValidationEvent$)) {
  console.log(event);
}

// Run second task - data quality check on orders table
const dataQualityEvent$ = agent.runTask(
  `Perform a comprehensive data quality check on the orders table. Check for: 1) NULL or missing values in critical fields, 2) Invalid email formats in customer_email field, 3) Negative or zero amounts, 4) Duplicate order numbers, 5) Invalid dates, 6) Data consistency issues. Provide a detailed report with counts and examples of each data quality issue found.`,
  "claude-sonnet-4-20250514",
);

// Stream the results for second task
console.log("\n=== DATA QUALITY CHECK TASK ===");
for await (const event of eachValueFrom(dataQualityEvent$)) {
  console.log(event);
}
