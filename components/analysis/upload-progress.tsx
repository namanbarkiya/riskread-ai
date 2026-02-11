"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle, Clock, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: "validating" | "uploading" | "processing" | "completed" | "error";
  error?: string;
  uploadSpeed?: string;
  timeRemaining?: string;
  fileSize?: string;
}

export function UploadProgress({
  fileName,
  progress,
  status,
  error,
  uploadSpeed,
  timeRemaining,
  fileSize,
}: UploadProgressProps) {
  const [showStepsMobile, setShowStepsMobile] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case "validating":
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      case "uploading":
        return <Upload className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "processing":
        return <Clock className="h-5 w-5 text-orange-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Upload className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "validating":
        return "Validating PDF content...";
      case "uploading":
        return "Uploading file...";
      case "processing":
        return "Processing document...";
      case "completed":
        return "Upload completed!";
      case "error":
        return "Upload failed";
      default:
        return "Preparing upload...";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "validating":
        return "bg-yellow-100 text-yellow-800";
      case "uploading":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case "validating":
        return "bg-yellow-500";
      case "uploading":
        return "bg-blue-500";
      case "processing":
        return "bg-orange-500";
      case "completed":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center space-x-3">
              {getStatusIcon()}
              <div className="min-w-0">
                <h3 className="font-medium text-sm truncate max-w-[11rem] sm:max-w-[18rem]">
                  {fileName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {getStatusText()}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor() + " w-fit self-start sm:self-auto"}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2"
              style={
                {
                  "--progress-color": getProgressColor().replace("bg-", ""),
                } as React.CSSProperties
              }
            />
          </div>

          {/* Upload Details */}
          {(uploadSpeed || timeRemaining || fileSize) && (
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-3">
              {fileSize && (
                <div className="text-center">
                  <p className="font-medium">File Size</p>
                  <p>{fileSize}</p>
                </div>
              )}
              {uploadSpeed && (
                <div className="text-center">
                  <p className="font-medium">Speed</p>
                  <p>{uploadSpeed}</p>
                </div>
              )}
              {timeRemaining && (
                <div className="text-center">
                  <p className="font-medium">Time Left</p>
                  <p>{timeRemaining}</p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Upload failed</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Processing Steps */}
          {(status === "processing" || status === "validating") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Processing steps
                </p>

                {/* Mobile: keep UI lighter */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs sm:hidden"
                  onClick={() => setShowStepsMobile((v) => !v)}
                >
                  {showStepsMobile ? "Hide" : "Show"}
                </Button>
              </div>

              {/* Desktop: always show */}
              <div className="hidden sm:block space-y-1">
                {status === "validating" && (
                  <>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                      <span className="break-words">
                        Validating PDF content and parsing capability
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span className="break-words">
                        File upload (pending validation)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span className="break-words">
                        Extracting document content
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span className="break-words">Analyzing with AI</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span className="break-words">
                        Generating risk assessment
                      </span>
                    </div>
                  </>
                )}
                {status === "processing" && (
                  <>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="break-words">
                        PDF validation completed
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="break-words">
                        File uploaded successfully
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <span className="break-words">
                        Extracting document content (using pdf-parse-new)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span className="break-words">Analyzing with AI</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span className="break-words">
                        Generating risk assessment
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile: show only when toggled */}
              {showStepsMobile && (
                <div className="sm:hidden space-y-1">
                  {status === "validating" && (
                    <>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        <span className="break-words">
                          Validating PDF content and parsing capability
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        <span className="break-words">
                          File upload (pending validation)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        <span className="break-words">
                          Extracting document content
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        <span className="break-words">Analyzing with AI</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        <span className="break-words">
                          Generating risk assessment
                        </span>
                      </div>
                    </>
                  )}
                  {status === "processing" && (
                    <>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="break-words">
                          PDF validation completed
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="break-words">
                          File uploaded successfully
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <span className="break-words">
                          Extracting document content (using pdf-parse-new)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        <span className="break-words">Analyzing with AI</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        <span className="break-words">
                          Generating risk assessment
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
