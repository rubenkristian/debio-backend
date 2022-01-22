import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { Test, TestingModule } from "@nestjs/testing";
import { countryServiceMockFactory, mailerManagerMockFactory, stateServiceMockFactory, transactionLoggingServiceMockFactory } from "../../../../../mock";
import { MailerManager, TransactionLoggingService } from "../../../../../../../src/common";
import { ServiceRequestCreatedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-created/service-request-created.handler";
import { CountryService } from "../../../../../../../src/endpoints/location/country.service";
import { StateService } from "../../../../../../../src/endpoints/location/state.service";

describe('Service Request Command Event', () => {
  let serviceRequesCreatedHandler: ServiceRequestCreatedHandler;
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
        {
          provide: CountryService,
          useFactory: countryServiceMockFactory
        },
        {
          provide: StateService,
          useFactory: stateServiceMockFactory
        },
        {
          provide: MailerManager,
          useFactory: mailerManagerMockFactory
        },
        ServiceRequestCreatedHandler
      ]
    }).compile();

    commandBus = module.get(CommandBus);
    serviceRequesCreatedHandler = module.get(ServiceRequestCreatedHandler);
  });
});