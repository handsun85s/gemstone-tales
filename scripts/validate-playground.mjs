import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const pages = ['index','adventure','space','stickers','maker'];
let scriptCount = 0;
const errors = [];
for (const page of pages) {
  const file = path.join(dist, 'playground', page + '.html');
  try {
    const html = fs.readFileSync(file, 'utf8');
    if (!/<html\s+lang="zh-CN"/.test(html)) errors.push(`${page}: 缺少中文页面声明`);
    if (!/name="viewport"/.test(html)) errors.push(`${page}: 缺少移动端 viewport`);
    for (const [index, match] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()) {
      if (/\bsrc\s*=/.test(match[1])) continue;
      new vm.Script(match[2], { filename: `${page}.html:inline-${index+1}` });
      scriptCount++;
    }
    for (const match of html.matchAll(/<(?:script|img|iframe|link)\b[^>]*?\b(?:src|href)="([^"]+)"/gi)) {
      const resource = match[1];
      if (/^(?:https?:|data:|#)/.test(resource) || resource.includes('${')) continue;
      const target = path.resolve(path.dirname(file), resource.split(/[?#]/)[0]);
      if (!target.startsWith(dist) || !fs.existsSync(target)) errors.push(`${page}: 本地资源不存在或超出站点目录 ${resource}`);
    }
  } catch (error) { errors.push(`${page}: ${error.message}`); }
}
try { new vm.Script(fs.readFileSync(path.join(dist, 'playground/playground.js'), 'utf8')); scriptCount++; }
catch (error) { errors.push(`playground.js: ${error.message}`); }
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Playground 校验通过：总览与 4 套方案，本地资源齐全，${scriptCount} 段脚本语法有效。`);
