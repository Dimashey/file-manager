import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

describe('ConfirmDeleteDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Delete Item',
    description: 'Are you sure you want to delete this item?',
    onConfirm: vi.fn(),
    onClose: vi.fn(),
  };

  it('should render the dialog with title and description when open is true', () => {
    render(<ConfirmDeleteDialog {...defaultProps} />);

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('should trigger onClose when Cancel is clicked', () => {
    const onCloseMock = vi.fn();
    render(<ConfirmDeleteDialog {...defaultProps} onClose={onCloseMock} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should trigger onConfirm when Delete is clicked', () => {
    const onConfirmMock = vi.fn();
    render(<ConfirmDeleteDialog {...defaultProps} onConfirm={onConfirmMock} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons and show loading indicator when isLoading is true', () => {
    render(<ConfirmDeleteDialog {...defaultProps} isLoading={true} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toBeDisabled(); // Cancel button
    expect(buttons[1]).toBeDisabled(); // Delete/Loading button
    
    // Check that CircularProgress or loading element is present (role is progressbar or we can query by type)
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should not render anything visible when open is false', () => {
    render(<ConfirmDeleteDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
    expect(screen.queryByText('Are you sure you want to delete this item?')).not.toBeInTheDocument();
  });
});
