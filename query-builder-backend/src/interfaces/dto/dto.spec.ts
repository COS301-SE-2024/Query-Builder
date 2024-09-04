import 'reflect-metadata';
import { validate } from 'class-validator';
import {
  compoundCondition,
  condition,
  primitiveCondition,
  LogicalOperator,
  AggregateFunction
} from './conditions.dto';
import { join } from './join.dto';
import { plainToInstance } from 'class-transformer';
import { column, table } from './table.dto';
import { DatabaseCredentials, PageParams, SortParams } from './query.dto';

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

    describe('compoundCondition DTO', () => {
      describe('conditions', () => {
        it('should validate the conditions correctly', async () => {
          const raw = {
            type: 'c',
            operator: LogicalOperator.AND,
            conditions: [
              {
                type: 'p',
                value: 'test',
                column: 'column1',
                operator: '='
              }
            ]
          };

          const dto = plainToInstance(compoundCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when conditions is empty', async () => {
          const raw = {
            type: 'c',
            operator: LogicalOperator.AND,
            conditions: [{}, {}]
          };

          const dto = plainToInstance(compoundCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('conditions');
        });

        it('should fail validation when conditions is missing', async () => {
          const raw = {
            type: 'c',
            operator: LogicalOperator.AND
          };

          const dto = plainToInstance(compoundCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('conditions');
        });

        describe('Transformer Decorator', () => {
          it('should correctly transform a nested compound condition', async () => {
            const raw = {
              type: 'c',
              operator: LogicalOperator.AND,
              conditions: [
                {
                  type: 'c',
                  operator: LogicalOperator.OR,
                  conditions: [
                    {
                      type: 'p',
                      value: 'test',
                      column: 'column1',
                      operator: '='
                    }
                  ]
                }
              ]
            };

            const dto = plainToInstance(compoundCondition, raw);
            expect(dto.conditions[0]).toBeInstanceOf(compoundCondition);
          });

          it('should correctly transform a nested primitive condition', async () => {
            const raw = {
              type: 'c',
              operator: LogicalOperator.AND,
              conditions: [
                {
                  type: 'p',
                  value: 'test',
                  column: 'column1',
                  operator: '='
                }
              ]
            };

            const dto = plainToInstance(compoundCondition, raw);
            expect(dto.conditions[0]).toBeInstanceOf(primitiveCondition);
          });

          it('should transform to primitiveCondition when value, column, or operator is not a valid ComparisonOperator', () => {
            const raw = {
              conditions: [
                {
                  value: undefined,
                  column: undefined,
                  operator: 'NOTVALID'
                }
              ],
              operator: 'AND'
            };

            const dto = plainToInstance(compoundCondition, raw);
            expect(dto.conditions[0]).toBeInstanceOf(primitiveCondition);
          });

          it('should transform to primitiveCondition when none of the conditions are met', () => {
            const raw = {
              conditions: [
                {
                  invalidField: 'invalid'
                }
              ],
              operator: 'AND'
            };

            const dto = plainToInstance(compoundCondition, raw);
            expect(dto.conditions[0]).toBeInstanceOf(primitiveCondition);
          });

          it('should transform mixed conditions', () => {
            const raw = {
              conditions: [
                {
                  conditions: [
                    { value: 'test', column: 'column1', operator: 'EQUAL' }
                  ],
                  operator: 'AND'
                },
                {
                  value: 'test',
                  column: 'column1',
                  operator: 'EQUAL'
                }
              ]
            };

            const dto = plainToInstance(compoundCondition, raw);
            expect(dto.conditions[0]).toBeInstanceOf(compoundCondition);
            expect(dto.conditions[1]).toBeInstanceOf(primitiveCondition);
          });

          it('should handle invalid data gracefully', () => {
            const raw = {
              conditions: [
                {
                  invalidField: 'invalid'
                }
              ]
            };

            const dto = plainToInstance(compoundCondition, raw);
            expect(dto.conditions[0]).toBeInstanceOf(primitiveCondition);
          });
        });
      });

      describe('operator', () => {
        it('should validate the operator correctly', async () => {
          const raw = {
            type: 'c',
            operator: LogicalOperator.AND,
            conditions: [
              {
                type: 'p',
                value: 'test',
                column: 'column1',
                operator: '='
              }
            ]
          };

          const dto = plainToInstance(compoundCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when operator is empty', async () => {
          const raw = {
            type: 'c',
            operator: '',
            conditions: [
              {
                type: 'p',
                value: 'test',
                column: 'column1',
                operator: '='
              }
            ]
          };

          const dto = plainToInstance(compoundCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('operator');
        });

        it('should fail validation when operator is missing', async () => {
          const raw = {
            type: 'c',
            conditions: [
              {
                type: 'p',
                value: 'test',
                column: 'column1',
                operator: '='
              }
            ]
          };

          const dto = plainToInstance(compoundCondition, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('operator');
        });
      });
    });
  });

  describe('join dto', () => {
    describe('table1MatchingColumnName', () => {
      it('should validate the table1MatchingColumnName correctly', async () => {
        const raw = {
          table1MatchingColumnName: 'column1',
          table2: {
            name: 'table2',
            columns: [
              {
                name: 'column1'
              }
            ]
          },
          table2MatchingColumnName: 'column1'
        };

        const dto = plainToInstance(join, raw);
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should fail validation when table1MatchingColumnName is empty', async () => {
        const raw = {
          table1MatchingColumnName: '',
          table2: {
            name: 'table2',
            columns: [
              {
                name: 'column1'
              }
            ]
          },
          table2MatchingColumnName: 'column1'
        };

        const dto = plainToInstance(join, raw);
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('table1MatchingColumnName');
      });

      it('should fail validation when table1MatchingColumnName is missing', async () => {
        const raw = {
          table2: {
            name: 'table2',
            columns: [
              {
                name: 'column1'
              }
            ]
          },
          table2MatchingColumnName: 'column1'
        };

        const dto = plainToInstance(join, raw);
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('table1MatchingColumnName');
      });
    });

    describe('table2', () => {
      it('should validate the table2 correctly', async () => {
        const raw = {
          table1MatchingColumnName: 'column1',
          table2: {
            name: 'table2',
            columns: [
              {
                name: 'column1'
              }
            ]
          },
          table2MatchingColumnName: 'column1'
        };

        const dto = plainToInstance(join, raw);
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should fail validation when table2 is empty', async () => {
        const raw = {
          table1MatchingColumnName: 'column1',
          table2: {},
          table2MatchingColumnName: 'column1'
        };

        const dto = plainToInstance(join, raw);
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('table2');
      });

      it('should fail validation when table2 is missing', async () => {
        const raw = {
          table1MatchingColumnName: 'column1',
          table2MatchingColumnName: 'column1'
        };

        const dto = plainToInstance(join, raw);
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('table2');
      });
    });

    describe('table2MatchingColumnName', () => {
      it('should validate the table2MatchingColumnName correctly', async () => {
        const raw = {
          table1MatchingColumnName: 'column1',
          table2: {
            name: 'table2',
            columns: [
              {
                name: 'column1'
              }
            ]
          },
          table2MatchingColumnName: 'column1'
        };

        const dto = plainToInstance(join, raw);
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should fail validation when table2MatchingColumnName is empty', async () => {
        const raw = {
          table1MatchingColumnName: 'column1',
          table2: {
            name: 'table2',
            columns: [
              {
                name: 'column1'
              }
            ]
          },
          table2MatchingColumnName: ''
        };

        const dto = plainToInstance(join, raw);
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('table2MatchingColumnName');
      });

      it('should fail validation when table2MatchingColumnName is missing', async () => {
        const raw = {
          table1MatchingColumnName: 'column1',
          table2: {
            name: 'table2',
            columns: [
              {
                name: 'column1'
              }
            ]
          }
        };

        const dto = plainToInstance(join, raw);
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('table2MatchingColumnName');
      });
    });
  });

  describe('table dto', () => {
    describe('column DTO', () => {
      describe('name', () => {
        it('should validate the name correctly', async () => {
          const raw = {
            name: 'column1'
          };

          const dto = plainToInstance(column, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when name is empty', async () => {
          const raw = {
            name: ''
          };

          const dto = plainToInstance(column, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('name');
        });

        it('should fail validation when name is missing', async () => {
          const raw = {};

          const dto = plainToInstance(column, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('name');
        });
      });

      describe('aggregation', () => {
        it('should validate the aggregation correctly', async () => {
          const raw = {
            name: 'column1',
            aggregation: AggregateFunction.COUNT
          };

          const dto = plainToInstance(column, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when aggregation is empty', async () => {
          const raw = {
            name: 'column1',
            aggregation: ''
          };

          const dto = plainToInstance(column, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('aggregation');
        });

        it('should fail validation when aggregation is missing', async () => {
          const raw = {
            name: 'column1'
          };

          const dto = plainToInstance(column, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });
      });

      describe('alias', () => {
        it('should validate the alias correctly', async () => {
          const raw = {
            name: 'column1',
            alias: 'alias1'
          };

          const dto = plainToInstance(column, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when alias is empty', async () => {
          const raw = {
            name: 'column1',
            alias: ''
          };

          const dto = plainToInstance(column, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('alias');
        });

        it('should fail validation when alias is missing', async () => {
          const raw = {
            name: 'column1'
          };

          const dto = plainToInstance(column, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });
      });
    });

    describe('table DTO', () => {
      describe('name', () => {
        it('should validate the name correctly', async () => {
          const raw = {
            name: 'table1',
            columns: [
              {
                name: 'column1'
              }
            ]
          };

          const dto = plainToInstance(table, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when name is empty', async () => {
          const raw = {
            name: '',
            columns: [
              {
                name: 'column1'
              }
            ]
          };

          const dto = plainToInstance(table, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('name');
        });

        it('should fail validation when name is missing', async () => {
          const raw = {
            columns: [
              {
                name: 'column1'
              }
            ]
          };

          const dto = plainToInstance(table, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('name');
        });
      });

      describe('columns', () => {
        it('should validate the columns correctly', async () => {
          const raw = {
            name: 'table1',
            columns: [
              {
                name: 'column1'
              }
            ]
          };

          const dto = plainToInstance(table, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should pass validation when columns is empty', async () => {
          const raw = {
            name: 'table1',
            columns: []
          };

          const dto = plainToInstance(table, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when columns is missing', async () => {
          const raw = {
            name: 'table1'
          };

          const dto = plainToInstance(table, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('columns');
        });
      });

      describe('join', () => {
        it('should validate the join correctly', async () => {
          const raw = {
            name: 'table1',
            columns: [
              {
                name: 'column1'
              }
            ],
            join: {
              table1MatchingColumnName: 'column1',
              table2: {
                name: 'table2',
                columns: [
                  {
                    name: 'column1'
                  }
                ]
              },
              table2MatchingColumnName: 'column1'
            }
          };

          const dto = plainToInstance(table, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when join is empty', async () => {
          const raw = {
            name: 'table1',
            columns: [
              {
                name: 'column1'
              }
            ],
            join: {}
          };

          const dto = plainToInstance(table, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('join');
        });

        it('should pass validation when join is missing', async () => {
          const raw = {
            name: 'table1',
            columns: [
              {
                name: 'column1'
              }
            ]
          };

          const dto = plainToInstance(table, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });
      });
    });
  });

  describe('query dto', () => {
    describe('DatabaseCredentials DTO', () => {
      describe('user', () => {
        it('should validate the user correctly', async () => {
          const raw = {
            user: 'test',
            password: 'test'
          };

          const dto = plainToInstance(DatabaseCredentials, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when user is empty', async () => {
          const raw = {
            user: '',
            password: 'test'
          };

          const dto = plainToInstance(DatabaseCredentials, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('user');
        });
      });

      describe('password', () => {
        it('should validate the password correctly', async () => {
          const raw = {
            user: 'test',
            password: 'test'
          };

          const dto = plainToInstance(DatabaseCredentials, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when password is empty', async () => {
          const raw = {
            user: 'test',
            password: ''
          };

          const dto = plainToInstance(DatabaseCredentials, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('password');
        });
      });
    });

    describe('SortParams DTO', () => {
      describe('column', () => {
        it('should validate the column correctly', async () => {
          const raw = {
            column: 'column1',
            direction: 'ascending'
          };

          const dto = plainToInstance(SortParams, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when column is empty', async () => {
          const raw = {
            column: '',
            direction: 'ascending'
          };

          const dto = plainToInstance(SortParams, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('column');
        });

        it('should fail validation when column is missing', async () => {
          const raw = {
            direction: 'ascending'
          };

          const dto = plainToInstance(SortParams, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('column');
        });
      });

      describe('direction', () => {
        it('should validate the direction correctly', async () => {
          const raw = {
            column: 'column1',
            direction: 'ascending'
          };

          const dto = plainToInstance(SortParams, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when direction is empty', async () => {
          const raw = {
            column: 'column1',
            direction: ''
          };

          const dto = plainToInstance(SortParams, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('direction');
        });

        it('should pass validation when direction is missing', async () => {
          const raw = {
            column: 'column1'
          };

          const dto = plainToInstance(SortParams, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });
      });
    });

    describe('PageParams DTO', () => {
      describe('pageNumber', () => {
        it('should validate the pageNumber correctly', async () => {
          const raw = {
            pageNumber: 1,
            rowsPerPage: 10
          };

          const dto = plainToInstance(PageParams, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when pageNumber is less than 1', async () => {
          const raw = {
            pageNumber: 0,
            rowsPerPage: 10
          };

          const dto = plainToInstance(PageParams, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('pageNumber');
        });

        it('should fail validation when pageNumber is missing', async () => {
          const raw = {
            rowsPerPage: 10
          };

          const dto = plainToInstance(PageParams, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('pageNumber');
        });
      });

      describe('rowsPerPage', () => {
        it('should validate the rowsPerPage correctly', async () => {
          const raw = {
            pageNumber: 1,
            rowsPerPage: 10
          };

          const dto = plainToInstance(PageParams, raw);
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        });

        it('should fail validation when rowsPerPage is less than 1', async () => {
          const raw = {
            pageNumber: 1,
            rowsPerPage: 0
          };

          const dto = plainToInstance(PageParams, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('rowsPerPage');
        });

        it('should fail validation when rowsPerPage is missing', async () => {
          const raw = {
            pageNumber: 1
          };

          const dto = plainToInstance(PageParams, raw);
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].property).toBe('rowsPerPage');
        });
      });
    });
    
    describe('QueryParams DTO', () => {});
    describe('Query DTO', () => {});
  });
});
