// ---------- Portfolio grid (from /api/projects) ----------
async function loadProjects() {
  const grid = document.getElementById('work-grid');
  try {
    const res = await fetch('/data/projects.json');
    const projects = await res.json();
    grid.innerHTML = projects.map(p => `
      <article class="work-card">
        <img src="${p.image}" alt="${p.title}" loading="lazy">
        <div class="work-card__body">
          <span class="work-card__tag">${p.category}</span>
          <h3>${p.title}</h3>
          <p>${p.description}</p>
        </div>
      </article>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<p>Could not load projects right now.</p>';
  }
}

// ---------- Testimonial rotator (from /api/testimonials) ----------
let testimonials = [];
let activeTestimonial = 0;

async function loadTestimonials() {
  try {
    const res = await fetch('/data/testimonials.json');
    testimonials = await res.json();
    renderTestimonial(0);
    renderDots();
    setInterval(() => {
      activeTestimonial = (activeTestimonial + 1) % testimonials.length;
      renderTestimonial(activeTestimonial);
    }, 6000);
  } catch (err) {
    document.getElementById('testimonial-quote').textContent = 'Could not load testimonials.';
  }
}

function renderTestimonial(i) {
  if (!testimonials.length) return;
  activeTestimonial = i;
  const t = testimonials[i];
  document.getElementById('testimonial-quote').textContent = `“${t.quote}”`;
  document.getElementById('testimonial-author').textContent = `${t.name} — ${t.role}`;
  document.querySelectorAll('.testimonial-dots span').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === i);
  });
}

function renderDots() {
  const dotsEl = document.getElementById('testimonial-dots');
  dotsEl.innerHTML = testimonials.map((_, idx) =>
    `<span data-idx="${idx}"></span>`).join('');
  dotsEl.querySelectorAll('span').forEach(dot => {
    dot.addEventListener('click', () => renderTestimonial(Number(dot.dataset.idx)));
  });
  renderTestimonial(0);
}

// ---------- Live status pill (from /health) ----------
// This is a small, direct nod to the monitoring requirement: the
// site's own health check is visible to visitors, not just to Nagios.
async function pollHealth() {
  const dotEls = [document.getElementById('status-dot'), document.getElementById('status-dot-footer')];
  const textEls = [document.getElementById('status-text'), document.getElementById('status-text-footer')];
  try {
    const res = await fetch('/health');
    const ok = res.ok;
    dotEls.forEach(el => {
      el.classList.toggle('up', ok);
      el.classList.toggle('down', !ok);
    });
    textEls.forEach(el => el.textContent = ok ? 'All systems operational' : 'Degraded');
  } catch (err) {
    dotEls.forEach(el => el.classList.add('down'));
    textEls.forEach(el => el.textContent = 'Unreachable');
  }
}

loadProjects();
loadTestimonials();
pollHealth();
setInterval(pollHealth, 15000);
