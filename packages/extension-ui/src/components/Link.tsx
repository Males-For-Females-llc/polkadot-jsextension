// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { styled } from '../styled.js';

interface Props {
  children?: React.ReactNode;
  className?: string;
  isDanger?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  title?: string;
  to?: string;
}

function Link ({ children, className = '', isDisabled, onClick, title, to }: Props): React.ReactElement<Props> {
  if (isDisabled) {
    return (
      <div
        className={`${className} isDisabled`}
        title={title}
      >
        {children}
      </div>
    );
  }

  return to
    ? (
      <RouterLink
        className={className}
        onClick={onClick}
        title={title}
        to={to}
      >
        {children}
      </RouterLink>
    )
    : (
      <a
        className={className}
        href='#'
        onClick={onClick}
        title={title}
      >
        {children}
      </a>
    );
}

export default styled(Link)<Props>(({ isDanger }) => `
  align-items: center;
  color: var(${isDanger ? '--textColorDanger' : '--textColor'});
  display: flex;
  opacity: 0.85;
  text-decoration: none;
  vertical-align: middle;

  &:hover {
    color: var(${isDanger ? '--textColorDanger' : '--textColor'});
    opacity: 1.0;
  }

  &:visited {
    color: var(${isDanger ? '--textColorDanger' : '--textColor'});
  }

  &.isDisabled {
    opacity: 0.4;
  }
`);
