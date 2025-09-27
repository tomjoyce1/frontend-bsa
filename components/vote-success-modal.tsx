"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";

interface VoteSuccessModalProps {
  onClose: () => void;
}

export function VoteSuccessModal({ onClose }: VoteSuccessModalProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          </div>
          <CardTitle className="text-green-800">Vote Submitted Successfully!</CardTitle>
          <CardDescription>
            Thank you for participating in the dispute resolution process
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className={`transition-all duration-1000 delay-500 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Your vote has been recorded on the blockchain</span>
              <Sparkles className="h-4 w-4" />
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 mb-2">
                <strong>What happens next?</strong>
              </p>
              <ul className="text-xs text-green-600 space-y-1 text-left">
                <li>• Your vote is now part of the jury decision</li>
                <li>• Other eligible voters can still participate</li>
                <li>• The dispute will be resolved based on majority vote</li>
                <li>• Funds will be released to the winning party</li>
              </ul>
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}