"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileImage, User, Clock } from "lucide-react";

interface Evidence {
  id: string;
  uploader: string;
  url: string;
  caption: string;
  timestamp: string;
  blobId?: string;
}

interface EvidenceListProps {
  evidence: Evidence[];
}

export function EvidenceList({ evidence }: EvidenceListProps) {
  const sortedEvidence = [...evidence].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Evidence ({evidence.length})
        </CardTitle>
        <CardDescription>
          All evidence uploaded by both parties, sorted by most recent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedEvidence.map((item, index) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-3">
              {/* Evidence Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {item.uploader.slice(0, 8)}...{item.uploader.slice(-6)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Evidence #{evidence.length - index}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>

              {/* Image and Caption */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <img
                    src={item.url}
                    alt={item.caption}
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/preview.png'; // Fallback image
                    }}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description:</h4>
                    <p className="text-sm text-muted-foreground">{item.caption}</p>
                  </div>
                  {item.blobId && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Blob ID:</h4>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {item.blobId}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {/* Audit Trail */}
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                Evidence appended by {item.uploader.slice(0, 6)}...{item.uploader.slice(-4)} on{' '}
                {new Date(item.timestamp).toLocaleDateString()} at{' '}
                {new Date(item.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}

          {evidence.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No evidence uploaded yet</p>
              <p className="text-sm">Both parties can upload images to support their case</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}