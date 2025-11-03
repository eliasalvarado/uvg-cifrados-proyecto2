import React from 'react';
import { render, screen } from '@testing-library/react';
import Message from '../Message';
import dayjs from 'dayjs';
import { describe, it, expect } from 'vitest';

describe('Message', () => {
  it('renders left message with user and verified true', () => {
    const date = new Date().toString();
    render(<Message left={true} user="Alice" message="hola" date={date} verified={true} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('hola')).toBeInTheDocument();

    const expectedTime = dayjs(date).format('HH:mm');
    expect(screen.getByText(expectedTime)).toBeInTheDocument();

    // Verified true should show a green checkmark character
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('renders right message with viewed icon when showViewed and viewed true', () => {
    const date = new Date().toString();
    const { container } = render(<Message left={false} message="hola2" date={date} viewed={true} showViewed={true} />);

    expect(screen.getByText('hola2')).toBeInTheDocument();
    const expectedTime = dayjs(date).format('HH:mm');
    expect(screen.getByText(expectedTime)).toBeInTheDocument();

    // When right and showViewed true, the CheckIcon (svg) should be rendered
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders right message with viewed icon when showViewed and viewed true and showTriangle', () => {
    const date = new Date().toString();
    const { container } = render(<Message left={false} message="hola2" date={date} viewed={true} showViewed={true} showTriangle={true} />);

    expect(screen.getByText('hola2')).toBeInTheDocument();
    const expectedTime = dayjs(date).format('HH:mm');
    expect(screen.getByText(expectedTime)).toBeInTheDocument();

    // When right and showViewed true, the CheckIcon (svg) should be rendered
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders right message with viewed icon when showViewed and viewed true and showTriangle and not left and showView and not viewed', () => {
    const date = new Date().toString();
    const { container } = render(<Message left={false} message="hola2" date={date} viewed={false} showViewed={true} showTriangle={true} />);

    expect(screen.getByText('hola2')).toBeInTheDocument();
    const expectedTime = dayjs(date).format('HH:mm');
    expect(screen.getByText(expectedTime)).toBeInTheDocument();

    // When right and showViewed true, the CheckIcon (svg) should be rendered
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('shows ❌ when verified is false', () => {
    const date = new Date().toString();
    render(<Message left={true} message="m" date={date} verified={false} />);
    expect(screen.getByText('❌')).toBeInTheDocument();
  });
});
