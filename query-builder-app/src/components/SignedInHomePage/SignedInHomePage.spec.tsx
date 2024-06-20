import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest';
import React from 'react';

import SignedInHomePage from './SignedInHomePage';
import { user } from '@nextui-org/theme';

//basic component rendering tests
describe('SignedInHomePage basic rendering tests', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SignedInHomePage/>);
    expect(baseElement).toBeTruthy();
  });
});