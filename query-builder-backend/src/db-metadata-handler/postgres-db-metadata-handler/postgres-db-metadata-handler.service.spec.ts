import { Test, TestingModule } from '@nestjs/testing';
import { PostgresDbMetadataHandlerService } from './postgres-db-metadata-handler.service';
import { Query } from './../../interfaces/dto/query.dto';
import { QueryHandlerModule } from '../../query-handler/query-handler.module';
import { SupabaseModule } from '../../supabase/supabase.module';
import { Supabase } from '../../supabase/supabase';

jest.mock('../../supabase/supabase.ts', () => ({
  Supabase: jest.fn().mockImplementation(() => ({
    getClient: jest.fn(),
    getJwt: jest.fn()
  }))
}));

describe('PostgresDbMetadataHandlerService', () => {
  let service: PostgresDbMetadataHandlerService;
  let supabase: Supabase;
  let module: TestingModule;
  let testData = undefined;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [QueryHandlerModule, SupabaseModule],
      providers: [
        PostgresDbMetadataHandlerService,
        {
          provide: 'Supabase',
          useValue: Supabase
        },
        {
          provide: 'QueryHandlerService',
          useValue: {
            queryDatabase(query: Query, session: Record<string, any>) {
              return { data: testData };
            }
          }
        }
      ]
    }).compile();

    service = module.get<PostgresDbMetadataHandlerService>(
      PostgresDbMetadataHandlerService
    );
    supabase = module.get<Supabase>(Supabase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("should return the QueryHandlerService's results for databases metadata", async () => {
    testData = [{ database: 'sakila' }];
    jest.spyOn(service, 'getSavedDbMetadata').mockReturnValueOnce(
      Promise.resolve({
        data:
          [
            { database: 'sakila', description: 'sakila database' }
          ]
      }));
    expect(
      await service.getDatabaseMetadata(
        { databaseServerID: '1234', language: 'postgresql' },
        {}
      )
    ).toEqual({ data: [{ database: 'sakila' }] });
  });

  it("should return the QueryHandlerService's results.data for tables metadata", async () => {
    testData = [{ table_name: 'film' }];
    jest.spyOn(service, 'getSavedTableMetadata').mockResolvedValueOnce(
      Promise.resolve({
        data: [
          { table_name: 'film', description: 'Test Desc' },
          { table_name: 'film_actor', description: 'joining table' }
        ]
      }
      )
    );
    expect(
      await service.getTableMetadata(
        {
          databaseServerID: '1234',
          language: 'postgresql',
          database: 'sakila'
        },
        {}
      )
    ).toEqual([{ table_name: 'film' }]);
  });

  it("should return the QueryHandlerService's results for fields metadata", async () => {
    testData = [{ column_name: 'first_name' }];
    jest.spyOn(service, 'getSavedFieldMetadata').mockResolvedValueOnce(
      Promise.resolve(
        { data: [{ name: 'title', description: 'The movie title' }] }
      )
    );
    expect(
      await service.getFieldMetadata(
        {
          databaseServerID: '1234',
          language: 'postgresql',
          database: 'sakila',
          table: 'actor'
        },
        {}
      )
    ).toEqual({ data: [{ column_name: 'first_name' }] });
  });

  it("should return the QueryHandlerService's results.data for foreign key metadata, for keys pointing away and to the table", async () => {
    testData = [{ column_name: 'first_name' }];
    jest.spyOn(service, 'getSavedForeignKeyMetadata').mockResolvedValueOnce(
      Promise.resolve({
        data: [
          {
            table_name: 'film_actor',
            column_name: 'film_id',
            table_schema: 'sakila',
            referenced_column_name: 'film_id'
          }
        ]
      })
    );
    expect(
      await service.getForeignKeyMetadata(
        {
          databaseServerID: '1234',
          language: 'postgresql',
          database: 'sakila',
          table: 'actor'
        },
        {}
      )
    ).toEqual([{ column_name: 'first_name' }, { column_name: 'first_name' }]);
  });

  it("should return the QueryHandlerService's results for server summary metadata", async () => {
    testData = [{ table_name: 'actor', column_name: 'first_name' }];

    expect(
      await service.getServerSummary(
        { databaseServerID: '1234', language: 'postgresql' },
        {}
      )
    ).toEqual([
      {
        DATABASE_NAME: undefined,
        table_name: 'actor',
        column_name: 'first_name'
      }
    ]);
  });

  describe('should save database metadata', () => {
    let spy: jest.SpyInstance;

    let saveDbMetadataDto = {
      databaseServerID: '1234',
      language: 'postgresql',
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
      beforeEach(() => {
        spy = jest.spyOn(supabase, 'getClient');
      });

      afterEach(() => {
        spy.mockRestore();
      });

      it('should return the correct error message when the jwt token is invalid', async () => {
        spy.mockReturnValueOnce({
          auth: {
            getUser: jest
              .fn()
              .mockReturnValue({ data: undefined, error: 'error' })
          }
        } as any);

        await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
          expect(error).toEqual('error');
        });
      });

      describe('org_id branch', () => {
        beforeEach(() => {
          spy.mockReturnValueOnce({
            auth: {
              getUser: jest
                .fn()
                .mockReturnValue({ data: { user: { id: 'user_id' } } })
            }
          } as any);
        });

        describe('org_id not given', () => {
          beforeEach(() => {
            saveDbMetadataDto.org_id = undefined;
          });

          it('should return the correct error when there is an issue fetching the org_id', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              error: 'error'
            } as any);

            await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
              expect(error).toEqual('error');
            });
          });

          describe('user_role branch', () => {
            beforeEach(() => {
              spy.mockReturnValueOnce({
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                data: { org_id: 'nice' }
              } as any);
            });

            it('should return the correct error when there is an issue fetching the user_role', async () => {
              spy.mockReturnValueOnce({
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                data: undefined,
                error: 'error'
              } as any);

              await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
                expect(error).toEqual('error');
              });
            });

            it('should return the correct error when the user_role is member', async () => {
              spy.mockReturnValueOnce({
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                data: { user_role: 'member' },
                error: undefined
              } as any);

              await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
                expect(error.message).toEqual(
                  'User does not have permission to save metadata'
                );
              });
            });

            it('should return the correct error when there is no user_role', async () => {
              spy.mockReturnValueOnce({
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                data: undefined,
                error: undefined
              } as any);

              await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
                expect(error.message).toEqual(
                  'User does not have permission to save metadata'
                );
              });
            });

            describe('db_info select branch', () => {
              beforeEach(() => {
                spy.mockReturnValueOnce({
                  from: jest.fn().mockReturnThis(),
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  single: jest.fn().mockReturnThis(),
                  data: { user_role: 'admin' }
                } as any);
              });

              it('should return the correct error when there is an issue fetching the db_info', async () => {
                spy.mockReturnValueOnce({
                  from: jest.fn().mockReturnThis(),
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  single: jest.fn().mockReturnThis(),
                  data: undefined,
                  error: 'error'
                } as any);

                await service
                  .saveDbMetadata(saveDbMetadataDto)
                  .catch((error) => {
                    expect(error).toEqual('error');
                  });
              });

              describe('combine existing and new metadata branch', () => {
                describe('no existing metadata branch', () => {
                  beforeEach(() => {
                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: {
                        db_info: undefined
                      }
                    } as any);
                  });

                  it('should return the correct error when there is an issue updating the db_info', async () => {
                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      update: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: undefined,
                      error: 'error'
                    } as any);

                    await service
                      .saveDbMetadata(saveDbMetadataDto)
                      .catch((error) => {
                        expect(error).toEqual('error');
                      });
                  });

                  it('should return the correct data when the db_info is updated', async () => {
                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      update: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: { db_info: saveDbMetadataDto.db_metadata }
                    } as any);

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

                describe('existing metadata branch', () => {
                  it('should return the correct data when the schema is not in the db_info.databases array', async () => {
                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: {
                        db_info: {
                          databases: []
                        }
                      }
                    } as any);

                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      update: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: { db_info: saveDbMetadataDto.db_metadata }
                    } as any);

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
                  it('should return the correct data when the schema is in the db_info.databases array and must be updated', async () => {
                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: {
                        db_info: {
                          databases: [
                            {
                              schema_name: 'sakila',
                              description: 'sakila database',
                              tables: []
                            }
                          ]
                        }
                      }
                    } as any);

                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      update: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: { db_info: saveDbMetadataDto.db_metadata }
                    } as any);

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

                  it('should return the correct data when the table is not in the db_info.databases.tables array', async () => {
                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: {
                        db_info: {
                          databases: [
                            {
                              schema_name: 'sakila',
                              description: 'sakila database',
                              tables: []
                            }
                          ]
                        }
                      }
                    } as any);

                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      update: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: { db_info: saveDbMetadataDto.db_metadata }
                    } as any);

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
                  it('should return the correct data when the table is in the db_info.databases.tables array and must be updated', async () => {
                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: {
                        db_info: {
                          databases: [
                            {
                              schema_name: 'sakila',
                              description: 'sakila database',
                              tables: [
                                {
                                  table_name: 'film',
                                  description: 'Test Desc',
                                  fields: [],
                                  foreign_keys: []
                                }
                              ]
                            }
                          ]
                        }
                      }
                    } as any);

                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      update: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: { db_info: saveDbMetadataDto.db_metadata }
                    } as any);

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

                  it('should return the correct data when the field is not in the db_info.databases.tables.fields array', async () => {
                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: {
                        db_info: {
                          databases: [
                            {
                              schema_name: 'sakila',
                              description: 'sakila database',
                              tables: [
                                {
                                  table_name: 'film',
                                  description: 'Test Desc',
                                  fields: [],
                                  foreign_keys: []
                                }
                              ]
                            }
                          ]
                        }
                      }
                    } as any);

                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      update: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: { db_info: saveDbMetadataDto.db_metadata }
                    } as any);

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
                  it('should return the correct data when the field is in the db_info.databases.tables.fields array and must be updated', async () => {
                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: {
                        db_info: {
                          databases: [
                            {
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
                                  foreign_keys: []
                                }
                              ]
                            }
                          ]
                        }
                      }
                    } as any);

                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      update: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: { db_info: saveDbMetadataDto.db_metadata }
                    } as any);

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
                  it('should return the correct data when the fields array does not exist', async () => {
                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: {
                        db_info: {
                          databases: [
                            {
                              schema_name: 'sakila',
                              description: 'sakila database',
                              tables: [
                                {
                                  table_name: 'film',
                                  description: 'Test Desc',
                                  foreign_keys: []
                                }
                              ]
                            }
                          ]
                        }
                      }
                    } as any);

                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      update: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: { db_info: saveDbMetadataDto.db_metadata }
                    } as any);

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

                  it('should return the correct data when the foreign key is not in the db_info.databases.tables.foreign_keys array', async () => {
                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: {
                        db_info: {
                          databases: [
                            {
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
                                  foreign_keys: []
                                }
                              ]
                            }
                          ]
                        }
                      }
                    } as any);

                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      update: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: { db_info: saveDbMetadataDto.db_metadata }
                    } as any);

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
                  it('should return the correct data when the foreign key is in the db_info.databases.tables.foreign_keys array and must be updated', async () => {
                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: {
                        db_info: {
                          databases: [
                            {
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
                                }
                              ]
                            }
                          ]
                        }
                      }
                    } as any);

                    spy.mockReturnValueOnce({
                      from: jest.fn().mockReturnThis(),
                      update: jest.fn().mockReturnThis(),
                      eq: jest.fn().mockReturnThis(),
                      select: jest.fn().mockReturnThis(),
                      single: jest.fn().mockReturnThis(),
                      data: { db_info: saveDbMetadataDto.db_metadata }
                    } as any);

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

        describe('org_id given', () => {
          beforeAll(() => {
            saveDbMetadataDto.org_id = '0000';
          });

          describe('user_role branch', () => {
            it('should return the correct error when there is an issue fetching the user_role', async () => {
              spy.mockReturnValueOnce({
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                data: undefined,
                error: 'error'
              } as any);

              await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
                expect(error).toEqual('error');
              });
            });

            it('should return the correct error when the user_role is member', async () => {
              spy.mockReturnValueOnce({
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                data: { user_role: 'member' }
              } as any);

              await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
                expect(error.message).toEqual(
                  'User does not have permission to save metadata'
                );
              });
            });

            it('should return the correct error when there is no user_role', async () => {
              spy.mockReturnValueOnce({
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                data: undefined,
                error: undefined
              } as any);

              await service.saveDbMetadata(saveDbMetadataDto).catch((error) => {
                expect(error.message).toEqual(
                  'User does not have permission to save metadata'
                );
              });
            });

            describe('db_info select branch', () => {
              beforeEach(() => {
                spy.mockReturnValueOnce({
                  from: jest.fn().mockReturnThis(),
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  single: jest.fn().mockReturnThis(),
                  data: { user_role: 'admin' }
                } as any);
              });

              it('should return the correct error when there is an issue fetching the db_info', async () => {
                spy.mockReturnValueOnce({
                  from: jest.fn().mockReturnThis(),
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  single: jest.fn().mockReturnThis(),
                  data: undefined,
                  error: 'error'
                } as any);

                await service
                  .saveDbMetadata(saveDbMetadataDto)
                  .catch((error) => {
                    expect(error).toEqual('error');
                  });
              });

              describe('db_info update branch', () => {
                beforeEach(() => {
                  spy.mockReturnValueOnce({
                    from: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockReturnThis(),
                    data: {
                      db_info: undefined
                    }
                  } as any);
                });

                it('should return the correct error when there is an issue updating the db_info', async () => {
                  spy.mockReturnValueOnce({
                    from: jest.fn().mockReturnThis(),
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockReturnThis(),
                    data: undefined,
                    error: 'error'
                  } as any);

                  await service
                    .saveDbMetadata(saveDbMetadataDto)
                    .catch((error) => {
                      expect(error).toEqual('error');
                    });
                });

                it('should return the correct data when the db_info is updated', async () => {
                  spy.mockReturnValueOnce({
                    from: jest.fn().mockReturnThis(),
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockReturnThis(),
                    data: { db_info: saveDbMetadataDto.db_metadata }
                  } as any);

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

  describe('should get saved database metadata', () => {
    describe('JWT token branch', () => {
      let spy: jest.SpyInstance;

      beforeEach(() => {
        spy = jest.spyOn(supabase, 'getClient');
      });

      afterEach(() => {
        spy.mockRestore();
      });

      it('should return the correct error message when the jwt token is invalid', async () => {
        spy.mockReturnValueOnce({
          auth: {
            getUser: jest
              .fn()
              .mockReturnValue({ data: undefined, error: 'error' })
          }
        } as any);

        await service
          .getSavedDbMetadata({
            databaseServerID: '1234',
            language: 'postgresql'
          })
          .catch((error) => {
            expect(error).toEqual('error');
          });
      });

      describe('org_id branch', () => {
        beforeEach(() => {
          spy.mockReturnValueOnce({
            auth: {
              getUser: jest
                .fn()
                .mockReturnValue({ data: { user: { id: 'user_id' } } })
            }
          } as any);
        });

        it('should return the correct error when there is an issue fetching the org_id', async () => {
          spy.mockReturnValueOnce({
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            error: 'error'
          } as any);

          await service
            .getSavedDbMetadata({
              databaseServerID: '1234',
              language: 'postgresql'
            })
            .catch((error) => {
              expect(error).toEqual('error');
            });
        });

        describe('metadata select branch', () => {
          beforeEach(() => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: { org_id: 'nice' }
            } as any);
          });

          it('should return the correct error when there is an issue fetching the metadata', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: undefined,
              error: 'error'
            } as any);

            await service
              .getSavedDbMetadata({
                databaseServerID: '1234',
                language: 'postgresql'
              })
              .catch((error) => {
                expect(error).toEqual('error');
              });
          });

          it('should return the correct data when the metadata does not exist', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: { db_info: undefined }
            } as any);

            const result = await service.getSavedDbMetadata({
              databaseServerID: '1234',
              language: 'postgresql'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when the metadata exists', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: {
                db_info: {
                  databases: [
                    {
                      schema_name: 'sakila',
                      description: 'Sakila Database',
                      tables: []
                    }
                  ]
                }
              }
            } as any);

            const result = await service.getSavedDbMetadata({
              databaseServerID: '1234',
              language: 'postgresql'
            });

            expect(result).toEqual({
              data: [
                {
                  database: 'sakila',
                  description: 'Sakila Database'
                }
              ]
            });
          });
        });
      });
    });
  });

  describe('should get saved table metadata', () => {
    describe('JWT token branch', () => {
      let spy: jest.SpyInstance;

      beforeEach(() => {
        spy = jest.spyOn(supabase, 'getClient');
      });

      afterEach(() => {
        spy.mockRestore();
      });

      it('should return the correct error message when the jwt token is invalid', async () => {
        spy.mockReturnValueOnce({
          auth: {
            getUser: jest
              .fn()
              .mockReturnValue({ data: undefined, error: 'error' })
          }
        } as any);

        await service
          .getSavedTableMetadata({
            databaseServerID: '1234',
            language: 'postgresql',
            database: 'sakila'
          })
          .catch((error) => {
            expect(error).toEqual('error');
          });
      });

      describe('org_id branch', () => {
        beforeEach(() => {
          spy.mockReturnValueOnce({
            auth: {
              getUser: jest
                .fn()
                .mockReturnValue({ data: { user: { id: 'user_id' } } })
            }
          } as any);
        });

        it('should return the correct error when there is an issue fetching the org_id', async () => {
          spy.mockReturnValueOnce({
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            error: 'error'
          } as any);

          await service
            .getSavedTableMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila'
            })
            .catch((error) => {
              expect(error).toEqual('error');
            });
        });

        describe('metadata select branch', () => {
          beforeEach(() => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: { org_id: 'nice' }
            } as any);
          });

          it('should return the correct error when there is an issue fetching the metadata', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: undefined,
              error: 'error'
            } as any);

            await service
              .getSavedTableMetadata({
                databaseServerID: '1234',
                language: 'postgresql',
                database: 'sakila'
              })
              .catch((error) => {
                expect(error).toEqual('error');
              });
          });

          it('should return the correct data when the metadata does not exist', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: { db_info: undefined }
            } as any);

            const result = await service.getSavedTableMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when database metadata does not exist', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: { db_info: { databases: [] } }
            } as any);

            const result = await service.getSavedTableMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when table metadata does not exist', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: {
                db_info: {
                  databases: [
                    {
                      schema_name: 'sakila',
                      description: 'Sakila Database'
                    }
                  ]
                }
              }
            } as any);

            const result = await service.getSavedTableMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when the metadata exists', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: {
                db_info: {
                  databases: [
                    {
                      schema_name: 'sakila',
                      description: 'Sakila Database',
                      tables: [
                        { table_name: 'actor', description: 'Actor Table' }
                      ]
                    }
                  ]
                }
              }
            } as any);

            const result = await service.getSavedTableMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila'
            });

            expect(result).toEqual({
              data: [{ table_name: 'actor', description: 'Actor Table' }]
            });
          });
        });
      });
    });
  });

  describe('should get saved field metadata', () => {
    describe('JWT token branch', () => {
      let spy: jest.SpyInstance;

      beforeEach(() => {
        spy = jest.spyOn(supabase, 'getClient');
      });

      afterEach(() => {
        spy.mockRestore();
      });

      it('should return the correct error message when the jwt token is invalid', async () => {
        spy.mockReturnValueOnce({
          auth: {
            getUser: jest
              .fn()
              .mockReturnValue({ data: undefined, error: 'error' })
          }
        } as any);

        await service
          .getSavedFieldMetadata({
            databaseServerID: '1234',
            language: 'postgresql',
            database: 'sakila',
            table: 'actor'
          })
          .catch((error) => {
            expect(error).toEqual('error');
          });
      });

      describe('org_id branch', () => {
        beforeEach(() => {
          spy.mockReturnValueOnce({
            auth: {
              getUser: jest
                .fn()
                .mockReturnValue({ data: { user: { id: 'user_id' } } })
            }
          } as any);
        });

        it('should return the correct error when there is an issue fetching the org_id', async () => {
          spy.mockReturnValueOnce({
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            error: 'error'
          } as any);

          await service
            .getSavedFieldMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila',
              table: 'actor'
            })
            .catch((error) => {
              expect(error).toEqual('error');
            });
        });

        describe('metadata select branch', () => {
          beforeEach(() => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: { org_id: 'nice' }
            } as any);
          });

          it('should return the correct error when there is an issue fetching the metadata', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: undefined,
              error: 'error'
            } as any);

            await service
              .getSavedFieldMetadata({
                databaseServerID: '1234',
                language: 'postgresql',
                database: 'sakila',
                table: 'actor'
              })
              .catch((error) => {
                expect(error).toEqual('error');
              });
          });

          it('should return the correct data when the metadata does not exist', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: { db_info: undefined }
            } as any);

            const result = await service.getSavedFieldMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila',
              table: 'actor'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when databases array is empty', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: { db_info: { databases: [] } }
            } as any);

            const result = await service.getSavedFieldMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila',
              table: 'actor'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when table metadata does not exist', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: {
                db_info: {
                  databases: [
                    {
                      schema_name: 'sakila',
                      description: 'Sakila Database'
                    }
                  ]
                }
              }
            } as any);

            const result = await service.getSavedFieldMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila',
              table: 'actor'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when table metadata is empty', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: {
                db_info: {
                  databases: [
                    {
                      schema_name: 'sakila',
                      description: 'Sakila Database',
                      tables: []
                    }
                  ]
                }
              }
            } as any);

            const result = await service.getSavedFieldMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila',
              table: 'actor'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when fields metadata does not exist', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: {
                db_info: {
                  databases: [
                    {
                      schema_name: 'sakila',
                      description: 'Sakila Database',
                      tables: [
                        { table_name: 'actor', description: 'Actor Table' }
                      ]
                    }
                  ]
                }
              }
            } as any);

            const result = await service.getSavedFieldMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila',
              table: 'actor'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when the metadata exists', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: {
                db_info: {
                  databases: [
                    {
                      schema_name: 'sakila',
                      description: 'Sakila Database',
                      tables: [
                        {
                          table_name: 'actor',
                          fields: [
                            {
                              column_name: 'first_name',
                              description: 'First Name'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            } as any);

            const result = await service.getSavedFieldMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila',
              table: 'actor'
            });

            expect(result).toEqual({
              data: [{ name: 'first_name', description: 'First Name' }]
            });
          });
        });
      });
    });
  });

  describe('should get saved foreign key metadata', () => {
    describe('JWT token branch', () => {
      let spy: jest.SpyInstance;

      beforeEach(() => {
        spy = jest.spyOn(supabase, 'getClient');
      });

      afterEach(() => {
        spy.mockRestore();
      });

      it('should return the correct error message when the jwt token is invalid', async () => {
        spy.mockReturnValueOnce({
          auth: {
            getUser: jest
              .fn()
              .mockReturnValue({ data: undefined, error: 'error' })
          }
        } as any);

        await service
          .getSavedForeignKeyMetadata({
            databaseServerID: '1234',
            language: 'postgresql',
            database: 'sakila',
            table: 'actor'
          })
          .catch((error) => {
            expect(error).toEqual('error');
          });
      });

      describe('org_id branch', () => {
        beforeEach(() => {
          spy.mockReturnValueOnce({
            auth: {
              getUser: jest
                .fn()
                .mockReturnValue({ data: { user: { id: 'user_id' } } })
            }
          } as any);
        });

        it('should return the correct error when there is an issue fetching the org_id', async () => {
          spy.mockReturnValueOnce({
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            error: 'error'
          } as any);

          await service
            .getSavedForeignKeyMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila',
              table: 'actor'
            })
            .catch((error) => {
              expect(error).toEqual('error');
            });
        });

        describe('metadata select branch', () => {
          beforeEach(() => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: { org_id: 'nice' }
            } as any);
          });

          it('should return the correct error when there is an issue fetching the metadata', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: undefined,
              error: 'error'
            } as any);

            await service
              .getSavedForeignKeyMetadata({
                databaseServerID: '1234',
                language: 'postgresql',
                database: 'sakila',
                table: 'actor'
              })
              .catch((error) => {
                expect(error).toEqual('error');
              });
          });

          it('should return the correct data when the metadata does not exist', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: { db_info: undefined }
            } as any);

            const result = await service.getSavedForeignKeyMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila',
              table: 'actor'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when databases array is empty', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: { db_info: { databases: [] } }
            } as any);

            const result = await service.getSavedForeignKeyMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila',
              table: 'actor'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when table metadata does not exist', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: {
                db_info: {
                  databases: [
                    {
                      schema_name: 'sakila',
                      description: 'Sakila Database'
                    }
                  ]
                }
              }
            } as any);

            const result = await service.getSavedForeignKeyMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila',
              table: 'actor'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when table metadata is empty', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: {
                db_info: {
                  databases: [
                    {
                      schema_name: 'sakila',
                      description: 'Sakila Database',
                      tables: []
                    }
                  ]
                }
              }
            } as any);

            const result = await service.getSavedForeignKeyMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila',
              table: 'actor'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when fields metadata does not exist', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: {
                db_info: {
                  databases: [
                    {
                      schema_name: 'sakila',
                      description: 'Sakila Database',
                      tables: [
                        { table_name: 'actor', description: 'Actor Table' }
                      ]
                    }
                  ]
                }
              }
            } as any);

            const result = await service.getSavedForeignKeyMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila',
              table: 'actor'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when the metadata exists', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: {
                db_info: {
                  databases: [
                    {
                      schema_name: 'sakila',
                      description: 'Sakila Database',
                      tables: [
                        {
                          table_name: 'actor',
                          foreign_keys: [
                            {
                              column_name: 'first_name',
                              description: 'First Name'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            } as any);

            const result = await service.getSavedForeignKeyMetadata({
              databaseServerID: '1234',
              language: 'postgresql',
              database: 'sakila',
              table: 'actor'
            });

            expect(result).toEqual({
              data: [{ column_name: 'first_name', description: 'First Name' }]
            });
          });
        });
      });
    });
  });

  describe('should get saved server summary metadata', () => {
    describe('JWT token branch', () => {
      let spy: jest.SpyInstance;

      beforeEach(() => {
        spy = jest.spyOn(supabase, 'getClient');
      });

      afterEach(() => {
        spy.mockRestore();
      });

      it('should return the correct error message when the jwt token is invalid', async () => {
        spy.mockReturnValueOnce({
          auth: {
            getUser: jest
              .fn()
              .mockReturnValue({ data: undefined, error: 'error' })
          }
        } as any);

        await service
          .getSavedServerSummaryMetadata({
            databaseServerID: '1234',
            language: 'postgresql'
          })
          .catch((error) => {
            expect(error).toEqual('error');
          });
      });

      describe('org_id branch', () => {
        beforeEach(() => {
          spy.mockReturnValueOnce({
            auth: {
              getUser: jest
                .fn()
                .mockReturnValue({ data: { user: { id: 'user_id' } } })
            }
          } as any);
        });

        it('should return the correct error when there is an issue fetching the org_id', async () => {
          spy.mockReturnValueOnce({
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            error: 'error'
          } as any);

          await service
            .getSavedServerSummaryMetadata({
              databaseServerID: '1234',
              language: 'postgresql'
            })
            .catch((error) => {
              expect(error).toEqual('error');
            });
        });

        describe('metadata select branch', () => {
          beforeEach(() => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: { org_id: 'nice' }
            } as any);
          });

          it('should return the correct error when there is an issue fetching the metadata', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: undefined,
              error: 'error'
            } as any);

            await service
              .getSavedServerSummaryMetadata({
                databaseServerID: '1234',
                language: 'postgresql'
              })
              .catch((error) => {
                expect(error).toEqual('error');
              });
          });

          it('should return the correct data when the metadata does not exist', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: { db_info: undefined }
            } as any);

            const result = await service.getSavedServerSummaryMetadata({
              databaseServerID: '1234',
              language: 'postgresql'
            });

            expect(result).toEqual({ data: [] });
          });

          it('should return the correct data when the metadata exists', async () => {
            spy.mockReturnValueOnce({
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockReturnThis(),
              data: {
                db_info: {
                  databases: [
                    {
                      schema_name: 'sakila',
                      description: 'Sakila Database',
                      tables: [
                        {
                          table_name: 'actor',
                          description: 'Actor Table',
                          fields: [
                            {
                              column_name: 'first_name',
                              description: 'First Name'
                            }
                          ],
                          foreign_keys: [{ column_name: 'first_name' }]
                        }
                      ]
                    }
                  ]
                }
              }
            } as any);

            const result = await service.getSavedServerSummaryMetadata({
              databaseServerID: '1234',
              language: 'postgresql'
            });

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
                        {
                          column_name: 'first_name',
                          description: 'First Name'
                        }
                      ],
                      foreign_keys: [{ column_name: 'first_name' }]
                    }
                  ]
                }
              ]
            });
          });
        });
      });
    });
  });
});
