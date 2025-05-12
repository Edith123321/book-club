import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import '@testing-library/jest-dom/extend-expect';

// Mock fetch responses
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/bookclubs/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, name: 'Test Club', created_at: new Date().toISOString(), owner_id: 1 }])
      });
    }
    if (url.includes('/books')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, title: 'Test Book', genre: 'Fiction' }])
      });
    }
    if (url.includes('/users')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, username: 'testuser' }])
      });
    }
    if (url.includes('/summaries')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, book_title: 'Test Book', content: 'Great summary!', rating: 4.5, created_at: new Date().toISOString(), club_id: 1 }])
      });
    }
    if (url.includes('/reviews')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, book_id: 1, user_id: 1, rating: 5, created_at: new Date().toISOString() }])
      });
    }
    return Promise.reject(new Error('Unknown URL'));
  });
});

// Reset mocks
afterEach(() => {
  jest.clearAllMocks();
});

describe('Dashboard Component', () => {
  test('renders loading state initially', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Loading dashboard data/i)).toBeInTheDocument();
  });

  test('displays fetched stats correctly', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Total Users/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Books/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Clubs/i)).toBeInTheDocument();
      expect(screen.getByText(/Upcoming Events/i)).toBeInTheDocument();
    });

    expect(screen.getByText('1')).toBeInTheDocument(); // Total Users
  });

  test('displays recent activities', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Recent Activities/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/New book club created/i)).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  test('displays book summaries', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Book Club Summaries/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Great summary!')).toBeInTheDocument();
  });

  test('displays error message on fetch failure', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 500 })
    );

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading dashboard/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });
});