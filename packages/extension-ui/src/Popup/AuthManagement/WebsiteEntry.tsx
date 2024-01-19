// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AuthUrlInfo } from '@polkadot/extension-base/background/types';
import type { ThemeProps } from '../../types.js';

import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useTranslation } from '@polkadot/extension-ui/translate';

import RemoveAuth from '../../components/RemoveAuth.js';
import { styled } from '../../styled.js';

interface Props extends ThemeProps {
  className?: string;
  info: AuthUrlInfo;
  removeAuth: (url: string) => void;
  url: string;
}

function WebsiteEntry ({ className = '', info: { authorizedAccounts, isAllowed }, removeAuth, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const _removeAuth = useCallback(
    () => removeAuth(url),
    [removeAuth, url]
  );

  return (
    <div className={className}>
      <RemoveAuth onRemove={_removeAuth} />
      <div className='url'>
        {url}
      </div>
      <Link
        className='connectedAccounts'
        to={`/url/manage/${url}`}
      >{
          authorizedAccounts && authorizedAccounts.length
            ? t<string>('{{total}} accounts', {
              replace: {
                total: authorizedAccounts.length
              }
            })
            : isAllowed
              ? t<string>('all accounts')
              : t<string>('no accounts')
        }</Link>
    </div>
  );
}

export default styled(WebsiteEntry)(({ theme }: Props) => `
  display: flex;
  align-items: center;
  margin-top: .2rem;

  .url{
    flex: 1;
  }

  .connectedAccounts{
    margin-left: .5rem;
    background-color: ${theme.primaryColor};
    color: white;
    cursor: pointer;
    padding: 0 0.5rem;
    border-radius: 4px;
    text-decoration: none;
  }
`);
