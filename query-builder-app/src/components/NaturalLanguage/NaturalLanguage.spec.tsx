import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, Mock } from 'vitest';
import React from 'react';
import NaturalLanguage from './NaturalLanguage';
import userEvent from '@testing-library/user-event';

// Mock the useSpeechToText hook
vi.mock('react-hook-speech-to-text', () => {
  return {
    __esModule: true,
    default: vi.fn().mockImplementation(() => ({
      error: false,
      interimResult: '',
      isRecording: false,
      results: [],
      startSpeechToText: vi.fn(),
      stopSpeechToText: vi.fn(),
    })),
  };
});

// Mock out Supabase access token retrieval
vi.mock("./../../utils/supabase/client", () => {
  return {
    createClient: vi.fn().mockImplementation(() => {
      return {
        auth: {
          getSession: vi.fn().mockImplementation(() => {
            return {
              data: {
                session: {
                  access_token: "randomAccessToken"
                }
              }
            };
          })
        }
      };
    })
  };
});

// Mock useParams from Next.js to return a mock databaseServerID
vi.mock('next/navigation', () => ({
  useParams: () => ({ databaseServerID: 'mock-database-server-id' })
}));

describe('NaturalLanguage basic rendering tests', () => {
  it('renders without crashing', () => {
    const { baseElement } = render(<NaturalLanguage />);
    expect(baseElement).toBeTruthy();
  });
});

// describe('NaturalLanguage query functionality', () => {
//   it('can make a natural language query successfully', async () => {
//     // Mock API calls
//     global.fetch = vi.fn((url: string, config: any) => {
//       if (url === `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/natural-language/query`) {
//         return Promise.resolve({
//           ok: true,
//           json: () => Promise.resolve({
//             databaseServerId: "1234",
//             queryParams: {
//               language: "sql",
//               query_type: "select",
//               databaseName: "sakila",
//               table: {
//                 name: "actor",
//                 columns: [
//                   { name: "first_name" },
//                   { name: "last_name" }
//                 ]
//               }
//             }
//           }),
//         });
//       }
//       return Promise.reject();
//     }) as Mock;

//     // Create a user that can perform actions
//     const user = userEvent.setup();

//     render(<NaturalLanguage />);

//     // Get the input field
//     const inputField = screen.getByPlaceholderText("Type your query here");

//     // Type a natural language query into the input field
//     await user.type(inputField, "List all the actors' first and last names");

//     // Get the query button
//     const queryButton = screen.getByText("Query");

//     // Click the query button
//     await user.click(queryButton);

//     // Verify if the fetch call was made and results modal is displayed
//     expect(global.fetch).toHaveBeenCalledTimes(1);
//     expect(global.fetch).toHaveBeenCalledWith(
//       `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/natural-language/query`,
//       expect.anything()
//     );
//   });

//   it('shows an error message if the query fails', async () => {
//     // Mock API call to return an error
//     global.fetch = vi.fn((url: string, config: any) => {
//       if (url === `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/natural-language/query`) {
//         return Promise.resolve({
//           ok: false,
//         });
//       }
//       return Promise.reject();
//     }) as Mock;

//     // Create a user that can perform actions
//     const user = userEvent.setup();

//     render(<NaturalLanguage />);

//     // Get the input field
//     const inputField = screen.getByPlaceholderText("Type your query here");

//     // Type a natural language query into the input field
//     await user.type(inputField, "List all the actors' first and last names");

//     // Get the query button
//     const queryButton = screen.getByText("Query");

//     // Click the query button
//     await user.click(queryButton);

//     // Verify that the error message is shown
//     expect(await screen.findByText("This feature is still in Beta - try again?")).toBeInTheDocument();
//   });
// });
