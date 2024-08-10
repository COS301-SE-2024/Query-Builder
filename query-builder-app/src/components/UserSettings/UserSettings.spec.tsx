import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import userEvent from '@testing-library/user-event'
import UserSettings from './UserSettings'; // adjust the import according to your file structure

// Mock the fetch function
describe('Organisation management basic rendering tests', () => {
  it('should render successfully', async () => {

    const { baseElement } = render(<UserSettings/>);
    expect(baseElement).toBeTruthy();

  });
});