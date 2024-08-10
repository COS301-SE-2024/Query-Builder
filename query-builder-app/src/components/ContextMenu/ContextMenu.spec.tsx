import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ContextMenu from './ContextMenu';
import { createClient } from "./../../utils/supabase/client";
import { useRouter } from 'next/navigation';

describe('ContextMenu', () => {
  it('renders without crashing', () => {
    const { baseElement } = render(<ContextMenu />);
    expect(baseElement).toBeTruthy();
  });
});