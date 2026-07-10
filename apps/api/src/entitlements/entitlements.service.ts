import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CodeProblem, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export const walletCurrency = 'VND';
export const premiumCodeUnlockPrice = 20_000;

type WalletTransactionType = 'CREDIT' | 'DEBIT';

type PlanFeatures = {
  aiChatMessagesPerDay: number;
  aiToolCallsPerDay: number;
  codeRunsPerDay: number;
  premiumCodeIncluded: boolean;
  prioritySupport: boolean;
  mentorReviewIncluded: boolean;
};

export type SubscriptionPlanDefinition = {
  slug: string;
  packageSlug?: string;
  name: string;
  eyebrow: string;
  description: string;
  price: number;
  currency: string;
  interval: 'free' | 'month' | 'year';
  durationDays: number;
  level: 'BEGINNER' | 'FOUNDATION' | 'INTERMEDIATE' | 'ADVANCED' | 'JOB_READY';
  rank: number;
  features: PlanFeatures;
  highlights: string[];
};

export const subscriptionPlans: SubscriptionPlanDefinition[] = [
  {
    slug: 'free-basic',
    name: 'Free cơ bản',
    eyebrow: 'Bắt đầu',
    description: 'Dành cho học viên mới muốn thử lộ trình, luyện bài cơ bản và chat AI giới hạn.',
    price: 0,
    currency: walletCurrency,
    interval: 'free',
    durationDays: 3650,
    level: 'BEGINNER',
    rank: 0,
    features: {
      aiChatMessagesPerDay: 3,
      aiToolCallsPerDay: 5,
      codeRunsPerDay: 30,
      premiumCodeIncluded: false,
      prioritySupport: false,
      mentorReviewIncluded: false,
    },
    highlights: [
      '3 tin nhắn trợ lý AI mỗi ngày',
      'Luyện bài code thường',
      'Bài đặc biệt mở khóa 20.000đ/bài',
    ],
  },
  {
    slug: 'pro-monthly-2m',
    packageSlug: 'goi-pro-thang-2-trieu',
    name: 'Pro tháng',
    eyebrow: 'Phổ biến',
    description: 'Mở rộng quota AI, luyện bài đặc biệt và theo dõi tiến độ học tập sát hơn.',
    price: 2_000_000,
    currency: walletCurrency,
    interval: 'month',
    durationDays: 30,
    level: 'INTERMEDIATE',
    rank: 20,
    features: {
      aiChatMessagesPerDay: 150,
      aiToolCallsPerDay: 80,
      codeRunsPerDay: 300,
      premiumCodeIncluded: true,
      prioritySupport: false,
      mentorReviewIncluded: false,
    },
    highlights: [
      '150 tin nhắn trợ lý AI mỗi ngày',
      'Mở toàn bộ bài code đặc biệt',
      'Tăng quota gợi ý AI và review code',
    ],
  },
  {
    slug: 'premium-monthly-5m',
    packageSlug: 'goi-premium-thang-5-trieu',
    name: 'Premium tháng',
    eyebrow: 'Tăng tốc',
    description: 'Cho học viên cần dùng AI nhiều, luyện phỏng vấn, CV và bài nâng cao liên tục.',
    price: 5_000_000,
    currency: walletCurrency,
    interval: 'month',
    durationDays: 30,
    level: 'ADVANCED',
    rank: 50,
    features: {
      aiChatMessagesPerDay: 500,
      aiToolCallsPerDay: 250,
      codeRunsPerDay: 1000,
      premiumCodeIncluded: true,
      prioritySupport: true,
      mentorReviewIncluded: true,
    },
    highlights: [
      '500 tin nhắn trợ lý AI mỗi ngày',
      'Bài đặc biệt, phỏng vấn AI, CV review quota cao',
      'Ưu tiên hỗ trợ và review mentor',
    ],
  },
  {
    slug: 'premium-yearly-15m',
    packageSlug: 'goi-premium-nam-15-trieu',
    name: 'Premium năm',
    eyebrow: 'Tiết kiệm',
    description: 'Gói dài hạn cho người học nghiêm túc, tiết kiệm hơn so với trả theo tháng.',
    price: 15_000_000,
    currency: walletCurrency,
    interval: 'year',
    durationDays: 365,
    level: 'JOB_READY',
    rank: 60,
    features: {
      aiChatMessagesPerDay: 700,
      aiToolCallsPerDay: 350,
      codeRunsPerDay: 1500,
      premiumCodeIncluded: true,
      prioritySupport: true,
      mentorReviewIncluded: true,
    },
    highlights: [
      '700 tin nhắn trợ lý AI mỗi ngày',
      'Toàn bộ quyền Premium trong 12 tháng',
      'Chi phí tốt nhất cho học dài hạn',
    ],
  },
];

@Injectable()
export class EntitlementsService {
  constructor(private readonly prisma: PrismaService) {}

  async plans() {
    const packages = await this.ensurePlanPackages();
    return subscriptionPlans.map((plan) => ({
      ...plan,
      packageId: plan.packageSlug ? packages.get(plan.packageSlug)?.id : null,
    }));
  }

  async summary(studentId: string) {
    const [activePlan, wallet, aiChatUsage, aiToolUsage, codeUsage] = await Promise.all([
      this.activePlan(studentId),
      this.walletSummary(studentId),
      this.aiChatUsageToday(studentId),
      this.aiToolUsageToday(studentId),
      this.codeUsageToday(studentId),
    ]);

    return {
      activePlan,
      plans: await this.plans(),
      wallet,
      usage: {
        aiChatMessagesToday: aiChatUsage,
        aiChatMessagesRemaining: Math.max(
          activePlan.features.aiChatMessagesPerDay - aiChatUsage,
          0,
        ),
        aiChatMessagesPerDay: activePlan.features.aiChatMessagesPerDay,
        aiToolCallsToday: aiToolUsage,
        aiToolCallsRemaining: Math.max(activePlan.features.aiToolCallsPerDay - aiToolUsage, 0),
        aiToolCallsPerDay: activePlan.features.aiToolCallsPerDay,
        codeRunsToday: codeUsage,
        codeRunsRemaining: Math.max(activePlan.features.codeRunsPerDay - codeUsage, 0),
        codeRunsPerDay: activePlan.features.codeRunsPerDay,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  async purchaseSubscription(studentId: string, slug: string) {
    const plan = subscriptionPlans.find((item) => item.slug === slug);
    if (!plan) {
      throw new BadRequestException('Không tìm thấy gói sử dụng.');
    }
    if (!plan.packageSlug || plan.price <= 0) {
      return {
        payment: null,
        wallet: await this.walletSummary(studentId),
        entitlements: await this.summary(studentId),
      };
    }

    const packages = await this.ensurePlanPackages();
    const pack = packages.get(plan.packageSlug);
    if (!pack) {
      throw new BadRequestException('Không tạo được gói thanh toán.');
    }

    const wallet = await this.walletSummary(studentId);
    if (wallet.balance < plan.price) {
      throw new BadRequestException('Số dư không đủ để mua gói này. Vui lòng nạp thêm tiền.');
    }

    const payment = await this.prisma.payment.create({
      data: {
        studentId,
        packageId: pack.id,
        amount: plan.price,
        currency: walletCurrency,
        status: PaymentStatus.PAID,
        provider: 'wallet',
        providerRef: `subscription_${plan.slug}_${Date.now()}`,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: studentId,
        type: 'PAYMENT_STATUS',
        title: 'Đã kích hoạt gói sử dụng',
        message: `Bạn đã mua gói "${plan.name}". Quyền sử dụng được cập nhật ngay.`,
        metadata: { paymentId: payment.id, plan: plan.slug } as Prisma.InputJsonValue,
      },
    });

    return {
      payment,
      wallet: await this.walletSummary(studentId),
      entitlements: await this.summary(studentId),
    };
  }

  async activePlan(studentId: string) {
    const packages = await this.ensurePlanPackages();
    const paidPlans = subscriptionPlans.filter((plan) => plan.packageSlug);
    const packageIds = paidPlans
      .map((plan) => packages.get(plan.packageSlug!)?.id)
      .filter((id): id is string => Boolean(id));

    const payments = packageIds.length
      ? await this.prisma.payment.findMany({
          where: {
            studentId,
            status: PaymentStatus.PAID,
            currency: walletCurrency,
            packageId: { in: packageIds },
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const now = Date.now();
    const active = payments
      .map((payment) => {
        const plan = paidPlans.find(
          (item) => packages.get(item.packageSlug!)?.id === payment.packageId,
        );
        if (!plan) return null;
        const expiresAt = new Date(
          payment.createdAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000,
        );
        if (expiresAt.getTime() <= now) return null;
        return {
          ...plan,
          startedAt: payment.createdAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          paymentId: payment.id,
        };
      })
      .filter(
        (
          plan,
        ): plan is SubscriptionPlanDefinition & {
          startedAt: string;
          expiresAt: string;
          paymentId: string;
        } => Boolean(plan),
      )
      .sort((a, b) => b.rank - a.rank || Date.parse(b.startedAt) - Date.parse(a.startedAt))[0];

    const fallback = subscriptionPlans[0]!;
    return (
      active ?? {
        ...fallback,
        startedAt: null,
        expiresAt: null,
        paymentId: null,
      }
    );
  }

  async ensureAiChatAllowed(userId: string) {
    const activePlan = await this.activePlan(userId);
    const used = await this.aiChatUsageToday(userId);
    if (used >= activePlan.features.aiChatMessagesPerDay) {
      throw new ForbiddenException(
        `Bạn đã dùng hết ${activePlan.features.aiChatMessagesPerDay} tin nhắn trợ lý AI hôm nay. Vui lòng nâng cấp gói để chat nhiều hơn.`,
      );
    }
    return { activePlan, used, remaining: activePlan.features.aiChatMessagesPerDay - used };
  }

  async ensureAiToolAllowed(userId: string, feature: string) {
    const activePlan = await this.activePlan(userId);
    const used = await this.aiToolUsageToday(userId);
    if (used >= activePlan.features.aiToolCallsPerDay) {
      throw new ForbiddenException(
        `Bạn đã dùng hết lượt AI nâng cao hôm nay trên gói ${activePlan.name}. Vui lòng nâng cấp để dùng thêm.`,
      );
    }
    return { activePlan, feature, used, remaining: activePlan.features.aiToolCallsPerDay - used };
  }

  async ensureCodeRunAllowed(studentId: string) {
    const activePlan = await this.activePlan(studentId);
    const used = await this.codeUsageToday(studentId);
    if (used >= activePlan.features.codeRunsPerDay) {
      throw new ForbiddenException(
        `Bạn đã dùng hết ${activePlan.features.codeRunsPerDay} lượt chạy/nộp code hôm nay. Vui lòng nâng cấp gói để tiếp tục.`,
      );
    }
    return { activePlan, used, remaining: activePlan.features.codeRunsPerDay - used };
  }

  async ensureCodeProblemAccess(
    studentId: string,
    problem: Pick<CodeProblem, 'id' | 'title' | 'isPremium' | 'unlockPrice'>,
  ) {
    await this.ensureCodeRunAllowed(studentId);
    if (!problem.isPremium) {
      return {
        charged: false,
        wallet: null,
        unlockPrice: 0,
        activePlan: await this.activePlan(studentId),
      };
    }

    const activePlan = await this.activePlan(studentId);
    if (activePlan.features.premiumCodeIncluded) {
      return { charged: false, wallet: null, unlockPrice: 0, activePlan };
    }

    const existingUnlock = await this.prisma.payment.findFirst({
      where: {
        studentId,
        status: PaymentStatus.PAID,
        currency: walletCurrency,
        provider: 'wallet',
        providerRef: { startsWith: `code_unlock_${problem.id}_` },
      },
    });
    if (existingUnlock) {
      return { charged: false, wallet: null, unlockPrice: premiumCodeUnlockPrice, activePlan };
    }

    const price = Number(problem.unlockPrice || premiumCodeUnlockPrice) || premiumCodeUnlockPrice;
    const wallet = await this.walletSummary(studentId);
    if (wallet.balance < price) {
      throw new BadRequestException(
        `Bài đặc biệt "${problem.title}" cần mở khóa ${price.toLocaleString('vi-VN')}đ. Số dư ví hiện không đủ, vui lòng nạp thêm tiền hoặc nâng cấp gói.`,
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        studentId,
        amount: price,
        currency: walletCurrency,
        status: PaymentStatus.PAID,
        provider: 'wallet',
        providerRef: `code_unlock_${problem.id}_${Date.now()}`,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: studentId,
        type: 'PAYMENT_STATUS',
        title: 'Đã mở khóa bài code đặc biệt',
        message: `Bạn đã mở khóa bài "${problem.title}" với phí ${price.toLocaleString('vi-VN')}đ.`,
        metadata: { paymentId: payment.id, problemId: problem.id } as Prisma.InputJsonValue,
      },
    });

    return {
      charged: true,
      wallet: await this.walletSummary(studentId),
      unlockPrice: price,
      activePlan,
    };
  }

  async walletSummary(studentId: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        studentId,
        status: PaymentStatus.PAID,
        currency: walletCurrency,
      },
      orderBy: { createdAt: 'desc' },
    });
    const pendingTopUps = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        studentId,
        status: PaymentStatus.PENDING,
        currency: walletCurrency,
        packageId: null,
        roadmapId: null,
      },
    });

    let credit = 0;
    let debit = 0;
    const transactions = payments.map((payment) => {
      const amount = Number(payment.amount);
      const type: WalletTransactionType =
        payment.packageId || payment.roadmapId || payment.provider === 'wallet'
          ? 'DEBIT'
          : 'CREDIT';
      if (type === 'CREDIT') {
        credit += amount;
      } else {
        debit += amount;
      }
      return {
        id: payment.id,
        type,
        amount,
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
        providerRef: payment.providerRef,
        packageId: payment.packageId,
        roadmapId: payment.roadmapId,
        createdAt: payment.createdAt,
      };
    });

    return {
      balance: Math.max(credit - debit, 0),
      currency: walletCurrency,
      credit,
      debit,
      pendingTopUp: Number(pendingTopUps._sum.amount ?? 0),
      transactions: transactions.slice(0, 20),
      updatedAt: new Date().toISOString(),
    };
  }

  private async ensurePlanPackages() {
    const entries = await Promise.all(
      subscriptionPlans
        .filter((plan) => plan.packageSlug)
        .map((plan) =>
          this.prisma.tutoringPackage.upsert({
            where: { slug: plan.packageSlug! },
            create: this.planPackageData(plan),
            update: this.planPackageData(plan),
          }),
        ),
    );
    return new Map(entries.map((entry) => [entry.slug, entry]));
  }

  private planPackageData(
    plan: SubscriptionPlanDefinition,
  ): Prisma.TutoringPackageUncheckedCreateInput {
    return {
      title: plan.name,
      slug: plan.packageSlug!,
      shortDescription: plan.description,
      longDescription:
        'Gói sử dụng MentorMind mở quota trợ lý AI, bài code đặc biệt, review thông minh và các tính năng học tập nâng cao theo thời hạn gói.',
      targetAudience:
        'Học viên muốn dùng MentorMind thường xuyên với quota rõ ràng và quyền truy cập cao hơn gói free.',
      targetRole: 'Học viên MentorMind',
      level: plan.level,
      category: 'CAREER',
      durationWeeks: Math.max(Math.ceil(plan.durationDays / 7), 1),
      recommendedSessions: plan.features.mentorReviewIncluded ? 4 : 0,
      sessionDurationMinutes: 60,
      outcomes: plan.highlights,
      skills: ['AI learning assistant', 'Code practice', 'Interview preparation', 'CV review'],
      includedAiTools: [
        `${plan.features.aiChatMessagesPerDay} tin nhắn trợ lý AI/ngày`,
        `${plan.features.aiToolCallsPerDay} lượt AI nâng cao/ngày`,
        plan.features.premiumCodeIncluded ? 'Mở bài code đặc biệt' : 'Bài đặc biệt trả theo lượt',
      ],
      mentorType: plan.features.mentorReviewIncluded ? 'Mentor ưu tiên' : 'Tự học có AI hỗ trợ',
      price: plan.price,
      currency: walletCurrency,
      status: 'PUBLISHED',
      featured: plan.rank >= 20,
      heroConfig: { plan: plan.slug, accent: plan.rank >= 50 ? 'cyan' : 'green' },
    };
  }

  private async aiChatUsageToday(userId: string) {
    return this.prisma.aIMessage.count({
      where: {
        role: 'USER',
        createdAt: { gte: this.startOfVietnamDay() },
        conversation: { userId },
      },
    });
  }

  private async aiToolUsageToday(userId: string) {
    return this.prisma.aIUsageLog.count({
      where: {
        userId,
        createdAt: { gte: this.startOfVietnamDay() },
        feature: { notIn: ['LEARNING_ASSISTANT', 'LEARNING_ASSISTANT_CONTEXT'] },
      },
    });
  }

  private async codeUsageToday(studentId: string) {
    return this.prisma.codeSubmission.count({
      where: {
        studentId,
        createdAt: { gte: this.startOfVietnamDay() },
      },
    });
  }

  private startOfVietnamDay() {
    const offsetMs = 7 * 60 * 60 * 1000;
    const local = new Date(Date.now() + offsetMs);
    local.setUTCHours(0, 0, 0, 0);
    return new Date(local.getTime() - offsetMs);
  }
}
