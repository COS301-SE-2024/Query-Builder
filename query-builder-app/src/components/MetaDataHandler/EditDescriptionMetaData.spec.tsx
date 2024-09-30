import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EditDescriptionMetaData from './EditDescriptionMetaData';
import React from 'react';
import userEvent from '@testing-library/user-event';


describe('Basic render', () => {
    it('renders correctly', async () => {
        const { container } = render(<EditDescriptionMetaData description="testDescriptions" type="table" on_add={() =>{} }/>);
        expect(container).toBeTruthy();
  
        const user = userEvent.setup();
        const Edit = screen.getByText('Edit');
        expect(Edit).toBeInTheDocument();
        await user.click(Edit);
        let label = screen.getByText('Edit the description of table');
        expect(label).toBeInTheDocument();
        label = screen.getByText('Enter New Description');
        expect(label).toBeInTheDocument();
        label = screen.getByPlaceholderText('testDescriptions');
        expect(label).toBeInTheDocument();
    });
});