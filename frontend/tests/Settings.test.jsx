import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Settings from '../components/Settings';

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock axios
jest.mock('axios');

describe('Settings Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useParams.mockReturnValue({ userId: '123' });
    useNavigate.mockReturnValue(mockNavigate);
    localStorage.setItem('authToken', 'mockToken');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Settings content correctly', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    expect(screen.getByText(/Account Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Change Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Change Password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  test('updates form fields on user input', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    const currentInput = screen.getByLabelText(/Current Password/i);
    const newInput = screen.getByLabelText(/New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);

    fireEvent.change(currentInput, { target: { value: 'oldpass' } });
    fireEvent.change(newInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpass123' } });

    expect(currentInput.value).toBe('oldpass');
    expect(newInput.value).toBe('newpass123');
    expect(confirmInput.value).toBe('newpass123');
  });

  test('shows error when new passwords do not match', async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'wrongpass' } });

    fireEvent.submit(screen.getByRole('button', { name: /Change Password/i }));

    expect(await screen.findByText(/New passwords do not match/i)).toBeInTheDocument();
  });

  test('handles successful password change', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Password changed successfully' } });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newpass123' } });

    fireEvent.submit(screen.getByRole('button', { name: /Change Password/i }));

    await waitFor(() => {
      expect(screen.getByText(/Password changed successfully/i)).toBeInTheDocument();
    });

    expect(axios.post).toHaveBeenCalledWith(
      '/api/users/123/change-password',
      {
        current_password: 'oldpass',
        new_password: 'newpass123',
      },
      {
        headers: { Authorization: 'Bearer mockToken' },
      }
    );
  });

  test('handles failed password change', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'Incorrect current password' } } });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'wrongpass' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newpass123' } });

    fireEvent.submit(screen.getByRole('button', { name: /Change Password/i }));

    expect(await screen.findByText(/Incorrect current password/i)).toBeInTheDocument();
  });

  test('navigates back to profile on cancel', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/profile/123');
  });
});