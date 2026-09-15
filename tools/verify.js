/* 开发期自测脚本 —— 需要 puppeteer-core 与本机 Chrome，不参与线上页面。
 * 用法： NODE_PATH=<puppeteer-core 所在 node_modules> node tools/verify.js
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
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

  await page.goto(URL, { waitUntil: 'load' });
  await sleep(400);

  /* ---------- 1. 抽题：长度 / 去重 / 覆盖 / 洗牌 / 首题均匀度 ---------- */
  const drawStat = await page.evaluate(() => {
    const N = 2000, need = window.JH_META.drawCount;
    const seen = new Set(); let badLen = 0, badDup = 0, notShuffled = 0;
    const firstIds = [];
    const bankOrder = window.JH_QUESTIONS.slice(0, need).map(q => q.id).join(',');
    for (let i = 0; i < N; i++) {
      const r = window.JH.drawRound();
      const ids = r.map(q => q.id);
      if (ids.length !== need) badLen++;
      if (new Set(ids).size !== ids.length) badDup++;
      if (ids.join(',') === bankOrder) notShuffled++;
      ids.forEach(id => seen.add(id));
      firstIds.push(ids[0]);
    }
    const dist = {};
    firstIds.forEach(id => dist[id] = (dist[id] || 0) + 1);
    const vals = Object.values(dist);
    return {
      rounds: N, drawCount: need, bankSize: window.JH.bankSize,
      "长度错误": badLen, "轮内重复": badDup, "未洗牌": notShuffled,
      "覆盖到的题号数": seen.size,
      "首题出现过不同题号数": vals.length,
      "首题最冷/最热": Math.min(...vals) + ' / ' + Math.max(...vals),
      "首题理论均值": (N / window.JH.bankSize).toFixed(1)
    };
  });

  /* ---------- 2. 计分不变量 ---------- */
  const invariant = await page.evaluate(() => {
    const dims = ['y', 'j', 'n'], bad = [], unbal = [];
    const tot = { y: 0, j: 0, n: 0 };
    window.JH_QUESTIONS.forEach(q => {
      if (q.opts.length !== 3) bad.push(q.id + ' 选项数=' + q.opts.length);
      const per = { y: 0, j: 0, n: 0 };
      q.opts.forEach((o, i) => {
        const s = dims.reduce((a, k) => a + (o.s[k] || 0), 0);
        if (s !== 3) bad.push(q.id + ' opt' + i + ' 分值和=' + s);
        dims.forEach(k => { per[k] += o.s[k] || 0; });
      });
      dims.forEach(k => tot[k] += per[k]);
      if (per.y !== 3 || per.j !== 3 || per.n !== 3) {
        unbal.push(q.id + ' 三维和 y' + per.y + '/j' + per.j + '/n' + per.n);
      }
    });
    const ranks = new Set(Object.values(window.JH_IDENTITIES).map(v => v.rank));
    const perms = ['y>j>n', 'y>n>j', 'j>y>n', 'j>n>y', 'n>y>j', 'n>j>y'];
    const hit = {};
    for (let i = 0; i < 4000; i++) {
      const round = window.JH.drawRound();
      const r = window.JH.computeResult(round, round.map(() => Math.floor(Math.random() * 3)));
      const k = r.identity ? r.identity.name : '未匹配';
      hit[k] = (hit[k] || 0) + 1;
    }
    // 六种身份各自的"最小可达性"：同一偏好类型的用户在相邻两个身份间应近似五五开
    const pref = { y: [3, 1, 1], j: [1, 3, 1], n: [1, 1, 3] };
    const reach = {};
    ['y', 'j', 'n'].forEach(pk => {
      const p = pref[pk], h = {};
      for (let i = 0; i < 1500; i++) {
        const round = window.JH.drawRound();
        const ans = round.map(q => {
          let bi = 0, bs = -1e9;
          q.opts.forEach((o, oi) => {
            const sc = dims.reduce((a, k, di) => a + (o.s[k] || 0) * p[di], 0);
            if (sc > bs) { bs = sc; bi = oi; }
          });
          return bi;
        });
        const nm = window.JH.computeResult(round, ans).identity.name;
        h[nm] = (h[nm] || 0) + 1;
      }
      reach[pk + '型用户'] = h;
    });
    const round = window.JH.drawRound();
    const allZero = window.JH.computeResult(round, round.map(() => 0));
    const allTwo = window.JH.computeResult(round, round.map(() => 2));
    const allFirst = window.JH.computeResult(round, round.map(() => 1));
    return {
      "题库题数": window.JH_QUESTIONS.length,
      "选项分值和不等于3的项": bad,
      "三维和不等于3/3/3的题": unbal,
      "三维总权重": tot + ' (应各为 96)',
      "未被身份覆盖的排名组合": perms.filter(p => !ranks.has(p)),
      "随机作答4000次身份分布": hit,
      "随机命中身份种类数": Object.keys(hit).length,
      "各偏好类型用户的结果分布": reach,
      "全选第1/2/3项": [allZero.identity.name, allFirst.identity.name, allTwo.identity.name]
    };
  });

  await page.screenshot({ path: path.join(OUT, '01-entry-375.png') });

  /* ---------- 3. 首屏 → 题目页 ---------- */
  await page.click('#cta');
  await sleep(450);
  const q1 = await page.evaluate(() => ({
    screen: document.querySelector('.screen.active').id,
    题号: document.getElementById('qIdx').textContent,
    总题数: document.getElementById('qTotal').textContent,
    进度点: document.getElementById('stamps').children.length,
    选项数: document.getElementById('opts').children.length,
    有插图: !!document.querySelector('#illus svg'),
    横向溢出: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  await page.screenshot({ path: path.join(OUT, '02-question-375.png') });

  /* ---------- 4. 选项作答 + 自动前进 ---------- */
  await page.click('#opts .opt:nth-child(2)');
  await sleep(500);
  const afterFirst = await page.evaluate(() => ({
    题号: document.getElementById('qIdx').textContent,
    已落印: document.getElementById('tally').textContent,
    首题已选中态残留: document.querySelectorAll('.opt.sel').length,
    第一枚印章点亮: document.querySelectorAll('#stamps i.on').length
  }));

  /* ---------- 5. 逐题真实点击答完 16 题 ---------- */
  for (let i = 1; i < 16; i++) {
    await page.evaluate(k => document.querySelectorAll('#opts .opt')[k % 3].click(), i);
    await sleep(300);
  }
  const lastQ = await page.evaluate(() => ({
    题号: document.getElementById('qIdx').textContent,
    按钮文案: document.getElementById('btnNext').textContent,
    按钮为提交态: document.getElementById('btnNext').classList.contains('is-submit'),
    已落印: document.getElementById('tally').textContent + '/' + document.getElementById('tallyTotal').textContent,
    已收答案数: window.JH.state.answers.filter(a => a !== null).length,
    全部点亮的印章: document.querySelectorAll('#stamps i.on').length,
    横向溢出: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  await page.screenshot({ path: path.join(OUT, '03-last-question-375.png') });

  /* ---------- 6. 未答完提交应被拦截 ---------- */
  await page.evaluate(() => {
    const S = window.JH.state;
    S.answers[5] = null;
    S.idx = S.round.length - 2;
  });
  await page.click('#btnNext');
  await sleep(250);
  await page.click('#btnNext');
  await sleep(300);
  const guard = await page.evaluate(() => ({
    提示是否出现: document.getElementById('toast').classList.contains('show'),
    提示文案: document.getElementById('toast').textContent,
    跳回到第几题: document.getElementById('qIdx').textContent,
    停留在: document.querySelector('.screen.active').id
  }));

  /* ---------- 7. 补答后提交 → 结算 → 结果页 ---------- */
  await page.evaluate(() => { window.JH.state.answers[5] = 0; window.JH.state.idx = window.JH.state.round.length - 2; });
  await page.click('#btnNext');
  await sleep(250);
  const beforeSubmit = await page.evaluate(() => document.getElementById('btnNext').textContent);
  await page.click('#btnNext');
  await sleep(300);
  const loading = await page.evaluate(() => document.getElementById('loading').classList.contains('show'));
  await sleep(1600);

  const result = await page.evaluate(() => {
    const r = window.JH.state.result;
    return {
      屏幕: document.querySelector('.screen.active').id,
      身份: r.identity.name,
      排名组合: r.rank,
      契合度: r.fit,
      页面显示分值: document.getElementById('fitVal').textContent,
      三维原始分: r.raw,
      三维百分比: r.pct,
      答题总分: r.total + ' / 上限 ' + r.max,
      令牌上的字: [...document.querySelectorAll('#token text')].map(t => t.textContent).join(''),
      签文: document.getElementById('digest').textContent,
      人格侧写: document.getElementById('profile').textContent.slice(0, 18) + '…',
      同门比例: document.getElementById('same').textContent,
      属性条: [...document.querySelectorAll('#attrs .attr')].map(a =>
        a.querySelector('.an').textContent.trim() + '=' + a.querySelector('.av').textContent),
      横向溢出: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  await sleep(700);
  await page.screenshot({ path: path.join(OUT, '04-result-375.png'), fullPage: true });

  /* ---------- 8. 再测一次 → 换一批题 ---------- */
  const reroll = await page.evaluate(async () => {
    const before = window.JH.state.round.map(q => q.id).join(',');
    document.getElementById('btnAgain').click();
    await new Promise(r => setTimeout(r, 300));
    const after = window.JH.state.round.map(q => q.id).join(',');
    const b = new Set(before.split(',')), a = after.split(',');
    return {
      题目是否变化: before !== after,
      新一轮题号数: a.length,
      新一轮轮内去重: new Set(a).size === a.length,
      与上一轮重合题数: a.filter(id => b.has(id)).length,
      回到: document.querySelector('.screen.active').id,
      进度清零: document.getElementById('tally').textContent,
      印章清空: document.querySelectorAll('#stamps i.on').length
    };
  });

  /* ---------- 9. 多宽度不溢出 ---------- */
  const overflow = {};
  for (const w of [320, 360, 390, 414, 480]) {
    await page.setViewport({ width: w, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await sleep(250);
    overflow[w + 'px'] = await page.evaluate(() => ({
      横向溢出: document.documentElement.scrollWidth - document.documentElement.clientWidth
    }));
  }

  /* ---------- 10. 结果页在 390×844 再拍一张 ---------- */
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.evaluate(() => {
    document.getElementById('btnAgain').click();
    const S = window.JH.state;
    S.answers = S.answers.map(() => 0);
    document.getElementById('btnNext').click();
    S.idx = S.round.length - 1;
  });
  await sleep(2600);
  await page.evaluate(() => { if (document.querySelector('.screen.active').id !== 'scResult') document.getElementById('btnNext').click(); });
  await sleep(1800);
  await page.screenshot({ path: path.join(OUT, '05-result-390.png'), fullPage: true });

  console.log('=== 1. 抽题统计 ==='); console.log(JSON.stringify(drawStat, null, 1));
  console.log('=== 2. 计分不变量 ==='); console.log(JSON.stringify(invariant, null, 1));
  console.log('=== 3. 首屏→题目页 ==='); console.log(JSON.stringify(q1, null, 1));
  console.log('=== 4. 作答第一题 ==='); console.log(JSON.stringify(afterFirst, null, 1));
  console.log('=== 5. 答完 16 题 ==='); console.log(JSON.stringify(lastQ, null, 1));
  console.log('=== 6. 未答完提交拦截 ==='); console.log(JSON.stringify(guard, null, 1));
  console.log('=== 7-1. 提交前按钮 ==='); console.log(beforeSubmit);
  console.log('=== 7-2. 结算遮罩 ==='); console.log(loading);
  console.log('=== 7-3. 结果页 ==='); console.log(JSON.stringify(result, null, 1));
  console.log('=== 8. 再测一次 ==='); console.log(JSON.stringify(reroll, null, 1));
  console.log('=== 9. 宽度适配 ==='); console.log(JSON.stringify(overflow, null, 1));
  console.log('=== 页面错误 ==='); console.log(errs.length ? errs : '无');

  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
