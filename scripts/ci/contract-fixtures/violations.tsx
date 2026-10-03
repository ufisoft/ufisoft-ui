// Contract fixture — deliberately violates every eslint and structure rule in docs/contracts/:
// a hook without 'use client' (use-client-for-hooks), inline styles (no-inline-style), an
// export missing from src/index.ts (component-exported-from-index) and an import of the global
// event bus (emit-through-use-emit).
// check_contracts.selftest.mjs copies it into src/components/ to prove each rule fires.
import { useState } from 'react';
import { eventBus } from '../../events/registry';

export function ContractFixture() {
  const [opacity] = useState(1);
  const styles = { opacity };
  return (
    <>
      <div style={{ opacity, '--_width': '1rem' }} />
      <div style={styles} />
      {/* @ts-expect-error -- a string style, which React rejects too */}
      <div style="opacity: 1" />
    </>
  );
}

export const resetEvents = () => eventBus.clear();
