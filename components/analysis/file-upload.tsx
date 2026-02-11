"use client";

import { useDropzone } from "react-dropzone";
import React, { useCallback, useState } from "react";
import { AlertCircle, CheckCircle, File, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/cn";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUploadStart: () => void;
  onUploadComplete: (fileUrl: string) => void;
  onUploadError: (error: string) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
}

export function FileUpload({
  onFileSelect,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  isUploading = false,
  uploadProgress = 0,
  acceptedFileTypes = [".pdf", ".docx", ".xlsx", ".txt"],
  maxFileSize = 10 * 1024 * 1024, // 10MB
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === "file-too-large") {
          onUploadError("File size exceeds the maximum limit of 10MB");
        } else if (error.code === "file-invalid-type") {
          onUploadError(
            "File type not supported. Please upload PDF, DOCX, XLSX, or TXT files."
          );
        } else {
          onUploadError("File upload failed. Please try again.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "text/plain": [".txt"],
    },
    maxSize: maxFileSize,
    multiple: false,
  });

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

  return (
    <div className="w-full space-y-4">
      {!selectedFile ? (
        <Card
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed p-6 sm:p-8 text-center transition-colors cursor-pointer hover:border-primary/50",
            isDragActive && "border-primary bg-primary/5",
            dragActive && "border-primary bg-primary/5"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {isDragActive ? "Drop your file here" : "Upload a document"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop your file here, or click to browse
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Supported formats: PDF, DOCX, XLSX</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{getFileIcon(selectedFile.name)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-muted-foreground">
                    Uploading...
                  </span>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {isUploading && (
            <div className="mt-3 space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {uploadProgress}% complete
              </p>
            </div>
          )}
        </Card>
      )}

      {selectedFile && !isUploading && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={handleRemoveFile}
            className="w-full sm:w-auto"
          >
            Remove File
          </Button>
          <Button
            onClick={onUploadStart}
            disabled={!selectedFile}
            className="w-full sm:w-auto"
          >
            Start Analysis
          </Button>
        </div>
      )}
    </div>
  );
}
