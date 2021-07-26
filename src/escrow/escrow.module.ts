import { Module } from '@nestjs/common';
import { EthereumProvider } from 'src/modules/ethereum/ethereum.provider';
import { SubstrateProvider } from 'src/modules/substrate/substrate.provider';
import { EscrowService } from './escrow.service';

@Module({
  imports: [],
  providers: [EthereumProvider, EscrowService, SubstrateProvider],
  exports: [EscrowService, SubstrateProvider],
})
export class EscrowModule {}
