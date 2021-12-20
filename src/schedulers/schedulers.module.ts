import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SubstrateModule } from '../substrate/substrate.module';
import { UnstakedService } from './unstaked/unstaked.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE,
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD
        }
      }),
    }),
    SubstrateModule
  ],
  exports: [ElasticsearchModule],
  providers: [UnstakedService]
})
export class SchedulersModule {}
