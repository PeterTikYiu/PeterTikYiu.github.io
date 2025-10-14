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

  // Enhanced theme toggle with animation
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.add('theme-transitioning');
      const currentTheme = getCurrentTheme();
      const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
      applyTheme(newTheme);
      try {
        localStorage.setItem(THEME_KEY, newTheme);
      } catch(e) {
        console.warn('Could not save theme preference:', e);
      }
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 300);
    });

    // Set initial button state
    const currentTheme = getCurrentTheme();
    themeToggle.setAttribute('aria-pressed', currentTheme === THEMES.DARK ? 'true' : 'false');
    themeToggle.setAttribute('data-theme-state', currentTheme);
  } else {
    console.error('Theme toggle button not found!');
  }

  // Enhanced scroll animations with intersection observer
  const enhancedObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('animate-in');
        // Add staggered animation for child elements
        const children = entry.target.querySelectorAll('.reveal');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('visible', 'animate-fadeIn');
          }, index * 100);
        });
        enhancedObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe all sections initially
  document.querySelectorAll('section').forEach(el => {
    enhancedObserver.observe(el);
  });

  // Function to observe dynamically added items
  function observeDynamicItems() {
    document.querySelectorAll('.project-card, .experience-item, .education-item, .certification-item, .language-item, .skill-badge').forEach(el => {
      if (!el.classList.contains('observed')) {
        el.classList.add('observed');
        enhancedObserver.observe(el);
      }
    });
  }

  // Load projects and render cards
  function renderProjects(projects){
    const container = document.getElementById('projectsGrid');
    if(!container) return;
    container.innerHTML = projects.map(p=>{
      // Show only first 10 words of description
      let desc = p.description.split(' ').slice(0, 10).join(' ');
      if (p.description.split(' ').length > 10) desc += '...';

      // Tech stack badges
      const techBadges = p.tech ? p.tech.map(tech => `<span class="tech-badge">${tech}</span>`).join('') : '';

      return `
        <article class="project-card reveal">
          <div class="mb-3 overflow-hidden rounded-md">
            <img src="${p.image}" alt="${p.title}" class="w-full h-44 object-cover bg-slate-100 dark:bg-slate-700" />
          </div>
          <h4 class="text-lg font-semibold mb-1">${p.title}</h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-3">${desc}</p>
          ${techBadges ? `<div class="tech-stack mb-3">${techBadges}</div>` : ''}
          <div class="flex gap-2 flex-wrap">
            <a href="${p.link}" target="_blank" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md transform hover:scale-105">View Code</a>
            ${p.demo ? `<a href="${p.demo}" target="_blank" class="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md transform hover:scale-105">Live Demo</a>` : ''}
          </div>
        </article>
      `;
    }).join('');
    // Projects will be observed by the global enhancedObserver
    observeDynamicItems();
  }

  fetch('data/projects.json')
    .then(res=>res.ok ? res.json() : Promise.reject('no projects'))
    .then(projects => {
      renderProjects(projects);
    })
    .catch(error => {
      console.error('Error loading projects:', error);
      // fallback: empty state
      const container = document.getElementById('projectsGrid');
      if(container) container.innerHTML = '<p class="text-slate-500">No projects found. Add some to <code>data/projects.json</code>.</p>';
    });

  // Load skills and render skill badges
  function renderSkills(skills){
    const container = document.getElementById('skillsGrid');
    if(!container) return;
    container.innerHTML = skills.map(skill=>{
      return `
        <div class="skill-badge reveal group">
          <div class="flex items-center justify-between p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div class="flex items-center gap-4">
              <span class="text-4xl group-hover:scale-110 transition-transform duration-300">${skill.icon}</span>
              <span class="text-lg font-medium text-slate-700 dark:text-slate-300">${skill.name}</span>
            </div>
            <span class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">${skill.level}</span>
          </div>
        </div>
      `;
    }).join('');
    // Skill badges will be observed by the global enhancedObserver
    observeDynamicItems();
  }

  fetch('data/skills.json')
    .then(res=>res.ok ? res.json() : Promise.reject('no skills'))
    .then(renderSkills)
    .catch(()=>{
      // fallback: empty state
      const container = document.getElementById('skillsGrid');
      if(container) container.innerHTML = '<p class="text-slate-500">Skills section coming soon...</p>';
    });

  // Load experience and render
  function renderExperience(experience){
    const container = document.getElementById('experienceList');
    if(!container) return;
    container.innerHTML = experience.map(exp=>{
      const achievements = exp.achievements.map(achievement => `<li class="text-slate-600 dark:text-slate-300 text-sm mb-1">• ${achievement}</li>`).join('');
      return `
        <div class="experience-item reveal bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h5 class="font-semibold text-slate-800 dark:text-slate-200">${exp.position}</h5>
              <p class="text-indigo-600 dark:text-indigo-400 font-medium">${exp.company}, ${exp.location}</p>
            </div>
            <span class="text-sm text-slate-500 dark:text-slate-400">${exp.period}</span>
          </div>
          <ul class="mt-3 space-y-1">
            ${achievements}
          </ul>
        </div>
      `;
    }).join('');
    observeReveals();
  }

  // Load education and render
  function renderEducation(education){
    const container = document.getElementById('educationList');
    if(!container) return;
    container.innerHTML = education.map(edu=>{
      return `
        <div class="education-item reveal bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <h5 class="font-semibold text-slate-800 dark:text-slate-200">${edu.degree}</h5>
          <p class="text-slate-600 dark:text-slate-300">${edu.institution}, ${edu.location}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">${edu.period}</p>
        </div>
      `;
    }).join('');
    // Education items will be observed by the global enhancedObserver
    observeDynamicItems();
  }

  // Load certifications and render
  function renderCertifications(certifications){
    const container = document.getElementById('certificationsList');
    if(!container) return;
    container.innerHTML = certifications.map(cert=>{
      return `
        <div class="certification-item reveal bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <h5 class="font-semibold text-slate-800 dark:text-slate-200">${cert.name}</h5>
          <p class="text-slate-600 dark:text-slate-300">${cert.issuer}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">${cert.year}</p>
        </div>
      `;
    }).join('');
    // Certification items will be observed by the global enhancedObserver
    observeDynamicItems();
  }

  fetch('data/experience.json')
    .then(res=>res.ok ? res.json() : Promise.reject('no experience'))
    .then(renderExperience)
    .catch(()=>{ console.log('Experience data not available'); });

  fetch('data/education.json')
    .then(res=>res.ok ? res.json() : Promise.reject('no education'))
    .then(renderEducation)
    .catch(()=>{ console.log('Education data not available'); });

  fetch('data/certifications.json')
    .then(res=>res.ok ? res.json() : Promise.reject('no certifications'))
    .then(renderCertifications)
    .catch(()=>{ console.log('Certifications data not available'); });

  // Load languages and render
  function renderLanguages(languages){
    const container = document.getElementById('languagesGrid');
    if(!container) return;
    container.innerHTML = languages.map(lang=>{
      return `
        <div class="language-item reveal text-center p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="text-3xl mb-2">${lang.flag}</div>
          <h5 class="font-semibold text-slate-800 dark:text-slate-200 mb-1">${lang.language}</h5>
          <p class="text-sm text-slate-600 dark:text-slate-300">${lang.proficiency}</p>
        </div>
      `;
    }).join('');
    // Language items will be observed by the global enhancedObserver
    observeDynamicItems();
  }

  fetch('data/languages.json')
    .then(res=>res.ok ? res.json() : Promise.reject('no languages'))
    .then(renderLanguages)
    .catch(()=>{ console.log('Languages data not available'); });

  // Enhanced contact form with loading states
  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const status = document.getElementById('contact-status');
      const submitBtn = document.getElementById('contact-submit');
      const submitText = document.getElementById('submit-text');

      if(submitBtn) submitBtn.disabled = true;
      if(submitText) submitText.textContent = 'Sending...';
      if(submitBtn) submitBtn.classList.add('loading');

      // Build form data
      const formData = new FormData(contactForm);
      try{
        const res = await fetch(contactForm.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
        if(res.ok){
          if(status) status.textContent = '✅ Message sent successfully!';
          if(submitText) submitText.textContent = 'Sent!';
          contactForm.reset();
          setTimeout(() => {
            if(submitText) submitText.textContent = 'Send Message';
          }, 2000);
        } else {
          const json = await res.json().catch(()=>null);
          const err = (json && json.error) ? json.error : 'Failed to send message.';
          if(status) status.textContent = '❌ ' + err;
          if(submitText) submitText.textContent = 'Try Again';
        }
      }catch(err){
        if(status) status.textContent = '❌ Network error. Please try again later.';
        if(submitText) submitText.textContent = 'Try Again';
      } finally {
        if(submitBtn) submitBtn.disabled = false;
        if(submitBtn) submitBtn.classList.remove('loading');
        setTimeout(()=>{ if(status) status.textContent = ''; }, 6000);
      }
    });
  }

  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add particle effect to hero section (subtle)
  const createParticles = () => {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(79, 70, 229, 0.3);
        border-radius: 50%;
        pointer-events: none;
        animation: float ${Math.random() * 10 + 10}s linear infinite;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 10}s;
      `;
      heroSection.appendChild(particle);
    }
  };

  createParticles();

  // Add CSS for particles
  const particleStyle = document.createElement('style');
  particleStyle.textContent = `
    @keyframes float {
      0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
    }
    .theme-transitioning * {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
    }
  `;
  document.head.appendChild(particleStyle);
});