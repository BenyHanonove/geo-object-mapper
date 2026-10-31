// Core React ecosystem library imports
import { Suspense, useEffect, useState } from 'react'
import { Outlet, useMatches } from 'react-router'

// Typed application environment configuration imports
import { env } from '@plugins'

// Shared application components and services imports
import { GlobalLoading } from '@shared/components'
import { loadAppData } from '@shared/services/app-init.service'

// Local sibling module and definition imports
import { clearChunkReloadGuard } from './chunkReload.utils'

// Local type and interface definition imports
import type { IRouteHandle } from './router.type'

// Create or update a document meta tag
const upsertMetaTag = (name: string, content: string): void => {
  let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

// Root route bootstrapping data and metadata
export function RootGuard() {
  const matches = useMatches()
  const [bootstrapped, setBootstrapped] = useState(false)

  // Reaching this guard means route chunks loaded
  useEffect(() => {
    clearChunkReloadGuard()
  }, [])

  // Sync document title and description from deepest route handle
  useEffect(() => {
    let resolvedTitle: string | undefined
    let resolvedDescription: string | undefined

    for (const match of matches) {
      const handle = match.handle as IRouteHandle | undefined
      if (handle?.title) resolvedTitle = handle.title
      if (handle?.description) resolvedDescription = handle.description
    }

    document.title = resolvedTitle ? `${resolvedTitle} | ${env.app.name}` : env.app.name
    if (resolvedDescription) {
      upsertMetaTag('description', resolvedDescription)
    }
  }, [matches])

  // Warm initial polygons and objects once at workspace boot
  useEffect(() => {
    let active = true
    void loadAppData().finally(() => {
      if (active) setBootstrapped(true)
    })
    return () => {
      active = false
    }
  }, [])

  if (!bootstrapped) {
    return <GlobalLoading />
  }

  return (
    <Suspense fallback={<GlobalLoading />}>
      <Outlet />
    </Suspense>
  )
}
