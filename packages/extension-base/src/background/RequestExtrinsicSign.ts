// Copyright 2019-2023 @polkadot/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringPair } from '@polkadot/keyring/types';
import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { RequestSign } from './types.js';

import { TypeRegistry } from '@polkadot/types';

export default class RequestExtrinsicSign implements RequestSign {
  public readonly payload: SignerPayloadJSON;

  constructor (payload: SignerPayloadJSON) {
    this.payload = payload;
  }

  sign (registry: TypeRegistry, pair: KeyringPair): { signature: HexString } {
    return registry
      .createType('ExtrinsicPayload', this.payload, { version: this.payload.version })
      .sign(pair);
  }
}
