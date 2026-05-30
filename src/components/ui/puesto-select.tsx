'use client';

import { forwardRef } from 'react';

interface PuestoSelectProps {
  value: string;
  onChange: (value: string) => void;
  includeEmpty?: boolean;
  className?: string;
}

const PUESTOS = [
  'Patero Izq',
  'Patero Der',
  'Fijador Izq',
  'Fijador Der',
  'Costero Izq',
  'Costero Der',
  'Corriente',
] as const;

export const PuestoSelect = forwardRef<HTMLSelectElement, PuestoSelectProps>(
  ({ value, onChange, includeEmpty = true, className }, ref) => {
    const baseClassName =
      'w-full bg-white border border-black/10 h-12 rounded-xl px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none';

    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className ?? baseClassName}
      >
        {includeEmpty && (
          <option value="" className="text-black bg-white">
            {includeEmpty === true ? 'Selecciona...' : 'Sin puesto secundario'}
          </option>
        )}
        {PUESTOS.map((puesto) => (
          <option key={puesto} value={puesto} className="text-black bg-white">
            {puesto}
          </option>
        ))}
      </select>
    );
  }
);

PuestoSelect.displayName = 'PuestoSelect';
