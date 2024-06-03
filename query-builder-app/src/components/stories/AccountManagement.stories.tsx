import { AccountManagement } from '../AccountManagement/AccountManagement';

export default {
    component: AccountManagement,
    parameters: {
        layout: 'fullscreen'
    }
};

export const DefaultAccountManagement = {
    render: () => <AccountManagement />,
};