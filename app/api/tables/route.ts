import { NextResponse } from "next/server"

export async function GET() {
  console.log("[v0] API: Starting database connection attempt")

  const mockTables = [
    {
      name: "orders",
      schema: "public",
      rowCount: 1250,
      columnCount: 8,
      tableSize: "2.1 MB",
      lastUpdated: new Date().toLocaleString(),
    },
    {
      name: "users",
      schema: "public",
      rowCount: 450,
      columnCount: 12,
      tableSize: "890 KB",
      lastUpdated: new Date().toLocaleString(),
    },
  ]

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    console.log("[v0] API: Running in serverless environment, using mock data")
    return NextResponse.json({
      tables: mockTables,
      warning: "Using mock data - PostgreSQL not available in serverless environment",
    })
  }

  try {
    // Dynamic import with better error handling
    const { Client } = await import("pg")
    console.log("[v0] API: pg module loaded successfully")

    const client = new Client({
      user: "postgres",
      host: "localhost",
      database: "postgres",
      port: 5432,
      connectionTimeoutMillis: 3000,
    })

    await client.connect()
    console.log("[v0] API: Successfully connected to PostgreSQL")

    const query = `
      SELECT 
        t.table_name,
        t.table_schema,
        c.column_count
      FROM information_schema.tables t
      LEFT JOIN (
        SELECT table_schema, table_name, COUNT(*) as column_count
        FROM information_schema.columns
        GROUP BY table_schema, table_name
      ) c ON c.table_schema = t.table_schema AND c.table_name = t.table_name
      WHERE t.table_type = 'BASE TABLE'
        AND t.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY t.table_schema, t.table_name;
    `

    const result = await client.query(query)
    await client.end()

    const tables = result.rows.map((row) => ({
      name: row.table_name,
      schema: row.table_schema,
      rowCount: 0,
      columnCount: Number.parseInt(row.column_count) || 0,
      tableSize: "Unknown",
      lastUpdated: new Date().toLocaleString(),
    }))

    console.log(`[v0] API: Returning ${tables.length} real tables`)
    return NextResponse.json({ tables })
  } catch (error) {
    console.error("[v0] API: Database connection failed:", error.message)

    return NextResponse.json({
      tables: mockTables,
      warning: "Using mock data - PostgreSQL connection failed",
      error: error.message,
    })
  }
}
