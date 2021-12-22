import { forwardRef, Module } from '@nestjs/common';
import { SubstrateService } from './substrate.service';
import { SubstrateController } from './substrate.controller';
import { EscrowModule } from '../escrow/escrow.module';
import { TransactionLoggingModule } from '../transaction-logging/transaction-logging.module';
import { RewardModule } from 'src/reward/reward.module';
import { MailModule } from 'src/common/mailer/mailer.module';
import { DebioConversionModule } from 'src/debio-conversion/debio-conversion.module';

@Module({
  imports: [
    forwardRef(() => EscrowModule),
    forwardRef(() => RewardModule),
    DebioConversionModule,
    TransactionLoggingModule,
    MailModule,
  ],
  controllers: [SubstrateController],
  providers: [SubstrateService],
  exports: [SubstrateService],
})
export class SubstrateModule {}
