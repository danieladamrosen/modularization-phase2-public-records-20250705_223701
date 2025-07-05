import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Account {
  '@_SubscriberCode': string;
  '@_AccountStatusType': string;
  _CREDITOR?: {
    '@_Name': string;
  };
}

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  selectedAccount?: Account;
}

const disputeReasons = [
  'Account does not belong to me',
  'Incorrect payment history',
  'Incorrect balance amount',
  'Account should be closed',
  'Incorrect personal information',
  'Other (specify in instructions)',
];

export function DisputeModal({ isOpen, onClose, accounts, selectedAccount }: DisputeModalProps) {
  const [formData, setFormData] = useState({
    accountId: selectedAccount?.['@_AccountIdentifier'] || '',
    creditorName: selectedAccount?._CREDITOR?.['@_Name'] || '',
    disputeReason: '',
    instructions: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createDisputeMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/disputes', data);
    },
    onSuccess: () => {
      toast({
        title: 'Dispute Created',
        description:
          'Your dispute has been submitted successfully. You will receive a confirmation email shortly.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/disputes'] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create dispute',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      accountId: '',
      creditorName: '',
      disputeReason: '',
      instructions: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountId || !formData.creditorName || !formData.disputeReason) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    createDisputeMutation.mutate(formData);
  };

  const handleAccountChange = (accountId: string) => {
    const account = accounts.find((acc) => acc['@_AccountIdentifier'] === accountId);
    if (account) {
      setFormData((prev) => ({
        ...prev,
        accountId,
        creditorName: account._CREDITOR?.['@_Name'] || '',
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Create Credit Dispute
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="account" className="text-sm font-semibold text-gray-800 mb-2 block">
              Select Account to Dispute *
            </Label>
            <Select value={formData.accountId} onValueChange={handleAccountChange}>
              <SelectTrigger className="w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <SelectValue placeholder="Choose an account..." />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account, index) => (
                  <SelectItem
                    key={account['@CreditLiabilityID'] || index}
                    value={account['@_AccountIdentifier']}
                  >
                    {account._CREDITOR?.['@_Name']} - {account['@_AccountIdentifier']}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason" className="text-sm font-semibold text-gray-800 mb-2 block">
              Dispute Reason *
            </Label>
            <Select
              value={formData.disputeReason}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, disputeReason: value }))}
            >
              <SelectTrigger className="w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {disputeReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              htmlFor="instructions"
              className="text-sm font-semibold text-gray-800 mb-2 block"
            >
              Additional Instructions
            </Label>
            <Textarea
              id="instructions"
              rows={4}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="Provide detailed explanation of the dispute..."
              value={formData.instructions}
              onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-500 mt-0.5 mr-3 h-4 w-4" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-900 mb-1">Important Notice</h4>
                <p className="text-sm text-yellow-700">
                  Disputes are sent directly to credit bureaus and may take 30-45 days to process.
                  Only dispute information you believe is inaccurate.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createDisputeMutation.isPending}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:bg-gray-400"
            >
              {createDisputeMutation.isPending ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
