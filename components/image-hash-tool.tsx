"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Upload, Copy, Loader2 } from "lucide-react";

const SERVER_URL = "http://localhost:3002";

export function ImageHashTool() {
  const [hashInput, setHashInput] = useState("");
  const [retrievedImage, setRetrievedImage] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<
    { file: File; blobId: string; mimeType: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleHashSearch = async () => {
    if (!hashInput.trim()) return;

    setSearchLoading(true);
    setError(null);
    setRetrievedImage(null);
    
    try {
      const response = await fetch(`${SERVER_URL}/image/${hashInput.trim()}`);
      
      if (!response.ok) {
        throw new Error(`Image not found (${response.status})`);
      }
      
      const imageUrl = `${SERVER_URL}/image/${hashInput.trim()}`;
      setRetrievedImage(imageUrl);
    } catch (error) {
      console.error("Error retrieving image:", error);
      setError(error instanceof Error ? error.message : "Failed to retrieve image");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setLoading(true);
    const uploadResults = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${SERVER_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (result.ok && result.blobId) {
          uploadResults.push({
            file,
            blobId: result.blobId,
            mimeType: result.mimeType,
          });
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }

    setUploadedFiles(uploadResults);
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-4xl">
      <Tabs defaultValue="retrieve" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="retrieve">Retrieve Image</TabsTrigger>
          <TabsTrigger value="upload">Upload Images</TabsTrigger>
        </TabsList>

        <TabsContent value="retrieve" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Search className="h-5 w-5" />
                Retrieve Image by Hash
              </CardTitle>
              <CardDescription>
                Enter a hash to retrieve the corresponding image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter hash (e.g., 0x1234...)"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleHashSearch}
                  disabled={searchLoading}
                  className="gap-2"
                >
                  {searchLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {retrievedImage && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Retrieved Image:
                  </h3>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <img
                      src={retrievedImage}
                      alt="Retrieved"
                      className="max-w-full h-auto rounded-lg mx-auto"
                      style={{ maxHeight: "400px" }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Images for Hashing
              </CardTitle>
              <CardDescription>
                Upload one or more images to generate their hash values
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="mt-4"
                />
                {loading && (
                  <div className="flex items-center gap-2 mt-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                )}
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Upload Results:</h3>
                  {uploadedFiles.map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.file.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {(item.file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={URL.createObjectURL(item.file)}
                            alt={item.file.name}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-medium">Blob ID:</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                              {item.blobId}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(item.blobId)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
