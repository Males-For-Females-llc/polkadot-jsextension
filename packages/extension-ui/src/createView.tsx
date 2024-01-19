// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './i18n/i18n.js';

import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import { View } from './components/index.js';

export default function createView (Entry: React.ComponentType, rootId = 'root'): void {
  const rootElement = document.getElementById(rootId);

  if (!rootElement) {
    throw new Error(`Unable to find element with id '${rootId}'`);
  }

  createRoot(rootElement).render(
    <Suspense fallback='...'>
      <View>
        <HashRouter>
          <Entry />
        </HashRouter>
      </View>
    </Suspense>
  );
}
