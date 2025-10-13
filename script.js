document.addEventListener('DOMContentLoaded', function() {
  // Left-to-right intro animation (JS only, from far left)
  var intro = document.querySelector('.intro-slide');
  if (intro) {
    intro.style.opacity = '0';
    intro.style.transform = 'translateX(-300px)'; // farther left
    setTimeout(function() {
      intro.style.transition = 'opacity 1.1s cubic-bezier(.4,0,.2,1), transform 1.1s cubic-bezier(.4,0,.2,1)';
      intro.style.opacity = '1';
      intro.style.transform = 'translateX(0)';
    }, 200);
  }

  // Theme: initialize from localStorage with explicit state management
  const THEME_KEY = 'theme-state';
  const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
  };

  function isSystemDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function getCurrentTheme() {
    return document.documentElement.classList.contains('dark') ? THEMES.DARK : THEMES.LIGHT;
  }

  function applyTheme(theme) {
    const isDark = theme === THEMES.DARK;
    // Only toggle 'dark' class on <html> for Tailwind dark mode
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', theme);

    // Update theme icon
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = isDark ? '🌙' : '🌞';

    // Update button state
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      toggle.setAttribute('data-theme-state', theme);
    }
  }

  // Initialize theme with fallback chain: localStorage -> system preference -> light
  function initTheme() {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored && (stored === THEMES.LIGHT || stored === THEMES.DARK)) {
        applyTheme(stored);
      } else {
        applyTheme(isSystemDark() ? THEMES.DARK : THEMES.LIGHT);
      }
    } catch(e) {
      applyTheme(THEMES.LIGHT); // Safest fallback
    }
  }

  // Call theme initialization
  initTheme();

  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const currentTheme = getCurrentTheme();
      const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
      applyTheme(newTheme);
      try {
        localStorage.setItem(THEME_KEY, newTheme);
      } catch(e) {
        console.warn('Could not save theme preference:', e);
      }
    });

    // Set initial button state
    const currentTheme = getCurrentTheme();
    toggle.setAttribute('aria-pressed', currentTheme === THEMES.DARK ? 'true' : 'false');
    toggle.setAttribute('data-theme-state', currentTheme);
  } else {
    console.error('Theme toggle button not found!');
  }

  // Reveal animation using IntersectionObserver with fade-in
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible', 'animate-fadeIn');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:0.12});

  function observeReveals(){
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  }

  // Load projects and render cards
  function renderProjects(projects){
    const container = document.getElementById('projectsGrid');
    if(!container) return;
    container.innerHTML = projects.map(p=>{
      // Show only first 10 words of description
      let desc = p.description.split(' ').slice(0, 10).join(' ');
      if (p.description.split(' ').length > 10) desc += '...';
      return `
        <article class="project-card reveal">
          <div class="mb-3 overflow-hidden rounded-md">
            <img src="${p.image}" alt="${p.title}" class="w-full h-44 object-cover bg-slate-100 dark:bg-slate-700" />
          </div>
          <h4 class="text-lg font-semibold mb-1">${p.title}</h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-3">${desc}</p>
          <a href="${p.link}" target="_blank" class="text-indigo-600 dark:text-indigo-400 hover:underline">View Project →</a>
        </article>
      `;
    }).join('');
    observeReveals();
  }

  fetch('data/projects.json')
    .then(res=>res.ok ? res.json() : Promise.reject('no projects'))
    .then(renderProjects)
    .catch(()=>{
      // fallback: empty state
      const container = document.getElementById('projectsGrid');
      if(container) container.innerHTML = '<p class="text-slate-500">No projects found. Add some to <code>data/projects.json</code>.</p>';
    });

  // Contact form: progressive enhancement using Formspree
  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const status = document.getElementById('contact-status');
      const submitBtn = document.getElementById('contact-submit');
      if(submitBtn) submitBtn.disabled = true;
      if(status) status.textContent = 'Sending...';

      // Build form data
      const formData = new FormData(contactForm);
      try{
        const res = await fetch(contactForm.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
        if(res.ok){
          if(status) status.textContent = 'Message sent — thank you!';
          contactForm.reset();
        } else {
          const json = await res.json().catch(()=>null);
          const err = (json && json.error) ? json.error : 'Failed to send message.';
          if(status) status.textContent = err;
        }
      }catch(err){
        if(status) status.textContent = 'Network error. Please try again later.';
      } finally {
        if(submitBtn) submitBtn.disabled = false;
        setTimeout(()=>{ if(status) status.textContent = ''; }, 6000);
      }
    });
  }
});