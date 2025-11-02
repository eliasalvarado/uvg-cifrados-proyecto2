import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import AddButton from '../AddButton';

test('renders AddButton and calls onClick with no args', () => {
  const onClick = vi.fn();
  const { getByRole } = render(<AddButton onClick={onClick} />);
  const btn = getByRole('button');
  expect(btn).toBeTruthy();
  fireEvent.click(btn);
  expect(onClick).toHaveBeenCalled();
});

test('uses provided title prop', () => {
  const { getByRole } = render(<AddButton title="Crear"/>);
  const btn = getByRole('button');
  expect(btn.getAttribute('title')).toBe('Crear');
});
