// Shared user facing feedback message strings
export const MESSAGES = {
  NETWORK_ERROR: 'Unable to reach the server. Please verify your connection and try again.',
  UNEXPECTED_ERROR: 'An unexpected error occurred while processing the request.',
  CONFLICT_ERROR: 'This item was modified elsewhere. The latest version has been loaded.',
  NO_CHANGES: 'No changes detected to save.',
  VALIDATION_ERROR: 'Please review the highlighted fields before continuing.',
  INITIAL_LOAD_ERROR: 'Failed to load initial map workspace data.',
} as const
