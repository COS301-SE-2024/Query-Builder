import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignedInHomePage from './SignedInHomePage';
import { describe, it, expect, vi } from 'vitest';

// Mock the necessary components and modules
vi.mock('./../../utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'mocked_access_token'
          }
        }
      })
    }
  })
}));

vi.mock('../DatabaseConnectionModal/DatabaseConnectionModal', () => ({
  __esModule: true,
  default: ({ org_id, on_add }: { org_id: string, on_add: () => void }) => (
    <div data-testid="DatabaseConnectionModal">
      <button onClick={on_add}>Add DB</button>
    </div>
  )
}));

describe('SignedInHomePage', () => {
  // Mock fetch globally
  beforeAll(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          org_data: [
            {
              created_at: '2023-01-01T00:00:00.000Z',
              logo: 'logo_url',
              name: 'Test Organisation',
              org_id: 'org_123',
              db_envs: [
                {
                  created_at: '2023-01-01T00:00:00.000Z',
                  name: 'Test Database',
                  db_id: 'db_123',
                  db_info: {},
                  type: 'PostgreSQL'
                }
              ],
              org_members: ['member_1']
            }
          ]
        })
      })
    ) as jest.Mock;
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('fetches and displays organisations and databases', async () => {
    render(<SignedInHomePage />);

    // Check that the organisation name is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Organisation')).toBeInTheDocument();
    });

    // Check that the database name is displayed
    expect(screen.getByText('Test Database')).toBeInTheDocument();

    // Check that the DatabaseConnectionModal is displayed
    expect(screen.getByTestId('DatabaseConnectionModal')).toBeInTheDocument();
  });

  it('calls fetchOrgs on modal add', async () => {
    render(<SignedInHomePage />);

    // Simulate clicking the add button in the modal
    await waitFor(() => {
      screen.getByText('Add DB').click();
    });

    // Check that fetch has been called again (fetchOrgs is called again)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3); // Once for initial load and once for add
    });
  });
});
