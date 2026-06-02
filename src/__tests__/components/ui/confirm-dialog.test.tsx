import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

describe('ConfirmDialog', () => {
  it('no renderiza nada cuando isOpen=false', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        title="Borrar"
      />
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('muestra title y description cuando isOpen=true', () => {
    render(
      <ConfirmDialog
        isOpen
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        title="¿Borrar usuario?"
        description="Esta acción no se puede deshacer."
      />
    );
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('¿Borrar usuario?')).toBeInTheDocument();
    expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument();
  });

  it('llama onConfirm al click en confirmar', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    render(
      <ConfirmDialog
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        title="Borrar"
        confirmLabel="Sí, borrar"
      />
    );
    fireEvent.click(screen.getByText('Sí, borrar'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('llama onClose al click en cancelar', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    render(
      <ConfirmDialog
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        title="Borrar"
      />
    );
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('cierra con Escape', () => {
    const onClose = jest.fn();
    render(
      <ConfirmDialog isOpen onClose={onClose} onConfirm={jest.fn()} title="Borrar" />
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('NO cierra con Escape cuando loading=true', () => {
    const onClose = jest.fn();
    render(
      <ConfirmDialog
        isOpen
        onClose={onClose}
        onConfirm={jest.fn()}
        title="Borrar"
        loading
      />
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('usa variant danger (botón rojo + icono)', () => {
    render(
      <ConfirmDialog
        isOpen
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        title="Borrar"
        variant="danger"
        confirmLabel="Eliminar"
      />
    );
    const confirmBtn = screen.getByText('Eliminar');
    expect(confirmBtn.className).toMatch(/bg-red-500/);
  });

  it('deshabilita botones cuando loading=true', () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmDialog
        isOpen
        onClose={jest.fn()}
        onConfirm={onConfirm}
        title="Borrar"
        loading
      />
    );
    fireEvent.click(screen.getByText('Cargando...'));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText('Cancelar')).toBeDisabled();
  });
});
