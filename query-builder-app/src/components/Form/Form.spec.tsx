import { render } from '@testing-library/react';
import Form from './Form';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Route } from 'react-router-dom';

//basic component rendering tests
describe('Form basic rendering tests', () => {

    it('should render successfully', () => {

        const {baseElement} = render(
        <MemoryRouter initialEntries={['/databaseServerID']}>
          <Route path='/1234'>
            <Form />
          </Route>
        </MemoryRouter>);
        expect(baseElement).toBeTruthy();

    });

});