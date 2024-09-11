import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vitest, vi, Mock } from 'vitest';
import userEvent from '@testing-library/user-event'
import StartPage from './StartPage';

describe('LandingPage basic rendering tests', () => {
    it('should render successfully', () => {
      const { baseElement } = render(<StartPage />);
      expect(baseElement).toBeTruthy();
    });
});

describe('Landing Page', () => {

    it('it should contain title', async () => {
        //render the component
      render(<StartPage/>);


      const title = screen.getByText("Welcome to QBee");
      expect(title).toBeInTheDocument();

      
    });

});

describe('ConsoleText Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('should render the ConsoleText component', () => {
        render(<StartPage />);
        const consoleText = screen.getByTestId('console-text');
        expect(consoleText).toBeInTheDocument();
    });

    it('should update text and color over time', () => {
        render(<StartPage />);
        
        const targetElement = screen.getByTestId('console-text').querySelector('div');

        act(() => {
            vi.advanceTimersByTime(100);  // Fast-forward to the first letter change
        });
        expect(targetElement?.innerHTML).toBe('<div style="color: lightblue;" data-testid="test-console-change">W</div><div class="console-underscore hidden"></div>');  // Expecting the first letter of "Welcome"

        act(() => {
            vi.advanceTimersByTime(1500);  // Fast-forward further
        });
        expect(targetElement?.innerHTML).toBe('<div style="color: lightblue;" data-testid="test-console-change">Welcome to QBee!</div><div class="console-underscore"></div>');  // Full word expected
        
        const consoleText = screen.getByTestId('test-console-change');
        expect(consoleText).toHaveStyle({ color: 'rgb(173, 216, 230)' });  // Check color change
    });

    it('should toggle underscore visibility', () => {
        render(<StartPage />);
        
        const underscoreElement = screen.getByTestId('console-text').querySelector('.console-underscore');

        act(() => {
            vi.advanceTimersByTime(100);  // Fast-forward to the first underscore toggle
        });
        expect(underscoreElement).toHaveClass('console-underscore hidden');  // Hidden class applied

        act(() => {
            vi.advanceTimersByTime(100);  // Fast-forward to the next toggle
        });
        expect(underscoreElement).toHaveClass('console-underscore');  // Visible again
    });

    it('should update color and word after the first timeout', () => {
        render(<StartPage />);
        
        
        // Simulate the first timeout after 150ms
        act(() => {
            vi.advanceTimersByTime(150);
        });
        const targetElement = screen.getByTestId('test-console-change');

        // Check that the first word is being displayed and color is updated
        expect(targetElement?.innerHTML).toBe('W'); // Expect the start of the first word
        expect(targetElement?.style.color).toBe('lightblue'); // Expect the first color

        // Fast-forward more time to complete the word
        act(() => {
            vi.advanceTimersByTime(1500);
        });

        expect(targetElement?.innerHTML).toBe('Welcome to QBee!'); // Full word expected
        expect(targetElement?.style.color).toBe('lightblue'); // Color should remain the same
    });

    it('should update to the next word and color after completion', () => {
        render(<StartPage />);

        act(() => {
            vi.advanceTimersByTime(9000);  // Fast-forward enough to complete the first word and start the next
        });

        const targetElement = screen.getByTestId('test-console-change');

        // Verify that the component has moved on to the next word
        expect(targetElement?.innerHTML).toBe('Unlock the full potential of your data with QBee today!');
        expect(targetElement?.style.color).toBe('lightblue'); // Ensure the color changes as expected
    });
});