// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types.js';
import type { AvailableThemes } from './index.js';

import React, { useCallback, useState } from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

// FIXME We should not import from index when this one is imported there as well
import { chooseTheme, Main, themes, ThemeSwitchContext } from './index.js';

interface Props {
  children: React.ReactNode;
  className?: string;
}

function View ({ children, className }: Props): React.ReactElement<Props> {
  const [theme, setTheme] = useState(chooseTheme());

  const switchTheme = useCallback(
    (theme: AvailableThemes): void => {
      localStorage.setItem('theme', theme);
      setTheme(theme);
    },
    []
  );

  const _theme = themes[theme];

  return (
    <ThemeSwitchContext.Provider value={switchTheme}>
      <ThemeProvider theme={_theme}>
        <BodyTheme theme={_theme} />
        <Main className={className}>
          {children}
        </Main>
      </ThemeProvider>
    </ThemeSwitchContext.Provider>
  );
}

const BodyTheme = createGlobalStyle<ThemeProps>`
  body {
    background-color: ${({ theme }: ThemeProps): string => theme.bodyColor};
  }

  html {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export default View;
