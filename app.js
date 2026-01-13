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
});
