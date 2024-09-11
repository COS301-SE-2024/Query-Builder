import { render } from '@testing-library/react';
import { Query } from '@/interfaces/intermediateJSON';
import { describe, it, expect, vi, Mock } from 'vitest';
import TableResponse from './TableResponse';
import React from 'react';

vi.mock('./../../utils/supabase/client', () => {
  return {
    createClient: vi.fn().mockImplementation(() => {
      return {
        auth: {
          getSession: vi.fn().mockImplementation(() => {
            return {
              data: vi.fn().mockReturnThis(),
              session: vi.fn().mockReturnThis(),
              access_token: 'randomAccessToken',
            };
          }),
        },
      };
    }),
  };
});

global.fetch = vi.fn((url: string, config: any) => {
  if (url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/schemas`) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: [{ SCHEMA_NAME: 'sakila' }] }),
    });
  } else if (
    url ==
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/get-single-query`
  ) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          parameters: {
            language: 'sql',
            query_type: 'select',
            databaseName: 'sakila',
            table: { name: 'actor', columns: [{ name: 'first_name' }] },
          },
        }),
    });
  } else if (url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query`) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          totalNumRows: 1,
          data: [
            {
              title: 'ACADEMY DINOSAUR',
              qbee_id: 0,
            },
          ],
        }),
    });
  }
}) as Mock;

//basic component rendering tests
describe('TableResponse basic rendering tests', () => {
  it('should render successfully', () => {
    const queryProp: Query = {
      databaseServerID: '1234',
      queryParams: {
        language: 'sql',
        query_type: 'select',
        databaseName: 'sakila',
        table: {
          name: 'film',
          columns: [{ name: 'title' }, { name: 'release_year' }],
        },
      },
    };

    const { baseElement } = render(
      <TableResponse
        query={queryProp}
        metadata={{ title: queryProp.queryParams.databaseName }}
      />,
    );
    expect(baseElement).toBeTruthy();
  });
});
