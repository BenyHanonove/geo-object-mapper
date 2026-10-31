// Top-level sections of the env config
export enum EnvSection {
  APP = 'app',
  API = 'api',
  MAP = 'map',
}

// Vite environment variable names in use
export enum EnvKey {
  APP_ENV = 'VITE_APP_ENV',
  APP_NAME = 'VITE_APP_NAME',
  APP_DIR = 'VITE_APP_DIR',
  API_BASE_URL = 'VITE_API_BASE_URL',
  MAP_DEFAULT_LAT = 'VITE_MAP_DEFAULT_LAT',
  MAP_DEFAULT_LON = 'VITE_MAP_DEFAULT_LON',
  MAP_DEFAULT_ZOOM = 'VITE_MAP_DEFAULT_ZOOM',
}

// Supported application deployment environment names
export enum AppEnvironment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

// Supported text layout directions for app
export enum AppDirection {
  LTR = 'ltr',
  RTL = 'rtl',
}

// Parsed shape of the app section
export interface IAppEnvConfig {
  readonly environment: AppEnvironment
  readonly name: string
  readonly dir: AppDirection
}

// Parsed shape of the API section
export interface IApiEnvConfig {
  readonly baseUrl: string
}

// Parsed shape of the map section
export interface IMapEnvConfig {
  readonly defaultLat: number
  readonly defaultLon: number
  readonly defaultZoom: number
}

// Full typed environment configuration object shape
export interface IEnvConfig {
  readonly [EnvSection.APP]: IAppEnvConfig
  readonly [EnvSection.API]: IApiEnvConfig
  readonly [EnvSection.MAP]: IMapEnvConfig
}

// Raw string values from Vite env
export type RawEnvMap = Partial<Record<EnvKey, string>>
