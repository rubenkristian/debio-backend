import { Test, TestingModule } from "@nestjs/testing";
import { MockType, transactionLoggingServiceMockFactory } from "../../../../../mock";
import { TransactionLoggingService } from "../../../../../../../src/common";
import { ServiceRequestUnstakedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-unstaked/service-request-unstaked.handler";

describe('Service Request Command Event', () => {
  let serviceRequesUnstakedHandler: ServiceRequestUnstakedHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
				{
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory
				},
        ServiceRequestUnstakedHandler
      ]
    }).compile();

    serviceRequesUnstakedHandler = module.get(ServiceRequestUnstakedHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
  });
});