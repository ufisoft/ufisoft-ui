// Contract fixture — deliberately violates every eslint and structure rule in docs/contracts/:
// a hook without 'use client' (use-client-for-hooks), an inline style (no-inline-style) and an
// export missing from src/index.ts (component-exported-from-index).
// check_contracts.selftest.mjs copies it into src/components/ to prove each rule fires.
import { useState } from 'react';

export function ContractFixture() {
  const [opacity] = useState(1);
  return <div style={{ opacity }} />;
}
