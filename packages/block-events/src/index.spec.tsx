import React from 'react';

import { render } from '@testing-library/react';

import { Events } from '.';

describe('block-html', () => {
  it('renders with default values', () => {
    expect(render(<Events />).asFragment()).toMatchSnapshot();
  });
});
