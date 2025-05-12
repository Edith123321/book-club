import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import axios from 'axios';
import FollowList from './FollowList';
import md5 from 'md5';

// Mock axios and other dependencies
jest.mock('axios');
jest.mock('md5', () => jest.fn().mockImplementation(str => `hashed-${str}`));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: () => jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('FollowList Component', () => {
  const mockUsers = [
    {
      id: 1,
      username: 'user1',
      email: 'user1@example.com',
      avatar_url: '',
      is_following: false
    },
    {
      id: 2,
      username: 'user2',
      email: 'user2@example.com',
      avatar_url: 'avatar2.jpg',
      is_following: true
    }
  ];

  const mockCurrentUser = {
    id: 3,
    username: 'currentUser',
    email: 'current@example.com'
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock useParams
    useParams.mockReturnValue({ userId: '123' });
    
    // Mock localStorage
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'userData') return JSON.stringify(mockCurrentUser);
      if (key === 'authToken') return 'mock-token';
      return null;
    });
  });

  test('renders loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    
    render(
      <MemoryRouter>
        <FollowList type="followers" />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading followers...')).toBeInTheDocument();
  });

  test('renders error state when API fails', async () => {
    axios.get.mockRejectedValue({
      response: { data: { message: 'Network Error' } }
    });
    
    render(
      <MemoryRouter>
        <FollowList type="followers" />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Error: Network Error')).toBeInTheDocument();
    });
  });

  test('renders followers list correctly', async () => {
    axios.get.mockResolvedValue({
      data: { followers: mockUsers }
    });
    
    render(
      <MemoryRouter>
        <FollowList type="followers" />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Followers')).toBeInTheDocument();
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
      expect(screen.getByText('Follow')).toBeInTheDocument();
      expect(screen.getByText('Following')).toBeInTheDocument();
    });
  });

  test('renders following list correctly', async () => {
    axios.get.mockResolvedValue({
      data: { following: mockUsers }
    });
    
    render(
      <MemoryRouter>
        <FollowList type="following" />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Following')).toBeInTheDocument();
    });
  });

  test('renders empty state when no users', async () => {
    axios.get.mockResolvedValue({
      data: { followers: [] }
    });
    
    render(
      <MemoryRouter>
        <FollowList type="followers" />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('No followers found')).toBeInTheDocument();
    });
  });

  test('handles user click navigation', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
    
    axios.get.mockResolvedValue({
      data: { followers: mockUsers }
    });
    
    render(
      <MemoryRouter>
        <FollowList type="followers" />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('user1'));
      expect(mockNavigate).toHaveBeenCalledWith('/users/1');
    });
  });

  test('handles follow button click', async () => {
    axios.get.mockResolvedValueOnce({
      data: { followers: mockUsers }
    }).mockResolvedValueOnce({
      data: { is_following: false }
    }).mockResolvedValueOnce({});
    
    render(
      <MemoryRouter>
        <FollowList type="followers" />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const followButton = screen.getByText('Follow');
      fireEvent.click(followButton);
      
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/1/follow',
        {},
        { headers: { 'Authorization': 'Bearer mock-token' } }
      );
    });
  });

  test('handles unfollow button click', async () => {
    axios.get.mockResolvedValueOnce({
      data: { followers: mockUsers }
    }).mockResolvedValueOnce({
      data: { is_following: true }
    }).mockResolvedValueOnce({});
    
    render(
      <MemoryRouter>
        <FollowList type="followers" />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const unfollowButton = screen.getByText('Following');
      fireEvent.click(unfollowButton);
      
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/2/follow',
        { headers: { 'Authorization': 'Bearer mock-token' } }
      );
    });
  });

  test('redirects to login when no token on follow', async () => {
    localStorageMock.getItem.mockImplementation(() => null);
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
    
    axios.get.mockResolvedValue({
      data: { followers: mockUsers }
    });
    
    render(
      <MemoryRouter>
        <FollowList type="followers" />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Follow'));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('renders default avatar when image fails to load', async () => {
    axios.get.mockResolvedValue({
      data: { followers: mockUsers }
    });
    
    render(
      <MemoryRouter>
        <FollowList type="followers" />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const avatar = screen.getAllByRole('img')[0];
      fireEvent.error(avatar);
      expect(avatar).toHaveAttribute('src', '/default-avatar.png');
    });
  });

  test('does not show follow button for current user', async () => {
    // Add current user to the mock data
    const usersWithCurrent = [...mockUsers, mockCurrentUser];
    axios.get.mockResolvedValue({
      data: { followers: usersWithCurrent }
    });
    
    render(
      <MemoryRouter>
        <FollowList type="followers" />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByText('Follow', { selector: '.user-card:last-child .mini-follow-btn' })).toBeNull();
    });
  });
});