import { Module } from '@nestjs/common';
import { EscrowModule } from './escrow/escrow.module';
import { LocationModule } from './modules/location/location.module';
import { EthereumBlockModule } from './modules/ethereumBlock.module';
import { Entities } from './modules/location/models';
import { TypeOrmModule } from '@nestjs/typeorm';
require('dotenv').config() // eslint-disable-line

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [...Entities],
      synchronize: true,
    }),
    LocationModule,
    EscrowModule,
    EthereumBlockModule,
  ],
})
export class AppModule {}
