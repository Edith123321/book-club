import { render, screen, fireEvent, within } from '@testing-library/react';
import AdminSchedules from '../AdminSchedules';

describe('AdminSchedules Component', () => {
  test('renders AdminSchedules with initial events', () => {
    render(<AdminSchedules />);
    expect(screen.getByText('Schedules Management')).toBeInTheDocument();
    expect(screen.getByText('Monthly Book Discussion')).toBeInTheDocument();
    expect(screen.getByText('Author Q&A Session')).toBeInTheDocument();
  });

  test('filters schedules based on search input', () => {
    render(<AdminSchedules />);
    const searchInput = screen.getByPlaceholderText('Search schedules...');
    fireEvent.change(searchInput, { target: { value: 'Author' } });

    expect(screen.getByText('Author Q&A Session')).toBeInTheDocument();
    expect(screen.queryByText('Monthly Book Discussion')).not.toBeInTheDocument();
  });

  test('sorts schedules by event name', () => {
    render(<AdminSchedules />);
    const eventNameHeader = screen.getByText('EventName');

    // Sort ASC
    fireEvent.click(eventNameHeader);
    let rows = screen.getAllByRole('row');
    let firstRowCells = within(rows[1]).getAllByRole('cell');
    expect(firstRowCells[0]).toHaveTextContent('Author Q&A Session');

    // Sort DESC
    fireEvent.click(eventNameHeader);
    rows = screen.getAllByRole('row');
    firstRowCells = within(rows[1]).getAllByRole('cell');
    expect(firstRowCells[0]).toHaveTextContent('New Releases Preview');
  });

  test('adds a new schedule', () => {
    render(<AdminSchedules />);
    fireEvent.click(screen.getByText(/Add Schedule/i));

    fireEvent.change(screen.getByLabelText(/EventName/i), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2023-09-10' } });
    fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '15:00' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Online' } });
    fireEvent.change(screen.getByLabelText(/Club/i), { target: { value: 'All Members' } });
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'Pending' } });

    fireEvent.click(screen.getByText(/Add Schedule/i));

    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  test('edits a schedule', () => {
    render(<AdminSchedules />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]); // Edit the first schedule

    const eventNameInput = screen.getByLabelText(/EventName/i);
    fireEvent.change(eventNameInput, { target: { value: 'Updated Event' } });

    fireEvent.click(screen.getByText(/Save Changes/i));

    expect(screen.getByText('Updated Event')).toBeInTheDocument();
  });

  test('deletes a schedule after confirmation', () => {
    window.confirm = jest.fn(() => true); // Mock confirm dialog

    render(<AdminSchedules />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]); // Delete first schedule

    expect(screen.queryByText('Monthly Book Discussion')).not.toBeInTheDocument();
  });

  test('closes add schedule modal on cancel', () => {
    render(<AdminSchedules />);

    fireEvent.click(screen.getByText(/Add Schedule/i));
    fireEvent.click(screen.getByText(/Cancel/i));

    expect(screen.queryByText(/Add New Schedule/i)).not.toBeInTheDocument();
  });
});