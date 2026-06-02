export function startMotion(canvas) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let particles = [];
  const pointer = { x: 0.5, y: 0.5, active: false };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = innerWidth;
    height = innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: Math.round(Math.min(48, Math.max(24, width / 34))) }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: 1 + Math.random() * 2,
      tone: index % 2 ? "rgba(232,255,112," : "rgba(114,242,208,",
    }));
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "lighter";
    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      if (!reduced) {
        a.x += a.vx;
        a.y += a.vy;
      }
      if (a.x < -20) a.x = width + 20;
      if (a.x > width + 20) a.x = -20;
      if (a.y < -20) a.y = height + 20;
      if (a.y > height + 20) a.y = -20;
      const dx = a.x - pointer.x * width;
      const dy = a.y - pointer.y * height;
      const pulse = pointer.active ? Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 220) : 0;
      context.beginPath();
      context.fillStyle = a.tone + (0.22 + pulse * 0.36) + ")";
      context.arc(a.x, a.y, a.r + pulse * 4, 0, Math.PI * 2);
      context.fill();
      for (let j = i + 1; j < particles.length; j += 2) {
        const b = particles[j];
        const x = a.x - b.x;
        const y = a.y - b.y;
        const distance = Math.sqrt(x * x + y * y);
        if (distance > 96) continue;
        context.strokeStyle = "rgba(255,255,255," + (0.1 * (1 - distance / 96)) + ")";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }
    context.globalCompositeOperation = "source-over";
    setTimeout(() => requestAnimationFrame(draw), 45);
  }

  addEventListener("resize", resize);
  canvas.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX / Math.max(1, width);
    pointer.y = event.clientY / Math.max(1, height);
    pointer.active = true;
  });
  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
  resize();
  draw();
}
