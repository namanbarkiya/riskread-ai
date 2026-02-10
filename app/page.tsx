"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileSearch,
  GaugeCircle,
  Moon,
  ShieldCheck,
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

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen relative">
      {/* Global gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-cyan-50/30 dark:from-emerald-950/25 dark:via-teal-950/15 dark:to-cyan-950/10" />

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
        {/* Top navigation */}
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 md:px-8">
          <Logo size="lg" />
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero + primary upload */}
          <section className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 pb-12 pt-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:px-8 md:pt-16">
            {/* Hero copy */}
            <div className="flex flex-col justify-center gap-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/60 px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm backdrop-blur dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200 w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                AI-powered risk scoring in seconds
              </div>
              <div className="space-y-4">
                <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight">
                  See the <AuroraText>hidden risk</AuroraText> inside your
                  documents.
                </h1>
                <WordRotate
                  words={[
                    "Upload contracts, policies, and disclosures for instant risk scoring.",
                    "Uncover regulatory, legal, and operational risks before they become issues.",
                    "Give your team AI-assisted review without changing your workflows.",
                    "Turn dense documents into clear, prioritized risk insights.",
                    "Move from manual review to measurable, repeatable risk analysis.",
                  ]}
                  className="min-h-[2rem] text-sm font-normal text-neutral-600 dark:text-neutral-300 md:text-base"
                  duration={2200}
                />
              </div>
              <div className="grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
                <div className="rounded-xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-900/70">
                  <ShieldCheck className="mb-2 h-5 w-5 text-emerald-500" />
                  <p className="font-medium text-foreground">
                    Compliance-grade checks
                  </p>
                  <p className="mt-1 text-sm">
                    Spot gaps and inconsistencies across complex regulatory and
                    policy documents.
                  </p>
                </div>
                <div className="rounded-xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-900/70">
                  <FileSearch className="mb-2 h-5 w-5 text-teal-500" />
                  <p className="font-medium text-foreground">
                    Deep document understanding
                  </p>
                  <p className="mt-1 text-sm">
                    Gemini-powered analysis tailored for contracts, disclosures,
                    and risk reports.
                  </p>
                </div>
                <div className="rounded-xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-900/70">
                  <GaugeCircle className="mb-2 h-5 w-5 text-cyan-500" />
                  <p className="font-medium text-foreground">
                    Clear risk scoring
                  </p>
                  <p className="mt-1 text-sm">
                    Multi-dimensional scores for clarity, completeness, impact,
                    and overall risk.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload / analysis card beneath hero */}
            <div className="flex flex-col gap-4">
              <Card className="border-2 border-emerald-100/80 bg-white/80 shadow-lg shadow-emerald-100/60 backdrop-blur dark:border-emerald-900/70 dark:bg-neutral-950/80 dark:shadow-emerald-950/40">
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
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = "/sample-test-document.txt";
                        link.download = "sample-risk-assessment.txt";
                        link.click();
                      }}
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

          {/* Secondary sections */}
          <section className="border-t border-white/40 bg-white/60 py-10 text-sm backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/70 md:py-14">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:flex-row md:items-start md:px-8">
              <div className="max-w-md space-y-3">
                <h2 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
                  Designed for risk, legal, and compliance teams
                </h2>
                <p className="text-sm text-muted-foreground">
                  RiskRead AI turns dense, unstructured documents into
                  consistent, explainable risk assessments – giving you a faster
                  way to triage, review, and document decisions.
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  <li>
                    • Centralize how your organization evaluates document risk.
                  </li>
                  <li>
                    • Reduce manual review time without losing expert oversight.
                  </li>
                  <li>
                    • Create a repeatable, auditable process for document
                    analysis.
                  </li>
                </ul>
              </div>
              <div className="grid flex-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">
                    Supported file types
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>- PDF documents (.pdf)</li>
                    <li>- Word documents (.docx)</li>
                    <li>- Excel spreadsheets (.xlsx)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">
                    Processing profile
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>- Maximum file size: 10MB</li>
                    <li>- Typical processing time: 15–30 seconds</li>
                    <li>- Language: English</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-b from-transparent to-emerald-50/60 py-10 text-sm dark:to-emerald-950/40 md:py-14">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 md:px-8">
              <div className="max-w-md">
                <h2 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
                  How it works
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  A simple three-step flow designed to slot directly into your
                  existing review process.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
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
                <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
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
                <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
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
            </div>
          </section>
        </main>

        <footer className="border-t border-white/40 bg-white/70 py-4 text-xs text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 md:flex-row md:px-8">
            <p>© {currentYear} RiskRead AI. All rights reserved.</p>
            <p className="max-w-xl text-center md:text-left">
              Important: All analyses and scores are generated by AI and may be
              inaccurate, incomplete, or out of date. They are provided for
              informational purposes only and do not constitute legal,
              compliance, financial, or risk advice. Always review documents and
              decisions with appropriate human judgment.
            </p>
            <p>RiskRead AI is open-source software.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
