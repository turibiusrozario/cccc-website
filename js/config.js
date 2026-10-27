/* Site settings. Edit the values between the quotes. Keep the commas and quotes. */
window.CCCC_CONFIG = {
  // Paste the Google Sheet "Publish to web" CSV link here (see README.md, step 2).
  // While this is empty, the site reads data/content.csv instead.
  SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSdtC0VD0dxTfVFDYh5bhu988f5LSOvmI2nxitGqo7tebKHdTLohp0cvAyisvwCK11OpJbmG-UsmwZo/pub?output=csv",

  // Used if the Google Sheet cannot be reached.
  FALLBACK_CSV: "data/content.csv",

  // Items switch from upcoming to past at midnight in this time zone.
  TIMEZONE: "America/New_York",

  // How often an open page checks for new content.
  CHECK_EVERY_MINUTES: 5,

  // Front page shows this many events, projects and opportunities. Extra ones sit under "Show more".
  HOME_CAP: 3
};
