/**
 * BINCO RAN - update LoginPage in Apps Script via Apps Script API.
 * Run from the existing BINCO RAN AUTO BACKUP helper project.
 */
const BINCO_PATCH_CONFIG = {
  SCRIPT_ID: '11HCbsqflf21EnxCLAESE7V1yo1M_9qd_6-DIuId8g-lYSj3EOgM36AWI',
  RAW_LOGIN_PAGE_URL: 'https://raw.githubusercontent.com/bincocreative-alt/binco-ran-camera/main/AppsScript/LoginPage.html',
  CAMERA_APP_URL: 'https://bincocreative-alt.github.io/binco-ran-camera/'
};

function updateBincoCameraLogin() {
  const cfg = BINCO_PATCH_CONFIG;
  const rawResponse = UrlFetchApp.fetch(cfg.RAW_LOGIN_PAGE_URL, { muteHttpExceptions: true });
  if (rawResponse.getResponseCode() !== 200) throw new Error('Gagal mengambil LoginPage.html: HTTP ' + rawResponse.getResponseCode());
  const loginHtml = rawResponse.getContentText().replace('__CAMERA_APP_URL__', cfg.CAMERA_APP_URL);
  if (loginHtml.includes('__CAMERA_APP_URL__')) throw new Error('URL kamera belum berhasil dipasang.');
  const token = ScriptApp.getOAuthToken();
  const endpoint = 'https://script.googleapis.com/v1/projects/' + cfg.SCRIPT_ID + '/content';
  const getResponse = UrlFetchApp.fetch(endpoint, { method:'get', headers:{Authorization:'Bearer '+token}, muteHttpExceptions:true });
  if (getResponse.getResponseCode() !== 200) throw new Error('Gagal membaca project BINCO RAN: HTTP '+getResponse.getResponseCode()+' '+getResponse.getContentText());
  const project = JSON.parse(getResponse.getContentText());
  const files = project.files || [];
  const loginFile = files.find(f => f.name === 'LoginPage');
  if (!loginFile) throw new Error('File LoginPage tidak ditemukan. Tidak ada perubahan yang dikirim.');
  loginFile.source = loginHtml;
  const putResponse = UrlFetchApp.fetch(endpoint, { method:'put', contentType:'application/json', headers:{Authorization:'Bearer '+token}, payload:JSON.stringify({files}), muteHttpExceptions:true });
  if (putResponse.getResponseCode() !== 200) throw new Error('Gagal memperbarui project: HTTP '+putResponse.getResponseCode()+' '+putResponse.getContentText());
  const updated = JSON.parse(putResponse.getContentText());
  const result = 'UPDATE BERHASIL\nProject: '+(updated.title||project.title||'BINCO RAN')+'\nFile diperbarui: LoginPage.html\nFile lain dipertahankan: '+(files.length-1)+'\nBerikutnya: deploy versi baru pada project BINCO RAN.';
  Logger.log(result);
  return result;
}
