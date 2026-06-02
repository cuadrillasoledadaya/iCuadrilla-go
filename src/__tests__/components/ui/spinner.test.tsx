import { render, screen } from '@testing-library/react';
import { Spinner } from '@/components/ui/spinner';

describe('Spinner', () => {
  it('renders with default medium size and accessible label', () => {
    render(<Spinner />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'Cargando');
  });

  it('uses a custom label when provided', () => {
    render(<Spinner label="Cargando eventos" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando eventos');
  });

  it.each(['sm', 'md', 'lg', 'xl'] as const)('applies size=%s class token', (size) => {
    render(<Spinner size={size} data-testid={`spinner-${size}`} />);
    const status = screen.getByTestId(`spinner-${size}`);
    const inner = status.querySelector('div');
    expect(inner).not.toBeNull();
    expect(inner?.className).toMatch(/h-\d+/);
    expect(inner?.className).toMatch(/w-\d+/);
  });

  it.each(['primary', 'accent', 'white'] as const)('applies color=%s to inner', (color) => {
    render(<Spinner color={color} data-testid={`spinner-${color}`} />);
    const inner = screen.getByTestId(`spinner-${color}`).querySelector('div');
    expect(inner?.className).toContain(`border-${color}`);
  });

  it('merges custom className on the outer wrapper', () => {
    render(<Spinner className="my-4" />);
    expect(screen.getByRole('status')).toHaveClass('my-4');
  });

  it('forwards arbitrary HTML attrs to the wrapper', () => {
    render(<Spinner data-testid="loader" />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });
});
