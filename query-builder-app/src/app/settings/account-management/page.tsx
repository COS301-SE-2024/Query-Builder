'use-client'
import { AccountManagement } from '../../../components/AccountManagement/AccountManagement'
import styles from './page.module.css';

export interface AccountManagementProps {}

export default function AccountManagementPage(props: AccountManagementProps) {
  return <AccountManagement />;
}