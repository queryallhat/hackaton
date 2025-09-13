import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    console.log("[v0] Database query request:", query)

    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      console.log("[v0] Running in serverless environment, using mock data")

      // Mock data based on query type
      let mockRows = []
      if (query.toLowerCase().includes("users") && query.toLowerCase().includes("email")) {
        mockRows = [
          { email: "john@example.com" },
          { email: "jane@company.co" },
          { email: "invalid-email" },
          { email: "user@domain.org" },
        ]
      } else if (query.toLowerCase().includes("orders")) {
        mockRows = [
          { order_id: 1, customer_email: "john@example.com", amount: 99.99, order_date: "2024-01-15" },
          { order_id: 2, customer_email: "invalid-email", amount: -10.0, order_date: "2024-01-16" },
          { order_id: 3, customer_email: "jane@company.co", amount: 150.0, order_date: "2024-01-17" },
        ]
      }

      return NextResponse.json({
        rows: mockRows,
        rowCount: mockRows.length,
        warning: "Using mock data - PostgreSQL not available in serverless environment",
      })
    }

    const { Client } = await import("pg")

    const client = new Client({
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "",
      database: "postgres",
    })

    await client.connect()
    const result = await client.query(query)
    await client.end()

    console.log("[v0] Query executed successfully, rows:", result.rows.length)

    return NextResponse.json({
      rows: result.rows,
      rowCount: result.rowCount,
    })
  } catch (error) {
    console.error("[v0] Database query error:", error)

    const mockRows = [{ email: "john@example.com" }, { email: "jane@company.co" }, { email: "invalid-email" }]

    return NextResponse.json({
      rows: mockRows,
      rowCount: mockRows.length,
      warning: "Using mock data - Database connection failed",
      error: error.message,
    })
  }
}
