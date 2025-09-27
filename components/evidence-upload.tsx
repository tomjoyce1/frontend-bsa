"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, Camera } from "lucide-react";

const SERVER_URL = "http://localhost:3002";

interface Evidence {
  id: string;
  uploader: string;
  url: string;
  caption: string;
  timestamp: string;
  blobId?: string;
}

interface EvidenceUploadProps {
  contractId: string;
  currentAccount: any;
  onEvidenceUploaded: (evidence: Evidence) => void;
}

export function EvidenceUpload({ contractId, currentAccount, onEvidenceUploaded }: EvidenceUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !caption.trim()) return;

    setUploading(true);
    try {
      // First upload the image to get blob ID
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const uploadResponse = await fetch(`${SERVER_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.ok || !uploadResult.blobId) {
        throw new Error('Failed to upload image');
      }

      // Then submit evidence with blob ID
      const evidenceResponse = await fetch(`${SERVER_URL}/contracts/${contractId}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploader: currentAccount.address,
          url: `${SERVER_URL}/image/${uploadResult.blobId}`,
          blobId: uploadResult.blobId,
          caption: caption.trim(),
          timestamp: new Date().toISOString()
        }),
      });

      if (evidenceResponse.ok) {
        const newEvidence = await evidenceResponse.json();
        onEvidenceUploaded(newEvidence);
        
        // Reset form
        setSelectedFile(null);
        setCaption("");
        
        // Reset file input
        const fileInput = document.getElementById('evidence-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading evidence:', error);
    } finally {
      setUploading(false);
    }
  };

  const isFormValid = selectedFile && caption.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Upload Evidence
        </CardTitle>
        <CardDescription>
          Upload photos and add captions to support your case
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Image</label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            {selectedFile ? (
              <div className="space-y-2">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="max-w-full h-32 object-cover rounded mx-auto"
                />
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to select an image
                </p>
              </div>
            )}
            <Input
              id="evidence-file"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mt-2"
            />
          </div>
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Caption</label>
          <Input
            placeholder="Describe what this image shows..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">
            {caption.length}/200 characters
          </p>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!isFormValid || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Uploading Evidence...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Evidence
            </>
          )}
        </Button>

        {/* Uploader Info */}
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <p><strong>Uploading as:</strong> {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}</p>
          <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}