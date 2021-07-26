import { Injectable } from '@nestjs/common';
import { EthereumProvider } from '../modules/ethereum/ethereum.provider';
import { EscrowService } from '../escrow/escrow.service';

@Injectable()
export class EthereumBlockService {
  ethereumProvider: EthereumProvider;
  escrowService: EscrowService;

  constructor(
    ethereumProvider: EthereumProvider,
    escrowService: EscrowService,
  ) {
    this.ethereumProvider = ethereumProvider;
    this.escrowService = escrowService;
  }

  onModuleInit() {
    console.log('Di EthereumBlockService', this.ethereumProvider);
    console.log(
      'Di EthereumBlockService -> escrowService -> ',
      this.escrowService,
    );
    this.syncBlock();
  }

  syncBlock() {
    // TODO: use ethereum connection provider to connect to network
    // TODO: handle block sync
    setInterval(() => {
      this.escrowService.handleTransaction();
    }, 3000);
  }
}
