"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Analysis, AnalysisResult } from "@/lib/types/analysis";

interface AnalysisHeaderProps {
  analysis: Analysis;
  result?: AnalysisResult | null;
  onReanalyze?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export const AnalysisHeader = ({
  analysis,
  result,
  onReanalyze,
  onDownload,
  onShare,
}: AnalysisHeaderProps) => {
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const handleReanalyze = async () => {
    if (!onReanalyze) return;

    setIsReanalyzing(true);
    try {
      await onReanalyze();
    } finally {
      setIsReanalyzing(false);
    }
  };

  const getStatusIcon = () => {
    switch (analysis.status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600 animate-spin" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskLevelColor = (riskLevel: string | null) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTopInsights = () => {
    if (!result?.insights || result.insights.length === 0) {
      return [];
    }

    // Return top 3 insights, prioritizing by category
    const priorityOrder = ["risk", "strength", "weakness", "opportunity"];
    const sortedInsights = [...result.insights].sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.category || "");
      const bIndex = priorityOrder.indexOf(b.category || "");
      return aIndex - bIndex;
    });

    return sortedInsights.slice(0, 3);
  };

  return (
    <Card className="w-full">
      {/* <CardHeader className="flex justify-end">
        <div className="flex items-center gap-2">
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download PDF
            </Button>
          )}

          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          )}

          {onReanalyze && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReanalyze}
              disabled={isReanalyzing || analysis.status === "processing"}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isReanalyzing ? "animate-spin" : ""}`}
              />
              {isReanalyzing ? "Reanalyzing..." : "Reanalyze"}
            </Button>
          )}
        </div>
      </CardHeader> */}

      <CardContent className="space-y-4 pt-4">
        {/* Status and Score Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-medium capitalize">{analysis.status}</p>
              <p className="text-sm text-muted-foreground">
                {analysis.status === "completed" &&
                analysis.processing_completed_at
                  ? `Completed ${formatDate(analysis.processing_completed_at)}`
                  : analysis.status === "processing"
                    ? "Processing document..."
                    : "Document analysed"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            {analysis.risk_level && (
              <Badge
                variant="outline"
                className={getRiskLevelColor(analysis.risk_level)}
              >
                {analysis.risk_level} Risk
              </Badge>
            )}

            {analysis.overall_score !== null && (
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {analysis.overall_score.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Overall Score
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Key Insights */}
        {result && getTopInsights().length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Key Insights</h4>
            <div className="space-y-2">
              {getTopInsights().map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-muted/50 rounded-md"
                >
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <p className="text-sm">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Time */}
        {analysis.processing_started_at && analysis.processing_completed_at && (
          <div className="text-sm text-muted-foreground">
            <span>Processing time: </span>
            <span className="font-medium">
              {Math.round(
                (new Date(analysis.processing_completed_at).getTime() -
                  new Date(analysis.processing_started_at).getTime()) /
                  1000
              )}
              s
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
