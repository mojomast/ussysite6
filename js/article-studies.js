/** Native SVG conceptual studies. No animation, telemetry, or external assets. */
const mounted = new WeakMap();
let instance = 0;
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const text = (s, x, y, size = 14, fill = '#e5e8de', extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${escape(s)}</text>`;
const rect = (x, y, w, h, fill, r = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
const circle = (x, y, r, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const path = (d, stroke, width = 1, extra = '') => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
const states = {
  cocs: [
    ['PREDICT', 'Client prediction places a conceptual position before server confirmation.'],
    ['COMPARE', 'A server position is compared with the predicted position.'],
    ['RECONCILE', 'Reconciliation corrects the illustrative difference against server authority.'],
    ['ALIGNED', 'The drawn positions agree. This is a conceptual study, not game telemetry.']
  ],
  rgbagentflightindicator: [
    ['WORKING', 'Default palette: green indicates work in progress.'],
    ['ATTENTION', 'Default palette: red calls for attention; shown as a still light here.'],
    ['DONE', 'Default palette: white indicates completion.'],
    ['IDLE', 'Default palette: dark indicates idle.']
  ],
  warpi: [
    ['CHOOSE PROVIDER', 'BYOK request study: choose the provider, endpoint, and model.'],
    ['CREDENTIAL REFERENCE', 'Settings reference a credential; the secret is resolved from the operating-system store.'],
    ['PI SOFTWARE HELPER', 'The supervised Pi agent software helper exchanges messages over stdio.'],
    ['CONFIGURED API', 'The request goes to the configured API endpoint. The terminal UI is upstream Warp.']
  ],
  hermesdashboard: [
    ['FILES', 'Explore file resources and their session links in this illustrative resource graph.'],
    ['TOOLS', 'Explore tool resources and their session links in this illustrative resource graph.'],
    ['MODELS', 'Explore model resources and their session links in this illustrative resource graph.'],
    ['OVERVIEW', 'Explore files, tools, and models together. These are conceptual links, not a live session.']
  ],
  becomussy: [
    ['AUTOBIOGRAPHICAL', 'Typed memory study: autobiographical memory concerns personal history.'],
    ['RELATIONAL', 'Typed memory study: relational memory concerns relationships.'],
    ['SEMANTIC', 'Typed memory study: semantic memory concerns knowledge.'],
    ['EPISODIC', 'Typed memory study: episodic memory concerns events and experiences.'],
    ['WORKING', 'Typed memory study: working memory concerns active context.']
  ]
};

function materials(p) {
  const linear = (id, stops, extra = '') => `<linearGradient id="${p}-${id}" x2="${id === 'metal' ? '100%' : '25%'}" y2="100%" ${extra}>${stops.map(([at, c]) => `<stop offset="${at}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  return `<defs>
    ${linear('table', [['0%', '#39433e'], ['45%', '#232e29'], ['100%', '#111d19']])}
    ${linear('metal', [['0%', '#f2eddb'], ['18%', '#a4aea2'], ['40%', '#e5e4cf'], ['53%', '#788879'], ['75%', '#c5cabb'], ['100%', '#53665a']])}
    ${linear('body', [['0%', '#758174'], ['8%', '#a1aa97'], ['12%', '#505f54'], ['80%', '#25382f'], ['100%', '#13271f']])}
    ${linear('ivory', [['0%', '#fff2cf'], ['48%', '#d5ccb0'], ['100%', '#9c9e83']])}
    ${linear('brass', [['0%', '#f4dba2'], ['22%', '#a1773c'], ['45%', '#efcc83'], ['70%', '#b69556'], ['100%', '#6c4e2b']])}
    ${linear('cap', [['0%', '#a4aea0'], ['15%', '#65766b'], ['65%', '#3b5045'], ['100%', '#142d21']])}
    ${linear('keytop', [['0%', '#30493d'], ['50%', '#50675a'], ['100%', '#6b7d6b']])}
    ${linear('glass', [['0%', '#243f37'], ['50%', '#102b24'], ['100%', '#061a16']])}
    <linearGradient id="${p}-reflection" x2="85%" y2="100%"><stop stop-color="#fffce4" stop-opacity=".24"/><stop offset=".4" stop-color="#fffce4" stop-opacity=".035"/><stop offset="1" stop-color="#fffce4" stop-opacity="0"/></linearGradient>
    <radialGradient id="${p}-lens" cx="33%" cy="25%"><stop stop-color="#fffbe0"/><stop offset=".17" stop-color="#b7d8a6"/><stop offset=".55" stop-color="#547d5f"/><stop offset="1" stop-color="#183f2b"/></radialGradient>
    <filter id="${p}-shadow" x="-25%" y="-30%" width="150%" height="170%"><feDropShadow dx="0" dy="9" stdDeviation="7" flood-color="#020e09" flood-opacity=".6"/></filter>
    <filter id="${p}-soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>
    <pattern id="${p}-grain" width="7" height="5" patternUnits="userSpaceOnUse"><path d="M0 1H5 M2 4H7" stroke="#ffffdc" stroke-opacity=".035" stroke-width=".6"/></pattern>
  </defs>`;
}

function screw(x, y, u) {
  return circle(x, y + 1, 5, '#10251b') + circle(x, y, 4, u('metal')) + path(`M${x - 2} ${y + 2}l4 -4`, '#334c3e', 1.5);
}

function frame(p, title, state, body, description) {
  const u = (id) => `url(#${p}-${id})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360" role="img" aria-labelledby="${p}-title ${p}-desc" style="display:block;width:100%;height:auto;aspect-ratio:16/9;overflow:hidden" font-family="'IBM Plex Mono',ui-monospace,monospace">
    <title id="${p}-title">${escape(title)} — ${escape(state)}. Interactive conceptual study.</title><desc id="${p}-desc">${escape(description)} Activate the study or its step button to explore the next state.</desc>
    ${materials(p)}${rect(0, 0, 640, 360, u('table'))}${rect(0, 0, 640, 360, u('grain'))}
    ${text('Si. / MATERIAL STUDIES', 24, 26, 11, '#c4c9b8')}${text('ILLUSTRATIVE', 616, 26, 11, '#c4c9b8', 'text-anchor="end"')}
    ${body(u)}
    ${text(title, 24, 336, 17, '#eee9d2', 'font-family="Georgia,serif"')}${text(state, 616, 336, 12, '#cccfb7', 'text-anchor="end"')}
  </svg>`;
}

function comparator(p, mode) {
  return frame(p, 'Reconciliation comparator', states.cocs[mode][0], (u) => {
    const px = [218, 252, 291, 314][mode];
    let out = `<g filter="${u('shadow')}">${rect(32, 53, 576, 242, u('body'), 19)}${rect(39, 58, 562, 226, u('metal'), 15)}${rect(49, 67, 542, 207, '#89917d', 11)}${rect(58, 76, 357, 185, '#071b16', 17)}${rect(65, 83, 343, 171, u('glass'), 13)}</g>`;
    for (let i = 0; i < 11; i++) out += path(`M${82 + i * 30} 96V241`, '#799a79', .5, 'opacity=".23"');
    for (let i = 0; i < 5; i++) out += path(`M77 ${110 + i * 29}H396`, '#799a79', .5, 'opacity=".23"');
    out += text('PREDICTED', 83, 113, 12, '#e3bd7d') + text('SERVER', 324, 113, 12, '#b8dab1');
    out += path('M92 202C155 199 170 159 218 165S289 174 351 144', '#668d74', 2);
    out += path(`M${px} 141V213M314 133V219`, '#a1b09a', 1, 'stroke-dasharray="3 5"');
    out += circle(314, 174, 13, u('lens')) + circle(314, 174, 19, 'none', 'stroke="#cde6bb" stroke-width="1.5"');
    out += circle(px, 174, 9, u('brass')) + circle(px - 3, 170, 2, '#ffe9bb');
    if (px < 314) out += path(`M${px + 13} 174H296m-6 -5 6 5 -6 5`, '#ead3a1', 2);
    out += `<path d="M70 91Q70 85 84 85H367L209 251H79Q67 251 67 239Z" fill="${u('reflection')}"/>`;
    out += circle(501, 160, 65, '#253e30') + circle(501, 157, 64, u('brass')) + circle(501, 157, 56, '#e2ddbd') + circle(501, 157, 51, '#273d30');
    for (let i = 0; i < 29; i++) {
      const a = (i / 28 * 270 + 135) * Math.PI / 180;
      out += path(`M${501 + Math.cos(a) * 43} ${157 + Math.sin(a) * 43}L${501 + Math.cos(a) * (i % 4 ? 39 : 35)} ${157 + Math.sin(a) * (i % 4 ? 39 : 35)}`, '#d4ceac', 1);
    }
    out += `<g transform="rotate(${[-55, -20, 30, 65][mode]} 501 157)"><path d="M498 163L501 119 505 163Z" fill="#e8af78"/></g>` + circle(501, 157, 6, u('metal'));
    out += text('POSITION', 501, 183, 10, '#d3d7b9', 'text-anchor="middle"') + text('CONCEPTUAL', 501, 244, 12, '#173727', 'text-anchor="middle"');
    [[47, 72], [592, 72], [47, 270], [592, 270]].forEach(([x, y]) => { out += screw(x, y, u); });
    return out;
  }, states.cocs[mode][1]);
}

function keyboard(p, mode) {
  const light = ['#9cf292', '#f58c72', '#ffffe9', '#263c30'][mode];
  return frame(p, 'A palette at your fingertips', states.rgbagentflightindicator[mode][0], (u) => {
    let out = path('M491 76C536 31 600 37 608 83', '#0c1812', 9) + path('M491 74C536 29 600 35 608 81', '#687366', 3);
    out += `<g filter="${u('shadow')}">${rect(36, 85, 568, 208, '#101e17', 20)}${rect(36, 72, 568, 208, u('metal'), 20)}${rect(45, 80, 550, 189, u('body'), 15)}${rect(57, 96, 526, 157, '#11251b', 8)}</g>`;
    const cap = (x, y, w, legend, lit = false) => {
      let s = rect(x - 1, y + 3, w + 2, 35, '#07190f', 5);
      if (lit) s += rect(x, y + 9, w, 29, light, 5, `opacity=".35" filter="${u('soft')}"`);
      s += rect(x, y, w, 34, u('cap'), 5) + rect(x + 4, y + 3, w - 8, 24, u('keytop'), 4);
      s += path(`M${x + 6} ${y + 26}Q${x + w / 2} ${y + 29} ${x + w - 6} ${y + 26}`, '#a2b09a', .7, 'opacity=".5"');
      return s + text(legend, x + w / 2, y + 20, 12, lit && mode !== 3 ? light : '#d4dbbf', 'text-anchor="middle"') + (lit ? rect(x + 8, y + 30, w - 16, 2, light, 1) : '');
    };
    ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].forEach((row, r) => {
      const start = [67, 79, 105][r];
      [...row].forEach((k, i) => { out += cap(start + i * 49, 104 + r * 42, 43, k, r === 0); });
      if (r === 2) out += cap(448, 188, 111, 'RETURN');
    });
    out += cap(80, 230, 67, 'CTRL') + cap(155, 230, 322, 'DEFAULT PALETTE', true) + cap(485, 230, 67, 'ALT');
    return out + text('SCULPTED LIGHT / STATE STUDY', 70, 65, 12, '#d5dcc4');
  }, states.rgbagentflightindicator[mode][1]);
}

function terminal(p, mode) {
  const lines = [
    ['Provider / endpoint', 'Model selection', 'Bring your own key'],
    ['Credential reference', 'OS credential store', 'Resolve for helper'],
    ['Pi agent software', 'Supervised process', 'Messages over stdio'],
    ['Configured endpoint', 'API request', 'Network access']
  ][mode];
  return frame(p, 'The BYOK request desk', states.warpi[mode][0], (u) => {
    let out = `<g filter="${u('shadow')}">${rect(60, 59, 402, 233, u('ivory'), 24)}${rect(72, 69, 354, 195, '#707866', 19)}${rect(79, 75, 339, 181, '#1b3126', 17)}${rect(87, 83, 323, 165, u('glass'), 14)}</g>`;
    out += text('WARPI / REQUEST STUDY', 106, 110, 14, '#dfebc6') + path('M106 120H388', '#708b65');
    lines.forEach((line, i) => { out += text((i ? '  ' : '> ') + line, 106, 150 + i * 30, 16, i ? '#b0c59f' : '#eef2cd'); });
    out += rect(106, 224, 9, 4, '#d9e6b5');
    out += `<path d="M91 90Q94 83 108 83H354L186 247H99Q87 245 87 230Z" fill="${u('reflection')}"/>`;
    out += text('WARP TERMINAL UI / UPSTREAM', 89, 279, 11, '#3e503e');
    for (let i = 0; i < 14; i++) out += rect(437, 100 + i * 8, 12, 3, '#7a8069', 1);
    out += circle(442, 241, 7, u('metal')) + circle(442, 241, 3, '#afda9c');
    // A printed process ticket represents software, rather than a hardware board.
    out += `<g transform="rotate(6 523 183)" filter="${u('shadow')}">${rect(468, 98, 121, 176, u('ivory'), 3)}${text('BYOK', 482, 123, 18, '#42523e')}${path('M480 135H576', '#89957e')}`;
    ['PROVIDER', 'KEY REF.', 'PI / STDIO', 'API'].forEach((s, i) => {
      const y = 157 + i * 30;
      out += circle(484, y - 4, 4, mode === i ? '#a95738' : '#9ba18b') + text(s, 495, y, 12, '#354c39');
    });
    return out + '</g>';
  }, states.warpi[mode][1]);
}

function graph(p, mode) {
  return frame(p, 'A map of session resources', states.hermesdashboard[mode][0], (u) => {
    let out = `<g filter="${u('shadow')}">${rect(39, 61, 562, 237, '#14271f', 14)}${rect(39, 54, 562, 234, u('metal'), 14)}${rect(50, 65, 540, 212, u('body'), 9)}</g>`;
    for (let y = 88; y < 265; y += 22) for (let x = 66; x < 585; x += 22) out += circle(x, y, 1, '#122c1c', 'opacity=".45"');
    const ys = [108, 174, 240];
    const colors = ['#9cbfd2', '#a6c893', '#dfb785'];
    ys.forEach((y, i) => {
      const active = mode === 3 || i === mode;
      const d = `M169 175C260 175 269 ${y} 383 ${y}`;
      out += path(d, '#10241b', 13, 'transform="translate(0 4)"') + path(d, u('brass'), 8) + path(d, active ? colors[i] : '#766e4f', 3);
      out += rect(376, y - 24, 190, 48, '#132b20', 9) + rect(379, y - 27, 184, 48, u('metal'), 9) + rect(387, y - 20, 168, 34, u('glass'), 5);
      out += circle(405, y - 3, 9, u('brass')) + circle(405, y - 3, 5, active ? colors[i] : '#384e3e');
      out += text(['FILES', 'TOOLS', 'MODELS'][i], 427, y + 2, 16, active ? '#ecedd5' : '#a1b29c');
    });
    out += circle(154, 176, 57, '#13281d') + circle(154, 169, 57, u('brass')) + circle(154, 169, 49, u('metal')) + circle(154, 169, 41, u('glass'));
    out += text('SESSION', 154, 174, 15, '#e2e8c9', 'text-anchor="middle"') + `<path d="M119 153Q128 130 158 130L141 202Q112 193 113 168Z" fill="${u('reflection')}"/>`;
    out += text('RESOURCE GRAPH', 80, 87, 12, '#dde1ca') + text('CONCEPTUAL LINKS', 154, 252, 11, '#dde1ca', 'text-anchor="middle"');
    return out + screw(60, 74, u) + screw(579, 74, u) + screw(60, 268, u) + screw(579, 268, u);
  }, states.hermesdashboard[mode][1]);
}

function archive(p, mode) {
  const labels = ['PERSONAL HISTORY', 'RELATIONSHIPS', 'KNOWLEDGE', 'EVENTS & EXPERIENCES', 'ACTIVE CONTEXT'];
  const colors = ['#c3a36b', '#779b7b', '#82b5b2', '#c88e71', '#ada0bc'];
  return frame(p, 'An anatomy of remembering', states.becomussy[mode][0], (u) => {
    let out = `<g filter="${u('shadow')}"><path d="M44 118L301 82 385 137 119 181Z" fill="${u('brass')}"/><path d="M44 118L119 181V286L44 224Z" fill="${u('body')}"/><path d="M119 181L385 137V245L119 286Z" fill="${u('body')}"/></g>`;
    for (let i = 4; i >= 0; i--) {
      const y = 91 + i * 27;
      const x = 68 + i * 10 - (i === mode ? 23 : 0);
      out += `<g filter="${u('shadow')}"><path d="M${x} ${y + 11}L${x + 220} ${y - 17}L${x + 265} ${y + 18}L${x + 41} ${y + 53}Z" fill="${u('ivory')}"/><path d="M${x + 41} ${y + 53}L${x + 265} ${y + 18}V${y + 24}L${x + 41} ${y + 59}Z" fill="${colors[i]}"/><path d="M${x + 11} ${y + 12}L${x + 219} ${y - 13}L${x + 249} ${y + 11}" fill="none" stroke="#fff4d0" stroke-width="1"/></g>`;
      out += `<g transform="matrix(1,-.145,.75,.58,${x + 34},${y + 20})">${rect(0, -12, 204, 22, i === mode ? colors[i] : '#ded7bc', 2)}${text(states.becomussy[i][0], 7, 3, 13, '#304839')}</g>`;
    }
    out += `<g filter="${u('shadow')}">${rect(391, 91, 213, 183, u('ivory'), 6)}${rect(391, 91, 213, 9, colors[mode], 4)}${text('TYPED MEMORY', 407, 120, 13, '#52604b')}${path('M407 130H586', '#b6b99c')}`;
    out += text(labels[mode], 407, 154, mode === 3 ? 13 : 15, '#263f2e');
    const icon = [
      circle(499, 189, 12, u('brass')) + `<path d="M472 238Q470 211 499 208Q528 211 526 238Z" fill="${u('brass')}"/>`,
      path('M465 217C478 181 517 181 533 217M465 217Q499 248 533 217', '#82916a', 4) + circle(465, 217, 11, u('brass')) + circle(533, 217, 11, u('brass')),
      `<path d="M459 191Q480 187 499 199Q519 187 540 191V236Q519 232 499 243Q479 232 459 236Z" fill="${u('body')}"/>` + path('M499 200V240M467 202L490 208M508 208L532 202M467 215L490 221M508 221L532 215', '#cbd0ae', 2),
      rect(464, 184, 70, 61, u('brass'), 4) + rect(470, 196, 58, 43, '#d9d6b7', 2) + path('M481 180V199M516 180V199M480 210H518M480 222H505', '#597053', 3),
      rect(463, 191, 75, 49, u('glass'), 8) + path('M474 216H486L493 202 501 230 509 216H527', '#c9deb2', 3)
    ][mode];
    return out + icon + '</g>';
  }, states.becomussy[mode][1]);
}

const renderers = { cocs: comparator, rgbagentflightindicator: keyboard, warpi: terminal, hermesdashboard: graph, becomussy: archive };

/**
 * Mount a responsive 640 × 360 SVG in a DIV host. Click, Enter, Space, or the
 * external action button advances a deterministic state. Returns an idempotent
 * cleanup; mounting again on the same host first cleans up the previous mount.
 * onTriggerSound is called with no arguments, only on user-triggered changes.
 */
export function initArticleStudy(project, host, readoutEl, actionBtn, onTriggerSound) {
  if (!host || !renderers[project?.id]) return () => {};
  mounted.get(host)?.();
  const id = project.id;
  const prefix = `si-study-${id}-${++instance}`;
  const original = ['role', 'tabindex', 'aria-label', 'style'].map((name) => [name, host.getAttribute(name)]);
  let mode = 0;
  let destroyed = false;
  host.setAttribute('role', 'button');
  host.setAttribute('tabindex', '0');
  host.style.cursor = 'pointer';
  host.style.touchAction = 'manipulation';
  if (readoutEl) {
    readoutEl.setAttribute('aria-live', 'polite');
    readoutEl.setAttribute('aria-atomic', 'true');
  }
  const render = () => {
    const [name, detail] = states[id][mode];
    host.innerHTML = renderers[id](prefix, mode);
    host.setAttribute('aria-label', `${project.title || id}. ${name}. ${detail} Press Enter or Space for the next study state.`);
    if (readoutEl) readoutEl.textContent = `${name} · ${detail}`;
  };
  const step = () => {
    if (destroyed) return;
    mode = (mode + 1) % states[id].length;
    render();
    if (typeof onTriggerSound === 'function') onTriggerSound();
  };
  const key = (event) => {
    if (event.target !== host || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    if (!event.repeat) step();
  };
  const click = (event) => {
    if (actionBtn && host.contains(actionBtn) && actionBtn.contains(event.target)) return;
    step();
  };
  host.addEventListener('click', click);
  host.addEventListener('keydown', key);
  actionBtn?.addEventListener('click', step);
  render();
  const cleanup = () => {
    if (destroyed) return;
    destroyed = true;
    host.removeEventListener('click', click);
    host.removeEventListener('keydown', key);
    actionBtn?.removeEventListener('click', step);
    host.replaceChildren();
    original.forEach(([name, value]) => value === null ? host.removeAttribute(name) : host.setAttribute(name, value));
    mounted.delete(host);
  };
  mounted.set(host, cleanup);
  return cleanup;
}
