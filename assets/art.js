/* ============================================================
 * 资源层 · 场景线描
 * ------------------------------------------------------------
 * 8 张古风情景线描，viewBox 统一 300 × 132，与题目页插图区等比。
 * 全部为内联 SVG，无外部素材依赖、无版权风险。
 *
 * 这 8 张是【占位示意】，正式上线时替换为古风动态漫既有关键帧
 * （横版裁 300×132）——只需替换本文件里对应的字符串，
 * 引擎与题库都不需要改动。
 * ============================================================ */
(function () {
  var INK = '#2A2622', MUTE = '#B6AB9C', CIN = '#B93A32', LINE = '#D9C9A8';

  // 包 svg 外壳并铺地面基线，保证 8 张图底部对齐
  function ground(g) {
    return '<svg viewBox="0 0 300 132" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' +
      '<path d="M10 131 L290 131" stroke="' + LINE + '" stroke-width="1"/>' + (g || '') + '</svg>';
  }

  window.JH_ART = {

    /* 客栈 · 正脊、挑檐、檐下的门与灯笼 */
    kezhan: ground(
      '<path d="M4 76 Q44 60 82 72 Q120 84 152 70 Q186 56 220 70 Q256 84 296 68" fill="none" stroke="' + MUTE + '" stroke-width=".9" opacity=".5"/>' +
      // 两坡与上翘的檐角
      '<path d="M96 50 C82 62 54 76 24 86" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M204 50 C218 62 246 76 276 86" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M24 86 Q15 89 11 82" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M276 86 Q285 89 289 82" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>' +
      // 正脊与脊饰
      '<path d="M96 50 L204 50" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M96 50 L91 43 M204 50 L209 43" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' +
      // 瓦垄
      '<path d="M78 62 C58 74 42 80 28 86" fill="none" stroke="' + INK + '" stroke-width=".7" opacity=".28"/>' +
      '<path d="M222 62 C242 74 258 80 272 86" fill="none" stroke="' + INK + '" stroke-width=".7" opacity=".28"/>' +
      // 檐下线与柱
      '<path d="M24 91 L276 91" stroke="' + INK + '" stroke-width="1" opacity=".28"/>' +
      '<path d="M60 91 L60 128 M240 91 L240 128" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>' +
      // 门
      '<rect x="135" y="95" width="30" height="33" fill="none" stroke="' + INK + '" stroke-width="1.2" opacity=".5"/>' +
      '<path d="M150 95 L150 128" stroke="' + INK + '" stroke-width=".9" opacity=".38"/>' +
      // 灯笼
      '<path d="M222 91 L222 97" stroke="' + INK + '" stroke-width="1"/>' +
      '<ellipse cx="222" cy="108" rx="8" ry="11" fill="' + CIN + '" opacity=".9"/>' +
      '<ellipse cx="222" cy="108" rx="2.6" ry="11" fill="#F5EFE4" opacity=".2"/>' +
      '<path d="M222 119 L222 124" stroke="' + INK + '" stroke-width="1"/>' +
      // 檐下人
      '<g fill="' + INK + '" opacity=".72">' +
      '<circle cx="92" cy="112" r="5"/><path d="M83.5 118 L100.5 118 L98 128 L86 128 Z"/>' +
      '<circle cx="176" cy="110" r="5.2"/><path d="M167 116 L185 116 L182.5 128 L169.5 128 Z"/></g>'
    ),

    /* 驿站 · 旗杆、马厩、一匹侧身站立的驿马 */
    yizhan: ground(
      // 旗杆与旗
      '<path d="M30 128 L30 34" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M30 38 Q60 30 88 40 L84 58 Q56 48 30 56 Z" fill="' + CIN + '" opacity=".88"/>' +
      '<path d="M42 43 Q62 37 78 45" stroke="#F5EFE4" stroke-width="1" fill="none" opacity=".38"/>' +
      '<circle cx="30" cy="32" r="2.6" fill="' + INK + '" opacity=".7"/>' +
      // 马厩
      '<path d="M108 128 L108 96 L196 96 L196 128" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M100 96 L152 74 L204 96" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M124 96 L124 128 M180 96 L180 128" stroke="' + INK + '" stroke-width="1" opacity=".35"/>' +
      // 驿马（侧身）
      '<ellipse cx="238" cy="94" rx="23" ry="11" fill="' + INK + '" opacity=".86"/>' +
      '<path d="M222 86 L212 70 L222 65 L232 84 Z" fill="' + INK + '" opacity=".86"/>' +
      '<path d="M210 68 L200 74 L202 81 L213 77 Z" fill="' + INK + '" opacity=".86"/>' +
      '<path d="M211 65 L208 57 L214 60 Z" fill="' + INK + '" opacity=".86"/>' +
      '<path d="M222 66 Q216 60 210 61" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".86"/>' +
      '<g fill="' + INK + '" opacity=".86">' +
      '<rect x="222" y="102" width="4.6" height="26" rx="1.4"/>' +
      '<rect x="232" y="102" width="4.6" height="26" rx="1.4"/>' +
      '<rect x="244" y="102" width="4.6" height="26" rx="1.4"/>' +
      '<rect x="252" y="102" width="4.6" height="26" rx="1.4"/></g>' +
      '<path d="M258 86 Q268 94 266 116" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".86"/>' +
      '<path d="M216 124 Q238 118 264 124" fill="none" stroke="' + MUTE + '" stroke-width=".9" opacity=".55"/>'
    ),

    /* 山路 · 松与远山 */
    shanlu: ground(
      '<path d="M4 62 Q46 22 92 48 Q134 70 176 40 Q216 12 296 56" fill="none" stroke="' + MUTE + '" stroke-width="1.1" opacity=".6"/>' +
      '<path d="M2 74 Q60 52 120 66 Q186 82 296 62" fill="none" stroke="' + MUTE + '" stroke-width=".8" opacity=".35"/>' +
      '<path d="M74 128 L74 96" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M74 50 L98 84 L50 84 Z" fill="none" stroke="' + INK + '" stroke-width="1.9" stroke-linejoin="round"/>' +
      '<path d="M74 66 L102 104 L46 104 Z" fill="none" stroke="' + INK + '" stroke-width="1.9" stroke-linejoin="round"/>' +
      '<path d="M74 84 L106 124 L42 124 Z" fill="none" stroke="' + INK + '" stroke-width="1.9" stroke-linejoin="round"/>' +
      '<path d="M212 128 L212 104" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M212 76 L232 104 L192 104 Z" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M212 94 L234 126 L190 126 Z" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M132 131 Q150 112 168 100 Q186 90 202 84" fill="none" stroke="' + INK + '" stroke-width="1" opacity=".38" stroke-dasharray="3 4"/>'
    ),

    /* 渡口 · 渡船与水面 */
    dukou: ground(
      '<path d="M20 106 Q44 94 74 98 Q110 103 138 96" fill="none" stroke="' + MUTE + '" stroke-width=".9" opacity=".6"/>' +
      '<path d="M176 98 Q216 90 248 98 Q268 103 286 97" fill="none" stroke="' + MUTE + '" stroke-width=".9" opacity=".6"/>' +
      // 船身
      '<path d="M104 104 Q150 122 208 104 Q186 112 156 112 Q128 112 104 104 Z" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M112 104 Q156 97 200 104" fill="none" stroke="' + INK + '" stroke-width=".8" opacity=".28"/>' +
      // 桅与帆
      '<path d="M156 102 L156 40" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M159 48 C186 56 188 74 160 78 Z" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M153 48 C128 56 126 74 152 78 Z" fill="' + CIN + '" opacity=".45"/>' +
      // 船上的人
      '<g fill="' + INK + '" opacity=".72"><circle cx="140" cy="86" r="4.6"/><path d="M132 92 L148 92 L146 104 L134 104 Z"/></g>' +
      // 桨与浮萍
      '<path d="M218 118 L242 106" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M58 120 Q74 114 88 120 Q72 126 58 120 Z" fill="none" stroke="' + MUTE + '" stroke-width="1"/>'
    ),

    /* 账房 · 案上的算盘与账册 */
    zhangfang: ground(
      // 案
      '<path d="M36 128 L36 98 L236 128" fill="none" stroke="' + INK + '" stroke-width="0"/>' +
      '<path d="M36 128 L36 98 L236 98 L236 128" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M26 98 L246 98" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>' +
      // 算盘（立在案上）
      '<rect x="56" y="42" width="104" height="56" rx="5" fill="#FBF7EF" stroke="' + INK + '" stroke-width="1.7"/>' +
      '<path d="M56 70 L160 70" stroke="' + INK + '" stroke-width="1.4"/>' +
      '<g fill="' + INK + '" opacity=".8">' +
      '<circle cx="74" cy="56" r="4.4"/><circle cx="90" cy="56" r="4.4"/><circle cx="106" cy="56" r="4.4"/>' +
      '<circle cx="122" cy="56" r="4.4"/><circle cx="138" cy="56" r="4.4"/>' +
      '<circle cx="74" cy="84" r="4.4"/><circle cx="90" cy="84" r="4.4"/>' +
      '<rect x="104" y="79" width="9" height="10" rx="2"/><rect x="120" y="79" width="9" height="10" rx="2"/>' +
      '<circle cx="142" cy="84" r="4.4"/></g>' +
      // 账册（斜放案上）
      '<g transform="rotate(-6 214 84)">' +
      '<rect x="186" y="68" width="56" height="30" rx="3" fill="#FBF7EF" stroke="' + INK + '" stroke-width="1.7"/>' +
      '<path d="M193 90 L236 90 M193 82 L228 82" stroke="' + INK + '" stroke-width="1" opacity=".45"/>' +
      '<path d="M193 73 L238 73" stroke="' + CIN + '" stroke-width="2" stroke-linecap="round" opacity=".85"/>' +
      '</g>' +
      // 毛笔搁在案上
      '<path d="M170 108 L200 104" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M200 104 L206 103 L204 108 Z" fill="' + INK + '" opacity=".8"/>'
    ),

    /* 市集 · 幌子、摊位与买客 */
    shiji: ground(
      '<path d="M28 128 L28 30" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M28 34 L74 34" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M46 34 L46 84 L64 84 L64 34 Z" fill="' + CIN + '" opacity=".8"/>' +
      '<path d="M50 46 L60 46 M50 56 L60 56 M50 66 L60 66" stroke="#F5EFE4" stroke-width="1.4" opacity=".45"/>' +
      '<path d="M96 128 L96 92 L244 128" fill="none" stroke="' + INK + '" stroke-width="0"/>' +
      '<path d="M96 128 L96 92 L244 92 L244 128" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M88 92 L170 72 L252 92" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      // 货架上的货
      '<path d="M112 92 L112 106 L138 106 L138 92" fill="none" stroke="' + INK + '" stroke-width="1.1" opacity=".45"/>' +
      '<path d="M202 92 L202 104 L228 104 L228 92" fill="none" stroke="' + INK + '" stroke-width="1.1" opacity=".45"/>' +
      '<g fill="' + INK + '" opacity=".3">' +
      '<circle cx="120" cy="99" r="2.6"/><circle cx="130" cy="99" r="2.6"/>' +
      '<circle cx="210" cy="98" r="2.6"/><circle cx="220" cy="98" r="2.6"/></g>' +
      // 摊前的买客
      '<g fill="' + INK + '" opacity=".75">' +
      '<circle cx="132" cy="110" r="5"/><path d="M123 116 L141 116 L138 128 L126 128 Z"/>' +
      '<circle cx="170" cy="106" r="5.4"/><path d="M161 112 L179 112 L176 128 L164 128 Z"/>' +
      '<circle cx="212" cy="110" r="4.6"/><path d="M204 116 L220 116 L217 128 L207 128 Z"/></g>'
    ),

    /* 夜巡 · 月、檐下灯笼与巡夜人 */
    yexun: ground(
      '<circle cx="242" cy="40" r="19" fill="none" stroke="' + MUTE + '" stroke-width="1.2" opacity=".8"/>' +
      '<path d="M232 34 Q242 28 252 34" fill="none" stroke="' + MUTE + '" stroke-width=".8" opacity=".5"/>' +
      '<path d="M6 100 Q52 86 96 96 Q130 103 156 94" fill="none" stroke="' + MUTE + '" stroke-width=".8" opacity=".38"/>' +
      // 墙与屋檐
      '<path d="M172 96 L214 78 L256 96" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M180 96 L180 128 M248 96 L248 128" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M214 96 L214 128" stroke="' + INK + '" stroke-width="1" opacity=".35"/>' +
      '<path d="M180 96 L248 96" stroke="' + INK + '" stroke-width="1" opacity=".3"/>' +
      // 檐下挂的灯笼
      '<path d="M196 96 L196 104" stroke="' + INK + '" stroke-width="1.1"/>' +
      '<path d="M188 104 L204 104 L201 122 L191 122 Z" fill="' + CIN + '" opacity=".85"/>' +
      '<path d="M191 113 L201 113" stroke="#F5EFE4" stroke-width="1" opacity=".4"/>' +
      '<path d="M196 122 L196 127" stroke="' + INK + '" stroke-width="1.1"/>' +
      // 巡夜的人
      '<g fill="' + INK + '" opacity=".82">' +
      '<circle cx="104" cy="100" r="5.6"/><path d="M94.5 106 L113.5 106 L110.5 128 L97.5 128 Z"/></g>' +
      // 手里提的灯笼
      '<path d="M116 110 L130 106" stroke="' + INK + '" stroke-width="1.3"/>' +
      '<path d="M126 98 L140 98 L138 113 L128 113 Z" fill="' + CIN + '" opacity=".7"/>' +
      '<path d="M133 113 L133 118" stroke="' + INK + '" stroke-width="1"/>'
    ),

    /* 书房 · 窗、案与文房 */
    shufang: ground(
      // 窗
      '<rect x="52" y="16" width="112" height="62" rx="2" fill="none" stroke="' + INK + '" stroke-width="1.5" opacity=".5"/>' +
      '<path d="M108 16 L108 78 M52 47 L164 47" stroke="' + INK + '" stroke-width="1.1" opacity=".35"/>' +
      // 案
      '<path d="M30 128 L30 96 L250 96 L250 128" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M22 96 L258 96" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>' +
      // 笔筒与笔
      '<rect x="166" y="80" width="42" height="16" rx="3" fill="none" stroke="' + INK + '" stroke-width="1.5"/>' +
      '<g stroke="' + INK + '" stroke-width="1.7" stroke-linecap="round">' +
      '<path d="M176 80 L176 58"/><path d="M188 80 L188 52"/><path d="M200 80 L200 60"/></g>' +
      // 砚
      '<path d="M54 86 L92 86 L88 96 L58 96 Z" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linejoin="round"/>' +
      // 摊开的纸
      '<g transform="rotate(-3 128 88)">' +
      '<rect x="104" y="78" width="52" height="18" rx="1.5" fill="#FBF7EF" stroke="' + INK + '" stroke-width="1.3"/>' +
      '<path d="M110 85 L148 85 M110 91 L140 91" stroke="' + INK + '" stroke-width=".9" opacity=".45"/></g>' +
      // 纸上压的一行朱砂
      '<path d="M112 74 L152 73" stroke="' + CIN + '" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>'
    )
  };
})();
