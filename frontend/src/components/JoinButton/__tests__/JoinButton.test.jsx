import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import JoinButton from '../JoinButton';

test('renders JoinButton and calls onClick', () => {
  const onClick = vi.fn();
  const { getByRole } = render(<JoinButton onClick={onClick} />);
  const btn = getByRole('button');
  fireEvent.click(btn);
  expect(onClick).toHaveBeenCalled();
});

test('title prop is applied', () => {
  const { getByRole } = render(<JoinButton title="Entrar" />);
  expect(getByRole('button').getAttribute('title')).toBe('Entrar');
});
