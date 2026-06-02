import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockBack = jest.fn();
const mockPush = jest.fn();

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({
    back: mockBack,
    push: mockPush,
  });
  mockBack.mockClear();
  mockPush.mockClear();
});

describe('PageHeader', () => {
  it('renders title as h1', () => {
    render(<PageHeader title="La Cuadrilla" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('La Cuadrilla');
  });

  it('renders subtitle and eyebrow when provided', () => {
    render(<PageHeader title="T" subtitle="Listado" eyebrow="Cuadrilla" />);
    expect(screen.getByText('Listado')).toBeInTheDocument();
    expect(screen.getByText('Cuadrilla')).toBeInTheDocument();
  });

  it('does not render back button when back is omitted', () => {
    render(<PageHeader title="T" />);
    expect(screen.queryByLabelText('Volver')).toBeNull();
  });

  it('renders back button when back=true and calls router.back()', () => {
    render(<PageHeader title="T" back />);
    fireEvent.click(screen.getByLabelText('Volver'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('uses back.href to push a route when provided', () => {
    render(<PageHeader title="T" back={{ href: '/dashboard' }} />);
    fireEvent.click(screen.getByLabelText('Volver'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('uses back.onClick when provided', () => {
    const onClick = jest.fn();
    render(<PageHeader title="T" back={{ onClick }} />);
    fireEvent.click(screen.getByLabelText('Volver'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('renders primary action button and triggers onClick', () => {
    const onClick = jest.fn();
    render(<PageHeader title="T" primaryAction={{ label: 'Crear', onClick }} />);
    fireEvent.click(screen.getByRole('button', { name: /Crear/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders primary action as a link when href is provided', () => {
    render(<PageHeader title="T" primaryAction={{ label: 'Ir', href: '/cuadrilla' }} />);
    expect(screen.getByRole('link', { name: /Ir/ })).toHaveAttribute('href', '/cuadrilla');
  });

  it('renders secondary action next to primary', () => {
    const onSec = jest.fn();
    render(
      <PageHeader
        title="T"
        primaryAction={{ label: 'Crear' }}
        secondaryAction={{ label: 'Filtrar', onClick: onSec }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Filtrar/ }));
    expect(onSec).toHaveBeenCalledTimes(1);
  });

  it('renders icon inside primary action', () => {
    render(
      <PageHeader
        title="T"
        primaryAction={{ label: 'Crear', icon: <Plus data-testid="plus-icon" size={16} /> }}
      />
    );
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });

  it.each(['centered', 'sticky', 'left'] as const)('renders variant=%s without crashing', (variant) => {
    render(<PageHeader title="T" variant={variant} />);
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });

  it('applies sticky positioning classes for variant=sticky', () => {
    render(<PageHeader title="T" variant="sticky" />);
    expect(screen.getByTestId('page-header').className).toMatch(/sticky/);
  });

  it('applies left-aligned layout for variant=left', () => {
    render(<PageHeader title="T" variant="left" back />);
    expect(screen.getByTestId('page-header').className).not.toMatch(/relative/);
    expect(screen.getByLabelText('Volver')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<PageHeader title="T" className="my-8" />);
    expect(screen.getByTestId('page-header')).toHaveClass('my-8');
  });

  it('renders rightSlot content instead of primary/secondary actions', () => {
    render(
      <PageHeader
        title="T"
        rightSlot={<button data-testid="custom-slot">+</button>}
        primaryAction={{ label: 'Ignored' }}
      />
    );
    expect(screen.getByTestId('custom-slot')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ignored' })).toBeNull();
  });
});
