/* ============================================================
 * 引擎层 · 答题引擎
 * ------------------------------------------------------------
 * 这一层与内容无关，换一期只需要改 assets/data/ 下的三个配置。
 *
 * 职责：
 *   1. 抽题：从题库随机抽取 drawCount 题，保证同一轮内不重复
 *   2. 计分：三维累加 → 百分比 → 排名唯一映射身份
 *   3. 渲染：首屏 / 题目页 / 结算 / 结果页四屏
 *   4. 反馈：落印动效、选项反馈、提交校验、得分揭晓动画
 *   5. 音效：WebAudio 现场合成，零音频文件，默认静音
 * ============================================================ */
(function () {
  'use strict';

  var META = window.JH_META;
  var BANK = window.JH_QUESTIONS;
  var DIMS = window.JH_DIMS;
  var IDS = window.JH_IDENTITIES;
  var ART = window.JH_ART;

  /* ---------------- 抽题：洗牌后截取，天然不重复 ---------------- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function drawRound() {
    var n = Math.min(META.drawCount, BANK.length);
    var picked = shuffle(BANK).slice(0, n);
    // 防御：万一题库里出现重复 id，按 id 去重后补抽
    var seen = {}, uniq = [];
    picked.forEach(function (q) { if (!seen[q.id]) { seen[q.id] = 1; uniq.push(q); } });
    if (uniq.length < n) {
      shuffle(BANK).forEach(function (q) {
        if (uniq.length < n && !seen[q.id]) { seen[q.id] = 1; uniq.push(q); }
      });
    }
    // 展开成本轮实例（选项可独立打乱，不影响题目本身）
    return uniq.map(function (q) {
      var opts = q.opts.map(function (o, i) { return { t: o.t, s: o.s, k: i }; });
      if (META.shuffleOptions) opts = shuffle(opts);
      return { id: q.id, art: q.art, scene: q.scene, opts: opts };
    });
  }

  /* ---------------- 计分：三维排名唯一决定身份 ---------------- */
  function computeResult(round, answers) {
    var raw = {}, max = round.length * META.pointsPerQuestion, total = 0;
    DIMS.forEach(function (d) { raw[d.k] = 0; });
    round.forEach(function (q, i) {
      var ai = answers[i];
      if (ai === null || ai === undefined) return;
      var s = q.opts[ai].s;
      DIMS.forEach(function (d) { raw[d.k] += (s[d.k] || 0); });
      total += META.pointsPerQuestion;
    });

    // 每维在本轮的理论上限：逐题取该维的最高可得值再累加。
    // 用它当分母，契合度才对每一轮、每一维都公平：
    // 答题倾向明确的人接近上限，随手点的人落在中段。
    var dimMax = {};
    DIMS.forEach(function (d) { dimMax[d.k] = 0; });
    round.forEach(function (q) {
      DIMS.forEach(function (d) {
        var m = 0;
        q.opts.forEach(function (o) { if ((o.s[d.k] || 0) > m) { m = o.s[d.k] || 0; } });
        dimMax[d.k] += m;
      });
    });

    var pct = {}, fitPct = {};
    DIMS.forEach(function (d) {
      pct[d.k] = total ? Math.round(raw[d.k] / max * 100) : 0;
      fitPct[d.k] = dimMax[d.k] ? Math.round(raw[d.k] / dimMax[d.k] * 100) : 0;
    });

    // 并列时按 义 > 机 > 耐 的固定次序打破，保证同分必出同结果
    var order = DIMS.slice().sort(function (a, b) {
      if (fitPct[b.k] !== fitPct[a.k]) return fitPct[b.k] - fitPct[a.k];
      return DIMS.indexOf(a) - DIMS.indexOf(b);
    });
    var rank = order.map(function (d) { return d.k; }).join('>');

    var identity = null;
    for (var key in IDS) { if (IDS[key].rank === rank) { identity = IDS[key]; identity.key = key; break; } }

    /* 契合度：把"主修浓度"映射到 30~98 的友好区间。
       下锚点是完全均衡（三维各占 1/3，等于没有倾向），
       上锚点是本轮理论上限（主修维逐题取最高可得值），上下锚点都随
       本轮抽到的题自动计算，因此换题库、改抽题数都不需要重调。 */
    var evenPct = 100 / DIMS.length;
    var maxTopPct = max ? (dimMax[order[0].k] / max * 100) : evenPct;
    var span = maxTopPct - evenPct;
    var fit = span > 0
      ? Math.round(30 + (pct[order[0].k] - evenPct) / span * 68)
      : Math.round(pct[order[0].k]);
    fit = Math.max(30, Math.min(98, fit));

    return { raw: raw, pct: pct, fitPct: fitPct, dimMax: dimMax,
             rank: rank, identity: identity,
             main: order[0], second: order[1], fit: fit,
             total: total, max: max,
             answered: answers.filter(function (a) { return a !== null && a !== undefined; }).length };
  }

  /* ---------------- 音效：现场合成，无音频文件 ---------------- */
  var audio = { on: false, ctx: null };
  function beep(freq, dur, gain) {
    if (!audio.on) return;
    try {
      if (!audio.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audio.ctx = new AC();
      }
      var c = audio.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.linearRampToValueAtTime(gain || 0.05, c.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (dur || 0.12));
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + (dur || 0.12) + 0.02);
    } catch (e) { /* 静默降级：音效失败不影响玩法 */ }
  }
  function toggleSound() {
    audio.on = !audio.on;
    ['btnSound', 'btnSound2'].forEach(function (id) {
      var el = $(id);
      if (el) { el.classList.toggle('off', !audio.on); }
    });
    if (audio.on) beep(660, 0.09, 0.04);
  }

  /* ---------------- DOM 小工具 ---------------- */
  function $(id) { return document.getElementById(id); }
  var PUNCT = /([，。、；：？！「」《》])/g;
  function punctHTML(text) {
    return text.replace(PUNCT, '<span class="punct">$1</span>');
  }
  var CN = ['一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十'];
  function cn(n) { return CN[n - 1] || String(n); }

  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  /* ---------------- 状态 ---------------- */
  var S = { round: [], answers: [], idx: 0, result: null, busy: false };

  /* ---------------- 屏切换 ---------------- */
  function go(name) {
    ['scEntry', 'scQuiz', 'scResult'].forEach(function (id) {
      $(id).classList.toggle('active', id === 'sc' + name.charAt(0).toUpperCase() + name.slice(1));
    });
    window.scrollTo(0, 0);
  }

  /* ---------------- 开局 ---------------- */
  function start() {
    S.round = drawRound();
    S.answers = new Array(S.round.length).fill(null);
    S.idx = 0;
    S.result = null;
    S.busy = false;
    buildStamps();
    renderQuestion(false);
    go('quiz');
  }

  /* ---------------- 进度印章 ---------------- */
  function buildStamps() {
    var box = $('stamps');
    box.innerHTML = '';
    S.round.forEach(function () {
      var i = document.createElement('i');
      box.appendChild(i);
    });
    paintStamps();
  }
  function paintStamps() {
    var kids = $('stamps').children;
    for (var i = 0; i < kids.length; i++) {
      var done = S.answers[i] !== null;
      kids[i].classList.toggle('on', done);
      kids[i].classList.toggle('cur', i === S.idx);
    }
    var done = S.answers.filter(function (a) { return a !== null; }).length;
    $('tally').textContent = done;
  }

  /* ---------------- 题目页 ---------------- */
  function renderQuestion(animate) {
    var q = S.round[S.idx];
    if (animate === undefined) animate = true;

    $('qIdx').textContent = cn(S.idx + 1);
    $('qTotal').textContent = cn(S.round.length);

    var card = $('qCard');
    // 插图（换题时用 key 触发重放）
    $('illus').innerHTML = ART[q.art] || '';
    $('scene').innerHTML = punctHTML(q.scene);

    var opts = $('opts');
    opts.innerHTML = '';
    q.opts.forEach(function (o, i) {
      var el = document.createElement('div');
      el.className = 'opt' + (S.answers[S.idx] === i ? ' sel' : '');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.innerHTML = '<span class="idx">' + '甲乙丙'[i] + '</span><span class="txt">' + o.t + '</span>';
      el.addEventListener('click', function () { choose(i); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(i); }
      });
      opts.appendChild(el);
    });

    // 底部按钮文案
    var last = S.idx === S.round.length - 1;
    $('btnNext').textContent = last ? '提交' : '下一题';
    $('btnNext').classList.toggle('is-submit', last);
    $('btnPrev').disabled = S.idx === 0;

    if (animate) {
      card.classList.remove('slide');
      void card.offsetWidth;
      card.classList.add('slide');
    }
    paintStamps();
    card.scrollTop = 0;
  }

  function choose(i) {
    S.answers[S.idx] = i;
    beep(520 + i * 60, 0.1, 0.045);
    var els = $('opts').children;
    for (var k = 0; k < els.length; k++) els[k].classList.toggle('sel', k === i);
    paintStamps();
    // 自动前进：最后一题停留，等用户主动提交
    if (S.idx < S.round.length - 1) {
      setTimeout(function () { if (S.answers[S.idx] === i) next(); }, 240);
    }
  }

  function next() {
    if (S.idx >= S.round.length - 1) { submit(); return; }
    S.idx++; renderQuestion(true);
  }
  function prev() {
    if (S.idx === 0) return;
    S.idx--; renderQuestion(true);
  }

  /* ---------------- 提交与得分反馈 ---------------- */
  function submit() {
    if (S.busy) return;
    var miss = [];
    S.answers.forEach(function (a, i) { if (a === null) miss.push(i); });
    if (miss.length) {
      S.idx = miss[0];
      renderQuestion(true);
      toast(META.submitTips.incomplete.replace('{n}', miss.length));
      return;
    }
    S.busy = true;
    $('btnNext').disabled = true;
    $('loading').classList.add('show');
    setTimeout(function () {
      S.result = computeResult(S.round, S.answers);
      $('loading').classList.remove('show');
      $('btnNext').disabled = false;
      S.busy = false;
      renderResult();
      go('result');
    }, 900);
  }

  /* ---------------- 结果页 ---------------- */
  function tokenSVG(name, sealChar) {
    var C = 164, cfg = {
      2: { fs: 44, sp: 58 }, 3: { fs: 32, sp: 40 }, 4: { fs: 28, sp: 34 }
    }[name.length] || { fs: 26, sp: 32 };
    var n = name.length, lines = '';
    for (var i = 0; i < n; i++) {
      var y = C + (i - (n - 1) / 2) * cfg.sp + cfg.fs * 0.35;
      lines += '<text x="100" y="' + y.toFixed(1) + '">' + name.charAt(i) + '</text>';
    }
    return '<svg viewBox="0 0 200 268" xmlns="http://www.w3.org/2000/svg" aria-label="' + name + '">' +
      '<defs><linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#B98A56"/><stop offset=".45" stop-color="#A87B4A"/>' +
      '<stop offset="1" stop-color="#8E6338"/></linearGradient></defs>' +
      '<rect x="26" y="12" width="148" height="244" rx="20" fill="url(#wood)"/>' +
      '<rect x="26" y="12" width="148" height="244" rx="20" fill="none" stroke="#7A5230" stroke-width="1.4"/>' +
      '<g stroke="#7A5230" stroke-width=".7" opacity=".45" fill="none">' +
      '<path d="M34 60 Q100 52 166 62"/><path d="M34 146 Q100 154 166 144"/><path d="M34 214 Q100 206 166 216"/></g>' +
      '<circle cx="100" cy="38" r="9" fill="#F1EEE8"/>' +
      '<circle cx="100" cy="38" r="9" fill="none" stroke="#7A5230" stroke-width="1.2"/>' +
      '<rect x="42" y="88" width="116" height="152" rx="10" fill="none" stroke="#F5EFE4" stroke-width="1.6" opacity=".6"/>' +
      '<g fill="#FBF7EF" font-family="\'Songti SC\',\'SimSun\',serif" font-size="' + cfg.fs +
      '" font-weight="600" text-anchor="middle">' + lines + '</g>' +
      '<g transform="translate(134,204)"><rect x="0" y="0" width="24" height="24" rx="4" fill="#B93A32"/>' +
      '<rect x="2.5" y="2.5" width="19" height="19" rx="2.5" fill="none" stroke="#F5EFE4" stroke-width="1" opacity=".45"/>' +
      '<text x="12" y="17.5" font-family="\'Songti SC\',\'SimSun\',serif" font-size="11" fill="#F5EFE4" text-anchor="middle">' +
      sealChar + '</text></g></svg>';
  }

  function pickDigest(id) {
    var pool = [id.digest].concat(id.altDigests || []);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function renderResult() {
    var r = S.result, id = r.identity;
    if (!id) { toast('结果映射缺失，请检查配置'); return; }

    $('token').innerHTML = tokenSVG(id.name, id.seal);
    $('digest').innerHTML = punctHTML(pickDigest(id)).replace(/\n/g, '<br>');
    $('profile').textContent = id.profile;
    $('same').innerHTML = '<b>' + id.same + '%</b> 的江湖人与你同门';
    $('fitLabel').textContent = r.main.name + ' · 江湖契合度';

    // 得分揭晓：数字滚动
    var el = $('fitVal'), target = r.fit, t0 = null, DUR = 720;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / DUR);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e);
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);

    // 三维条：从 0 长到目标值，逐条延迟
    var box = $('attrs');
    box.innerHTML = '';
    DIMS.forEach(function (d, i) {
      var row = document.createElement('div');
      row.className = 'attr';
      row.innerHTML = '<span class="an">' + d.name + '</span>' +
        '<span class="track"><i style="width:0"></i></span>' +
        '<span class="av">0</span>';
      box.appendChild(row);
      setTimeout(function () {
        row.querySelector('i').style.width = r.pct[d.k] + '%';
        row.querySelector('.av').textContent = r.pct[d.k];
      }, 120 * i + 60);
    });

    // 令牌揭晓动效
    var tw = $('token');
    tw.classList.remove('reveal');
    void tw.offsetWidth;
    tw.classList.add('reveal');
    beep(392, 0.16, 0.05);
    setTimeout(function () { beep(587, 0.2, 0.045); }, 130);
  }

  /* ---------------- 对外接口（也被自测脚本调用） ---------------- */
  window.JH = {
    start: start, drawRound: drawRound, computeResult: computeResult,
    get state() { return S; },
    get bankSize() { return BANK.length; }
  };

  /* ---------------- 绑定 ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    // 任一 id 缺失都不应中断后续绑定
    function set(id, text, asHTML) {
      var el = $(id);
      if (!el) { return; }
      if (asHTML) { el.innerHTML = text; } else { el.textContent = text; }
    }
    function on(id, fn) { var el = $(id); if (el) { el.addEventListener('click', fn); } }

    document.title = META.title + ' · 你在江湖里是什么角色';
    set('brand', META.brand);
    set('headline', META.headline, true);
    set('sub', META.sub);
    set('cta', META.cta);
    set('discEntry', META.disclaimer);
    set('privacy', META.privacy);
    set('bankInfo', '题库 ' + BANK.length + ' 题 · 每轮随机抽 ' + META.drawCount + ' 题 · 题目不重复');
    set('discResult', META.disclaimer);
    set('tallyTotal', META.drawCount);
    set('qTotal', cn(META.drawCount));

    on('cta', start);
    on('btnNext', next);
    on('btnPrev', prev);
    on('btnAgain', start);
    on('btnSound', toggleSound);
    on('btnSound2', toggleSound);
    on('btnExit', function () { go('entry'); });

    document.addEventListener('keydown', function (e) {
      if (!$('scQuiz').classList.contains('active')) return;
      var map = { '1': 0, '2': 1, '3': 2 };
      if (map[e.key] !== undefined) choose(map[e.key]);
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });
  });
})();
