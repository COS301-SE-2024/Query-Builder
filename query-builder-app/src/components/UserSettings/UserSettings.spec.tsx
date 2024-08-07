import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect,vi } from 'vitest';
import '@testing-library/jest-dom';
import UserSettings from './UserSettings'; // adjust the import according to your file structure

// Mock the fetch function
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ profile_data: [{ first_name: 'John', last_name: 'Doe' }] }),
  })
);

// Mock the getToken function
vi.mock('./../../utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: { access_token: 'fake-token' } } }),
    },
  }),
}));

describe('UserSettings component', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the component with initial state', async () => {
    render(<UserSettings />);

    expect(screen.getByText('Personal Details')).toBeInTheDocument();

    // Wait for useEffect to run
    await waitFor(() => {
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    });
  });

  it('updates user details', async () => {
    render(<UserSettings />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const updateButton = screen.getByRole('button', { name: /update/i });

    // Update the first and last name fields
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });

    // Mock the update fetch response
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    fireEvent.click(updateButton);

  });
});
