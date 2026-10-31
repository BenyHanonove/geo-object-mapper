// Local sibling module and definition imports
import {
  AppDirection,
  AppEnvironment,
  EnvKey,
  EnvSection,
} from './env.type'
import type { IEnvConfig, RawEnvMap } from './env.type'

// Raw environment variables exposed by Vite
const rawEnv = import.meta.env as object as RawEnvMap

// Read trimmed string with fallback value
const readString = (key: EnvKey, fallback: string): string => {
  const value = rawEnv[key]?.trim()
  return value && value.length > 0 ? value : fallback
}

// Parse finite number with fallback value
const readNumber = (key: EnvKey, fallback: number): number => {
  const raw = rawEnv[key]?.trim()
  if (raw === undefined || raw === '') return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}


// Validate value against allowed enum members
const readEnum = <TEnum extends string>(
  key: EnvKey,
  allowedValues: readonly TEnum[],
  fallback: TEnum,
): TEnum => {
  const raw = rawEnv[key]?.trim() as TEnum | undefined
  return raw && allowedValues.includes(raw) ? raw : fallback
}


// Frozen typed environment configuration singleton
export const env: IEnvConfig = Object.freeze({
  [EnvSection.APP]: Object.freeze({
    environment: readEnum(
      EnvKey.APP_ENV,
      Object.values(AppEnvironment),
      AppEnvironment.DEVELOPMENT,
    ),
    name: readString(EnvKey.APP_NAME, 'Geo Object Mapper'),
    dir: readEnum(EnvKey.APP_DIR, Object.values(AppDirection), AppDirection.LTR),
  }),
  [EnvSection.API]: Object.freeze({
    baseUrl: readString(EnvKey.API_BASE_URL, 'http://localhost:5000/api'),
  }),
  [EnvSection.MAP]: Object.freeze({
    // Centered on Gush Dan: Tel Aviv-Yafo, Holon, Bat Yam, Rishon LeTsiyon, Petah Tikva
    defaultLat: readNumber(EnvKey.MAP_DEFAULT_LAT, 32.042),
    defaultLon: readNumber(EnvKey.MAP_DEFAULT_LON, 34.798),
    defaultZoom: readNumber(EnvKey.MAP_DEFAULT_ZOOM, 11),
  }),
})
