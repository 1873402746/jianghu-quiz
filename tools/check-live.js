/* 线上地址端到端验证：资源是否全部 200、答题流程是否走得通 */
const puppeteer = require('puppeteer-core');

const CHROME = process.env.CHROME_PATH ||
  'C:/Program Files/Google/Chrome/Application/chrome.exe';
const LIVE = 'https://1873402746.github.io/jianghu-quiz/';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--font-render-hinting=none', '--hide-scrollbars']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  const errs = [], net = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('response', r => net.push(r.status() + ' ' + r.url().replace(LIVE, '/')));

  const resp = await page.goto(LIVE, { waitUntil: 'networkidle2', timeout: 60000 });
  console.log('首页 HTTP:', resp.status(), '| 最终 URL:', page.url());

  await sleep(600);
  const entry = await page.evaluate(() => ({
    标题: document.title,
    题库题数: window.JH.bankSize,
    抽题数: window.JH_META.drawCount,
    首屏可见: document.getElementById('scEntry').classList.contains('active'),
    题库按钮文案: document.getElementById('bankInfo').textContent
  }));

  // 真实作答一遍
  await page.click('#cta');
  await sleep(500);
  const q1 = await page.evaluate(() => ({
    屏幕: document.querySelector('.screen.active').id,
    有插图: !!document.querySelector('#illus svg'),
    进度点数: document.getElementById('stamps').children.length,
    选项数: document.getElementById('opts').children.length,
    总题数显示: document.getElementById('qTotal').textContent
  }));

  for (let i = 0; i < 16; i++) {
    await page.evaluate(k => {
      const o = document.querySelectorAll('#opts .opt');
      if (o.length) o[k % 3].click();
    }, i);
    await sleep(300);
  }
  const beforeSubmit = await page.evaluate(() => ({
    按钮: document.getElementById('btnNext').textContent,
    已落印: document.getElementById('tally').textContent + '/' + document.getElementById('tallyTotal').textContent
  }));

  await page.click('#btnNext');
  await sleep(2400);
  const result = await page.evaluate(() => {
    const r = window.JH.state.result;
    return {
      屏幕: document.querySelector('.screen.active').id,
      身份: r.identity.name,
      排名: r.rank,
      契合度: document.getElementById('fitVal').textContent,
      三维: r.raw,
      三维百分比: r.pct,
      令牌文字: [...document.querySelectorAll('#token text')].map(t => t.textContent).join(''),
      签文: document.getElementById('digest').textContent,
      同门: document.getElementById('same').textContent
    };
  });
  await page.screenshot({ path: require('path').resolve(__dirname, '..', 'preview', '08-live-result.png'), fullPage: true });

  const bad = net.filter(l => !/^(200|204|304)/.test(l));
  console.log('入口信息:', JSON.stringify(entry, null, 1));
  console.log('第一题:', JSON.stringify(q1, null, 1));
  console.log('提交前:', JSON.stringify(beforeSubmit, null, 1));
  console.log('结果页:', JSON.stringify(result, null, 1));
  console.log('网络请求共', net.length, '条；非 2xx/3xx：', bad.length ? bad : '无');
  console.log('页面错误:', errs.length ? errs : '无');

  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
