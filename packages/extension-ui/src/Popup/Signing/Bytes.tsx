// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';

import { isAscii, u8aToString, u8aUnwrapBytes } from '@polkadot/util';

import { useTranslation } from '../../hooks/index.js';
import { styled } from '../../styled.js';

interface Props {
  className?: string;
  bytes: string;
  url: string;
}

function Bytes ({ bytes, className, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const text = useMemo(
    () => isAscii(bytes)
      ? u8aToString(u8aUnwrapBytes(bytes))
      : bytes,
    [bytes]
  );

  return (
    <table className={className}>
      <tbody>
        <tr>
          <td className='label'>{t('from')}</td>
          <td className='data'>{url}</td>
        </tr>
        <tr>
          <td className='label'>{t('bytes')}</td>
          <td className='data pre'><div>{text}</div></td>
        </tr>
      </tbody>
    </table>
  );
}

export default styled(Bytes)<Props>`
  border: 0;
  display: block;
  font-size: 0.75rem;
  margin-top: 0.75rem;

  td.data {
    max-width: 0;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    vertical-align: middle;
    width: 100%;
    padding: 0.15rem;

    &.pre {
      padding: 0px;

      div {
        padding: 0.15rem;
        font-family: inherit;
        font-size: 0.75rem;
        margin: 0;
        white-space: pre;
        overflow: auto;
        max-height: calc(100vh - 480px);
        min-height: var(--boxLineHeight);
        border: 1px solid var(--boxBorderColor);
        background: var(--boxBackground);
        line-height: var(--boxLineHeight);
      }
    }
  }

  td.label {
    opacity: 0.5;
    padding: 0 0.5rem;
    text-align: right;
    vertical-align: middle;
    white-space: nowrap;
  }
`;
