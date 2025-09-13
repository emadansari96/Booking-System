import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: 'CommissionStrategyRepositoryInterface',
          useValue: {
            findActiveStrategies: jest.fn(),
            findByResourceType: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: 'ResourceItemRepositoryInterface',
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have calculatePricing method', () => {
    expect(typeof service.calculatePricing).toBe('function');
  });

  it('should have calculateBulkPricing method', () => {
    expect(typeof service.calculateBulkPricing).toBe('function');
  });
});
