// Contract fixture — deliberately violates every eslint and structure rule in docs/contracts/:
// a hook without 'use client' (use-client-for-hooks), an inline style (no-inline-style), an
// export missing from src/index.ts (component-exported-from-index) and an import of the global
// event bus (emit-through-use-emit).
// check_contracts.selftest.mjs copies it into src/components/ to prove each rule fires.
import { useState } from 'react';
import { eventBus } from '../../events/registry';

export function ContractFixture() {
  const [opacity] = useState(1);
  return <div style={{ opacity }} />;
}

export const resetEvents = () => eventBus.clear();
