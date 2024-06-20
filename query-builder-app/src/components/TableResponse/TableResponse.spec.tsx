import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest';
import React from 'react';

import TableResponse from './TableResponse';
import { user } from '@nextui-org/theme';

//basic component rendering tests
describe('TableResponse basic rendering tests', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableResponse query={{
        credentials: {
            host: "127.0.0.1",
            user: "root",
            password: "testPassword"
        },
        databaseName: "sakila",
        queryParams: {
            language: "sql",
            query_type: "select",
            table: "film",
            columns: ["title", "release_year", "rating", "rental_rate", "rental_duration", "language_id"],
        }
    }}/>);
    expect(baseElement).toBeTruthy();
  });
});

//tests with no backend connection
describe('TableResponse tests with no backend', () => {
    it('should display a loading screen', () => {
      const { baseElement } = render(<TableResponse query={{
          credentials: {
              host: "127.0.0.1",
              user: "root",
              password: "testPassword"
          },
          databaseName: "sakila",
          queryParams: {
              language: "sql",
              query_type: "select",
              table: "film",
              columns: ["title", "release_year", "rating", "rental_rate", "rental_duration", "language_id"],
          }
      }}/>);

      const text = screen.getByText("Loading...");
      expect(text).toBeInTheDocument();

    });
  });