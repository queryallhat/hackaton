"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Table, RefreshCw, ChevronRight, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatabaseTable {
  name: string
  schema: string
  rowCount: number
  columnCount: number
  tableSize: string
  lastUpdated: string
}

export function DatabaseSidebar() {
  const [tables, setTables] = useState<DatabaseTable[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const fetchTables = async () => {
    setLoading(true)
    setError(null)
    setWarning(null)
    try {
      console.log("[v0] Fetching tables from /api/tables")
      const response = await fetch("/api/tables")
      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        throw new Error(`Failed to fetch tables: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Received data:", data)
      setTables(data.tables)

      if (data.warning) {
        setWarning(data.warning)
        console.log("[v0] Warning:", data.warning)
      }
    } catch (err) {
      console.log("[v0] Error fetching tables:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching tables:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const refreshTables = async () => {
    await fetchTables()
  }

  const groupedTables = tables.reduce(
    (acc, table) => {
      if (!acc[table.schema]) {
        acc[table.schema] = []
      }
      acc[table.schema].push(table)
      return acc
    },
    {} as Record<string, DatabaseTable[]>,
  )

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-sidebar-primary" />
            <h2 className="font-semibold text-sidebar-foreground">Database Tables</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={refreshTables} disabled={loading} className="h-8 w-8 p-0">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {error ? "Connection error" : `${tables.length} tables available`}
        </p>
        {warning && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-xs text-yellow-800">{warning}</p>
          </div>
        )}
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>

      {/* Tables List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error && !tables.length ? (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Unable to connect to database</p>
            <Button variant="outline" size="sm" onClick={refreshTables} className="mt-2 bg-transparent">
              Try Again
            </Button>
          </div>
        ) : Object.keys(groupedTables).length === 0 ? (
          <div className="text-center py-8">
            <Table className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No tables found</p>
          </div>
        ) : (
          Object.entries(groupedTables).map(([schema, schemaTables]) => (
            <div key={schema} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{schema} Schema</h3>
              <div className="space-y-1">
                {schemaTables.map((table) => (
                  <Card
                    key={`${table.schema}.${table.name}`}
                    className={cn(
                      "p-3 cursor-pointer transition-all hover:bg-sidebar-accent",
                      selectedTable === table.name && "bg-sidebar-accent border-sidebar-primary",
                    )}
                    onClick={() => setSelectedTable(table.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4 text-sidebar-primary" />
                        <span className="font-medium text-sm">{table.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {table.rowCount.toLocaleString()} rows
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {table.columnCount} cols
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{table.tableSize}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
