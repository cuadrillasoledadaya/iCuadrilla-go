import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it.each([
    'pendiente',
    'en-curso',
    'finalizado',
    'presente',
    'ausente',
    'justificado',
    'anunciado',
    'neutral',
    'primary',
  ] as const)('renders variant=%s with data-variant', (variant) => {
    render(<Badge variant={variant}>TXT</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('data-variant', variant);
  });

  it('renders children content', () => {
    render(<Badge variant="presente">Confirmado</Badge>);
    expect(screen.getByText('Confirmado')).toBeInTheDocument();
  });

  it('defaults to variant=neutral when omitted', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge.className).toMatch(/bg-neutral-100/);
    expect(badge.className).toMatch(/text-neutral-700/);
  });

  it.each(['sm', 'md', 'lg'] as const)('applies size=%s', (size) => {
    render(
      <Badge variant="presente" size={size}>
        s
      </Badge>
    );
    expect(screen.getByTestId('badge')).toHaveClass(`text-${size === 'sm' ? '[9px]' : size === 'md' ? '[10px]' : 'xs'}`);
  });

  it('merges custom className', () => {
    render(<Badge className="ml-2" />);
    expect(screen.getByTestId('badge')).toHaveClass('ml-2');
  });

  it('applies a non-empty className for every variant (catches regression when classes are empty)', () => {
    const variants = [
      'pendiente',
      'en-curso',
      'finalizado',
      'presente',
      'ausente',
      'justificado',
      'anunciado',
      'neutral',
      'primary',
    ] as const;
    variants.forEach((variant) => {
      const { unmount } = render(<Badge variant={variant}>x</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge.className.length).toBeGreaterThan(0);
      unmount();
    });
  });
});
