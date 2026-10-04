/* Shared navigation and reading progress. Content remains visible without JS. */
document.documentElement.classList.add('js');

(() => {
  const button = document.querySelector('.navbar__hamburger');
  const links = document.querySelector('.navbar__links');
  const mobile = matchMedia('(max-width: 760px)');

  if (button && links) {
    function setMenu(open, returnFocus = false) {
      links.classList.toggle('open', open);
      button.classList.toggle('active', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (returnFocus) button.focus();
    }
    button.addEventListener('click', () => setMenu(button.getAttribute('aria-expanded') !== 'true'));
    links.addEventListener('click', event => {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && links.classList.contains('open')) setMenu(false, true);
    });
    document.addEventListener('click', event => {
      if (!button.contains(event.target) && !links.contains(event.target)) setMenu(false);
    });
    document.addEventListener('focusin', event => {
      if (!button.contains(event.target) && !links.contains(event.target)) setMenu(false);
    });
    mobile.addEventListener('change', () => setMenu(false));
  }

  const bar = document.querySelector('.reading-progress');
  const article = document.querySelector('.blog-article');
  if (bar && article) {
    let scheduled = false;
    function update() {
      scheduled = false;
      const bounds = article.getBoundingClientRect();
      const distance = Math.max(1, bounds.height - innerHeight * .6);
      const progress = Math.max(0, Math.min(1, (innerHeight * .3 - bounds.top) / distance));
      bar.style.width = `${progress * 100}%`;
    }
    function schedule() {
      if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
    }
    addEventListener('scroll', schedule, {passive: true});
    addEventListener('resize', schedule);
    update();
  }
})();
