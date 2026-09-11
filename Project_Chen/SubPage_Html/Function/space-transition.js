'use strict';

// 短时运行的透视粒子：先收拢，再沿 Z 轴穿过观察点；退出时立即释放动画帧。
window.PROX_SPACE = Object.freeze({
  create(canvas) {
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let finish = null;

    function stop() {
      cancelAnimationFrame(frame);
      canvas.hidden = true;
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (finish) { const done = finish; finish = null; done(); }
    }

    function play() {
      stop();
      if (!ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
      const width = innerWidth;
      const height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.hidden = false;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.hypot(width, height) * .65;
      const particles = Array.from({ length: width < 600 ? 125 : 220 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const r = radius * (.12 + Math.random());
        return { x: Math.cos(angle) * r, y: Math.sin(angle) * r, z: 100 + Math.random() * 1900, size: .5 + Math.random() * 1.3, previous: null };
      });
      const started = performance.now();
      return new Promise(resolve => {
        finish = resolve;
        function draw(now) {
          const elapsed = now - started;
          if (elapsed >= 1500) { stop(); return; }
          ctx.clearRect(0, 0, width, height);
          const gathering = Math.min(elapsed / 520, 1);
          const burst = Math.max(0, (elapsed - 520) / 980);
          const squeeze = 1 - .97 * gathering ** 3;
          const fade = burst > .65 ? (1 - burst) / .35 : 1;
          const travel = burst ** .65 * 2500;
          const spread = burst ? .03 + (1 - (1 - burst) ** 4) : squeeze;
          const glowSize = burst ? 24 + burst * radius * .8 : 20 + (1 - gathering) * 170;
          const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
          glow.addColorStop(0, `rgba(177,221,255,${(.03 + gathering * .12) * fade})`);
          glow.addColorStop(.2, `rgba(120,187,234,${.07 * fade})`);
          glow.addColorStop(1, 'rgba(95,165,220,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, width, height);

          for (const point of particles) {
            const depth = point.z - travel;
            if (depth < -570) continue;
            const perspective = 650 / (650 + depth);
            const x = cx + point.x * spread * perspective;
            const y = cy + point.y * spread * perspective;
            if (Math.abs(x - cx) > width || Math.abs(y - cy) > height) continue;
            const alpha = Math.min(.82, .3 + perspective * .16) * fade;
            ctx.strokeStyle = `rgba(183,222,255,${alpha})`;
            ctx.lineWidth = Math.min(2.5, point.size * perspective);
            if (point.previous) {
              ctx.beginPath(); ctx.moveTo(point.previous.x, point.previous.y); ctx.lineTo(x, y); ctx.stroke();
            }
            ctx.fillStyle = `rgba(213,237,255,${alpha})`;
            ctx.beginPath(); ctx.arc(x, y, Math.max(.3, Math.min(2, point.size * perspective)), 0, Math.PI * 2); ctx.fill();
            point.previous = { x, y };
          }

          // 椭圆压缩成核心，随后作为冲击环越过屏幕；不使用整屏白闪。
          for (let i = 0; i < 3; i++) {
            const r = burst ? 18 + burst ** .65 * radius * (1 + i * .25) : 18 + (1 - gathering ** 2) * radius * (.55 + i * .2);
            ctx.strokeStyle = `rgba(174,220,250,${.22 * fade * (1 - i * .2)})`;
            ctx.lineWidth = .8;
            ctx.beginPath(); ctx.ellipse(cx, cy, r, r * (burst ? .55 + burst * .35 : .6 - gathering * .35), i * .24, 0, Math.PI * 2); ctx.stroke();
          }
          frame = requestAnimationFrame(draw);
        }
        frame = requestAnimationFrame(draw);
      });
    }
    return Object.freeze({ play, stop });
  }
});
