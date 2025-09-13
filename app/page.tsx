import { DatabaseSidebar } from "@/components/database-sidebar"
import { DataQualityResults } from "@/components/data-quality-results"
import { AIAgentPanel } from "@/components/ai-agent-panel"

export default function DataEngineeringDashboard() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for database tables */}
      <DatabaseSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* AI Agent Control Panel */}
        <AIAgentPanel />

        {/* Data Quality Results */}
        <div className="flex-1 p-6">
          <DataQualityResults />
        </div>
      </div>
    </div>
  )
}
