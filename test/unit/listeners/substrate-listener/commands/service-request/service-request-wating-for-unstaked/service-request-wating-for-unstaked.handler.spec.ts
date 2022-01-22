import { Test, TestingModule } from "@nestjs/testing";
import { MockType, transactionLoggingServiceMockFactory } from "../../../../../mock";
import { TransactionLoggingService } from "../../../../../../../src/common";
import { ServiceRequestWaitingForUnstakedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-waiting-for-unstaked/service-request-waiting-for-unstaked.handler";

describe('Service Request Command Event', () => {
  let serviceRequestWaitingForUnstakedHandler: ServiceRequestWaitingForUnstakedHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
				{
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory
				},
        ServiceRequestWaitingForUnstakedHandler
      ]
    }).compile();

    serviceRequestWaitingForUnstakedHandler = module.get(ServiceRequestWaitingForUnstakedHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
  });
});