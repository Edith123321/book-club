import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import EditProfilePage from '../components/EditProfilePage';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    put: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

describe('EditProfilePage Component', () => {
  const mockUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio',
    avatar_url: 'https://example.com/avatar.jpg'
  };

  // Setup for localStorage mock
  let localStorageMock;
  
  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();
    
    // Mock localStorage
    localStorageMock = {
      getItem: jest.fn().mockImplementation(key => {
        if (key === 'userData') return JSON.stringify(mockUser);
        if (key === 'authToken') return 'fake-token';
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock axios responses
    const mockAxiosInstance = axios.create();
    mockAxiosInstance.get.mockResolvedValue({ data: mockUser });
    mockAxiosInstance.put.mockResolvedValue({ data: mockUser });
  });

  test('redirects to login if user data is not in localStorage', async () => {
    // Override localStorage mock for this test
    localStorageMock.getItem.mockImplementation(() => null);
    
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    );
    
    // Check if navigate was called with '/log-in'
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/log-in');
    });
  });

  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders form with user data when loaded', async () => {
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Username')).toHaveValue('testuser');
      expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
      expect(screen.getByLabelText('Bio')).toHaveValue('Test bio');
      expect(screen.getByLabelText('Avatar URL')).toHaveValue('https://example.com/avatar.jpg');
    });
  });

  test('handles form input changes', async () => {
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText('Username');
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    expect(usernameInput).toHaveValue('newusername');
    
    const bioInput = screen.getByLabelText('Bio');
    fireEvent.change(bioInput, { target: { value: 'New bio content' } });
    expect(bioInput).toHaveValue('New bio content');
  });

  test('shows avatar preview when URL is provided', async () => {
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Avatar URL')).toBeInTheDocument();
    });
    
    // Avatar preview should exist with the initial value
    expect(screen.getByAltText('Avatar Preview')).toBeInTheDocument();
    expect(screen.getByAltText('Avatar Preview')).toHaveAttribute('src', mockUser.avatar_url);

    // Change avatar URL
    const avatarInput = screen.getByLabelText('Avatar URL');
    fireEvent.change(avatarInput, { target: { value: 'https://example.com/new-avatar.jpg' } });
    
    // Preview should update
    expect(screen.getByAltText('Avatar Preview')).toHaveAttribute('src', 'https://example.com/new-avatar.jpg');
  });

  test('submits form and handles successful update', async () => {
    const mockAxiosInstance = axios.create();
    mockAxiosInstance.put.mockResolvedValue({ data: { ...mockUser, username: 'newusername' } });
    
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    // Change username
    const usernameInput = screen.getByLabelText('Username');
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    
    // Submit form
    const submitButton = screen.getByText(/Save Changes/i);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
    
    // Check if setTimeout is called to navigate
    jest.useFakeTimers();
    jest.advanceTimersByTime(2000);
    expect(mockNavigate).toHaveBeenCalledWith('/');
    jest.useRealTimers();
  });

  test('handles API errors on form submission', async () => {
    const mockAxiosInstance = axios.create();
    mockAxiosInstance.put.mockRejectedValue({ 
      response: { data: { error: 'Username already taken' } } 
    });
    
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });
    
    // Submit form
    const submitButton = screen.getByText(/Save Changes/i);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Username already taken')).toBeInTheDocument();
    });
  });

  test('navigates to home when cancel button is clicked', async () => {
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    });
    
    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('handles generic API errors', async () => {
    const mockAxiosInstance = axios.create();
    mockAxiosInstance.put.mockRejectedValue({ message: 'Network error' });
    
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });
    
    // Submit form
    const submitButton = screen.getByText(/Save Changes/i);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to update profile. Please try again.')).toBeInTheDocument();
    });
  });
  
  test('handles API error when fetching user profile', async () => {
    const mockAxiosInstance = axios.create();
    mockAxiosInstance.get.mockRejectedValue(new Error('Failed to fetch'));
    
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load user profile')).toBeInTheDocument();
    });
  });
});