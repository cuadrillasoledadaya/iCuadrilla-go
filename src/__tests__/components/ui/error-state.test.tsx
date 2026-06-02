import { render, screen, fireEvent } from '@testing-library/react';
import { WifiOff } from 'lucide-react';
import { ErrorState } from '@/components/ui/error-state';

describe('ErrorState', () => {
  it('renders default title and description with role=alert', () => {
    render(<ErrorState />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('No se pudo cargar la información');
    expect(alert).toHaveTextContent('Revisa tu conexión e inténtalo de nuevo.');
  });

  it('renders custom title and description', () => {
    render(<ErrorState title="Falló" description="Algo explotó" />);
    expect(screen.getByText('Falló')).toBeInTheDocument();
    expect(screen.getByText('Algo explotó')).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is omitted', () => {
    render(<ErrorState />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders retry button when onRetry is provided and triggers callback', () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} retryLabel="Reintentar" />);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('accepts a custom icon node', () => {
    render(<ErrorState icon={<WifiOff data-testid="custom-icon" />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<ErrorState className="my-6" />);
    expect(screen.getByRole('alert')).toHaveClass('my-6');
  });
});
