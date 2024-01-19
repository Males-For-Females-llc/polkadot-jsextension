// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types.js';

import React from 'react';

import { styled } from '../styled.js';

interface Props extends ThemeProps {
  className?: string;
  children: React.ReactNode;
}

const List = ({ children, className }: Props) => (
  <ul className={className}>
    {children}
  </ul>
);

export default styled(List)(({ theme }: ThemeProps) => `
  list-style: none;
  padding-inline-start: 10px;
  padding-inline-end: 10px;
  text-indent: -22px;
  margin-left: 21px;

  li {
    margin-bottom: 8px;
  }

  li::before {
    content: '\\2022';
    color: ${theme.primaryColor};
    font-size: 30px;
    font-weight: bold;
    margin-right: 10px;
    vertical-align: -20%;
  }
`);
