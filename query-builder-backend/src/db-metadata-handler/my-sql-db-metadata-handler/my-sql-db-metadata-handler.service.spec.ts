import { Test, TestingModule } from '@nestjs/testing';
import { MySqlDbMetadataHandlerService } from './my-sql-db-metadata-handler.service';
import { Supabase } from '../../supabase/supabase';
import { QueryHandlerModule } from '../../query-handler/query-handler.module';
import { SupabaseModule } from '../../supabase/supabase.module';
import { QueryHandlerService } from '../../query-handler/query-handler.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { Query } from '../../../dist/interfaces/intermediateJSON';

jest.mock('../../supabase/supabase.ts', () => ({
  Supabase: jest.fn().mockImplementation(() => ({
    getClient: jest.fn(),
    getJwt: jest.fn()
  }))
}));

// jest.mock('../../query-handler/query-handler.factory.ts', () => ({
//   QueryHandlerFactory: jest.fn().mockImplementation(() => ({
//     createQueryHandlerService: jest.fn().mockImplementation(
//       () =>
//         ({
//           queryDatabase: jest.fn()
//         }) as unknown as QueryHandlerService
//     )
//   }))
// }));

// jest.mock('../../query-handler/query-handler.service.ts', () => ({
//   QueryHandlerService: jest.fn().mockImplementation(() => ({
//     queryDatabase: jest.fn()
//   }))
// }));

describe('MySqlDbMetadataHandlerService', () => {
  let service: MySqlDbMetadataHandlerService;
  let module: TestingModule;
  let supabase: Supabase;
  let queryHandlerService: QueryHandlerService;
  let data = undefined;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [QueryHandlerModule, SupabaseModule],
      providers: [
        MySqlDbMetadataHandlerService,
        {
          provide: 'Supabase',
          useValue: Supabase
        },
        {
          provide: 'QueryHandlerService',
          useValue: {
            queryDatabase(query: Query, session: Record<string, any>) {
              return { data };
            }
          }
        }
      ]
    }).compile();

    service = module.get<MySqlDbMetadataHandlerService>(
      MySqlDbMetadataHandlerService
    );
    supabase = module.get<Supabase>(Supabase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("should return the QueryHandlerService's results for databases metadata", async () => {
    data = [{ database: 'sakila' }];

    expect(
      await service.getDatabaseMetadata(
        { databaseServerID: '1234', language: 'mysql' },
        {}
      )
    ).toEqual({ data: [{ database: 'sakila' }] });
  });

  it("should return the QueryHandlerService's results.data for tables metadata", async () => {
    data = [{ table_name: 'film' }];

    expect(
      await service.getTableMetadata(
        { databaseServerID: '1234', language: 'mysql', database: 'sakila' },
        {}
      )
    ).toEqual([{ table_name: 'film' }]);
  });

  it("should return the QueryHandlerService's results for fields metadata", async () => {
    data = [{ column_name: 'first_name' }];

    expect(
      await service.getFieldMetadata(
        {
          databaseServerID: '1234',
          language: 'mysql',
          database: 'sakila',
          table: 'actor'
        },
        {}
      )
    ).toEqual({ data: [{ column_name: 'first_name' }] });
  });

  it("should return the QueryHandlerService's results.data for foreign key metadata, for keys pointing away and to the table", async () => {
    data = [{ column_name: 'first_name' }];

    expect(
      await service.getForeignKeyMetadata(
        {
          databaseServerID: '1234',
          language: 'mysql',
          database: 'sakila',
          table: 'actor'
        },
        {}
      )
    ).toEqual([{ column_name: 'first_name' }, { column_name: 'first_name' }]);
  });

  it("should return the QueryHandlerService's results for server summary metadata", async () => {
    data = [
      {
        database_name: 'sakila',
        table_name: 'actor',
        column_name: 'first_name'
      }
    ];

    expect(
      await service.getServerSummary(
        { databaseServerID: '1234', language: 'mysql' },
        {}
      )
    ).toEqual({
      data: [
        {
          database_name: 'sakila',
          table_name: 'actor',
          column_name: 'first_name'
        }
      ]
    });
  });

  describe('should save database metadata', () => {
    let saveDbMetadataDto = {
      databaseServerID: '1234',
      language: 'mysql',
      org_id: undefined,
      db_metadata: {
        schema_name: 'sakila',
        description: 'sakila database',
        tables: [
          {
            table_name: 'film',
            description: 'Test Desc',
            fields: [
              {
                column_name: 'title',
                description: 'The movie title'
              }
            ],
            foreign_keys: [
              {
                table_schema: 'sakila',
                table_name: 'film_actor',
                column_name: 'film_id',
                referenced_column_name: 'film_id'
              }
            ]
          },
          {
            table_name: 'film_actor',
            description: 'joining table',
            foreign_keys: [
              {
                column_name: 'film_id',
                referenced_table_schema: 'sakila',
                table_name: 'film',
                referenced_column_name: 'film_id'
              }
            ]
          }
        ]
      }
    };

    describe('JWT token branch', () => {
      it('should return the correct error message when the jwt token is invalid', async () => {
        await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
          auth: {
            getUser: jest.fn().mockReturnValue({ data: null, error: 'error' })
          }
        } as unknown as SupabaseClient);

        await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
          expect(error).toEqual('error');
        });
      });

      describe('org_id branch', () => {
        beforeEach(async () => {
          await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
            auth: {
              getUser: jest
                .fn()
                .mockReturnValue({ data: { user: { id: 'user_id' } } })
            }
          } as unknown as SupabaseClient);
        });

        describe('org_id not given', () => {
          it('should return the correct error when there is an issue fetching the org_id', async () => {
            await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: undefined,
              error: 'error'
            } as unknown as SupabaseClient);

            await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
              expect(error).toEqual('error');
            });
          });

          describe('user_role branch', () => {
            beforeEach(async () => {
              await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                data: { org_id: 'org_id' }
              } as unknown as SupabaseClient);
            });

            it('should return the correct error when there is an issue fetching the user_role', async () => {
              await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                data: undefined,
                error: 'error'
              } as unknown as SupabaseClient);

              await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
                expect(error).toEqual('error');
              });
            });

            it('should return the correct error when the user_role is member', async () => {
              await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                data: { user_role: 'member' }
              } as unknown as SupabaseClient);

              await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
                expect(error).toEqual(
                  'YUser does not have permission to save metadata'
                );
              });
            });

            it('should return the correct error when there is no user_role', async () => {
              await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                data: { user_role: undefined }
              } as unknown as SupabaseClient);

              await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
                expect(error).toEqual(
                  'User does not have permission to save metadata'
                );
              });
            });

            describe('db_info select branch', () => {
              beforeEach(async () => {
                await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                  from: jest.fn().mockReturnThis(),
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  single: jest.fn().mockReturnThis(),
                  data: { user_role: 'admin' }
                } as unknown as SupabaseClient);
              });

              it('should return the correct error when there is an issue fetching the db_info', async () => {
                await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                  from: jest.fn().mockReturnThis(),
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  single: jest.fn().mockReturnThis(),
                  data: undefined,
                  error: 'error'
                } as unknown as SupabaseClient);

                await service
                  .saveDbMetadata(saveDbMetadataDto)
                  .catch((error) => {
                    expect(error).toEqual('error');
                  });
              });

              describe('db_info update branch', () => {
                beforeEach(async () => {
                  await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                    from: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockReturnThis(),
                    data: {
                      db_info: undefined
                    }
                  } as unknown as SupabaseClient);
                });

                it('should return the correct error when there is an issue updating the db_info', async () => {
                  await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                    from: jest.fn().mockReturnThis(),
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockReturnThis(),
                    data: undefined,
                    error: 'error'
                  } as unknown as SupabaseClient);

                  await service
                    .saveDbMetadata(saveDbMetadataDto)
                    .catch((error) => {
                      expect(error).toEqual('error');
                    });
                });

                it('should return the correct data when the db_info is updated', async () => {
                  await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                    from: jest.fn().mockReturnThis(),
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockReturnThis(),
                    data: { db_info: saveDbMetadataDto.db_metadata }
                  } as unknown as SupabaseClient);

                  const result =
                    await service.saveDbMetadata(saveDbMetadataDto);

                  expect(result).toEqual({
                    data: {
                      db_info: {
                        schema_name: 'sakila',
                        description: 'sakila database',
                        tables: [
                          {
                            table_name: 'film',
                            description: 'Test Desc',
                            fields: [
                              {
                                column_name: 'title',
                                description: 'The movie title'
                              }
                            ],
                            foreign_keys: [
                              {
                                table_schema: 'sakila',
                                table_name: 'film_actor',
                                column_name: 'film_id',
                                referenced_column_name: 'film_id'
                              }
                            ]
                          },
                          {
                            table_name: 'film_actor',
                            description: 'joining table',
                            foreign_keys: [
                              {
                                column_name: 'film_id',
                                referenced_table_schema: 'sakila',
                                table_name: 'film',
                                referenced_column_name: 'film_id'
                              }
                            ]
                          }
                        ]
                      }
                    }
                  });
                });
              });
            });
          });
        });

        describe('org_id given', () => {
          beforeAll(async () => {
            saveDbMetadataDto.org_id = '0000';
          });

          describe('user_role branch', () => {
            it('should return the correct error when there is an issue fetching the user_role', async () => {
              await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                data: undefined,
                error: 'error'
              } as unknown as SupabaseClient);

              await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
                expect(error).toEqual('error');
              });
            });

            it('should return the correct error when the user_role is member', async () => {
              await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                data: { user_role: 'member' }
              } as unknown as SupabaseClient);

              await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
                expect(error).toEqual(
                  'YUser does not have permission to save metadata'
                );
              });
            });

            it('should return the correct error when there is no user_role', async () => {
              await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                data: { user_role: undefined }
              } as unknown as SupabaseClient);

              await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
                expect(error).toEqual(
                  'User does not have permission to save metadata'
                );
              });
            });

            describe('db_info select branch', () => {
              beforeEach(async () => {
                await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                  from: jest.fn().mockReturnThis(),
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  single: jest.fn().mockReturnThis(),
                  data: { user_role: 'admin' }
                } as unknown as SupabaseClient);
              });

              it('should return the correct error when there is an issue fetching the db_info', async () => {
                await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                  from: jest.fn().mockReturnThis(),
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  single: jest.fn().mockReturnThis(),
                  data: undefined,
                  error: 'error'
                } as unknown as SupabaseClient);

                await service
                  .saveDbMetadata(saveDbMetadataDto)
                  .catch((error) => {
                    expect(error).toEqual('error');
                  });
              });

              describe('db_info update branch', () => {
                beforeEach(async () => {
                  await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                    from: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockReturnThis(),
                    data: {
                      db_info: undefined
                    }
                  } as unknown as SupabaseClient);
                });

                it('should return the correct error when there is an issue updating the db_info', async () => {
                  await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                    from: jest.fn().mockReturnThis(),
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockReturnThis(),
                    data: undefined,
                    error: 'error'
                  } as unknown as SupabaseClient);

                  await service
                    .saveDbMetadata(saveDbMetadataDto)
                    .catch((error) => {
                      expect(error).toEqual('error');
                    });
                });

                it('should return the correct data when the db_info is updated', async () => {
                  await jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
                    from: jest.fn().mockReturnThis(),
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockReturnThis(),
                    data: { db_info: saveDbMetadataDto.db_metadata }
                  } as unknown as SupabaseClient);

                  const result =
                    await service.saveDbMetadata(saveDbMetadataDto);

                  expect(result).toEqual({
                    data: {
                      db_info: {
                        schema_name: 'sakila',
                        description: 'sakila database',
                        tables: [
                          {
                            table_name: 'film',
                            description: 'Test Desc',
                            fields: [
                              {
                                column_name: 'title',
                                description: 'The movie title'
                              }
                            ],
                            foreign_keys: [
                              {
                                table_schema: 'sakila',
                                table_name: 'film_actor',
                                column_name: 'film_id',
                                referenced_column_name: 'film_id'
                              }
                            ]
                          },
                          {
                            table_name: 'film_actor',
                            description: 'joining table',
                            foreign_keys: [
                              {
                                column_name: 'film_id',
                                referenced_table_schema: 'sakila',
                                table_name: 'film',
                                referenced_column_name: 'film_id'
                              }
                            ]
                          }
                        ]
                      }
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  it('should get saved database metadata', async () => {
    const getDbMetadataDto = { databaseServerID: '1234', language: 'mysql' };

    const result = await service.getSavedDbMetadata(getDbMetadataDto);

    expect(result).toEqual({
      data: [{ database: 'sakila', description: 'Sakila Database' }]
    });
  });

  it('should get saved table metadata', async () => {
    const getTableMetadataDto = {
      databaseServerID: '1234',
      language: 'mysql',
      database: 'sakila'
    };

    const result = await service.getSavedTableMetadata(getTableMetadataDto);

    expect(result).toEqual({
      data: [{ table_name: 'actor', description: 'Actor Table' }]
    });
  });

  it('should get saved field metadata', async () => {
    const getFieldMetadataDto = {
      databaseServerID: '1234',
      language: 'mysql',
      database: 'sakila',
      table: 'actor'
    };

    const result = await service.getSavedFieldMetadata(getFieldMetadataDto);

    expect(result).toEqual({
      data: [{ name: 'first_name', description: 'First Name' }]
    });
  });

  it('should get saved foreign key metadata', async () => {
    const getFkMetadataDto = {
      databaseServerID: '1234',
      language: 'mysql',
      database: 'sakila',
      table: 'actor'
    };

    const result = await service.getSavedForeignKeyMetadata(getFkMetadataDto);

    expect(result).toEqual({ data: [{ column_name: 'first_name' }] });
  });

  it('should get saved server summary metadata', async () => {
    const getSummaryMetadataDto = {
      databaseServerID: '1234',
      language: 'mysql'
    };

    const result = await service.getSavedServerSummaryMetadata(
      getSummaryMetadataDto
    );

    expect(result).toEqual({
      data: [
        {
          schema_name: 'sakila',
          description: 'Sakila Database',
          tables: [
            {
              table_name: 'actor',
              description: 'Actor Table',
              fields: [
                { column_name: 'first_name', description: 'First Name' }
              ],
              foreign_keys: [{ column_name: 'first_name' }]
            }
          ]
        }
      ]
    });
  });
});
