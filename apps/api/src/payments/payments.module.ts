import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntitlementsModule } from '../entitlements/entitlements.module';
import { PaymentsController } from './payments.controller';
import { MockPaymentProvider } from './mock-payment.provider';
import { PayOsPaymentProvider } from './payos-payment.provider';
import { PAYMENT_PROVIDER, PaymentsService } from './payments.service';

@Module({
  imports: [EntitlementsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    MockPaymentProvider,
    PayOsPaymentProvider,
    {
      provide: PAYMENT_PROVIDER,
      inject: [ConfigService, MockPaymentProvider, PayOsPaymentProvider],
      useFactory: (
        config: ConfigService,
        mock: MockPaymentProvider,
        payos: PayOsPaymentProvider,
      ) => (config.get<string>('PAYMENT_PROVIDER') === 'payos' ? payos : mock),
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
