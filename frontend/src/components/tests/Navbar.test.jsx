import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Helper to render with Router
const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: MemoryRouter });
};

describe('Navbar Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders logo and navigation links', () => {
    renderWithRouter(<Navbar />);

    expect(screen.getByText(/Book/)).toBeInTheDocument();
    expect(screen.getByText(/Nook/)).toBeInTheDocument();
    expect(screen.getByText(/Home/)).toBeInTheDocument();
    expect(screen.getByText(/Book Clubs/)).toBeInTheDocument();
    expect(screen.getByText(/Books/)).toBeInTheDocument();
  });

  test('shows login link when no user is logged in', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText(/Log In/)).toBeInTheDocument();
  });

  test('shows user icon when user is logged in', () => {
    localStorage.setItem('userData', JSON.stringify({ id: 1, name: 'Test User' }));
    renderWithRouter(<Navbar />);
    expect(screen.getByRole('button', { hidden: true })).toBeInTheDocument();
  });

  test('opens and closes dropdown menu on user icon click', () => {
    localStorage.setItem('userData', JSON.stringify({ id: 1, name: 'Test User' }));
    renderWithRouter(<Navbar />);

    const userIcon = screen.getByRole('button', { hidden: true });
    fireEvent.click(userIcon);

    expect(screen.getByText(/My Profile/)).toBeInTheDocument();
    expect(screen.getByText(/Settings/)).toBeInTheDocument();
    expect(screen.getByText(/Edit Profile/)).toBeInTheDocument();
    expect(screen.getByText(/Logout/)).toBeInTheDocument();

    fireEvent.click(userIcon);
    expect(screen.queryByText(/My Profile/)).not.toBeInTheDocument();
  });

  test('handles logout correctly', () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    localStorage.setItem('authToken', 'testtoken');
    localStorage.setItem('userData', JSON.stringify({ id: 1, name: 'Test User' }));

    renderWithRouter(<Navbar />);

    const userIcon = screen.getByRole('button', { hidden: true });
    fireEvent.click(userIcon);

    const logoutButton = screen.getByText(/Logout/);
    fireEvent.click(logoutButton);

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('userData')).toBeNull();
  });
});
