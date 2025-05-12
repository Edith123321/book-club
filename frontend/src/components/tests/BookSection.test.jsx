import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BooksSection from './BooksSection';
import booksData from './booksData';

// Mock the booksData
jest.mock('./booksData', () => [
  {
    id: 1,
    title: 'Test Book 1',
    author: 'Author 1',
    cover: 'cover1.jpg',
    genres: ['Fiction', 'Fantasy', 'Adventure']
  },
  {
    id: 2,
    title: 'Test Book 2',
    author: 'Author 2',
    cover: 'cover2.jpg',
    genres: ['Science Fiction']
  },
  {
    id: 3,
    title: 'Test Book 3',
    author: 'Author 3',
    cover: 'cover3.jpg',
    genres: ['Mystery', 'Thriller']
  }
]);

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children }) => <div>{children}</div> // Simplified Link for testing
}));

describe('BooksSection Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders section header correctly', () => {
    render(
      <MemoryRouter>
        <BooksSection />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Trending Books')).toBeInTheDocument();
    expect(screen.getByText('Most discussed books this month')).toBeInTheDocument();
  });

  test('displays the first 3 books', () => {
    render(
      <MemoryRouter>
        <BooksSection />
      </MemoryRouter>
    );
    
    const bookCards = screen.getAllByTestId('book-card');
    expect(bookCards).toHaveLength(3);
    
    expect(screen.getByText('Test Book 1')).toBeInTheDocument();
    expect(screen.getByText('Test Book 2')).toBeInTheDocument();
    expect(screen.getByText('Test Book 3')).toBeInTheDocument();
  });

  test('displays book details correctly', () => {
    render(
      <MemoryRouter>
        <BooksSection />
      </MemoryRouter>
    );
    
    // Test first book details
    expect(screen.getByText('Test Book 1')).toBeInTheDocument();
    expect(screen.getByText('by Author 1')).toBeInTheDocument();
    expect(screen.getByText('Fiction')).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument(); // For the third genre
    
    // Test second book with single genre
    expect(screen.getByText('Test Book 2')).toBeInTheDocument();
    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
  });

  test('renders book covers', () => {
    render(
      <MemoryRouter>
        <BooksSection />
      </MemoryRouter>
    );
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute('src', 'cover1.jpg');
    expect(images[0]).toHaveAttribute('alt', 'Test Book 1');
  });

  test('navigates to books page when View All button is clicked', () => {
    render(
      <MemoryRouter>
        <BooksSection />
      </MemoryRouter>
    );
    
    const viewAllButton = screen.getByText('View All Trending Books');
    fireEvent.click(viewAllButton);
    
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/books');
  });

  test('navigates to book details page when a book card is clicked', () => {
    render(
      <MemoryRouter>
        <BooksSection />
      </MemoryRouter>
    );
    
    const firstBookLink = screen.getByText('Test Book 1').closest('a');
    fireEvent.click(firstBookLink);
    
    // Note: Since we're using MemoryRouter, we can test navigation behavior
    // In a real test, you might want to set up routes to verify this
    expect(window.location.pathname).toBe('/book/1');
  });

  test('displays genre tags correctly', () => {
    render(
      <MemoryRouter>
        <BooksSection />
      </MemoryRouter>
    );
    
    // Book with 3 genres should show 2 tags and a "+1"
    expect(screen.getByText('Fiction')).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
    
    // Book with 1 genre should show just that genre
    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    expect(screen.queryByText('+0', { exact: false })).not.toBeInTheDocument();
  });
});