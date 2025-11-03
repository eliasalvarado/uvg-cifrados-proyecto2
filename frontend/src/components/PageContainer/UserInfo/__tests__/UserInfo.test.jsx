import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import UserInfo from '../UserInfo';

describe('UserInfo', () => {
  it('renders the name and the user picture', () => {
    render(<UserInfo name="Juan Perez" idUser="u1" hasImage={false} />);
    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    // The real UserPicture component renders an element with the user's name as title
    expect(screen.getByTitle('Juan Perez')).toBeInTheDocument();
  });
});
