"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileSearch,
  FileText,
  GaugeCircle,
  Github,
  Moon,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { FilePreview } from "@/components/analysis/file-preview";
import { FileUpload } from "@/components/analysis/file-upload";
import { UploadProgress } from "@/components/analysis/upload-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { AuroraText } from "@/components/ui/magicui/aurora-text";
import { WordRotate } from "@/components/ui/magicui/word-rotate";
import { Separator } from "@/components/ui/separator";
import { useDarkMode } from "@/lib/hooks/use-dark-mode";
import { useFileUpload } from "@/lib/hooks/use-file-upload";
import { useCreateAnalysis } from "@/lib/query/hooks/analysis";
import { cn } from "@/lib/utils";
import {
  type CachedAnalysis,
  getLatestCachedAnalysis,
} from "@/lib/utils/analysis-cache";

export default function HomePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentAnalysis, setRecentAnalysis] = useState<CachedAnalysis | null>(
    null
  );
  const [isDark, toggleDark] = useDarkMode();

  const { uploadState, validateAndUpload, resetUpload } = useFileUpload();
  const createAnalysisMutation = useCreateAnalysis();

  // Load recent analysis from localStorage (if any)
  useEffect(() => {
    const cached = getLatestCachedAnalysis();
    if (cached) {
      setRecentAnalysis(cached);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    resetUpload();
  };

  const handleUploadStart = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      // Upload and validate file
      const uploadResult = await validateAndUpload(selectedFile);

      if (!uploadResult.success) {
        toast.error(uploadResult.error || "Upload failed");
        setIsProcessing(false);
        if (
          uploadResult.error?.includes("PDF parsing failed") ||
          uploadResult.error?.includes("failed to parse")
        ) {
          setSelectedFile(null);
        }
        return;
      }

      const currentFileName = selectedFile.name;
      const currentFileType = selectedFile.type;
      const currentFileSize = selectedFile.size;

      // Remove file when analysis starts
      setSelectedFile(null);

      // Create analysis
      createAnalysisMutation.mutate(
        {
          file_name: currentFileName,
          file_type: currentFileType as "pdf" | "docx" | "xlsx",
          file_size: currentFileSize,
          file_url: uploadResult.fileUrl!,
        },
        {
          onSuccess: (data: any) => {
            const id = data.id || data.analysisId;
            toast.success("Analysis started successfully!");
            // Directly navigate to the analysis page
            router.push(`/analysis/${id}`);
          },
          onError: () => {
            toast.error("Analysis creation failed");
            setIsProcessing(false);
          },
        }
      );
    } catch (error) {
      console.error("Error starting analysis:", error);
      toast.error("Failed to start analysis");
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    resetUpload();
  };

  const downloadSampleDocument = () => {
    const link = document.createElement("a");
    link.href = "/sample-test-document.txt";
    link.download = "sample-risk-assessment.txt";
    link.click();
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen relative">
      {/* Global gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-cyan-50/30 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/10" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_50%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_45%)]" />

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
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 md:px-8 md:pt-8">
          <Logo size="lg" className="shrink-0" />
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/50 bg-white/65 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-900/60 md:flex">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              AI-first legal & risk review
            </div>
            <a
              href="https://github.com/namanbarkiya/readrisk-ai"
              target="_blank"
              rel="noreferrer"
              aria-label="View RiskRead AI on GitHub"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/75 text-neutral-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-100"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <section className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 pb-12 pt-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:px-8 md:pt-14">
            <div className="flex flex-col justify-center gap-7">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm backdrop-blur dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                AI risk detection in under a minute
              </div>
              <div className="space-y-5">
                <h1 className="max-w-2xl text-balance text-3xl font-bold leading-tight tracking-tight md:text-5xl">
                  Transform dense documents into{" "}
                  <AuroraText>clear risk actions</AuroraText>.
                </h1>
                <WordRotate
                  words={[
                    "Upload contracts, policies, and disclosures for instant prioritization.",
                    "Catch legal and compliance risks before review bottlenecks happen.",
                    "Move from gut feel to structured, repeatable risk scoring in every review.",
                    "Give legal and risk teams explainable insights.",
                  ]}
                  className="min-h-[2rem] max-w-xl text-sm font-normal text-neutral-600 dark:text-neutral-300 md:text-base"
                  duration={2200}
                />
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  Compliance-grade checks with explainable output
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  Supports PDF, DOCX, and XLSX up to 10MB
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  Typical turnaround time of 15-30 seconds
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  Built for risk, legal, and compliance teams
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  className="h-9 rounded-full px-4"
                  onClick={() => {
                    document.getElementById("start-analysis")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  Start a free analysis
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full px-4"
                  onClick={downloadSampleDocument}
                >
                  Download sample document
                </Button>
              </div>
            </div>

            <div id="start-analysis" className="flex flex-col gap-4">
              <Card className="border-2 border-emerald-100/80 bg-white/85 shadow-lg shadow-emerald-100/60 backdrop-blur dark:border-emerald-900/70 dark:bg-neutral-950/80 dark:shadow-emerald-950/40">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm font-semibold">
                    <span>
                      {isProcessing
                        ? "Running analysis"
                        : selectedFile
                          ? "Review & start analysis"
                          : "Upload a document to get started"}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-200">
                      ~30s result
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!selectedFile && !isProcessing && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Drag & drop a file or click to browse. We&apos;ll
                        validate, upload, and prepare it for AI analysis.
                      </p>
                      <FileUpload
                        onFileSelect={handleFileSelect}
                        onUploadStart={() => {}}
                        onUploadComplete={() => {}}
                        onUploadError={(error) => toast.error(error)}
                        isUploading={false}
                        uploadProgress={0}
                      />
                    </div>
                  )}

                  {selectedFile && !isProcessing && (
                    <FilePreview
                      file={selectedFile}
                      onStartAnalysis={handleUploadStart}
                      onRemoveFile={handleRemoveFile}
                      isProcessing={false}
                    />
                  )}

                  {isProcessing && (
                    <UploadProgress
                      fileName={selectedFile?.name || ""}
                      progress={uploadState.progress}
                      status={
                        uploadState.isValidating
                          ? "validating"
                          : uploadState.isUploading
                            ? "uploading"
                            : "processing"
                      }
                      error={uploadState.error || undefined}
                      uploadSpeed={uploadState.uploadSpeed}
                      timeRemaining={uploadState.timeRemaining}
                      fileSize={
                        selectedFile
                          ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                          : undefined
                      }
                    />
                  )}

                  <Separator />

                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        Supported formats
                      </span>
                      <span>PDF, DOCX, XLSX • up to 10MB</span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-full"
                      onClick={downloadSampleDocument}
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {recentAnalysis && (
                <Card className="border-emerald-100/80 bg-white/80 backdrop-blur dark:border-emerald-900/60 dark:bg-neutral-950/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Continue where you left off
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 text-xs">
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex items-center justify-between gap-3">
                        <span>File</span>
                        <span className="truncate font-medium text-foreground">
                          {recentAnalysis.analysis.file_name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Last analyzed</span>
                        <span className="font-medium text-foreground">
                          {new Date(
                            recentAnalysis.analysis.created_at
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() =>
                          router.push(`/analysis/${recentAnalysis.analysis.id}`)
                        }
                      >
                        View analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          <section className="border-y border-white/40 bg-white/65 py-8 text-sm backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/70">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between md:px-8">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Built for modern document risk operations
              </div>
              <div className="grid gap-3 text-xs sm:grid-cols-3 sm:text-sm">
                <div className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-center dark:border-white/10 dark:bg-neutral-900/70">
                  Legal review teams
                </div>
                <div className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-center dark:border-white/10 dark:bg-neutral-900/70">
                  Compliance programs
                </div>
                <div className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-center dark:border-white/10 dark:bg-neutral-900/70">
                  Risk & audit functions
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-b from-transparent to-emerald-50/55 py-12 text-sm dark:to-emerald-950/35 md:py-16">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:px-8">
              <div className="max-w-2xl space-y-3">
                <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                  Why teams switch to RiskRead AI
                </h2>
                <p className="text-sm text-muted-foreground md:text-base">
                  Create a repeatable process for document review with clear
                  risk drivers, confidence signals, and auditable summaries.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
                  <ShieldCheck className="mb-3 h-5 w-5 text-emerald-500" />
                  <p className="text-sm font-semibold text-foreground md:text-base">
                    Consistent assessments
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Evaluate each document against the same scoring logic,
                    reducing reviewer variance across teams.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
                  <FileSearch className="mb-3 h-5 w-5 text-teal-500" />
                  <p className="text-sm font-semibold text-foreground md:text-base">
                    Deeper issue discovery
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Surface hidden obligations, ambiguous language, and critical
                    omissions that manual skim passes miss.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
                  <GaugeCircle className="mb-3 h-5 w-5 text-cyan-500" />
                  <p className="text-sm font-semibold text-foreground md:text-base">
                    Faster decisions
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Triage what needs expert attention first, while still
                    keeping a full audit trail of AI output.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-12 text-sm md:py-16">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 md:px-8">
              <div className="max-w-md">
                <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                  How it works
                </h2>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">
                  A focused three-step flow designed to fit into existing review
                  processes.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    1. Upload
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Drop in your document
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload a contract, policy, disclosure, or procedural
                    document directly from your desktop.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    2. Analyze
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Let the AI read deeply
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    RiskRead AI parses structure, language, and context to
                    surface potential risks and gaps.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    3. Act
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Triage and document decisions
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Use scores and explanations to prioritize review, add
                    commentary, and share outcomes with stakeholders.
                  </p>
                </div>
              </div>
              <Card className="border border-white/70 bg-white/80 shadow-sm dark:border-white/10 dark:bg-neutral-950/80">
                <CardContent className="grid gap-4 p-5 md:grid-cols-3 md:gap-3">
                  <div className="flex items-center gap-3 rounded-xl border border-white/60 bg-white/70 p-3 dark:border-white/10 dark:bg-neutral-900/70">
                    <Clock3 className="h-4 w-4 text-emerald-500" />
                    <div className="text-xs text-muted-foreground">
                      Typical run time
                      <p className="text-sm font-medium text-foreground">
                        15-30 seconds
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-white/60 bg-white/70 p-3 dark:border-white/10 dark:bg-neutral-900/70">
                    <FileText className="h-4 w-4 text-teal-500" />
                    <div className="text-xs text-muted-foreground">
                      Supported files
                      <p className="text-sm font-medium text-foreground">
                        PDF, DOCX, XLSX
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-white/60 bg-white/70 p-3 dark:border-white/10 dark:bg-neutral-900/70">
                    <GaugeCircle className="h-4 w-4 text-cyan-500" />
                    <div className="text-xs text-muted-foreground">
                      Output profile
                      <p className="text-sm font-medium text-foreground">
                        Explainable risk scoring
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/40 bg-white/80 py-6 text-xs text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-neutral-950/85">
          <div className="mx-auto w-full max-w-6xl space-y-4 px-4 md:space-y-3 md:px-8">
            <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
              <div className="space-y-1 text-center md:text-left">
                <p className="font-medium text-foreground">
                  © {currentYear} RiskRead AI. All rights reserved.
                </p>
                <p>RiskRead AI is open-source software.</p>
              </div>

              <div className="space-y-1 text-center md:text-right">
                <p className="text-foreground">
                  Made by{" "}
                  <a
                    href="https://github.com/namanbarkiya"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    Naman Barkiya
                  </a>
                </p>
                <p>
                  Contribute on{" "}
                  <a
                    href="https://github.com/namanbarkiya/readrisk-ai"
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-2 hover:underline"
                  >
                    github.com/namanbarkiya/readrisk-ai
                  </a>
                </p>
              </div>
            </div>

            <div className="border-t border-white/50 pt-3 text-[11px] leading-relaxed text-center md:text-left dark:border-white/10">
              <p className="font-medium text-foreground">Important notice</p>
              <p>
                All analyses and scores are generated by AI and may be
                inaccurate, incomplete, or out of date. They are provided for
                informational purposes only and do not constitute legal,
                compliance, financial, or risk advice. Always review documents
                and decisions with appropriate human judgment.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
