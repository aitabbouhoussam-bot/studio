
"use client";

import { useState, type ReactNode } from 'react';

// This file can be used to wrap your app in any client-side providers
// such as theme providers, state management libraries, etc.

export function AppProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
