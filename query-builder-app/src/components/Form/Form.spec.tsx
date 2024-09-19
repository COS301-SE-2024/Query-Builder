import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Form from './Form';
import React from 'react';
import { describe, it, expect, vi, Mock } from 'vitest';

vi.mock('next/navigation', () => ({
  useParams: () => ({ databaseServerID: 'mock-database-server-id' })
}));

// Mock out Supabase access token retrieval
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

// Mock out the API calls
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
  }
}) as Mock;

describe('Form basic rendering tests', () => {

  it('should render successfully', () => {
    const { baseElement } = render(<Form />);
    expect(baseElement).toBeTruthy();
  });

  it('should have the correct initial structure for queryParams', async () => {
    render(<Form />);
    
    // Wait for the form to be populated with initial data
    await waitFor(() => {
      // The queryParams should be initialized with the default values
      const queryParams = {
        language: 'sql',
        query_type: 'select',
        databaseName: '',
        table: {
          name: '',
          columns: []
        }
      };
      // Check that the queryParams state is initialized correctly
      expect(screen.getByText(queryParams.databaseName)).toBeInTheDocument();
    });
  });

  it('should clear the form when "Clear Form" button is clicked', async () => {
    render(<Form />);
    
    // Wait for the form to be populated with initial data
    await waitFor(() => {
      // Click the "Clear Form" button
      const clearButton = screen.getByText('Clear Form');
      fireEvent.click(clearButton);
      
      // Check if the databaseName field is empty
      expect(screen.queryByText('sakila')).toBeNull(); // Check if the old databaseName is not present
      expect(screen.getByText('')).toBeInTheDocument(); // Check if the databaseName field is empty
    });
  });

});
