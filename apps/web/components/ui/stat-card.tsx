import { LucideIcon } from 'lucide-react';
import { Card } from './card';

const tones = {
  cyan: 'text-secondary bg-secondary/[0.12] border-secondary/20 shadow-[0_0_34px_rgba(0,212,255,0.12)]',
  violet:
    'text-primary bg-primary/[0.12] border-primary/20 shadow-[0_0_34px_rgba(109,93,254,0.12)]',
  emerald:
    'text-success bg-success/[0.12] border-success/20 shadow-[0_0_34px_rgba(87,184,70,0.12)]',
  amber: 'text-warning bg-warning/[0.12] border-warning/20 shadow-[0_0_34px_rgba(245,158,11,0.12)]',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'cyan',
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
}) {
  return (
    <Card className="group p-5">
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-mutedText">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border transition duration-300 group-hover:scale-105 ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="relative z-10 mt-4 h-1 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="h-full w-full origin-left scale-x-75 rounded-full bg-[linear-gradient(90deg,#00d4ff,#57b846)] opacity-70 transition-transform duration-500 group-hover:scale-x-100" />
      </div>
    </Card>
  );
}
