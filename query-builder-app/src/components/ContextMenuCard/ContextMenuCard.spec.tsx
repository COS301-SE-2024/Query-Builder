import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ContextMenuCard from './ContextMenuCard'; // Adjust the import based on your file structure

// Mock functions
const mockOnDelete = vi.fn();
const mockPush = vi.fn();

// Mock the `useRouter` hook
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the Supabase client
vi.mock('./../../utils/supabase/client', () => ({
  createClient: vi.fn().mockImplementation(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {},
        session: {},
        access_token: 'randomAccessToken',
      }),
    },
  })),
}));

// Mock the global fetch function
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    clone: () => new Response(),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(''),
    json: () => Promise.resolve({ data: {} }),
  })
);

describe('ContextMenuCard', () => {
  const defaultProps = {
    queryTitle: 'Test Query',
    saved_at: '2024-08-10',
    parameters: { param1: 'value1' },
    query_id: 'test-query-id',
    db_id: 'test-db-id',
    onDelete: mockOnDelete,
  };

  it('renders without crashing', () => {
    render(<ContextMenuCard {...defaultProps} />);
    expect(screen.getByText('Test Query')).toBeInTheDocument();
  });

  it('handles "Retrieve Query" click correctly', async () => {
    render(<ContextMenuCard {...defaultProps} />);

    // Open dropdown
    fireEvent.click(screen.getByText('Test Query'));

    // Click on "Retrieve Query"
    fireEvent.click(screen.getByText('Retrieve Query'));

    // Ensure the router push is called with correct URL
    expect(mockPush).toHaveBeenCalledWith('/test-db-id/test-query-id');
  });
  
  it('deletes a query when clicking "Delete"', async () => {
    render(<ContextMenuCard {...defaultProps} />);

    // Open dropdown
    fireEvent.click(screen.getByText('Test Query'));

    // Open "Delete Query" modal
    fireEvent.click(screen.getByText('Delete query from saved queries'));

    // Click on "Delete"
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[1]); // Assuming the second button is the one in the modal

    // Ensure that the fetch function for removing the query is called
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/delete-query`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ query_id: 'test-query-id' }),
      })
    ));

    // Ensure onDelete callback is called
    await waitFor(() => expect(mockOnDelete).toHaveBeenCalled());
});

});
