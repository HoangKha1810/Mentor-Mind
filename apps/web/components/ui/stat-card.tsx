import { LucideIcon } from 'lucide-react';
import { Card } from './card';

const tones = {
  cyan: 'text-secondary bg-secondary/10',
  violet: 'text-primary bg-primary/10',
  emerald: 'text-success bg-success/10',
  amber: 'text-warning bg-warning/10',
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
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-mutedText">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-md ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
