import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import UserPicture from '../UserPicture';

test('renders initial from name and shows X when name missing', () => {
  const { getByText, rerender } = render(<UserPicture name="Pedro" />);
  expect(getByText('P')).toBeTruthy();

  // when name is empty or falsy, fallback to 'X'
  rerender(<UserPicture name={''} />);
  expect(getByText('X')).toBeTruthy();
});

test('renders button when onClick provided and calls handler', () => {
  const onClick = vi.fn();
  const { getByRole } = render(<UserPicture name="Lili" onClick={onClick} />);
  const btn = getByRole('button');
  fireEvent.click(btn);
  expect(onClick).toHaveBeenCalled();
  expect(btn.getAttribute('aria-label')).toBe('Usuario Lili');
});
