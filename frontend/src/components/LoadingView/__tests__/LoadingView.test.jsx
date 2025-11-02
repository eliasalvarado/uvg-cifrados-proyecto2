import React from 'react';
import { render } from '@testing-library/react';
import LoadingView from '../LoadingView';

test('renders nested spinner structure', () => {
  const { container } = render(<LoadingView />);
  // should contain three nested divs inside the root
  const root = container.firstChild;
  expect(root.querySelectorAll('div').length).toBeGreaterThanOrEqual(3);
});
