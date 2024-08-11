import React from 'react';
import AddOrganisationModal from './EditUserModal';
import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vitest, vi, Mock } from 'vitest';
import userEvent from '@testing-library/user-event'
import EditUserModal from './EditUserModal';

//Mock out Supabase access token retrieval
vitest.mock("./../../utils/supabase/client", () => {
    return{
        createClient: vi.fn().mockImplementation(() => {
            return{
                auth: {
                getSession: vi.fn().mockImplementation(() => {
                    return{
                        data: vi.fn().mockReturnThis(),
                        session: vi.fn().mockReturnThis(),
                        access_token: "randomAccessToken"
                    }
                })
            }}
        })
    }
  })

  
//Mock out API calls
global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ data: "mock data" }),
    }),
) as Mock;

//basic component rendering tests
describe('EditUserModal basic rendering tests', () => {
    it('should render successfully', () => {
      const { baseElement } = render(<EditUserModal org_id={"123"} user_id={"123"} on_add={()=>{}}/>);
      expect(baseElement).toBeTruthy();
    });
});