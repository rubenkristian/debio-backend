import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabRating } from './endpoints/rating/models/rating.entity';
import { LocationEntities } from './endpoints/location/models';
import { LocationModule } from './endpoints/location/location.module';
import { RatingModule } from './endpoints/rating/rating.module';
import { EthereumModule } from './endpoints/ethereum/ethereum.module';
import { EscrowModule } from './endpoints/escrow/escrow.module';
import { SubstrateModule } from './substrate/substrate.module';
import { SubstrateIndexedDataModule } from './endpoints/substrate-indexed-data/substrate-indexed-data.module';
import { EthereumIndexedDataModule } from './endpoints/ethereum-indexed-data/ethereum-indexed-data.module';
import { TransactionLoggingModule } from './common/utilities/transaction-logging/transaction-logging.module';
import { TransactionRequest } from './common/utilities/transaction-logging/models/transaction-request.entity';
import { RecaptchaModule } from './endpoints/recaptcha/recaptcha.module';
import { CloudStorageModule } from './endpoints/cloud-storage/cloud-storage.module';
import { BountyModule } from './endpoints/bounty/bounty.module';
import { EmrModule } from './endpoints/category/emr/emr.module';
import { ServiceCategoryModule } from './endpoints/category/service/service-category.module';
import { RewardModule } from './common/utilities/reward/reward.module';
import { VerificationModule } from './endpoints/verification/verification.module';
import { SchedulersModule } from './schedulers/schedulers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './endpoints/health/health.module';
import { DebioConversionModule } from './common/utilities/debio-conversion/debio-conversion.module';

require('dotenv').config(); // eslint-disable-line

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST_POSTGRES,
      port: 5432,
      username: process.env.USERNAME_POSTGRES,
      password: process.env.PASSWORD_POSTGRES,
      database: process.env.DB_POSTGRES,
      entities: [LabRating, TransactionRequest],
      autoLoadEntities: true,
    }),
    TypeOrmModule.forRoot({
      name: 'dbLocation',
      type: 'postgres',
      host: process.env.HOST_POSTGRES,
      port: 5432,
      username: process.env.USERNAME_POSTGRES,
      password: process.env.PASSWORD_POSTGRES,
      database: process.env.DB_LOCATIONS,
      entities: [...LocationEntities],
      autoLoadEntities: true,
    }),
    CloudStorageModule,
    LocationModule,
    RewardModule,
    RatingModule,
    EmrModule,
    ServiceCategoryModule,
    EthereumModule,
    EscrowModule,
    DebioConversionModule,
    SubstrateModule,
    SubstrateIndexedDataModule,
    EthereumIndexedDataModule,
    TransactionLoggingModule,
    VerificationModule,
    RecaptchaModule,
    BountyModule,
    SchedulersModule,
    HealthModule
  ],
})
export class AppModule {}
