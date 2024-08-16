import { render} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import NaturalLanguage from './NaturalLanguage';

vi.mock('next/navigation', () => ({
  useParams: () => ({ databaseServerID: 'mock-database-server-id' })
}));

describe('NaturalLanguage Component', () => {
  it('renders without crashing', () => {
    const {baseElement} = render(<NaturalLanguage/>);
    expect(baseElement).toBeTruthy();
  });
});
