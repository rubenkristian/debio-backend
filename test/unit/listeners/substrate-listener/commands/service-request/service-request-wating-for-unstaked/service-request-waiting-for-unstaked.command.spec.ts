import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { Test, TestingModule } from "@nestjs/testing";
import { transactionLoggingServiceMockFactory } from "../../../../../mock";
import { TransactionLoggingService } from "../../../../../../../src/common";
import { ServiceRequestWaitingForUnstakedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-waiting-for-unstaked/service-request-waiting-for-unstaked.handler";

describe('Service Request Command Event', () => {
  let serviceRequestWaitingForUnstakedHandler: ServiceRequestWaitingForUnstakedHandler;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CqrsModule
      ],
      providers: [
        CommandBus,
				{
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory
				},
        ServiceRequestWaitingForUnstakedHandler
      ]
    }).compile();

    commandBus = module.get(CommandBus);
    serviceRequestWaitingForUnstakedHandler = module.get(ServiceRequestWaitingForUnstakedHandler);
  });
});