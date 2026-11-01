// Leaflet mapping library and styles imports
import L from 'leaflet'

// Object feature module implementation imports
import { ObjectSymbolType } from '@objects/types/IGeoObject.types'
import { getSymbolInnerPathsSvg } from '@objects/utils/symbolSvg.utils'

// Local type and interface definition imports
import type { IMapThemeTokens } from '@plugins'

// Options for building object map icons
export interface IBuildDivIconOptions {
  symbolType: ObjectSymbolType
  tokens: IMapThemeTokens
  isSelected: boolean
  isDraft: boolean
}

// Pick theme color for symbol type
const resolveSymbolColor = (symbolType: ObjectSymbolType, tokens: IMapThemeTokens): string => {
  switch (symbolType) {
    case ObjectSymbolType.JEEP:
      return tokens.symbolJeep
    case ObjectSymbolType.RADAR:
      return tokens.symbolRadar
    case ObjectSymbolType.DRONE:
      return tokens.symbolDrone
    case ObjectSymbolType.MARKER:
    default:
      return tokens.symbolMarker
  }
}

// Build draggable handle for polygon vertices
export const buildVertexDivIcon = (tokens: IMapThemeTokens): L.DivIcon =>
  L.divIcon({
    html: `<div style="
      width: 14px;
      height: 14px;
      border-radius: 50%;
      box-sizing: border-box;
      background: ${tokens.vertexDefault};
      border: 2.5px solid ${tokens.vertexRingBg};
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      cursor: move;
    "></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })

// Build styled Leaflet icon for objects
export const buildObjectDivIcon = ({
  symbolType,
  tokens,
  isSelected,
  isDraft,
}: IBuildDivIconOptions): L.DivIcon => {
  const fillColor = resolveSymbolColor(symbolType, tokens)
  const borderColor = isDraft ? tokens.symbolDraftBorder : tokens.badgeSurface
  const borderStyle = isDraft ? 'dashed' : 'solid'
  const haloShadow = isSelected
    ? `0 0 0 4px ${tokens.symbolSelectedHalo}, 0 6px 14px rgba(0,0,0,0.32)`
    : '0 4px 10px rgba(0,0,0,0.26)'
  const scale = isSelected ? 'scale(1.12)' : 'scale(1)'
  const innerSvg = getSymbolInnerPathsSvg(symbolType)

  const html = `
    <div style="
      position: relative;
      width: 36px;
      height: 42px;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: ${scale};
      transform-origin: bottom center;
      transition: transform 120ms ease;
    ">
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: ${fillColor};
        color: ${tokens.symbolGlyph};
        border: 2.5px ${borderStyle} ${borderColor};
        box-shadow: ${haloShadow};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" focusable="false">
          ${innerSvg}
        </svg>
      </div>
      <div style="
        width: 0;
        height: 0;
        margin-top: -2px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ${fillColor};
      "></div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'leaflet-div-icon',
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    tooltipAnchor: [0, -38],
  })
}
