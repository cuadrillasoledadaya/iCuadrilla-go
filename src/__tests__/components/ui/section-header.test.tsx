import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';

describe('SectionHeader', () => {
  it('renders title', () => {
    render(<SectionHeader title="Próximos eventos" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Próximos eventos');
  });

  it('renders eyebrow + title together when both are present', () => {
    render(<SectionHeader eyebrow="Calendario" title="Próximos eventos" />);
    expect(screen.getByText('Calendario')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Próximos eventos');
  });

  it('renders description when provided', () => {
    render(<SectionHeader title="t" description="Hoy" />);
    expect(screen.getByText('Hoy')).toBeInTheDocument();
  });

  it('renders icon as ReactNode', () => {
    render(
      <SectionHeader
        title="t"
        icon={<Calendar data-testid="section-icon" size={18} />}
      />
    );
    expect(screen.getByTestId('section-icon')).toBeInTheDocument();
  });

  it('renders action as a Link when href is provided', () => {
    render(<SectionHeader title="t" action={{ label: 'VER TODO', href: '/avisos' }} />);
    const link = screen.getByRole('link', { name: 'VER TODO' });
    expect(link).toHaveAttribute('href', '/avisos');
    expect(link).toHaveClass('text-primary');
  });

  it('renders action as a button when onClick is provided', () => {
    const onClick = jest.fn();
    render(<SectionHeader title="t" action={{ label: 'Filtrar', onClick }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render action block when action is omitted', () => {
    render(<SectionHeader title="t" />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('merges custom className on the root', () => {
    render(<SectionHeader title="t" className="my-4" />);
    expect(screen.getByTestId('section-header')).toHaveClass('my-4');
  });
});
