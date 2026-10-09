// Koinz Capital — navegação e animações da apresentação.
// ← → / espaço / PageUp/PageDown, Home/End, F = tela cheia, G = visão geral, Esc = sair da visão geral.
// O número do slide fica na URL (#5), então dá para recarregar ou mandar o link de um slide específico.
(function () {
  const deck = document.getElementById('deck');
  const wraps = Array.from(deck.querySelectorAll('.slide-wrap'));
  const slides = wraps.map((w) => w.querySelector('.slide'));
  const total = slides.length;
  const progress = document.getElementById('progress');
  const count = document.getElementById('count');
  const pad = (n) => String(n).padStart(2, '0');
  const locale = document.documentElement.lang || 'pt-BR';
  let current = 0;

  // ---------- Rodapé (marca · seção · número) ----------
  slides.forEach((s, i) => {
    const chrome = s.querySelector('.chrome');
    if (!chrome) return;
    chrome.innerHTML =
      '<span class="chrome__brand"><svg><use href="#k"/></svg>Koinz Capital</span>' +
      '<span class="chrome__right"><span class="chrome__sec">' + (s.dataset.sec || '') + '</span>' +
      '<span class="chrome__num">' + pad(i + 1) + ' / ' + pad(total) + '</span></span>';
  });

  // ---------- Tickers: duplica a faixa para o loop não ter emenda ----------
  deck.querySelectorAll('[data-ticker]').forEach((view) => {
    const track = view.querySelector('.ticker__track');
    const copy = track.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    view.appendChild(copy);
  });

  // ---------- Visão: texto revelado palavra a palavra ----------
  const wordBlocks = Array.from(deck.querySelectorAll('[data-words]'));
  wordBlocks.forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => '<span class="w">' + w + '</span>').join(' ');
  });
  let wordTimer = null;
  function revealWords(slide) {
    clearInterval(wordTimer);
    wordBlocks.forEach((b) => b.querySelectorAll('.w').forEach((w) => w.classList.remove('on')));
    const block = slide.querySelector('[data-words]');
    if (!block) return;
    const words = block.querySelectorAll('.w');
    let i = 0;
    setTimeout(() => {
      wordTimer = setInterval(() => {
        if (i >= words.length) return clearInterval(wordTimer);
        words[i++].classList.add('on');
      }, 75);
    }, 450);
  }

  // ---------- Números subindo ----------
  function countUp(slide) {
    slide.querySelectorAll('.count').forEach((el) => {
      const to = Number(el.dataset.to);
      const start = performance.now();
      const dur = 1600;
      el.textContent = '0';
      function tick(now) {
        const t = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - t, 3))).toLocaleString(locale);
        if (t < 1) requestAnimationFrame(tick);
      }
      setTimeout(() => requestAnimationFrame(tick), 350);
    });
  }

  // ---------- Globo de cidades (mesmo cálculo do HomeGlobe da página, girando sozinho) ----------
  const globe = document.getElementById('globe');
  const cities = globe ? Array.from(globe.querySelectorAll('.city')) : [];
  let globeRaf = null;
  let rot = 0;
  let last = 0;
  function renderGlobe() {
    const sw = 1920;
    const sh = globe.offsetHeight;
    const cw = 240;
    const ch = 184;
    const radius = 720;
    const cx = sw / 2;
    const cy = sh + radius * 0.4;
    cities.forEach((card, i) => {
      const angle = rot + (i / cities.length) * Math.PI * 2;
      const x = cx + radius * Math.sin(angle);
      const y = cy - radius * Math.cos(angle);
      const cosA = Math.cos(angle);
      const scale = cosA > 0 ? 0.56 + 0.44 * cosA : 0.56;
      const opacity = y > sh + ch ? 0 : Math.max(0, 0.15 + 0.85 * Math.max(0, cosA));
      card.style.transform = 'translate(' + (x - cw / 2) + 'px,' + (y - ch) + 'px) rotate(' + (angle * 180) / Math.PI + 'deg) scale(' + scale + ')';
      card.style.opacity = opacity.toFixed(3);
      card.style.zIndex = String(Math.round(Math.max(0, cosA) * 10));
    });
  }
  function loopGlobe(now) {
    if (last) rot -= ((now - last) / 1000) * 0.07;
    last = now;
    renderGlobe();
    globeRaf = requestAnimationFrame(loopGlobe);
  }
  function startGlobe() {
    if (!globe || globeRaf) return;
    last = 0;
    globeRaf = requestAnimationFrame(loopGlobe);
  }
  function stopGlobe() {
    if (globeRaf) cancelAnimationFrame(globeRaf);
    globeRaf = null;
  }

  // ---------- Escala do palco ----------
  function fit() {
    if (document.body.classList.contains('is-overview')) return;
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    deck.style.setProperty('--scale', scale);
  }

  function go(index) {
    current = Math.max(0, Math.min(total - 1, index));
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    progress.style.width = ((current + 1) / total) * 100 + '%';
    count.textContent = current + 1 + ' / ' + total;
    history.replaceState(null, '', '#' + (current + 1));
    const s = slides[current];
    countUp(s);
    revealWords(s);
    if (globe && s.contains(globe)) startGlobe();
    else stopGlobe();
  }

  function toggleOverview(force) {
    const on = document.body.classList.toggle('is-overview', force);
    if (on) {
      if (globe) renderGlobe();
      requestAnimationFrame(() => {
        const w = wraps[0].getBoundingClientRect().width;
        deck.style.setProperty('--thumb', w / 1920);
        wraps[current].scrollIntoView({ block: 'center' });
      });
    } else {
      fit();
      go(current);
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (document.body.classList.contains('is-overview')) {
      if (k === 'Escape' || k === 'g' || k === 'G') toggleOverview(false);
      return;
    }
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); go(current + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); go(current - 1); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(total - 1);
    else if (k === 'f' || k === 'F') toggleFullscreen();
    else if (k === 'g' || k === 'G' || k === 'Escape') toggleOverview(true);
  });

  // Clique: metade direita avança, metade esquerda volta (links continuam funcionando).
  deck.addEventListener('click', (e) => {
    if (document.body.classList.contains('is-overview')) {
      const wrap = e.target.closest('.slide-wrap');
      if (wrap) { current = wraps.indexOf(wrap); toggleOverview(false); }
      return;
    }
    if (e.target.closest('a, button')) return;
    go(current + (e.clientX > window.innerWidth / 2 ? 1 : -1));
  });

  let touchX = null;
  deck.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  deck.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  document.getElementById('prev').addEventListener('click', () => go(current - 1));
  document.getElementById('next').addEventListener('click', () => go(current + 1));
  document.getElementById('overview').addEventListener('click', () => toggleOverview(true));
  document.getElementById('fullscreen').addEventListener('click', toggleFullscreen);
  window.addEventListener('resize', () => {
    if (document.body.classList.contains('is-overview')) toggleOverview(true);
    else fit();
  });

  // Controles aparecem ao mexer o mouse e somem depois de 2,5s parado.
  let hideTimer;
  document.addEventListener('mousemove', () => {
    document.body.classList.add('show-controls');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => document.body.classList.remove('show-controls'), 2500);
  });

  // Na impressão, tudo aparece no estado final.
  window.addEventListener('beforeprint', () => {
    if (globe) renderGlobe();
    deck.querySelectorAll('.count').forEach((el) => { el.textContent = Number(el.dataset.to).toLocaleString(locale); });
  });

  // Trocar de idioma mantém o slide atual.
  document.querySelectorAll('.controls__langs a[hreflang]').forEach((a) => {
    a.addEventListener('click', () => { a.href = a.getAttribute('href').split('#')[0] + '#' + (current + 1); });
  });

  const fromHash = parseInt(location.hash.slice(1), 10);
  fit();
  if (globe) renderGlobe();
  go(Number.isFinite(fromHash) ? fromHash - 1 : 0);
})();
