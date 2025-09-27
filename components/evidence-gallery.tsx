"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageModal } from "./image-modal";
import { FileImage, User, Clock, Eye } from "lucide-react";

interface Evidence {
  id: string;
  uploader: string;
  url: string;
  caption: string;
  timestamp: string;
  blobId?: string;
}

interface EvidenceGalleryProps {
  evidence: Evidence[];
}

export function EvidenceGallery({ evidence }: EvidenceGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Evidence | null>(null);

  const sortedEvidence = [...evidence].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const tenantEvidence = sortedEvidence.filter(e => e.uploader.includes('tenant') || e.uploader.includes('T'));
  const landlordEvidence = sortedEvidence.filter(e => e.uploader.includes('landlord') || e.uploader.includes('L'));
  const otherEvidence = sortedEvidence.filter(e => !tenantEvidence.includes(e) && !landlordEvidence.includes(e));

  const renderEvidenceGrid = (evidenceList: Evidence[], title: string, badgeVariant: "default" | "secondary" | "outline") => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant={badgeVariant}>{evidenceList.length}</Badge>
      </div>
      
      {evidenceList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileImage className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No evidence submitted</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evidenceList.map((item, index) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(item)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/preview.png';
                  }}
                />
                <Button
                  size="sm"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                  onClick={() => setSelectedImage(item)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
              
              <CardContent className="p-3 space-y-2">
                <p className="text-sm font-medium line-clamp-2">{item.caption}</p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.uploader.slice(0, 6)}...{item.uploader.slice(-4)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Evidence Gallery ({evidence.length} items)
          </CardTitle>
          <CardDescription>
            Review all evidence submitted by both parties. Click any image to view full size.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Tenant Evidence */}
          {renderEvidenceGrid(tenantEvidence, "Tenant Evidence", "default")}
          
          {/* Landlord Evidence */}
          {renderEvidenceGrid(landlordEvidence, "Landlord Evidence", "secondary")}
          
          {/* Other Evidence */}
          {otherEvidence.length > 0 && renderEvidenceGrid(otherEvidence, "Other Evidence", "outline")}
          
          {evidence.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileImage className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Evidence Submitted</p>
              <p>Neither party has uploaded evidence for this dispute</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Image Modal */}
      {selectedImage && (
        <ImageModal
          evidence={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}