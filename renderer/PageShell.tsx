import React from 'react'
import { PageContextProvider } from './usePageContext'
import type { PageContext } from './types'
import './PageShell.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export { PageShell }

const DEFAULT_QUERY_CLIENT = new QueryClient();

function PageShell({ children, pageContext }: { children: React.ReactNode; pageContext: PageContext }) {
  return (
    <React.StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <QueryClientProvider client={DEFAULT_QUERY_CLIENT}>
          {children}
        </QueryClientProvider>
      </PageContextProvider>
    </React.StrictMode>
  )
}
