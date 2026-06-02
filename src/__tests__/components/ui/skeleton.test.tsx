import { render, screen } from '@testing-library/react';
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonListItem,
} from '@/components/ui/skeleton';

describe('Skeleton', () => {
  it('renders a single block with the data-testid', () => {
    render(<Skeleton className="h-4 w-4" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('animate-pulse');
  });

  it('merges custom className', () => {
    render(<Skeleton className="h-4 w-4" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('h-4');
  });
});

describe('SkeletonText', () => {
  it('renders the requested number of lines', () => {
    render(<SkeletonText lines={3} />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
  });

  it('defaults to one line when lines is omitted', () => {
    render(<SkeletonText />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(1);
  });

  it('applies lastLineWidth as inline style on the final line', () => {
    render(<SkeletonText lines={2} lastLineWidth="40%" />);
    const lines = screen.getAllByTestId('skeleton');
    expect(lines[0]).not.toHaveStyle({ width: '40%' });
    expect(lines[1]).toHaveStyle({ width: '40%' });
  });
});

describe('SkeletonCard', () => {
  it('renders a card container with header and text placeholders', () => {
    render(<SkeletonCard />);
    const card = screen.getByTestId('skeleton-card');
    expect(card).toBeInTheDocument();
    expect(card.querySelectorAll('[data-testid="skeleton"]').length).toBeGreaterThanOrEqual(5);
  });
});

describe('SkeletonAvatar', () => {
  it('renders a circular skeleton of the given size', () => {
    render(<SkeletonAvatar size={48} />);
    const av = screen.getByTestId('skeleton-avatar');
    expect(av).toHaveClass('rounded-full');
    expect(av).toHaveStyle({ width: '48px', height: '48px' });
  });

  it('defaults to size 40', () => {
    render(<SkeletonAvatar />);
    expect(screen.getByTestId('skeleton-avatar')).toHaveStyle({ width: '40px', height: '40px' });
  });
});

describe('SkeletonListItem', () => {
  it('renders a row with an avatar and two text placeholders', () => {
    render(<SkeletonListItem />);
    const row = screen.getByTestId('skeleton-list-item');
    expect(row).toBeInTheDocument();
    expect(row.querySelectorAll('[data-testid="skeleton"]')).toHaveLength(3);
  });
});
