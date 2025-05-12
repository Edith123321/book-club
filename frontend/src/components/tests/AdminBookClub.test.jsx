import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AdminBookClubs from '../AdminBookClubs';

// Mock fetch API
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/bookclubs/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: 1,
            name: 'Test Club',
            synopsis: 'A club for testing',
            status: 'Active',
            owner_id: 1,
            current_book: { title: 'Test Book' },
            member_count: 5,
            created_at: '2023-01-01T00:00:00Z'
          }
        ])
      });
    }
    if (url.includes('/books/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, title: 'Test Book', author: 'Test Author' }])
      });
    }
    if (url.includes('/users/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, username: 'testuser' }])
      });
    }
  });
});

// Clean up mocks after tests
afterEach(() => {
  jest.clearAllMocks();
});

test('renders AdminBookClubs stats and handles loading state', async () => {
  render(<AdminBookClubs />);

  // Loading state
  expect(screen.getByText(/Loading book clubs/i)).toBeInTheDocument();

  // Wait for data to be fetched and rendered
  await waitFor(() => {
    expect(screen.getByText(/Total Clubs/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Total Clubs = 1
    expect(screen.getByText(/Active Clubs/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Active Clubs = 1
    expect(screen.getByText(/Clubs with Books/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Clubs with Books = 1
    expect(screen.getByText(/Avg. Members/i)).toBeInTheDocument();
    expect(screen.getByText('5.0')).toBeInTheDocument(); // Average Members = 5.0
  });
});

test('filters book clubs when searching', async () => {
  render(<AdminBookClubs />);

  await waitFor(() => screen.getByText(/Total Clubs/i));

  const searchInput = screen.getByPlaceholderText(/Search/i) || screen.getByRole('textbox');
  fireEvent.change(searchInput, { target: { value: 'Test' } });

  await waitFor(() => {
    expect(screen.getByText('Test Club')).toBeInTheDocument();
  });
});