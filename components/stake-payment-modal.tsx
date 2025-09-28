"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Shield, DollarSign, AlertTriangle, Loader2 } from "lucide-react";

interface StakePaymentModalProps {
  voteFor: 'tenant' | 'landlord' | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export function StakePaymentModal({ voteFor, onConfirm, onCancel, loading }: StakePaymentModalProps) {
  const stakeAmount = "10";
  const currency = "SUI";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Stake Required
            </CardTitle>
            <CardDescription>
              Pay stake to confirm your vote
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Vote Summary */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">You are voting for:</p>
            <Badge variant={voteFor === 'tenant' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              {voteFor === 'tenant' ? 'Tenant' : 'Landlord'}
            </Badge>
          </div>

          {/* Stake Amount */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <div className="text-center">
                  <p className="text-sm text-blue-700">Stake Amount</p>
                  <p className="text-2xl font-bold text-blue-800">{stakeAmount} {currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 mb-1">Stake Requirements</p>
              <ul className="text-yellow-700 space-y-1">
                <li>• Your stake will be locked until dispute resolution</li>
                <li>• If majority agrees with you, stake is returned + reward</li>
                <li>• If majority disagrees, you lose your stake</li>
                <li>• This prevents frivolous voting</li>
              </ul>
            </div>
          </div>

          {/* Stake Details Box */}
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-medium text-center">Stake Transaction Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">{stakeAmount} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purpose:</span>
                  <span className="font-medium">Jury Vote Stake</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vote:</span>
                  <span className="font-medium capitalize">{voteFor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lock Period:</span>
                  <span className="font-medium">Until Resolution</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} disabled={loading} className="flex-1">
              Cancel Vote
            </Button>
            <Button onClick={onConfirm} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Pay Stake & Vote
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By proceeding, you agree to the staking terms and conditions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}