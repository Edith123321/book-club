import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const renderWithRouter = (ui, { route = '/admin/dashboard' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: MemoryRouter });
};

describe('Sidebar Component', () => {
  test('renders toggle button initially', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByLabelText(/Open menu/)).toBeInTheDocument();
  });

  test('opens sidebar when toggle button is clicked', () => {
    renderWithRouter(<Sidebar />);
    const toggleButton = screen.getByLabelText(/Open menu/);

    fireEvent.click(toggleButton);

    expect(screen.getByLabelText(/Close menu/)).toBeInTheDocument();
    expect(screen.getByText(/BookNook/)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/)).toBeInTheDocument();
    expect(screen.getByText(/Users/)).toBeInTheDocument();
    expect(screen.getByText(/Books/)).toBeInTheDocument();
    expect(screen.getByText(/Book Clubs/)).toBeInTheDocument();
  });

  test('closes sidebar when overlay is clicked', () => {
    renderWithRouter(<Sidebar />);
    const toggleButton = screen.getByLabelText(/Open menu/);

    fireEvent.click(toggleButton); // Open sidebar
    expect(screen.getByLabelText(/Close menu/)).toBeInTheDocument();

    const overlay = screen.getByRole('presentation');
    fireEvent.click(overlay);

    expect(screen.getByLabelText(/Open menu/)).toBeInTheDocument();
  });

  test('closes sidebar when a menu link is clicked', () => {
    renderWithRouter(<Sidebar />);
    const toggleButton = screen.getByLabelText(/Open menu/);

    fireEvent.click(toggleButton); // Open sidebar
    const dashboardLink = screen.getByText(/Dashboard/);

    fireEvent.click(dashboardLink);

    expect(screen.getByLabelText(/Open menu/)).toBeInTheDocument();
  });
});