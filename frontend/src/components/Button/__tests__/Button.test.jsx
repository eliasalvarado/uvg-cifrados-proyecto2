import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

test('renders label and calls onClick', async () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick}>Enviar</Button>);
  const btn = screen.getByRole('button', { name: /enviar/i });
  await userEvent.click(btn);
  expect(onClick).toHaveBeenCalledTimes(1);
});
