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
        title: 'Sign Types & Specifications',
        pages: [
            { slug: '_index', title: 'Overview' },
            { slug: 'pictorial-index', title: 'Signage Pictorial Index' },
            { slug: 'gateway-boundary', title: 'Gateway & Boundary Signage' },
            { slug: 'parking', title: 'Parking Signage' },
            { slug: 'bicycle', title: 'Bicycle-Related Signage' },
            { slug: 'pedestrian-maps', title: 'Pedestrian Wayfinding + Maps' },
            { slug: 'accessibility', title: 'Accessibility Signage' },
            { slug: 'building-id', title: 'Building Identification Signage' },
            { slug: 'commemorative', title: 'Commemorative / Donor / Interpretive Signage' }
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
    const mobileNavContent = document.getElementById('mobile-nav-content');
    if (mobileNavContent) {
        // Clone the sitemap and section pages into the drawer
        const sitemap = document.getElementById('global-sections-nav');
        const sectionNav = document.getElementById('section-pages-nav');

        let drawerHtml = '';

        if (sitemap) {
            drawerHtml += `
                <div class="space-y-4">
                    <p class="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-4">Sitemap</p>
                    ${sitemap.innerHTML}
                </div>
            `;
        }

        if (sectionNav) {
            drawerHtml += `
                <div class="space-y-4">
                    <p class="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-4">Contents</p>
                    <ul class="space-y-2">
                        ${sectionNav.innerHTML}
                    </ul>
                </div>
            `;
        }

        mobileNavContent.innerHTML = drawerHtml;
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
                   class="sidebar-link ${isActive ? 'active' : ''}">
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

    // V6 style breadcrumb
    let html = `HOME / ${sectionData.title.toUpperCase()} / <span class="text-[var(--text)]">${pageData.title.toUpperCase()}</span>`;
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

    const prevDiv = currentIndex > 0
        ? `<div class="flex-1 text-left"><a href="page.html?section=${section}&page=${pages[currentIndex - 1].slug}" class="text-sm font-medium text-[var(--accent-text)] hover:underline opacity-60 group-hover:opacity-100 transition-opacity">← ${pages[currentIndex - 1].title}</a></div>`
        : '<div class="flex-1"></div>';

    const nextDiv = currentIndex < pages.length - 1
        ? `<div class="flex-1 text-right"><a href="page.html?section=${section}&page=${pages[currentIndex + 1].slug}" class="text-sm font-medium text-[var(--accent-text)] hover:underline opacity-60 group-hover:opacity-100 transition-opacity">${pages[currentIndex + 1].title} →</a></div>`
        : '<div class="flex-1"></div>';

    pageNav.innerHTML = prevDiv + nextDiv;
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
                <div class="flex items-end justify-between mb-[28px] border-b border-[var(--border)] pb-[28px]">
                    <h1 class="mb-0">${title}</h1>
                    <div class="flex gap-4 mb-[12px]">
                        ${isFactSheet
                    ? `<a href="page.html?section=${section}&page=${page}" class="text-xs font-bold uppercase tracking-widest text-[var(--cu-gold)] hover:underline">View in Standard Manual ›</a>`
                    : `<a href="page.html?section=${section}&page=${page}&from=directory" class="text-xs font-bold uppercase tracking-widest text-[var(--cu-gold)] hover:underline">View as Fact Sheet ›</a>`
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

        // --- V6 Dual Brain Split (Col 4 Restoration) ---
        const evidenceContainer = document.getElementById('visual-evidence-container');
        if (evidenceContainer) {
            evidenceContainer.innerHTML = ''; // Clear previous

            // Move images and blockquotes to Evidence Column
            const visuals = contentEl.querySelectorAll('img, blockquote, figure');

            if (visuals.length > 0) {
                visuals.forEach((el, index) => {
                    // Create a wrapper for the evidence item
                    const wrapper = document.createElement('div');
                    wrapper.className = 'evidence-item bg-[var(--bg-secondary)] p-6 border border-[var(--border)] shadow-sm mb-[56px]';

                    // Specific handling for images
                    if (el.tagName === 'IMG') {
                        el.loading = 'lazy';
                        // Convert relative paths
                        if (!el.src.includes('content/') && (el.src.startsWith('./') || el.src.startsWith('../'))) {
                            el.src = el.src.replace(/^\.\.?\//, 'images/');
                        }

                        const cap = el.alt ? `<p class="mt-4 text-[0.65rem] text-[var(--text-secondary)] uppercase tracking-[0.2em] font-bold">${el.alt}</p>` : '';
                        wrapper.innerHTML = el.outerHTML + cap;
                    } else {
                        wrapper.innerHTML = el.outerHTML;
                    }

                    evidenceContainer.appendChild(wrapper);
                    el.remove(); // Remove from narrative column
                });
            }
        }

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
            <h1 class="mb-[28px]">Signage Pictorial Index</h1>
            <p class="text-[20px] text-[var(--text-secondary)] leading-[28px] uppercase tracking-[0.2em] mb-[28px]">Section 4.1 / Technical specifications</p>
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
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-[56px] mt-[28px] w-full">
            ${signs.map(sign => `
                <div class="card-v6">
                    <div class="card-id-tag">${sign.code}</div>
                    <div class="flex-1">
                        <h3 class="text-[20px] font-bold mb-[28px] text-[var(--text)] uppercase tracking-widest">${sign.title}</h3>
                        <p class="text-[18px] leading-[28px] text-[var(--text-secondary)] mb-[28px]">${sign.desc}</p>
                    </div>
                    <div class="flex items-center gap-[28px] pt-[28px] border-t border-[var(--border)] text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                        <span>${sign.material}</span>
                        <a href="#" class="ml-auto text-[var(--cu-gold)] hover:underline">View specs ›</a>
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
