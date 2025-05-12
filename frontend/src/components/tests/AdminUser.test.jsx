import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminUsers from './AdminUsers'; // Adjust the path as needed
import '@testing-library/jest-dom/extend-expect'; // For the extra matchers like .toBeInTheDocument()

// Mock the fetch function
global.fetch = jest.fn();

describe('AdminUsers Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the users management page', async () => {
    // Mock the fetch response for users
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        users: [
          { id: 1, name: 'User One', username: 'user1', email: 'user1@example.com', is_active: true, is_admin: false, created_at: '2022-01-01', last_login: '2022-02-01' },
          { id: 2, name: 'User Two', username: 'user2', email: 'user2@example.com', is_active: false, is_admin: true, created_at: '2021-06-10', last_login: '2021-07-15' },
        ]
      })
    });

    render(<AdminUsers />);

    // Verify that the page rendered the user data correctly
    await waitFor(() => screen.getByText('User One'));
    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText('User Two')).toBeInTheDocument();

    // Check if the stats are rendered correctly
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Inactive Users')).toBeInTheDocument();
    expect(screen.getByText('New Users (30d)')).toBeInTheDocument();
  });

  it('filters users based on the search term', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        users: [
          { id: 1, name: 'User One', username: 'user1', email: 'user1@example.com', is_active: true, is_admin: false, created_at: '2022-01-01', last_login: '2022-02-01' },
          { id: 2, name: 'User Two', username: 'user2', email: 'user2@example.com', is_active: false, is_admin: true, created_at: '2021-06-10', last_login: '2021-07-15' },
        ]
      })
    });

    render(<AdminUsers />);

    // Wait for users to load
    await waitFor(() => screen.getByText('User One'));

    // Type into the search input
    fireEvent.change(screen.getByPlaceholderText('Search users...'), { target: { value: 'User One' } });

    // Check that the filtered user is displayed
    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.queryByText('User Two')).not.toBeInTheDocument();
  });

  it('sorts the users by name in ascending and descending order', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        users: [
          { id: 1, name: 'User One', username: 'user1', email: 'user1@example.com', is_active: true, is_admin: false, created_at: '2022-01-01', last_login: '2022-02-01' },
          { id: 2, name: 'User Two', username: 'user2', email: 'user2@example.com', is_active: false, is_admin: true, created_at: '2021-06-10', last_login: '2021-07-15' },
        ]
      })
    });

    render(<AdminUsers />);

    // Wait for users to load
    await waitFor(() => screen.getByText('User One'));

    // Click to sort by name in ascending order
    fireEvent.click(screen.getByText('User'));

    // Check that the sorting direction has changed to descending
    expect(screen.getByText('User Two')).toBeInTheDocument();
    expect(screen.getByText('User One').previousElementSibling).toHaveTextContent('User Two');

    // Click to sort by name in descending order
    fireEvent.click(screen.getByText('User'));

    // Verify the correct order after sorting
    expect(screen.getByText('User One').previousElementSibling).toHaveTextContent('User Two');
  });

  it('handles adding a new user', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 3, name: 'User Three', username: 'user3', email: 'user3@example.com', is_active: true, is_admin: false, created_at: '2022-05-01', last_login: '2022-06-10'
      })
    });

    render(<AdminUsers />);

    // Wait for users to load
    await waitFor(() => screen.getByText('User One'));

    // Open the add user form
    fireEvent.click(screen.getByText('Add User'));

    // Fill the form fields
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'User Three' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user3@example.com' } });
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'Member' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Active' } });

    // Click to add the user
    fireEvent.click(screen.getByText('Add User'));

    // Check that the new user is displayed in the list
    await waitFor(() => screen.getByText('User Three'));
    expect(screen.getByText('User Three')).toBeInTheDocument();
  });

  it('handles editing an existing user', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1, name: 'Updated User One', username: 'user1', email: 'updateduser1@example.com', is_active: true, is_admin: false, created_at: '2022-01-01', last_login: '2022-02-01'
      })
    });

    render(<AdminUsers />);

    // Wait for users to load
    await waitFor(() => screen.getByText('User One'));

    // Open the edit form for the first user
    fireEvent.click(screen.getAllByText('Edit')[0]);

    // Change user data in the form
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Updated User One' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'updateduser1@example.com' } });

    // Click to submit the edit
    fireEvent.click(screen.getByText('Update User'));

    // Verify the updated user is displayed
    await waitFor(() => screen.getByText('Updated User One'));
    expect(screen.getByText('Updated User One')).toBeInTheDocument();
    expect(screen.getByText('updateduser1@example.com')).toBeInTheDocument();
  });

  it('handles deleting a user', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    render(<AdminUsers />);

    // Wait for users to load
    await waitFor(() => screen.getByText('User One'));

    // Click delete button for the first user
    fireEvent.click(screen.getAllByText('Delete')[0]);

    // Confirm the user was deleted
    await waitFor(() => expect(screen.queryByText('User One')).not.toBeInTheDocument());
  });
});