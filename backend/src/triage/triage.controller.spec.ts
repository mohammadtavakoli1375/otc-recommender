import { Test, TestingModule } from '@nestjs/testing';
import { TriageController } from './triage.controller';
import { TriageService } from './triage.service';
import { PrismaService } from '../prisma/prisma.service';
import { RulesEngine } from '../rules/rules-engine';

describe('TriageController', () => {
  let controller: TriageController;
  let service: TriageService;

  const mockTriageService = {
    evaluateSymptoms: jest.fn(),
    getIngredients: jest.fn(),
    getLatestProtocol: jest.fn(),
  };

  const mockPrismaService = {
    ingredient: {
      findMany: jest.fn(),
    },
    condition: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TriageController],
      providers: [
        {
          provide: TriageService,
          useValue: mockTriageService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        RulesEngine,
      ],
    }).compile();

    controller = module.get<TriageController>(TriageController);
    service = module.get<TriageService>(TriageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /api/triage', () => {
    it('should evaluate symptoms and return triage result', async () => {
      const triageDto = {
        patient: {
          age: 30,
          sex: 'M' as const,
          isElder: false,
          meds: [],
        },
        symptoms: ['sore_throat'],
        durationDays: 2,
        redFlags: {},
      };

      const expectedResult = {
        action: 'OK' as const,
        blocks: [],
        avoid: [],
        suggestions: [
          {
            ingredient: 'استامینوفن',
            dose: '500 mg هر ۶-۸ ساعت',
            maxDays: 3,
            why: 'درد و تب',
          },
        ],
        education: ['این سیستم صرفاً جنبه آموزشی دارد و جایگزین مشاوره پزشک نیست.', 'مایعات کافی بنوشید'],
        sources: ['NICE CKS Guidelines'],
      };

      mockTriageService.evaluateSymptoms.mockResolvedValue(expectedResult);

      const result = await controller.evaluateSymptoms(triageDto);

      expect(service.evaluateSymptoms).toHaveBeenCalledWith(triageDto);
      expect(result).toEqual(expectedResult);
    });

    it('should return REFER_IMMEDIATE for emergency symptoms', async () => {
      const triageDto = {
        patient: {
          age: 30,
          sex: 'M' as const,
          isElder: false,
          meds: [],
        },
        symptoms: ['sore_throat'],
        durationDays: 2,
        redFlags: {
          airway: true,
        },
      };

      const expectedResult = {
        action: 'REFER_IMMEDIATE' as const,
        blocks: [],
        avoid: [],
        suggestions: [],
        education: ['ارجاع فوری به پزشک'],
        sources: [],
      };

      mockTriageService.evaluateSymptoms.mockResolvedValue(expectedResult);

      const result = await controller.evaluateSymptoms(triageDto);

      expect(result.action).toBe('REFER_IMMEDIATE');
    });
  });

  describe('GET /api/triage/ingredients', () => {
    it('should return list of OTC ingredients', async () => {
      const expectedIngredients = [
        {
          id: '1',
          name: 'acetaminophen',
          otc_bool: true,
          atc: 'N02BE01',
          rxnorm: '161',
        },
        {
          id: '2',
          name: 'ibuprofen',
          otc_bool: true,
          atc: 'M01AE01',
          rxnorm: '5640',
        },
      ];

      mockTriageService.getIngredients.mockResolvedValue(expectedIngredients);

      const result = await controller.getIngredients();

      expect(service.getIngredients).toHaveBeenCalled();
      expect(result).toEqual(expectedIngredients);
    });
  });

  describe('GET /api/triage/protocols/:condition', () => {
    it('should return latest protocol for condition', async () => {
      const conditionSlug = 'sore_throat';
      const expectedProtocol = {
        id: '1',
        slug: 'sore_throat',
        title_fa: 'گلودرد',
        title_en: 'Sore Throat',
        protocols: [
          {
            id: '1',
            version: 1,
            rules_jsonb: {},
            published_at: new Date(),
          },
        ],
      };

      mockTriageService.getLatestProtocol.mockResolvedValue(expectedProtocol);

      const result = await controller.getProtocol(conditionSlug);

      expect(service.getLatestProtocol).toHaveBeenCalledWith(conditionSlug);
      expect(result).toEqual(expectedProtocol);
    });
  });
});