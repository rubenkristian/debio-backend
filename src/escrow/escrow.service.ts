import { Injectable } from '@nestjs/common';
import { EthereumProvider } from '../ethereum/ethereum.provider';
import { SubstrateProvider } from 'src/modules/substrate/substrate.provider';

@Injectable()
export class EscrowService {
  ethereumProvider: EthereumProvider;
  substrateProvider: SubstrateProvider;
  constructor(
    ethereumProvider: EthereumProvider,
    substrateProvider: SubstrateProvider,
  ) {
    this.ethereumProvider = ethereumProvider;
    this.substrateProvider = substrateProvider;
  }

  onModuleInit() {
    console.log('Di EscrowService', this.ethereumProvider);
  }

  handleTransaction() {
    console.log('handleTransaction di escrowService');
  }
}
