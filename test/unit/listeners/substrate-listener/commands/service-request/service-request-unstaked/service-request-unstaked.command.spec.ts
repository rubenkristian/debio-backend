import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { Test, TestingModule } from "@nestjs/testing";
import { transactionLoggingServiceMockFactory } from "../../../../../mock";
import { TransactionLoggingService } from "../../../../../../../src/common";
import { ServiceRequestUnstakedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-unstaked/service-request-unstaked.handler";

describe('Service Request Command Event', () => {
  let serviceRequesUnstakedHandler: ServiceRequestUnstakedHandler;
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
        ServiceRequestUnstakedHandler
      ]
    }).compile();

    commandBus = module.get(CommandBus);
    serviceRequesUnstakedHandler = module.get(ServiceRequestUnstakedHandler);
  });
});