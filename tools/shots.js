/* 开发期自测脚本 —— 需要 puppeteer-core 与本机 Chrome，不参与线上页面。
 * 用法： NODE_PATH=<puppeteer-core 所在 node_modules> node tools/shots.js
 * Chrome 路径可用环境变量 CHROME_PATH 覆盖。 */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const BASE = ROOT.split(path.sep).join('/');
const OUT = path.join(ROOT, 'preview');
const URL = 'file:///' + BASE + '/index.html';
const CHROME = process.env.CHROME_PATH ||
  'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--allow-file-access-from-files', '--font-render-hinting=none', '--hide-scrollbars']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

  await page.goto(URL, { waitUntil: 'load' });
  await sleep(400);
  await page.click('#cta');
  await sleep(400);

  // 依次把 8 种插画都调出来，各截一张题目页
  const seen = new Set();
  const shots = [];
  for (let guard = 0; guard < 400 && seen.size < 8; guard++) {
    const info = await page.evaluate(() => {
      const S = window.JH.state, i = S.idx;
      return { art: S.round[i].art, idx: i, html: document.getElementById('scQuiz').outerHTML };
    });
    if (!seen.has(info.art)) {
      seen.add(info.art);
      shots.push({ art: info.art, html: info.html });
    }
    // 前进到下一题（走到底就从第 1 题重新遍历）
    await page.evaluate(() => {
      const S = window.JH.state;
      if (S.idx >= S.round.length - 1) { S.idx = 0; document.getElementById('btnNext').click(); document.getElementById('btnPrev').click(); }
      else document.getElementById('btnNext').click();
    });
    await sleep(120);
  }

  // 拼成一张对照图
  const css = fs.readFileSync(path.join(ROOT, 'assets', 'skin.css'), 'utf8');
  const comp = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">' +
    '<style>' + css + '</style>' +
    '<style>body{background:#E4DED2;padding:20px;display:flex;flex-wrap:wrap;gap:18px;justify-content:center}' +
    '.cell{width:375px}.cap{font:600 12px/1.6 sans-serif;color:#8E2A24;letter-spacing:.14em;margin-bottom:6px}' +
    '.app{min-height:812px;height:812px;overflow:hidden;box-shadow:0 8px 26px -12px rgba(42,38,34,.5)}</style>' +
    '</head><body>' +
    shots.map(s => '<div class="cell"><div class="cap">SCENE · ' + s.art + '</div>' + s.html + '</div>').join('') +
    '</body></html>';
  const compPath = path.join(OUT, '_questions.html');
  fs.writeFileSync(compPath, comp);

  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1.6 });
  await page.goto('file:///' + compPath.replace(/\\/g, '/'), { waitUntil: 'load' });
  await sleep(400);
  await page.screenshot({ path: path.join(OUT, '07-question-arts.png'), fullPage: true });

  console.log('插画覆盖:', [...seen].join(', '), '共', seen.size, '张');
  console.log('错误:', errs.length ? errs : '无');
  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
