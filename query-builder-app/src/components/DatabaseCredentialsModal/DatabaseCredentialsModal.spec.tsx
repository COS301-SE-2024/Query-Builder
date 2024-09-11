import DatabaseCredentialsModal from "./DatabaseCredentialsModal";
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect} from 'vitest';
import '@testing-library/jest-dom/vitest'

//basic component rendering tests
describe('DatabaseCredentialsModal basic rendering tests', () => {
    it('should render successfully', () => {
      const { baseElement } = render(<DatabaseCredentialsModal dbServerID="1234" disclosure="" onConnected={() => {}}/>);
      expect(baseElement).toBeTruthy();
    });
});