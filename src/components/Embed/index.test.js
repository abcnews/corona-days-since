import React from 'react';
import renderer from 'react-test-renderer';

import Embed from '.';

describe('Embed', () => {
  test('It renders', () => {
    const component = renderer.create(<Embed />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
