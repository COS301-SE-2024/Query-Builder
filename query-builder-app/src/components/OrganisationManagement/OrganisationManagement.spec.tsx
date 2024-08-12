import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import OrganisationManagement from './OrganisationManagement';
import userEvent from '@testing-library/user-event'

// import { useParams } from 'next/navigation'

vi.mock('next/navigation', async () => ({
    useParams: (): Readonly<string> => ("123"),
}));

//basic component rendering tests
describe('Organisation management basic rendering tests', () => {
    it('should render successfully', async () => {
  
      const { baseElement } = render(<OrganisationManagement/>);
      expect(baseElement).toBeTruthy();
  
    });
});

describe('Organisation management table for users', () => {
    it('should render table successfully', async () => {
        render(<OrganisationManagement/>);

        const user = userEvent.setup();
        const tabs = screen.getAllByLabelText('orgMembers')[0];

        await user.click(tabs);

        const orgMembers = screen.getAllByLabelText('Organisation Members Table')[0];

        expect(orgMembers).toBeTruthy();
  
    });
});