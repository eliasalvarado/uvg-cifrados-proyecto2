import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Mock fadeOut so animation calls its callback synchronously
vi.mock('@helpers/animations/fadeOut', () => ({
  __esModule: true,
  default: (el, ms, cb) => cb && cb()
}));

import PopUp from '../PopUp';

describe('PopUp', () => {
  it('calls close and callback when overlay clicked and closeWithBackground true', () => {
    const close = vi.fn();
    const callback = vi.fn();

    render(<PopUp close={close} callback={callback} closeWithBackground={true} closeButton={true}><div>hi</div></PopUp>);

    // overlay has aria-label "Cerrar"
    const overlay = screen.getByLabelText('Cerrar');
    fireEvent.click(overlay);

    expect(close).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });

  it('does not call close when closeWithBackground is false', () => {
    const close = vi.fn();
    render(<PopUp close={close} closeWithBackground={false} closeButton={true}><div>ok</div></PopUp>);

    const overlay = screen.getByLabelText('Cerrar');
    fireEvent.click(overlay);

    expect(close).not.toHaveBeenCalled();
  });

  it('calls close when x button clicked if closeButton true', () => {
    const close = vi.fn();
    render(<PopUp close={close} closeButton={true}><div>ok</div></PopUp>);

    const buttons = screen.getAllByRole('button');
    // second button is the x close when present
    const xButton = buttons[1];
    fireEvent.click(xButton);
    expect(close).toHaveBeenCalled();
  });

  it('calls close when overlay clicked and no callback provided (callback null)', () => {
    const close = vi.fn();
    render(<PopUp close={close} closeWithBackground={true} closeButton={true}><div>hi</div></PopUp>);

    const overlay = screen.getByLabelText('Cerrar');
    fireEvent.click(overlay);

    expect(close).toHaveBeenCalled();
  });

  it('calls close on x button keyUp', () => {
    const close = vi.fn();
    render(<PopUp close={close} closeButton={true}><div>ok</div></PopUp>);

    const buttons = screen.getAllByRole('button');
    const xButton = buttons[1];
    fireEvent.keyUp(xButton);
    expect(close).toHaveBeenCalled();
  });

  it('does not render x button when closeButton is false', () => {
    const close = vi.fn();
    render(<PopUp close={close} closeButton={false}><div>ok</div></PopUp>);

    const buttons = screen.getAllByRole('button');
    // Only the overlay button should exist
    expect(buttons.length).toBe(1);
  });

  it('does not render x button when closeButton', () => {
    const close = vi.fn();
    render(<PopUp close={close} closeButton><div>ok</div></PopUp>);

    const buttons = screen.getAllByRole('button');
    // Only the overlay button should exist
    expect(buttons.length).toBe(2);
  });
});
