// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types.js';

import React, { useContext } from 'react';

import { AuthorizeReqContext } from '../../components/index.js';
import useTranslation from '../../hooks/useTranslation.js';
import { Header } from '../../partials/index.js';
import { styled } from '../../styled.js';
import Request from './Request.js';

interface Props extends ThemeProps {
  className?: string;
}

function Authorize ({ className = '' }: Props): React.ReactElement {
  const { t } = useTranslation();
  const requests = useContext(AuthorizeReqContext);

  return (
    <>
      <div className={`${className} ${requests.length === 1 ? 'lastRequest' : ''}`}>
        <Header
          smallMargin={true}
          text={t<string>('Account connection request')}
        />
        {requests.map(({ id, request, url }, index): React.ReactNode => (
          <Request
            authId={id}
            className='request'
            isFirst={index === 0}
            key={id}
            request={request}
            url={url}
          />
        ))}
      </div>
    </>
  );
}

export default styled(Authorize)`
  overflow-y: auto;

  &.lastRequest {
    overflow: hidden;
  }

  && {
    padding: 0;
  }

  .request {
    padding: 0 24px;
  }
`;
