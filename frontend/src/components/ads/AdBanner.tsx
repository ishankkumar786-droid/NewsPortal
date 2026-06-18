'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Advertisement, AdSlot } from '@/types';

interface AdBannerProps {
  slot: AdSlot;
  className?: string;
}

export function AdBanner({ slot, className = '' }: AdBannerProps) {
  const clickedRef = useRef(false);

  const { data: ad } = useQuery({
    queryKey: ['ad', slot],
    queryFn: async () => {
      const res = await api.get<{ data: { advertisement: Advertisement | null } }>(
        `/advertisements/slot/${slot}`
      );
      return res.data.data?.advertisement || null;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Track impression when ad is shown
  useEffect(() => {
    if (ad?._id) {
      api.post(`/advertisements/${ad._id}/impression`).catch(() => {});
    }
  }, [ad?._id]);

  if (!ad) return null;

  const handleClick = () => {
    if (!clickedRef.current && ad._id) {
      clickedRef.current = true;
      api.post(`/advertisements/${ad._id}/click`).catch(() => {});
    }
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <a
        href={ad.targetUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        onClick={handleClick}
        aria-label={`Advertisement: ${ad.title}`}
        className="block relative overflow-hidden rounded-lg border hover:opacity-95 transition-opacity"
      >
        <span className="absolute top-1 right-1 bg-black/50 text-white text-[9px] px-1 rounded z-10">
          Ad
        </span>
        <Image
          src={ad.image.url}
          alt={ad.image.alt || ad.title}
          width={728}
          height={90}
          className="max-w-full h-auto"
          loading="lazy"
        />
      </a>
    </div>
  );
}
