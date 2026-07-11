import { z } from 'zod';

type LegacyDecimalValue = { s: 1; e: number; d: number[] };

const decimalStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d+)?$/)
  .transform(normalizeDecimalString);
const decimalNumberSchema = z
  .number()
  .finite()
  .nonnegative()
  .refine((value) => !/[eE]/.test(String(value)), 'Exponential price values are not supported.')
  .transform((value) => normalizeDecimalString(String(value)));
const legacyDecimalSchema = z
  .object({
    s: z.literal(1),
    e: z.number().int().min(-100).max(100),
    d: z.array(z.number().int().min(0).max(9_999_999)).min(1).max(32),
  })
  .strict()
  .transform(legacyDecimalToString);
const moneySchema = z.union([decimalStringSchema, decimalNumberSchema, legacyDecimalSchema]);
const publicPackageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().min(1),
  longDescription: z.string().min(1),
  targetAudience: z.string().min(1),
  targetRole: z.string().min(1),
  level: z.string().min(1),
  category: z.string().min(1),
  durationWeeks: z.number().int().positive(),
  recommendedSessions: z.number().int().nonnegative(),
  sessionDurationMinutes: z.number().int().positive(),
  outcomes: z.array(z.string()),
  skills: z.array(z.string()),
  includedAiTools: z.array(z.string()),
  mentorType: z.string().min(1),
  price: moneySchema,
  currency: z.string().regex(/^[A-Z]{3}$/),
  status: z.literal('PUBLISHED'),
  featured: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const publicPackageDetailSchema = publicPackageSchema.extend({
  related: z.array(publicPackageSchema).default([]),
});

const packageListSchema = z.object({
  items: z.array(publicPackageSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

const packageApiUrl = (
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000'
).replace(/\/+$/, '');

export type PublicPackage = z.infer<typeof publicPackageSchema>;
export type PublicPackageDetail = z.infer<typeof publicPackageDetailSchema>;

function normalizeDecimalString(value: string) {
  const [integer = '0', fraction = ''] = value.split('.');
  const normalizedInteger = integer.replace(/^0+(?=\d)/, '') || '0';
  const normalizedFraction = fraction.replace(/0+$/, '');
  return normalizedFraction ? `${normalizedInteger}.${normalizedFraction}` : normalizedInteger;
}

function legacyDecimalToString(value: LegacyDecimalValue) {
  const digits = value.d
    .map((chunk, index) => (index === 0 ? String(chunk) : String(chunk).padStart(7, '0')))
    .join('');
  const integerLength = value.e + 1;
  const decimal =
    integerLength <= 0
      ? `0.${'0'.repeat(Math.abs(integerLength))}${digits}`
      : integerLength >= digits.length
        ? `${digits}${'0'.repeat(integerLength - digits.length)}`
        : `${digits.slice(0, integerLength)}.${digits.slice(integerLength)}`;
  return normalizeDecimalString(decimal);
}

function packageApiTimeoutMs() {
  const configured = Number(process.env.PACKAGE_API_TIMEOUT_MS ?? 2500);
  return Number.isFinite(configured)
    ? Math.min(Math.max(Math.round(configured), 10), 10_000)
    : 2500;
}

async function fetchPackageApi(path: string, cache: 'no-store' | 'sitemap') {
  const init = {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(packageApiTimeoutMs()),
  };
  if (cache === 'no-store') {
    return fetch(`${packageApiUrl}${path}`, { ...init, cache: 'no-store' });
  }
  return fetch(`${packageApiUrl}${path}`, { ...init, next: { revalidate: 60 } });
}

async function readApiData(response: Response) {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Package API returned invalid JSON (${response.status}).`);
  }

  const envelope = z
    .object({ success: z.boolean(), data: z.unknown().optional() })
    .safeParse(payload);
  if (!envelope.success || !envelope.data.success || envelope.data.data === undefined) {
    throw new Error(`Package API returned an invalid envelope (${response.status}).`);
  }
  return envelope.data.data;
}

export async function getPublicPackage(slug: string): Promise<PublicPackageDetail | null> {
  const response = await fetchPackageApi(`/packages/${encodeURIComponent(slug)}`, 'no-store');
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Package API request failed (${response.status}).`);
  }

  return publicPackageDetailSchema.parse(await readApiData(response));
}

export async function listPublishedPackages(): Promise<PublicPackage[]> {
  const packages = new Map<string, PublicPackage>();
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (packages.size < total && page <= 100) {
    const response = await fetchPackageApi(`/packages?page=${page}&limit=50`, 'sitemap');
    if (!response.ok) {
      throw new Error(`Package list API request failed (${response.status}).`);
    }
    const result = packageListSchema.parse(await readApiData(response));
    result.items.forEach((item) => packages.set(item.slug, item));
    total = result.total;
    if (!result.items.length || result.items.length < result.limit) {
      break;
    }
    page += 1;
  }

  return [...packages.values()];
}
