// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ResponseJsonGetAccountInfo } from '@polkadot/extension-base/background/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { KeyringPairs$Json } from '@polkadot/ui-keyring/types';

import React, { useCallback, useContext, useEffect, useState } from 'react';

import { u8aToString } from '@polkadot/util';

import { AccountContext, ActionContext, Address, Button, InputFileWithLabel, InputWithLabel, Warning } from '../components/index.js';
import { useTranslation } from '../hooks/index.js';
import { batchRestore, jsonGetAccountInfo, jsonRestore } from '../messaging.js';
import { Header } from '../partials/index.js';
import { styled } from '../styled.js';
import { DEFAULT_TYPE } from '../util/defaultType.js';
import { isKeyringPairs$Json } from '../util/typeGuards.js';

const acceptedFormats = ['application/json', 'text/plain'].join(', ');

interface Props {
  className?: string;
}

function Upload ({ className }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const [accountsInfo, setAccountsInfo] = useState<ResponseJsonGetAccountInfo[]>([]);
  const [password, setPassword] = useState<string>('');
  const [isFileError, setFileError] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  // don't use the info from the file directly
  // rather use what comes from the background from jsonGetAccountInfo
  const [file, setFile] = useState<KeyringPair$Json | KeyringPairs$Json | undefined>(undefined);

  useEffect((): void => {
    !accounts.length && onAction();
  }, [accounts, onAction]);

  const _onChangePass = useCallback(
    (pass: string): void => {
      setPassword(pass);
      setIsPasswordError(false);
    }, []
  );

  const _onChangeFile = useCallback(
    (file: Uint8Array): void => {
      setAccountsInfo(() => []);

      let json: KeyringPair$Json | KeyringPairs$Json | undefined;

      try {
        json = JSON.parse(u8aToString(file)) as KeyringPair$Json | KeyringPairs$Json;
        setFile(json);
      } catch (e) {
        console.error(e);
        setFileError(true);
      }

      if (json === undefined) {
        return;
      }

      if (isKeyringPairs$Json(json)) {
        setRequirePassword(true);
        json.accounts.forEach((account) => {
          setAccountsInfo((old) => [...old, {
            address: account.address,
            genesisHash: account.meta.genesisHash,
            name: account.meta.name
          } as ResponseJsonGetAccountInfo]);
        });
      } else {
        setRequirePassword(true);
        jsonGetAccountInfo(json)
          .then((accountInfo) => setAccountsInfo((old) => [...old, accountInfo]))
          .catch((e) => {
            setFileError(true);
            console.error(e);
          });
      }
    }, []
  );

  const _onRestore = useCallback(
    (): void => {
      if (!file) {
        return;
      }

      if (requirePassword && !password) {
        return;
      }

      setIsBusy(true);

      (isKeyringPairs$Json(file) ? batchRestore(file, password) : jsonRestore(file, password))
        .then(() => {
          onAction('/');
        })
        .catch((e) => {
          console.error(e);
          setIsBusy(false);
          setIsPasswordError(true);
        });
    },
    [file, onAction, password, requirePassword]
  );

  return (
    <>
      <Header
        showBackArrow
        smallMargin
        text={t('Restore from JSON')}
      />
      <div className={className}>
        {accountsInfo.map(({ address, genesisHash, name, type = DEFAULT_TYPE }, index) => (
          <Address
            address={address}
            genesisHash={genesisHash}
            key={`${index}:${address}`}
            name={name}
            type={type}
          />
        ))}
        <InputFileWithLabel
          accept={acceptedFormats}
          isError={isFileError}
          label={t('backup file')}
          onChange={_onChangeFile}
          withLabel
        />
        {isFileError && (
          <Warning
            isDanger
          >
            {t('Invalid Json file')}
          </Warning>
        )}
        {requirePassword && (
          <div>
            <InputWithLabel
              isError={isPasswordError}
              label={t('Password for this file')}
              onChange={_onChangePass}
              type='password'
            />
            {isPasswordError && (
              <Warning
                isBelowInput
                isDanger
              >
                {t('Unable to decode using the supplied passphrase')}
              </Warning>
            )}
          </div>
        )}
        <Button
          className='restoreButton'
          isBusy={isBusy}
          isDisabled={isFileError || isPasswordError}
          onClick={_onRestore}
        >
          {t('Restore')}
        </Button>
      </div>
    </>
  );
}

export default styled(Upload)<Props>`
  .restoreButton {
    margin-top: 16px;
  }
`;
