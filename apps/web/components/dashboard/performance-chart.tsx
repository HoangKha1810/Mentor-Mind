'use client';

import { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeSubmission, InterviewSession } from '@/lib/domain-types';
import { motionDuration } from '@/lib/motion-system';
import { cn } from '@/lib/utils';

const WEEK_COUNT = 8;
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const HO_CHI_MINH_OFFSET_MS = 7 * 60 * 60 * 1000;

type PerformancePoint = {
  key: number;
  label: string;
  attempts: number;
  accepted: number;
  interviewScore: number | null;
};

type MutablePerformancePoint = PerformancePoint & {
  interviewScoreTotal: number;
  interviewScoreCount: number;
};

function startOfWeekTimestamp(timestamp: number) {
  const localDate = new Date(timestamp + HO_CHI_MINH_OFFSET_MS);
  const daysSinceMonday = (localDate.getUTCDay() + 6) % 7;
  return (
    Date.UTC(
      localDate.getUTCFullYear(),
      localDate.getUTCMonth(),
      localDate.getUTCDate() - daysSinceMonday,
    ) - HO_CHI_MINH_OFFSET_MS
  );
}

function weekLabel(value: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(value);
}

function validTimestamp(value?: string | null) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function buildPerformanceSeries(
  submissions: CodeSubmission[],
  interviews: InterviewSession[],
): PerformancePoint[] {
  const currentWeek = startOfWeekTimestamp(Date.now());
  const buckets: MutablePerformancePoint[] = Array.from({ length: WEEK_COUNT }, (_, index) => {
    const start = new Date(currentWeek - (WEEK_COUNT - index - 1) * WEEK_IN_MS);
    return {
      key: start.getTime(),
      label: weekLabel(start),
      attempts: 0,
      accepted: 0,
      interviewScore: null,
      interviewScoreTotal: 0,
      interviewScoreCount: 0,
    };
  });
  const bucketsByWeek = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  submissions.forEach((submission) => {
    const timestamp = validTimestamp(submission.createdAt);
    if (timestamp === null) return;
    const bucket = bucketsByWeek.get(startOfWeekTimestamp(timestamp));
    if (!bucket) return;
    bucket.attempts += 1;
    if (submission.verdict === 'ACCEPTED') bucket.accepted += 1;
  });

  interviews.forEach((session) => {
    if (typeof session.overallScore !== 'number') return;
    const timestamp = validTimestamp(session.completedAt) ?? validTimestamp(session.createdAt);
    if (timestamp === null) return;
    const bucket = bucketsByWeek.get(startOfWeekTimestamp(timestamp));
    if (!bucket) return;
    bucket.interviewScoreTotal += session.overallScore;
    bucket.interviewScoreCount += 1;
  });

  return buckets.map(({ interviewScoreTotal, interviewScoreCount, ...bucket }) => ({
    ...bucket,
    interviewScore:
      interviewScoreCount > 0
        ? Number((interviewScoreTotal / interviewScoreCount).toFixed(1))
        : null,
  }));
}

export function PerformanceChart({
  submissions,
  interviews,
  className,
}: {
  submissions: CodeSubmission[];
  interviews: InterviewSession[];
  className?: string;
}) {
  const reduceMotion = Boolean(useReducedMotion());
  const data = useMemo(
    () => buildPerformanceSeries(submissions, interviews),
    [interviews, submissions],
  );
  const hasCodeActivity = data.some((point) => point.attempts > 0);
  const hasInterviewActivity = data.some((point) => point.interviewScore !== null);
  const hasActivity = hasCodeActivity || hasInterviewActivity;

  return (
    <Card reveal className={cn('min-w-0', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0">
          <CardTitle>Hiệu suất học tập</CardTitle>
          <CardDescription>
            8 tuần gần đây từ lịch sử nộp code và các phiên phỏng vấn đã có điểm.
          </CardDescription>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10 text-secondary">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
        </span>
      </CardHeader>

      {hasActivity ? (
        <>
          <div
            className="h-[18rem] min-w-0 w-full sm:h-80"
            role="img"
            aria-label="Biểu đồ hiệu suất học tập trong 8 tuần gần đây"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 12, right: 4, bottom: 0, left: -18 }}>
                <CartesianGrid
                  vertical={false}
                  stroke="rgb(var(--color-foreground) / 0.08)"
                  strokeDasharray="4 6"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={10}
                  tick={{ fill: 'rgb(var(--color-muted-text))', fontSize: 11 }}
                />
                {hasCodeActivity ? (
                  <YAxis
                    yAxisId="activity"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    width={34}
                    tick={{ fill: 'rgb(var(--color-muted-text))', fontSize: 11 }}
                  />
                ) : null}
                {hasInterviewActivity ? (
                  <YAxis
                    yAxisId="score"
                    orientation="right"
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                    tick={{ fill: 'rgb(var(--color-muted-text))', fontSize: 11 }}
                  />
                ) : null}
                <Tooltip
                  isAnimationActive={!reduceMotion}
                  cursor={{ fill: 'rgb(var(--color-secondary) / 0.06)' }}
                  contentStyle={{
                    border: '1px solid rgb(var(--color-foreground) / 0.12)',
                    borderRadius: '8px',
                    background: 'rgb(var(--color-surface) / 0.98)',
                    color: 'rgb(var(--color-foreground))',
                    boxShadow: '0 16px 40px rgb(2 8 23 / 0.28)',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'rgb(var(--color-foreground))', fontWeight: 600 }}
                  formatter={(value, name) => [
                    name === 'Điểm phỏng vấn TB' ? Number(value).toFixed(1) : String(value),
                    name,
                  ]}
                />
                <Legend
                  iconSize={9}
                  wrapperStyle={{
                    color: 'rgb(var(--color-muted-text))',
                    fontSize: '12px',
                    paddingTop: '10px',
                  }}
                />
                {hasCodeActivity ? (
                  <Bar
                    yAxisId="activity"
                    dataKey="attempts"
                    name="Lượt nộp"
                    fill="rgb(var(--color-secondary) / 0.32)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                    isAnimationActive={!reduceMotion}
                    animationDuration={motionDuration.reveal * 1000}
                  />
                ) : null}
                {hasCodeActivity ? (
                  <Bar
                    yAxisId="activity"
                    dataKey="accepted"
                    name="Lượt đạt"
                    fill="rgb(var(--color-success))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                    isAnimationActive={!reduceMotion}
                    animationDuration={motionDuration.reveal * 1000}
                  />
                ) : null}
                {hasInterviewActivity ? (
                  <Line
                    yAxisId="score"
                    type="monotone"
                    dataKey="interviewScore"
                    name="Điểm phỏng vấn TB"
                    stroke="rgb(var(--color-secondary))"
                    strokeWidth={2.5}
                    connectNulls
                    dot={{
                      r: 3,
                      fill: 'rgb(var(--color-surface))',
                      stroke: 'rgb(var(--color-secondary))',
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 5,
                      fill: 'rgb(var(--color-secondary))',
                      strokeWidth: 0,
                    }}
                    style={{
                      filter: 'drop-shadow(0 0 5px rgb(var(--color-secondary) / 0.38))',
                    }}
                    isAnimationActive={!reduceMotion}
                    animationDuration={motionDuration.reveal * 1000}
                  />
                ) : null}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <ol className="sr-only">
            {data.map((point) => (
              <li key={point.key}>
                Tuần bắt đầu {point.label}: {point.attempts} lượt nộp code, {point.accepted} lượt
                đạt, điểm phỏng vấn trung bình{' '}
                {point.interviewScore === null ? 'chưa có' : point.interviewScore}.
              </li>
            ))}
          </ol>
        </>
      ) : (
        <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-lg border border-dashed border-foreground/10 px-5 text-center">
          <BarChart3 className="h-8 w-8 text-secondary" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            Chưa có hoạt động trong 8 tuần gần đây
          </p>
          <p className="mt-1 max-w-md text-xs leading-5 text-mutedText">
            Biểu đồ sẽ xuất hiện sau khi bạn nộp bài code hoặc hoàn tất phiên phỏng vấn có điểm.
          </p>
        </div>
      )}
    </Card>
  );
}
