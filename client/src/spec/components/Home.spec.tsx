import { expect } from 'chai';
import { shallow } from 'enzyme';
import { Container } from '@mantine/core';

import Home from '@components/Home';

/**
 * Home doesn't have any state or props so testing is trivial
 */
describe(Home, () => {
  it('renders', () => {
    const wrapper = shallow(<Home />);
    expect(wrapper.find(Container)).to.have.lengthOf(1);
  });
});
