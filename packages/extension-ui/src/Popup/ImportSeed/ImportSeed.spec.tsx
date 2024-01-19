// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/// <reference types="@polkadot/dev-test/globals" />

import '@polkadot/extension-mocks/chrome';

import type { ReactWrapper } from 'enzyme';

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import enzyme from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router';

import { ActionContext, Button, Warning } from '../../components/index.js';
import * as messaging from '../../messaging.js';
import { flushAllPromises } from '../../testHelpers.js';
import ImportSeed from './index.js';

const { configure, mount } = enzyme;

const account = {
  derivation: '/1',
  expectedAddress: '5GNg7RWeAAJuya4wTxb8aZf19bCWJroKuJNrhk4N3iYHNqTm',
  expectedAddressWithDerivation: '5DV3x9zgaXREUMTX7GgkP3ETeW4DQAznWTxg4kx2WivGuQLQ',
  name: 'My Polkadot Account',
  password: 'somePassword',
  seed: 'upgrade multiply predict hip multiply march leg devote social outer oppose debris'
};

// // NOTE Required for spyOn when using @swc/jest
// // https://github.com/swc-project/swc/issues/3843
// jest.mock('../../messaging', (): Record<string, unknown> => ({
//   __esModule: true,
//   ...jest.requireActual('../../messaging')
// }));

// For this file, there are a lot of them
/* eslint-disable @typescript-eslint/no-unsafe-argument */

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
configure({ adapter: new Adapter() });

jest.spyOn(messaging, 'getAllMetadata').mockImplementation(() => Promise.resolve([]));

const typeSeed = async (wrapper: ReactWrapper, value: string) => {
  wrapper.find('textarea').first().simulate('change', { target: { value } });
  await act(flushAllPromises);
  wrapper.update();
};

const typeDerivationPath = async (wrapper: ReactWrapper, value: string) => {
  wrapper.find('input').first().simulate('change', { target: { value } });
  await act(flushAllPromises);
  wrapper.update();
};

// FIXME hanging
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('ImportSeed', () => {
  let wrapper: ReactWrapper;
  const onActionStub = jest.fn();

  const type = async (input: ReactWrapper, value: string): Promise<void> => {
    input.simulate('change', { target: { value } });
    await act(flushAllPromises);
    wrapper.update();
  };

  const enterName = (name: string): Promise<void> => type(wrapper.find('input').first(), name);
  const password = (password: string) => (): Promise<void> => type(wrapper.find('input[type="password"]').first(), password);
  const repeat = (password: string) => (): Promise<void> => type(wrapper.find('input[type="password"]').last(), password);

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    wrapper = mount(
      <ActionContext.Provider value={onActionStub}>
        <MemoryRouter>
          <ImportSeed />
        </MemoryRouter>
      </ActionContext.Provider>
    );

    await act(flushAllPromises);
    wrapper.update();
  });

  describe('Step 1', () => {
    it('first shows no error, no account, and next step button is disabled', () => {
      expect(wrapper.find('Name span').text()).toEqual('<unknown>');
      expect(wrapper.find('[data-field="address"]').text()).toEqual('<unknown>');
      expect(wrapper.find('.derivationPath').exists()).toBe(false);
      expect(wrapper.find(Warning).exists()).toBe(false);
      expect(wrapper.find(Button).prop('isDisabled')).toBe(true);
    });

    it('shows the expected account when correct seed is typed and next step button is enabled', async () => {
      jest.spyOn(messaging, 'validateSeed').mockImplementation(() => Promise.resolve({ address: account.expectedAddress, suri: account.seed }));
      await typeSeed(wrapper, account.seed);

      expect(wrapper.find(Warning).exists()).toBe(false);
      expect(wrapper.find(Button).prop('isDisabled')).toBe(false);
      expect(wrapper.find('Name span').text()).toEqual('<unknown>');
      expect(wrapper.find('[data-field="address"]').text()).toEqual(account.expectedAddress);
    });

    it('shows an error when incorrect seed is typed and next step button is enabled', async () => {
      // silencing the following expected console.error
      console.error = jest.fn();
      // eslint-disable-next-line @typescript-eslint/require-await
      jest.spyOn(messaging, 'validateSeed').mockImplementation(async () => {
        throw new Error('Some test error message');
      });
      await typeSeed(wrapper, 'this is an invalid mnemonic seed');

      expect(wrapper.find(Warning).find('.warning-message').text()).toEqual('Invalid mnemonic seed');
      expect(wrapper.find(Button).prop('isDisabled')).toBe(true);
      expect(wrapper.find('Name span').text()).toEqual('<unknown>');
      expect(wrapper.find('[data-field="address"]').text()).toEqual('<unknown>');
    });

    it('shows an error when the seed is removed', async () => {
      await typeSeed(wrapper, 'asdf');
      await typeSeed(wrapper, '');

      expect(wrapper.find(Warning).find('.warning-message').text()).toEqual('Mnemonic needs to contain 12, 15, 18, 21, 24 words');
      expect(wrapper.find(Button).prop('isDisabled')).toBe(true);
    });

    it('shows the expected account with derivation when correct seed is typed and next step button is enabled', async () => {
      const suri = `${account.seed}${account.derivation}`;
      const validateCall = jest.spyOn(messaging, 'validateSeed').mockImplementation(() => Promise.resolve({ address: account.expectedAddressWithDerivation, suri }));

      await typeSeed(wrapper, account.seed);
      wrapper.find('.advancedToggle').simulate('click');
      await typeDerivationPath(wrapper, account.derivation);

      expect(validateCall).toHaveBeenLastCalledWith(suri);
      expect(wrapper.find(Warning).exists()).toBe(false);
      expect(wrapper.find(Button).prop('isDisabled')).toBe(false);
      expect(wrapper.find('Name span').text()).toEqual('<unknown>');
      expect(wrapper.find('[data-field="address"]').text()).toEqual(account.expectedAddressWithDerivation);
    });

    it('shows an error when derivation path is incorrect and next step button is disabled', async () => {
      const wrongPath = 'wrong';
      const suri = `${account.seed}${wrongPath}`;

      // eslint-disable-next-line @typescript-eslint/require-await
      const validateCall = jest.spyOn(messaging, 'validateSeed').mockImplementation(async () => {
        throw new Error('Some test error message');
      });

      await typeSeed(wrapper, account.seed);
      wrapper.find('.advancedToggle').simulate('click');
      await typeDerivationPath(wrapper, wrongPath);

      expect(validateCall).toHaveBeenLastCalledWith(suri);
      expect(wrapper.find(Warning).find('.warning-message').text()).toEqual('Invalid mnemonic seed or derivation path');
      expect(wrapper.find(Button).prop('isDisabled')).toBe(true);
      expect(wrapper.find('Name span').text()).toEqual('<unknown>');
      expect(wrapper.find('[data-field="address"]').text()).toEqual('<unknown>');
    });

    it('moves to the second step', async () => {
      jest.spyOn(messaging, 'validateSeed').mockImplementation(() => Promise.resolve({ address: account.expectedAddress, suri: account.seed }));
      await typeSeed(wrapper, account.seed);
      wrapper.find(Button).simulate('click');
      await act(flushAllPromises);
      wrapper.update();

      expect(wrapper.find(Button)).toHaveLength(2);
      expect(wrapper.find('Name span').text()).toEqual('<unknown>');
      expect(wrapper.find('[data-field="address"]').text()).toEqual(account.expectedAddress);
    });

    describe('Phase 2', () => {
      const suri = `${account.seed}${account.derivation}`;

      beforeEach(async () => {
        jest.spyOn(messaging, 'createAccountSuri').mockImplementation(() => Promise.resolve(true));
        jest.spyOn(messaging, 'validateSeed').mockImplementation(() => Promise.resolve({ address: account.expectedAddressWithDerivation, suri }));

        await typeSeed(wrapper, account.seed);
        wrapper.find('.advancedToggle').simulate('click');
        await typeDerivationPath(wrapper, account.derivation);
        wrapper.find(Button).simulate('click');

        await act(flushAllPromises);
        wrapper.update();
      });

      it('saves account with provided name and password', async () => {
        await enterName(account.name).then(password(account.password)).then(repeat(account.password));
        wrapper.find('[data-button-action="add new root"] button').simulate('click');
        await act(flushAllPromises);
        wrapper.update();

        expect(messaging.createAccountSuri).toHaveBeenCalledWith(account.name, account.password, suri, undefined, '');
        expect(onActionStub).toHaveBeenCalledWith('/');
      });
    });
  });
});
