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

// Set up event listeners for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('nav a[data-page]');
    
    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            navigateTo(page);
            
            // Load repositories when navigating to those sections
            if (page === 'projects') {
                fetchRepositories('PinkyBabe', 'pinkybabe-repos');
            } else if (page === 'repositories') {
                fetchRepositories('Jam-Piodos', 'jam-piodos-repos');
            }
        });
    });
    
    // Set initial active state
    const initialPage = document.getElementById('home') ? 'home' : null;
    if (initialPage) {
        const initialLink = document.querySelector(`nav a[data-page="${initialPage}"]`);
        if (initialLink) {
            initialLink.classList.add('active');
        }
    }

    // Initial navigation to the home page (only if on home.html)
    if (document.getElementById('home')) {
        navigateTo('home');
    }
    
    // Pre-load repositories for both accounts
    fetchRepositories('PinkyBabe', 'pinkybabe-repos');
    fetchRepositories('Jam-Piodos', 'jam-piodos-repos');
    
    // Handle dropdown click (instead of hover)
    const dropbtn = document.querySelector('.dropbtn');
    const dropdown = document.querySelector('.dropdown');
    
    if (dropbtn && dropdown) {
        dropbtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle dropdown
            dropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
        
        // Close dropdown when clicking on a dropdown item
        const dropdownLinks = document.querySelectorAll('.dropdown-content a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function() {
                dropdown.classList.remove('active');
            });
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
    
    let currentZoom = 1;
    const minZoom = 0.5;
    const maxZoom = 3;
    const zoomStep = 0.2;
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;
    
    // Open modal when resume image is clicked
    if (resumeImage && resumeModal && modalImg) {
        resumeImage.addEventListener('click', function() {
            resumeModal.classList.add('active');
            currentZoom = 1;
            modalImg.style.transform = `scale(${currentZoom})`;
            modalImg.style.cursor = 'grab';
            // Reset scroll position
            resumeModal.scrollTop = 0;
            resumeModal.scrollLeft = 0;
        });
        
        // Close modal
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                resumeModal.classList.remove('active');
                currentZoom = 1;
                modalImg.style.transform = `scale(${currentZoom})`;
                modalImg.classList.remove('dragging');
                isDragging = false;
            });
        }
        
        // Close modal when clicking outside the image
        resumeModal.addEventListener('click', function(e) {
            if (e.target === resumeModal || e.target.classList.contains('resume-modal-wrapper')) {
                resumeModal.classList.remove('active');
                currentZoom = 1;
                modalImg.style.transform = `scale(${currentZoom})`;
                modalImg.classList.remove('dragging');
                isDragging = false;
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && resumeModal.classList.contains('active')) {
                resumeModal.classList.remove('active');
                currentZoom = 1;
                modalImg.style.transform = `scale(${currentZoom})`;
                modalImg.classList.remove('dragging');
                isDragging = false;
            }
        });
        
        // Drag to pan functionality
        modalImg.addEventListener('mousedown', function(e) {
            if (currentZoom > 1) {
                isDragging = true;
                modalImg.classList.add('dragging');
                startX = e.pageX - modalImg.offsetLeft;
                startY = e.pageY - modalImg.offsetTop;
                scrollLeft = resumeModal.scrollLeft;
                scrollTop = resumeModal.scrollTop;
                e.preventDefault();
            }
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - startX;
            const y = e.pageY - startY;
            resumeModal.scrollLeft = scrollLeft - (x - (e.pageX - resumeModal.offsetLeft - startX));
            resumeModal.scrollTop = scrollTop - (y - (e.pageY - resumeModal.offsetTop - startY));
        });
        
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                modalImg.classList.remove('dragging');
            }
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
                    modalImg.style.transform = `scale(${currentZoom})`;
                    // Enable scrolling when zoomed
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
                    modalImg.style.transform = `scale(${currentZoom})`;
                    if (currentZoom <= 1) {
                        modalImg.style.cursor = 'default';
                        // Reset scroll position when zoomed out
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
                modalImg.style.transform = `scale(${currentZoom})`;
                modalImg.style.cursor = 'default';
                // Reset scroll position
                resumeModal.scrollTop = 0;
                resumeModal.scrollLeft = 0;
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
                    modalImg.style.transform = `scale(${currentZoom})`;
                    if (currentZoom > 1) {
                        modalImg.style.cursor = 'grab';
                    } else {
                        modalImg.style.cursor = 'default';
                    }
                }
                // Otherwise, allow normal scrolling
            }
        }, { passive: false });
    }
});
