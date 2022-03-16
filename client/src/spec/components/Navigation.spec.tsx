import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import {
  Button, Badge, Header, Text,
} from '@mantine/core';

import Navigation from '@components/Navigation';
import axiosMock from '../axiosMock';
import { tick } from '../specUtils';

const mockUser = {
  username: 'testuser',
  email: 'test@test.com',
  Results: { wpm: 50, count: 5 },
};

describe(Navigation, () => {
  let wrapper: ShallowWrapper<typeof Navigation, {}, {}>;

  beforeEach(() => {
    localStorage.clear();
    wrapper = shallow(<Navigation />);
  });

  it('renders', () => {
    expect(wrapper.find(Header)).to.have.lengthOf(1);
  });

  describe('when no user is set', () => {
    let signupButton: ShallowWrapper<any, any, any>;
    let loginButton: ShallowWrapper<any, any, any>;

    beforeEach(() => {
      localStorage.removeItem('user');
      wrapper.setProps({});

      signupButton = wrapper.findWhere((node) => node.is(Button) && node.text() === 'Sign Up');
      loginButton = wrapper.findWhere((node) => node.is(Button) && node.text() === 'Login');
    });

    it('displays login/signup buttons', () => {
      expect(loginButton).to.have.lengthOf(1);
      expect(signupButton).to.have.lengthOf(1);
    });
  });

  describe('when user is set', () => {
    let logoutButton: ShallowWrapper;

    beforeEach(async () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      wrapper.setProps({});

      logoutButton = wrapper.findWhere((node) => node.is(Button) && node.text() === 'Logout');
    });

    it('displays user and logout button if authenticated', () => {
      expect(wrapper.findWhere((node) => node.is(Badge) && node.text().includes('WPM'))).to.have.lengthOf(1);
      expect(wrapper.findWhere((node) => node.is(Badge) && node.text().includes('Races'))).to.have.lengthOf(1);
      expect(wrapper.findWhere((node) => node.is(Text) && node.text() === 'testuser')).to.have.lengthOf(1);
      expect(logoutButton).to.have.lengthOf(1);
    });

    it('sends a logout request on button click', async () => {
      axiosMock.get.mockResolvedValue({});

      logoutButton.simulate('click');
      await tick();

      expect(axiosMock.get.mock.calls).to.have.lengthOf(1);
      expect(localStorage.getItem('user')).to.not.exist;
    });
  });
});
