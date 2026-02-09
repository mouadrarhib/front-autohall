import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

const ThrowingChild = () => {
  throw new Error('boom');
};

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders fallback UI when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload application' })).toBeInTheDocument();
  });

  it('reloads the page when reload button is clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const reloadMock = vi.fn();

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadMock },
    });

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reload application' }));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
