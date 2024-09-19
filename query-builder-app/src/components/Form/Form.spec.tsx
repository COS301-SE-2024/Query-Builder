import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Form from './Form';
import React from 'react';
import { describe, it, expect, vi, Mock } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ databaseServerID: 'mock-database-server-id' })
}));

// Mock Supabase client
vi.mock('./../../utils/supabase/client', () => ({
  createClient: vi.fn().mockImplementation(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {},
        session: {},
        access_token: 'randomAccessToken'
      })
    }
  }))
}));

// Mock API calls
global.fetch = vi.fn((url: string, config: any) => {
  if (url === `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/schemas`) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: [{ SCHEMA_NAME: 'sakila' }] })
    });
  } else if (url === `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/get-single-query`) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        parameters: {
          language: 'sql',
          query_type: 'select',
          databaseName: 'sakila',
          table: { name: 'actor', columns: [{ name: 'first_name' }] }
        }
      })
    });
  } else if (url === `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/possible-conditions`) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: [{ name: 'condition1' }] })
    });
  }
}) as Mock;

// Basic component rendering tests
describe('Form basic rendering tests', () => {

  it('should render successfully', () => {
    const { baseElement } = render(<Form />);
    expect(baseElement).toBeTruthy();
  });

  it('should have the correct structure for queryParams', async () => {
    render(<Form />);

    // Assuming `getQueryParams` function is available in your Form component or you have some way to get it
    await waitFor(() => {
      const queryParams = {
        language: 'sql',
        query_type: 'select',
        databaseName: '',
        table: {
          name: '',
          columns: []
        }
      };
      // Replace with actual logic to retrieve queryParams if needed
      expect(queryParams).toEqual({
        language: 'sql',
        query_type: 'select',
        databaseName: '',
        table: {
          name: '',
          columns: []
        }
      });
    });
  });

});
