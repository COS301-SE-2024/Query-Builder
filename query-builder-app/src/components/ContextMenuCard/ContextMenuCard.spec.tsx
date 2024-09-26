import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('ContextMenuCard - Share Query', () => {
  const defaultProps = {
    queryTitle: 'Test Query',
    saved_at: '2024-08-10',
    parameters: { param1: 'value1' },
    query_id: 'test-query-id',
    db_id: 'test-db-id',
    onDelete: mockOnDelete,
    description_text: 'Sample description',
    type_text: '',
  };

  // Reset mock states before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens share popup when "Share Query" is clicked', async () => {
    render(<ContextMenuCard {...defaultProps} />);

    // Open dropdown
    fireEvent.click(screen.getByText('Test Query'));

    // Click on "Share Query"
    fireEvent.click(screen.getByText('Share Query'));

    // Wait for the popup to open and check if the heading is displayed
    await waitFor(() => {
      expect(screen.getByText('Select Users to Share Query')).toBeInTheDocument();
    });
  });

  it('filters users based on search input', async () => {
    // Mock user data
    const mockUsers = [
      { user_id: '1', full_name: 'John Doe', profile_photo: null },
      { user_id: '2', full_name: 'Jane Doe', profile_photo: null },
    ];

    // Mock the `getMembers` function to return users
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockUsers }),
    } as Response);

    render(<ContextMenuCard {...defaultProps} />);

    // Open dropdown
    fireEvent.click(screen.getByText('Test Query'));

    // Click on "Share Query"
    fireEvent.click(screen.getByText('Share Query'));

    // Wait for the users to be loaded and check if they are rendered
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

    // Type into the search input to filter users
    fireEvent.change(screen.getByPlaceholderText('Search Users...'), { target: { value: 'John' } });

    // Ensure only 'John Doe' is visible and 'Jane Doe' is filtered out
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
  });

  it('opens the share query popup when the share option is clicked', async () => {
    render(
      <ContextMenuCard
        queryTitle="Test Query"
        saved_at="2024-09-23T12:00:00Z"
        parameters={{}}
        query_id="123"
        db_id="456"
        onDelete={vi.fn()}
        description_text="Test description"
        type_text=""
      />
    );

    // Trigger the dropdown to open
    fireEvent.click(screen.getByRole('button', { name: /Test Query/i }));

    // Click the share button inside the dropdown
    const dropdownMenu = screen.getByRole('menu');
    const shareButton = within(dropdownMenu).getByRole('menuitem', { name: /Share Query/i });
    fireEvent.click(shareButton);

    // Expect the modal to be in the document
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  it('renders the Share Query button inside the popup', async () => {
    render(<ContextMenuCard {...defaultProps} />);

    // Open dropdown
    fireEvent.click(screen.getByText('Test Query'));

    // Click on "Share Query" to open the user selection popup
    fireEvent.click(screen.getByText('Share Query'));

    // Ensure that the modal opens
    const popup = await screen.findByRole('dialog'); // Assuming the modal is a dialog

    // Check that the "Share Query" button is present in the modal
    const shareButton = within(popup).getByRole('button', { name: 'Share Query' });
    expect(shareButton).toBeInTheDocument();
  });
});
