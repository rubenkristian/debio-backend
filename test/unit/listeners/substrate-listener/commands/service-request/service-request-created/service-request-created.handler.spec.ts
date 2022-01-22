import { Test, TestingModule } from "@nestjs/testing";
import { countryServiceMockFactory, mailerManagerMockFactory, MockType, stateServiceMockFactory, transactionLoggingServiceMockFactory } from "../../../../../mock";
import { MailerManager, TransactionLoggingService } from "../../../../../../../src/common";
import { ServiceRequestCreatedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-created/service-request-created.handler";
import { CountryService } from "../../../../../../../src/endpoints/location/country.service";
import { StateService } from "../../../../../../../src/endpoints/location/state.service";

describe('Service Request Command Event', () => {
  let serviceRequesCreatedHandler: ServiceRequestCreatedHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let countryServiceMock: MockType<CountryService>;
  let stateServiceMock: MockType<StateService>;
  let mailerManagerMock: MockType<MailerManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
    
    serviceRequesCreatedHandler = module.get(ServiceRequestCreatedHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    countryServiceMock = module.get(CountryService);
    stateServiceMock = module.get(StateService);
    mailerManagerMock = module.get(MailerManager);
  });
});