// Object feature module implementation imports
import { ObjectSymbolType } from '@objects/types/IGeoObject.types'

// Raw SVG markup per symbol type
export const getSymbolInnerPathsSvg = (symbolType: ObjectSymbolType): string => {
  switch (symbolType) {
    case ObjectSymbolType.JEEP:
      return `
        <path d="M4 13.5V10.5L6.2 10.2L8.4 6.5H15.5L16.8 9.8L20.5 10.4C21.3 10.5 22 11.2 22 12V14.5H20.2C19.8 13.1 18.5 12 17 12C15.5 12 14.2 13.1 13.8 14.5H10.2C9.8 13.1 8.5 12 7 12C5.5 12 4.2 13.1 3.8 14.5H3V13.5H4ZM9.3 8L7.9 10.3H12V8H9.3ZM13.3 8V10.3H15.4L14.5 8H13.3Z" fill="currentColor"/>
        <rect x="2" y="8.2" width="1.8" height="4.4" rx="0.8" fill="currentColor"/>
        <circle cx="7" cy="15.5" r="2.5" fill="currentColor"/>
        <circle cx="17" cy="15.5" r="2.5" fill="currentColor"/>
      `
    case ObjectSymbolType.RADAR:
      return `
        <path d="M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3z" fill="currentColor"/>
        <path d="M12 7a5 5 0 0 0-5 5h2a3 3 0 0 1 3-3V7z" fill="currentColor"/>
        <path d="M12 12L18.5 5.5L19.9 6.9L13.4 13.4A2 2 0 1 1 12 12z" fill="currentColor"/>
      `
    case ObjectSymbolType.DRONE:
      return `
        <circle cx="6" cy="6" r="2.6" stroke="currentColor" stroke-width="1.8" fill="none"/>
        <circle cx="18" cy="6" r="2.6" stroke="currentColor" stroke-width="1.8" fill="none"/>
        <circle cx="6" cy="18" r="2.6" stroke="currentColor" stroke-width="1.8" fill="none"/>
        <circle cx="18" cy="18" r="2.6" stroke="currentColor" stroke-width="1.8" fill="none"/>
        <path d="M8 8L16 16M16 8L8 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <rect x="9.5" y="9.5" width="5" height="5" rx="1.5" fill="currentColor"/>
      `
    case ObjectSymbolType.MARKER:
    default:
      return `
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor"/>
      `
  }
}
