import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TeamManagement } from '../../components/TeamManagement';

describe('TeamManagement Component', () => {
  it('renders team management heading', () => {
    render(<TeamManagement />);
    expect(screen.getByText(/team members/i)).toBeInTheDocument();
  });

  it('displays add member button', () => {
    render(<TeamManagement />);
    expect(screen.getByRole('button', { name: /➕ add member/i })).toBeInTheDocument();
  });

  it('shows default team member', () => {
    render(<TeamManagement />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@dcktools.cop')).toBeInTheDocument();
  });

  it('opens add member form when button is clicked', () => {
    render(<TeamManagement />);
    const addButton = screen.getByRole('button', { name: /➕ add member/i });
    fireEvent.click(addButton);
    expect(screen.getByText(/add new team member/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
  });

  it('closes form when cancel button is clicked', () => {
    render(<TeamManagement />);
    const addButton = screen.getByRole('button', { name: /➕ add member/i });
    fireEvent.click(addButton);
    expect(screen.getByText(/add new team member/i)).toBeInTheDocument();
    
    const cancelButton = screen.getByRole('button', { name: /✕ cancel/i });
    fireEvent.click(cancelButton);
    expect(screen.queryByText(/add new team member/i)).not.toBeInTheDocument();
  });

  it('adds a new team member when form is submitted', () => {
    render(<TeamManagement />);
    const addButton = screen.getByRole('button', { name: /➕ add member/i });
    fireEvent.click(addButton);

    // Fill in the form
    const nameInput = screen.getByPlaceholderText(/enter name/i);
    const emailInput = screen.getByPlaceholderText(/enter email/i);
    
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
    fireEvent.change(emailInput, { target: { value: 'jane@dcktools.cop' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /✓ add team member/i });
    fireEvent.click(submitButton);

    // Check if new member is added
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@dcktools.cop')).toBeInTheDocument();
  });

  it('displays role badges for team members', () => {
    render(<TeamManagement />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('displays permissions for team members', () => {
    render(<TeamManagement />);
    expect(screen.getByText('Trade')).toBeInTheDocument();
    expect(screen.getByText('Manage Wallets')).toBeInTheDocument();
    expect(screen.getByText('Add Members')).toBeInTheDocument();
  });

  it('calls onMemberAdded callback when member is added', () => {
    const mockCallback = vi.fn();
    render(<TeamManagement onMemberAdded={mockCallback} />);
    
    const addButton = screen.getByRole('button', { name: /➕ add member/i });
    fireEvent.click(addButton);

    const nameInput = screen.getByPlaceholderText(/enter name/i);
    const emailInput = screen.getByPlaceholderText(/enter email/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@dcktools.cop' } });

    const submitButton = screen.getByRole('button', { name: /✓ add team member/i });
    fireEvent.click(submitButton);

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test User',
        email: 'test@dcktools.cop',
      })
    );
  });

  it('allows selecting different roles', () => {
    render(<TeamManagement />);
    const addButton = screen.getByRole('button', { name: /➕ add member/i });
    fireEvent.click(addButton);

    const roleSelect = screen.getByDisplayValue('Trader');
    expect(roleSelect).toBeInTheDocument();
    
    fireEvent.change(roleSelect, { target: { value: 'Admin' } });
    expect(roleSelect).toHaveValue('Admin');
  });

  it('allows toggling permissions', () => {
    render(<TeamManagement />);
    const addButton = screen.getByRole('button', { name: /➕ add member/i });
    fireEvent.click(addButton);

    // Find permission checkboxes - 'Trade' should be checked by default
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    
    // First checkbox should be 'Trade' and checked
    expect(checkboxes[0]).toBeChecked();
  });

  it('validates required fields before adding member', () => {
    // Mock window.alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<TeamManagement />);
    const addButton = screen.getByRole('button', { name: /➕ add member/i });
    fireEvent.click(addButton);

    // Try to submit without filling fields
    const submitButton = screen.getByRole('button', { name: /✓ add team member/i });
    fireEvent.click(submitButton);

    expect(alertMock).toHaveBeenCalledWith('Please fill in all required fields');
    alertMock.mockRestore();
  });
});
