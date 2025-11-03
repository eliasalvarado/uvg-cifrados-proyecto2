import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mocks for hooks
vi.mock('../../../hooks/useToken', () => ({ __esModule: true, default: vi.fn() }));
vi.mock('../../../hooks/useFetch', () => ({ __esModule: true, default: vi.fn() }));
vi.mock('../../../hooks/useSocket', () => ({ __esModule: true, default: vi.fn() }));

// Mock ephimeralCrypto
vi.mock('../../../helpers/cypher/ephimeralCrypto', () => ({
  __esModule: true,
  encryptMessage: (m) => `enc(${m})`,
  decryptMessage: (em) => `dec(${em})`,
}));

import useToken from '../../../hooks/useToken';
import useFetch from '../../../hooks/useFetch';
import useSocket from '../../../hooks/useSocket';
import EphemeralMessages from '../EphemeralMessages';

describe('EphemeralMessages', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders header and when no key, sending shows log about missing key', () => {
    // token null
    useToken.mockImplementation(() => null);
    const callFetch = vi.fn();
    useFetch.mockImplementation(() => ({ callFetch, result: null, reset: vi.fn() }));
    useSocket.mockImplementation(() => null);

    render(<EphemeralMessages />);

    expect(screen.getByText('Mensajes efímeros')).toBeInTheDocument();

    // Type a message in the input and click Enviar
    const input = screen.getByLabelText('Mensaje efímero');
    fireEvent.change(input, { target: { value: 'hello' } });
    const sendBtn = screen.getByText('Enviar');
    fireEvent.click(sendBtn);

    // Should log that key is missing
    expect(screen.getByText(/No se puede enviar el mensaje/)).toBeInTheDocument();
  });

  it('handles key-generated and receive-ephemeral-message when key present', async () => {
    useToken.mockImplementation(() => 'tok');
    const callFetch = vi.fn();
    useFetch.mockImplementation(() => ({ callFetch, result: null, reset: vi.fn() }));

    // Implement a simple socket mock that captures handlers
    const handlers = {};
    const socket = {
      on: (ev, cb) => { handlers[ev] = cb; },
      off: () => {},
      emit: vi.fn(),
    };
    useSocket.mockImplementation(() => socket);

    render(<EphemeralMessages />);

    // Simulate key-generated event and wait for state/effect updates
    act(() => {
      handlers['key-generated']({ keyGenerated: ['a','b','c'] });
    });

    // Now key is shown (wait for async state updates)
    await screen.findByText(/Llave establecida - abc/);
    await screen.findByText(/Clave generada: abc/);

    // Simulate receive-ephemeral-message (encrypted) with key present
    act(() => {
      handlers['receive-ephemeral-message']({ sender: 'Bob', encryptedMessage: 'enc(msg)' });
    });

    // After decrypt, message should appear (decryptMessage mocked to wrap with dec())
    await screen.findByText(/Bob/);
    await screen.findByText(/dec\(enc\(msg\)\)/);
  });

  it('startKeyExchange shows missing receiver log when no receiver provided', async () => {
    useToken.mockImplementation(() => 'tok');
    useFetch.mockImplementation(() => ({ callFetch: vi.fn(), result: null, reset: vi.fn() }));

    const handlers = {};
    const socket = {
      on: (ev, cb) => { handlers[ev] = cb; },
      off: () => {},
      emit: vi.fn(),
    };
    useSocket.mockImplementation(() => socket);

    render(<EphemeralMessages />);

    // Click start without entering receiver
    const startBtn = screen.getByText('Iniciar intercambio de claves');
    fireEvent.click(startBtn);

    // Should log missing receiver message
    await screen.findByText(/Por favor, ingresa el nombre del destinatario./);
  });

  it('startKeyExchange emits start-key-exchange when receiver provided', async () => {
    useToken.mockImplementation(() => 'tok');
    useFetch.mockImplementation(() => ({ callFetch: vi.fn(), result: null, reset: vi.fn() }));

    const handlers = {};
    const socket = {
      on: (ev, cb) => { handlers[ev] = cb; },
      off: () => {},
      emit: vi.fn(),
    };
    useSocket.mockImplementation(() => socket);

    render(<EphemeralMessages />);

    const input = screen.getByPlaceholderText('Usuario con quien establecer clave');
    fireEvent.change(input, { target: { value: 'receiver1' } });

    const startBtn = screen.getByText('Iniciar intercambio de claves');
    fireEvent.click(startBtn);

    expect(socket.emit).toHaveBeenCalledWith('start-key-exchange', { receiverId: 'receiver1' });
  });

  it('receive-photons emits measure-photons and send-bases-receiver emits compare-bases', async () => {
    useToken.mockImplementation(() => 'tok');
    useFetch.mockImplementation(() => ({ callFetch: vi.fn(), result: null, reset: vi.fn() }));

    const handlers = {};
    const socket = {
      on: (ev, cb) => { handlers[ev] = cb; },
      off: () => {},
      emit: vi.fn(),
    };
    useSocket.mockImplementation(() => socket);

    render(<EphemeralMessages />);

    // Simulate receive-photons: should set receiver and emit measure-photons
    act(() => {
      handlers['receive-photons']({ senderId: 'bob-id', length: 3 });
    });

    // wait for the measure-photons emission
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('measure-photons', expect.objectContaining({ senderId: 'bob-id', receiverBases: expect.any(Array) }));
    });

    // Simulate send-bases-receiver (after effect re-registered with updated receiver)
    act(() => {
      handlers['send-bases-receiver']({ receiverBases: ['↕','↗','↕'] });
    });

    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('compare-bases', { receiverBases: ['↕','↗','↕'], receiverId: 'bob-id' });
    });
  });

  it('key-exchange-error logs error message', async () => {
    useToken.mockImplementation(() => 'tok');
    useFetch.mockImplementation(() => ({ callFetch: vi.fn(), result: null, reset: vi.fn() }));

    const handlers = {};
    const socket = {
      on: (ev, cb) => { handlers[ev] = cb; },
      off: () => {},
      emit: vi.fn(),
    };
    useSocket.mockImplementation(() => socket);

    render(<EphemeralMessages />);

    act(() => {
      handlers['key-exchange-error']({ message: 'algo falló' });
    });
    await screen.findByText(/Error en el intercambio de claves: algo falló/);
  });
});
