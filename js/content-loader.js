// ================================
// SITE NAVIGATION STRUCTURE
// ================================

const SITE_STRUCTURE = {
    'introduction': {
        title: 'Introduction',
        pages: [
            { slug: '_index', title: 'Overview' },
            { slug: 'vision-statement', title: 'Vision Statement' },
            { slug: 'what-is-wayfinding', title: 'What is Wayfinding?' },
            { slug: 'cu-boulder-philosophy', title: 'CU Boulder Philosophy' },
            { slug: 'universal-design', title: 'Universal Design' },
            { slug: 'sustainability', title: 'Sustainability & Lifecycle' },
            { slug: 'how-to-use', title: 'How to Use This Manual' }
        ]
    },
    'master-narrative': {
        title: 'Master Narrative',
        pages: [
            { slug: '_index', title: 'Overview' },
            { slug: 'philosophy-of-scale', title: 'Philosophy of Scale' },
            { slug: 'neighborhood-framework', title: 'Neighborhood Framework' },
            { slug: 'content-standards', title: 'Content Standards' },
            { slug: 'sign-family', title: 'The Sign Family' },
            { slug: 'sustainability', title: 'Sustainability' },
            { slug: 'universal-design-accessibility', title: 'Universal Design & Accessibility' },
            { slug: 'building-identification', title: 'Building Identification' },
            { slug: 'lighting', title: 'Lighting' }
        ]
    },
    'sign-types': {
        title: 'Sign Types',
        pages: [
            { slug: '_index', title: 'Overview' },
            { slug: 'pictorial-index', title: 'Pictorial Index' },
            { slug: 'gateway-boundary', title: 'Gateway & Boundary' },
            { slug: 'parking', title: 'Parking' },
            { slug: 'bicycle', title: 'Bicycle' },
            { slug: 'pedestrian-maps', title: 'Pedestrian & Maps' },
            { slug: 'accessibility', title: 'Accessibility' },
            { slug: 'building-id', title: 'Building ID' },
            { slug: 'commemorative', title: 'Commemorative' }
        ]
    },
    'graphic-standards': {
        title: 'Graphic Standards',
        pages: [
            { slug: '_index', title: 'Overview' },
            { slug: 'brand-logo', title: 'Brand & Logo' },
            { slug: 'typography', title: 'Typography' },
            { slug: 'color', title: 'Color Standards' },
            { slug: 'iconography', title: 'Iconography' },
            { slug: 'arrows', title: 'Arrow Standards' }
        ]
    },
    'policies': {
        title: 'Policies',
        pages: [
            { slug: '_index', title: 'Overview' },
            { slug: 'digital-interactive', title: 'Digital & Interactive' },
            { slug: 'temporary-signage', title: 'Temporary Signage' },
            { slug: 'new-signage-requests', title: 'New Signage Requests' },
            { slug: 'maintenance', title: 'Maintenance' }
        ]
    },
    'approval-process': {
        title: 'Approval Process',
        pages: [
            { slug: '_index', title: 'Overview' },
            { slug: 'authority-by-type', title: 'Authority by Type' },
            { slug: 'primary-campus-workflow', title: 'Primary Campus Workflow' },
            { slug: 'secondary-campus-workflow', title: 'Secondary Campus Workflow' }
        ]
    },
    'appendices': {
        title: 'Appendices',
        pages: [
            { slug: '_index', title: 'Overview' },
            { slug: 'submission-guidelines', title: 'Submission Guidelines' },
            { slug: 'fabrication', title: 'Fabrication' }
        ]
    }
};

// ================================
// CONTENT LOADER
// ================================

document.addEventListener('DOMContentLoaded', async function () {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    const page = params.get('page') || '_index';
    const isDirectory = window.location.pathname.includes('directory.html');

    // Detect if we came from Directory via URL parameter
    const fromDirectory = params.get('from') === 'directory';
    if (fromDirectory) {
        document.body.classList.add('mode-fact-sheet');
    }

    // Handle Mode Switcher State
    updateSwitcherState(section, page, isDirectory || fromDirectory);

    // Build Global Sections (Col 1)
    buildGlobalSections(section, page);

    if (isDirectory) return; // Directory handles its own grid in HTML for now

    if (!section || !SITE_STRUCTURE[section]) {
        if (window.location.pathname.includes('page.html')) {
            showError('Section not found');
        }
        return;
    }

    const sectionData = SITE_STRUCTURE[section];
    const pageData = sectionData.pages.find(p => p.slug === page);

    if (!pageData) {
        showError('Page not found');
        return;
    }

    // Build Section Pages (Col 2)
    buildSectionPages(section, page, sectionData);

    // Update page title
    document.title = `${pageData.title} | ${sectionData.title} | CU Boulder Wayfinding Standards`;

    // Build breadcrumb
    buildBreadcrumb(section, page, sectionData, pageData);

    // Build page navigation (prev/next)
    buildPageNav(section, page, sectionData);

    // Load and render markdown
    if (page === 'pictorial-index') {
        await renderPictorialIndex(section, page);
    } else {
        await loadMarkdown(section, page, pageData, fromDirectory);
    }

    // Handle mobile nav
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) {
        mobileNav.innerHTML = `
            <a href="index.html" class="block px-3 py-2 text-sm text-[var(--text-secondary)]">← Home</a>
            <p class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">${sectionData.title}</p>
            ${sectionData.pages.map(p => `
                <a href="page.html?section=${section}&page=${p.slug}" class="block px-3 py-2 text-sm rounded-lg ${p.slug === page ? 'bg-[var(--bg-secondary)] text-cu-gold' : ''}">
                    ${p.title}
                </a>
            `).join('')}
        `;
    }
});

/**
 * Handle mode switcher active states
 */
function updateSwitcherState(section, page, isDirectory) {
    const modeStandard = document.getElementById('mode-standard');
    const modeDirectory = document.getElementById('mode-directory');
    const modeTechnical = document.getElementById('mode-technical');

    if (!modeStandard || !modeDirectory || !modeTechnical) return;

    // Reset
    [modeStandard, modeDirectory, modeTechnical].forEach(btn => btn.classList.remove('active'));

    if (isDirectory) {
        modeDirectory.classList.add('active');
    } else if (page === 'pictorial-index' || section === 'sign-types' || window.location.search.includes('from=directory')) {
        modeTechnical.classList.add('active');
    } else {
        modeStandard.classList.add('active');
    }
}

// ================================
// COLUMN 1: GLOBAL SECTIONS
// ================================

function buildGlobalSections(currentSection, currentPage) {
    const sectionsNav = document.getElementById('global-sections-nav');
    if (!sectionsNav) return;

    let html = '';
    for (const [sectionSlug, sectionData] of Object.entries(SITE_STRUCTURE)) {
        const isActive = sectionSlug === currentSection;
        // Clicking a section loads its first page
        const href = `page.html?section=${sectionSlug}&page=${sectionData.pages[0].slug}`;

        html += `
            <div class="section-item">
                <a href="${href}" 
                   class="block text-base font-bold transition-colors ${isActive ? 'text-black' : 'text-[var(--text-secondary)] hover:text-black'}">
                    ${sectionData.title}
                </a>
            </div>
        `;
    }
    sectionsNav.innerHTML = html;
}

// ================================
// COLUMN 2: SECTION PAGES
// ================================

function buildSectionPages(section, currentPage, sectionData) {
    const pagesNav = document.getElementById('section-pages-nav');
    if (!pagesNav) return;

    const html = sectionData.pages.map(page => {
        const isActive = page.slug === currentPage;
        const href = `page.html?section=${section}&page=${page.slug}`;
        return `
            <li>
                <a href="${href}" 
                   class="sidebar-link ${isActive ? 'active' : ''}">
                    ${page.title}
                </a>
            </li>
        `;
    }).join('');

    pagesNav.innerHTML = html;
}

// ================================
// COLUMN 2: ON-PAGE NAV (TOC)
// ================================

function buildOnPageNav() {
    const onPageNav = document.getElementById('on-page-nav');
    const content = document.getElementById('content');
    if (!onPageNav || !content) return;

    const headings = content.querySelectorAll('h2, h3');
    if (headings.length === 0) {
        onPageNav.closest('aside').classList.add('hidden');
        return;
    } else {
        onPageNav.closest('aside').classList.remove('hidden');
    }

    let html = '';
    headings.forEach((heading, index) => {
        // Create ID if not exists
        if (!heading.id) {
            heading.id = 'heading-' + index;
        }
        const level = heading.tagName.toLowerCase();
        html += `
            <li>
                <a href="#${heading.id}" class="section-nav-link ${level === 'h3' ? 'ml-4' : ''}" data-heading="${heading.id}">
                    ${heading.innerText}
                </a>
            </li>
        `;
    });
    onPageNav.innerHTML = html;

    // Scroll spy logic
    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -80% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.section-nav-link').forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                });
            }
        });
    }, observerOptions);

    headings.forEach(heading => observer.observe(heading));
}

// ================================
// BREADCRUMB
// ================================

function buildBreadcrumb(section, page, sectionData, pageData) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;

    let html = `<a href="index.html" class="hover:text-[var(--text)]">Home</a>`;
    html += `<span class="mx-2">/</span>`;
    html += `<a href="page.html?section=${section}&page=_index" class="hover:text-[var(--text)]">${sectionData.title}</a>`;

    if (page !== '_index') {
        html += `<span class="mx-2">/</span>`;
        html += `<span class="text-[var(--text)]">${pageData.title}</span>`;
    }

    breadcrumb.innerHTML = html;
}

// ================================
// PAGE NAVIGATION (PREV/NEXT)
// ================================

function buildPageNav(section, currentPage, sectionData) {
    const pageNav = document.getElementById('page-nav');
    if (!pageNav) return;

    const pages = sectionData.pages;
    const currentIndex = pages.findIndex(p => p.slug === currentPage);

    let prevHTML = '<span></span>';
    let nextHTML = '<span></span>';

    if (currentIndex > 0) {
        const prev = pages[currentIndex - 1];
        prevHTML = `<a href="page.html?section=${section}&page=${prev.slug}" class="text-sm font-medium text-[var(--accent-text)] hover:underline">← ${prev.title}</a>`;
    }

    if (currentIndex < pages.length - 1) {
        const next = pages[currentIndex + 1];
        nextHTML = `<a href="page.html?section=${section}&page=${next.slug}" class="text-sm font-medium text-[var(--accent-text)] hover:underline">${next.title} →</a>`;
    }

    pageNav.innerHTML = prevHTML + nextHTML;
}

// ================================
// MARKDOWN LOADER & DUAL BRAIN
// ================================

async function loadMarkdown(section, page, pageData, isFactSheet = false) {
    const contentEl = document.getElementById('content');
    const headerEl = document.getElementById('page-header');

    const mdPath = `content/${section}/${page}.md`;

    try {
        const response = await fetch(mdPath);

        if (!response.ok) {
            throw new Error(`Failed to load ${mdPath}`);
        }

        let markdown = await response.text();

        // Extract title from first H1 if present
        let title = pageData.title;
        let description = '';

        const h1Match = markdown.match(/^#\s+(.+)$/m);
        if (h1Match) {
            title = h1Match[1].replace(/\*\*/g, '').trim();
            // Clear only the H1 and its immediate following newline to prevent double rendering
            // of the text if it's identical to the title
            markdown = markdown.replace(/^#\s+.+\n*/m, '');
        }

        // All markdown text will be rendered in the narrative article
        // No separate excerpt/description extraction

        // Update header
        if (headerEl) {
            headerEl.innerHTML = `
                <div class="flex items-end justify-between mb-8">
                    <h1 class="font-bold tracking-tight mb-0">${title}</h1>
                    <div class="flex gap-4">
                        ${isFactSheet
                    ? `<a href="page.html?section=${section}&page=${page}" class="text-sm font-bold uppercase tracking-widest text-[var(--accent-text)] hover:underline">View in Standard Manual ›</a>`
                    : `<a href="page.html?section=${section}&page=${page}&from=directory" class="text-sm font-bold uppercase tracking-widest text-[var(--accent-text)] hover:underline">View as Fact Sheet ›</a>`
                }
                    </div>
                </div>
            `;
        }

        // Render markdown
        const html = marked.parse(markdown);

        if (isFactSheet) {
            // Fact Sheet Layout: Hero + Metadata + Content
            contentEl.innerHTML = `
                <div class="reveal-up">
                    <div class="fact-sheet-hero mb-12 overflow-hidden border border-[var(--border)]">
                         <div class="flex flex-col items-center justify-center p-12 text-center opacity-20">
                            <i data-lucide="image" class="w-16 h-16 mb-4"></i>
                            <p class="text-sm font-bold uppercase tracking-widest">Visual Reference</p>
                         </div>
                    </div>
                    
                    <div class="metadata-grid">
                        <div class="metadata-item">
                            <label>Module</label>
                            <div class="value">${section.replace(/-/g, ' ')}</div>
                        </div>
                        <div class="metadata-item">
                            <label>Identification</label>
                            <div class="value">${title}</div>
                        </div>
                        <div class="metadata-item">
                            <label>Status</label>
                            <div class="value">Official Standard</div>
                        </div>
                    </div>

                    <div class="prose-wide">
                        ${html}
                    </div>
                </div>
            `;
        } else {
            contentEl.innerHTML = `<div class="reveal-up">${html}</div>`;
        }

        // Re-initialize animations for new content
        if (window.initRevealAnimations) {
            window.initRevealAnimations();
        }

        // Process visuals inline (Lazy loading and path correction)
        const visuals = contentEl.querySelectorAll('img');
        visuals.forEach(el => {
            el.loading = 'lazy';
            if (!el.src.includes('content/') && (el.src.startsWith('./') || el.src.startsWith('../'))) {
                el.src = el.src.replace(/^\.\.?\//, 'images/');
            }
            el.classList.add('reveal-up');
        });

        // Update document title final
        document.title = `${title} | CU Boulder Wayfinding Standards`;

    } catch (error) {
        console.error('Error loading markdown:', error);
        contentEl.innerHTML = `
            <div class="text-center py-12">
                <p class="text-[var(--text-secondary)] mb-4">Content not found</p>
                <p class="text-sm text-[var(--text-secondary)]">Looking for: ${mdPath}</p>
                <a href="index.html" class="mt-4 inline-block text-[var(--accent-text)] hover:underline">← Back to Home</a>
            </div>
        `;
    }
}

// ================================
// ERROR HANDLING
// ================================

/**
 * Specialized renderer for the Pictorial Index
 */
async function renderPictorialIndex(section, page) {
    const contentEl = document.getElementById('content');
    const headerEl = document.getElementById('page-header');

    if (headerEl) {
        headerEl.innerHTML = `
            <h1 class="text-4xl font-bold tracking-tight mb-4">Signage Pictorial Index</h1>
            <p class="text-xl text-[var(--text-secondary)] leading-relaxed">Section 4.1 / Technical specifications</p>
        `;
    }

    // Sample Sign Data (In a real app, this would be in a JSON file or parsed MD)
    const signs = [
        { code: 'Mn-01', title: 'Main', desc: 'Pedestrian navigation. Campus map, destinations, aiding pedestrian navigation and wayfinding.', material: 'Sandstone base, metal frame' },
        { code: 'Pr-01', title: 'Primary', desc: 'Pedestrian navigation. Local map, nearby destinations, aiding pedestrian navigation and wayfinding.', material: 'Sandstone base, metal frame' },
        { code: 'Sc-01', title: 'Secondary', desc: 'District orientation. Defines campus zones or precincts; helps with orientation at a district scale.', material: 'Sandstone base, vertical pylon' },
        { code: 'Nd-01', title: 'Nudge', desc: 'Spatial cues. Path identification.', material: 'Metal post, directional blades' },
        { code: 'Ar-01', title: 'Accessible Routes', desc: 'Path identification. Focuses on accessibility pathways and ADA compliance.', material: 'Vinyl wrap, metal post' },
        { code: 'Bd-01', title: 'Building ID', desc: 'Institutional branding. Primary marker for campus destination buildings.', material: 'Sandstone masonry' }
    ];

    const cardsHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12 w-full">
            ${signs.map(sign => `
                <div class="sign-card">
                    <div class="sign-card-visual">
                        <div class="sign-code-overlay">${sign.code}</div>
                        <!-- Placeholder for actual sign image -->
                        <div class="w-20 h-40 bg-gray-300 opacity-50 relative z-10"></div>
                    </div>
                    <div class="sign-card-content">
                        <div class="sign-card-header">
                            <h3 class="sign-card-title">${sign.title}</h3>
                            <span class="sign-card-tag">${sign.code}</span>
                        </div>
                        <p class="sign-card-desc">${sign.desc}</p>
                        <div class="sign-card-meta">
                            <div class="meta-item">
                                <label>Material</label>
                                <value>${sign.material}</value>
                            </div>
                            <div class="meta-item text-right">
                                <label>Details</label>
                                <a href="#" class="meta-link">View specs ›</a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    contentEl.innerHTML = cardsHTML;

    // Re-initialize animations for cards
    if (window.initRevealAnimations) {
        window.initRevealAnimations();
    }
}

function showError(message) {
    const contentEl = document.getElementById('content');
    if (contentEl) {
        contentEl.innerHTML = `
      <div class="text-center py-12">
        <p class="text-xl font-semibold mb-2">${message}</p>
        <a href="index.html" class="text-[var(--accent-text)] hover:underline">← Back to Home</a>
      </div>
    `;
    }
}
