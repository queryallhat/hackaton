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

// Database connection helper
async function queryDatabase(query: string) {
  try {
    const response = await fetch("/api/database/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
    return await response.json()
  } catch (error) {
    console.error("Database query error:", error)
    return { error: "Database connection failed" }
  }
}

// Email validation task
export async function runEmailValidationTask() {
  try {
    // Get all emails from users table
    const emailData = await queryDatabase("SELECT email FROM users")

    if (emailData.error) {
      return { error: emailData.error }
    }

    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt: `Check if the format of emails is correct. Here are the email addresses from the users table: ${JSON.stringify(emailData.rows)}. 
      
      Validate that each email follows proper email format (contains @ symbol, valid domain structure, etc.). 
      Report any invalid email formats found with specific examples and counts.`,
    })

    return { result: text, type: "email_validation" }
  } catch (error) {
    return { error: `Email validation failed: ${error.message}` }
  }
}

// Data quality check task
export async function runDataQualityCheck() {
  try {
    // Get sample data from orders table
    const ordersData = await queryDatabase(`
      SELECT 
        order_id, 
        customer_email, 
        amount, 
        order_date,
        COUNT(*) OVER() as total_count
      FROM orders 
      LIMIT 100
    `)

    if (ordersData.error) {
      return { error: ordersData.error }
    }

    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt: `Perform a comprehensive data quality check on this orders table data: ${JSON.stringify(ordersData.rows)}
      
      Check for:
      1) NULL or missing values in critical fields
      2) Invalid email formats in customer_email field  
      3) Negative or zero amounts
      4) Duplicate order numbers
      5) Invalid dates
      6) Data consistency issues
      
      Provide a detailed report with counts and examples of each data quality issue found.`,
    })

    return { result: text, type: "data_quality" }
  } catch (error) {
    return { error: `Data quality check failed: ${error.message}` }
  }
}
