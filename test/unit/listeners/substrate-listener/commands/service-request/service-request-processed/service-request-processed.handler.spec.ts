import { Test, TestingModule } from "@nestjs/testing";
import { MockType, substrateServiceMockFactory } from "../../../../../mock";
import { SubstrateService } from "../../../../../../../src/common";
import { ServiceRequestProcessedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-processed/service-request-processed.handler";

describe('Service Request Command Event', () => {
  let serviceRequesProcessedHandler: ServiceRequestProcessedHandler;
  let substrateServiceMock: MockType<SubstrateService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
				{
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory
				},
        ServiceRequestProcessedHandler
      ]
    }).compile();

    serviceRequesProcessedHandler = module.get(ServiceRequestProcessedHandler);
    substrateServiceMock = module.get(SubstrateService);
  });
});