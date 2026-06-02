import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/ui/toast';

function Harness({ onReady }: { onReady?: (api: ReturnType<typeof useToast>) => void }) {
  const api = useToast();
  React.useEffect(() => {
    onReady?.(api);
  }, [api, onReady]);
  return <button onClick={() => api.success('Hello')}>trigger</button>;
}

import * as React from 'react';

describe('ToastProvider + useToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('throws when useToast is used outside a provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Harness />)).toThrow(/ToastProvider/);
    consoleError.mockRestore();
  });

  it('renders a success toast and exposes its id', () => {
    let id: string | undefined;
    render(
      <ToastProvider>
        <Harness
          onReady={(api) => {
            id = api.success('Guardado');
          }}
        />
      </ToastProvider>
    );
    expect(screen.getByTestId('toast')).toBeInTheDocument();
    expect(screen.getByTestId('toast')).toHaveAttribute('data-variant', 'success');
    expect(screen.getByText('Guardado')).toBeInTheDocument();
    expect(id).toBeDefined();
  });

  it.each(['success', 'error', 'info', 'warning'] as const)(
    'renders %s variant with the correct data-variant',
    (variant) => {
      let api: ReturnType<typeof useToast> | undefined;
      render(
        <ToastProvider>
          <Harness
            onReady={(a) => {
              api = a;
            }}
          />
        </ToastProvider>
      );
      act(() => {
        api![variant]('desc');
      });
      expect(screen.getByTestId('toast')).toHaveAttribute('data-variant', variant);
    }
  );

  it('renders title + description when both are provided', () => {
    let api: ReturnType<typeof useToast> | undefined;
    render(
      <ToastProvider>
        <Harness
          onReady={(a) => {
            api = a;
          }}
        />
      </ToastProvider>
    );
    act(() => {
      api!.toast({ title: 'Titulo', description: 'Detalle', variant: 'info' });
    });
    expect(screen.getByText('Titulo')).toBeInTheDocument();
    expect(screen.getByText('Detalle')).toBeInTheDocument();
  });

  it('auto-dismisses after the default duration', () => {
    let api: ReturnType<typeof useToast> | undefined;
    render(
      <ToastProvider>
        <Harness
          onReady={(a) => {
            api = a;
          }}
        />
      </ToastProvider>
    );
    act(() => {
      api!.success('x');
    });
    expect(screen.getByTestId('toast')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(4001);
    });
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('respects a custom duration', () => {
    let api: ReturnType<typeof useToast> | undefined;
    render(
      <ToastProvider>
        <Harness
          onReady={(a) => {
            api = a;
          }}
        />
      </ToastProvider>
    );
    act(() => {
      api!.toast({ description: 'x', duration: 1000 });
    });
    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(screen.getByTestId('toast')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(2);
    });
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('does not auto-dismiss when duration=0', () => {
    let api: ReturnType<typeof useToast> | undefined;
    render(
      <ToastProvider>
        <Harness
          onReady={(a) => {
            api = a;
          }}
        />
      </ToastProvider>
    );
    act(() => {
      api!.toast({ description: 'sticky', duration: 0 });
    });
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(screen.getByTestId('toast')).toBeInTheDocument();
  });

  it('manual dismiss via the close button', () => {
    let api: ReturnType<typeof useToast> | undefined;
    render(
      <ToastProvider>
        <Harness
          onReady={(a) => {
            api = a;
          }}
        />
      </ToastProvider>
    );
    act(() => {
      api!.info('Hola');
    });
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('programmatic dismiss(id) removes the toast', () => {
    let api: ReturnType<typeof useToast> | undefined;
    render(
      <ToastProvider>
        <Harness
          onReady={(a) => {
            api = a;
          }}
        />
      </ToastProvider>
    );
    let id: string;
    act(() => {
      id = api!.warning('cuidado', 'Ojo');
    });
    expect(screen.getByTestId('toast')).toBeInTheDocument();
    act(() => {
      api!.dismiss(id!);
    });
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('stacks multiple toasts', () => {
    let api: ReturnType<typeof useToast> | undefined;
    render(
      <ToastProvider>
        <Harness
          onReady={(a) => {
            api = a;
          }}
        />
      </ToastProvider>
    );
    act(() => {
      api!.success('uno');
      api!.error('dos');
    });
    expect(screen.getAllByTestId('toast')).toHaveLength(2);
  });
});
