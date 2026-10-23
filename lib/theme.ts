/**
 * The theme choice: Light, Dark or System. Kept in a cookie so the server
 * renders the chosen theme into the HTML (app/layout.tsx), with no flash and
 * no script. No cookie means System: globals.css follows the device.
 */
export const THEME_COOKIE = "sd_theme";

export type Theme = "light" | "dark" | "system";
