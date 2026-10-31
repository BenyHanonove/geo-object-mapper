// Session key preventing repeated chunk reloads
const RELOAD_GUARD_KEY = 'geo_mapper_chunk_reload_guard'

// Reload once after a stale chunk
export const reloadOnceAfterChunkFailure = (): boolean => {
  if (window.sessionStorage.getItem(RELOAD_GUARD_KEY)) return false
  window.sessionStorage.setItem(RELOAD_GUARD_KEY, '1')
  window.location.reload()
  return true
}

// Allow future reloads after successful load
export const clearChunkReloadGuard = (): void => {
  window.sessionStorage.removeItem(RELOAD_GUARD_KEY)
}
