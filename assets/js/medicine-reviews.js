// PHARMADICES - Medicine Reviews & Ratings System
// Allow users to rate and review medicines

document.addEventListener('DOMContentLoaded', function() {
    initReviewSystem();
});

let medicineReviews = JSON.parse(localStorage.getItem('pharmadices_reviews') || '{}');

function initReviewSystem() {
    addReviewButtons();
    setupReviewSystem();
    addReviewStyles();
    loadExistingReviews();
}

function addReviewButtons() {
    setTimeout(() => {
        const medicineCards = document.querySelectorAll('.medicine-card');
        medicineCards.forEach(card => {
            const medicineId = card.dataset.id;
            if (medicineId && !card.querySelector('.review-btn')) {
                addReviewButton(card, medicineId);
                addRatingDisplay(card, medicineId);
            }
        });
    }, 1000);
}

function addReviewButton(card, medicineId) {
    const cardFooter = card.querySelector('.medicine-card-footer');
    if (!cardFooter) return;
    
    const reviewBtn = document.createElement('button');
    reviewBtn.className = 'review-btn';
    reviewBtn.dataset.id = medicineId;
    reviewBtn.innerHTML = `<i class="fas fa-star"></i>`;
    reviewBtn.title = 'Rate & Review';
    
    reviewBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openReviewModal(medicineId);
    });
    
    cardFooter.appendChild(reviewBtn);
}

function addRatingDisplay(card, medicineId) {
    const cardBody = card.querySelector('.medicine-card-body');
    if (!cardBody) return;
    
    const reviews = medicineReviews[medicineId] || [];
    const averageRating = calculateAverageRating(reviews);
    
    if (reviews.length > 0) {
        const ratingDisplay = document.createElement('div');
        ratingDisplay.className = 'rating-display';
        ratingDisplay.innerHTML = `
            <div class="stars">
                ${generateStarRating(averageRating)}
            </div>
            <span class="rating-text">${averageRating.toFixed(1)} (${reviews.length} review${reviews.length !== 1 ? 's' : ''})</span>
        `;
        cardBody.appendChild(ratingDisplay);
    }
}

function calculateAverageRating(reviews) {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
}

function generateStarRating(rating, interactive = false, currentRating = 0) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= rating;
        const half = !filled && i - 0.5 <= rating;
        
        if (interactive) {
            stars += `<i class="fas fa-star star-interactive ${i <= currentRating ? 'active' : ''}" data-rating="${i}"></i>`;
        } else {
            if (filled) {
                stars += '<i class="fas fa-star star-filled"></i>';
            } else if (half) {
                stars += '<i class="fas fa-star-half-alt star-half"></i>';
            } else {
                stars += '<i class="far fa-star star-empty"></i>';
            }
        }
    }
    return stars;
}

function openReviewModal(medicineId) {
    const medicine = window.allMedicines?.find(m => m.id == medicineId);
    if (!medicine) return;
    
    const reviews = medicineReviews[medicineId] || [];
    const userReview = reviews.find(r => r.userId === getCurrentUserId());
    const averageRating = calculateAverageRating(reviews);
    
    const modal = document.createElement('div');
    modal.className = 'review-modal';
    modal.innerHTML = `
        <div class="review-modal-content">
            <div class="review-modal-header">
                <h2><i class="fas fa-star"></i> Reviews - ${medicine.name}</h2>
                <button class="review-modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="review-modal-body">
                <div class="medicine-summary">
                    <div class="medicine-basic-info">
                        <h3>${medicine.name}</h3>
                        <p><strong>Brand:</strong> ${medicine.brand} | <strong>Generic:</strong> ${medicine.generic}</p>
                    </div>
                    <div class="overall-rating">
                        <div class="rating-score">
                            <span class="score">${averageRating.toFixed(1)}</span>
                            <div class="stars">${generateStarRating(averageRating)}</div>
                            <p>${reviews.length} review${reviews.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>
                
                <div class="review-form-section">
                    <h3>${userReview ? 'Update Your Review' : 'Write a Review'}</h3>
                    <form class="review-form">
                        <div class="rating-input">
                            <label>Your Rating:</label>
                            <div class="star-rating" id="star-rating">
                                ${generateStarRating(0, true, userReview?.rating || 0)}
                            </div>
                            <input type="hidden" id="rating-value" value="${userReview?.rating || 0}">
                        </div>
                        
                        <div class="form-group">
                            <label for="review-title">Review Title:</label>
                            <input type="text" id="review-title" value="${userReview?.title || ''}" placeholder="Brief summary of your experience">
                        </div>
                        
                        <div class="form-group">
                            <label for="review-text">Your Review:</label>
                            <textarea id="review-text" placeholder="Share your experience with this medicine...">${userReview?.text || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="effectiveness">Effectiveness:</label>
                            <select id="effectiveness">
                                <option value="">Select effectiveness</option>
                                <option value="very-effective" ${userReview?.effectiveness === 'very-effective' ? 'selected' : ''}>Very Effective</option>
                                <option value="effective" ${userReview?.effectiveness === 'effective' ? 'selected' : ''}>Effective</option>
                                <option value="somewhat-effective" ${userReview?.effectiveness === 'somewhat-effective' ? 'selected' : ''}>Somewhat Effective</option>
                                <option value="not-effective" ${userReview?.effectiveness === 'not-effective' ? 'selected' : ''}>Not Effective</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="side-effects">Side Effects Experienced:</label>
                            <select id="side-effects">
                                <option value="">Select side effects level</option>
                                <option value="none" ${userReview?.sideEffects === 'none' ? 'selected' : ''}>No Side Effects</option>
                                <option value="mild" ${userReview?.sideEffects === 'mild' ? 'selected' : ''}>Mild Side Effects</option>
                                <option value="moderate" ${userReview?.sideEffects === 'moderate' ? 'selected' : ''}>Moderate Side Effects</option>
                                <option value="severe" ${userReview?.sideEffects === 'severe' ? 'selected' : ''}>Severe Side Effects</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="recommend" ${userReview?.recommend ? 'checked' : ''}>
                                I would recommend this medicine to others
                            </label>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="submit-review-btn">
                                <i class="fas fa-save"></i> ${userReview ? 'Update Review' : 'Submit Review'}
                            </button>
                            ${userReview ? `
                                <button type="button" class="delete-review-btn">
                                    <i class="fas fa-trash"></i> Delete Review
                                </button>
                            ` : ''}
                        </div>
                    </form>
                </div>
                
                <div class="reviews-list">
                    <h3>All Reviews (${reviews.length})</h3>
                    ${reviews.length === 0 ? `
                        <div class="no-reviews">
                            <i class="fas fa-comment-slash"></i>
                            <p>No reviews yet. Be the first to review this medicine!</p>
                        </div>
                    ` : `
                        <div class="reviews-container">
                            ${reviews.map(review => generateReviewCard(review)).join('')}
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupReviewModalEvents(modal, medicineId);
}

function generateReviewCard(review) {
    const timeAgo = getTimeAgo(new Date(review.createdAt));
    
    return `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="reviewer-details">
                        <h4>${review.userName}</h4>
                        <span class="review-date">${timeAgo}</span>
                    </div>
                </div>
                <div class="review-rating">
                    ${generateStarRating(review.rating)}
                </div>
            </div>
            
            <div class="review-body">
                <h5>${review.title}</h5>
                <p>${review.text}</p>
                
                <div class="review-details">
                    ${review.effectiveness ? `<span class="detail-tag effectiveness-${review.effectiveness}">Effectiveness: ${review.effectiveness.replace('-', ' ')}</span>` : ''}
                    ${review.sideEffects ? `<span class="detail-tag side-effects-${review.sideEffects}">Side Effects: ${review.sideEffects}</span>` : ''}
                    ${review.recommend ? '<span class="detail-tag recommend">Recommends</span>' : '<span class="detail-tag no-recommend">Does not recommend</span>'}
                </div>
            </div>
        </div>
    `;
}

function setupReviewModalEvents(modal, medicineId) {
    const form = modal.querySelector('.review-form');
    const starRating = modal.querySelector('#star-rating');
    const ratingValue = modal.querySelector('#rating-value');
    
    // Star rating interaction
    starRating.addEventListener('click', function(e) {
        if (e.target.classList.contains('star-interactive')) {
            const rating = parseInt(e.target.dataset.rating);
            ratingValue.value = rating;
            updateStarDisplay(starRating, rating);
        }
    });
    
    starRating.addEventListener('mouseover', function(e) {
        if (e.target.classList.contains('star-interactive')) {
            const rating = parseInt(e.target.dataset.rating);
            updateStarDisplay(starRating, rating);
        }
    });
    
    starRating.addEventListener('mouseleave', function() {
        const currentRating = parseInt(ratingValue.value);
        updateStarDisplay(starRating, currentRating);
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitReview(medicineId, form);
        modal.remove();
    });
    
    // Delete review
    const deleteBtn = modal.querySelector('.delete-review-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            deleteReview(medicineId);
            modal.remove();
        });
    }
    
    // Close modal
    modal.querySelector('.review-modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function updateStarDisplay(container, rating) {
    const stars = container.querySelectorAll('.star-interactive');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function submitReview(medicineId, form) {
    const rating = parseInt(form.querySelector('#rating-value').value);
    const title = form.querySelector('#review-title').value.trim();
    const text = form.querySelector('#review-text').value.trim();
    const effectiveness = form.querySelector('#effectiveness').value;
    const sideEffects = form.querySelector('#side-effects').value;
    const recommend = form.querySelector('#recommend').checked;
    
    if (!rating || !title || !text) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const userId = getCurrentUserId();
    const userName = getCurrentUserName();
    
    const review = {
        userId,
        userName,
        rating,
        title,
        text,
        effectiveness,
        sideEffects,
        recommend,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Initialize reviews array for this medicine if it doesn't exist
    if (!medicineReviews[medicineId]) {
        medicineReviews[medicineId] = [];
    }
    
    // Remove existing review from this user
    medicineReviews[medicineId] = medicineReviews[medicineId].filter(r => r.userId !== userId);
    
    // Add new review
    medicineReviews[medicineId].push(review);
    
    // Save to localStorage
    localStorage.setItem('pharmadices_reviews', JSON.stringify(medicineReviews));
    
    // Update UI
    updateReviewDisplays();
    showNotification('Review submitted successfully!', 'success');
}

function deleteReview(medicineId) {
    const userId = getCurrentUserId();
    
    if (medicineReviews[medicineId]) {
        medicineReviews[medicineId] = medicineReviews[medicineId].filter(r => r.userId !== userId);
        localStorage.setItem('pharmadices_reviews', JSON.stringify(medicineReviews));
        updateReviewDisplays();
        showNotification('Review deleted', 'info');
    }
}

function getCurrentUserId() {
    let userId = localStorage.getItem('pharmadices_user_id');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('pharmadices_user_id', userId);
    }
    return userId;
}

function getCurrentUserName() {
    let userName = localStorage.getItem('pharmadices_user_name');
    if (!userName) {
        userName = 'Anonymous User';
        // You could prompt for a name here
    }
    return userName;
}

function updateReviewDisplays() {
    // Remove existing rating displays
    document.querySelectorAll('.rating-display').forEach(el => el.remove());
    
    // Re-add rating displays
    setTimeout(() => {
        const medicineCards = document.querySelectorAll('.medicine-card');
        medicineCards.forEach(card => {
            const medicineId = card.dataset.id;
            if (medicineId) {
                addRatingDisplay(card, medicineId);
            }
        });
    }, 100);
}

function loadExistingReviews() {
    // Load sample reviews for demonstration
    if (Object.keys(medicineReviews).length === 0) {
        const sampleReviews = {
            '1': [
                {
                    userId: 'sample_user_1',
                    userName: 'Sarah M.',
                    rating: 5,
                    title: 'Very effective for headaches',
                    text: 'This medicine works great for my headaches. No side effects and fast relief.',
                    effectiveness: 'very-effective',
                    sideEffects: 'none',
                    recommend: true,
                    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    userId: 'sample_user_2',
                    userName: 'John D.',
                    rating: 4,
                    title: 'Good pain relief',
                    text: 'Works well for pain relief. Takes about 30 minutes to kick in.',
                    effectiveness: 'effective',
                    sideEffects: 'mild',
                    recommend: true,
                    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            '2': [
                {
                    userId: 'sample_user_3',
                    userName: 'Emily R.',
                    rating: 4,
                    title: 'Effective antibiotic',
                    text: 'Cleared up my infection quickly. Had some stomach upset but manageable.',
                    effectiveness: 'effective',
                    sideEffects: 'mild',
                    recommend: true,
                    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        };
        
        medicineReviews = { ...medicineReviews, ...sampleReviews };
        localStorage.setItem('pharmadices_reviews', JSON.stringify(medicineReviews));
    }
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

function setupReviewSystem() {
    // Additional setup if needed
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'}-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function addReviewStyles() {
    const styles = `
        .review-btn {
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
        
        .review-btn:hover {
            background: #fff3e0;
            color: #ffc107;
            transform: scale(1.1);
        }
        
        .rating-display {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px dashed #ddd;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .rating-display .stars {
            display: flex;
            gap: 2px;
        }
        
        .star-filled {
            color: #ffc107;
        }
        
        .star-half {
            color: #ffc107;
        }
        
        .star-empty {
            color: #ddd;
        }
        
        .rating-text {
            font-size: 0.9rem;
            color: #666;
        }
        
        .review-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .review-modal-content {
            background: white;
            border-radius: 12px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .review-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #ddd;
            background: #f8f9fa;
        }
        
        .review-modal-header h2 {
            margin: 0;
            color: #ffc107;
        }
        
        .review-modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
        }
        
        .review-modal-body {
            padding: 20px;
            overflow-y: auto;
            max-height: 70vh;
        }
        
        .medicine-summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        
        .medicine-basic-info h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        
        .medicine-basic-info p {
            margin: 0;
            color: #666;
        }
        
        .overall-rating {
            text-align: center;
        }
        
        .rating-score .score {
            font-size: 2.5rem;
            font-weight: bold;
            color: #ffc107;
            display: block;
        }
        
        .rating-score .stars {
            margin: 10px 0;
        }
        
        .rating-score p {
            margin: 0;
            color: #666;
            font-size: 0.9rem;
        }
        
        .review-form-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        
        .review-form-section h3 {
            margin: 0 0 20px 0;
            color: #333;
        }
        
        .rating-input {
            margin-bottom: 20px;
        }
        
        .rating-input label {
            display: block;
            margin-bottom: 10px;
            font-weight: 600;
            color: #333;
        }
        
        .star-rating {
            display: flex;
            gap: 5px;
            margin-bottom: 10px;
        }
        
        .star-interactive {
            font-size: 1.5rem;
            color: #ddd;
            cursor: pointer;
            transition: color 0.2s ease;
        }
        
        .star-interactive:hover,
        .star-interactive.active {
            color: #ffc107;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #ffc107;
        }
        
        .form-group textarea {
            min-height: 100px;
            resize: vertical;
        }
        
        .form-group input[type="checkbox"] {
            width: auto;
            margin-right: 8px;
        }
        
        .form-actions {
            display: flex;
            gap: 15px;
            justify-content: flex-end;
        }
        
        .submit-review-btn, .delete-review-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }
        
        .submit-review-btn {
            background: #ffc107;
            color: #333;
        }
        
        .submit-review-btn:hover {
            background: #ffb300;
            transform: translateY(-2px);
        }
        
        .delete-review-btn {
            background: #f44336;
            color: white;
        }
        
        .delete-review-btn:hover {
            background: #d32f2f;
        }
        
        .reviews-list h3 {
            margin-bottom: 20px;
            color: #333;
            border-bottom: 2px solid #ffc107;
            padding-bottom: 10px;
        }
        
        .no-reviews {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }
        
        .no-reviews i {
            font-size: 3rem;
            margin-bottom: 15px;
        }
        
        .reviews-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .review-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .review-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .reviewer-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .reviewer-avatar {
            width: 40px;
            height: 40px;
            background: #ffc107;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        .reviewer-details h4 {
            margin: 0;
            color: #333;
        }
        
        .review-date {
            font-size: 0.9rem;
            color: #666;
        }
        
        .review-rating {
            display: flex;
            gap: 2px;
        }
        
        .review-body h5 {
            margin: 0 0 10px 0;
            color: #333;
        }
        
        .review-body p {
            margin: 0 0 15px 0;
            line-height: 1.6;
            color: #666;
        }
        
        .review-details {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .detail-tag {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .detail-tag.effectiveness-very-effective {
            background: #e8f5e8;
            color: #2e7d32;
        }
        
        .detail-tag.effectiveness-effective {
            background: #e3f2fd;
            color: #1565c0;
        }
        
        .detail-tag.effectiveness-somewhat-effective {
            background: #fff8e1;
            color: #f57c00;
        }
        
        .detail-tag.effectiveness-not-effective {
            background: #ffebee;
            color: #c62828;
        }
        
        .detail-tag.side-effects-none {
            background: #e8f5e8;
            color: #2e7d32;
        }
        
        .detail-tag.side-effects-mild {
            background: #fff8e1;
            color: #f57c00;
        }
        
        .detail-tag.side-effects-moderate {
            background: #fff3e0;
            color: #ef6c00;
        }
        
        .detail-tag.side-effects-severe {
            background: #ffebee;
            color: #c62828;
        }
        
        .detail-tag.recommend {
            background: #e8f5e8;
            color: #2e7d32;
        }
        
        .detail-tag.no-recommend {
            background: #ffebee;
            color: #c62828;
        }
        
        @media (max-width: 768px) {
            .review-modal-content {
                margin: 10px;
                max-width: none;
            }
            
            .medicine-summary {
                flex-direction: column;
                gap: 20px;
                text-align: center;
            }
            
            .form-actions {
                flex-direction: column;
            }
            
            .review-header {
                flex-direction: column;
                gap: 15px;
                align-items: flex-start;
            }
            
            .review-details {
                flex-direction: column;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Export functions for global access
window.PHARMADICES = window.PHARMADICES || {};
window.PHARMADICES.reviews = {
    medicineReviews,
    openReviewModal,
    calculateAverageRating
};