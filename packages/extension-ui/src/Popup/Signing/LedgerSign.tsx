// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import { faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';

import { Button, Warning } from '../../components/index.js';
import { useLedger, useTranslation } from '../../hooks/index.js';
import { styled } from '../../styled.js';

interface Props {
  accountIndex?: number;
  addressOffset?: number;
  className?: string;
  error: string | null;
  genesisHash?: string;
  onSignature?: ({ signature }: { signature: HexString }) => void;
  payload?: ExtrinsicPayload;
  setError: (value: string | null) => void;
}

function LedgerSign ({ accountIndex, addressOffset, className, error, genesisHash, onSignature, payload, setError }: Props): React.ReactElement<Props> {
  const [isBusy, setIsBusy] = useState(false);
  const { t } = useTranslation();
  const { error: ledgerError, isLoading: ledgerLoading, isLocked: ledgerLocked, ledger, refresh, warning: ledgerWarning } = useLedger(genesisHash, accountIndex, addressOffset);

  useEffect(() => {
    if (ledgerError) {
      setError(ledgerError);
    }
  }, [ledgerError, setError]);

  const _onRefresh = useCallback(() => {
    refresh();
    setError(null);
  }, [refresh, setError]);

  const _onSignLedger = useCallback(
    (): void => {
      if (!ledger || !payload || !onSignature) {
        return;
      }

      setError(null);
      setIsBusy(true);
      ledger.sign(payload.toU8a(true), accountIndex, addressOffset)
        .then((signature) => {
          onSignature(signature);
        }).catch((e: Error) => {
          setError(e.message);
          setIsBusy(false);
        });
    },
    [accountIndex, addressOffset, ledger, onSignature, payload, setError]
  );

  return (
    <div className={className}>
      {!!ledgerWarning && (
        <Warning>
          {ledgerWarning}
        </Warning>
      )}
      {error && (
        <Warning isDanger>
          {error}
        </Warning>
      )}
      {(ledgerLocked || error)
        ? (
          <Button
            isBusy={isBusy || ledgerLoading}
            onClick={_onRefresh}
          >
            <FontAwesomeIcon icon={faSync} />
            {t('Refresh')}
          </Button>
        )
        : (
          <Button
            isBusy={isBusy || ledgerLoading}
            onClick={_onSignLedger}
          >
            {t('Sign on Ledger')}
          </Button>
        )
      }
    </div>
  );
}

export default styled(LedgerSign)<Props>`
  flex-direction: column;
  padding: 6px 24px;

  .danger {
    margin-bottom: .5rem;
  }
`;
