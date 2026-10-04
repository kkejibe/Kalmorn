/* Floating balloons: pointer, touch, and keyboard interaction.
 * Motion pauses when hidden and respects reduced-motion preferences. */
(() => {
  const root = document;
  const field = root.querySelector('#balloon-field');
  const canvas = root.querySelector('#balloon-canvas');
  if (!field || !canvas) return;
  const ctx = canvas.getContext('2d');
  const motionButton = root.querySelector('#balloon-motion');
  const status = root.querySelector('#balloon-status');
  if (!ctx) return;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const originalColors = [
    {base:'#00C853',light:'#69F0AE',dark:'#009624'},
    {base:'#00d2ff',light:'#80eaff',dark:'#006a80'},
    {base:'#9d50bb',light:'#c089d8',dark:'#4f285e'},
    {base:'#43e97b',light:'#a6f7c1',dark:'#1e6a38'},
    {base:'#00E676',light:'#b9f6ca',dark:'#00a152'},
    {base:'#00c9ff',light:'#92fe9d',dark:'#00607a'},
    {base:'#ff6b8f',light:'#ffa4b6',dark:'#c4385a'}
  ];
  let paused = reduceMotion.matches;
  try { paused = paused || sessionStorage.getItem('kalmorn-balloons-paused') === 'true'; } catch {}
  let inView = true, stopped = false, frame = 0, last = 0, width = 0, height = 0, pops = 0;
  let balloons = [], particles = [];
  const timers = new Set();

  function colorsFor(index) {
    return originalColors[index % originalColors.length];
  }
  function place(balloon, initial) {
    const i = balloon.index;
    const col = i % 3;
    const row = Math.floor(i / 3);
    balloon.radius = 21 + (i % 3) * 3;
    balloon.anchor = width * (.18 + col * .31);
    balloon.x = balloon.anchor;
    balloon.y = initial ? height * (.19 + row * .285 + (col % 2) * .065) : height + 75;
    balloon.phase = i * 1.8;
    balloon.speed = 17 + (i % 4) * 3.5;
    balloon.popped = false;
    balloon.button.disabled = false;
  }
  function syncMotionLabel() {
    motionButton.textContent = reduceMotion.matches ? 'Motion reduced' : paused ? 'Resume motion' : 'Pause motion';
    motionButton.disabled = reduceMotion.matches;
    motionButton.setAttribute('aria-pressed',String(paused || reduceMotion.matches));
  }
  function drawBalloon(b) {
    const r = b.radius;
    const color = colorsFor(b.index);
    ctx.save();
    ctx.translate(b.x,b.y);
    ctx.rotate(Math.sin(b.phase) * .055);
    const sway = Math.sin(b.phase * 1.8) * 7;
    ctx.beginPath();
    ctx.moveTo(0,r + 4);
    ctx.bezierCurveTo(sway,r + 35,-sway,r + 66,sway * .6,r + 99);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(218,239,225,0.25)';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,r);
    ctx.bezierCurveTo(-r * 1.2,r * .8,-r * 1.3,-r * 1.2,0,-r * 1.2);
    ctx.bezierCurveTo(r * 1.3,-r * 1.2,r * 1.2,r * .8,0,r);
    ctx.closePath();
    const gradient = ctx.createRadialGradient(-r * .3,-r * .5,r * .1,0,0,r * 1.5);
    gradient.addColorStop(0,color.light);
    gradient.addColorStop(.4,color.base);
    gradient.addColorStop(1,color.dark);
    ctx.globalAlpha = .79;
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0,r - 1);ctx.lineTo(-3,r + 5);ctx.lineTo(3,r + 5);ctx.closePath();
    ctx.fillStyle = color.base;ctx.fill();
    ctx.restore();
  }
  function paint() {
    ctx.clearRect(0,0,width,height);
    balloons.forEach(b => {
      const visible = !b.popped && b.y > b.radius * 1.2 + 5 && b.y < height - b.radius - 5;
      b.button.hidden = !visible;
      b.button.style.transform = `translate(${b.x - 29}px,${b.y - 36}px)`;
      if (!b.popped) drawBalloon(b);
    });
    particles.forEach(p => {
      ctx.globalAlpha = Math.max(0,p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI * 2);ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  function canMove() { return !paused && !reduceMotion.matches; }
  function schedule() {
    if (!frame && !stopped && inView && !document.hidden && (canMove() || particles.length)) frame = requestAnimationFrame(tick);
  }
  function tick(now) {
    frame = 0;
    const dt = Math.min((now - (last || now)) / 1000,.04);
    last = now;
    if (canMove()) balloons.forEach(b => {
      if (b.popped || b.button === document.activeElement) return;
      b.y -= b.speed * dt;
      b.phase += dt * .8;
      b.x = b.anchor + Math.sin(b.phase) * 11;
      if (b.y < -b.radius - 105) place(b,false);
    });
    particles.forEach(p => {p.x += p.vx * dt;p.y += p.vy * dt;p.vy += 250 * dt;p.life -= dt * 1.65;});
    particles = particles.filter(p => p.life > 0);
    paint();schedule();
  }
  function halt() { if (frame) cancelAnimationFrame(frame);frame = 0;last = 0; }
  function pop(b) {
    if (b.popped) return;
    const hadFocus = document.activeElement === b.button;
    b.popped = true;
    b.button.disabled = true;
    b.button.hidden = true;
    pops += 1;
    field.dataset.pops = String(pops);
    status.textContent = pops === 1 ? 'Balloon popped.' : `${pops} balloons popped.`;
    if (!reduceMotion.matches) for (let i = 0; i < 16; i++) particles.push({x:b.x,y:b.y,vx:(Math.random() - .5) * 300,vy:(Math.random() - .5) * 300,size:1.4 + Math.random() * 2.1,life:1,color:colorsFor(b.index).base});
    if (hadFocus) {
      const next = balloons.find(item => !item.popped && !item.button.hidden);
      (next?.button || motionButton).focus({preventScroll:true});
    }
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (stopped) return;
      place(b,paused || reduceMotion.matches);
      paint();schedule();
    },1400 + Math.random() * 600);
    timers.add(timer);
    paint();schedule();
  }
  function resize() {
    const nextWidth = field.clientWidth, nextHeight = field.clientHeight;
    if (!nextWidth || !nextHeight) return;
    const previousWidth = width, previousHeight = height;
    width = nextWidth;height = nextHeight;
    const dpr = Math.min(window.devicePixelRatio || 1,2);
    canvas.width = Math.round(width * dpr);canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if (!balloons.length) {
      for (let i = 0; i < 9; i++) {
        const button = document.createElement('button');
        button.type = 'button';button.className = 'balloon-hit';
        button.setAttribute('aria-label',`Pop balloon ${i + 1}`);
        const b = {index:i,button};
        button.addEventListener('pointerenter',e => {if (e.pointerType === 'mouse') pop(b);});
        button.addEventListener('click',() => pop(b));
        field.appendChild(button);balloons.push(b);place(b,true);
      }
    } else balloons.forEach(b => {b.anchor *= width / previousWidth;b.x *= width / previousWidth;b.y *= height / previousHeight;});
    particles = [];paint();schedule();
  }
  function remember() {
    try { sessionStorage.setItem('kalmorn-balloons-paused', String(paused)); } catch {}
  }
  motionButton.addEventListener('click',() => {paused = !paused;halt();syncMotionLabel();schedule();remember();});
  reduceMotion.addEventListener('change',() => {if (reduceMotion.matches) paused = true;particles = [];halt();syncMotionLabel();paint();schedule();});
  document.addEventListener('visibilitychange',() => {halt();schedule();});
  const visibility = new IntersectionObserver(entries => {inView = entries[0].isIntersecting;halt();schedule();},{threshold:0});
  visibility.observe(field);
  const sizing = new ResizeObserver(resize);sizing.observe(field);
  window.addEventListener('pagehide', event => {
    stopped = true;
    halt();
    if (!event.persisted) {
      timers.forEach(clearTimeout);
      sizing.disconnect();
      visibility.disconnect();
    }
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) { stopped = false; resize(); schedule(); }
  });
  window.addEventListener('resize', resize);
  syncMotionLabel();resize();
})();
