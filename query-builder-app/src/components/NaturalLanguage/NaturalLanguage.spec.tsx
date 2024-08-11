import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import NaturalLanguage from './NaturalLanguage';

describe('NaturalLanguage Component', () => {
  it('renders without crashing', () => {
    const { baseElement } = render(<NaturalLanguage />);
    expect(baseElement).toBeTruthy();
  });
});
