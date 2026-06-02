import { render, screen, fireEvent } from '@testing-library/react';
import { Bell } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
  it('renders icon, title and description', () => {
    render(<EmptyState icon={Bell} title="Sin avisos" description="No hay nada todavía" />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('Sin avisos')).toBeInTheDocument();
    expect(screen.getByText('No hay nada todavía')).toBeInTheDocument();
  });

  it('renders an action as a Link when href is provided', () => {
    render(
      <EmptyState
        icon={Bell}
        title="Sin avisos"
        action={{ label: 'Ver todos', href: '/avisos' }}
      />
    );
    const link = screen.getByRole('link', { name: 'Ver todos' });
    expect(link).toHaveAttribute('href', '/avisos');
  });

  it('renders an action as a button when onClick is provided', () => {
    const onClick = jest.fn();
    render(
      <EmptyState icon={Bell} title="Sin avisos" action={{ label: 'Crear', onClick }} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it.each(['default', 'muted', 'card'] as const)('applies variant=%s styles', (variant) => {
    const { container } = render(
      <EmptyState icon={Bell} title="t" variant={variant} data-testid="es" />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('merges custom className on the root', () => {
    render(<EmptyState icon={Bell} title="t" className="my-8" />);
    expect(screen.getByTestId('empty-state')).toHaveClass('my-8');
  });
});
