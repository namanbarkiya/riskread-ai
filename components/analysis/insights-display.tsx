"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  Lightbulb,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { AnalysisResult } from "@/lib/types/analysis";

interface InsightsDisplayProps {
  result: AnalysisResult;
  className?: string;
}

interface InsightCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
  insights: any[];
}

export const InsightsDisplay = ({
  result,
  className,
}: InsightsDisplayProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showConfidence, setShowConfidence] = useState(false);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "risk":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "strength":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "weakness":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "opportunity":
        return <Target className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "risk":
        return "bg-red-50 border-red-200 text-red-800";
      case "strength":
        return "bg-green-50 border-green-200 text-green-800";
      case "weakness":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "opportunity":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text-gray-500";
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (confidence?: number) => {
    if (!confidence) return "Unknown";
    if (confidence >= 80) return "High";
    if (confidence >= 60) return "Medium";
    return "Low";
  };

  // Group insights by category
  const insightCategories: InsightCategory[] = [
    {
      name: "Risks",
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-red-600",
      insights: result.insights.filter(
        (insight) => insight.category === "risk"
      ),
    },
    {
      name: "Strengths",
      icon: <CheckCircle className="h-4 w-4" />,
      color: "text-green-600",
      insights: result.insights.filter(
        (insight) => insight.category === "strength"
      ),
    },
    {
      name: "Weaknesses",
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-yellow-600",
      insights: result.insights.filter(
        (insight) => insight.category === "weakness"
      ),
    },
    {
      name: "Opportunities",
      icon: <Target className="h-4 w-4" />,
      color: "text-blue-600",
      insights: result.insights.filter(
        (insight) => insight.category === "opportunity"
      ),
    },
  ].filter((category) => category.insights.length > 0);

  // Group recommendations by priority
  const recommendationCategories = [
    {
      name: "Critical",
      priority: "high",
      color: "bg-red-50 border-red-200 text-red-800",
      recommendations: result.recommendations.filter(
        (rec) => rec.priority === "high"
      ),
    },
    {
      name: "Important",
      priority: "medium",
      color: "bg-yellow-50 border-yellow-200 text-yellow-800",
      recommendations: result.recommendations.filter(
        (rec) => rec.priority === "medium"
      ),
    },
    {
      name: "Optional",
      priority: "low",
      color: "bg-blue-50 border-blue-200 text-blue-800",
      recommendations: result.recommendations.filter(
        (rec) => rec.priority === "low"
      ),
    },
  ].filter((category) => category.recommendations.length > 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Insights Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Key Insights
              <Badge variant="outline">{result.insights.length}</Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfidence(!showConfidence)}
              className="shrink-0"
            >
              {showConfidence ? (
                <EyeOff className="h-4 w-4 mr-1" />
              ) : (
                <Eye className="h-4 w-4 mr-1" />
              )}
              <span className="hidden sm:inline">
                {showConfidence ? "Hide" : "Show"} Confidence
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {insightCategories.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No insights available for this analysis.
            </p>
          ) : (
            insightCategories.map((category) => (
              <Collapsible
                key={category.name}
                open={expandedCategories.includes(category.name)}
                onOpenChange={() => toggleCategory(category.name)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto"
                  >
                    <div className="flex items-center gap-3">
                      <div className={category.color}>{category.icon}</div>
                      <div className="text-left">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.insights.length} insight
                          {category.insights.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    {expandedCategories.includes(category.name) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  {category.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm flex-1">{insight.text}</p>
                        {showConfidence && insight.confidence && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${getConfidenceColor(insight.confidence)}`}
                          >
                            {getConfidenceLabel(insight.confidence)} (
                            {insight.confidence}%)
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recommendations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recommendations
            <Badge variant="outline">{result.recommendations.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendationCategories.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No recommendations available for this analysis.
            </p>
          ) : (
            recommendationCategories.map((category) => (
              <div key={category.name} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={category.color}>
                    {category.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {category.recommendations.length} recommendation
                    {category.recommendations.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-2">
                  {category.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm mb-2">{recommendation.text}</p>
                          <Badge variant="outline" className="text-xs">
                            {recommendation.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Questions Section */}
      {result.questions && result.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Questions & Clarifications
              <Badge variant="outline">{result.questions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.questions.map((question, index) => (
              <div key={index} className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm mb-2">{question.text}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {question.priority} priority
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {question.category}
                      </Badge>
                    </div>
                    {question.suggested_action && (
                      <p className="text-xs text-muted-foreground mt-2">
                        <strong>Suggested Action:</strong>{" "}
                        {question.suggested_action}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
