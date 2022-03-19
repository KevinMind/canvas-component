import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react';

import {Button} from './Button';

describe('<Button />', () => {
  it('passes', async () => {
    const spy = jest.fn();
    render(<Button onClick={spy}>Click</Button>);

    expect(screen.getByText('Click')).toBeTruthy();

    fireEvent.click(screen.getByText('Click'))

    expect(spy).toHaveBeenCalled();
  });
});