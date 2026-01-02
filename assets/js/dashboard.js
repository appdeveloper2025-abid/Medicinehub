// PHARMADICES - Dashboard Functionality
// Manages dashboard data, statistics, and user interface

document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

let activityLog = JSON.parse(localStorage.getItem('pharmadices_activity') || '[]');
let healthTips = [
    "Always take medicines with a full glass of water unless otherwise directed by your healthcare provider.",
    "Store medicines in a cool, dry place away from direct sunlight and out of reach of children.",
    "Never share prescription medicines with others, even if they have similar symptoms.",
    "Complete the full course of antibiotics even if you feel better before finishing them.",
    "Keep a list of all your medicines and show it to every healthcare provider you visit.",
    "Check expiration dates regularly and dispose of expired medicines safely.",
    "Take medicines at the same time each day to maintain consistent levels in your body.",
    "Don't crush or break tablets unless your pharmacist says it's safe to do so.",
    "Be aware of potential food and drug interactions that could affect medicine effectiveness.",
    "Always inform your healthcare provider about any side effects you experience."
];

let currentTipIndex = 0;

function initDashboard() {
    loadDashboardData();
    setupDashboardEvents();
    updateDashboardStats();
    loadTodaySchedule();
    loadRecentActivity();
    loadFavoriteMedicines();
    updateMedicineInsights();
    displayHealthTip();
    addDashboardStyles();
}

function loadDashboardData() {
    // Load data from localStorage
    const schedules = JSON.parse(localStorage.getItem('pharmadices_schedule') || '[]');
    const favorites = JSON.parse(localStorage.getItem('pharmadices_favorites') || '[]');
    const reviews = JSON.parse(localStorage.getItem('pharmadices_reviews') || '{}');
    
    return { schedules, favorites, reviews };
}

function updateDashboardStats() {
    const { schedules, favorites, reviews } = loadDashboardData();
    
    // Update scheduled medicines count
    document.getElementById('scheduled-medicines').textContent = schedules.length;
    
    // Update favorite medicines count
    document.getElementById('favorite-medicines').textContent = favorites.length;
    
    // Update reviewed medicines count
    const reviewCount = Object.keys(reviews).length;
    document.getElementById('reviewed-medicines').textContent = reviewCount;
    
    // Calculate doses taken today
    const today = new Date().toDateString();
    let dosesToday = 0;
    schedules.forEach(schedule => {
        const todayDoses = schedule.completedDoses?.filter(dose => 
            new Date(dose.takenAt).toDateString() === today
        ) || [];
        dosesToday += todayDoses.length;
    });
    document.getElementById('doses-today').textContent = dosesToday;
}

function loadTodaySchedule() {
    const { schedules } = loadDashboardData();
    const scheduleContainer = document.getElementById('today-schedule');
    
    if (schedules.length === 0) {
        scheduleContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>No medicines scheduled for today</p>
                <button class="btn-primary" onclick="window.location.href='medicines.html'">
                    Schedule Medicine
                </button>
            </div>
        `;
        return;
    }
    
    const today = new Date().toDateString();
    let todayScheduleHTML = '';
    
    schedules.forEach(schedule => {
        const medicine = window.allMedicines?.find(m => m.id == schedule.medicineId);
        if (!medicine) return;
        
        const todayDoses = schedule.completedDoses?.filter(dose => 
            new Date(dose.takenAt).toDateString() === today
        ) || [];
        
        schedule.times.forEach(time => {
            const taken = todayDoses.some(dose => dose.time === time);
            const isPast = isTimePast(time);
            
            todayScheduleHTML += `
                <div class="schedule-item ${taken ? 'completed' : ''} ${isPast && !taken ? 'overdue' : ''}">
                    <div class="schedule-time">
                        <i class="fas fa-clock"></i>
                        <span>${time}</span>
                    </div>
                    <div class="schedule-medicine">
                        <h4>${medicine.name}</h4>
                        <p>${schedule.dosage}</p>
                    </div>
                    <div class="schedule-status">
                        ${taken ? 
                            '<i class="fas fa-check-circle completed-icon"></i>' : 
                            `<button class="take-dose-btn" data-medicine-id="${schedule.medicineId}" data-time="${time}">
                                <i class="fas fa-pills"></i> Take
                            </button>`
                        }
                    </div>
                </div>
            `;
        });
    });
    
    if (todayScheduleHTML) {
        scheduleContainer.innerHTML = todayScheduleHTML;
    } else {
        scheduleContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-check"></i>
                <p>All doses completed for today!</p>
            </div>
        `;
    }
}

function loadRecentActivity() {
    const activityContainer = document.getElementById('recent-activity');
    
    if (activityLog.length === 0) {
        activityContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clock"></i>
                <p>No recent activity</p>
            </div>
        `;
        return;
    }
    
    // Show last 5 activities
    const recentActivities = activityLog.slice(-5).reverse();
    
    let activityHTML = '';
    recentActivities.forEach(activity => {
        const timeAgo = getTimeAgo(new Date(activity.timestamp));
        activityHTML += `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.description}</p>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            </div>
        `;
    });
    
    activityContainer.innerHTML = activityHTML;
}

function loadFavoriteMedicines() {
    const { favorites } = loadDashboardData();
    const favoritesContainer = document.getElementById('favorite-medicines-list');
    
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart-broken"></i>
                <p>No favorite medicines yet</p>
                <button class="btn-primary" onclick="window.location.href='medicines.html'">
                    Browse Medicines
                </button>
            </div>
        `;
        return;
    }
    
    let favoritesHTML = '';
    favorites.slice(0, 5).forEach(medicineId => {
        const medicine = window.allMedicines?.find(m => m.id == medicineId);
        if (medicine) {
            favoritesHTML += `
                <div class="favorite-item">
                    <div class="favorite-icon">
                        <i class="fas fa-pills"></i>
                    </div>
                    <div class="favorite-info">
                        <h4>${medicine.name}</h4>
                        <p>${medicine.brand} - ${medicine.type}</p>
                    </div>
                    <button class="favorite-action" onclick="showMedicineDetails('${medicine.id}')">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            `;
        }
    });
    
    if (favorites.length > 5) {
        favoritesHTML += `
            <div class="show-more">
                <button class="btn-secondary" onclick="window.location.href='medicines.html'">
                    View All ${favorites.length} Favorites
                </button>
            </div>
        `;
    }
    
    favoritesContainer.innerHTML = favoritesHTML;
}

function updateMedicineInsights() {
    const { schedules, reviews } = loadDashboardData();
    
    // Most used medicine type
    const typeCount = {};
    schedules.forEach(schedule => {
        const medicine = window.allMedicines?.find(m => m.id == schedule.medicineId);
        if (medicine) {
            typeCount[medicine.type] = (typeCount[medicine.type] || 0) + 1;
        }
    });
    
    const mostUsedType = Object.keys(typeCount).reduce((a, b) => 
        typeCount[a] > typeCount[b] ? a : b, 'Tablet'
    );
    document.getElementById('most-used-type').textContent = mostUsedType || 'Tablet';
    
    // Average rating given
    let totalRating = 0;
    let ratingCount = 0;
    Object.values(reviews).forEach(medicineReviews => {
        medicineReviews.forEach(review => {
            totalRating += review.rating;
            ratingCount++;
        });
    });
    
    const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '0.0';
    document.getElementById('average-rating').textContent = `${averageRating}/5`;
    
    // Adherence rate
    const today = new Date();
    const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return date.toDateString();
    });
    
    let totalExpectedDoses = 0;
    let totalTakenDoses = 0;
    
    schedules.forEach(schedule => {
        last7Days.forEach(dateString => {
            totalExpectedDoses += schedule.times.length;
            const dayDoses = schedule.completedDoses?.filter(dose => 
                new Date(dose.takenAt).toDateString() === dateString
            ) || [];
            totalTakenDoses += dayDoses.length;
        });
    });
    
    const adherenceRate = totalExpectedDoses > 0 ? 
        Math.round((totalTakenDoses / totalExpectedDoses) * 100) : 0;
    document.getElementById('adherence-rate').textContent = `${adherenceRate}%`;
}

function displayHealthTip() {
    const tipContainer = document.getElementById('health-tip');
    const tip = healthTips[currentTipIndex];
    
    tipContainer.innerHTML = `
        <div class="tip-content">
            <i class="fas fa-info-circle"></i>
            <p>${tip}</p>
        </div>
    `;
}

function setupDashboardEvents() {
    // Take dose buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.take-dose-btn')) {
            const btn = e.target.closest('.take-dose-btn');
            const medicineId = btn.dataset.medicineId;
            const time = btn.dataset.time;
            takeDose(medicineId, time);
        }
    });
    
    // Next tip button
    document.getElementById('next-tip-btn')?.addEventListener('click', function() {
        currentTipIndex = (currentTipIndex + 1) % healthTips.length;
        displayHealthTip();
    });
    
    // Clear activity button
    document.getElementById('clear-activity-btn')?.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all activity history?')) {
            activityLog = [];
            localStorage.setItem('pharmadices_activity', JSON.stringify(activityLog));
            loadRecentActivity();
            showNotification('Activity history cleared', 'info');
        }
    });
    
    // Refresh insights button
    document.getElementById('refresh-insights-btn')?.addEventListener('click', function() {
        updateMedicineInsights();
        showNotification('Insights refreshed', 'success');
    });
    
    // Quick action buttons
    document.getElementById('check-interactions-btn')?.addEventListener('click', function() {
        showNotification('Select medicines from the medicines page to check interactions', 'info');
        setTimeout(() => {
            window.location.href = 'medicines.html';
        }, 2000);
    });
    
    document.getElementById('calculate-dosage-btn')?.addEventListener('click', function() {
        showNotification('Select a medicine from the medicines page to calculate dosage', 'info');
        setTimeout(() => {
            window.location.href = 'medicines.html';
        }, 2000);
    });
    
    document.getElementById('export-data-btn')?.addEventListener('click', function() {
        exportDashboardData();
    });
    
    document.getElementById('backup-data-btn')?.addEventListener('click', function() {
        backupUserData();
    });
}

function takeDose(medicineId, time) {
    // Find the schedule
    const schedules = JSON.parse(localStorage.getItem('pharmadices_schedule') || '[]');
    const schedule = schedules.find(s => s.medicineId === medicineId);
    
    if (schedule) {
        // Mark dose as taken
        if (!schedule.completedDoses) {
            schedule.completedDoses = [];
        }
        
        schedule.completedDoses.push({
            time: time,
            takenAt: new Date().toISOString()
        });
        
        schedule.lastTaken = new Date().toISOString();
        
        // Save updated schedules
        localStorage.setItem('pharmadices_schedule', JSON.stringify(schedules));
        
        // Add to activity log
        const medicine = window.allMedicines?.find(m => m.id == medicineId);
        if (medicine) {
            addActivity('dose-taken', `Took ${medicine.name} (${schedule.dosage}) at ${time}`);
        }
        
        // Refresh dashboard
        updateDashboardStats();
        loadTodaySchedule();
        loadRecentActivity();
        
        showNotification('Dose marked as taken!', 'success');
    }
}

function addActivity(type, description) {
    const activity = {
        type: type,
        description: description,
        timestamp: new Date().toISOString()
    };
    
    activityLog.push(activity);
    
    // Keep only last 50 activities
    if (activityLog.length > 50) {
        activityLog = activityLog.slice(-50);
    }
    
    localStorage.setItem('pharmadices_activity', JSON.stringify(activityLog));
}

function getActivityIcon(type) {
    const icons = {
        'dose-taken': 'fa-pills',
        'medicine-added': 'fa-plus',
        'review-added': 'fa-star',
        'favorite-added': 'fa-heart',
        'interaction-checked': 'fa-exclamation-triangle',
        'dosage-calculated': 'fa-calculator',
        'data-exported': 'fa-download'
    };
    return icons[type] || 'fa-info-circle';
}

function isTimePast(timeString) {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const timeToday = new Date();
    timeToday.setHours(hours, minutes, 0, 0);
    
    return now > timeToday;
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}

function exportDashboardData() {
    const data = {
        schedules: JSON.parse(localStorage.getItem('pharmadices_schedule') || '[]'),
        favorites: JSON.parse(localStorage.getItem('pharmadices_favorites') || '[]'),
        reviews: JSON.parse(localStorage.getItem('pharmadices_reviews') || '{}'),
        activity: activityLog,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pharmadices-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    addActivity('data-exported', 'Dashboard data exported');
    showNotification('Dashboard data exported successfully!', 'success');
}

function backupUserData() {
    const data = {
        schedules: localStorage.getItem('pharmadices_schedule'),
        favorites: localStorage.getItem('pharmadices_favorites'),
        reviews: localStorage.getItem('pharmadices_reviews'),
        activity: localStorage.getItem('pharmadices_activity'),
        userId: localStorage.getItem('pharmadices_user_id'),
        userName: localStorage.getItem('pharmadices_user_name'),
        backupDate: new Date().toISOString()
    };
    
    const backupString = btoa(JSON.stringify(data));
    
    // Create a simple backup code
    const backupCode = backupString.substring(0, 20) + '...' + backupString.substring(backupString.length - 20);
    
    const modal = document.createElement('div');
    modal.className = 'backup-modal';
    modal.innerHTML = `
        <div class="backup-modal-content">
            <div class="backup-modal-header">
                <h2><i class="fas fa-cloud-upload-alt"></i> Data Backup</h2>
                <button class="backup-modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="backup-modal-body">
                <p>Your data has been backed up. Save this backup code:</p>
                <div class="backup-code">
                    <code>${backupCode}</code>
                    <button class="copy-backup-btn" data-backup="${backupString}">
                        <i class="fas fa-copy"></i> Copy Full Backup
                    </button>
                </div>
                <p class="backup-note">Keep this backup code safe. You can use it to restore your data on any device.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.backup-modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.copy-backup-btn').addEventListener('click', function() {
        navigator.clipboard.writeText(this.dataset.backup);
        showNotification('Backup code copied to clipboard!', 'success');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    showNotification('Data backup created!', 'success');
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

function addDashboardStyles() {
    const styles = `
        .dashboard-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 0;
        }
        
        .dashboard-title {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-align: center;
        }
        
        .dashboard-subtitle {
            text-align: center;
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 40px;
        }
        
        .dashboard-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .stat-icon {
            background: rgba(255, 255, 255, 0.2);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }
        
        .stat-info h3 {
            font-size: 2rem;
            margin: 0;
            font-weight: bold;
        }
        
        .stat-info p {
            margin: 0;
            opacity: 0.9;
            font-size: 0.9rem;
        }
        
        .dashboard-content {
            padding: 60px 0;
            background: #f8f9fa;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
        }
        
        .dashboard-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .card-header h3 {
            margin: 0;
            color: #333;
            font-size: 1.1rem;
        }
        
        .card-action-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.3s ease;
        }
        
        .card-action-btn:hover {
            background: #0056b3;
        }
        
        .card-content {
            padding: 20px;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }
        
        .empty-state i {
            font-size: 3rem;
            margin-bottom: 15px;
            opacity: 0.5;
        }
        
        .empty-state p {
            margin-bottom: 20px;
        }
        
        .btn-primary, .btn-secondary {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: #007bff;
            color: white;
        }
        
        .btn-primary:hover {
            background: #0056b3;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #545b62;
        }
        
        .schedule-item {
            display: flex;
            align-items: center;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 1px solid #e0e0e0;
            transition: all 0.3s ease;
        }
        
        .schedule-item.completed {
            background: #e8f5e8;
            border-color: #4caf50;
        }
        
        .schedule-item.overdue {
            background: #ffebee;
            border-color: #f44336;
        }
        
        .schedule-time {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 80px;
            color: #666;
        }
        
        .schedule-medicine {
            flex: 1;
            margin-left: 15px;
        }
        
        .schedule-medicine h4 {
            margin: 0 0 5px 0;
            color: #333;
        }
        
        .schedule-medicine p {
            margin: 0;
            color: #666;
            font-size: 0.9rem;
        }
        
        .schedule-status {
            margin-left: 15px;
        }
        
        .take-dose-btn {
            background: #4caf50;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.3s ease;
        }
        
        .take-dose-btn:hover {
            background: #45a049;
        }
        
        .completed-icon {
            color: #4caf50;
            font-size: 1.5rem;
        }
        
        .activity-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .activity-item:last-child {
            border-bottom: none;
        }
        
        .activity-icon {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-size: 0.9rem;
        }
        
        .activity-icon.dose-taken {
            background: #e8f5e8;
            color: #4caf50;
        }
        
        .activity-icon.medicine-added {
            background: #e3f2fd;
            color: #2196f3;
        }
        
        .activity-icon.review-added {
            background: #fff8e1;
            color: #ffc107;
        }
        
        .activity-content p {
            margin: 0 0 5px 0;
            color: #333;
            font-size: 0.9rem;
        }
        
        .activity-time {
            font-size: 0.8rem;
            color: #666;
        }
        
        .favorite-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .favorite-item:last-child {
            border-bottom: none;
        }
        
        .favorite-icon {
            width: 35px;
            height: 35px;
            background: #ffebee;
            color: #e91e63;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
        }
        
        .favorite-info {
            flex: 1;
        }
        
        .favorite-info h4 {
            margin: 0 0 5px 0;
            color: #333;
            font-size: 0.95rem;
        }
        
        .favorite-info p {
            margin: 0;
            color: #666;
            font-size: 0.8rem;
        }
        
        .favorite-action {
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        
        .favorite-action:hover {
            background: #f0f0f0;
            color: #333;
        }
        
        .insight-item {
            display: flex;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .insight-item:last-child {
            border-bottom: none;
        }
        
        .insight-icon {
            width: 40px;
            height: 40px;
            background: #e3f2fd;
            color: #2196f3;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
        }
        
        .insight-info h4 {
            margin: 0 0 5px 0;
            color: #333;
            font-size: 0.95rem;
        }
        
        .insight-info p {
            margin: 0;
            color: #666;
            font-weight: 600;
        }
        
        .quick-actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
        }
        
        .quick-action-btn {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        
        .quick-action-btn:hover {
            border-color: #007bff;
            background: #f8f9ff;
        }
        
        .quick-action-btn i {
            font-size: 1.5rem;
            color: #007bff;
        }
        
        .quick-action-btn span {
            font-size: 0.8rem;
            color: #333;
            font-weight: 500;
        }
        
        .tip-content {
            display: flex;
            align-items: flex-start;
            gap: 15px;
        }
        
        .tip-content i {
            color: #17a2b8;
            font-size: 1.2rem;
            margin-top: 2px;
        }
        
        .tip-content p {
            margin: 0;
            line-height: 1.6;
            color: #333;
        }
        
        .show-more {
            text-align: center;
            margin-top: 15px;
        }
        
        .backup-modal {
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
        
        .backup-modal-content {
            background: white;
            border-radius: 12px;
            max-width: 500px;
            width: 100%;
        }
        
        .backup-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #ddd;
        }
        
        .backup-modal-header h2 {
            margin: 0;
            color: #333;
        }
        
        .backup-modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
        }
        
        .backup-modal-body {
            padding: 20px;
        }
        
        .backup-code {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .backup-code code {
            font-family: monospace;
            color: #333;
        }
        
        .copy-backup-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
        }
        
        .backup-note {
            font-size: 0.9rem;
            color: #666;
            font-style: italic;
        }
        
        @media (max-width: 768px) {
            .dashboard-title {
                font-size: 2rem;
            }
            
            .dashboard-stats {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .quick-actions-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .schedule-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
            
            .schedule-time,
            .schedule-medicine,
            .schedule-status {
                margin-left: 0;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Export functions for global access
window.PHARMADICES = window.PHARMADICES || {};
window.PHARMADICES.dashboard = {
    addActivity,
    updateDashboardStats,
    loadTodaySchedule
};