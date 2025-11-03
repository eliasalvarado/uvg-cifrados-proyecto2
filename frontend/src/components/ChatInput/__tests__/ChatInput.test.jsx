import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatInput from '../ChatInput';
import { vi, describe, it, expect } from 'vitest';

describe('ChatInput', () => {
  it('calls onSend when send button is clicked and clears input', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('Escribe un mensaje');
    const button = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input.value).toBe('hello');

    fireEvent.click(button);
    expect(onSend).toHaveBeenCalledWith('hello');
    // Should clear input after sending
    expect(input.value).toBe('');
  });

  it('sends message on Enter key press', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByPlaceholderText('Escribe un mensaje');

    fireEvent.change(input, { target: { value: 'line' } });
    fireEvent.keyUp(input, { key: 'Enter', code: 'Enter' });

    expect(onSend).toHaveBeenCalledWith('line');
    expect(input.value).toBe('');
  });

  it('calls onFileSend when a file is selected and send clicked, then clears file input', () => {
    const onFileSend = vi.fn();
    render(<ChatInput onFileSend={onFileSend} onSend={vi.fn()} />);

    const fileInput = screen.getByTestId('file-input');
    const button = screen.getByRole('button');

    const testFile = new File(['contents'], 'test.txt', { type: 'text/plain' });
    // simulate selecting a file
    fireEvent.change(fileInput, { target: { files: [testFile] } });

    // click send should call onFileSend and then clear the file input
    fireEvent.click(button);
    expect(onFileSend).toHaveBeenCalledWith(testFile);
    expect(fileInput.value).toBe('');
  });
});
