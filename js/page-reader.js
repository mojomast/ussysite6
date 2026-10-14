/** Full-screen folio reader. Turns the original, live pages; no cloned controls. */
export function initPageReader(onChange = () => {}) {
  const root = document.documentElement;
  const stage = document.querySelector('.magazine-issue-folio');
  const header = document.querySelector('.press-running-header');
  const toggle = document.getElementById('btn-page-mode');
  const toggleLabel = document.getElementById('page-mode-label');
  const controls = document.getElementById('page-reader-controls');
  const previous = document.getElementById('page-reader-prev');
  const next = document.getElementById('page-reader-next');
  const jump = document.getElementById('page-reader-jump');
  const fitButton = document.getElementById('page-reader-fit');
  const fillButton = document.getElementById('page-reader-fill');
  const hint = document.getElementById('page-reader-hint');
  const progress = document.getElementById('page-reading-progress');
  const announcement = document.getElementById('page-reader-announcement');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pages = [...document.querySelectorAll('.magazine-spread')];
  const offsets = new Map();
  const horizontalOffsets = new Map();
  const faces = [];
  const papers = [];
  const geometry = [];
  const fillScales = new Map();
  const folio = (index) => String(index + 1).padStart(2, '0');
  const title = (page) => page.dataset.sectionLabel.split(' / ').slice(1).join(' / ');
  const leaves = pages.map((page, index) => {
    const leaf = document.createElement('div');
    leaf.className = 'page-leaf';
    const face = document.createElement('div');
    face.className = 'page-face';
    const paper = document.createElement('div');
    paper.className = 'page-paper';
    face.append(paper);
    faces.push(face);
    papers.push(paper);
    const back = document.createElement('div');
    back.className = 'page-turn-back';
    back.setAttribute('aria-hidden', 'true');
    back.innerHTML = '<span class="page-back-monogram">Si.</span><span class="page-back-imprint">SLOP ILLUSTRATED · ISSUE 01</span>';
    const shade = document.createElement('div');
    shade.className = 'page-turn-shade';
    shade.setAttribute('aria-hidden', 'true');
    leaf.append(face, back, shade);
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${folio(index)} / ${folio(pages.length - 1)} — ${title(page)}`;
    jump.append(option);
    return leaf;
  });

  let active = false;
  let index = 0;
  let turning = false;
  let generation = 0;
  let animations = [];
  let ownsFullscreen = false;
  let lastWheel = 0;
  let wheelDirection = 0;
  let wheelAmount = 0;
  let edgeGesture = false;
  let touch = null;
  let suppressClickUntil = 0;
  let pending = null;
  let fitToPage = true;
  let layoutFrame = 0;
  let layoutKey = '';
  let zoomFrame = 0;
  let zoom = null;
  let pendingZoom = null;

  const measureControls = () => root.style.setProperty('--page-controls-height', `${controls.offsetHeight}px`);
  if (typeof ResizeObserver === 'function') new ResizeObserver(measureControls).observe(controls);

  function applyGeometry(at, size) {
    geometry[at] = size;
    const leaf = leaves[at];
    leaf.style.setProperty('--page-scale', String(size.scale));
    leaf.style.setProperty('--paper-width', `${size.paperWidth}px`);
    leaf.style.setProperty('--paper-height', `${size.paperHeight}px`);
    leaf.style.setProperty('--sheet-width', `${size.width}px`);
    leaf.style.setProperty('--sheet-height', `${size.height}px`);
  }

  // Fit and Fill share one unscaled composition. Only the paper's scale and
  // viewing window change, so zooming never reflows the type or swaps columns.
  function layoutSheets() {
    if (!active || matchMedia('print').matches) return;
    stage.dataset.pageZoom = fitToPage ? 'fit' : 'fill';
    const style = getComputedStyle(stage);
    const width = Math.max(1, stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
    const height = Math.max(1, stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom));
    // Compose for the actual reading surface, including phones. The same
    // composition is retained through zoom; Fill restores readable natural type.
    const layoutWidth = Math.min(1400, width);
    stage.dataset.sheetLayout = layoutWidth < 760 ? 'narrow' : 'spread';
    const key = `${width}:${height}:${layoutWidth}`;
    if (key !== layoutKey) { fillScales.clear(); layoutKey = key; }
    leaves.forEach((leaf, at) => {
      if (leaf.hidden) return;
      const oldScale = geometry[at]?.scale || 1;
      const top = faces[at].scrollTop / oldScale;
      const left = faces[at].scrollLeft / oldScale;
      leaf.style.setProperty('--page-layout-width', `${layoutWidth}px`);
      const naturalHeight = pages[at].offsetHeight;
      if (!fitToPage) fillScales.set(at, Math.max(fillScales.get(at) || 1, width / layoutWidth, height / Math.max(1, naturalHeight)));
      const scale = fitToPage ? Math.min(1, width / layoutWidth, height / Math.max(1, naturalHeight)) : fillScales.get(at);
      const size = {
        scale,
        paperWidth: layoutWidth * scale,
        paperHeight: naturalHeight * scale,
        width: fitToPage ? layoutWidth * scale : width,
        height: fitToPage ? naturalHeight * scale : height,
      };
      if (zoom?.at === at) { zoom.to = size; return; }
      applyGeometry(at, size);
      if (!fitToPage) {
        faces[at].scrollTop = top * scale;
        faces[at].scrollLeft = left * scale;
      }
    });
    updateProgress();
  }

  function scheduleLayout() {
    if (!active || layoutFrame) return;
    layoutFrame = requestAnimationFrame(() => {
      layoutFrame = 0;
      layoutSheets();
    });
  }

  if (typeof ResizeObserver === 'function') {
    const sheetObserver = new ResizeObserver(scheduleLayout);
    sheetObserver.observe(stage);
    pages.forEach((page) => sheetObserver.observe(page));
  }
  document.fonts?.ready.then(scheduleLayout);
  stage.addEventListener('load', scheduleLayout, true);

  function rememberPosition(at = index) {
    const scale = geometry[at]?.scale || 1;
    offsets.set(at, faces[at].scrollTop / scale);
    horizontalOffsets.set(at, faces[at].scrollLeft / scale);
  }

  function restorePosition(at = index) {
    const scale = geometry[at]?.scale || 1;
    faces[at].scrollTop = fitToPage ? 0 : (offsets.get(at) || 0) * scale;
    faces[at].scrollLeft = fitToPage ? 0 : (horizontalOffsets.get(at) || 0) * scale;
  }

  function finishZoom() {
    if (!zoom) return;
    cancelAnimationFrame(zoomFrame);
    zoomFrame = 0;
    const at = zoom.at;
    if (zoom.to) applyGeometry(at, zoom.to);
    faces[at].inert = false;
    zoom = null;
    stage.classList.remove('is-page-zooming');
    restorePosition(at);
    updateProgress();
  }

  function setZoom(fit) {
    if (!active) return;
    if (turning) { pendingZoom = fit; return; }
    if (fit === fitToPage) return;
    document.dispatchEvent(new Event('reader-layout-change'));
    if (!fitToPage && !zoom) rememberPosition();
    cancelAnimationFrame(zoomFrame);
    const face = faces[index];
    const from = { ...geometry[index] };
    const startTop = face.scrollTop;
    const startLeft = face.scrollLeft;
    fitToPage = fit;
    fitButton.setAttribute('aria-pressed', String(fit));
    fillButton.setAttribute('aria-pressed', String(!fit));
    zoom = { at: index, from, to: null };
    face.inert = true;
    stage.classList.add('is-page-zooming');
    layoutSheets();
    announcement.textContent = fit ? 'Whole sheet fitted and centered.' : 'Fill view. Scroll to read the enlarged sheet.';
    if (reducedMotion.matches) { finishZoom(); return; }
    const began = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - began) / 560);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      const mix = (a, b) => a + (b - a) * eased;
      const size = Object.fromEntries(Object.keys(from).map((key) => [key, mix(from[key], zoom.to[key])]));
      applyGeometry(index, size);
      face.scrollTop = mix(startTop, fit ? 0 : (offsets.get(index) || 0) * zoom.to.scale);
      face.scrollLeft = mix(startLeft, fit ? 0 : (horizontalOffsets.get(index) || 0) * zoom.to.scale);
      if (t < 1) zoomFrame = requestAnimationFrame(step);
      else finishZoom();
    };
    zoomFrame = requestAnimationFrame(step);
  }

  function prepareImages(at) {
    for (const page of pages.slice(Math.max(0, at - 1), at + 2)) {
      page.querySelectorAll('img[loading="lazy"]').forEach((image) => { image.loading = 'eager'; });
    }
  }

  function updateProgress() {
    if (!active) return;
    const page = faces[index];
    const extent = page.scrollHeight - page.clientHeight;
    const fraction = extent > 1 ? Math.min(1, page.scrollTop / extent) : 1;
    progress.style.transform = `scaleX(${fraction})`;
    root.style.setProperty('--reader-issue-progress', String((index + fraction) / pages.length));
    const touchHint = matchMedia('(pointer: coarse)').matches;
    hint.textContent = fitToPage
      ? (touchHint ? 'Whole sheet · swipe sideways to turn' : 'Whole sheet · scroll or ← → to turn')
      : fraction > 0.99 && index < pages.length - 1
      ? (touchHint ? 'End of folio · tap Next' : 'End of folio · scroll again or press →')
      : page.scrollWidth > page.clientWidth + 1
      ? (touchHint ? 'Swipe to explore · Fit sheet to zoom out' : 'Scroll to read · Shift + wheel to pan')
      : (touchHint ? 'Swipe up to read · Fit sheet to zoom out' : 'Scroll to read · Fit sheet to zoom out');
  }

  function updateControls() {
    jump.value = String(index);
    previous.disabled = index === 0;
    next.disabled = index === pages.length - 1;
    onChange(pages[index]);
    announcement.textContent = `Folio ${index + 1} of ${pages.length}: ${title(pages[index])}`;
    updateProgress();
  }

  function updateAddress(target, push = false) {
    const hash = `#${target.id}`;
    if (location.hash !== hash) history[push ? 'pushState' : 'replaceState'](null, '', hash);
  }

  function scrollToTarget(target) {
    if (fitToPage) return;
    const page = faces[index];
    if (target === pages[index]) { page.scrollTop = 0; page.scrollLeft = 0; }
    else if (target) {
      page.scrollTop += target.getBoundingClientRect().top - page.getBoundingClientRect().top - 16;
      page.scrollLeft += target.getBoundingClientRect().left - page.getBoundingClientRect().left - 16;
    }
  }

  function cancelAnimations() {
    animations.forEach((animation) => animation.cancel());
    animations = [];
  }

  async function goTo(idOrIndex, { target = null, push = false, focus = false } = {}) {
    if (!active) return;
    const destination = typeof idOrIndex === 'number' ? idOrIndex : pages.findIndex((page) => page.id === idOrIndex);
    if (destination < 0 || destination >= pages.length) return;
    if (turning) {
      pending = { destination, target, push, focus };
      return;
    }
    finishZoom();
    if (destination === index) {
      scrollToTarget(target);
      if (target) updateAddress(target, push);
      if (focus && target) {
        if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
      return;
    }

    const token = ++generation;
    document.dispatchEvent(new Event('reader-layout-change'));
    const oldIndex = index;
    const outgoing = leaves[oldIndex];
    const incoming = leaves[destination];
    const shouldFocus = focus || outgoing.contains(document.activeElement);
    const forward = destination > oldIndex;
    if (!fitToPage) rememberPosition(oldIndex);
    index = destination;
    turning = true;
    stage.classList.add('is-page-turning');
    stage.setAttribute('aria-busy', 'true');
    outgoing.inert = true;
    incoming.hidden = false;
    incoming.inert = true;
    outgoing.classList.remove('is-current-page');
    incoming.classList.add('is-current-page');
    outgoing.style.zIndex = forward ? '3' : '1';
    incoming.style.zIndex = forward ? '1' : '3';
    prepareImages(index);
    layoutSheets();
    restorePosition();
    scrollToTarget(target);
    updateAddress(target || pages[index], push);
    updateControls();
    edgeGesture = false;
    wheelAmount = 0;

    if (!reducedMotion.matches && typeof incoming.animate === 'function') {
      const turningLeaf = forward ? outgoing : incoming;
      const underneath = forward ? incoming : outgoing;
      const duration = 820;
      const curl = [
        { transform: 'rotateY(0deg) translateZ(0px)', offset: 0 },
        { transform: 'rotateY(-18deg) translateZ(36px)', offset: 0.2 },
        { transform: 'rotateY(-86deg) translateZ(52px)', offset: 0.56 },
        { transform: 'rotateY(-158deg) translateZ(10px)', offset: 1 },
      ];
      animations = [
        turningLeaf.animate(curl, { duration, direction: forward ? 'normal' : 'reverse', easing: 'cubic-bezier(.4,.05,.18,1)', fill: 'both' }),
        underneath.animate([
          { transform: 'translateZ(-65px) rotateY(4deg)', filter: 'brightness(.68)' },
          { transform: 'translateZ(0px) rotateY(0deg)', filter: 'brightness(1)' },
        ], { duration, direction: forward ? 'normal' : 'reverse', easing: 'ease-out', fill: 'both' }),
        turningLeaf.querySelector('.page-turn-shade').animate([
          { opacity: 0 }, { opacity: 0.5, offset: 0.46 }, { opacity: 0.12 },
        ], { duration, direction: forward ? 'normal' : 'reverse', fill: 'both' }),
      ];
      await Promise.all(animations.map((animation) => animation.finished.catch(() => {})));
    }

    if (!active || token !== generation) return;
    outgoing.hidden = true;
    incoming.inert = false;
    cancelAnimations();
    outgoing.style.zIndex = '';
    incoming.style.zIndex = '';
    stage.classList.remove('is-page-turning');
    stage.removeAttribute('aria-busy');
    turning = false;
    if (shouldFocus) {
      const destinationTarget = target || pages[index];
      if (!destinationTarget.hasAttribute('tabindex')) destinationTarget.tabIndex = -1;
      destinationTarget.focus({ preventScroll: true });
    }
    updateProgress();
    if (pending) {
      const request = pending;
      pending = null;
      goTo(request.destination, request);
    } else if (pendingZoom !== null) {
      const fit = pendingZoom;
      pendingZoom = null;
      setZoom(fit);
    }
  }

  function enter() {
    document.dispatchEvent(new Event('reader-layout-change'));
    const probe = header.getBoundingClientRect().bottom + Math.min(160, innerHeight * 0.2);
    index = pages.reduce((best, page, at) => page.getBoundingClientRect().top <= probe ? at : best, 0);
    const offset = Math.max(0, header.offsetHeight - pages[index].getBoundingClientRect().top);
    active = true;
    root.dataset.readerMode = 'pages';
    controls.hidden = false;
    measureControls();
    leaves.forEach((leaf, at) => {
      pages[at].before(leaf);
      papers[at].append(pages[at]);
      leaf.hidden = at !== index;
      leaf.inert = at !== index;
      leaf.classList.toggle('is-current-page', at === index);
    });
    offsets.set(index, offset);
    layoutSheets();
    restorePosition();
    toggle.setAttribute('aria-pressed', 'true');
    toggle.setAttribute('title', 'Return to continuous scrolling');
    toggleLabel.textContent = 'Exit';
    document.querySelector('.reader-options').open = false;
    prepareImages(index);
    updateAddress(pages[index]);
    updateControls();

    // CSS supplies the same viewport reader when browser fullscreen is unavailable.
    if (!document.fullscreenElement && root.requestFullscreen) {
      ownsFullscreen = true;
      try {
        Promise.resolve(root.requestFullscreen()).then(() => {
          if (!active && document.fullscreenElement === root) document.exitFullscreen().catch(() => {});
        }).catch(() => { ownsFullscreen = false; });
      } catch {
        ownsFullscreen = false;
      }
    }
  }

  function exit() {
    if (!active) return;
    finishZoom();
    document.dispatchEvent(new Event('reader-layout-change'));
    const page = pages[index];
    if (!fitToPage) rememberPosition();
    const offset = offsets.get(index) || 0;
    active = false;
    generation++;
    pending = null;
    pendingZoom = null;
    turning = false;
    cancelAnimations();
    delete root.dataset.readerMode;
    delete stage.dataset.sheetLayout;
    delete stage.dataset.pageZoom;
    stage.classList.remove('is-page-turning');
    stage.removeAttribute('aria-busy');
    controls.hidden = true;
    leaves.forEach((leaf, at) => {
      leaf.replaceWith(pages[at]);
      leaf.hidden = false;
      leaf.inert = false;
      leaf.classList.remove('is-current-page');
      leaf.style.zIndex = '';
    });
    toggle.setAttribute('aria-pressed', 'false');
    toggle.setAttribute('title', 'Enter full-screen page view');
    toggleLabel.textContent = 'Pages';
    announcement.textContent = 'Continuous scrolling restored.';
    const restorePosition = () => {
      if (active) return;
      window.scrollTo({ top: page.getBoundingClientRect().top + window.scrollY + offset - header.offsetHeight - 8, behavior: 'instant' });
      onChange(page);
    };
    requestAnimationFrame(restorePosition);
    toggle.focus({ preventScroll: true });
    if (ownsFullscreen && document.fullscreenElement) {
      ownsFullscreen = false;
      document.exitFullscreen().then(restorePosition).catch(() => {});
    } else ownsFullscreen = false;
  }

  toggle.addEventListener('click', () => active ? exit() : enter());
  previous.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));
  jump.addEventListener('change', () => goTo(Number(jump.value)));
  fitButton.addEventListener('click', () => setZoom(true));
  fillButton.addEventListener('click', () => setZoom(false));
  faces.forEach((face) => face.addEventListener('scroll', updateProgress, { passive: true }));
  stage.addEventListener('toggle', scheduleLayout, true);
  stage.addEventListener('article-resize', layoutSheets);
  stage.addEventListener('click', scheduleLayout);
  window.addEventListener('resize', () => { finishZoom(); scheduleLayout(); });
  window.addEventListener('beforeprint', finishZoom);
  window.addEventListener('afterprint', scheduleLayout);
  document.addEventListener('fullscreenchange', () => {
    if (active && ownsFullscreen && !document.fullscreenElement) exit();
    else if (!active && ownsFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { cancelAnimations(); finishZoom(); } });

  // Keep hash links, the contents, search results and browser Back in this reader.
  document.addEventListener('click', (event) => {
    if (active && performance.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (!active || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.hash.slice(1));
    const page = target?.closest('.magazine-spread');
    if (!page) return;
    event.preventDefault();
    goTo(page.id, { target, push: true, focus: true });
  }, true);
  window.addEventListener('hashchange', () => {
    if (!active) return;
    const target = document.getElementById(location.hash.slice(1));
    const page = target?.closest('.magazine-spread');
    if (page) goTo(page.id, { target, focus: true });
  });

  const editing = (target) => target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
  document.addEventListener('keydown', (event) => {
    if (!active || event.defaultPrevented || event.isComposing || document.querySelector('dialog[open]')) return;
    if (event.key === 'Escape') { event.preventDefault(); exit(); return; }
    if (event.ctrlKey || event.metaKey || event.altKey || editing(event.target)) return;
    if (event.target.closest('[role="tablist"], .article-study-stage, .cover-illustration')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      if (!turning) goTo(index + (event.key === 'ArrowRight' ? 1 : -1));
    } else if (['PageDown', 'PageUp', ' '].includes(event.key)) {
      if (event.key === ' ' && event.target.closest('button, a, summary')) return;
      event.preventDefault();
      if (turning || zoom) return;
      const direction = event.key === 'PageUp' || (event.key === ' ' && event.shiftKey) ? -1 : 1;
      const page = faces[index];
      const edge = direction > 0 ? page.scrollTop + page.clientHeight >= page.scrollHeight - 3 : page.scrollTop <= 3;
      if (edge) goTo(index + direction);
      else page.scrollBy({ top: direction * page.clientHeight * 0.85, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
  });

  // Only a fresh wheel gesture at the boundary turns the page. Momentum from
  // reading a long feature must not spill into the next one (or skip folios).
  stage.addEventListener('wheel', (event) => {
    if (!active || event.ctrlKey || document.querySelector('dialog[open]')) return;
    const shiftPan = event.shiftKey && !event.deltaX;
    const horizontal = shiftPan || Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.4;
    const delta = horizontal && !shiftPan ? event.deltaX : event.deltaY;
    const direction = Math.sign(delta);
    if (!direction) return;
    const now = performance.now();
    const fresh = now - lastWheel > 180 || direction !== wheelDirection;
    lastWheel = now;
    wheelDirection = direction;
    if (turning || zoom) { event.preventDefault(); edgeGesture = false; return; }
    const page = faces[index];
    for (let node = event.target; node instanceof HTMLElement && node !== page; node = node.parentElement) {
      const extent = horizontal ? node.scrollWidth - node.clientWidth : node.scrollHeight - node.clientHeight;
      const position = horizontal ? node.scrollLeft : node.scrollTop;
      if (extent > 2 && /auto|scroll/.test(getComputedStyle(node)[horizontal ? 'overflowX' : 'overflowY']) && (direction > 0 ? position < extent - 2 : position > 2)) return;
    }
    if (horizontal && !fitToPage) {
      if (shiftPan) { event.preventDefault(); page.scrollLeft += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? page.clientWidth : 1); }
      return;
    }
    const position = horizontal ? page.scrollLeft : page.scrollTop;
    const extent = horizontal ? page.scrollWidth - page.clientWidth : page.scrollHeight - page.clientHeight;
    const edge = direction > 0 ? position >= extent - 3 : position <= 3;
    if (fresh) { edgeGesture = edge; wheelAmount = 0; }
    if (!edge) {
      edgeGesture = false;
      if (shiftPan) { event.preventDefault(); page.scrollLeft += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? page.clientWidth : 1); }
      return;
    }
    event.preventDefault();
    if (!edgeGesture) return;
    wheelAmount += Math.abs(delta) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? page.clientHeight : 1);
    if (wheelAmount >= 80) { edgeGesture = false; goTo(index + direction); }
  }, { passive: false });

  stage.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch' && !event.isPrimary) touch = null;
    if (!active || turning || zoom || !fitToPage || event.pointerType !== 'touch' || !event.isPrimary || editing(event.target) || event.target.closest('pre')) return;
    touch = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
  });
  stage.addEventListener('pointercancel', () => { touch = null; });
  stage.addEventListener('pointerup', (event) => {
    if (!touch || touch.id !== event.pointerId) return;
    const dx = event.clientX - touch.x;
    const dy = event.clientY - touch.y;
    const elapsed = performance.now() - touch.time;
    touch = null;
    if (active && !turning && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6 && elapsed < 900) {
      suppressClickUntil = performance.now() + 400;
      goTo(index + (dx < 0 ? 1 : -1));
    }
  });

  return { get active() { return active; }, goTo };
}
