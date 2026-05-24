"use client";

import { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileVideo, ImageIcon } from "lucide-react";

interface FileUploadProps {
  storagePath: string;
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  storagePath,
  onUploadComplete,
  accept = "image/*,video/*",
  maxSizeMB = 10,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File must be under ${maxSizeMB}MB`);
      return;
    }

    setFileName(file.name);
    setIsVideo(file.type.startsWith("video/"));

    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }

    setUploading(true);
    const timestamp = Date.now();
    const storageRef = ref(storage, `${storagePath}/${timestamp}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },
      (error) => {
        console.error("Upload error:", error);
        setUploading(false);
        setProgress(0);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setUploading(false);
        onUploadComplete(url);
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setPreviewUrl(null);
    setFileName(null);
    setProgress(0);
    setIsVideo(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {!fileName ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-input rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <Upload className="mx-auto mb-2 text-muted-foreground" size={24} />
          <p className="text-sm text-muted-foreground">
            Click or drag file to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max {maxSizeMB}MB
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 border border-input rounded-md bg-muted/30">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded" />
          ) : isVideo ? (
            <FileVideo size={40} className="text-muted-foreground" />
          ) : (
            <ImageIcon size={40} className="text-muted-foreground" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{fileName}</p>
            {uploading && <Progress value={progress} className="mt-1 h-2" />}
            {!uploading && progress === 100 && (
              <p className="text-xs text-green-400 mt-1">Uploaded</p>
            )}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            <X size={16} />
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
