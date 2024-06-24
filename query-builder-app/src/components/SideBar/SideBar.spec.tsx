import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Sidebar from './SideBar';
import { createClient } from "./../../utils/supabase/client";
import { useRouter } from 'next/navigation';

vi.mock("./../../utils/supabase/client");
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('Sidebar basic rendering tests', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Sidebar />);
    expect(baseElement).toBeTruthy();
  });
});

describe('Sidebar initial tests', () => {
  it('should display the QBEE logo', () => {
    render(<Sidebar />);
    const logo = screen.getByText("QBEE");
    expect(logo).toBeInTheDocument();
  });

  it('should display the Home link', () => {
    render(<Sidebar />);
    const homeLink = screen.getByText("Home");
    expect(homeLink).toBeInTheDocument();
  });

  it('should display the Settings link', () => {
    render(<Sidebar />);
    const settingsLink = screen.getByText("Settings");
    expect(settingsLink).toBeInTheDocument();
  });

  it('should display the Help link', () => {
    render(<Sidebar />);
    const helpLink = screen.getByText("Help");
    expect(helpLink).toBeInTheDocument();
  });

  it('should display the Log out button', () => {
    render(<Sidebar />);
    const logoutButton = screen.getByText("Log out");
    expect(logoutButton).toBeInTheDocument();
  });
});

describe('Sidebar navigation and functionality tests', () => {
  it('should navigate to Home when Home link is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    const homeLink = screen.getByTestId("homeNav");
    const href = homeLink.getAttribute("href");
    expect(href).toBe('/');
  });

  it('should navigate to Settings when Settings link is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    const settingsLink = screen.getByTestId("settingsNav");
    const href = settingsLink.getAttribute("href");
    expect(href).toBe('/settings');
  });

  it('should navigate to Help when Help link is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    const helpLink = screen.getByTestId("helpNav");
    await user.click(helpLink);
    expect(helpLink).toHaveAttribute('href', 'https://cos301-se-2024.github.io/Query-Builder/docs/category/user-manual');
  });

  it('should sign out and navigate to home page when Log out button is clicked', async () => {
    const user = userEvent.setup();
    const mockSignOut = vi.fn().mockResolvedValue({ error: null });
    createClient.mockReturnValue({
      auth: {
        signOut: mockSignOut,
      },
    });
    const push = vi.fn();
    useRouter.mockReturnValue({ push });

    render(<Sidebar />);
    const logoutButton = screen.getByText("Log out");
    await user.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/');
  });
});
