import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi,  beforeEach, afterEach  } from 'vitest';
import React from 'react';
import OrganisationManagement from './OrganisationManagement';
// import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createClient } from './../../utils/supabase/client';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';


const getToken = vi.fn().mockResolvedValue('test-token');
const setHashCodeCopyText = vi.fn();

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



vi.mock('next/navigation', () => ({
    useParams: () => ({ orgServerID: 'mock-org-id' })
}));


//basic component rendering tests
describe('Organisation management basic rendering tests', () => {
    it('should render successfully', async () => {
      const { baseElement } = render(<OrganisationManagement/>);
      expect(baseElement).toBeTruthy();
  
    });
});

describe('Organisation management table for users', () => {
    it('should render table successfully', async () => {
        render(<OrganisationManagement/>);

        const user = userEvent.setup();
        const tabs = screen.getAllByLabelText('orgMembers')[0];

        await user.click(tabs);

        const orgMembers = screen.getAllByLabelText('Organisation Members Table')[0];

        expect(orgMembers).toBeTruthy();
  
    });
});

describe('copyHashCode Functionality', () => {
    beforeEach(() => {
        // Mock fetch
        global.fetch = vi.fn().mockImplementation((url) => {
          if (url.includes('get-members')) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                data: [{ profiles: { user_id: 'mock-user-id', profile_photo: 'mock-url', email: 'test@example.com', first_name: 'John', last_name: 'Doe' }, user_role: 'admin', verified: false }]
              })
            });
          }
          if (url.includes('get-org')) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                data: [{ name: 'Mock Org', logo: 'mock-logo-url' }]
              })
            });
          }
          if (url.includes('create-hash')) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                data: [{ hash: 'mock-hash-code' }]
              })
            });
          }
          if (url.includes('upload-org-logo')) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                publicUrl: 'updated-mock-logo-url'
              })
            });
          }
          return Promise.reject(new Error('Unknown API call'));
        });
      });

    it('should render organisation details', async () => {
        // Mock the useParams hook
        waitFor(() => {
            render(<OrganisationManagement />);
        });
        screen.debug(); 

        // Wait for the component to fetch and render data
        waitFor(() => {
            expect(screen.getByText(/Mock Org/i)).toBeInTheDocument();
            expect(screen.getByAltText(/Organisation Logo/i)).toHaveAttribute('src', 'mock-logo-url');
        });
    });

});
