import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminLayout from './AdminLayout';

// Mock children to be passed inside AdminLayout
const MockChildren = () => <div>Mocked Child Component</div>;

describe('AdminLayout', () => {
  test('renders sidebar with navigation items and children', () => {
    render(
      <MemoryRouter>
        <AdminLayout>
          <MockChildren />
        </AdminLayout>
      </MemoryRouter>
    );

    // Check for the brand/logo
    expect(screen.getByText(/BookNook Admin/i)).toBeInTheDocument();

    // Check nav items
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Users/i)).toBeInTheDocument();
    expect(screen.getByText(/Books/i)).toBeInTheDocument();
    expect(screen.getByText(/Book Clubs/i)).toBeInTheDocument();
    expect(screen.getByText(/Schedules/i)).toBeInTheDocument();

    // Check for children rendering
    expect(screen.getByText(/Mocked Child Component/i)).toBeInTheDocument();
  });

  test('toggles sidebar labels when toggle button is clicked', () => {
    render(
      <MemoryRouter>
        <AdminLayout>
          <MockChildren />
        </AdminLayout>
      </MemoryRouter>
    );

    const dashboardItem = screen.getByText(/Dashboard/i);
    expect(dashboardItem).toBeInTheDocument();

    const toggleButtons = screen.getAllByRole('button');
    fireEvent.click(toggleButtons[0]); // Assume first button is the sidebar toggle

    // Sidebar label should be hidden
    expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
  });

  test('displays logout button when sidebar is expanded', () => {
    render(
      <MemoryRouter>
        <AdminLayout>
          <MockChildren />
        </AdminLayout>
      </MemoryRouter>
    );

    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });
});
