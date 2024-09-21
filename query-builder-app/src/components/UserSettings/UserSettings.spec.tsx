import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import userEvent from '@testing-library/user-event'
import UserSettings from './UserSettings'; // adjust the import according to your file structure
import toast from 'react-hot-toast';

vi.mock('./../../utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-token',
            user: { id: 'mock-user-id' }
          }
        }
      })
    }
  })
}));

// Mock the fetch function
describe('User management basic rendering tests', () => {
  it('should render successfully', async () => {

    const { baseElement } = render(<UserSettings/>);
    expect(baseElement).toBeTruthy();

  });
});

describe('User management tests', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('get-user')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [{ user_id: 'mock-user-id', profile_photo: 'mock-url', email: 'test@example.com', first_name: 'John', last_name: 'Doe' }]
          })
        });
      }
      else if (url.includes('upload-profile-photo')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            publicUrl: 'updated-mock-url'
          })
        });
      }
      else if (url.includes('update-user')) {
        return Promise.resolve({
          ok: true,
          status: 200
        });
      }
      else if (url.includes('update-user-email')) {
        return Promise.resolve({
          ok: true,
        });
      }
    });
  });

  it('should render user settings info', async () => {
    await waitFor(async () => {
      render(<UserSettings/>);
    });

    expect(screen.getByAltText("User Profile Picture")).toHaveAttribute("src", "mock-url");
    expect(screen.getByText("Personal Details")).toBeInTheDocument();
    const emailTest = screen.getByTestId("email-test");
    const firstName = screen.getByTestId("first-name");
    const file = new File(['image content'], 'test-image.png', { type: 'image/png' });
    const user = userEvent.setup();

    const fileInput = screen.getByTestId("file-input");
    await user.upload(fileInput, file);
    
    await user.click(firstName);
    await user.type(firstName,"NewName");

    await user.click(emailTest);
    expect(emailTest).toBeRequired();
    expect(emailTest).toHaveFocus();
    await user.type(emailTest, "johndoe@gmail.com");
    expect(emailTest).toHaveStyle("color: success");

    const updateTest = screen.getByTestId("update-user");
    const loadingSpy = vi.spyOn(toast, 'loading');
    vi.spyOn(toast, 'success');
    await user.click(updateTest);

    expect(loadingSpy).toBeCalled();
    
    await waitFor(() => {
      expect(screen.getByAltText("User Profile Picture")).toHaveAttribute("src", "updated-mock-url");  
    });

  });
});