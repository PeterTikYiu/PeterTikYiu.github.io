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

  // SVG icons for theme toggle
  const SUN_ICON = `<i data-lucide="sun" class="w-4 h-4"></i>`;
  const MOON_ICON = `<i data-lucide="moon" class="w-4 h-4"></i>`;

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
    if (icon) {
      icon.innerHTML = isDark ? MOON_ICON : SUN_ICON;
      // Re-run Lucide to render the injected <i data-lucide> into SVG
      try {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      } catch (_) {
        // non-fatal if lucide is not available yet
      }
    }

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
        try {
          if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
          }
        } catch (_) {}
      }, 300);
    });

    // Set initial button state
    const currentTheme = getCurrentTheme();
    themeToggle.setAttribute('aria-pressed', currentTheme === THEMES.DARK ? 'true' : 'false');
    themeToggle.setAttribute('data-theme-state', currentTheme);
  } else {
    console.error('Theme toggle button not found!');
  }

  // Language switching functionality
  const LANG_KEY = 'language-state';
  const LANGUAGES = {
    EN: 'en',
    ZH: 'zh',
    TW: 'tw'
  };

  // SVG icon for language toggle
  const GLOBE_ICON = `<i data-lucide="languages" class="w-4 h-4"></i>`;

  // Loading overlay and page-turn animation helpers
  const pageWrapper = document.getElementById('page-turn-wrapper');
  let isTransitioning = false;

  // Loading overlay stubs (overlay removed from HTML) to avoid runtime errors
  function showLoadingOverlay(){ /* no-op */ }
  function hideLoadingOverlay(){ /* no-op */ }

  function pageTurnIn() {
    if (!pageWrapper) return Promise.resolve();
    return new Promise(resolve => {
      pageWrapper.classList.add('page-turn-enter');
      // Force reflow to ensure transition applies
      // eslint-disable-next-line no-unused-expressions
      pageWrapper.offsetHeight;
      pageWrapper.classList.add('page-turn-active');
      pageWrapper.classList.remove('page-turn-exit', 'page-turn-exit-active');
      setTimeout(() => {
        pageWrapper.classList.remove('page-turn-enter', 'page-turn-active');
        resolve();
      }, 850);
    });
  }

  function pageTurnOut() {
    if (!pageWrapper) return Promise.resolve();
    return new Promise(resolve => {
      pageWrapper.classList.add('page-turn-exit');
      // Force reflow
      // eslint-disable-next-line no-unused-expressions
      pageWrapper.offsetHeight;
      pageWrapper.classList.add('page-turn-exit-active');
      setTimeout(() => {
        pageWrapper.classList.remove('page-turn-exit', 'page-turn-exit-active');
        resolve();
      }, 850);
    });
  }

  // Card-only page turn helpers
  function getCardElements() {
    return Array.from(document.querySelectorAll(
      '.project-card, .experience-item, .education-item, .certification-item, .skill-badge, .language-item, .intro-slide'
    ));
  }

  function pageTurnCardsOut() {
    const cards = getCardElements();
    if (cards.length === 0) return Promise.resolve();
    const staggerDelay = 25;
    const animationDuration = 700;
    cards.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('page-turn-exit');
        // Force reflow
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight;
        el.classList.add('page-turn-exit-active');
      }, index * staggerDelay);
    });
    return new Promise(resolve => setTimeout(resolve, (cards.length - 1) * staggerDelay + animationDuration));
  }

  function pageTurnCardsIn() {
    const cards = getCardElements();
    if (cards.length === 0) return Promise.resolve();
    const staggerDelay = 25;
    const animationDuration = 700;
    cards.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('page-turn-enter');
        // Force reflow
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight;
        el.classList.add('page-turn-active');
        el.classList.remove('page-turn-exit', 'page-turn-exit-active');
      }, (cards.length - 1 - index) * staggerDelay);
    });
    return new Promise(resolve => setTimeout(() => {
      cards.forEach(el => {
        el.classList.remove('page-turn-enter', 'page-turn-active');
        el.classList.add('visible');
        el.classList.remove('reveal'); // Remove reveal to keep cards always visible
      });
      resolve();
    }, (cards.length - 1) * staggerDelay + animationDuration));
  }

  // Glow effect: track pointer position per card and set CSS vars for radial gradient
  function wireGlowEffect() {
    const cards = getCardElements();
    cards.forEach(card => {
      // Add class if not present
      if (!card.classList.contains('glow-pick')) card.classList.add('glow-pick');
      // Attach mousemove once
      if (!card.__glowBound) {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const mx = ((e.clientX - rect.left) / rect.width) * 100 + '%';
          const my = ((e.clientY - rect.top) / rect.height) * 100 + '%';
          card.style.setProperty('--mx', mx);
          card.style.setProperty('--my', my);
        });
        card.__glowBound = true;
      }
    });
  }

  let currentTranslations = {};

  // Load language file
  async function loadLanguage(lang) {
    try {
      const response = await fetch(`data/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
      currentTranslations = await response.json();
      return true;
    } catch (error) {
      console.error('Error loading language file:', error);
      // Fallback to embedded English data
      if (lang === LANGUAGES.EN) {
        currentTranslations = {
          "nav": {
            "viewProjects": "View Projects",
            "contact": "Contact Me"
          },
          "hero": {
            "title": "Hello, I'm Man Tik.",
            "subtitle": "I build responsive, accessible web interfaces using JavaScript and modern CSS. Welcome to my portfolio.",
            "viewProjects": "View Projects",
            "contactMe": "Contact Me"
          },
          "sections": {
            "about": "About Me",
            "workExperience": "Work Experience",
            "education": "Education",
            "certifications": "Certifications",
            "skills": "Skills & Technologies",
            "languages": "Languages",
            "projects": "Projects",
            "contact": "Get In Touch"
          },
          "education": {
            "degree": "Diploma of Higher Education Computer Science",
            "institution": "UOW College",
            "location": "Hong Kong",
            "period": "September 2018 - September 2020"
          },
          "skills": [
            {
              "name": "JavaScript",
              "icon": "🟨",
              "level": "Advanced"
            },
            {
              "name": "HTML5",
              "icon": "🏗️",
              "level": "Expert"
            },
            {
              "name": "CSS3",
              "icon": "🎨",
              "level": "Expert"
            },
            {
              "name": "Tailwind CSS",
              "icon": "💨",
              "level": "Advanced"
            },
            {
              "name": "React",
              "icon": "⚛️",
              "level": "Intermediate"
            },
            {
              "name": "Node.js",
              "icon": "🟢",
              "level": "Intermediate"
            },
            {
              "name": "Git",
              "icon": "📚",
              "level": "Advanced"
            },
            {
              "name": "Figma",
              "icon": "🎯",
              "level": "Intermediate"
            }
          ],
          "languages": [
            {
              "language": "English",
              "proficiency": "Fluent"
            },
            {
              "language": "Chinese (Cantonese)",
              "proficiency": "Fluent"
            },
            {
              "language": "Chinese (Mandarin)",
              "proficiency": "Fluent"
            },
            {
              "language": "Spanish",
              "proficiency": "Elementary"
            },
            {
              "language": "German",
              "proficiency": "Elementary"
            }
          ],
          "footer": {
            "copyright": "© ManTik — Built with HTML, Tailwind CSS, and JavaScript"
          }
        };
        return true;
      } else if (lang === LANGUAGES.TW) {
        currentTranslations = {
          "nav": {
            "viewProjects": "查看專案",
            "contact": "聯絡我"
          },
          "hero": {
            "title": "你好，我是Man Tik。",
            "subtitle": "我使用JavaScript和現代CSS構建響應式、可訪問的Web介面。歡迎來到我的作品集。",
            "viewProjects": "查看專案",
            "contactMe": "聯絡我"
          },
          "sections": {
            "about": "關於我",
            "workExperience": "工作經驗",
            "education": "教育背景",
            "certifications": "認證",
            "skillsTitle": "技能與技術",
            "languages": "語言能力",
            "projects": "專案",
            "contact": "聯絡方式"
          },
          "contact": {
            "info": "聯絡資訊",
            "sendMessage": "發送訊息",
            "namePlaceholder": "您的姓名",
            "emailPlaceholder": "您的電子郵件",
            "messagePlaceholder": "訊息內容",
            "sendButton": "發送訊息",
            "sending": "發送中...",
            "sent": "已發送！",
            "tryAgain": "重試",
            "success": "✅ 訊息發送成功！",
            "error": "❌ 網路錯誤，請稍後重試。",
            "fail": "❌ 發送失敗。"
          },
          "projects": {
            "viewCode": "查看程式碼",
            "liveDemo": "線上演示"
          },
          "certifications": [
            {
              "name": "Google 高級資料分析專業證書",
              "issuer": "Google",
              "year": "2024年10月"
            },
            {
              "name": "機器學習數學專項課程",
              "issuer": "倫敦帝國學院",
              "year": "2024年10月"
            },
            {
              "name": "CS50X",
              "issuer": "哈佛大學",
              "year": "2024年9月"
            },
            {
              "name": "CS50 Python",
              "issuer": "哈佛大學",
              "year": "2024年9月"
            }
          ],
          "experience": {
            "current": "全端工程師（實習）",
            "company": "ladybirds ai.ltd",
            "location": "曼徹斯特",
            "period": "2025年10月 - 2025年10月",
            "achievements": [
              "架構和部署創新的inCall功能，提升使用者體驗",
              "開發全面的資料集以改善語音辨識和意圖分類",
              "監控資料管道以確保無縫日誌記錄和評估流程",
              "促進AskMyGP工作流程在試點部署中的整合以優化運營",
              "領導AI輸出的品質保證工作，專注於轉錄準確性和資料完整性"
            ]
          },
          "education": {
            "degree": "電腦科學高等教育文憑",
            "institution": "UOW學院",
            "location": "香港",
            "period": "2018年9月 - 2020年9月"
          },
          "skills": [
            {
              "name": "JavaScript",
              "icon": "🟨",
              "level": "高級"
            },
            {
              "name": "HTML5",
              "icon": "🏗️",
              "level": "專家"
            },
            {
              "name": "CSS3",
              "icon": "🎨",
              "level": "專家"
            },
            {
              "name": "Tailwind CSS",
              "icon": "💨",
              "level": "高級"
            },
            {
              "name": "React",
              "icon": "⚛️",
              "level": "中級"
            },
            {
              "name": "Node.js",
              "icon": "🟢",
              "level": "中級"
            },
            {
              "name": "Git",
              "icon": "📚",
              "level": "高級"
            },
            {
              "name": "Figma",
              "icon": "🎯",
              "level": "中級"
            }
          ],
          "languages": [
            {
              "language": "英語",
              "proficiency": "流利"
            },
            {
              "language": "中文（粵語）",
              "proficiency": "流利"
            },
            {
              "language": "中文（普通話）",
              "proficiency": "流利"
            },
            {
              "language": "西班牙語",
              "proficiency": "基礎"
            },
            {
              "language": "德語",
              "proficiency": "基礎"
            }
          ],
          "footer": {
            "copyright": "© ManTik — 使用HTML、Tailwind CSS和JavaScript構建"
          }
        };
        return true;
      }
      return false;
    }
  }

  // Update all elements with data-i18n attributes
  function updateTranslations() {
    // Update elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      let translation = getNestedValue(currentTranslations, key);
      // Provide alias fallbacks for older keys
      if (!translation) {
        const aliasMap = {
          'sections.skillsTitle': ['sections.skills']
        };
        if (aliasMap[key]) {
          for (const alt of aliasMap[key]) {
            translation = getNestedValue(currentTranslations, alt);
            if (translation) break;
          }
        }
      }
      if (translation) {
        element.textContent = translation;
      }
    });

    // Update placeholders with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = getNestedValue(currentTranslations, key);
      if (translation) {
        element.placeholder = translation;
      }
    });
  }

  // Helper function to get nested object values
  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  // Apply language
  function applyLanguage(lang) {
    document.documentElement.setAttribute('data-lang', lang);

    // Update language toggle button
    const langIcon = document.getElementById('lang-icon');
    if (langIcon) {
      if (lang === LANGUAGES.EN) {
        langIcon.textContent = '🇺🇸';
      } else if (lang === LANGUAGES.ZH) {
        langIcon.textContent = '🇨🇳';
      } else if (lang === LANGUAGES.TW) {
        langIcon.textContent = '🇹🇼';
      }
    }
  }

  // Initialize language with fallback chain: localStorage -> en (default)
  async function initLanguage() {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      let lang = LANGUAGES.EN; // default

      if (stored && Object.values(LANGUAGES).includes(stored)) {
        lang = stored;
      }

  // Initial sequence: show loader for 1s, then render (no page turn on initial load)
      showLoadingOverlay();
      await new Promise(r => setTimeout(r, 1000));

      const success = await loadLanguage(lang);
      if (success) {
        applyLanguage(lang);
        updateTranslations();
        renderExperience();
        renderEducation();
        renderCertifications();
        renderSkills();
        renderLanguages();
        await renderProjects();
        // Pop-in animation on initial load
        await pageTurnCardsIn();
        // Also ensure any remaining reveal elements fade in
        triggerInitialAnimations();
      } else {
        // Fallback to embedded English (correct schema)
        currentTranslations = {
          "nav": {
            "viewProjects": "View Projects",
            "contact": "Contact Me"
          },
          "hero": {
            "title": "Hello, I'm Man Tik.",
            "subtitle": "I build responsive, accessible web interfaces using JavaScript and modern CSS. Welcome to my portfolio.",
            "viewProjects": "View Projects",
            "contactMe": "Contact Me"
          },
          "sections": {
            "about": "About Me",
            "workExperience": "Work Experience",
            "education": "Education",
            "certifications": "Certifications",
            "skills": "Skills & Technologies",
            "skillsTitle": "Skills & Technologies",
            "languages": "Languages",
            "projects": "Projects",
            "contact": "Get In Touch"
          },
          "contact": {
            "info": "Contact Information",
            "sendMessage": "Send a Message",
            "namePlaceholder": "Your Name",
            "emailPlaceholder": "Your Email",
            "messagePlaceholder": "Message",
            "sendButton": "Send Message",
            "sending": "Sending...",
            "sent": "Sent!",
            "tryAgain": "Try Again",
            "success": "✅ Message sent successfully!",
            "error": "❌ Network error. Please try again later.",
            "fail": "❌ Failed to send message."
          },
          "projects": {
            "viewCode": "View Code",
            "liveDemo": "Live Demo",
            "items": [
              { "title": "Weather App", "description": "Displays live weather data using OpenWeatherMap API." },
              { "title": "Recipe Finder AI", "description": "AI-powered Recipe Finder that personalizes meals, calculates calories, and recommends healthy recipes based on your goals, preferences, and cuisine style." }
            ]
          },
          "experience": {
            "current": "Full-Stack Engineer (Internship)",
            "company": "ladybirds ai.ltd",
            "location": "MANCHESTER",
            "period": "October 2025 - October 2025",
            "achievements": [
              "Architected and deployed innovative inCall features, enhancing user experience",
              "Developed comprehensive datasets for improved speech recognition and intent classification",
              "Monitored data pipelines for seamless logging and evaluation processes",
              "Facilitated integration of AskMyGP workflows in pilot deployments to optimise operations",
              "Led QA efforts for AI outputs, focusing on transcription accuracy and data integrity"
            ]
          },
          "education": {
            "degree": "Diploma of Higher Education Computer Science",
            "institution": "UOW College",
            "location": "Hong Kong",
            "period": "September 2018 - September 2020"
          },
          "skills": [
            {
              "name": "JavaScript",
              "icon": "🟨",
              "level": "Advanced"
            },
            {
              "name": "HTML5",
              "icon": "🏗️",
              "level": "Expert"
            },
            {
              "name": "CSS3",
              "icon": "🎨",
              "level": "Expert"
            },
            {
              "name": "Tailwind CSS",
              "icon": "💨",
              "level": "Advanced"
            },
            {
              "name": "React",
              "icon": "⚛️",
              "level": "Intermediate"
            },
            {
              "name": "Node.js",
              "icon": "🟢",
              "level": "Intermediate"
            },
            {
              "name": "Git",
              "icon": "📚",
              "level": "Advanced"
            },
            {
              "name": "Figma",
              "icon": "🎯",
              "level": "Intermediate"
            }
          ],
          "languages": [
            {
              "language": "English",
              "proficiency": "Fluent"
            },
            {
              "language": "Chinese (Cantonese)",
              "proficiency": "Fluent"
            },
            {
              "language": "Chinese (Mandarin)",
              "proficiency": "Fluent"
            },
            {
              "language": "Spanish",
              "proficiency": "Elementary"
            },
            {
              "language": "German",
              "proficiency": "Elementary"
            }
          ],
          "certifications": [
            { "name": "Google Advanced Data Analytics Professional Certificate", "issuer": "Google", "year": "October 2024" },
            { "name": "Mathematics for Machine Learning Specialization", "issuer": "Imperial College London", "year": "October 2024" },
            { "name": "CS50X", "issuer": "Harvard University", "year": "September 2024" },
            { "name": "CS50 Python", "issuer": "Harvard University", "year": "September 2024" }
          ],
          "footer": {
            "copyright": "© ManTik — Built with HTML, Tailwind CSS, and JavaScript"
          }
        };
        applyLanguage(LANGUAGES.EN);
        updateTranslations();
        // Re-render dynamic content with fallback language
        renderExperience();
        renderEducation();
        renderCertifications();
        renderSkills();
        renderLanguages();
  renderProjects();
  // Pop-in animation on initial load (fallback path)
  await pageTurnCardsIn();
  // Trigger animations for initially visible elements
  triggerInitialAnimations();
      }
      hideLoadingOverlay();
    } catch(e) {
      console.warn('Could not initialize language:', e);
      // Load embedded English as fallback (correct schema)
      currentTranslations = {
        "nav": {
          "viewProjects": "View Projects",
          "contact": "Contact Me"
        },
        "hero": {
          "title": "Hello, I'm Man Tik.",
          "subtitle": "I build responsive, accessible web interfaces using JavaScript and modern CSS. Welcome to my portfolio.",
          "viewProjects": "View Projects",
          "contactMe": "Contact Me"
        },
        "sections": {
          "about": "About Me",
          "workExperience": "Work Experience",
          "education": "Education",
          "certifications": "Certifications",
          "skills": "Skills & Technologies",
          "skillsTitle": "Skills & Technologies",
          "languages": "Languages",
          "projects": "Projects",
          "contact": "Get In Touch"
        },
        "contact": {
          "info": "Contact Information",
          "sendMessage": "Send a Message",
          "namePlaceholder": "Your Name",
          "emailPlaceholder": "Your Email",
          "messagePlaceholder": "Message",
          "sendButton": "Send Message",
          "sending": "Sending...",
          "sent": "Sent!",
          "tryAgain": "Try Again",
          "success": "✅ Message sent successfully!",
          "error": "❌ Network error. Please try again later.",
          "fail": "❌ Failed to send message."
        },
        "projects": {
          "viewCode": "View Code",
          "liveDemo": "Live Demo",
          "items": [
            { "title": "Weather App", "description": "Displays live weather data using OpenWeatherMap API." },
            { "title": "Recipe Finder AI", "description": "AI-powered Recipe Finder that personalizes meals, calculates calories, and recommends healthy recipes based on your goals, preferences, and cuisine style." }
          ]
        },
        "certifications": [
          {
            "name": "Google Advanced Data Analytics Professional Certificate",
            "issuer": "Google",
            "year": "October 2024"
          },
          {
            "name": "Mathematics for Machine Learning Specialization",
            "issuer": "Imperial College London",
            "year": "October 2024"
          },
          {
            "name": "CS50X",
            "issuer": "Harvard University",
            "year": "September 2024"
          },
          {
            "name": "CS50 Python",
            "issuer": "Harvard University",
            "year": "September 2024"
          }
        ],
        "experience": {
          "current": "Full-Stack Engineer (Internship)",
          "company": "ladybirds ai.ltd",
          "location": "MANCHESTER",
          "period": "October 2025 - October 2025",
          "achievements": [
            "Architected and deployed innovative inCall features, enhancing user experience",
            "Developed comprehensive datasets for improved speech recognition and intent classification",
            "Monitored data pipelines for seamless logging and evaluation processes",
            "Facilitated integration of AskMyGP workflows in pilot deployments to optimise operations",
            "Led QA efforts for AI outputs, focusing on transcription accuracy and data integrity"
          ]
        },
        "education": {
          "degree": "Diploma of Higher Education Computer Science",
          "institution": "UOW College",
          "location": "Hong Kong",
          "period": "September 2018 - September 2020"
        },
        "skills": [
          {
            "name": "JavaScript",
            "icon": "🟨",
            "level": "Advanced"
          },
          {
            "name": "HTML5",
            "icon": "🏗️",
            "level": "Expert"
          },
          {
            "name": "CSS3",
            "icon": "🎨",
            "level": "Expert"
          },
          {
            "name": "Tailwind CSS",
            "icon": "💨",
            "level": "Advanced"
          },
          {
            "name": "React",
            "icon": "⚛️",
            "level": "Intermediate"
          },
          {
            "name": "Node.js",
            "icon": "🟢",
            "level": "Intermediate"
          },
          {
            "name": "Git",
            "icon": "📚",
            "level": "Advanced"
          },
          {
            "name": "Figma",
            "icon": "🎯",
            "level": "Intermediate"
          }
        ],
        "languages": [
          {
            "language": "English",
            "proficiency": "Fluent"
          },
          {
            "language": "Chinese (Cantonese)",
            "proficiency": "Fluent"
          },
          {
            "language": "Chinese (Mandarin)",
            "proficiency": "Fluent"
          },
          {
            "language": "Spanish",
            "proficiency": "Elementary"
          },
          {
            "language": "German",
            "proficiency": "Elementary"
          }
        ],
        "footer": {
          "copyright": "© ManTik — Built with HTML, Tailwind CSS, and JavaScript"
        }
      };
      applyLanguage(LANGUAGES.EN);
      updateTranslations();
      // Re-render dynamic content with fallback language
      renderExperience();
      renderEducation();
      renderCertifications();
      renderSkills();
      renderLanguages();
  renderProjects();
  // Pop-in animation on initial load (catch path)
  await pageTurnCardsIn();
  // Trigger animations for initially visible elements
  triggerInitialAnimations();
    }
  }

  // Language toggle
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', async () => {
      if (isTransitioning) return;
      isTransitioning = true;
      langToggle.classList.add('loading');
      const currentLang = document.documentElement.getAttribute('data-lang') || LANGUAGES.EN;
      const langOrder = [LANGUAGES.EN, LANGUAGES.ZH, LANGUAGES.TW];
      const currentIndex = langOrder.indexOf(currentLang);
      const nextIndex = (currentIndex + 1) % langOrder.length;
      const newLang = langOrder[nextIndex];

      // Animate current content out first
      await pageTurnCardsOut();

      const success = await loadLanguage(newLang);
      if (success) {
        applyLanguage(newLang);

        // Reset animation states to prevent conflicts with page-turn
        document.querySelectorAll('section').forEach(section => section.classList.remove('animate-in'));
        document.querySelectorAll('.reveal').forEach(el => el.classList.remove('visible', 'animate-fadeIn'));

        updateTranslations();
        renderExperience();
        renderEducation();
        renderCertifications();
        renderSkills();
        renderLanguages();
        await renderProjects();
        await pageTurnCardsIn();
        try {
          localStorage.setItem(LANG_KEY, newLang);
        } catch(e) {
          console.warn('Could not save language preference:', e);
        }
      }

      langToggle.classList.remove('loading');
      isTransitioning = false;
    });
  } else {
    console.error('Language toggle button not found!');
  }

  // Initialize language
  initLanguage();

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

  // Function to trigger animations for initially visible elements
  function triggerInitialAnimations() {
    // Trigger for sections
    document.querySelectorAll('section').forEach(section => {
      const rect = section.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight + 50 && rect.bottom > -50; // accounting for rootMargin
      if (isVisible && !section.classList.contains('animate-in')) {
        section.classList.add('animate-in');
        // Add staggered animation for child elements
        const children = section.querySelectorAll('.reveal');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('visible', 'animate-fadeIn');
          }, index * 100);
        });
      }
    });

    // Trigger for individual reveal elements
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible && !el.classList.contains('visible')) {
        el.classList.add('visible', 'animate-fadeIn');
      }
    });
  }

  // Load projects and render cards
  // Load projects and render project cards
  function renderProjects(){
    const viewCodeText = currentTranslations.projects.viewCode;
    const liveDemoText = currentTranslations.projects.liveDemo;
    const projects = currentTranslations.projects.items;

    if (!projects) {
      console.warn('Projects data not found in current language');
      return;
    }

    // Load static project data for links and images
    return fetch('data/projects.json')
      .then(res=>res.ok ? res.json() : Promise.reject('no projects'))
      .then(staticProjects => {
        const container = document.getElementById('projectsGrid');
        if(!container) return;

        container.innerHTML = projects.map((p, index)=>{
          const staticProject = staticProjects[index] || {};
          // Show only first 10 words of description
          let desc = p.description.split(' ').slice(0, 10).join(' ');
          if (p.description.split(' ').length > 10) desc += '...';

          // Tech stack badges
          const techBadges = staticProject.tech ? staticProject.tech.map(tech => `<span class="tech-badge">${tech}</span>`).join('') : '';

          return `
            <article class="project-card reveal">
              <div class="image-container">
                <img src="${staticProject.image || 'assets/images/placeholder.png'}" alt="${p.title}" class="w-full h-44 object-cover bg-slate-100 dark:bg-slate-700" />
              </div>
              <div class="content-container">
                <h4 class="text-lg font-semibold">${p.title}</h4>
                <p class="text-sm">${desc}</p>
                ${techBadges ? `<div class="tech-stack">${techBadges}</div>` : ''}
              </div>
              <div class="button-container">
                <a href="${staticProject.link || '#'}" target="_blank" rel="noopener noreferrer" class="project-btn-primary">${viewCodeText}</a>
                ${staticProject.demo ? `<a href="${staticProject.demo}" target="_blank" rel="noopener noreferrer" class="project-btn-secondary">${liveDemoText}</a>` : ''}
              </div>
            </article>
          `;
        }).join('');
        // Projects will be observed by the global enhancedObserver
        observeDynamicItems();
        wireGlowEffect();
      })
      .catch(error => {
        console.error('Error loading projects:', error);
        // fallback: empty state
        const container = document.getElementById('projectsGrid');
        if(container) container.innerHTML = '<p class="text-slate-500">No projects found. Add some to <code>data/projects.json</code>.</p>';
      });
  }

  // Load skills and render skill badges
  function renderSkills(){
    // Use translated content from current language file
    const skills = currentTranslations.skills;
    if (!skills) {
      console.warn('Skills data not found in current language');
      return;
    }
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
    wireGlowEffect();
  }

  // Load experience and render
  function renderExperience(){
    // Use translated content from current language file
    const exp = currentTranslations.experience;
    console.log('Rendering experience', exp);
    if (!exp) {
      console.warn('Experience data not found in current language');
      return;
    }

    const container = document.getElementById('experienceList');
    if(!container) return;

    const achievements = exp.achievements.map(achievement => `<li class="text-slate-600 dark:text-slate-300 text-sm mb-1">• ${achievement}</li>`).join('');
    container.innerHTML = `
      <div class="experience-item reveal group p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h5 class="font-semibold text-slate-800 dark:text-slate-200 text-lg mb-1">${exp.current}</h5>
            <p class="text-indigo-600 dark:text-indigo-400 font-medium">${exp.company}, ${exp.location}</p>
          </div>
          <span class="text-sm text-slate-700 dark:text-slate-200">${exp.period}</span>
        </div>
        <ul class="space-y-2">
          ${achievements}
        </ul>
      </div>
    `;
    observeDynamicItems();
    wireGlowEffect();
  }

  // Load education and render
  function renderEducation(){
    // Use translated content from current language file
    const edu = currentTranslations.education;
    if (!edu) {
      console.warn('Education data not found in current language');
      return;
    }

    const container = document.getElementById('educationList');
    if(!container) return;

    container.innerHTML = `
      <div class="education-item reveal group p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h5 class="font-semibold text-slate-800 dark:text-slate-200 text-lg mb-1">${edu.degree}</h5>
            <p class="text-slate-600 dark:text-slate-300">${edu.institution}, ${edu.location}</p>
          </div>
          <span class="text-sm text-slate-700 dark:text-slate-200">${edu.period}</span>
        </div>
      </div>
    `;
    // Education items will be observed by the global enhancedObserver
    observeDynamicItems();
    wireGlowEffect();
  }

  // Load certifications and render
  function renderCertifications(){
    // Use translated content from current language file
    const certifications = currentTranslations.certifications;
    console.log('Rendering certifications', certifications);
    if (!certifications) {
      console.warn('Certifications data not found in current language');
      return;
    }

    const container = document.getElementById('certificationsList');
    if(!container) return;

    container.innerHTML = certifications.map(cert=>{
      return `
        <div class="certification-item reveal group p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h5 class="font-semibold text-slate-800 dark:text-slate-200 text-lg mb-1">${cert.name}</h5>
              <p class="text-slate-600 dark:text-slate-300">${cert.issuer}</p>
            </div>
            <span class="text-sm text-slate-700 dark:text-slate-200">${cert.year}</span>
          </div>
        </div>
      `;
    }).join('');
    // Certification items will be observed by the global enhancedObserver
    observeDynamicItems();
    wireGlowEffect();
  }

  // Load languages and render
  function renderLanguages(){
    // Use translated content from current language file
    const languages = currentTranslations.languages;
    if (!languages) {
      console.warn('Languages data not found in current language');
      return;
    }

    const container = document.getElementById('languagesGrid');
    if(!container) return;

    container.innerHTML = languages.map(lang=>{
      return `
        <div class="language-item reveal group">
          <div class="flex flex-col items-center justify-center p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-center">
            <div class="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">${lang.flag || '🌐'}</div>
            <h5 class="font-semibold text-slate-800 dark:text-slate-200 text-lg mb-2">${lang.language}</h5>
            <span class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">${lang.proficiency}</span>
          </div>
        </div>
      `;
    }).join('');
    // Language items will be observed by the global enhancedObserver
    observeDynamicItems();
  }

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

  // Contact: copy-to-clipboard for email/phone with live feedback
  const copyButtons = document.querySelectorAll('.icon-btn[data-copy]');
  if(copyButtons.length){
    const status = document.getElementById('copy-status');
    copyButtons.forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const text = btn.getAttribute('data-copy') || '';
        try{
          await navigator.clipboard.writeText(text);
          if(status){ status.classList.remove('sr-only'); status.textContent = 'Copied to clipboard'; }
          setTimeout(()=>{ if(status){ status.classList.add('sr-only'); status.textContent=''; } }, 1500);
        }catch(e){
          if(status){ status.classList.remove('sr-only'); status.textContent = 'Copy failed'; }
          setTimeout(()=>{ if(status){ status.classList.add('sr-only'); status.textContent=''; } }, 1500);
        }
      });
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

  // Initialize Lucide icons
  lucide.createIcons();

  // Back to top button behavior
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    const toggleBtn = () => {
      if (window.scrollY > 300) backToTop.classList.add('show');
      else backToTop.classList.remove('show');
    };
    window.addEventListener('scroll', toggleBtn, { passive: true });
    toggleBtn();
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ======================
  // Crazy animations pack
  // ======================
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;

  // Helper: split text into characters for hero title
  function splitHeroTitle() {
    const title = document.querySelector('.hero-section h2');
    if (!title || title.__split) return null;
    const text = title.textContent.trim();
    const chars = [...text];
    title.innerHTML = '';
    const wrapper = document.createElement('span');
    wrapper.className = 'split-lines';
    const line = document.createElement('span');
    line.className = 'split-line';
    chars.forEach(c => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.textContent = c;
      line.appendChild(span);
    });
    wrapper.appendChild(line);
    title.appendChild(wrapper);
    title.__split = true;
    return title.querySelectorAll('.split-char');
  }

  // Hero cinematic intro
  function heroIntro() {
    if (prefersReduced || typeof gsap === 'undefined') return;
    const chars = splitHeroTitle();
    if (!chars) return;
    gsap.set(chars, { yPercent: 120, rotateX: -90, opacity: 0, filter: 'blur(6px)', transformOrigin: '50% 100%' });
    gsap.to(chars, {
      yPercent: 0,
      rotateX: 0,
      opacity: 1,
      filter: 'blur(0px)',
      ease: 'expo.out',
      duration: 1.1,
      stagger: { each: 0.02, from: 'start' }
    });
  }

  // Starfield background for hero
  function initStarfield() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    let canvas = hero.querySelector('canvas.starfield');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'starfield';
      hero.prepend(canvas);
    }
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    const STAR_COUNT = 180;
    let stars = [];
    function resize() {
      dpr = window.devicePixelRatio || 1;
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // rebuild stars
      stars = new Array(STAR_COUNT).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.2 + 0.2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2
      }));
    }
    resize();
    let rafId = 0;
    let running = true;
    function render() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.x += s.vx * s.z;
        s.y += s.vy * s.z;
        if (s.x < -5) s.x = w + 5; if (s.x > w + 5) s.x = -5;
        if (s.y < -5) s.y = h + 5; if (s.y > h + 5) s.y = -5;
        ctx.globalAlpha = 0.5 * s.z;
        ctx.fillStyle = '#818cf8';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(render);
    }
    if (!prefersReduced) render();
    const onVis = () => { running = document.visibilityState !== 'hidden'; if (running && !rafId) render(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', resize);
  }

  // 3D tilt + shine on cards
  function initTilt() {
    if (isTouch) return; // avoid on touch devices
    const cards = document.querySelectorAll('.project-card, .experience-item, .education-item, .certification-item');
    cards.forEach(card => {
      if (card.__tiltBound) return;
      card.__tiltBound = true;
      card.classList.add('tilt');
      if (!card.querySelector('.shine')) {
        const shine = document.createElement('div');
        shine.className = 'shine';
        card.appendChild(shine);
      }
      const maxTilt = 10;
      const damp = 18;
      let rx = 0, ry = 0;
      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        ry = px * maxTilt;
        rx = -py * maxTilt;
        card.style.setProperty('--sx', (px + 0.5) * 100 + '%');
        card.style.setProperty('--sy', (py + 0.5) * 100 + '%');
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      };
      const onLeave = () => { card.style.transform = 'perspective(800px) rotateX(0) rotateY(0)'; };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }

  // Magnetic buttons
  function initMagnetic() {
    if (isTouch) return;
    const mags = document.querySelectorAll('.btn-primary, .btn-secondary, .custom-header .custom-btn');
    mags.forEach(el => {
      if (el.__magBound) return; el.__magBound = true; el.classList.add('magnetic');
      const strength = 12; // px
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width/2;
        const cy = r.top + r.height/2;
        const dx = (e.clientX - cx) / (r.width/2);
        const dy = (e.clientY - cy) / (r.height/2);
        el.style.transform = `translate(${dx*strength}px, ${dy*strength}px)`;
      };
      const onLeave = () => { el.style.transform = 'translate(0,0)'; };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });
  }

  // Scroll-triggered parallax and reveals
  function initParallaxAndStaggers() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReduced) return;
    gsap.registerPlugin(ScrollTrigger);
    // Parallax hero image
    const heroImg = document.querySelector('.hero-section img');
    if (heroImg) {
      gsap.to(heroImg, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }
    // Section headers float in
    document.querySelectorAll('section h3').forEach(h => {
      gsap.from(h, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: h, start: 'top 80%' }
      });
    });
    // Stagger items in grids
    const grids = ['#projectsGrid .project-card', '#skillsGrid .skill-badge', '#languagesGrid > div'];
    grids.forEach(sel => {
      const items = document.querySelectorAll(sel);
      if (items.length) {
        gsap.from(items, {
          y: 20,
          opacity: 0,
          stagger: 0.06,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: items[0].closest('section') || items[0], start: 'top 80%' }
        });
      }
    });
  }

  // Reinitialize all fancy animations after content updates
  function reinitFancy() {
    try { heroIntro(); } catch(_){}
    try { initStarfield(); } catch(_){}
    try { initTilt(); } catch(_){}
    try { initMagnetic(); } catch(_){}
    try { initParallaxAndStaggers(); } catch(_){}
  }

  // Run once initially after initial renders and icons
  setTimeout(reinitFancy, 50);

  // Hook into language changes: re-run after content re-render
  const origRenderProjects = renderProjects;
  renderProjects = async function() {
    const res = await origRenderProjects.apply(this, arguments);
    reinitFancy();
    return res;
  };

  // Also re-run after other sections render (direct rebinding within closure)
  if (typeof renderSkills === 'function') {
    const _renderSkills = renderSkills;
    renderSkills = function() { const r = _renderSkills.apply(this, arguments); reinitFancy(); return r; };
  }
  if (typeof renderExperience === 'function') {
    const _renderExperience = renderExperience;
    renderExperience = function() { const r = _renderExperience.apply(this, arguments); reinitFancy(); return r; };
  }
  if (typeof renderEducation === 'function') {
    const _renderEducation = renderEducation;
    renderEducation = function() { const r = _renderEducation.apply(this, arguments); reinitFancy(); return r; };
  }
  if (typeof renderCertifications === 'function') {
    const _renderCertifications = renderCertifications;
    renderCertifications = function() { const r = _renderCertifications.apply(this, arguments); reinitFancy(); return r; };
  }
  if (typeof renderLanguages === 'function') {
    const _renderLanguages = renderLanguages;
    renderLanguages = function() { const r = _renderLanguages.apply(this, arguments); reinitFancy(); return r; };
  }

  // Re-run when theme toggles completes (icons already handled)
  document.addEventListener('transitionend', (e) => {
    if (e.target === document.documentElement && e.propertyName === 'background-color') {
      reinitFancy();
    }
  });
});