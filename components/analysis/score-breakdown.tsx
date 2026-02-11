"use client";

import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Info,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AnalysisResult } from "@/lib/types/analysis";

interface ScoreBreakdownProps {
  result: AnalysisResult;
  className?: string;
}

interface ScoreMetric {
  name: string;
  value: number;
  description: string;
  color: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "neutral";
}

// Default weights matching the database calculation
const DEFAULT_WEIGHTS = {
  relevance: 0.25,
  completeness: 0.2,
  risk: 0.25,
  clarity: 0.15,
  accuracy: 0.15,
};

export const ScoreBreakdown = ({ result, className }: ScoreBreakdownProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getScoreBorder = (score: number) => {
    if (score >= 80) return "border-green-200";
    if (score >= 60) return "border-yellow-200";
    return "border-red-200";
  };

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <Info className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const metrics: ScoreMetric[] = [
    {
      name: "Relevance",
      value: result.relevance_score,
      description:
        "How well the document addresses the intended purpose and audience",
      color: "bg-blue-500",
      icon: <CheckCircle className="h-4 w-4" />,
      trend:
        result.relevance_score >= 75
          ? "up"
          : result.relevance_score >= 50
            ? "neutral"
            : "down",
    },
    {
      name: "Completeness",
      value: result.completeness_score,
      description: "Extent to which all necessary information is included",
      color: "bg-green-500",
      icon: <CheckCircle className="h-4 w-4" />,
      trend:
        result.completeness_score >= 75
          ? "up"
          : result.completeness_score >= 50
            ? "neutral"
            : "down",
    },
    {
      name: "Risk Assessment",
      value: result.risk_score,
      description: "Level of potential risks and issues identified",
      color: "bg-red-500",
      icon: <AlertTriangle className="h-4 w-4" />,
      trend:
        result.risk_score <= 25
          ? "up"
          : result.risk_score <= 50
            ? "neutral"
            : "down",
    },
    {
      name: "Clarity",
      value: result.clarity_score,
      description: "How clear and understandable the content is",
      color: "bg-purple-500",
      icon: <Info className="h-4 w-4" />,
      trend:
        result.clarity_score >= 75
          ? "up"
          : result.clarity_score >= 50
            ? "neutral"
            : "down",
    },
    {
      name: "Accuracy",
      value: result.accuracy_score,
      description: "Reliability and correctness of the information presented",
      color: "bg-orange-500",
      icon: <CheckCircle className="h-4 w-4" />,
      trend:
        result.accuracy_score >= 75
          ? "up"
          : result.accuracy_score >= 50
            ? "neutral"
            : "down",
    },
  ];

  // Calculate overall score using the same weighted average as the database
  const overallScore = Math.round(
    result.relevance_score * DEFAULT_WEIGHTS.relevance +
      result.completeness_score * DEFAULT_WEIGHTS.completeness +
      result.risk_score * DEFAULT_WEIGHTS.risk +
      result.clarity_score * DEFAULT_WEIGHTS.clarity +
      result.accuracy_score * DEFAULT_WEIGHTS.accuracy
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            Score Breakdown
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click for detailed scoring explanation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {/* On mobile we already show overall score in the donut, so hide this pill */}
            <Badge variant="outline" className="hidden sm:inline-flex">
              Overall: {overallScore}/100
            </Badge>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  <span className="hidden xs:inline sm:inline">
                    How Scores Work
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Understanding Your Document Score</DialogTitle>
                  <DialogDescription>
                    Learn how we calculate and interpret your document&apos;s
                    risk assessment score
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Overall Score Explanation */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">
                      Overall Score: {overallScore}/100
                    </h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        Your overall score is calculated using a{" "}
                        <strong>weighted average</strong> of five key factors.
                        This means some factors are more important than others
                        in determining the final score.
                      </p>
                    </div>
                  </div>

                  {/* Weight Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Score Weights</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-950/50 rounded">
                        <span className="text-sm text-foreground">
                          Relevance
                        </span>
                        <Badge variant="secondary">25%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950/50 rounded">
                        <span className="text-sm text-foreground">
                          Completeness
                        </span>
                        <Badge variant="secondary">20%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-950/50 rounded">
                        <span className="text-sm text-foreground">
                          Risk Assessment
                        </span>
                        <Badge variant="secondary">25%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-950/50 rounded">
                        <span className="text-sm text-foreground">Clarity</span>
                        <Badge variant="secondary">15%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-950/50 rounded">
                        <span className="text-sm text-foreground">
                          Accuracy
                        </span>
                        <Badge variant="secondary">15%</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Individual Metrics Explanation */}
                  <div className="space-y-4">
                    <h4 className="font-medium">What Each Score Means</h4>

                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <h5 className="font-medium">
                            Relevance (25% weight)
                          </h5>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          How well does this document address its intended
                          purpose and audience?
                        </p>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-foreground">90-100:</span>
                            <span className="text-muted-foreground">
                              Excellent - Perfectly matches purpose and audience
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">70-89:</span>
                            <span className="text-muted-foreground">
                              Good - Mostly relevant with minor gaps
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">50-69:</span>
                            <span className="text-muted-foreground">
                              Fair - Somewhat relevant but needs improvement
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">0-49:</span>
                            <span className="text-muted-foreground">
                              Poor - Doesn&apos;t address intended purpose well
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <h5 className="font-medium">
                            Completeness (20% weight)
                          </h5>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Does the document include all necessary information?
                        </p>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-foreground">90-100:</span>
                            <span className="text-muted-foreground">
                              Complete - All required information present
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">70-89:</span>
                            <span className="text-muted-foreground">
                              Mostly Complete - Minor information gaps
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">50-69:</span>
                            <span className="text-muted-foreground">
                              Partially Complete - Some important details
                              missing
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">0-49:</span>
                            <span className="text-muted-foreground">
                              Incomplete - Significant information missing
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <h5 className="font-medium">
                            Risk Assessment (25% weight)
                          </h5>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          What level of potential risks and issues were
                          identified?
                        </p>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-foreground">0-30:</span>
                            <span className="text-muted-foreground">
                              Low Risk - Few or minor issues identified
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">31-70:</span>
                            <span className="text-muted-foreground">
                              Medium Risk - Some concerning issues found
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">71-100:</span>
                            <span className="text-muted-foreground">
                              High Risk - Multiple significant issues detected
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <h5 className="font-medium">Clarity (15% weight)</h5>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          How clear and understandable is the content?
                        </p>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-foreground">90-100:</span>
                            <span className="text-muted-foreground">
                              Crystal Clear - Very easy to understand
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">70-89:</span>
                            <span className="text-muted-foreground">
                              Clear - Generally well-written and understandable
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">50-69:</span>
                            <span className="text-muted-foreground">
                              Somewhat Clear - Some confusing sections
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">0-49:</span>
                            <span className="text-muted-foreground">
                              Unclear - Difficult to understand or ambiguous
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <h5 className="font-medium">Accuracy (15% weight)</h5>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          How reliable and correct is the information presented?
                        </p>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-foreground">90-100:</span>
                            <span className="text-muted-foreground">
                              Highly Accurate - Very reliable information
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">70-89:</span>
                            <span className="text-muted-foreground">
                              Accurate - Generally reliable with minor issues
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">50-69:</span>
                            <span className="text-muted-foreground">
                              Somewhat Accurate - Some reliability concerns
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">0-49:</span>
                            <span className="text-muted-foreground">
                              Inaccurate - Significant reliability issues
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Interpretation */}
                  <div className="space-y-3">
                    <h4 className="font-medium">
                      What Your Overall Score Means
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-foreground">
                            90-100
                          </span>
                          <Badge className="bg-green-600">Excellent</Badge>
                        </div>
                        <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                          Your document is well-crafted with minimal risks and
                          high quality across all areas.
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-foreground">
                            70-89
                          </span>
                          <Badge className="bg-blue-600">Good</Badge>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                          Your document is solid with minor areas for
                          improvement. Consider addressing the highlighted
                          issues.
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-foreground">
                            50-69
                          </span>
                          <Badge className="bg-yellow-600">Fair</Badge>
                        </div>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                          Your document needs attention. Review the
                          recommendations and address the identified issues.
                        </p>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-foreground">
                            0-49
                          </span>
                          <Badge className="bg-red-600">Poor</Badge>
                        </div>
                        <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                          Your document requires significant revision. Focus on
                          the high-priority recommendations first.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">💡 Pro Tips</h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        • Focus on improving the highest-weighted factors first
                        (Relevance & Risk)
                      </li>
                      <li>
                        • Use the detailed insights to understand specific
                        issues
                      </li>
                      <li>• Review recommendations in order of priority</li>
                      <li>
                        • Consider getting feedback from stakeholders on unclear
                        sections
                      </li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score Visualization */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallScore / 100)}`}
                className={`${getScoreColor(overallScore)} transition-all duration-1000`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(overallScore)}`}
                >
                  {overallScore}
                </div>
                <div className="text-sm text-muted-foreground">Overall</div>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Metrics */}
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  {getScoreIcon(metric.value)}
                  <span className="font-medium">{metric.name}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${getScoreColor(metric.value)}`}
                  >
                    {metric.value}/100
                  </span>
                  <Badge
                    variant="outline"
                    className={`hidden sm:inline-flex ${getScoreBorder(metric.value)} ${getScoreColor(metric.value)}`}
                  >
                    {metric.value >= 80
                      ? "Excellent"
                      : metric.value >= 60
                        ? "Good"
                        : metric.value >= 40
                          ? "Fair"
                          : "Needs Improvement"}
                  </Badge>
                </div>
              </div>
              {/* On mobile, hide long descriptions to reduce noise */}
              <p className="hidden text-sm text-muted-foreground sm:block">
                {metric.description}
              </p>
              <Progress
                value={metric.value}
                className="h-2"
                style={{
                  backgroundColor: "hsl(var(--muted))",
                }}
              />
            </div>
          ))}
        </div>

        {/* Score Summary */}
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium mb-3">Score Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Average Score:</span>
              <span className="ml-2 font-medium">
                {Math.round(
                  metrics.reduce((sum, metric) => sum + metric.value, 0) /
                    metrics.length
                )}
                /100
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Weighted Score:</span>
              <span className="ml-2 font-medium">{overallScore}/100</span>
            </div>
            <div>
              <span className="text-muted-foreground">Highest Score:</span>
              <span className="ml-2 font-medium">
                {Math.max(...metrics.map((m) => m.value))}/100
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Lowest Score:</span>
              <span className="ml-2 font-medium">
                {Math.min(...metrics.map((m) => m.value))}/100
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
