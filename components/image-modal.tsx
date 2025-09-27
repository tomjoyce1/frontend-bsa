"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, User, Clock, Hash } from "lucide-react";

interface Evidence {
  id: string;
  uploader: string;
  url: string;
  caption: string;
  timestamp: string;
  blobId?: string;
}

interface ImageModalProps {
  evidence: Evidence;
  onClose: () => void;
}

export function ImageModal({ evidence, onClose }: ImageModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Evidence Details</CardTitle>
            <CardDescription>Full size image and metadata</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Full Size Image */}
          <div className="text-center">
            <img
              src={evidence.url}
              alt={evidence.caption}
              className="max-w-full max-h-96 object-contain rounded-lg border mx-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/preview.png';
              }}
            />
          </div>

          {/* Evidence Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Uploaded by</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {evidence.uploader}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Timestamp</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(evidence.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {evidence.blobId && (
                <div className="flex items-start gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Blob ID</p>
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      {evidence.blobId}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5" /> {/* Spacer */}
                <div>
                  <p className="text-sm font-medium">Evidence ID</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {evidence.id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Description</h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">{evidence.caption}</p>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}