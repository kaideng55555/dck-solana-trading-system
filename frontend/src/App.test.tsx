import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders DCK Tools Cop heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /dck tools cop/i })).toBeInTheDocument();
  });

  it('displays welcome message', () => {
    render(<App />);
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it('shows global loading screen on initial render', () => {
    render(<App />);
    // Use text or role that actually exists in GlobalLoadingScreen
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});