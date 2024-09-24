import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ContextMenuCard from './ContextMenuCard'; // Adjust the import based on your file structure
import User from './ContextMenuCard';

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

describe('ContextMenuCard - Share Query', () => {
  const defaultProps = {
    queryTitle: 'Test Query',
    saved_at: '2024-08-10',
    parameters: { param1: 'value1' },
    query_id: 'test-query-id',
    db_id: 'test-db-id',
    onDelete: mockOnDelete,
    description: 'Sample description',
  };

  it('opens share popup when "Share Query" is clicked', async () => {
    render(<ContextMenuCard {...defaultProps} />);

    // Open dropdown
    fireEvent.click(screen.getByText('Test Query'));

    // Click on "Share Query"
    fireEvent.click(screen.getByText('Share Query'));

    // Expect the popup with the heading "Select Users to Share Query" to be displayed
    expect(screen.getByText('Select Users to Share Query')).toBeInTheDocument();
  });

  it('filters users based on search input', async () => {
    render(<ContextMenuCard {...defaultProps} />);

    // Open dropdown
    fireEvent.click(screen.getByText('Test Query'));

    // Click on "Share Query"
    fireEvent.click(screen.getByText('Share Query'));

    // Type into the search input
    fireEvent.change(screen.getByPlaceholderText('Search Users...'), { target: { value: 'John' } });

    // Check if users filtered based on 'John'
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument(); // Ensure other users are not visible
  });

  it('opens the share query popup when the share option is clicked', () => {
    render(
        <ContextMenuCard
            queryTitle="Test Query"
            saved_at="2024-09-23T12:00:00Z"
            parameters={{}}
            query_id="123"
            db_id="456"
            onDelete={vi.fn()}
            description="Test description"
        />
    );

    // Trigger the dropdown to open
    fireEvent.click(screen.getByRole('button', { name: /Test Query/i }));

    // Get the dropdown menu
    const dropdownMenu = screen.getByRole('menu');

    // Click the share button inside the dropdown
    const shareButton = within(dropdownMenu).getByRole('menuitem', { name: /Share Query/i });
    fireEvent.click(shareButton);

    // Expect the popup (dialog) to be in the document
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toBeInTheDocument();
});
  
  it('renders the Share Query button inside the popup', async () => {
    render(<ContextMenuCard {...defaultProps} />);
  
    // Open dropdown
    fireEvent.click(screen.getByText('Test Query'));
  
    // Click on "Share Query" to open the user selection popup
    fireEvent.click(screen.getByText('Share Query'));
  
    // Ensure that the modal opens
    const popup = await screen.findByRole('dialog'); // Assuming the modal is a dialog
  
    // Use `getByRole` to ensure you are selecting the button, not the menu item
    const shareButton = within(popup).getByRole('button', { name: 'Share Query' });
  
    // Check that the "Share Query" button is present in the modal
    expect(shareButton).toBeInTheDocument();
  });
  

});
