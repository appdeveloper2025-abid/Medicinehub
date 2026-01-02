// PHARMADICES - Medicine Tracker Feature
// Track medicine intake, set reminders, and manage medication schedules

document.addEventListener('DOMContentLoaded', function() {
    initMedicineTracker();
});

let medicineSchedule = JSON.parse(localStorage.getItem('pharmadices_schedule') || '[]');
let reminderInterval;

function initMedicineTracker() {
    addTrackerButtons();
    setupTrackerModal();
    startReminderSystem();
    addTrackerStyles();
}

function addTrackerButtons() {
    setTimeout(() => {
        const medicineCards = document.querySelectorAll('.medicine-card');
        medicineCards.forEach(card => {
            const medicineId = card.dataset.id;
            if (medicineId && !card.querySelector('.tracker-btn')) {
                addTrackerButton(card, medicineId);
            }
        });
    }, 1000);
}

function addTrackerButton(card, medicineId) {
    const cardFooter = card.querySelector('.medicine-card-footer');
    if (!cardFooter) return;
    
    const trackerBtn = document.createElement('button');
    trackerBtn.className = 'tracker-btn';
    trackerBtn.dataset.id = medicineId;
    trackerBtn.innerHTML = `<i class="fas fa-clock"></i>`;
    trackerBtn.title = 'Add to medicine tracker';
    
    if (isInSchedule(medicineId)) {
        trackerBtn.classList.add('scheduled');
        trackerBtn.title = 'View schedule';
    }
    
    trackerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openTrackerModal(medicineId);
    });
    
    cardFooter.appendChild(trackerBtn);
}

function isInSchedule(medicineId) {
    return medicineSchedule.some(item => item.medicineId === medicineId);
}

function openTrackerModal(medicineId) {
    const medicine = window.allMedicines?.find(m => m.id == medicineId);
    if (!medicine) return;
    
    const existingSchedule = medicineSchedule.find(item => item.medicineId === medicineId);
    
    const modal = document.createElement('div');
    modal.className = 'tracker-modal';
    modal.innerHTML = `
        <div class="tracker-modal-content">
            <div class="tracker-modal-header">
                <h2><i class="fas fa-clock"></i> Medicine Tracker - ${medicine.name}</h2>
                <button class="tracker-modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="tracker-modal-body">
                <form class="tracker-form">
                    <div class="form-group">
                        <label for="dosage-amount">Dosage Amount:</label>
                        <input type="text" id="dosage-amount" value="${existingSchedule?.dosage || ''}" placeholder="e.g., 1 tablet, 5ml">
                    </div>
                    
                    <div class="form-group">
                        <label for="frequency">Frequency:</label>
                        <select id="frequency">
                            <option value="once" ${existingSchedule?.frequency === 'once' ? 'selected' : ''}>Once daily</option>
                            <option value="twice" ${existingSchedule?.frequency === 'twice' ? 'selected' : ''}>Twice daily</option>
                            <option value="thrice" ${existingSchedule?.frequency === 'thrice' ? 'selected' : ''}>Three times daily</option>
                            <option value="four" ${existingSchedule?.frequency === 'four' ? 'selected' : ''}>Four times daily</option>
                            <option value="custom" ${existingSchedule?.frequency === 'custom' ? 'selected' : ''}>Custom times</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="custom-times" style="display: ${existingSchedule?.frequency === 'custom' ? 'block' : 'none'}">
                        <label>Custom Times:</label>
                        <div class="time-inputs">
                            <input type="time" class="custom-time" value="${existingSchedule?.times?.[0] || ''}">
                            <input type="time" class="custom-time" value="${existingSchedule?.times?.[1] || ''}">
                            <input type="time" class="custom-time" value="${existingSchedule?.times?.[2] || ''}">
                            <input type="time" class="custom-time" value="${existingSchedule?.times?.[3] || ''}">
                        </div>
                        <button type="button" class="add-time-btn">Add Time</button>
                    </div>
                    
                    <div class="form-group">
                        <label for="start-date">Start Date:</label>
                        <input type="date" id="start-date" value="${existingSchedule?.startDate || new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group">
                        <label for="duration">Duration (days):</label>
                        <input type="number" id="duration" value="${existingSchedule?.duration || 7}" min="1" max="365">
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="enable-reminders" ${existingSchedule?.reminders ? 'checked' : ''}>
                            Enable reminders
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label for="notes">Notes:</label>
                        <textarea id="notes" placeholder="Additional notes...">${existingSchedule?.notes || ''}</textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="save-schedule-btn">
                            <i class="fas fa-save"></i> ${existingSchedule ? 'Update' : 'Save'} Schedule
                        </button>
                        ${existingSchedule ? `
                            <button type="button" class="delete-schedule-btn">
                                <i class="fas fa-trash"></i> Delete Schedule
                            </button>
                        ` : ''}
                    </div>
                </form>
                
                ${existingSchedule ? generateScheduleView(existingSchedule) : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupTrackerModalEvents(modal, medicineId);
}

function setupTrackerModalEvents(modal, medicineId) {
    const form = modal.querySelector('.tracker-form');
    const frequencySelect = modal.querySelector('#frequency');
    const customTimesDiv = modal.querySelector('#custom-times');
    
    // Handle frequency change
    frequencySelect.addEventListener('change', function() {
        customTimesDiv.style.display = this.value === 'custom' ? 'block' : 'none';
    });
    
    // Add time button
    modal.querySelector('.add-time-btn')?.addEventListener('click', function() {
        const timeInputs = modal.querySelector('.time-inputs');
        const newInput = document.createElement('input');
        newInput.type = 'time';
        newInput.className = 'custom-time';
        timeInputs.appendChild(newInput);
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSchedule(medicineId, form);
        modal.remove();
    });
    
    // Delete schedule
    modal.querySelector('.delete-schedule-btn')?.addEventListener('click', function() {
        deleteSchedule(medicineId);
        modal.remove();
    });
    
    // Close modal
    modal.querySelector('.tracker-modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function saveSchedule(medicineId, form) {
    const formData = new FormData(form);
    const frequency = form.querySelector('#frequency').value;
    const customTimes = Array.from(form.querySelectorAll('.custom-time'))
        .map(input => input.value)
        .filter(time => time);
    
    const schedule = {
        medicineId: medicineId,
        dosage: form.querySelector('#dosage-amount').value,
        frequency: frequency,
        times: frequency === 'custom' ? customTimes : getDefaultTimes(frequency),
        startDate: form.querySelector('#start-date').value,
        duration: parseInt(form.querySelector('#duration').value),
        reminders: form.querySelector('#enable-reminders').checked,
        notes: form.querySelector('#notes').value,
        createdAt: new Date().toISOString(),
        lastTaken: null,
        completedDoses: []
    };
    
    // Remove existing schedule for this medicine
    medicineSchedule = medicineSchedule.filter(item => item.medicineId !== medicineId);
    
    // Add new schedule
    medicineSchedule.push(schedule);
    
    // Save to localStorage
    localStorage.setItem('pharmadices_schedule', JSON.stringify(medicineSchedule));
    
    // Update UI
    updateTrackerButtons();
    showNotification('Medicine schedule saved successfully!', 'success');
    
    // Restart reminder system
    startReminderSystem();
}

function deleteSchedule(medicineId) {
    medicineSchedule = medicineSchedule.filter(item => item.medicineId !== medicineId);
    localStorage.setItem('pharmadices_schedule', JSON.stringify(medicineSchedule));
    updateTrackerButtons();
    showNotification('Medicine schedule deleted', 'info');
}

function getDefaultTimes(frequency) {
    switch (frequency) {
        case 'once': return ['08:00'];
        case 'twice': return ['08:00', '20:00'];
        case 'thrice': return ['08:00', '14:00', '20:00'];
        case 'four': return ['08:00', '12:00', '16:00', '20:00'];
        default: return ['08:00'];
    }
}

function generateScheduleView(schedule) {
    const medicine = window.allMedicines?.find(m => m.id == schedule.medicineId);
    const today = new Date().toDateString();
    const todayDoses = schedule.completedDoses.filter(dose => 
        new Date(dose.takenAt).toDateString() === today
    );
    
    return `
        <div class="schedule-view">
            <h3>Current Schedule</h3>
            <div class="schedule-info">
                <p><strong>Dosage:</strong> ${schedule.dosage}</p>
                <p><strong>Times:</strong> ${schedule.times.join(', ')}</p>
                <p><strong>Duration:</strong> ${schedule.duration} days</p>
                <p><strong>Progress:</strong> ${todayDoses.length}/${schedule.times.length} doses today</p>
            </div>
            
            <div class="today-doses">
                <h4>Today's Doses</h4>
                <div class="dose-buttons">
                    ${schedule.times.map(time => {
                        const taken = todayDoses.some(dose => dose.time === time);
                        return `
                            <button class="dose-btn ${taken ? 'taken' : ''}" 
                                    data-time="${time}" 
                                    data-medicine-id="${schedule.medicineId}">
                                <i class="fas fa-${taken ? 'check' : 'clock'}"></i>
                                ${time} ${taken ? '✓' : ''}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

function setupTrackerModal() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.dose-btn')) {
            const btn = e.target.closest('.dose-btn');
            const medicineId = btn.dataset.medicineId;
            const time = btn.dataset.time;
            
            if (!btn.classList.contains('taken')) {
                markDoseTaken(medicineId, time);
                btn.classList.add('taken');
                btn.innerHTML = `<i class="fas fa-check"></i> ${time} ✓`;
                showNotification('Dose marked as taken!', 'success');
            }
        }
    });
}

function markDoseTaken(medicineId, time) {
    const schedule = medicineSchedule.find(item => item.medicineId === medicineId);
    if (schedule) {
        schedule.completedDoses.push({
            time: time,
            takenAt: new Date().toISOString()
        });
        schedule.lastTaken = new Date().toISOString();
        localStorage.setItem('pharmadices_schedule', JSON.stringify(medicineSchedule));
    }
}

function startReminderSystem() {
    if (reminderInterval) {
        clearInterval(reminderInterval);
    }
    
    reminderInterval = setInterval(checkReminders, 60000); // Check every minute
}

function checkReminders() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const today = now.toDateString();
    
    medicineSchedule.forEach(schedule => {
        if (!schedule.reminders) return;
        
        schedule.times.forEach(time => {
            if (time === currentTime) {
                const todayDoses = schedule.completedDoses.filter(dose => 
                    new Date(dose.takenAt).toDateString() === today && dose.time === time
                );
                
                if (todayDoses.length === 0) {
                    const medicine = window.allMedicines?.find(m => m.id == schedule.medicineId);
                    showMedicineReminder(medicine, schedule);
                }
            }
        });
    });
}

function showMedicineReminder(medicine, schedule) {
    if (!medicine) return;
    
    // Request notification permission if not granted
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Show browser notification
    if (Notification.permission === 'granted') {
        new Notification('Medicine Reminder - PHARMADICES', {
            body: `Time to take ${medicine.name} (${schedule.dosage})`,
            icon: 'assets/images/logo.png',
            tag: `medicine-${medicine.id}`
        });
    }
    
    // Show in-app notification
    showNotification(`⏰ Time to take ${medicine.name} (${schedule.dosage})`, 'info');
    
    // Play reminder sound
    playReminderSound();
}

function playReminderSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Audio not supported');
    }
}

function updateTrackerButtons() {
    document.querySelectorAll('.tracker-btn').forEach(btn => {
        const medicineId = btn.dataset.id;
        if (isInSchedule(medicineId)) {
            btn.classList.add('scheduled');
            btn.title = 'View schedule';
        } else {
            btn.classList.remove('scheduled');
            btn.title = 'Add to medicine tracker';
        }
    });
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
    }, 5000);
}

function addTrackerStyles() {
    const styles = `
        .tracker-btn {
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
        
        .tracker-btn:hover {
            background: #e8f5e8;
            color: #4caf50;
            transform: scale(1.1);
        }
        
        .tracker-btn.scheduled {
            background: #4caf50;
            color: white;
        }
        
        .tracker-modal {
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
        
        .tracker-modal-content {
            background: white;
            border-radius: 12px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .tracker-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #ddd;
            background: #f8f9fa;
        }
        
        .tracker-modal-header h2 {
            margin: 0;
            color: #4caf50;
            font-size: 1.3rem;
        }
        
        .tracker-modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
        }
        
        .tracker-modal-body {
            padding: 20px;
            overflow-y: auto;
            max-height: 70vh;
        }
        
        .tracker-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .form-group label {
            font-weight: 600;
            color: #333;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
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
            border-color: #4caf50;
        }
        
        .time-inputs {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .custom-time {
            flex: 1;
            min-width: 120px;
        }
        
        .add-time-btn {
            background: #2196f3;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        .form-actions {
            display: flex;
            gap: 15px;
            justify-content: flex-end;
            margin-top: 20px;
        }
        
        .save-schedule-btn {
            background: #4caf50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .delete-schedule-btn {
            background: #f44336;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .schedule-view {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #4caf50;
        }
        
        .schedule-info {
            margin: 15px 0;
        }
        
        .schedule-info p {
            margin: 8px 0;
            color: #666;
        }
        
        .today-doses {
            margin-top: 20px;
        }
        
        .dose-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
        }
        
        .dose-btn {
            background: #fff;
            border: 2px solid #4caf50;
            color: #4caf50;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
        }
        
        .dose-btn:hover {
            background: #4caf50;
            color: white;
        }
        
        .dose-btn.taken {
            background: #4caf50;
            color: white;
            cursor: default;
        }
        
        @media (max-width: 768px) {
            .tracker-modal-content {
                margin: 10px;
                max-width: none;
            }
            
            .form-actions {
                flex-direction: column;
            }
            
            .dose-buttons {
                flex-direction: column;
            }
            
            .time-inputs {
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
window.PHARMADICES.tracker = {
    medicineSchedule,
    openTrackerModal,
    markDoseTaken
};