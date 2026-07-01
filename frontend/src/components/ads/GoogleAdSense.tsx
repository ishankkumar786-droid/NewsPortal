'use client';

import { useEffect } from 'react';

// Google AdSense slot positions — hardcoded, admin cannot modify
const ADSENSE_CONFIG = {
  HOME_TOP_ADSENSE: {
    'data-ad-client': 'ca-pub-3532106792157988',
    'data-ad-slot': '1234567890',
    'data-ad-format': 'auto',
    style: { display: 'block' },
    label: 'Advertisement',
  },
  HOME_MIDDLE_ADSENSE: {
    'data-ad-client': 'ca-pub-3532106792157988',
    'data-ad-slot': '0987654321',
    'data-ad-format': 'auto',
    style: { display: 'block' },
    label: 'Advertisement',
  },
  ARTICLE_MIDDLE_ADSENSE: {
    'data-ad-client': 'ca-pub-3532106792157988',
    'data-ad-slot': '1122334455',
    'data-ad-format': 'auto',
    style: { display: 'block', textAlign: 'center' as const },
    label: 'Advertisement',
  },
  SIDEBAR_ADSENSE: {
    'data-ad-client': 'ca-pub-3532106792157988',
    'data-ad-slot': '5544332211',
    'data-ad-format': 'auto',
    style: { display: 'block' },
    label: 'Advertisement',
  },
  FOOTER_ADSENSE: {
    'data-ad-client': 'ca-pub-3532106792157988',
    'data-ad-slot': '9988776655',
    'data-ad-format': 'auto',
    style: { display: 'block' },
    label: 'Advertisement',
  },
} as const;

type AdSenseSlot = keyof typeof ADSENSE_CONFIG;

interface GoogleAdSenseProps {
  slot: AdSenseSlot;
  className?: string;
}

export function GoogleAdSense({ slot, className = '' }: GoogleAdSenseProps) {
  const config = ADSENSE_CONFIG[slot];

  useEffect(() => {
    // Push to AdSense queue
    try {
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  if (process.env.NODE_ENV !== 'production') {
    // Show placeholder in development
    return (
      <div
        className={`bg-muted border border-dashed border-border rounded flex items-center justify-center text-xs text-muted-foreground py-4 ${className}`}
        aria-hidden="true"
      >
        <span>AdSense: {slot}</span>
      </div>
    );
  }

  return (
    <div className={className} aria-label={config.label}>
      <ins
        className="adsbygoogle"
        style={config.style}
        data-ad-client={config['data-ad-client']}
        data-ad-slot={config['data-ad-slot']}
        data-ad-format={config['data-ad-format']}
        data-full-width-responsive="true"
      />
    </div>
  );
}
