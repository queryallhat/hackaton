"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, Database, FileText, BarChart3, Bot } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

interface QualityMetric {
  name: string
  score: number
  status: "good" | "warning" | "error"
  issues: number
  trend: "up" | "down" | "stable"
}

interface DataIssue {
  table: string
  column: string
  issue: string
  severity: "high" | "medium" | "low"
  count: number
}

export function DataQualityResults() {
  const [selectedTable, setSelectedTable] = useState("users")

  const qualityMetrics: QualityMetric[] = [
    { name: "Completeness", score: 94, status: "good", issues: 12, trend: "up" },
    { name: "Accuracy", score: 87, status: "warning", issues: 45, trend: "down" },
    { name: "Consistency", score: 91, status: "good", issues: 23, trend: "stable" },
    { name: "Validity", score: 76, status: "error", issues: 89, trend: "down" },
    { name: "Uniqueness", score: 98, status: "good", issues: 3, trend: "up" },
    { name: "Timeliness", score: 85, status: "warning", issues: 34, trend: "stable" },
  ]

  const dataIssues: DataIssue[] = [
    { table: "users", column: "email", issue: "Invalid email format", severity: "high", count: 23 },
    { table: "users", column: "phone", issue: "Missing values", severity: "medium", count: 156 },
    { table: "orders", column: "amount", issue: "Negative values", severity: "high", count: 8 },
    { table: "products", column: "price", issue: "Outlier values", severity: "low", count: 45 },
    { table: "customer_analytics", column: "last_login", issue: "Future dates", severity: "medium", count: 12 },
  ]

  const trendData = [
    { date: "2024-01-01", completeness: 92, accuracy: 89, consistency: 88 },
    { date: "2024-01-02", completeness: 93, accuracy: 87, consistency: 90 },
    { date: "2024-01-03", completeness: 94, accuracy: 85, consistency: 91 },
    { date: "2024-01-04", completeness: 95, accuracy: 87, consistency: 89 },
    { date: "2024-01-05", completeness: 94, accuracy: 88, consistency: 91 },
  ]

  const getStatusIcon = (status: QualityMetric["status"]) => {
    switch (status) {
      case "good":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getSeverityColor = (severity: DataIssue["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Quality Dashboard</h1>
          <p className="text-muted-foreground">Monitor and improve your data quality with AI-powered insights</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Quality Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {qualityMetrics.map((metric) => (
          <Card key={metric.name} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{metric.name}</span>
              {getStatusIcon(metric.status)}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metric.score}%</span>
                <Badge variant="secondary" className="text-xs">
                  {metric.issues} issues
                </Badge>
              </div>
              <Progress value={metric.score} className="h-2" />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp
                  className={`h-3 w-3 ${
                    metric.trend === "up"
                      ? "text-green-500"
                      : metric.trend === "down"
                        ? "text-red-500 rotate-180"
                        : "text-gray-500"
                  }`}
                />
                {metric.trend === "up" ? "Improving" : metric.trend === "down" ? "Declining" : "Stable"}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues">Data Issues</TabsTrigger>
          <TabsTrigger value="trends">Quality Trends</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Detected Issues</h3>
            </div>
            <div className="space-y-3">
              {dataIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {issue.table}.{issue.column}
                      </span>
                      <Badge className={`text-xs ${getSeverityColor(issue.severity)}`}>{issue.severity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.issue}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{issue.count}</span>
                    <p className="text-xs text-muted-foreground">affected rows</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Quality Trends (Last 5 Days)</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="completeness" stroke="#8884d8" name="Completeness" />
                  <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" name="Accuracy" />
                  <Line type="monotone" dataKey="consistency" stroke="#ffc658" name="Consistency" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI-Generated Recommendations</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">High Priority</h4>
                <p className="text-sm text-blue-800">
                  Address email validation issues in the users table. Consider implementing regex validation to catch
                  invalid email formats before data insertion.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Medium Priority</h4>
                <p className="text-sm text-yellow-800">
                  Review data entry processes for the orders table to prevent negative amount values. Consider adding
                  database constraints.
                </p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Optimization</h4>
                <p className="text-sm text-green-800">
                  Your uniqueness scores are excellent. Consider applying similar validation patterns to other data
                  quality dimensions.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
