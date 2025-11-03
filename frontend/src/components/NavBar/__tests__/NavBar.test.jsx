import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';

import NavBar from '../NavBar';
import SessionContext from '../../../context/SessionContext';

// Mock useNavigate from react-router-dom
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

describe('NavBar', () => {
  it('renders options and calls callbacks; logout clears storage and navigates', () => {
    const onChat = vi.fn();
    const onGroup = vi.fn();
    const onContacts = vi.fn();
    const onProfile = vi.fn();
    const onEph = vi.fn();
    const onBlock = vi.fn();

    const clearToken = vi.fn();

    // set some localStorage items to be removed by logout
    localStorage.setItem('token', 't');
    localStorage.setItem('privateKeyRSA', 'pk');

    render(
      <MemoryRouter>
        <SessionContext.Provider value={{ clearToken }}>
          <NavBar
            onChatOptionClick={onChat}
            onGroupChatOptionClick={onGroup}
            onContactsOptionClick={onContacts}
            onProfileOptionClick={onProfile}
            onEphemeralMessagesOptionClick={onEph}
            onBlockChainOptionClick={onBlock}
          />
        </SessionContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Chats activos'));
    expect(onChat).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Grupos'));
    expect(onGroup).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Contactos'));
    expect(onContacts).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Perfil'));
    expect(onProfile).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Mensajes efímeros'));
    expect(onEph).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Blockchain'));
    expect(onBlock).toHaveBeenCalled();

    // logout
    fireEvent.click(screen.getByText('Salir'));
    expect(clearToken).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });
});
