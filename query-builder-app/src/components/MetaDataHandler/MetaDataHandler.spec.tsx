import '@testing-library/jest-dom';
import { render, screen, waitFor,  } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach} from 'vitest';
import MetaDataHandler from './MetaDataHandler';
import React from 'react';
import userEvent from '@testing-library/user-event';

vi.mock('./../../utils/supabase/client', () => ({
    createClient: () => ({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              access_token: 'mock-token',
              user: { id: 'mock-user-id' }
            }
          }
        })
      }
    })
}));



describe('Basic render', () => {
    
beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn().mockImplementation((url) => {
        if (url.includes('has-saved-db-credentials')) {
            return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                saved_db_credentials: {}
            })
            });
        }
        else if (url.includes('has-active-connection')) {
            return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                hasActiveConnection: true,
            })
            });
        }
        else if (url.includes('connect')) {
            return Promise.resolve({
            ok: true
            });
        }
        else if (url.includes('get-db-type')) {
            return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                type: "mysql",
            })
            });
        }
        else if (url.includes('metadata/databases')) {
            return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                data: [{database: "sakila", qbee_id: 0}]
            })
            
            });
        }
        else if (url.includes('metadata/tables')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    data: [{table_name: "actor", qbee_id: 0}, {table_name: "actor_info", qbee_id: 1}]
                })
                
            });
        }
        else if (url.includes('metadata/fields')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    data: [{name: "actor_id", qbee_id: 0}, {name: "film_info", qbee_id: 1}]
                })
                
            });
        }
    });
    });

    it('renders correctly', async () => {
        const { container } = render(<MetaDataHandler org_id="testOrgID" db_id="testID" on_add={() =>{} }/>);
        expect(container).toBeTruthy();
  
        const user = userEvent.setup();
        const Edit = screen.getByTestId('editMetaPopUpTest');
        expect(Edit).toBeInTheDocument();
        await user.click(Edit);
        // let label = screen.getByText('Edit the description of table');
        // expect(label).toBeInTheDocument();
        // label = screen.getByText('Enter New Description');
        // expect(label).toBeInTheDocument();
        // label = screen.getByPlaceholderText('testDescriptions');
        // expect(label).toBeInTheDocument();
    });
});

