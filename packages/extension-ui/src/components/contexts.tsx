// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountsContext, AuthorizeRequest, MetadataRequest, SigningRequest } from '@polkadot/extension-base/background/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';
import type { Theme } from './themes.js';

import React from 'react';

import settings from '@polkadot/ui-settings';

const noop = (): void => undefined;

const AccountContext = React.createContext<AccountsContext>({ accounts: [], hierarchy: [], master: undefined });
const ActionContext = React.createContext<(to?: string) => void>(noop);
const AuthorizeReqContext = React.createContext<AuthorizeRequest[]>([]);
const MediaContext = React.createContext<boolean>(false);
const MetadataReqContext = React.createContext<MetadataRequest[]>([]);
const SettingsContext = React.createContext<SettingsStruct>(settings.get());
const SigningReqContext = React.createContext<SigningRequest[]>([]);
const ThemeSwitchContext = React.createContext<(theme: Theme) => void>(noop);
const ToastContext = React.createContext<({show: (message: string) => void})>({ show: noop });

export { AccountContext, ActionContext, AuthorizeReqContext, MediaContext, MetadataReqContext, SettingsContext, SigningReqContext, ThemeSwitchContext, ToastContext };
