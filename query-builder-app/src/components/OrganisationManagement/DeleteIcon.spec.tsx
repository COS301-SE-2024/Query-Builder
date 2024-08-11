import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { DeleteIcon } from './DeleteIcon';
import React from 'react';

describe('DeleteIcon', () => {
  it('renders correctly', () => {
    const { container } = render(<DeleteIcon onClick={() => {}}/>);
    expect(container).toBeTruthy();

    const svgElement = container.querySelector('svg');

    expect(svgElement).toBeInTheDocument();
  });
});