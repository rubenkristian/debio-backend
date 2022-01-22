import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { countryServiceMockFactory, debioConversionServiceMockFactory, elasticsearchServiceMockFactory, MockType } from '../../../mock';
import { ServiceRequestService } from '../../../../../src/endpoints/substrate-endpoint/services';
import { CountryService } from '../../../../../src/endpoints/location/country.service';
import { DebioConversionService } from '../../../../../src/common/modules/debio-conversion/debio-conversion.service';

describe('Substrate Indexer Lab Service Unit Tests', () => {
  let serviceRequestService: ServiceRequestService;
  let elasticsearchServiceMock: MockType<ElasticsearchService>;
  let countryServiceMock: MockType<CountryService>;
  let exchangeCacheService: MockType<DebioConversionService>;

  const createObjectSearchAggregatedByCountries = () => {
    return {
      index: 'create-service-request',
      body: { from: 0, size: 1000 },
    };
  }

  const createObjectSearchByCustomerId = (customerId: string, page: number, size: number) => {
    return {
      index: 'create-service-request',
      body: {
        query: {
          bool: {
            must: [
              {
                match_phrase_prefix: {
                  'request.requester_address': { query: customerId },
                },
              },
            ],
          },
        },
      },
      from: size * page - size || 0,
      size: size || 10,
    };
  }

  const createObjectSearchProvideRequestService = (
    country: string,
    region: string,
    city: string,
    category: string,) => {
    return {
      index: 'create-service-request',
      body: {
        query: {
          bool: {
            must: [
              {
                match_phrase_prefix: { 'request.country': { query: country } },
              },
              { match_phrase_prefix: { 'request.region': { query: region } } },
              { match_phrase_prefix: { 'request.city': { query: city } } },
              {
                match_phrase_prefix: {
                  'request.service_category': { query: category },
                },
              },
              { match_phrase_prefix: { 'request.status': { query: 'Open' } } },
            ],
          },
        },
      },
    };
  }

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceRequestService,
        {
          provide: ElasticsearchService,
          useFactory: elasticsearchServiceMockFactory,
        },
        {
          provide: CountryService,
          useFactory: countryServiceMockFactory
        },
        {
          provide: DebioConversionService,
          useFactory: debioConversionServiceMockFactory
        }
      ],
    }).compile();

    serviceRequestService = module.get(ServiceRequestService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
    countryServiceMock = module.get(CountryService);
    exchangeCacheService = module.get(DebioConversionService);
  });

  it('should be defined', () => {
    // Assert
    expect(serviceRequestService).toBeDefined();
  });

  it('should get aggregated by countries', () => {
    // Arrange
    const ES_CALLED_WITH = createObjectSearchAggregatedByCountries();
    const RESULT = [
      {
        _source: {
          request: {
            status: 'Open',
            country: 'XX',
            region: 'XX',
            city: 'XX',
            service_category: 'XX',
            staking_amount: '1'
          }
        }
      }
    ];
    const EXPECTED_RESULT = []
    const ES_RESULT = {
      body: {
        hits: {
          hits: RESULT
        }
      }
    };

    when(elasticsearchServiceMock.search)
      .calledWith(ES_CALLED_WITH)
      .mockReturnValue(ES_RESULT);
    
    // Assert
    expect(
      serviceRequestService.getAggregatedByCountries()
    ).resolves.toMatchObject(EXPECTED_RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should get by customer id', () => {
    // Arrange
    const CUSTOMER_ID = 'XX';
    const PAGE = 1;
    const SIZE = 10;
    const CALLED_WITH = createObjectSearchByCustomerId(CUSTOMER_ID, PAGE, SIZE);
    const RESULT = [
      {
        _source: {

        }
      }
    ];
    const EXPECTED_RESULT = [
      {}
    ]
    const ES_RESULT = {
      body: {
        hits: {
          hits: RESULT
        }
      }
    };

    when(elasticsearchServiceMock.search)
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);
    
    // Assert
    expect(
      serviceRequestService.getByCustomerId(
        CUSTOMER_ID,
        PAGE,
        SIZE
      )
    ).resolves.toMatchObject(EXPECTED_RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should provide request service', () => {
    // Arrange
    const COUNTRY = 'XX';
    const REGION = 'XX';
    const CITY = 'XX';
    const CATEGORY = 'XX';
    const CALLED_WITH = createObjectSearchProvideRequestService(COUNTRY, REGION, CITY, CATEGORY);
    const RESULT = [
      {
        _source: {

        }
      }
    ];
    const EXPECTED_RESULT = [
      {}
    ]
    const ES_RESULT = {
      body: {
        hits: {
          hits: RESULT
        }
      }
    };

    when(elasticsearchServiceMock.search)
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);
    
    // Assert
    expect(
      serviceRequestService.provideRequestService(
        COUNTRY,
        REGION,
        CITY,
        CATEGORY
      )
    ).resolves.toMatchObject(EXPECTED_RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });
});
