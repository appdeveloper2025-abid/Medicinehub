// PHARMADICES - Main JavaScript File
// Handles common functionality across all pages

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile navigation menu
    initMobileNav();
    
    // Initialize any page-specific functionality
    initPageFeatures();
    
    // Add smooth scrolling for anchor links
    initSmoothScrolling();
    
    // Initialize footer year
    updateFooterYear();
});

// Mobile Navigation Toggle
function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !hamburger.contains(event.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
        
        // Close mobile menu on window resize if screen becomes large
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
}

// Page-specific initialization
function initPageFeatures() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'index.html':
        case '':
            initHomePage();
            break;
        case 'medicines.html':
            // Search functionality is handled in search.js
            break;
        case 'medicine-detail.html':
            initMedicineDetailPage();
            break;
        case 'medical-stores.html':
            // Map functionality is handled in map.js
            break;
    }
}

// Home Page specific features
function initHomePage() {
    // Home page search box functionality
    const homeSearchInput = document.getElementById('home-search');
    const homeSearchButton = document.querySelector('.search-box button');
    
    if (homeSearchInput && homeSearchButton) {
        // Initialize autocomplete for home search
        if (window.PHARMADICES && window.PHARMADICES.autocomplete) {
            window.PHARMADICES.autocomplete.init(homeSearchInput, {
                onSelect: function(value, entry) {
                    // When user selects from autocomplete, redirect to medicines page
                    window.location.href = `medicines.html?search=${encodeURIComponent(value)}`;
                },
                autoSubmit: true
            });
        }
        
        // Redirect to medicines page with search query
        homeSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    window.location.href = `medicines.html?search=${encodeURIComponent(query)}`;
                } else {
                    window.location.href = 'medicines.html';
                }
            }
        });
        
        homeSearchButton.addEventListener('click', function() {
            const query = homeSearchInput.value.trim();
            if (query) {
                window.location.href = `medicines.html?search=${encodeURIComponent(query)}`;
            } else {
                window.location.href = 'medicines.html';
            }
        });
        
        // Add placeholder cycling for better UX
        const placeholders = [
            'Search for medicines by name, brand, or generic...',
            'Try "Paracetamol", "Panadol", or "Augmentin"...',
            'Search for drug interactions or side effects...',
            'Find medicine dosage and precautions...'
        ];
        
        let placeholderIndex = 0;
        setInterval(() => {
            homeSearchInput.placeholder = placeholders[placeholderIndex];
            placeholderIndex = (placeholderIndex + 1) % placeholders.length;
        }, 3000);
    }
}

// Medicine Detail Page specific features
function initMedicineDetailPage() {
    // Get medicine ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const medicineId = urlParams.get('id');
    
    if (medicineId) {
        // Fetch medicine data (this will be enhanced when medicines.json is loaded)
        console.log(`Loading details for medicine ID: ${medicineId}`);
        
        // Add print functionality
        const printBtn = document.getElementById('print-btn');
        if (printBtn) {
            printBtn.addEventListener('click', function() {
                window.print();
            });
        }
        
        // Add share functionality
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn && navigator.share) {
            shareBtn.style.display = 'block';
            shareBtn.addEventListener('click', async function() {
                try {
                    await navigator.share({
                        title: document.title,
                        text: 'Check out this medicine information on Pharmadices',
                        url: window.location.href,
                    });
                } catch (err) {
                    console.log('Error sharing:', err);
                }
            });
        }
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without scrolling
                history.pushState(null, null, href);
            }
        });
    });
}

// Update footer year automatically
function updateFooterYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
    
    // Also update any copyright text
    const footerBottom = document.querySelector('.footer-bottom p');
    if (footerBottom) {
        footerBottom.innerHTML = footerBottom.innerHTML.replace(/2023|© \d{4}/g, `© ${currentYear}`);
    }
}

// Utility function to format text (capitalize, etc.)
function formatText(text) {
    if (!text) return '';
    
    // Capitalize first letter of each word for titles
    return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

// Utility function to truncate text
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Utility function to show notification/toast
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                z-index: 9999;
                animation: slideIn 0.3s ease;
                border-left: 4px solid #1a73e8;
            }
            .notification-success { border-left-color: #34a853; }
            .notification-error { border-left-color: #ea4335; }
            .notification-info { border-left-color: #1a73e8; }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #5f6368;
                font-size: 1rem;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add close functionality
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Utility function to load JSON data
async function loadJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading JSON:', error);
        showNotification('Failed to load data. Please try again.', 'error');
        return null;
    }
}

// Add animation on scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation class
    document.querySelectorAll('.feature-card, .link-card, .developer-card').forEach(el => {
        observer.observe(el);
    });
}

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
    initScrollAnimations();
}

// Export utility functions for use in other files
window.PHARMADICES = window.PHARMADICES || {};
window.PHARMADICES.utils = {
    formatText,
    truncateText,
    showNotification,
    loadJSON
};