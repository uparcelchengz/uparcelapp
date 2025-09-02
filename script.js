// ✨ Note: If you want to add other edit the directories or files search 'New Edits'


// Global state management
const state = {
    currentFile: 'docs/Introduction.md',
    theme: localStorage.getItem('theme') || 'light',
    sidebarOpen: false,
    markdownCache: {},
    fileStructure: {}
};

// DOM elements
let elements = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    initializeTheme();
    initializeEventListeners();
    loadMarkdownFile(state.currentFile);
    discoverMarkdownFiles();
});

function initializeElements() {
    elements = {
        sidebar: document.getElementById('sidebar'),
        toggleBtn: document.getElementById('toggleBtn'),
        navList: document.getElementById('navList'),
        loading: document.getElementById('loading'),
        markdownContent: document.getElementById('markdownContent'),
        breadcrumb: document.getElementById('breadcrumb'),
        themeToggle: document.getElementById('themeToggle'),
        editLink: document.getElementById('editLink'),
        updateTime: document.getElementById('updateTime'),
        scrollTopBtn: document.getElementById('scrollTopBtn')
    };
}

function initializeTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = elements.themeToggle.querySelector('i');
    icon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function initializeEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Sidebar toggle for mobile
    elements.toggleBtn.addEventListener('click', toggleSidebar);
    
    // Scroll to top button
    elements.scrollTopBtn.addEventListener('click', scrollToTop);
    
    // Navigation links
    document.addEventListener('click', handleNavigation);
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Handle scroll for scroll-to-top button
    window.addEventListener('scroll', handleScroll);
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
    updateThemeIcon();
}

function toggleSidebar() {
    state.sidebarOpen = !state.sidebarOpen;
    elements.sidebar.classList.toggle('open', state.sidebarOpen);
    
    // Update toggle button icon with animation
    const icon = elements.toggleBtn.querySelector('i');
    icon.style.transform = 'scale(0)';
    
    setTimeout(() => {
        icon.className = state.sidebarOpen ? 'fas fa-times' : 'fas fa-bars';
        icon.style.transform = 'scale(1)';
    }, 150);
    
    // Add/remove click outside listener
    if (state.sidebarOpen) {
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100); // Small delay to prevent immediate closing
    } else {
        document.removeEventListener('click', handleOutsideClick);
    }
}

function handleOutsideClick(event) {
    const isClickInsideSidebar = elements.sidebar.contains(event.target);
    const isClickOnToggleBtn = elements.toggleBtn.contains(event.target);
    
    if (!isClickInsideSidebar && !isClickOnToggleBtn && state.sidebarOpen) {
        closeSidebar();
    }
}

function closeSidebar() {
    state.sidebarOpen = false;
    elements.sidebar.classList.remove('open');
    document.removeEventListener('click', handleOutsideClick);
    
    // Reset toggle button icon properly
    const icon = elements.toggleBtn.querySelector('i');
    icon.style.transform = 'scale(0)';
    
    setTimeout(() => {
        icon.className = 'fas fa-bars';
        icon.style.transform = 'scale(1)';
    }, 150);
}

function handleScroll() {
    // Show/hide scroll to top button
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 300) {
        elements.scrollTopBtn.classList.add('visible');
    } else {
        elements.scrollTopBtn.classList.remove('visible');
    }
}

function scrollToTop() {
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
    });
}

function closeSidebar() {
    state.sidebarOpen = false;
    elements.sidebar.classList.remove('open');
}

function handleResize() {
    if (window.innerWidth > 768) {
        closeSidebar();
    }
}

function handleNavigation(event) {
    const navLink = event.target.closest('.nav-link');
    if (navLink && navLink.dataset.file) {
        event.preventDefault();
        
        // Update active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        navLink.classList.add('active');
        
        // Load the file
        loadMarkdownFile(navLink.dataset.file);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            closeSidebar();
        }
    }
}

function handleSearch() {
    // Search functionality removed as requested
    // This function is no longer needed
}

// Remove search-related functions since search bar was removed

async function loadMarkdownFile(filePath) {
    try {
        showLoading(true);
        state.currentFile = filePath;
        
        // Update breadcrumb
        updateBreadcrumb(filePath);
        
        // Update edit link
        updateEditLink(filePath);
        
        // Check cache first
        if (state.markdownCache[filePath]) {
            renderMarkdown(state.markdownCache[filePath]);
            return;
        }
        
        // Fetch markdown file
        let markdownContent;
        
        // Try to fetch from docs folder or root
        const possiblePaths = [
            filePath,
            `docs/${filePath}`,
            `${filePath}`,
        ];
        
        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    markdownContent = await response.text();
                    break;
                }
            } catch (error) {
                console.log(`Failed to fetch ${path}:`, error.message);
            }
        }
        
        // Show error if file not found
        if (!markdownContent) {
            renderError(`File not found: ${filePath}`);
            return;
        }
        
        // Cache the content
        state.markdownCache[filePath] = markdownContent;
        
        // Render the markdown
        renderMarkdown(markdownContent);
        
    } catch (error) {
        console.error('Error loading markdown file:', error);
        renderError(error.message);
    } finally {
        showLoading(false);
    }
}

function renderMarkdown(markdownContent) {
    try {
        // Configure marked options
        marked.setOptions({
            highlight: function(code, lang) {
                if (Prism.languages[lang]) {
                    return Prism.highlight(code, Prism.languages[lang], lang);
                }
                return code;
            },
            breaks: true,
            gfm: true
        });
        
        // Parse markdown to HTML
        const html = marked.parse(markdownContent);
        
        // Render HTML
        elements.markdownContent.innerHTML = html;
        
        // Apply syntax highlighting
        Prism.highlightAllUnder(elements.markdownContent);
        
        // Add language labels to code blocks
        addCodeBlockLabels();
        
        // Process special note blocks
        processNoteBlocks();
        
        // Show content with animation
        elements.markdownContent.classList.add('loaded');
        
        // Update last modified time
        updateLastModified();
        
    } catch (error) {
        console.error('Error rendering markdown:', error);
        renderError('Failed to render markdown content');
    }
}

function addCodeBlockLabels() {
    const preElements = elements.markdownContent.querySelectorAll('pre');
    preElements.forEach(pre => {
        const code = pre.querySelector('code');
        if (code && code.className) {
            const language = code.className.replace('language-', '');
            pre.setAttribute('data-language', language);
        }
    });
}

function processNoteBlocks() {
    // Convert blockquotes with specific patterns to note boxes
    const blockquotes = elements.markdownContent.querySelectorAll('blockquote');
    blockquotes.forEach(blockquote => {
        const text = blockquote.textContent.toLowerCase();
        if (text.startsWith('note:') || text.startsWith('info:')) {
            blockquote.classList.add('note', 'info');
        } else if (text.startsWith('warning:')) {
            blockquote.classList.add('note', 'warning');
        } else if (text.startsWith('error:') || text.startsWith('danger:')) {
            blockquote.classList.add('note', 'error');
        }
    });
}

function renderError(message) {
    elements.markdownContent.innerHTML = `
        <div class="error-container">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>Error Loading Content</h2>
            <p>${message}</p>
            <p>Please check that the markdown file exists and is accessible.</p>
        </div>
    `;
    elements.markdownContent.classList.add('loaded');
}

function showLoading(show) {
    elements.loading.style.display = show ? 'flex' : 'none';
    elements.markdownContent.style.display = show ? 'none' : 'block';
    if (!show) {
        elements.markdownContent.classList.remove('loaded');
        setTimeout(() => elements.markdownContent.classList.add('loaded'), 50);
    }
}

function updateBreadcrumb(filePath) {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1].replace('.md', '');
    const folder = parts.length > 1 ? parts[0] : '';
    
    let breadcrumbText = 'Documentation';
    if (folder) {
        breadcrumbText += ` / ${folder}`;
    }
    breadcrumbText += ` / ${fileName}`;
    
    elements.breadcrumb.textContent = breadcrumbText;
}

function updateEditLink(filePath) {
    // Update this URL to match your GitHub repository
    const githubUrl = `https://github.com/yourusername/your-repo/edit/main/docs/${filePath}`;
    elements.editLink.href = githubUrl;
}

function updateLastModified() {
    const now = new Date();
    const timeString = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    elements.updateTime.textContent = timeString;
}

async function discoverMarkdownFiles() {
    try {
        showNavigationLoading(true);
        
        // First, try to load from a manifest file (if available)
        const manifest = await loadManifest();
        if (manifest) {
            state.fileStructure = manifest;
            buildNavigationFromStructure();
            return;
        }
        
        // Fallback: scan directory structure
        const fileStructure = await scanDocsDirectory();
        state.fileStructure = fileStructure;
        buildNavigationFromStructure();
        
    } catch (error) {
        console.warn('Could not load dynamic structure, using fallback:', error);
        // Use fallback structure if scanning fails
        state.fileStructure = getFallbackStructure();
        buildNavigationFromStructure();
    } finally {
        showNavigationLoading(false);
    }
}

async function loadManifest() {
    try {
        const response = await fetch('docs/manifest.json');
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.log('No manifest file found, scanning directory...');
    }
    return null;
}

async function scanDocsDirectory() {
    const structure = {};
    
    // Define the actual directories in your workspace (New Edits)
    const directoriesToScan = [
        { path: 'docs/', section: 'Getting Started' },
        { path: 'docs/expectations/', section: 'Expectations' },
        { path: 'docs/dry-runs/', section: 'Dry Runs' },
    ];
    
    for (const dir of directoriesToScan) {
        const files = await scanDirectory(dir.path);
        if (files.length > 0) {
            structure[dir.section] = files;
        }
    }
    
    // If no files found anywhere, use fallback
    if (Object.keys(structure).length === 0) {
        return getFallbackStructure();
    }
    
    return structure;
}

async function scanDirectory(directoryPath) {
    const files = [];
    
    // Define known files based on your actual structure (New Edits)
    const knownFiles = {
        'docs/': [
            'Introduction.md'
        ],
        'docs/expectations/': [
            // Add any files you have in the expectations directory
            'customer expectations.md',
            'agent expectations.md'
        ],
        'docs/dry-runs/': [
            'customer.md'
        ],
    };
    
    const filesToCheck = knownFiles[directoryPath] || [];
    
    for (const fileName of filesToCheck) {
        const filePath = directoryPath + fileName;
        if (await fileExists(filePath)) {
            files.push({
                name: formatFileName(fileName),
                file: filePath,
                path: filePath
            });
        }
    }
    
    return files;
}

async function fileExists(filePath) {
    try {
        const response = await fetch(filePath, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

function formatFileName(fileName) {
    return fileName
        .replace('.md', '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .replace(/(\d+)/g, ' $1')
        .trim();
}

function buildNavigationFromStructure() {
    const dynamicNav = document.getElementById('dynamicNavigation');
    
    // Clear existing navigation
    dynamicNav.innerHTML = '';
    
    // Build new navigation
    Object.entries(state.fileStructure).forEach(([sectionName, files]) => {
        const section = createNavigationSection(sectionName, files);
        dynamicNav.appendChild(section);
    });
    
    // Set first file as active if none is active
    const firstLink = dynamicNav.querySelector('.nav-link');
    if (firstLink && !dynamicNav.querySelector('.nav-link.active')) {
        firstLink.classList.add('active');
        state.currentFile = firstLink.dataset.file;
    }
}

function createNavigationSection(sectionName, files) {
    const section = document.createElement('div');
    section.className = 'nav-section';
    
    const header = document.createElement('h3');
    header.textContent = sectionName;
    section.appendChild(header);
    
    const list = document.createElement('ul');
    list.className = 'nav-list';
    
    files.forEach(file => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        
        link.href = '#';
        link.className = 'nav-link';
        link.dataset.file = file.file;
        link.textContent = file.name;
        
        listItem.appendChild(link);
        list.appendChild(listItem);
    });
    
    section.appendChild(list);
    return section;
}

function showNavigationLoading(show) {
    const navLoading = document.getElementById('navLoading');
    if (navLoading) {
        navLoading.style.display = show ? 'flex' : 'none';
    }
}

// Fallback structure for navigation (New Edits)
function getFallbackStructure() {
    return {
        'Getting Started': [
            { 
                name: 'Introduction', 
                file: 'docs/Introduction.md',
                description: 'Overview of uParcel and testing platform'
            }
        ],
        'Dry Runs': [
            { 
                name: 'Customer Booking', 
                file: 'docs/dry-runs/customer.md',
                description: 'Customer workflow testing guide'
            }
        ],
        'Expectations': [
            { 
                name: 'Platform Requirements', 
                file: 'docs/expectations/platform-requirements.md',
                description: 'Technical requirements and benchmarks'
            }
        ]
    };
}

// Get all pages in order for pagination
function getAllPagesInOrder() {
    const pages = [];
    Object.values(state.fileStructure).forEach(section => {
        if (Array.isArray(section)) {
            section.forEach(page => {
                pages.push(page);
            });
        }
    });
    return pages;
}

// Get previous and next pages for current file
function getPreviousNextPages(currentFile) {
    const allPages = getAllPagesInOrder();
    const currentIndex = allPages.findIndex(page => page.file === currentFile);
    
    return {
        previous: currentIndex > 0 ? allPages[currentIndex - 1] : null,
        next: currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null
    };
}

// Add pagination navigation at the bottom of content
function addPaginationNavigation() {
    const pagination = getPreviousNextPages(state.currentFile);
    
    if (!pagination.previous && !pagination.next) {
        return; // No pagination needed if only one page
    }
    
    const paginationHtml = `
        <div class="pagination-navigation">
            <div class="pagination-container">
                ${pagination.previous ? `
                    <div class="pagination-item previous">
                        <button class="pagination-btn" data-file="${pagination.previous.file}">
                            <i class="fas fa-chevron-left"></i>
                            <div class="pagination-text">
                                <span class="pagination-label">Previous</span>
                                <span class="pagination-title">${pagination.previous.name}</span>
                            </div>
                        </button>
                    </div>
                ` : '<div class="pagination-item"></div>'}
                
                ${pagination.next ? `
                    <div class="pagination-item next">
                        <button class="pagination-btn" data-file="${pagination.next.file}">
                            <div class="pagination-text">
                                <span class="pagination-label">Next</span>
                                <span class="pagination-title">${pagination.next.name}</span>
                            </div>
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                ` : '<div class="pagination-item"></div>'}
            </div>
        </div>
    `;
    
    elements.markdownContent.insertAdjacentHTML('beforeend', paginationHtml);
    
    // Add event listeners for pagination buttons
    const paginationBtns = elements.markdownContent.querySelectorAll('.pagination-btn');
    paginationBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetFile = btn.dataset.file;
            if (targetFile) {
                // Update navigation active state
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.dataset.file === targetFile) {
                        link.classList.add('active');
                    }
                });
                
                loadMarkdownFile(targetFile);
                
                // Scroll to top smoothly
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// Process internal links within markdown content
function processInternalLinks() {
    const links = elements.markdownContent.querySelectorAll('a[href]');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        
        // Check if it's an internal link to another markdown file
        if (href.endsWith('.md') && !href.startsWith('http')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Convert relative path to full path
                let targetFile = href;
                if (!targetFile.startsWith('docs/')) {
                    targetFile = `docs/${targetFile}`;
                }
                
                // Update navigation active state
                document.querySelectorAll('.nav-link').forEach(navLink => {
                    navLink.classList.remove('active');
                    if (navLink.dataset.file === targetFile) {
                        navLink.classList.add('active');
                    }
                });
                
                loadMarkdownFile(targetFile);
                
                // Close sidebar on mobile
                if (window.innerWidth <= 768) {
                    closeSidebar();
                }
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            // Add visual indicator for internal links
            link.classList.add('internal-link');
            link.insertAdjacentHTML('beforeend', ' <i class="fas fa-link internal-link-icon"></i>');
        }
    });
}

// Utility functions for enhanced functionality
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!');
    }).catch(err => {
        console.error('Could not copy text:', err);
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add copy buttons to code blocks
function addCopyButtons() {
    const codeBlocks = elements.markdownContent.querySelectorAll('pre');
    codeBlocks.forEach(pre => {
        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.innerHTML = '<i class="fas fa-copy"></i>';
        button.onclick = () => {
            const code = pre.querySelector('code').textContent;
            copyToClipboard(code);
        };
        pre.appendChild(button);
    });
}

// Enhanced markdown rendering with copy buttons and pagination
function renderMarkdown(markdownContent) {
    try {
        marked.setOptions({
            highlight: function(code, lang) {
                if (Prism.languages[lang]) {
                    return Prism.highlight(code, Prism.languages[lang], lang);
                }
                return code;
            },
            breaks: true,
            gfm: true
        });
        
        const html = marked.parse(markdownContent);
        elements.markdownContent.innerHTML = html;
        
        Prism.highlightAllUnder(elements.markdownContent);
        addCodeBlockLabels();
        addCopyButtons();
        processNoteBlocks();
        processInternalLinks(); // Add internal link processing
        addPaginationNavigation(); // Add pagination at bottom
        
        elements.markdownContent.classList.add('loaded');
        updateLastModified();
        
    } catch (error) {
        console.error('Error rendering markdown:', error);
        renderError('Failed to render markdown content');
    }
}