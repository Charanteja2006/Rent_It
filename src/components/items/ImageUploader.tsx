"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
}

export function ImageUploader({ onUploadComplete, currentImageUrl }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((selectedFile: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(10);

    try {
      // Step 1: Get signed URL
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to get upload URL");

      setProgress(30);

      const { signedUrl, publicUrl, token } = json.data;

      // Step 2: PUT file directly to Supabase Storage
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "x-upsert": "true",
          Authorization: `Bearer ${token}`,
        },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      setProgress(100);
      onUploadComplete(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFile(null);
    setProgress(0);
    onUploadComplete("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
          role="button"
          aria-label="Upload image drop zone"
          id="image-upload-dropzone"
        >
          <div className="p-4 rounded-full bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">
              <span className="text-primary">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPEG, PNG, WebP — max 5 MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            id="image-file-input"
          />
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-border">
          <div className="relative h-56">
            <Image src={preview} alt="Preview" fill className="object-cover" sizes="600px" />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload progress & button */}
      {file && !uploading && (
        <button
          type="button"
          onClick={handleUpload}
          id="upload-confirm-btn"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl gradient-brand text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Upload className="h-4 w-4" />
          Confirm Upload
        </button>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading... {progress}%
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full gradient-brand transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
