"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CircleAlert,
  Clock3,
  Download,
  Eye,
  FileText,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Moon } from "lucide-react";
import { toast } from "sonner";
import { ResultsTabs } from "@/components/analysis/results-tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { useDarkMode } from "@/lib/hooks/use-dark-mode";
import { useAnalysis, useAnalysisStatus } from "@/lib/query/hooks/analysis";
import type { Analysis, AnalysisResult } from "@/lib/types/analysis";
import { cn } from "@/lib/utils";
import { cacheAnalysis, getCachedAnalysis } from "@/lib/utils/analysis-cache";
import { createMockAnalysisWithResults } from "@/lib/utils/mock-analysis";
import { generateAnalysisReport } from "@/lib/utils/pdf-report";

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = params.id as string;
  const [isDark, toggleDark] = useDarkMode();

  // Local state: what we actually render (from cache or server)
  const [displayAnalysis, setDisplayAnalysis] = useState<Analysis | null>(null);
  const [displayResult, setDisplayResult] = useState<AnalysisResult | null>(
    null
  );
  const [isFromCache, setIsFromCache] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);

  // If requested via query param, load demo output
  useEffect(() => {
    const mockParam = searchParams?.get("mock");
    const shouldUseMock =
      mockParam === "1" || mockParam === "true" || analysisId === "demo";

    if (!shouldUseMock) return;

    const mock = createMockAnalysisWithResults(analysisId);
    setIsMockMode(true);
    setDisplayAnalysis(mock.analysis);
    setDisplayResult(mock.result);
    setIsFromCache(true);
  }, [analysisId, searchParams]);

  // Try loading from localStorage immediately
  useEffect(() => {
    if (isMockMode) return;
    const cached = getCachedAnalysis(analysisId);
    if (cached) {
      setDisplayAnalysis(cached.analysis);
      setDisplayResult(cached.result);
      setIsFromCache(true);
    }
  }, [analysisId, isMockMode]);

  // Determine if we need to poll the server:
  // - If nothing cached, always poll
  // - If cached but status is not completed/failed, poll to get updates
  const needsServerPolling =
    !isMockMode &&
    (!isFromCache ||
      (displayAnalysis?.status !== "completed" &&
        displayAnalysis?.status !== "failed"));

  const {
    data: serverData,
    isLoading: serverLoading,
    error: serverError,
    refetch,
  } = useAnalysis(analysisId, needsServerPolling);

  const { data: statusData } = useAnalysisStatus(
    analysisId,
    needsServerPolling
  );

  // When server returns data, update display and cache if completed
  useEffect(() => {
    if (isMockMode) return;
    if (!serverData?.analysis) return;

    setDisplayAnalysis(serverData.analysis);
    setDisplayResult(serverData.result || null);

    // Cache to localStorage once completed
    if (
      serverData.analysis.status === "completed" ||
      serverData.analysis.status === "failed"
    ) {
      cacheAnalysis(serverData.analysis, serverData.result || null);
      setIsFromCache(true);
    }
  }, [serverData, isMockMode]);

  // Refetch full data when status changes to completed
  useEffect(() => {
    if (isMockMode) return;
    if (
      statusData?.status === "completed" &&
      displayAnalysis?.status !== "completed"
    ) {
      refetch();
    }
  }, [statusData?.status, displayAnalysis?.status, refetch, isMockMode]);

  // Handle errors
  useEffect(() => {
    if (serverError && !isFromCache) {
      toast.error("Failed to load analysis");
    }
  }, [serverError, isFromCache]);

  // Derive loading state
  const isLoading = !displayAnalysis && serverLoading;

  const handleViewMockData = () => {
    const mock = createMockAnalysisWithResults(analysisId);
    setIsMockMode(true);
    setDisplayAnalysis(mock.analysis);
    setDisplayResult(mock.result);
    setIsFromCache(true);
    toast.message("Showing demo output");
  };

  const handleViewRealData = async () => {
    if (analysisId === "demo") return;

    setIsMockMode(false);
    setIsFromCache(false);

    const cached = getCachedAnalysis(analysisId);
    if (cached) {
      setDisplayAnalysis(cached.analysis);
      setDisplayResult(cached.result);
      setIsFromCache(true);
      toast.message("Showing cached output");
      return;
    }

    toast.message("Loading live output");
    try {
      await refetch();
    } catch {
      // errors handled by existing effect
    }
  };

  // Handle reanalysis
  const handleReanalyze = async () => {
    if (!displayAnalysis) return;

    try {
      const response = await fetch(`/api/analysis/${analysisId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "pending",
        }),
      });

      if (response.ok) {
        // Clear cache since we're reprocessing
        setIsFromCache(false);
        toast.success("Analysis restarted successfully!");
        window.location.reload();
      } else {
        toast.error("Failed to restart analysis");
      }
    } catch (error) {
      console.error("Error restarting analysis:", error);
      toast.error("Failed to restart analysis");
    }
  };

  // Handle download as PDF report
  const handleDownload = () => {
    if (!displayAnalysis) return;

    try {
      generateAnalysisReport(displayAnalysis, displayResult);
      toast.success("PDF report downloaded");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  const handleDownloadMockAnalysis = () => {
    try {
      const mock = createMockAnalysisWithResults(analysisId);
      generateAnalysisReport(mock.analysis, mock.result);
      toast.success("Mock analysis PDF downloaded");
    } catch (error) {
      console.error("Mock PDF generation error:", error);
      toast.error("Failed to generate mock analysis PDF");
    }
  };

  const statusStyles: Record<
    Analysis["status"],
    { label: string; classes: string; dotClasses: string }
  > = {
    pending: {
      label: "Pending",
      classes:
        "border-amber-200/80 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200",
      dotClasses: "bg-amber-500",
    },
    processing: {
      label: "Processing",
      classes:
        "border-blue-200/80 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200",
      dotClasses: "bg-blue-500 animate-pulse",
    },
    completed: {
      label: "Completed",
      classes:
        "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200",
      dotClasses: "bg-emerald-500",
    },
    failed: {
      label: "Failed",
      classes:
        "border-red-200/80 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200",
      dotClasses: "bg-red-500",
    },
  };

  const currentStatus =
    displayAnalysis?.status && statusStyles[displayAnalysis.status];

  const formattedFileSize = displayAnalysis
    ? `${(displayAnalysis.file_size / 1024 / 1024).toFixed(2)} MB`
    : null;

  return (
    <div className="min-h-screen relative">
      {/* Global gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50/70 via-teal-50/45 to-cyan-50/30 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/10" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_52%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_45%)]" />

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDark}
          className="rounded-full backdrop-blur-md bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-white/10"
        >
          <Moon
            className={cn(
              "h-5 w-5 text-gray-600",
              isDark && "dark:text-yellow-400"
            )}
          />
        </Button>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-10 pt-8 md:px-8 md:pt-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="gap-2 rounded-full bg-white/55 backdrop-blur dark:bg-neutral-900/45"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
          <Logo size="sm" className="opacity-90" />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-6 rounded-2xl border border-white/60 bg-white/75 py-14 text-center shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-2">Loading analysis...</p>
          </div>
        )}

        {/* Not found */}
        {!isLoading && !displayAnalysis && (
          <Card className="border-white/70 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
            <CardContent className="p-12 text-center">
              <div className="mb-4 text-4xl">❌</div>
              <h3 className="mb-2 text-lg font-semibold">Analysis not found</h3>
              <p className="mb-4 text-muted-foreground">
                The analysis you&apos;re looking for doesn&apos;t exist or is
                still processing.
              </p>
              <Button onClick={() => router.push("/")}>Go to Home</Button>
            </CardContent>
          </Card>
        )}

        {/* Analysis Content */}
        {!isLoading && displayAnalysis && (
          <div className="space-y-6">
            {/* Hero Header */}
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
              <CardContent className="space-y-5 p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                      <Sparkles className="h-3.5 w-3.5" />
                      {isMockMode ? "Demo output preview" : "AI risk analysis report"}
                    </div>
                    <h1 className="max-w-3xl break-words text-2xl font-bold tracking-tight md:text-3xl">
                      {displayAnalysis.file_name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {currentStatus && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-1 font-medium",
                            currentStatus.classes
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              currentStatus.dotClasses
                            )}
                          />
                          {currentStatus.label}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/70 px-2 py-1 text-muted-foreground dark:border-white/10 dark:bg-neutral-900/70">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Created{" "}
                        {new Date(
                          displayAnalysis.created_at
                        ).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/70 px-2 py-1 text-muted-foreground dark:border-white/10 dark:bg-neutral-900/70">
                        <FileText className="h-3.5 w-3.5" />
                        {displayAnalysis.file_type.toUpperCase()}{" "}
                        {formattedFileSize}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="rounded-full px-5"
                      onClick={handleViewMockData}
                    >
                      <Eye className="h-4 w-4" />
                      View mock analysis
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full px-5"
                      onClick={handleDownloadMockAnalysis}
                    >
                      <Download className="h-4 w-4" />
                      Download mock analysis
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/70 bg-white/70 p-3 dark:border-white/10 dark:bg-neutral-900/70">
                    <p className="text-xs text-muted-foreground">Risk level</p>
                    <p className="mt-1 text-sm font-semibold capitalize">
                      {displayAnalysis.risk_level || "Not assessed"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/70 bg-white/70 p-3 dark:border-white/10 dark:bg-neutral-900/70">
                    <p className="text-xs text-muted-foreground">
                      Overall score
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {displayAnalysis.overall_score
                        ? `${displayAnalysis.overall_score.toFixed(1)}/100`
                        : "Pending"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/70 bg-white/70 p-3 dark:border-white/10 dark:bg-neutral-900/70">
                    <p className="text-xs text-muted-foreground">
                      Last updated
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {displayAnalysis.updated_at
                        ? new Date(displayAnalysis.updated_at).toLocaleString()
                        : "Not updated yet"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Banner */}
            {(displayAnalysis.status === "processing" ||
              displayAnalysis.status === "pending") && (
              <Card className="border-blue-200/80 bg-blue-50/85 backdrop-blur dark:border-blue-900/60 dark:bg-blue-950/30">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-200">
                        Analysis in progress
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your document is being analyzed. The page updates
                        automatically once results are ready.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {displayAnalysis.status === "failed" && (
              <Card className="border-red-200/80 bg-red-50/90 backdrop-blur dark:border-red-900/60 dark:bg-red-950/30">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <CircleAlert className="mt-0.5 h-4 w-4 text-red-600" />
                    <div className="space-y-2">
                      <p className="font-medium text-red-900 dark:text-red-200">
                        Analysis failed
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        The analysis encountered an error. You can retry now or
                        upload a new file from the home page.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-900 dark:text-red-200 dark:hover:bg-red-900/40"
                        onClick={handleReanalyze}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Retry now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Processing Status Updates */}
            {(displayAnalysis.status === "processing" ||
              displayAnalysis.status === "pending") && (
              <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock3 className="h-4 w-4 text-blue-500" />
                    Processing Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>File upload</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Text extraction</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AI analysis</span>
                      <span className="text-blue-600">In progress</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Score calculation</span>
                      <span className="text-muted-foreground">Pending</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Result generation</span>
                      <span className="text-muted-foreground">Pending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Tabs - full width main section */}
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
              <CardContent className="p-4 md:p-6">
                <ResultsTabs
                  analysis={displayAnalysis}
                  result={displayResult}
                  onReanalyze={handleReanalyze}
                  onDownload={handleDownload}
                />
              </CardContent>
            </Card>

            {/* Footer File Information */}
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
              <CardHeader>
                <CardTitle>File Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Document Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">File Name</span>
                        <span className="max-w-[280px] truncate font-medium">
                          {displayAnalysis.file_name}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">File Type</span>
                        <span className="font-medium">{displayAnalysis.file_type}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">File Size</span>
                        <span className="font-medium">{formattedFileSize}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium">Analysis Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium capitalize">
                          {displayAnalysis.status}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">
                          {new Date(displayAnalysis.created_at).toLocaleString()}
                        </span>
                      </div>
                      {displayAnalysis.updated_at && (
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Updated</span>
                          <span className="font-medium">
                            {new Date(displayAnalysis.updated_at).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {displayAnalysis.overall_score && (
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">
                            Overall Score
                          </span>
                          <span className="font-medium">
                            {displayAnalysis.overall_score.toFixed(1)}/100
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
