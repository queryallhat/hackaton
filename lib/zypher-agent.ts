import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

// Helper function to safely get environment variables
function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`)
  }
  return value
}

export interface AgentTaskResult {
  id: string
  task: string
  status: "running" | "completed" | "error"
  events: string[]
  error?: string
}

// Custom database query function for agent tasks
async function queryDatabase(query: string): Promise<any[]> {
  try {
    const response = await fetch("/api/database/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`Database query failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.rows || []
  } catch (error) {
    console.error("Database query error:", error)
    return []
  }
}

export async function runEmailValidationTask(): Promise<AgentTaskResult> {
  const result: AgentTaskResult = {
    id: "email-validation",
    task: "Email Validation Check",
    status: "running",
    events: [],
  }

  try {
    result.events.push("Starting email validation task...")

    // Query users table for email addresses
    result.events.push("Querying users table for email addresses...")
    const users = await queryDatabase("SELECT id, email FROM users LIMIT 100")

    if (users.length === 0) {
      result.events.push("No users found in database")
      result.status = "completed"
      return result
    }

    result.events.push(`Found ${users.length} users to validate`)

    // Use AI to analyze email formats
    const emailList = users.map((u) => u.email).join("\n")

    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt: `Analyze these email addresses for format validity. Check for proper email format (contains @ symbol, valid domain structure, etc.). 
      
Email addresses to validate:
${emailList}

Provide a detailed report with:
1. Total emails analyzed
2. Number of valid emails
3. Number of invalid emails
4. List any invalid email formats found with explanations
5. Summary of common issues found`,
    })

    result.events.push("AI analysis completed")
    result.events.push(`Analysis result: ${text}`)
    result.status = "completed"
  } catch (error) {
    result.status = "error"
    result.error = error instanceof Error ? error.message : "Unknown error"
    result.events.push(`Error: ${result.error}`)
  }

  return result
}

export async function runDataQualityTask(): Promise<AgentTaskResult> {
  const result: AgentTaskResult = {
    id: "data-quality",
    task: "Data Quality Check",
    status: "running",
    events: [],
  }

  try {
    result.events.push("Starting data quality check...")

    // Query orders table
    result.events.push("Querying orders table...")
    const orders = await queryDatabase("SELECT * FROM orders LIMIT 100")

    if (orders.length === 0) {
      result.events.push("No orders found in database")
      result.status = "completed"
      return result
    }

    result.events.push(`Found ${orders.length} orders to analyze`)

    // Convert orders to JSON string for AI analysis
    const ordersData = JSON.stringify(orders, null, 2)

    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt: `Perform a comprehensive data quality check on this orders data. Check for:
1. NULL or missing values in critical fields
2. Invalid email formats in customer_email field
3. Negative or zero amounts
4. Duplicate order numbers
5. Invalid dates
6. Data consistency issues

Orders data:
${ordersData}

Provide a detailed report with counts and examples of each data quality issue found.`,
    })

    result.events.push("AI analysis completed")
    result.events.push(`Analysis result: ${text}`)
    result.status = "completed"
  } catch (error) {
    result.status = "error"
    result.error = error instanceof Error ? error.message : "Unknown error"
    result.events.push(`Error: ${result.error}`)
  }

  return result
}
