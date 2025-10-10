// Theme: initialize from localStorage
const THEME_KEY = 'theme-dark';
function isSystemDark(){
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function applyTheme(dark){
  if (dark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = dark ? '🌙' : '🌞';
}
try{
  const stored = localStorage.getItem(THEME_KEY);
  const dark = stored === null ? isSystemDark() : stored === '1';
  applyTheme(dark);
}catch(e){ applyTheme(isSystemDark()); }

const toggle = document.getElementById('theme-toggle');
if (toggle) toggle.addEventListener('click', () => {
  const dark = !document.documentElement.classList.contains('dark');
  applyTheme(dark);
  try{ localStorage.setItem(THEME_KEY, dark ? '1' : '0'); }catch(e){}
});

// Reveal animation using IntersectionObserver
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
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
  container.innerHTML = projects.map(p=>`
    <article class="project-card reveal">
      <div class="mb-3 overflow-hidden rounded-md">
        <img src="${p.image}" alt="${p.title}" class="w-full h-44 object-cover bg-slate-100 dark:bg-slate-700" />
      </div>
      <h4 class="text-lg font-semibold mb-1">${p.title}</h4>
      <p class="text-sm text-slate-600 dark:text-slate-300 mb-3">${p.description}</p>
      <a href="${p.link}" target="_blank" class="text-indigo-600 dark:text-indigo-400 hover:underline">View Project →</a>
    </article>
  `).join('');
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