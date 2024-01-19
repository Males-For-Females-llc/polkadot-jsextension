// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types.js';

import React from 'react';

import { styled } from '../styled.js';

interface Props extends ThemeProps {
  className?: string;
  children: React.ReactNode;
}

const ButtonArea = function ({ children, className }: Props) {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default styled(ButtonArea)(({ theme }: ThemeProps) => `
  display: flex;
  flex-direction: row;
  background: ${theme.highlightedAreaBackground};
  border-top: 1px solid ${theme.inputBorderColor};
  padding: 12px 24px;
  margin-left: 0;
  margin-right: 0;

  & > button:not(:last-of-type) {
    margin-right: 8px;
  }
`);
