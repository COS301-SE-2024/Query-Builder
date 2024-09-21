import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ContextMenu from './ContextMenu';

// Mock the Supabase client
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

// Mock the global fetch function
global.fetch = vi.fn();

describe('ContextMenu Component', () => {

  // Test rendering without crashing
  it('renders without crashing', () => {
    const { baseElement } = render(<ContextMenu />);
    expect(baseElement).toBeTruthy();
  });

  // Test the failure case when the fetch fails
  it('handles fetch errors gracefully', async () => {
    // Mock a rejected fetch request
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Fetch failed'))
    );

    render(<ContextMenu />);

    // Assert that no queries message is displayed on failure
    await waitFor(() => {
      expect(screen.getByText('No queries, only empty space...')).toBeInTheDocument();
    });
  });
});
