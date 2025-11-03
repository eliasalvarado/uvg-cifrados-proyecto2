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

test('renders label emptyRed', async () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick} emptyRed >Enviar</Button>);
  const btn = screen.getByRole('button', { name: /enviar/i });
  await userEvent.click(btn);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('renders label red', async () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick} red >Enviar</Button>);
  const btn = screen.getByRole('button', { name: /enviar/i });
  await userEvent.click(btn);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('renders label green', async () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick} green >Enviar</Button>);
  const btn = screen.getByRole('button', { name: /enviar/i });
  await userEvent.click(btn);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('renders label emptyBlue', async () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick} emptyBlue >Enviar</Button>);
  const btn = screen.getByRole('button', { name: /enviar/i });
  await userEvent.click(btn);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('renders label black', async () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick} black >Enviar</Button>);
  const btn = screen.getByRole('button', { name: /enviar/i });
  await userEvent.click(btn);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('renders label gray', async () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick} gray >Enviar</Button>);
  const btn = screen.getByRole('button', { name: /enviar/i });
  await userEvent.click(btn);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('renders label className', async () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick} className="custom-class">Enviar</Button>);
  const btn = screen.getByRole('button', { name: /enviar/i });
  await userEvent.click(btn);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('renders label type', async () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick} type="submit">Enviar</Button>);
  const btn = screen.getByRole('button', { name: /enviar/i });
  await userEvent.click(btn);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('renders label disabled', async () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick} disabled >Enviar</Button>);
  const btn = screen.getByRole('button', { name: /enviar/i });
  await userEvent.click(btn);
  expect(onClick).toHaveBeenCalledTimes(0);
});

test('renders label children', async () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick} disabled >
    <span>Enviar</span>
  </Button>);
  const btn = screen.getByRole('button', { name: /enviar/i });
  await userEvent.click(btn);
  expect(onClick).toHaveBeenCalledTimes(0);
});

test('renders label text', async () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick}>Enviar</Button>);
  const btn = screen.getByRole('button', { name: /enviar/i });
  await userEvent.click(btn);
  expect(onClick).toHaveBeenCalledTimes(1);
});
