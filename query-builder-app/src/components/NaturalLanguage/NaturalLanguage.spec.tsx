import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import NaturalLanguage from './NaturalLanguage';
import { MemoryRouter, Route } from 'react-router-dom';

describe('NaturalLanguage Component', () => {
  it('renders without crashing', () => {
    const {baseElement} = render(
      <MemoryRouter initialEntries={['/databaseServerID']}>
        <Route path='/1234'>
          <NaturalLanguage />
        </Route>
      </MemoryRouter>);
      expect(baseElement).toBeTruthy();
  });
});
