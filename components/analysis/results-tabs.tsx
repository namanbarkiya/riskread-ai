"use client";

import { useState } from "react";
import {
  BarChart3,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Lightbulb,
  Share2,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Analysis, AnalysisResult } from "@/lib/types/analysis";
import { AnalysisHeader } from "./analysis-header";
import { InsightsDisplay } from "./insights-display";
import { ScoreBreakdown } from "./score-breakdown";

interface ResultsTabsProps {
  analysis: Analysis;
  result?: AnalysisResult | null;
  onReanalyze?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  className?: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export const ResultsTabs = ({
  analysis,
  result,
  onReanalyze,
  onDownload,
  onShare,
  className,
}: ResultsTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const isCompleted = analysis.status === "completed";
  const hasResults = result && isCompleted;

  const tabItems: TabItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <Eye className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <AnalysisHeader
            analysis={analysis}
            result={result}
            onReanalyze={onReanalyze}
            onDownload={onDownload}
            onShare={onShare}
          />

          {hasResults && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ScoreBreakdown result={result} />
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-3">Quick Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Overall Score:</span>
                      <span className="font-medium">
                        {analysis.overall_score?.toFixed(1)}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Level:</span>
                      <span className="font-medium capitalize">
                        {analysis.risk_level || "Not assessed"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Key Insights:</span>
                      <span className="font-medium">
                        {result.insights.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recommendations:</span>
                      <span className="font-medium">
                        {result.recommendations.length}
                      </span>
                    </div>
                  </div>
                </div>

                {result.highlights && result.highlights.length > 0 && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-3">Key Highlights</h3>
                    <div className="space-y-2">
                      {result.highlights.slice(0, 3).map((highlight, index) => (
                        <div
                          key={index}
                          className="text-sm p-2 bg-muted/50 rounded"
                        >
                          <p className="font-medium text-xs text-muted-foreground mb-1">
                            {highlight.category} • Page{" "}
                            {highlight.page_number || "N/A"}
                          </p>
                          <p>{highlight.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!hasResults && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                {analysis.status === "processing" ? (
                  <div className="space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p>Analysis in progress...</p>
                    <p className="text-sm">This may take a few moments</p>
                  </div>
                ) : analysis.status === "failed" ? (
                  <div className="space-y-4">
                    <div className="text-red-500 text-4xl">⚠️</div>
                    <p>Analysis failed</p>
                    <p className="text-sm">
                      Please try reanalyzing the document
                    </p>
                    {onReanalyze && (
                      <Button onClick={onReanalyze}>Try Again</Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-muted-foreground text-4xl">📄</div>
                    <p>Analysis pending</p>
                    <p className="text-sm">
                      Click reanalyze to start the analysis
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "scores",
      label: "Scores",
      icon: <BarChart3 className="h-4 w-4" />,
      content: hasResults ? (
        <ScoreBreakdown result={result} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Score breakdown will be available once analysis is complete</p>
        </div>
      ),
      disabled: !hasResults,
    },
    {
      id: "insights",
      label: "Insights",
      icon: <Lightbulb className="h-4 w-4" />,
      content: hasResults ? (
        <InsightsDisplay result={result} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Insights will be available once analysis is complete</p>
        </div>
      ),
      disabled: !hasResults,
    },
    {
      id: "details",
      label: "Details",
      icon: <Table className="h-4 w-4" />,
      content: hasResults ? (
        <div className="space-y-6">
          {/* Extracted Fields */}
          {result.extracted_fields && result.extracted_fields.length > 0 && (
            <div className="p-6 border rounded-lg">
              <h3 className="font-medium mb-4">Extracted Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.extracted_fields.map((field, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="flex flex-col gap-1 mb-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium text-sm break-words">
                        {field.name}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {field.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {field.value}
                    </p>
                    {field.ambiguity_notes && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Note: {field.ambiguity_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw AI Response */}
          {result.raw_ai_response && (
            <div className="p-6 border rounded-lg">
              <h3 className="font-medium mb-4">Raw Analysis Data</h3>
              <pre className="text-xs bg-muted p-4 rounded overflow-x-auto overflow-y-auto max-h-96 max-w-full">
                {JSON.stringify(result.raw_ai_response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Table className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>
            Detailed information will be available once analysis is complete
          </p>
        </div>
      ),
      disabled: !hasResults,
    },
  ];

  const activeTabItem = tabItems.find((tab) => tab.id === activeTab);

  return (
    <div className={className}>
      {/* Mobile Dropdown */}
      <div className="lg:hidden mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                {activeTabItem?.icon}
                <span>{activeTabItem?.label}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[var(--radix-popper-anchor-width)]"
          >
            {tabItems.map((tab) => (
              <DropdownMenuItem
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={tab.disabled}
                className="flex items-center gap-2"
              >
                {tab.icon}
                {tab.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden lg:block">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={tab.disabled}
                className="flex items-center gap-2"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabItems.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden mt-6">{activeTabItem?.content}</div>
    </div>
  );
};
