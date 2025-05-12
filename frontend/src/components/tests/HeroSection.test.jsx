import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';

// Mock useNavigate from react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

describe('HeroSection Component', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        useNavigate.mockReturnValue(mockNavigate);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders HeroSection content correctly', () => {
        render(
            <MemoryRouter>
                <HeroSection />
            </MemoryRouter>
        );

        // Headline
        expect(screen.getByText(/Discover, Connect, and Discuss/i)).toBeInTheDocument();

        // Description paragraph
        expect(screen.getByText(/Join BookNook to find your next great read/i)).toBeInTheDocument();

        // Explore Button
        expect(screen.getByRole('button', { name: /Explore Book Clubs/i })).toBeInTheDocument();

        // Join Now Button
        expect(screen.getByRole('button', { name: /Join Now/i })).toBeInTheDocument();

        // Book stack element
        expect(screen.getByText('BookNook')).toBeInTheDocument();
    });

    test('navigates to /bookclubs when Explore Book Clubs button is clicked', () => {
        render(
            <MemoryRouter>
                <HeroSection />
            </MemoryRouter>
        );

        const exploreButton = screen.getByRole('button', { name: /Explore Book Clubs/i });
        fireEvent.click(exploreButton);

        expect(mockNavigate).toHaveBeenCalledWith('/bookclubs');
    });

    test('navigates to /log-in with state when Join Now button is clicked', () => {
        render(
            <MemoryRouter>
                <HeroSection />
            </MemoryRouter>
        );

        const joinNowButton = screen.getByRole('button', { name: /Join Now/i });
        fireEvent.click(joinNowButton);

        expect(mockNavigate).toHaveBeenCalledWith('/log-in', { state: { showSignUp: true } });
    });
});