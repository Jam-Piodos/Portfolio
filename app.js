/** Resolve a repo-relative asset path (works on GitHub Pages and local file open). */
function resolveAssetPath(relativePath) {
    return new URL(relativePath, document.baseURI).href;
}

function pauseBgAudioForVideo() {
    const bgAudio = document.getElementById('bg-audio');
    if (bgAudio && !bgAudio.paused) {
        bgAudio.pause();
    }
}

function printResumeImage(imageSrc) {
    const absoluteSrc = imageSrc && (imageSrc.startsWith('http') || imageSrc.startsWith('blob:') || imageSrc.startsWith('data:'))
        ? imageSrc
        : resolveAssetPath(imageSrc || 'assets/resume.png');

    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'Print resume');
    iframe.style.cssText = 'position:fixed;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(
        '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
        '<title>Resume - Jam Piodos</title>' +
        '<style>@page{margin:0.35in}body{margin:0;padding:0}' +
        'img{display:block;width:100%;height:auto;max-width:8.5in;margin:0 auto}</style>' +
        '</head><body></body></html>'
    );
    doc.close();

    const img = doc.createElement('img');
    img.alt = 'Jam Piodos resume';
    img.src = absoluteSrc;
    doc.body.appendChild(img);

    const cleanup = function() {
        if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
        }
    };

    const runPrint = function() {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        iframe.contentWindow.addEventListener('afterprint', cleanup, { once: true });
        setTimeout(cleanup, 5000);
    };

    if (img.complete && img.naturalWidth > 0) {
        runPrint();
    } else {
        img.onload = runPrint;
        img.onerror = function() {
            cleanup();
            window.alert('Could not load the resume image for printing.');
        };
    }
}

function setupVideoBgAudioPause() {
    const videoWrappers = document.querySelectorAll('.award-video-wrapper, .multimedia-video-wrapper');

    videoWrappers.forEach(function(wrapper) {
        wrapper.addEventListener('pointerdown', pauseBgAudioForVideo);
        wrapper.addEventListener('click', pauseBgAudioForVideo);
    });

    document.addEventListener('focusin', function(e) {
        if (e.target.tagName === 'IFRAME') {
            pauseBgAudioForVideo();
        }
    });

    window.addEventListener('blur', function() {
        setTimeout(function() {
            if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
                pauseBgAudioForVideo();
            }
        }, 0);
    });
}

function navigateTo(page) {
    // Hide all content sections
    const contentSections = document.querySelectorAll('main');
    contentSections.forEach(section => {
        section.style.display = 'none';
        section.classList.add('hidden');
    });

    // Show the selected content section
    const selectedSection = document.getElementById(page);
    if (selectedSection) {
        selectedSection.style.display = 'block';
        selectedSection.classList.remove('hidden');
    }
}

// Function to fetch repositories from GitHub API
async function fetchRepositories(username, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        // Show loading message
        container.innerHTML = '<div class="loading-message">Loading repositories...</div>';

        // Fetch repositories from GitHub API
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch repositories: ${response.status}`);
        }

        const repos = await response.json();
        
        // Clear loading message
        container.innerHTML = '';

        if (repos.length === 0) {
            container.innerHTML = '<div class="no-repos-message">No repositories found.</div>';
            return;
        }

        // Create repo cards for each repository
        repos.forEach(repo => {
            const repoCard = document.createElement('a');
            repoCard.className = 'repo-card';
            repoCard.href = repo.html_url;
            repoCard.target = '_blank';
            repoCard.rel = 'noopener noreferrer';
            
            // Determine icon based on language or default
            const icon = getRepoIcon(repo.language);
            
            // Get description or use default
            const description = repo.description || 'No description available';
            
            repoCard.innerHTML = `
                <div class="repo-icon">${icon}</div>
                <h3>${repo.name}</h3>
                <p class="repo-description">${description}</p>
                <div class="repo-meta">
                    ${repo.language ? `<span class="repo-language">${repo.language}</span>` : ''}
                    ${repo.stargazers_count > 0 ? `<span class="repo-stars">⭐ ${repo.stargazers_count}</span>` : ''}
                </div>
            `;
            
            container.appendChild(repoCard);
        });
    } catch (error) {
        console.error('Error fetching repositories:', error);
        container.innerHTML = `<div class="error-message">Error loading repositories: ${error.message}</div>`;
    }
}

// Function to get appropriate icon based on repository language
function getRepoIcon(language) {
    const iconMap = {
        'JavaScript': '📜',
        'TypeScript': '📘',
        'Python': '🐍',
        'Java': '☕',
        'HTML': '🌐',
        'CSS': '🎨',
        'PHP': '🐘',
        'C++': '⚙️',
        'C': '⚙️',
        'C#': '🔷',
        'Ruby': '💎',
        'Go': '🐹',
        'Rust': '🦀',
        'Swift': '🐦',
        'Kotlin': '🔶',
        'Dart': '🎯',
        'Shell': '💻',
        'Vue': '💚',
        'React': '⚛️',
        'Angular': '🅰️'
    };
    return iconMap[language] || '📁';
}

const GITHUB_PAGES = {
    projects: { username: 'PinkyBabe', containerId: 'pinkybabe-repos' },
    repositories: { username: 'Jam-Piodos', containerId: 'jam-piodos-repos' },
    'group-projects': { username: 'fsmanolofortich-droid', containerId: 'group-projects-repos' }
};

function loadGithubRepos(pageKey) {
    const config = GITHUB_PAGES[pageKey];
    if (config) {
        fetchRepositories(config.username, config.containerId);
    }
}

const OJT_GALLERY = [
    { src: 'assets/ojt/646322696_1952660806125318_1896668420251268510_n.jpg', alt: 'OJT at BFP Manolo Fortich Fire Station — fire truck and fire prevention banner' },
    { src: 'assets/ojt/702089017_1742155773817221_6857263931748859545_n.jpg', alt: 'OJT culminating activity with NBSC students and BFP personnel' },
    { src: 'assets/ojt/651821656_925937030134904_7579710362941004946_n.jpg', alt: 'OJT training with Bureau of Fire Protection' },
    { src: 'assets/ojt/691826096_961635686507991_568985108390686022_n.jpg', alt: 'OJT at Manolo Fortich Fire Station' },
    { src: 'assets/ojt/699772534_1526021155792583_3343767949976279593_n.png', alt: 'OJT fire station activities' },
    { src: 'assets/ojt/700272028_1518342459681543_5201522506933643512_n.png', alt: 'OJT with BFP team' },
    { src: 'assets/ojt/702239814_1992494128013390_7935848232909593296_n.jpg', alt: 'OJT community fire safety program' },
    { src: 'assets/ojt/702619492_1606529913773242_4339789676708636926_n.png', alt: 'OJT station duties and training' }
];

// Set up event listeners for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Background audio element
    const bgAudio = document.getElementById('bg-audio');

    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const githubNavToggle = document.getElementById('github-nav-toggle');
    const githubNavSub = document.getElementById('github-nav-sub');

    function updateSidebarToggleState(isOpen) {
        if (!sidebarToggle) return;
        sidebarToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        sidebarToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    }

    function openSidebar() {
        document.body.classList.add('sidebar-open');
        if (sidebarOverlay) {
            sidebarOverlay.hidden = false;
        }
        updateSidebarToggleState(true);
    }

    function closeSidebar() {
        document.body.classList.remove('sidebar-open');
        if (sidebarOverlay) {
            sidebarOverlay.hidden = true;
        }
        updateSidebarToggleState(false);
    }

    function toggleSidebar() {
        if (document.body.classList.contains('sidebar-open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
        updateSidebarToggleState(false);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    if (githubNavToggle && githubNavSub) {
        githubNavToggle.addEventListener('click', function() {
            const expanded = githubNavToggle.getAttribute('aria-expanded') === 'true';
            githubNavToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            githubNavSub.classList.toggle('open');
        });
    }

    // Get all sidebar navigation links
    const navLinks = document.querySelectorAll('.sidebar-nav a[data-page]');

    function setActiveNav(page) {
        navLinks.forEach(function(l) {
            l.classList.remove('active');
        });
        const activeLink = document.querySelector('.sidebar-nav a[data-page="' + page + '"]');
        if (activeLink) {
            activeLink.classList.add('active');
        }
        if (GITHUB_PAGES[page] && githubNavToggle && githubNavSub) {
            githubNavToggle.setAttribute('aria-expanded', 'true');
            githubNavSub.classList.add('open');
        }
    }

    // Add click event listeners to navigation links
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');

            setActiveNav(page);
            navigateTo(page);
            closeSidebar();

            // Pause background audio when a page has embedded video
            if (page === 'multimedia' || page === 'awards') {
                pauseBgAudioForVideo();
            }

            loadGithubRepos(page);
        });
    });

    // Set initial active state
    if (document.getElementById('home')) {
        setActiveNav('home');
        navigateTo('home');
    }

    // Pre-load repositories for all GitHub accounts
    Object.keys(GITHUB_PAGES).forEach(function(pageKey) {
        loadGithubRepos(pageKey);
    });

    // OJT photo gallery
    const ojtGallery = document.getElementById('ojt-gallery');
    if (ojtGallery) {
        const seen = new Set();
        OJT_GALLERY.forEach(function(item) {
            if (seen.has(item.src)) return;
            seen.add(item.src);

            const card = document.createElement('div');
            card.className = 'experience-gallery-item';

            const trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'award-image-trigger experience-image-trigger';
            trigger.setAttribute('data-src', item.src);
            trigger.setAttribute('aria-label', 'View full size: ' + item.alt);

            const wrapper = document.createElement('div');
            wrapper.className = 'experience-gallery-image-wrapper';

            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt;
            img.loading = 'lazy';

            wrapper.appendChild(img);
            trigger.appendChild(wrapper);
            card.appendChild(trigger);
            ojtGallery.appendChild(card);
        });
    }
    
    // Resume Modal Functionality
    const resumeImage = document.getElementById('resume-image');
    const resumeModal = document.getElementById('resume-modal');
    const modalImg = document.getElementById('resume-modal-img');
    const closeModal = document.querySelector('.resume-modal-close');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomResetBtn = document.getElementById('zoom-reset');
    const resumePrintBtn = document.getElementById('resume-print');
    
    let currentZoom = 1;
    const minZoom = 0.5;
    const maxZoom = 3;
    const zoomStep = 0.2;
    let isDragging = false;
    let startX, startY;
    let translateX = 0;
    let translateY = 0;
    let lastTranslateX = 0;
    let lastTranslateY = 0;
    
        // Open modal when resume image is clicked
        if (resumeImage && resumeModal && modalImg) {
            const openResumeModal = function() {
                const resumeSrc = resumeImage.getAttribute('src');
                if (resumeSrc) {
                    modalImg.src = resolveAssetPath(resumeSrc);
                }
                resumeModal.classList.add('active');
                currentZoom = 1;
                translateX = 0;
                translateY = 0;
                lastTranslateX = 0;
                lastTranslateY = 0;
                updateImageTransform();
                modalImg.style.cursor = 'grab';
                // Reset scroll position
                resumeModal.scrollTop = 0;
                resumeModal.scrollLeft = 0;
            };

            resumeImage.addEventListener('click', openResumeModal);
            resumeImage.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openResumeModal();
                }
            });
            
            // Function to update image transform
            function updateImageTransform() {
                modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
            }
        
        // Close modal
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                resumeModal.classList.remove('active');
                currentZoom = 1;
                translateX = 0;
                translateY = 0;
                lastTranslateX = 0;
                lastTranslateY = 0;
                updateImageTransform();
                modalImg.classList.remove('dragging');
                isDragging = false;
            });
        }
        
        // Close modal when clicking outside the image
        resumeModal.addEventListener('click', function(e) {
            if (e.target === resumeModal || e.target.classList.contains('resume-modal-wrapper')) {
                resumeModal.classList.remove('active');
                currentZoom = 1;
                translateX = 0;
                translateY = 0;
                lastTranslateX = 0;
                lastTranslateY = 0;
                updateImageTransform();
                modalImg.classList.remove('dragging');
                isDragging = false;
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && resumeModal.classList.contains('active')) {
                resumeModal.classList.remove('active');
                currentZoom = 1;
                translateX = 0;
                translateY = 0;
                lastTranslateX = 0;
                lastTranslateY = 0;
                updateImageTransform();
                modalImg.classList.remove('dragging');
                isDragging = false;
            }
        });
        
        // Enhanced drag to pan functionality with mouse
        modalImg.addEventListener('mousedown', function(e) {
            if (currentZoom > 1) {
                isDragging = true;
                modalImg.classList.add('dragging');
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                e.preventDefault();
                e.stopPropagation();
            }
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            e.preventDefault();
            e.stopPropagation();
            
            // Calculate new translate values
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            
            // Constrain panning to image bounds when zoomed
            const imgRect = modalImg.getBoundingClientRect();
            const modalRect = resumeModal.getBoundingClientRect();
            const scaledWidth = imgRect.width / currentZoom;
            const scaledHeight = imgRect.height / currentZoom;
            
            const maxTranslateX = (scaledWidth * currentZoom - scaledWidth) / 2;
            const maxTranslateY = (scaledHeight * currentZoom - scaledHeight) / 2;
            
            translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX));
            translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY));
            
            updateImageTransform();
        });
        
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                modalImg.classList.remove('dragging');
                lastTranslateX = translateX;
                lastTranslateY = translateY;
            }
        });
        
        // Prevent image drag (browser default)
        modalImg.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });
        
        // Touch support for mobile
        let touchStartX, touchStartY, touchScrollLeft, touchScrollTop;
        
        modalImg.addEventListener('touchstart', function(e) {
            if (currentZoom > 1) {
                isDragging = true;
                const touch = e.touches[0];
                touchStartX = touch.pageX - modalImg.offsetLeft;
                touchStartY = touch.pageY - modalImg.offsetTop;
                touchScrollLeft = resumeModal.scrollLeft;
                touchScrollTop = resumeModal.scrollTop;
            }
        }, { passive: true });
        
        modalImg.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            const touch = e.touches[0];
            const x = touch.pageX - touchStartX;
            const y = touch.pageY - touchStartY;
            resumeModal.scrollLeft = touchScrollLeft - (x - (touch.pageX - resumeModal.offsetLeft - touchStartX));
            resumeModal.scrollTop = touchScrollTop - (y - (touch.pageY - resumeModal.offsetTop - touchStartY));
        }, { passive: true });
        
        modalImg.addEventListener('touchend', function() {
            isDragging = false;
        });
        
        // Zoom in
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (currentZoom < maxZoom) {
                    currentZoom = Math.min(currentZoom + zoomStep, maxZoom);
                    // Reset translate when zooming in/out to center
                    if (currentZoom <= 1) {
                        translateX = 0;
                        translateY = 0;
                    }
                    updateImageTransform();
                    // Enable cursor when zoomed
                    if (currentZoom > 1) {
                        modalImg.style.cursor = 'grab';
                    }
                }
            });
        }
        
        // Zoom out
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (currentZoom > minZoom) {
                    currentZoom = Math.max(currentZoom - zoomStep, minZoom);
                    // Reset translate when zoomed out
                    if (currentZoom <= 1) {
                        translateX = 0;
                        translateY = 0;
                        modalImg.style.cursor = 'default';
                    }
                    updateImageTransform();
                    // Reset scroll position when zoomed out
                    if (currentZoom <= 1) {
                        resumeModal.scrollTop = 0;
                        resumeModal.scrollLeft = 0;
                    }
                }
            });
        }
        
        // Reset zoom
        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                currentZoom = 1;
                translateX = 0;
                translateY = 0;
                lastTranslateX = 0;
                lastTranslateY = 0;
                updateImageTransform();
                modalImg.style.cursor = 'default';
                // Reset scroll position
                resumeModal.scrollTop = 0;
                resumeModal.scrollLeft = 0;
            });
        }

        if (resumePrintBtn) {
            resumePrintBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (!resumeModal.classList.contains('active')) return;
                printResumeImage(modalImg.src);
            });
        }
        
        // Mouse wheel zoom (with Ctrl/Cmd key) or scroll (without modifier)
        resumeModal.addEventListener('wheel', function(e) {
            if (resumeModal.classList.contains('active')) {
                // Zoom with Ctrl/Cmd + wheel
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
                    currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom + delta));
                    
                    // Reset translate when zooming to 1x or below
                    if (currentZoom <= 1) {
                        translateX = 0;
                        translateY = 0;
                        modalImg.style.cursor = 'default';
                    } else {
                        modalImg.style.cursor = 'grab';
                    }
                    updateImageTransform();
                }
                // Otherwise, allow normal scrolling
            }
        }, { passive: false });
    }

    // Photo viewer for research awards (and other viewable images)
    const photoModal = document.getElementById('photo-modal');
    const photoModalImg = document.getElementById('photo-modal-img');
    const photoModalCaption = document.getElementById('photo-modal-caption');
    const photoModalClose = document.querySelector('.photo-modal-close');

    function openPhotoModal(relativePath, altText) {
        if (!photoModal || !photoModalImg) return;
        photoModalImg.src = resolveAssetPath(relativePath);
        photoModalImg.alt = altText || '';
        if (photoModalCaption) {
            photoModalCaption.textContent = altText || '';
        }
        photoModal.hidden = false;
        photoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePhotoModal() {
        if (!photoModal) return;
        photoModal.classList.remove('active');
        photoModal.hidden = true;
        document.body.style.overflow = '';
        if (photoModalImg) {
            photoModalImg.removeAttribute('src');
        }
    }

    if (photoModal) {
        document.addEventListener('click', function(e) {
            const trigger = e.target.closest('.award-image-trigger, .experience-image-trigger');
            if (!trigger) return;
            const path = trigger.getAttribute('data-src');
            const img = trigger.querySelector('img');
            const alt = img ? img.getAttribute('alt') : '';
            if (path) {
                openPhotoModal(path, alt);
            }
        });

        if (photoModalClose) {
            photoModalClose.addEventListener('click', closePhotoModal);
        }

        photoModal.addEventListener('click', function(e) {
            if (e.target === photoModal || e.target.classList.contains('photo-modal-wrapper')) {
                closePhotoModal();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && photoModal.classList.contains('active')) {
                closePhotoModal();
            }
        });
    }

    setupVideoBgAudioPause();

    // Multimedia image gallery (randomized cards, no sorting by name, using original links)
    const multimediaGallery = document.getElementById('multimedia-gallery');
    if (multimediaGallery) {
        const multimediaImageLinks = [
            'https://drive.google.com/file/d/1tmRBi2pkWNkrFWmGl97JpMfFX-oTm1wT/view?usp=drive_link',
            'https://drive.google.com/file/d/1tbGpm6Air5PoNpyA7NgOjTkg4p25iRmG/view?usp=drive_link',
            'https://drive.google.com/file/d/1V7Ig2HT6Xl7WLWqd6X9xOddN0jSeDo4n/view?usp=drive_link',
            'https://drive.google.com/file/d/1st9l4o6juYJsks-OalKIAxw94-gv9zfg/view?usp=drive_link',
            'https://drive.google.com/file/d/1nt3LTh2Yr23RZNajK4Pa-cNWSdwFF9FI/view?usp=drive_link',
            'https://drive.google.com/file/d/1nAv9Tb1KMpNAI_L57SGiRJ7riKd4rAwY/view?usp=drive_link',
            'https://drive.google.com/file/d/1mwnsjY9PTUjWgIuXO2GbiErzibh8Olj1/view?usp=drive_link',
            'https://drive.google.com/file/d/1j8FMbOsYJBHPWe4MkbbK2RYQEgnDCjKT/view?usp=drive_link',
            'https://drive.google.com/file/d/1htx60iarn29Z5Q8n931cd1aLa5B8SDBm/view?usp=drive_link',
            'https://drive.google.com/file/d/1Yej-Kx3qG0TdGSCGfaZqB47c-wrwAa14/view?usp=drive_link',
            'https://drive.google.com/file/d/1Yez__Yg33UR7HzdRvmdwbz2jeOciHPNj/view?usp=drive_link',
            'https://drive.google.com/file/d/1VPgxJ6w1ogrk5XlmfrFHxQyNqTTiKVkV/view?usp=drive_link',
            'https://drive.google.com/file/d/1qlrNxVDD_JdRv8tZRPdGz8iLvuhDuvZ9/view?usp=drive_link',
            'https://drive.google.com/file/d/1pJsNKZqDAgoIq-w7C4aCEw4V93KU6fhV/view?usp=drive_link',
            'https://drive.google.com/file/d/1M4OEBxOPikRqHinZYt_BxRMWu9STOoZH/view?usp=drive_link',
            'https://drive.google.com/file/d/1LyWFmLIOqz-TnTN2JV-sKaRcR_CxcDM/view?usp=drive_link',
            'https://drive.google.com/file/d/1zatZ99H0ZN1RoFBI9zNGyZ6I4jAEsimE/view?usp=drive_link',
            'https://drive.google.com/file/d/1R3Kg-X2HlWyHakuJACK-N2xVh0sQ1DJG/view?usp=drive_link',
            'https://drive.google.com/file/d/1aBKJ4l4zxRGgb9ki6XbKhZAaRS5HnO34/view?usp=drive_link',
            'https://drive.google.com/file/d/1eGgkSjvAb2Ix3_1rTrThk7M1C1EgkmVw/view?usp=drive_link',
            'https://drive.google.com/file/d/1btXI3k4C07s28om3xGXevD0Q0JbSJmci/view?usp=drive_link',
            'https://drive.google.com/file/d/1nA-Uh1OOcsXYsO0l-BqNu-0E5_9B6Eno/view?usp=drive_link'
        ];

        // Create a randomized order each time without name-based sorting
        const shuffledLinks = [...multimediaImageLinks].sort(() => Math.random() - 0.5);

        shuffledLinks.forEach((link, index) => {
            const card = document.createElement('div');
            card.className = 'media-card';

            // Use the Drive preview URL so the original link works visually
            const previewUrl = link.replace('/view?usp=drive_link', '/preview');

            const iframe = document.createElement('iframe');
            iframe.src = previewUrl;
            iframe.loading = 'lazy';
            iframe.setAttribute('allow', 'encrypted-media');
            iframe.setAttribute('title', `Multimedia photo ${index + 1}`);

            const wrapper = document.createElement('div');
            wrapper.className = 'media-card-image-wrapper';
            wrapper.appendChild(iframe);

            card.appendChild(wrapper);
            multimediaGallery.appendChild(card);
        });
    }
});
