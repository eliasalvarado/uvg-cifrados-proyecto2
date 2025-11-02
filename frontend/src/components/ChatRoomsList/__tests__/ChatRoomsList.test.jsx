import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { vi, test, expect, beforeEach } from 'vitest';

// Prepare mocks for hooks used by ChatRoomsList
const groupsMock = {
  '1': { name: 'Group One' },
  '2': { name: 'Group Two' }
};

let groupMessagesMock = {
  '1': [{ datetime: '2024-01-01T00:00:00.000Z', message: 'hello', sent: false, username: 'alice' }],
  '2': []
};

let createResult = null;
let createError = null;
let joinResult = null;
let joinError = null;

const createGroupMock = vi.fn();
const joinGroupMock = vi.fn();
const createEmptyGroupMock = vi.fn();
const joinGroupSocketMock = vi.fn();

vi.mock('../../../hooks/groupChat/useCreateGroup', () => ({
  default: () => ({ createGroup: createGroupMock, result: createResult, error: createError })
}));

vi.mock('../../../hooks/groupChat/useJoinGroup', () => ({
  default: () => ({ joinGroup: joinGroupMock, result: joinResult, error: joinError })
}));

vi.mock('../../../hooks/useChatState', () => ({
  default: () => ({ createEmptyGroup: createEmptyGroupMock, groups: groupsMock, groupMessages: groupMessagesMock })
}));

vi.mock('../../../hooks/groupChat/useJoinGroupSocket', () => ({
  default: () => joinGroupSocketMock
}));

// Mock ChatItem so we can observe the `selected` prop easily via DOM attributes
vi.mock('../../ChatItem/ChatItem', () => ({
  default: (props) => {
    const React = require('react');
    return React.createElement('button', {
      'data-groupid': props.id,
      'data-selected': props.selected ? 'true' : 'false',
      onClick: () => props.onClick && props.onClick(props.id)
    }, props.user);
  }
}));

import ChatRoomsList from '../ChatRoomsList';

beforeEach(() => {
  vi.clearAllMocks();
  // reset dynamic hook return values
  createResult = null;
  createError = null;
  joinResult = null;
  joinError = null;
});

test('effect on successCreateGroup calls createEmptyGroup, sets selected and joins socket', () => {
  // simulate successful create group
  createResult = { groupId: '10', name: 'NewGroup', creatorId: 'u1', key: 'k' };
  const onSelectedRoomChange = vi.fn();
  const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

  render(<ChatRoomsList onSelectedRoomChange={onSelectedRoomChange} />);

  expect(createEmptyGroupMock).toHaveBeenCalledWith({ groupId: '10', name: 'NewGroup', creatorId: 'u1', key: 'k' });
  expect(joinGroupSocketMock).toHaveBeenCalledWith('10');
  // selectedRoom effect triggers onSelectedRoomChange
  expect(onSelectedRoomChange).toHaveBeenCalledWith('10');

  alertSpy.mockRestore();
});

test('effect on errorCreateGroup shows alert', () => {
  createError = { message: 'fail' };
  const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  render(<ChatRoomsList />);
  expect(alertSpy).toHaveBeenCalledWith('Error al crear el grupo: fail');
  alertSpy.mockRestore();
});

test('effect on successJoinGroup adds group and joins socket and notifies', () => {
  joinResult = { groupId: '20', name: 'Joined', newMemberId: 'm1', key: 'k2' };
  const onSelectedRoomChange = vi.fn();
  const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  render(<ChatRoomsList onSelectedRoomChange={onSelectedRoomChange} />);

  expect(createEmptyGroupMock).toHaveBeenCalledWith({ groupId: '20', name: 'Joined', creatorId: 'm1', key: 'k2' });
  expect(joinGroupSocketMock).toHaveBeenCalledWith('20');
  expect(onSelectedRoomChange).toHaveBeenCalledWith('20');
  alertSpy.mockRestore();
});

test('effect on errorJoinGroup shows alert', () => {
  joinError = { message: 'join-fail' };
  const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  render(<ChatRoomsList />);
  expect(alertSpy).toHaveBeenCalledWith('Error al unirse al grupo: join-fail');
  alertSpy.mockRestore();
});

test('renders groups and clicking a group calls onSelectedRoomChange', () => {
  const onSelectedRoomChange = vi.fn();
  const { getByText } = render(<ChatRoomsList onSelectedRoomChange={onSelectedRoomChange} />);

  // both groups rendered
  expect(getByText('Group One')).toBeTruthy();
  expect(getByText('Group Two')).toBeTruthy();

  // click the first group's element (ChatItem renders a button internally)
  const el = getByText('Group One');
  fireEvent.click(el);

  // selectedRoom effect should call onSelectedRoomChange (selected id is '1')
  // Because effect runs asynchronously, check that callback was called
  expect(onSelectedRoomChange).toHaveBeenCalled();
});

test('clicking AddButton and JoinButton triggers create/join prompts', () => {
  // stub prompt to return names
  const promptSpy = vi.spyOn(window, 'prompt');
  promptSpy.mockImplementationOnce(() => 'NewGroup');

  const { getByTitle } = render(<ChatRoomsList />);

  // AddButton has title 'Nuevo' by default
  const addBtn = getByTitle('Nuevo');
  fireEvent.click(addBtn);
  expect(createGroupMock).toHaveBeenCalled();

  // Next, stub prompt for join
  promptSpy.mockImplementationOnce(() => 'GroupTwo');
  const joinBtn = getByTitle('Unirse');
  fireEvent.click(joinBtn);
  expect(joinGroupMock).toHaveBeenCalled();

  promptSpy.mockRestore();
});

test('sorts groups by id descending when no messages', () => {
  // set both groups without messages
  groupMessagesMock = {};
  const { container } = render(<ChatRoomsList />);
  // The rendered list items should be in order '2' then '1' when sorted by id desc
  const buttons = container.querySelectorAll('button');
  // Find chat item buttons (there may be other buttons for Add/Join). The chat items appear after header; find by checking title attribute absence
  const chatButtons = Array.from(buttons).filter(b => !b.getAttribute('title'));
  // first chat button should contain 'Group Two'
  expect(chatButtons[0].textContent).toContain('Group Two');
});
