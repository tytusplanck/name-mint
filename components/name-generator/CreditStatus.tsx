import Link from 'next/link';
import { memo } from 'react';

interface CreditStatusProps {
  isLoadingCredits: boolean;
  remainingCredits: number;
  isAuthenticated: boolean;
  accentColor?: string;
}

export const CreditStatus = memo(function CreditStatus({
  isLoadingCredits,
  remainingCredits,
  isAuthenticated,
  accentColor = '#63BCA5',
}: CreditStatusProps) {
  return (
    <div className="flex flex-col items-start sm:items-end gap-2">
      <div className="text-sm text-gray-600">
        {isLoadingCredits ? (
          <span>Loading...</span>
        ) : remainingCredits > 0 ? (
          <span>
            {remainingCredits} free generation
            {remainingCredits !== 1 ? 's' : ''} remaining
          </span>
        ) : (
          <span className="text-red-600">No generations remaining</span>
        )}
      </div>
      {!isLoadingCredits && !isAuthenticated && (
        <Link
          href="/auth/signup"
          className="text-xs hover:opacity-80 transition-opacity"
          style={{ color: accentColor }}
        >
          Create account for more credits →
        </Link>
      )}
    </div>
  );
});
