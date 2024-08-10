import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContextMenuCard from './ContextMenuCard'; // Adjust the import based on your file structure

// Mock functions
const mockOnDelete = vi.fn();

describe('ContextMenuCard', () => {
    const defaultProps = {
        queryTitle: 'Test Query',
        saved_at: '2024-08-10',
        parameters: { param1: 'value1' },
        query_id: 'test-query-id',
        db_id: 'test-db-id',
        onDelete: mockOnDelete,
    };

    it('renders without crashing', () => {
        render(<ContextMenuCard {...defaultProps} />);
        expect(screen.getByText('Test Query')).toBeInTheDocument();
    });

    // it('displays the correct query title and save date', () => {
    //     render(<ContextMenuCard {...defaultProps} />);
    //     expect(screen.getByText('Test Query')).toBeInTheDocument();
    //     expect(screen.getByText('2024-08-10')).toBeInTheDocument();
    // });

    // it('calls handleRetrieve when Retrieve Query is clicked', async () => {
    //     render(<ContextMenuCard {...defaultProps} />);
    //     fireEvent.click(screen.getByText('Retrieve Query'));
        
    //     // Check if handleRetrieve is called
    //     await waitFor(() => {
    //         expect(console.log).toHaveBeenCalledWith(defaultProps.parameters);
    //     });
    // });

    // it('calls handleDelete when Delete Query is clicked', async () => {
    //     render(<ContextMenuCard {...defaultProps} />);
    //     fireEvent.click(screen.getByText('Delete Query'));

    //     // Wait for the async operations to complete
    //     await waitFor(() => {
    //         expect(mockOnDelete).toHaveBeenCalled();
    //     });
    // });

    // it('disables the button while loading', () => {
    //     render(<ContextMenuCard {...defaultProps} />);
    //     expect(screen.getByRole('button', { name: 'Test Query' })).not.toBeDisabled();
    //     fireEvent.click(screen.getByText('Delete Query'));
    //     expect(screen.getByRole('button', { name: 'Processing...' })).toBeDisabled();
    // });
});
