import AddForeignKeyModal from './AddForeignKeyModal'
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';
import React from 'react';
import userEvent from '@testing-library/user-event';

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

    if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/fields`){
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [{name: "first_name"}, {name: "last_name"}] }),
        })
    }
  
  }) as Mock;

describe('AddForeignKeyModal basic rendering tests', () => {

    it('should render successfully', () => {
      const { baseElement } = render(
      <AddForeignKeyModal
        allTables={[]}
        fromTable='author'
        databaseServerID='1234'
        database='sakila'
        language='mysql'
        onAdd={(fromTable:string, fromColumn: string, toTable:string, toColumn:string)=>({})}
    />);
      expect(baseElement).toBeTruthy();
    });

});