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
import { Search, Upload, Copy } from "lucide-react";

export function ImageHashTool() {
  const [hashInput, setHashInput] = useState("");
  const [retrievedImage, setRetrievedImage] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [generatedHashes, setGeneratedHashes] = useState<string[]>([]);

  const handleHashSearch = () => {
    if (hashInput.trim()) {
      // Return static image for demo
      setRetrievedImage("/preview.png");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(files);

    // Generate dummy hashes
    const dummyHashes = files.map(
      (_, index) => `0x${Math.random().toString(16).substr(2, 64)}`
    );
    setGeneratedHashes(dummyHashes);
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
                <Button onClick={handleHashSearch} className="gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>

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
                  className="mt-4"
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Generated Hashes:</h3>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{file.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                          {generatedHashes[index]}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(generatedHashes[index])
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
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
