import React from 'react';

import { render } from '@testing-library/react';

import { Templates } from '.';

describe('block-html', () => {
  it('renders with default values', () => {
    expect(render(<Templates />).asFragment()).toMatchSnapshot();
  });
});
