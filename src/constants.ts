export module Constants {
  export const PAGE_URL = process.env.PAGE_URL as string
  export const PAGE_TIMEOUT = 3000
  export const COOKIE_BUTTON_TEXT = process.env.COOKIE_BUTTON_TEXT as string

  // Language
  export const SPANISH_BUTTON = process.env.SPANISH_BUTTON as string

  // Map position inputs
  export const POSITION_X_INPUT = process.env.POSITION_X_INPUT as string
  export const POSITION_Y_INPUT = process.env.POSITION_Y_INPUT as string

  // Direction inputs
  export const TOP_BUTTON = process.env.TOP_BUTTON as string
  export const LEFT_BUTTON = process.env.LEFT_BUTTON as string
  export const RIGHT_BUTTON = process.env.RIGHT_BUTTON as string
  export const BOTTOM_BUTTON = process.env.BOTTOM_BUTTON as string

  // Test coordinate limits
  // export const MIN_COORDINATE_X = 0
  // export const MIN_COORDINATE_Y = 0
  // export const MAX_COORDINATE_X = 1
  // export const MAX_COORDINATE_Y = 1

  // Coordinate limits
  export const MIN_COORDINATE_X = -88
  export const MIN_COORDINATE_Y = -88
  export const MAX_COORDINATE_X = 27
  export const MAX_COORDINATE_Y = 46

  // Hunt select
  export const HUNT_SELECT = process.env.HUNT_SELECT as string
  export const HUNT_SELECT_OPTIONS = process.env.HUNT_SELECT_OPTIONS as string

  // Submit button
  export const SUBMIT_BUTTON = process.env.SUBMIT_BUTTON as string

  // Results
  export const RESULT_COORDINATES = process.env.RESULT_COORDINATES as string
  export const RESULT_MAP_COUNT = process.env.RESULT_MAP_COUNT as string
}