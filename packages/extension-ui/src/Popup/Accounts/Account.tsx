// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { HexString } from '@polkadot/util/types';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { canDerive } from '@polkadot/extension-base/utils';

import { AccountContext, Address, Checkbox, Dropdown, Link, MenuDivider } from '../../components/index.js';
import { useGenesisHashOptions, useTranslation } from '../../hooks/index.js';
import { editAccount, tieAccount } from '../../messaging.js';
import { Name } from '../../partials/index.js';
import { styled } from '../../styled.js';

interface Props extends AccountJson {
  className?: string;
  parentName?: string;
  showVisibilityAction?: boolean;
  withCheckbox?: boolean;
  withMenu?: boolean
}

interface EditState {
  isEditing: boolean;
  toggleActions: number;
}

function Account ({ address, className, genesisHash, isExternal, isHardware, isHidden, name, parentName, showVisibilityAction, suri, type, withCheckbox = false, withMenu = true }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [{ isEditing, toggleActions }, setEditing] = useState<EditState>({ isEditing: false, toggleActions: 0 });
  const [editedName, setName] = useState<string | undefined | null>(name);
  const [checked, setChecked] = useState(false);
  const genesisOptions = useGenesisHashOptions();
  const { selectedAccounts = [], setSelectedAccounts } = useContext(AccountContext);
  const isSelected = useMemo(() => selectedAccounts?.includes(address) || false, [address, selectedAccounts]);

  useEffect(() => {
    setChecked(isSelected);
  }, [isSelected]);

  const _onCheckboxChange = useCallback(() => {
    const newList = selectedAccounts?.includes(address)
      ? selectedAccounts.filter((account) => account !== address)
      : [...selectedAccounts, address];

    setSelectedAccounts && setSelectedAccounts(newList);
  }, [address, selectedAccounts, setSelectedAccounts]);

  const _onChangeGenesis = useCallback(
    (genesisHash?: HexString | null): void => {
      tieAccount(address, genesisHash ?? null)
        .catch(console.error);
    },
    [address]
  );

  const _toggleEdit = useCallback(
    (): void => setEditing(({ toggleActions }) => ({ isEditing: !isEditing, toggleActions: ++toggleActions })),
    [isEditing]
  );

  const _saveChanges = useCallback(
    (): void => {
      editedName &&
        editAccount(address, editedName)
          .catch(console.error);

      _toggleEdit();
    },
    [editedName, address, _toggleEdit]
  );

  const _actions = useMemo(() => (
    <>
      <Link
        className='menuItem'
        onClick={_toggleEdit}
      >
        {t('Rename')}
      </Link>
      {!isExternal && canDerive(type) && (
        <Link
          className='menuItem'
          to={`/account/derive/${address}/locked`}
        >
          {t('Derive New Account')}
        </Link>
      )}
      <MenuDivider />
      {!isExternal && (
        <Link
          className='menuItem'
          isDanger
          to={`/account/export/${address}`}
        >
          {t('Export Account')}
        </Link>
      )}
      <Link
        className='menuItem'
        isDanger
        to={`/account/forget/${address}`}
      >
        {t('Forget Account')}
      </Link>
      {!isHardware && (
        <>
          <MenuDivider />
          <div className='menuItem'>
            <Dropdown
              className='genesisSelection'
              label=''
              onChange={_onChangeGenesis}
              options={genesisOptions}
              value={genesisHash || ''}
            />
          </div>
        </>
      )}
    </>
  ), [_onChangeGenesis, _toggleEdit, address, genesisHash, genesisOptions, isExternal, isHardware, t, type]);

  return (
    <div className={className}>
      {withCheckbox && (
        <Checkbox
          checked={checked}
          className='accountTree-checkbox'
          label=''
          onChange={_onCheckboxChange}
        />
      )}
      <Address
        actions={withMenu ? _actions : null}
        address={address}
        className='address'
        genesisHash={genesisHash}
        isExternal={isExternal}
        isHidden={isHidden}
        name={editedName}
        parentName={parentName}
        showVisibilityAction={showVisibilityAction}
        suri={suri}
        toggleActions={toggleActions}
      >
        {isEditing && (
          <Name
            address={address}
            className={`editName ${parentName ? 'withParent' : ''}`}
            isFocused
            label={' '}
            onBlur={_saveChanges}
            onChange={setName}
          />
        )}
      </Address>
    </div>
  );
}

export default styled(Account)<Props>`
  .address {
    margin-bottom: 8px;
  }

  .editName {
    position: absolute;
    flex: 1;
    left: 70px;
    top: 10px;
    width: 350px;

    .danger {
      background-color: var(--bodyColor);
      margin-top: -13px;
      width: 330px;
    }

    input {
      height : 30px;
      width: 350px;
    }

    &.withParent {
      top: 16px
    }
  }

  .menuItem {
    border-radius: 8px;
    display: block;
    font-size: 15px;
    line-height: 20px;
    margin: 0;
    min-width: 13rem;
    padding: 4px 16px;

    .genesisSelection {
      margin: 0;
    }
  }
`;
