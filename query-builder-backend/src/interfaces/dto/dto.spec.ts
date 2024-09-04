import 'reflect-metadata';
import { validate } from 'class-validator';
import {
  compoundCondition,
  condition,
  primitiveCondition,
  LogicalOperator,
  AggregateFunction,
  ComparisonOperator
} from './conditions.dto';
import { plainToInstance } from 'class-transformer';

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

    describe('primitiveCondition DTO', () => {
      describe('value', () => {
        it('should validate the value correctly', async () => {
          const raw = {
            type: 'p',
            value: 'test',
            column: 'column1',
            operator: '='
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);

          dto.value = 1;
          const errors2 = await validate(dto);
          expect(errors2.length).toBe(0);

          dto.value = null;
          const errors3 = await validate(dto);
          expect(errors3.length).toBe(0);

          dto.value = true;
          const errors4 = await validate(dto);
          expect(errors4.length).toBe(0);
        });

        it('should fail validation when value is missing', async () => {
          const raw = {
            type: 'p',
            column: 'column1',
            operator: '='
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('value');
        });

        it('should fail validation when value is invalid', async () => {
          const raw = {
            type: 'p',
            value: [],
            column: 'column1',
            operator: '='
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('value');
        });

        it('should fail validation when value is empty', async () => {
          const raw = {
            type: 'p',
            value: '',
            column: 'column1',
            operator: '='
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('value');
        });
      });

      describe('tableName', () => {
        it('should validate the tableName correctly', async () => {
          const raw = {
            type: 'p',
            value: 'test',
            column: 'column1',
            operator: '=',
            tableName: 'table1'
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when tableName is empty', async () => {
          const raw = {
            type: 'p',
            value: 'test',
            column: 'column1',
            operator: '=',
            tableName: ''
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('tableName');
        });
      });

      describe('column', () => {
        it('should validate the column correctly', async () => {
          const raw = {
            type: 'p',
            value: 'test',
            column: 'column1',
            operator: '='
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when column is empty', async () => {
          const raw = {
            type: 'p',
            value: 'test',
            column: '',
            operator: '='
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('column');
        });

        it('should fail validation when column is missing', async () => {
          const raw = {
            type: 'p',
            value: 'test',
            operator: '='
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('column');
        });
      });

      describe('operator', () => {
        it('should validate the operator correctly', async () => {
          const raw = {
            type: 'p',
            value: 'test',
            column: 'column1',
            operator: '='
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when operator is empty', async () => {
          const raw = {
            type: 'p',
            value: 'test',
            column: 'column1',
            operator: ''
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('operator');
        });

        it('should fail validation when operator is missing', async () => {
          const raw = {
            type: 'p',
            value: 'test',
            column: 'column1'
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('operator');
        });
      });
      describe('aggregate', () => {
        it('should validate the aggregate correctly', async () => {
          const raw = {
            type: 'p',
            value: 'test',
            column: 'column1',
            operator: '=',
            aggregate: AggregateFunction.COUNT
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when aggregate is empty', async () => {
          const raw = {
            type: 'p',
            value: 'test',
            column: 'column1',
            operator: '=',
            aggregate: ''
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('aggregate');
        });

        it('should fail validation when aggregate is missing', async () => {
          const raw = {
            type: 'p',
            value: 'test',
            column: 'column1',
            operator: '='
          };

          const dto = plainToInstance(primitiveCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });
      });
    });
  });
});
