// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/// <reference types="@polkadot/dev-test/globals" />

import '@polkadot/extension-mocks/chrome';

import type { ReactWrapper } from 'enzyme';
import type { KeyringPair$Json } from '@polkadot/keyring/types';

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import enzyme from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Route } from 'react-router';

import { Button } from '../components/index.js';
import * as messaging from '../messaging.js';
import { flushAllPromises } from '../testHelpers.js';
import Export from './Export.js';

const { configure, mount } = enzyme;

// // NOTE Required for spyOn when using @swc/jest
// // https://github.com/swc-project/swc/issues/3843
// jest.mock('../messaging', (): Record<string, unknown> => ({
//   __esModule: true,
//   ...jest.requireActual('../messaging')
// }));

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
configure({ adapter: new Adapter() });

describe('Export component', () => {
  let wrapper: ReactWrapper;
  const VALID_ADDRESS = 'HjoBp62cvsWDA3vtNMWxz6c9q13ReEHi9UGHK7JbZweH5g5';

  const enterPassword = (password = 'any password'): void => {
    wrapper.find('[data-export-password] input').simulate('change', { target: { value: password } });
  };

  beforeEach(() => {
    jest.spyOn(messaging, 'exportAccount').mockImplementation(() => Promise.resolve({ exportedJson: { meta: { name: 'account_name' } } as unknown as KeyringPair$Json }));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    wrapper = mount(
      <MemoryRouter initialEntries={ [`/account/export/${VALID_ADDRESS}`] }>
        <Route path='/account/export/:address'><Export /></Route>
      </MemoryRouter>
    );
  });

  it('creates export message on button press', async () => {
    enterPassword('passw0rd');
    wrapper.find('[data-export-button] button').simulate('click');
    await act(flushAllPromises);

    expect(messaging.exportAccount).toHaveBeenCalledWith(VALID_ADDRESS, 'passw0rd');
  });

  it('button is disabled before any password is typed', () => {
    expect(wrapper.find(Button).prop('isDisabled')).toBe(true);
  });

  it('shows an error if the password is wrong', async () => {
    // silencing the following expected console.error
    console.error = jest.fn();
    // eslint-disable-next-line @typescript-eslint/require-await
    jest.spyOn(messaging, 'exportAccount').mockImplementation(async () => {
      throw new Error('Unable to decode using the supplied passphrase');
    });
    enterPassword();
    wrapper.find('[data-export-button] button').simulate('click');
    await act(flushAllPromises);
    wrapper.update();

    // the first message is "You are exporting your account. Keep it safe and don't share it with anyone."
    expect(wrapper.find('.warning-message').at(1).text()).toBe('Unable to decode using the supplied passphrase');
    expect(wrapper.find(Button).prop('isDisabled')).toBe(true);
    expect(wrapper.find('InputWithLabel').first().prop('isError')).toBe(true);
  });

  it('shows no error when typing again after a wrong password', async () => {
    // silencing the following expected console.error
    console.error = jest.fn();
    // eslint-disable-next-line @typescript-eslint/require-await
    jest.spyOn(messaging, 'exportAccount').mockImplementation(async () => {
      throw new Error('Unable to decode using the supplied passphrase');
    });
    enterPassword();
    wrapper.find('[data-export-button] button').simulate('click');
    await act(flushAllPromises);
    wrapper.update();
    enterPassword();

    // the first message is "You are exporting your account. Keep it safe and don't share it with anyone."
    expect(wrapper.find('.warning-message')).toHaveLength(1);
    expect(wrapper.find(Button).prop('isDisabled')).toBe(false);
    expect(wrapper.find('InputWithLabel').first().prop('isError')).toBe(false);
  });

  it('button is enabled after password is typed', async () => {
    enterPassword();
    await act(flushAllPromises);

    expect(wrapper.find(Button).prop('isDisabled')).toBe(false);
  });
});
