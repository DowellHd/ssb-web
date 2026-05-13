'use client';

import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  benefits?: string[];
}

export function UpgradeModal({
  open,
  onClose,
  title = 'Upgrade to unlock more',
  description = 'You have reached the limit on your current plan.',
  benefits = [
    'Unlimited backtests per month',
    'Up to 5-year date ranges',
    'Priority execution',
  ],
}: UpgradeModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push('/app/billing');
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-full bg-purple-100">
              <Zap className="h-4 w-4 text-purple-600" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {benefits.length > 0 && (
          <ul className="space-y-1.5 my-1">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Not now</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUpgrade}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            View Plans
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
