import { CheckCircle2 } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { StaggerContainer, StaggerItem } from '../ui/motion';

export function PublicFeaturePage({
  eyebrow,
  title,
  subtitle,
  highlights,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  highlights: string[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-secondary">{eyebrow}</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">{title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-300">{subtitle}</p>
      </div>
      <StaggerContainer className="mt-8 grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <StaggerItem key={item}>
            <Card>
              <CheckCircle2 className="h-5 w-5 text-success" />
              <CardHeader className="mb-0 mt-4">
                <CardTitle className="text-base">{item}</CardTitle>
                <CardDescription>
                  Thiết kế cho quy trình học nghiêm túc có mentor đồng hành.
                </CardDescription>
              </CardHeader>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
