exports.accInfo = (function() {
  /*
   * Begin of your Personium app configurations
   */
  var appCellUrl = '<CELL_URL>'; // for example: https://stg-demo.personium.io/appCellName/ or https://appCellName.stg-demo.personium.io/
  var appUserId = '***';
  var appUserPass = '***';
  var allowedOrigins = [appCellUrl];
  /*
   * End of your Personium app configurations
   */

  /*
   * Don't modify anything from here on
   */
  var accInfo = {};
  accInfo.APP_CELL_URL = appCellUrl;
  accInfo.APP_CELL_ADMIN_INFO = {
    cellUrl: appCellUrl,
    userId: appUserId,
    password: appUserPass,
  };
  accInfo.allowedOrigins = allowedOrigins;

  return accInfo;
})();
