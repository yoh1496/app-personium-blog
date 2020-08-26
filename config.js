module.exports = {
  personium: {
    CELL_NAME: 'app-ishiguro-02',
    CELL_FQDN: 'app-ishiguro-02.appdev.personium.io',
    CELL_ADMIN: 'me',
    CELL_ADMIN_PASS: 'personium',
    DIRECTORY_MAPPING: [
      {
        filePattern: [
          'src/app/engine/front/*',
          '!src/app/engine/front/*.example.*',
        ],
        srcDir: 'src/app/engine/front',
        dstDir: 'front',
        resourceType: 'service',
        meta: {
          language: 'JavaScript',
          subject: 'tokenAcc',
          endPoints: {
            app: 'launchSPA.js',
          },
        },
      },
      {
        filePattern: [
          'src/app/engine/auth/*',
          '!src/app/engine/auth/*.example.*',
        ],
        srcDir: 'src/app/engine/auth',
        dstDir: 'auth',
        resourceType: 'service',
        meta: {
          language: 'JavaScript',
          subject: 'tokenAcc',
          endPoints: {
            start_oauth2: 'start_oauth2.js',
            receive_redirect: 'receive_redirect.js',
            receive_redirect_page: 'receive_redirect_page.js',
            refreshProtectedBoxAccessToken: 'refreshProtectedBoxAccessToken.js',
          },
        },
      },
      {
        filePattern: [
          'src/app/public',
          'src/app/public/**/*',
          '!src/app/public/**/*.example.*',
        ],
        srcDir: 'src/app/public',
        dstDir: 'public',
        resourceType: 'collection',
      },
      {
        filePattern: ['src/assets/**/*', '!src/assets/**/*.example.*'],
        srcDir: 'src/assets',
        dstDir: '',
        resourceType: 'staticFile',
      },
    ],
  },
  network: {
    http_proxy: process.env.http_proxy || '',
    https_proxy: process.env.https_proxy || '',
  },
};

process.env.http_proxy = '';
process.env.https_proxy = '';
process.env.HTTP_PROXY = '';
process.env.HTTPS_PROXY = '';

console.log('------------------------------------------------------');
console.log(' <info>');
console.log('   Proxy env values are contained in `config.network` ');
console.log('------------------------------------------------------');
