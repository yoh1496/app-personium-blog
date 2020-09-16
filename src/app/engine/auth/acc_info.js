exports.accInfo = (function() {
  /*
   * Begin of your Personium app configurations
   */
  var appCellUrl = 'https://app-ishiguro-02.appdev.personium.io/'; // for example: https://stg-demo.personium.io/appCellName/ or https://appCellName.stg-demo.personium.io/
  var appUserId = '***';
  var appUserPass = '***';
  var allowedOrigins = [
    appCellUrl,
    'https://yoh1496.github.io/app-personium-blog/',
  ];
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
