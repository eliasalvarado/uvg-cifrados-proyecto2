import React from 'react';
import { render } from '@testing-library/react';
import Spinner from '../Spinner';

test('Spinner applies className and renders inner div', () => {
  const { container } = render(<Spinner className="extra" />);
  const el = container.firstChild;
  expect(el.className).toContain('spinner');
  expect(el.className).toContain('extra');
  expect(el.querySelector('div')).toBeTruthy();
});
