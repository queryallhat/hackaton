import { type NextRequest, NextResponse } from "next/server"
import { runEmailValidationTask, runDataQualityTask } from "@/lib/zypher-agent"

export async function POST(request: NextRequest) {
  try {
    const { taskType } = await request.json()

    console.log("[v0] Running ZypherAgent task:", taskType)

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("[v0] Missing ANTHROPIC_API_KEY environment variable")
      return NextResponse.json({
        id: taskType,
        task: taskType === "email_validation" ? "Email Validation Check" : "Data Quality Check",
        status: "error",
        events: [],
        error: "ANTHROPIC_API_KEY environment variable is not configured. Please add it in your project settings.",
      })
    }

    let result
    switch (taskType) {
      case "email_validation":
        result = await runEmailValidationTask()
        break
      case "data_quality":
        result = await runDataQualityTask()
        break
      default:
        return NextResponse.json({ error: "Invalid task type" }, { status: 400 })
    }

    console.log("[v0] ZypherAgent task completed:", result.status)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] ZypherAgent task error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json({
      id: "error",
      task: "Agent Task",
      status: "error",
      events: [],
      error: errorMessage,
    })
  }
}
