import { render } from '@testing-library/react';
import { Query } from "@/interfaces/intermediateJSON";
import { describe, it, expect } from 'vitest';
import TableResponse from "./TableResponse";
import React from 'react';

//basic component rendering tests
describe('TableResponse basic rendering tests', () => {

    it('should render successfully', () => {

        const queryProp: Query = {
            credentials: {
                host: "127.0.0.1",
                user: "root",
                password: "testPassword"
            },
            queryParams: {
                language: "sql",
                query_type: "select",
                databaseName: "sakila",
                table: {name: "film", columns: [{name: "title"}, {name: "release_year"}]}
            }
        }

        const {baseElement} = render(<TableResponse query={queryProp} />);
        expect(baseElement).toBeTruthy();

    });

});