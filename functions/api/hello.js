// functions/api/hello.js - 沙箱边界 + SSRF 探测
export default async function handler(request, context) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('m');
  const target = url.searchParams.get('u');

  switch (mode) {
    // 沙箱探测
    case 'eval':
      try {
        const code = url.searchParams.get('c') || '1+1';
        const result = eval(code);  // 测 eval 是否可用
        return new Response(JSON.stringify({ eval: String(result) }));
      } catch(e) {
        return new Response(JSON.stringify({ eval_blocked: e.message }));
      }

    case 'proto':
      try {
        Object.prototype.POLLUTED = 'yes';
        return new Response(JSON.stringify({ polluted: {}.POLLUTED }));
      } catch(e) {
        return new Response(JSON.stringify({ proto_blocked: e.message }));
      }

    case 'constructor':
      try {
        const fn = ({}).constructor.constructor('return process.env')();
        return new Response(JSON.stringify({ constructor: String(fn).slice(0, 200) }));
      } catch(e) {
        return new Response(JSON.stringify({ constructor_blocked: e.message }));
      }

    case 'import':
      try {
        // 测是否能用动态 import 加载模块
        const m = await import('child_process');
        return new Response(JSON.stringify({ import: typeof m }));
      } catch(e) {
        return new Response(JSON.stringify({ import_blocked: e.message }));
      }

    case 'require':
      try {
        // 测 CommonJS require
        const proc = require('child_process');
        return new Response(JSON.stringify({ require: typeof proc }));
      } catch(e) {
        return new Response(JSON.stringify({ require_blocked: e.message }));
      }

    // SSRF 探测
    case 'ssrf':
      if (!target) return new Response(JSON.stringify({ error: 'need ?u= target' }));
      try {
        const res = await fetch(target);
        const body = await res.text();
        return new Response(JSON.stringify({
          status: res.status,
          body: body.slice(0, 300)
        }));
      } catch(e) {
        return new Response(JSON.stringify({ ssrf_blocked: e.message }));
      }

    // 环境信息
    case 'whoami':
      try {
        const info = {
          globalThis: Object.keys(globalThis).filter(k => typeof globalThis[k] === 'function').slice(0, 20),
          memory: typeof performance !== 'undefined' ? performance?.memory : 'N/A',
        };
        return new Response(JSON.stringify(info));
      } catch(e) {
        return new Response(JSON.stringify({ error: e.message }));
      }

    default:
      return new Response(JSON.stringify({
        status: 'ok',
        modes: ['eval', 'proto', 'constructor', 'import', 'require', 'ssrf?u=URL', 'whoami']
      }));
  }
}
