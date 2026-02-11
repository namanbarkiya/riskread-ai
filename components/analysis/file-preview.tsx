"use client";

import React from "react";
import { AlertTriangle, Calendar, File, FileText, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface FilePreviewProps {
  file: File;
  onStartAnalysis: () => void;
  onRemoveFile: () => void;
  isProcessing?: boolean;
}

export function FilePreview({
  file,
  onStartAnalysis,
  onRemoveFile,
  isProcessing = false,
}: FilePreviewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return {
          type: "PDF Document",
          icon: "📄",
          color: "bg-red-100 text-red-800",
        };
      case "docx":
        return {
          type: "Word Document",
          icon: "📝",
          color: "bg-blue-100 text-blue-800",
        };
      case "xlsx":
        return {
          type: "Excel Spreadsheet",
          icon: "📊",
          color: "bg-green-100 text-green-800",
        };
      default:
        return {
          type: "Unknown",
          icon: "📁",
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "📄";
      case "docx":
        return "📝";
      case "xlsx":
        return "📊";
      default:
        return "📁";
    }
  };

  const fileType = getFileType(file.name);
  const isLargeFile = file.size > 5 * 1024 * 1024; // 5MB

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <File className="h-5 w-5" />
          <span>Document Preview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Information */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="text-4xl">{getFileIcon(file.name)}</div>
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-lg truncate">{file.name}</h3>
              <Badge variant="secondary" className={fileType.color}>
                {fileType.type}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>{formatFileSize(file.size)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(file.lastModified).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Analysis Information */}
        <div className="space-y-3">
          <h4 className="font-medium">Analysis Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Document Type: {fileType.type}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>File Size: {formatFileSize(file.size)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>Analysis Type: Risk Assessment</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>Estimated Time: 15-30 seconds</span>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {isLargeFile && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Large file detected</p>
                <p>This file may take longer to process. Please be patient.</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onRemoveFile}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            Remove File
          </Button>
          <Button
            onClick={onStartAnalysis}
            disabled={isProcessing}
            className="w-full sm:w-auto sm:min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Start Analysis"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
