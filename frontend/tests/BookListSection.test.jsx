import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import BookListSection from './BookListSection';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('BookListSection', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders section title and description', () => {
    render(
      <MemoryRouter>
        <BookListSection />
      </MemoryRouter>
    );

    expect(screen.getByText(/Popular BookClubs/i)).toBeInTheDocument();
    expect(screen.getByText(/Join these active communities/i)).toBeInTheDocument();
  });

  test('renders 3 book club cards from data', () => {
    render(
      <MemoryRouter>
        <BookListSection />
      </MemoryRouter>
    );

    const clubCards = screen.getAllByRole('heading', { level: 2 });
    expect(clubCards.length).toBe(3); // Only first 3 clubs should show
  });

  test('navigates to individual book club when a card is clicked', () => {
    render(
      <MemoryRouter>
        <BookListSection />
      </MemoryRouter>
    );

    const firstCard = screen.getAllByText(/Currently Reading:/i)[0].closest('.book-club-card');
    fireEvent.click(firstCard);

    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/bookclub/'));
  });

  test('join button toggles to "Joined ✓" when clicked', () => {
    render(
      <MemoryRouter>
        <BookListSection />
      </MemoryRouter>
    );

    const joinButton = screen.getAllByText(/Join Now/i)[0];
    fireEvent.click(joinButton);
    expect(joinButton.textContent).toBe('Joined ✓');

    fireEvent.click(joinButton);
    expect(joinButton.textContent).toBe('Join Now');
  });

  test('navigates to /bookclubs when "View All Bookclubs" is clicked', () => {
    render(
      <MemoryRouter>
        <BookListSection />
      </MemoryRouter>
    );

    const viewAllButton = screen.getByText(/View All Bookclubs/i);
    fireEvent.click(viewAllButton);

    expect(mockNavigate).toHaveBeenCalledWith('/bookclubs');
  });
});
