// PHARMADICES - Favorites Functionality
// Handles medicine favorites/bookmarks

document.addEventListener('DOMContentLoaded', function() {
    initFavorites();
});

// Initialize favorites functionality
function initFavorites() {
    // Add favorites buttons to medicine cards
    addFavoritesButtons();
    
    // Setup favorites page if exists
    if (window.location.pathname.includes('favorites.html')) {
        loadFavoritesPage();
    }
}

// Add favorites buttons to medicine cards
function addFavoritesButtons() {
    // Wait for medicine cards to load
    setTimeout(() => {
        const medicineCards = document.querySelectorAll('.medicine-card');
        medicineCards.forEach(card => {
            const medicineId = card.dataset.id;
            if (medicineId && !card.querySelector('.favorite-btn')) {
                addFavoriteButton(card, medicineId);
            }
        });
    }, 1000);
}

// Add favorite button to a medicine card
function addFavoriteButton(card, medicineId) {
    const cardFooter = card.querySelector('.medicine-card-footer');
    if (!cardFooter) return;
    
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'favorite-btn';
    favoriteBtn.dataset.id = medicineId;
    favoriteBtn.innerHTML = `<i class="fas fa-heart"></i>`;
    favoriteBtn.title = 'Add to favorites';
    
    // Check if already favorited
    if (isFavorite(medicineId)) {
        favoriteBtn.classList.add('favorited');
        favoriteBtn.title = 'Remove from favorites';
    }
    
    favoriteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleFavorite(medicineId, favoriteBtn);
    });
    
    cardFooter.appendChild(favoriteBtn);
}

// Toggle favorite status
function toggleFavorite(medicineId, button) {
    const favorites = getFavorites();
    
    if (favorites.includes(medicineId)) {
        // Remove from favorites
        const index = favorites.indexOf(medicineId);
        favorites.splice(index, 1);
        button.classList.remove('favorited');
        button.title = 'Add to favorites';
        showNotification('Removed from favorites', 'info');
    } else {
        // Add to favorites
        favorites.push(medicineId);
        button.classList.add('favorited');
        button.title = 'Remove from favorites';
        showNotification('Added to favorites', 'success');
    }
    
    saveFavorites(favorites);
}

// Get favorites from localStorage
function getFavorites() {
    const favorites = localStorage.getItem('pharmadices_favorites');
    return favorites ? JSON.parse(favorites) : [];
}

// Save favorites to localStorage
function saveFavorites(favorites) {
    localStorage.setItem('pharmadices_favorites', JSON.stringify(favorites));
}

// Check if medicine is favorite
function isFavorite(medicineId) {
    return getFavorites().includes(medicineId);
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Add CSS for favorites functionality
const favoritesStyles = `
    .favorite-btn {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: #f1f3f4;
        color: #666;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 10px;
    }
    
    .favorite-btn:hover {
        background: #ffebee;
        color: #e91e63;
        transform: scale(1.1);
    }
    
    .favorite-btn.favorited {
        background: #e91e63;
        color: white;
    }
    
    .favorite-btn.favorited:hover {
        background: #c2185b;
    }
    
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
        gap: 10px;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        border-left: 4px solid #4caf50;
    }
    
    .notification.info {
        border-left: 4px solid #2196f3;
    }
    
    .notification i {
        font-size: 1.2rem;
    }
    
    .notification.success i {
        color: #4caf50;
    }
    
    .notification.info i {
        color: #2196f3;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = favoritesStyles;
document.head.appendChild(styleSheet);