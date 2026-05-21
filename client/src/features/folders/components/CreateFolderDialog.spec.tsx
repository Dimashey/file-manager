import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateFolderDialog } from './CreateFolderDialog';
import { useCreateFolder } from '../hooks/useFolders';

vi.mock('../hooks/useFolders', () => ({
  useCreateFolder: vi.fn(),
}));

describe('CreateFolderDialog', () => {
  const defaultProps = {
    open: true,
    parentId: 'parent-123',
    onClose: vi.fn(),
  };

  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useCreateFolder).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);
  });

  it('should render the dialog elements when open is true', () => {
    render(<CreateFolderDialog {...defaultProps} />);

    expect(screen.getByText('New Folder')).toBeInTheDocument();
    expect(screen.getByLabelText(/folder name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('should call onClose when Cancel is clicked', () => {
    render(<CreateFolderDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should validate form and show error message on empty submit', async () => {
    render(<CreateFolderDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should trigger mutate when a folder name is filled out and submitted', async () => {
    render(<CreateFolderDialog {...defaultProps} />);

    const input = screen.getByLabelText(/folder name/i);
    fireEvent.change(input, { target: { value: 'Holiday Photos' } });

    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    // Check custom hook mutate arguments
    expect(mockMutate).toHaveBeenCalledWith(
      { name: 'Holiday Photos', parentId: 'parent-123' },
      expect.any(Object)
    );
  });

  it('should render progress bar and disable buttons when isPending is true', () => {
    vi.mocked(useCreateFolder).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as any);

    render(<CreateFolderDialog {...defaultProps} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toBeDisabled(); // Cancel button
    expect(buttons[1]).toBeDisabled(); // Create button with spinner
  });
});
