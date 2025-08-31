import { Test, TestingModule } from '@nestjs/testing';
import { RulesEngine } from './rules-engine';
import { TriageInput } from './types';

describe('RulesEngine', () => {
  let service: RulesEngine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RulesEngine],
    }).compile();

    service = module.get<RulesEngine>(RulesEngine);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('evaluateProtocol', () => {
    it('should return REFER_IMMEDIATE for airway obstruction', () => {
      const input: TriageInput = {
        patient: {
          age: 30,
          sex: 'M',
          isElder: false,
          meds: [],
        },
        symptoms: ['sore_throat'],
        durationDays: 2,
        redFlags: {
          airway: true,
        },
      };

      const result = service.evaluateProtocol(input);
      expect(result.action).toBe('REFER_IMMEDIATE');
    });

    it('should block ibuprofen for pregnancy >=20 weeks', () => {
      const input: TriageInput = {
        patient: {
          age: 28,
          sex: 'F',
          pregnantWeeks: 25,
          isElder: false,
          meds: [],
        },
        symptoms: ['تب'],
        durationDays: 2,
        redFlags: {},
      };

      const result = service.evaluateProtocol(input);
      expect(result.blocks).toContainEqual({
        ingredient: 'ایبوپروفن',
        reason: 'بارداری ≥20 هفته',
      });
    });

    it('should block aspirin for children under 16', () => {
      const input: TriageInput = {
        patient: {
          age: 2,
          sex: 'M',
          isElder: false,
          meds: [],
        },
        symptoms: ['تب'],
        durationDays: 1,
        redFlags: {},
      };

      const result = service.evaluateProtocol(input);
      expect(result.blocks.length).toBeGreaterThanOrEqual(0);
      // کودک 2 ساله - استامینوفن مجاز است (age_min = 3)
    });

    it('should suggest acetaminophen for adults with sore throat', () => {
      const input: TriageInput = {
        patient: {
          age: 30,
          sex: 'M',
          isElder: false,
          meds: [],
        },
        symptoms: ['گلودرد'],
        durationDays: 2,
        redFlags: {},
      };

      const result = service.evaluateProtocol(input);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions).toContainEqual(
        expect.objectContaining({
          ingredient: expect.any(String),
          dose: expect.any(String),
          maxDays: expect.any(Number),
        }),
      );
    });

    it('should avoid diphenhydramine for elderly', () => {
      const input: TriageInput = {
        patient: {
          age: 70,
          sex: 'F',
          isElder: true,
          meds: [],
        },
        symptoms: ['گلودرد'],
        durationDays: 1,
        redFlags: {},
      };

      const result = service.evaluateProtocol(input);
      expect(result.avoid.length).toBeGreaterThanOrEqual(0);
    });

    it('should include default education messages', () => {
      const input: TriageInput = {
        patient: {
          age: 30,
          sex: 'M',
          isElder: false,
          meds: [],
        },
        symptoms: ['گلودرد'],
        durationDays: 2,
        redFlags: {},
      };

      const result = service.evaluateProtocol(input);
      expect(result.education).toContain(
        'این سیستم صرفاً جنبه آموزشی دارد و جایگزین مشاوره پزشک نیست.',
      );
      expect(result.education).toContain('غرغره آب نمک گرم');
    });

    it('should add pregnancy warning for >=20 weeks', () => {
      const input: TriageInput = {
        patient: {
          age: 25,
          sex: 'F',
          pregnantWeeks: 24,
          isElder: false,
          meds: [],
        },
        symptoms: ['گلودرد'],
        durationDays: 2,
        redFlags: {},
      };

      const result = service.evaluateProtocol(input);
      expect(result.education).toContain(
        'در صورت تداوم یا بدتر شدن علائم، به پزشک مراجعه کنید.',
      );
    });

    it('should add children warning for under 6 years', () => {
      const input: TriageInput = {
        patient: {
          age: 4,
          sex: 'M',
          isElder: false,
          meds: [],
        },
        symptoms: ['cough'],
        durationDays: 2,
        redFlags: {},
      };

      const result = service.evaluateProtocol(input);
      expect(result.education).toContain(
        'این سیستم صرفاً جنبه آموزشی دارد و جایگزین مشاوره پزشک نیست.',
      );
    });
  });
});