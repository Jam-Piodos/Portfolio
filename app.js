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

// Set up event listeners for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('nav a[data-page]');
    
    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateTo(page);
        });
    });

    // Initial navigation to the home page (only if on home.html)
    if (document.getElementById('home')) {
        navigateTo('home');
    }
});
