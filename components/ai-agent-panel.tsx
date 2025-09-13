"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bot, Play, Square, Settings, Activity } from "lucide-react"

interface AgentStatus {
  id: string
  name: string
  status: "idle" | "running" | "completed" | "error"
  progress: number
  lastRun: string
  events?: string[]
  error?: string
}

export function AIAgentPanel() {
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: "email_validation",
      name: "Email Validator",
      status: "idle",
      progress: 0,
      lastRun: "Never run",
    },
    {
      id: "data_quality",
      name: "Data Quality Checker",
      status: "idle",
      progress: 0,
      lastRun: "Never run",
    },
  ])

  const runAgent = async (agentId: string) => {
    console.log("[v0] Starting ZypherAgent:", agentId)

    setAgents((prev) =>
      prev.map((agent) => (agent.id === agentId ? { ...agent, status: "running" as const, progress: 0 } : agent)),
    )

    try {
      const progressInterval = setInterval(() => {
        setAgents((prev) =>
          prev.map((agent) => {
            if (agent.id === agentId && agent.status === "running") {
              const newProgress = Math.min(agent.progress + 15, 85)
              return { ...agent, progress: newProgress }
            }
            return agent
          }),
        )
      }, 2000)

      const response = await fetch("/api/agent/run-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType: agentId }),
      })

      const result = await response.json()
      clearInterval(progressInterval)

      console.log("[v0] ZypherAgent result:", result)

      if (result.error || result.status === "error") {
        setAgents((prev) =>
          prev.map((agent) =>
            agent.id === agentId
              ? {
                  ...agent,
                  status: "error" as const,
                  progress: 0,
                  lastRun: `Error: ${result.error || "Unknown error"}`,
                  error: result.error,
                }
              : agent,
          ),
        )
      } else {
        setAgents((prev) =>
          prev.map((agent) =>
            agent.id === agentId
              ? {
                  ...agent,
                  status: "completed" as const,
                  progress: 100,
                  lastRun: "Just completed",
                  events: result.events || [],
                }
              : agent,
          ),
        )
      }
    } catch (error) {
      console.error("[v0] ZypherAgent error:", error)
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === agentId
            ? { ...agent, status: "error" as const, progress: 0, lastRun: `Error: ${error.message}` }
            : agent,
        ),
      )
    }
  }

  const stopAgent = (agentId: string) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === agentId ? { ...agent, status: "idle" as const, progress: 0 } : agent)),
    )
  }

  const getStatusColor = (status: AgentStatus["status"]) => {
    switch (status) {
      case "running":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: AgentStatus["status"]) => {
    switch (status) {
      case "running":
        return "Running"
      case "completed":
        return "Completed"
      case "error":
        return "Error"
      default:
        return "Idle"
    }
  }

  return (
    <Card className="m-6 mb-0 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">ZypherAgent AI Agents</h2>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{agent.name}</span>
              </div>
              <Badge variant="secondary" className={cn("text-xs", getStatusColor(agent.status))}>
                {getStatusText(agent.status)}
              </Badge>
            </div>

            {agent.status === "running" && (
              <div className="mb-3">
                <Progress value={agent.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{agent.progress}% complete</p>
              </div>
            )}

            {agent.events && agent.events.length > 0 && agent.status === "completed" && (
              <div className="mb-3 p-2 bg-muted rounded text-xs max-h-32 overflow-y-auto">
                <p className="font-medium mb-1">ZypherAgent Events:</p>
                <div className="space-y-1">
                  {agent.events.slice(-3).map((event, index) => (
                    <p key={index} className="text-muted-foreground text-xs break-words">
                      {event.length > 100 ? `${event.substring(0, 100)}...` : event}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {agent.error && agent.status === "error" && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
                <p className="font-medium mb-1 text-red-700">Error:</p>
                <p className="text-red-600">{agent.error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{agent.lastRun}</span>
              <div className="flex gap-1">
                {agent.status === "running" ? (
                  <Button variant="outline" size="sm" onClick={() => stopAgent(agent.id)} className="h-7 px-2">
                    <Square className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => runAgent(agent.id)} className="h-7 px-2">
                    <Play className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}
