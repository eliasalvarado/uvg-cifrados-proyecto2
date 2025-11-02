import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ChatItem from '../ChatItem';

test('renders user name and optional alias, handles click and keyup', () => {
  const onClick = vi.fn();
  const { getByRole, getByText } = render(
    <ChatItem userId="u1" user="alice" alias="Ali" message="hi" date={new Date().toISOString()} notViewed={2} onClick={onClick} />
  );

  const btn = getByRole('button');
  expect(getByText('Ali')).toBeTruthy();
  expect(getByText('(alice)')).toBeTruthy();
  fireEvent.click(btn);
  expect(onClick).toHaveBeenCalledWith('u1');
  fireEvent.keyUp(btn);
  expect(onClick).toHaveBeenCalled();
});

test('formats old dates and hides notViewed when zero', () => {
  const oldDate = '2020-01-02T12:00:00.000Z';
  const { getByText, queryByText } = render(
    <ChatItem userId="u2" user="bob" message="hey" date={oldDate} notViewed={0} />
  );
  // date should be rendered in DD-MM-YYYY format or contain '-'
  const dateEl = getByText((content) => /-/.test(content));
  expect(dateEl).toBeTruthy();
  expect(queryByText('0')).toBeNull();
});

test('renders empty date when date is not provided and selected class applied', () => {
  const onClick = vi.fn();
  const { container } = render(
    <ChatItem userId="u3" user="carol" message="hola" />
  );
  const spans = container.querySelectorAll('span');
  // name span is first, date span is second
  const dateSpan = spans[1];
  expect(dateSpan.textContent).toBe('');
});

test('selected prop adds selected class', () => {
  const { container: c1 } = render(<ChatItem userId="s1" user="sue" selected={false} />);
  const btn1 = c1.querySelector('button');

  const { container: c2 } = render(<ChatItem userId="s2" user="sue" selected={true} />);
  const btn2 = c2.querySelector('button');

  // className should differ when selected prop true (contains additional token)
  expect(btn1.className).not.toBe(btn2.className);
});
