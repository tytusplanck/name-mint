import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PremiumFeatureOverlayProps {
  children: React.ReactNode;
  accentColor?: string;
  hoverColor?: string;
  message?: string;
}

export function PremiumFeatureOverlay({
  children,
  accentColor = '#63BCA5',
  hoverColor = '#52AB94',
  message = 'Unlock advanced customization with premium features!',
}: PremiumFeatureOverlayProps) {
  const buttonStyle = {
    backgroundColor: accentColor,
    '&:hover': {
      backgroundColor: hoverColor,
    },
  };

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
        <div
          className="text-center p-4 bg-white/80 rounded-xl shadow-lg border"
          style={{ borderColor: `${accentColor}20` }}
        >
          <div
            className="rounded-full p-3 w-fit mx-auto mb-3"
            style={{ backgroundColor: `${accentColor}10` }}
          >
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Premium Features</h3>
          <p className="text-sm text-gray-600 mb-3">{message}</p>
          <Link href="/auth/signup">
            <Button style={buttonStyle}>Get Started</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
