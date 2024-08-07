import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Authentication from "./Authentication";
import React from 'react';

//basic component rendering tests
describe('Authentication basic rendering tests', () => {
    it('should render successfully', () => {
  
      const { baseElement } = render(<Authentication/>);
      expect(baseElement).toBeTruthy();
  
    });
});