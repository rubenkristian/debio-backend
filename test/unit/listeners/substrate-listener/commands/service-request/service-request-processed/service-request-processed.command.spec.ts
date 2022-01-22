import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { Test, TestingModule } from "@nestjs/testing";
import { substrateServiceMockFactory } from "../../../../../mock";
import { SubstrateService } from "../../../../../../../src/common";
import { ServiceRequestProcessedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-processed/service-request-processed.handler";

describe('Service Request Command Event', () => {
  let serviceRequesProcessedHandler: ServiceRequestProcessedHandler;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CqrsModule
      ],
      providers: [
        CommandBus,
				{
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory
				},
        ServiceRequestProcessedHandler
      ]
    }).compile();

    commandBus = module.get(CommandBus);
    serviceRequesProcessedHandler = module.get(ServiceRequestProcessedHandler);
  });
});