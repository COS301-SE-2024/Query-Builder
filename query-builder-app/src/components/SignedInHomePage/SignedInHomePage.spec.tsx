import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignedInHomePage from './SignedInHomePage';
import { describe, it, expect, vi, beforeAll, afterAll, Mock } from 'vitest';

//Mock out Supabase access token retrieval
vi.mock("./../../utils/supabase/client", () => {
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

//Mock out the API calls
global.fetch = vi.fn((url: string, config: any) => {

  if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-org`){
      return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({data: [{
              created_at: "",
              logo: "",
              name: "Mock Org",
              org_id: "MockOrgID",
              db_envs: [
                {
                  created_at: "",
                  name: "Mock Database Server",
                  db_id: "MockDBID",
                  db_info: "",
                  type: "mysql"
                }
              ],
              org_members: [
                "Member1"
              ]
            }]}),
      })
  }

}) as Mock;

//basic component rendering tests
describe('SignedInHomePage basic rendering tests', () => {

  it('should render successfully and display the org and its database server', async () => {

      render(<SignedInHomePage/>);

      const orgText = (await screen.findAllByText('Mock Org'))[0];
      expect(orgText).toBeInTheDocument();

      const serverText = (await screen.findAllByText('Mock Database Server'))[0];
      expect(serverText).toBeInTheDocument();

  });

});