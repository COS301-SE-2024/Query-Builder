import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { EyeSlashFilledIcon } from './EyeSlashFilledIcon';
import React from 'react';

describe('DeleteIcon', () => {
  it('renders correctly', () => {
    const { container } = render(<EyeSlashFilledIcon onClick={() => {}}/>);
    expect(container).toBeTruthy();
    const svgElement = container.querySelector('svg');

    expect(svgElement).toBeInTheDocument();
  });
});