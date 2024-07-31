import '@testing-library/jest-dom/vitest'
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vitest, vi, Mock } from 'vitest';
import TableForm from "./TableForm"
import { table } from "@/interfaces/intermediateJSON";
import { createClient } from '@/utils/supabase/client';

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

//Mock out the API call to retrieve the table's columns
global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ data: [{name: "users"}, {name: "employees"}] }),
    }),
  ) as Mock;

//basic component rendering tests
describe('TableForm basic rendering tests', () => {
    it('should render successfully', () => {
  
      const tableProp: table = {
          name: "",
          columns: []
      }
  
      const { baseElement } = render(<TableForm table={tableProp} />);
      expect(baseElement).toBeTruthy();
  
    });
  });