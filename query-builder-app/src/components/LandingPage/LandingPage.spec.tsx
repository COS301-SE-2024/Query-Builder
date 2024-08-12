import React from 'react';
import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vitest, vi, Mock } from 'vitest';
import userEvent from '@testing-library/user-event'
import LandingPage from './LandingPage';

describe('LandingPage basic rendering tests', () => {
    it('should render successfully', () => {
      const { baseElement } = render(<LandingPage />);
      expect(baseElement).toBeTruthy();
    });
});

describe('Landing Page', () => {

    it('it should contain title', async () => {
        //render the component
      render(<LandingPage/>);


      const title = screen.getByText("Welcome to QBee");
      expect(title).toBeInTheDocument();

      
    });

});