import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

// Design reference: GemAtlas's separate data schema and pre-publication validation.
// https://github.com/cang-ge/gematlas/tree/master/scripts/build
// This validator is independently implemented for our existing browser data format.
const root = fileURLToPath(new URL('../', import.meta.url));
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const httpsUrl = value => {
  try { const u = new URL(value); return u.protocol === 'https:' && !!u.hostname && !u.username && !u.password; }
  catch { return false; }
};

export function loadContent() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'dist/gems.js'), 'utf8'), context, { timeout: 1000 });
  vm.runInNewContext(fs.readFileSync(path.join(root, 'dist/gems-expansion.js'), 'utf8'), context, { timeout: 1000 });
  return {
    gems: context.window.GEMS,
    credits: JSON.parse(fs.readFileSync(path.join(root, 'dist/assets/credits.json'), 'utf8')),
  };
}

export function validateContent(gems, credits, assetExists = file => {
  try { return fs.statSync(path.join(root, 'dist/assets', file)).isFile(); }
  catch { return false; }
}) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };
  if (!Array.isArray(gems) || !gems.length) return ['图鉴必须包含至少一种宝石。'];
  if (!Array.isArray(credits)) return ['图片署名必须是一个数组。'];
  const ids = new Set();
  const names = new Set();
  const textFields = ['id','name','en','family','color','formula','tagline','intro','formation','use','safety'];
  for (const [index, g] of gems.entries()) {
    const label = g?.id || `第 ${index + 1} 条`;
    if (!g || typeof g !== 'object') { errors.push(`${label}：内容必须是对象。`); continue; }
    for (const key of textFields) require(nonempty(g[key]), `${label}：${key} 不能为空。`);
    require(/^[a-z]+(?:-[a-z]+)*$/.test(g.id), `${label}：ID 只能包含小写英文字母与单连字符。`);
    require(!ids.has(g.id), `${label}：宝石 ID 重复。`);
    require(!names.has(g.name), `${label}：中文名称重复。`);
    ids.add(g.id); names.add(g.name);
    require(['紫色','无色','粉色','多色','金色','绿色','蓝色','红色','黄色','橙色','棕色','黑色','白色'].includes(g.color), `${label}：颜色必须能被现有筛选器识别。`);
    const match = String(g.hardness).match(/^(\d+(?:\.\d+)?)(?:[–-](\d+(?:\.\d+)?))?$/);
    const min = match ? Number(match[1]) : NaN;
    const max = match ? Number(match[2] || match[1]) : NaN;
    require(min >= 1 && max <= 10 && min <= max, `${label}：莫氏硬度须为 1–10 内的数字或递增区间。`);
    require(Array.isArray(g.lookFor) && g.lookFor.length === 3 && g.lookFor.every(nonempty), `${label}：需要三条完整的观察线索。`);
    require(nonempty(g.wonder?.question) && nonempty(g.wonder?.answer), `${label}：趣味问答不完整。`);
    require(nonempty(g.source?.label) && httpsUrl(g.source?.url), `${label}：需要来源名称和有效 HTTPS 链接。`);
    const options = g.quiz?.options;
    require(nonempty(g.quiz?.question) && nonempty(g.quiz?.explanation), `${label}：挑战题需要题目和解释。`);
    require(Array.isArray(options) && options.length === 3 && options.every(nonempty) && new Set(options).size === 3, `${label}：挑战题需要三个不同且非空的选项。`);
    require(Number.isInteger(g.quiz?.answer) && g.quiz.answer >= 0 && g.quiz.answer < (options?.length || 0), `${label}：正确答案索引超出选项范围。`);
  }
  const photoIds = new Set();
  for (const [index, photo] of credits.entries()) {
    const label = photo?.id || `图片 ${index + 1}`;
    if (!photo || typeof photo !== 'object') { errors.push(`${label}：署名记录必须是对象。`); continue; }
    require(ids.has(photo.id), `${label}：图片没有对应的宝石。`);
    require(!photoIds.has(photo.id), `${label}：图片署名重复。`);
    photoIds.add(photo.id);
    for (const key of ['file','alt','author','license','changes']) require(nonempty(photo[key]), `${label}：图片 ${key} 不能为空。`);
    const safeFile = typeof photo.file === 'string' && /^[a-z]+(?:-[a-z]+)*\.(?:jpg|png|webp)$/.test(photo.file);
    require(safeFile, `${label}：图片必须是 assets 内的本地文件名。`);
    if (safeFile) require(assetExists(photo.file), `${label}：图片文件不存在：${photo.file}。`);
    require(httpsUrl(photo.source) && httpsUrl(photo.url), `${label}：需记录原始页面和图片 URL。`);
    const license = typeof photo.license === 'string' ? photo.license.match(/^CC (BY(?:-SA)?) (\d\.\d)$/) : null;
    require(!!license, `${label}：当前图片须明确使用 CC BY 或 CC BY-SA 许可。`);
    if (license) require(photo.licenseUrl?.replace(/\/$/, '') === `https://creativecommons.org/licenses/${license[1].toLowerCase()}/${license[2]}`, `${label}：许可证名称与许可链接不一致。`);
  }
  for (const gem of gems) {
    if (gem.illustration === true) require(assetExists('gem-symbol.svg'), '缺少宝石图标。');
    else require(photoIds.has(gem.id), gem.id + '：缺少图片署名与许可记录。');
  }
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { gems, credits } = loadContent();
    const errors = validateContent(gems, credits);
    if (errors.length) {
      console.error(`内容校验失败（${errors.length} 项）：\n${errors.map(e => `- ${e}`).join('\n')}`);
      process.exitCode = 1;
    } else {
      console.log(`内容校验通过：${gems.length} 种宝石、${credits.length} 张本地照片；字段、硬度范围、问答和署名许可完整。`);
      console.log('此检查验证结构和资源完整性，科学事实仍需人工核对第一手资料。');
    }
  } catch (error) {
    console.error(`内容文件无法读取：${error.message}`);
    process.exitCode = 1;
  }
}
