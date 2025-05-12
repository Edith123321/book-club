import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import axios from 'axios';
import UserProfile from './UserProfile';
import md5 from 'md5';

// Mock dependencies
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: () => jest.fn(),
}));
jest.mock('md5', () => jest.fn().mockImplementation(str => `hashed-${str}`));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('UserProfile Component', () => {
  const mockProfileUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio',
    avatar_url: '',
    posts: []
  };

  const mockCurrentUser = {
    id: 2,
    username: 'currentuser',
    email: 'current@example.com'
  };

  const mockFollowers = [
    { id: 3, username: 'follower1', email: 'follower1@example.com', avatar_url: '' },
    { id: 4, username: 'follower2', email: 'follower2@example.com', avatar_url: 'avatar2.jpg' }
  ];

  const mockFollowing = [
    { id: 5, username: 'following1', email: 'following1@example.com', avatar_url: '' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ userId: '1' });
  });

  test('renders loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    
    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  test('renders profile data correctly', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'userData') return JSON.stringify(mockCurrentUser);
      if (key === 'authToken') return 'mock-token';
      return null;
    });

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: mockProfileUser });
      }
      if (url.includes('/followers')) {
        return Promise.resolve({ data: { followers: mockFollowers } });
      }
      if (url.includes('/following')) {
        return Promise.resolve({ data: { following: mockFollowing } });
      }
      if (url.includes('/follow/1')) {
        return Promise.resolve({ data: { is_following: false } });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Test bio')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Followers count
      expect(screen.getByText('1')).toBeInTheDocument(); // Following count
      expect(screen.getByText('Follow')).toBeInTheDocument();
    });
  });

  test('handles follow action correctly', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'userData') return JSON.stringify(mockCurrentUser);
      if (key === 'authToken') return 'mock-token';
      return null;
    });

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: mockProfileUser });
      }
      if (url.includes('/followers')) {
        return Promise.resolve({ data: { followers: mockFollowers } });
      }
      if (url.includes('/following')) {
        return Promise.resolve({ data: { following: mockFollowing } });
      }
      if (url.includes('/follow/1')) {
        return Promise.resolve({ data: { is_following: false } });
      }
      return Promise.reject(new Error('Not found'));
    });

    axios.post.mockResolvedValue({});

    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      const followButton = screen.getByText('Follow');
      fireEvent.click(followButton);
      
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/follow/1',
        {},
        { headers: { 'Authorization': 'Bearer mock-token' } }
      );
    });
  });

  test('handles unfollow action correctly', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'userData') return JSON.stringify(mockCurrentUser);
      if (key === 'authToken') return 'mock-token';
      return null;
    });

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: mockProfileUser });
      }
      if (url.includes('/followers')) {
        return Promise.resolve({ data: { followers: mockFollowers } });
      }
      if (url.includes('/following')) {
        return Promise.resolve({ data: { following: mockFollowing } });
      }
      if (url.includes('/follow/1')) {
        return Promise.resolve({ data: { is_following: true } });
      }
      return Promise.reject(new Error('Not found'));
    });

    axios.delete.mockResolvedValue({});

    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      const followButton = screen.getByText('Following');
      fireEvent.click(followButton);
      
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:5000/follow/1',
        { headers: { 'Authorization': 'Bearer mock-token' } }
      );
    });
  });

  test('redirects to login when not authenticated', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
    
    localStorageMock.getItem.mockImplementation(() => null);

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: mockProfileUser });
      }
      if (url.includes('/followers')) {
        return Promise.resolve({ data: { followers: mockFollowers } });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      const followButton = screen.getByText('Follow');
      fireEvent.click(followButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('switches between tabs correctly', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: mockProfileUser });
      }
      if (url.includes('/followers')) {
        return Promise.resolve({ data: { followers: mockFollowers } });
      }
      if (url.includes('/following')) {
        return Promise.resolve({ data: { following: mockFollowing } });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Click followers tab
      fireEvent.click(screen.getByText('Followers'));
      expect(screen.getByText('follower1')).toBeInTheDocument();
      
      // Click following tab
      fireEvent.click(screen.getByText('Following'));
      expect(screen.getByText('following1')).toBeInTheDocument();
      
      // Click posts tab
      fireEvent.click(screen.getByText('Posts'));
      expect(screen.getByText('No posts yet.')).toBeInTheDocument();
    });
  });

  test('handles avatar image error', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: mockProfileUser });
      }
      if (url.includes('/followers')) {
        return Promise.resolve({ data: { followers: mockFollowers } });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      const avatar = screen.getByAltText("testuser's avatar");
      fireEvent.error(avatar);
      expect(avatar).toHaveAttribute('src', '/default-avatar.png');
    });
  });

  test('navigates to user profile when follower clicked', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
    
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: mockProfileUser });
      }
      if (url.includes('/followers')) {
        return Promise.resolve({ data: { followers: mockFollowers } });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('follower1'));
      expect(mockNavigate).toHaveBeenCalledWith('/users/3');
    });
  });

  test('does not show follow button for own profile', async () => {
    useParams.mockReturnValue({ userId: '2' }); // Same as current user ID
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'userData') return JSON.stringify(mockCurrentUser);
      return null;
    });

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: mockCurrentUser });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Follow')).not.toBeInTheDocument();
    });
  });
});