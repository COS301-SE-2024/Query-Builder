import 'reflect-metadata';
import { validate } from 'class-validator';
import { condition } from './conditions.dto';

describe('dto', () => {
  describe('conditions_dto', () => {
    describe('condition', () => {
      it('should validate the condition correctly', () => {
        const cond = new condition();

        validate(cond).catch((errors) => {
          expect(errors.length).toBe(1);
          expect(errors[0].constraints.isEnum).toBe(
            "type must be one of 'c' or 'p'"
          );
        });
        
        cond.type = 'c';
        validate(cond).then((errors) => {
          expect(errors.length).toBe(0);
        });

        cond.type = 'p';
        validate(cond).then((errors) => {
          expect(errors.length).toBe(0);
        });
      });
    });

    describe('compoundCondition', () => {});

    describe('primitiveCondition', () => {});
  });
});
