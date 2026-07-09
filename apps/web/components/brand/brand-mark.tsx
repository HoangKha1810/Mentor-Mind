import Image from 'next/image';
import { cn } from '@/lib/utils';

export function BrandMark({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <span
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full bg-white shadow-[0_10px_24px_rgba(0,212,255,0.18)] ring-1 ring-white/20',
        className,
      )}
    >
      <Image
        src="/brand/mentormind-icon-192.png"
        alt="MentorMind"
        fill
        sizes="48px"
        priority={priority}
        className="object-cover"
      />
    </span>
  );
}
