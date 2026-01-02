// PHARMADICES - Disclaimer Page Script
// Handles disclaimer page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize disclaimer page
    initDisclaimerPage();
    
    // Add styles for disclaimer page
    addDisclaimerStyles();
});

// Initialize disclaimer page
function initDisclaimerPage() {
    // Setup scroll to sections
    setupSectionNavigation();
    
    // Setup print functionality
    setupPrintFunctionality();
    
    // Setup agreement acknowledgment
    setupAgreementAcknowledgment();
}

// Setup section navigation for better UX
function setupSectionNavigation() {
    // Add IDs to all sections for navigation
    const sections = document.querySelectorAll('.disclaimer-section');
    sections.forEach((section, index) => {
        section.id = `section-${index + 1}`;
    });
    
    // Create quick navigation if there are many sections
    if (sections.length > 4) {
        createQuickNavigation(sections);
    }
}

// Create quick navigation menu
function createQuickNavigation(sections) {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const navContainer = document.createElement('div');
    navContainer.className = 'quick-nav-container';
    
    const navTitle = document.createElement('h3');
    navTitle.innerHTML = '<i class="fas fa-list"></i> Quick Navigation';
    navTitle.className = 'quick-nav-title';
    
    const navList = document.createElement('div');
    navList.className = 'quick-nav-list';
    
    sections.forEach((section, index) => {
        const titleElement = section.querySelector('h2');
        if (titleElement) {
            const navItem = document.createElement('a');
            navItem.href = `#section-${index + 1}`;
            navItem.className = 'quick-nav-item';
            navItem.innerHTML = `<i class="fas fa-chevron-right"></i> ${titleElement.textContent}`;
            navList.appendChild(navItem);
        }
    });
    
    navContainer.appendChild(navTitle);
    navContainer.appendChild(navList);
    
    // Insert after the first container element
    const firstChild = container.firstChild;
    if (firstChild) {
        container.insertBefore(navContainer, firstChild.nextSibling);
    }
}

// Setup print functionality
function setupPrintFunctionality() {
    // Add print button to header if not already present
    const header = document.querySelector('.disclaimer-header-content');
    if (header && !document.getElementById('print-disclaimer-btn')) {
        const printBtn = document.createElement('button');
        printBtn.id = 'print-disclaimer-btn';
        printBtn.className = 'print-btn';
        printBtn.innerHTML = '<i class="fas fa-print"></i> Print Disclaimer';
        
        printBtn.addEventListener('click', function() {
            window.print();
        });
        
        header.appendChild(printBtn);
    }
}

// Setup agreement acknowledgment
function setupAgreementAcknowledgment() {
    const agreementBox = document.querySelector('.agreement-box');
    if (agreementBox) {
        // Add checkbox for user acknowledgment
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'agreement-checkbox';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'agree-checkbox';
        
        const label = document.createElement('label');
        label.htmlFor = 'agree-checkbox';
        label.innerHTML = 'I have read and understood the disclaimer above';
        
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);
        
        agreementBox.appendChild(checkboxContainer);
        
        // Add confirm button
        const confirmBtn = document.createElement('button');
        confirmBtn.id = 'confirm-agreement';
        confirmBtn.className = 'confirm-btn';
        confirmBtn.textContent = 'I Understand and Agree';
        confirmBtn.disabled = true;
        
        confirmBtn.addEventListener('click', function() {
            window.PHARMADICES.utils.showNotification('Thank you for acknowledging the disclaimer. Remember to always consult healthcare professionals for medical advice.', 'success');
            // Store acknowledgment in localStorage
            localStorage.setItem('pharmadices_disclaimer_acknowledged', 'true');
            
            // Redirect to home page after acknowledgment
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        });
        
        agreementBox.appendChild(confirmBtn);
        
        // Enable/disable button based on checkbox
        checkbox.addEventListener('change', function() {
            confirmBtn.disabled = !this.checked;
        });
    }
}

// Check if user has previously acknowledged disclaimer
function checkPreviousAcknowledgment() {
    const acknowledged = localStorage.getItem('pharmadices_disclaimer_acknowledged');
    if (acknowledged === 'true') {
        // User has previously acknowledged
        showAcknowledgmentStatus();
    }
}

// Show acknowledgment status
function showAcknowledgmentStatus() {
    const header = document.querySelector('.disclaimer-header-content');
    if (header) {
        const statusBadge = document.createElement('div');
        statusBadge.className = 'acknowledgment-badge';
        statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> You have previously acknowledged this disclaimer';
        
        header.appendChild(statusBadge);
    }
}

// Add CSS styles for disclaimer page
function addDisclaimerStyles() {
    if (!document.querySelector('#disclaimer-styles')) {
        const styles = document.createElement('style');
        styles.id = 'disclaimer-styles';
        styles.textContent = `
            /* Disclaimer Header */
            .disclaimer-header {
                background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
                color: white;
                padding: 60px 0 40px;
            }
            
            .disclaimer-header-content {
                text-align: center;
                max-width: 800px;
                margin: 0 auto;
            }
            
            .disclaimer-title {
                font-size: 2.8rem;
                margin-bottom: 15px;
            }
            
            .disclaimer-subtitle {
                font-size: 1.2rem;
                opacity: 0.9;
                margin-bottom: 25px;
            }
            
            .disclaimer-warning {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                background: rgba(255, 255, 255, 0.1);
                padding: 15px 25px;
                border-radius: 10px;
                border-left: 4px solid #ff9800;
                max-width: 600px;
                margin: 0 auto;
            }
            
            .disclaimer-warning i {
                color: #ff9800;
                font-size: 1.5rem;
            }
            
            .disclaimer-warning p {
                margin: 0;
                font-weight: 500;
            }
            
            .print-btn {
                margin-top: 25px;
                padding: 12px 25px;
                background: white;
                color: var(--primary-color);
                border: none;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: var(--transition);
                display: inline-flex;
                align-items: center;
                gap: 10px;
                font-size: 1rem;
            }
            
            .print-btn:hover {
                background: #f0f7ff;
                transform: translateY(-2px);
            }
            
            .acknowledgment-badge {
                margin-top: 20px;
                padding: 12px 25px;
                background: rgba(76, 175, 80, 0.1);
                color: #4caf50;
                border-radius: 6px;
                border-left: 4px solid #4caf50;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                font-weight: 500;
            }
            
            /* Main Disclaimer Content */
            .disclaimer-content {
                padding: 60px 0;
                background: var(--bg-light);
            }
            
            .disclaimer-card {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: var(--shadow);
                margin-bottom: 40px;
            }
            
            .disclaimer-section {
                display: flex;
                gap: 30px;
                padding: 40px;
                border-bottom: 1px solid var(--border-color);
            }
            
            .disclaimer-section:last-child {
                border-bottom: none;
            }
            
            .section-icon {
                flex-shrink: 0;
                width: 70px;
                height: 70px;
                background: #e3f2fd;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                color: var(--primary-color);
            }
            
            .section-content {
                flex: 1;
            }
            
            .section-content h2 {
                font-size: 1.6rem;
                margin-bottom: 20px;
                color: var(--text-dark);
            }
            
            .section-content p {
                color: var(--text-light);
                line-height: 1.7;
                margin-bottom: 20px;
            }
            
            .important-note {
                background: #fff8e1;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #ff9800;
                margin: 25px 0;
            }
            
            .important-note p {
                margin: 0;
                color: #5d4037;
                font-weight: 500;
            }
            
            .disclaimer-list {
                list-style: none;
                padding: 0;
                margin: 20px 0;
            }
            
            .disclaimer-list li {
                padding: 12px 0 12px 35px;
                position: relative;
                color: var(--text-light);
                line-height: 1.6;
                border-bottom: 1px dashed #eee;
            }
            
            .disclaimer-list li:last-child {
                border-bottom: none;
            }
            
            .disclaimer-list li:before {
                content: "•";
                color: var(--primary-color);
                font-weight: bold;
                font-size: 1.2rem;
                position: absolute;
                left: 15px;
            }
            
            .disclaimer-list.warning li:before {
                color: #ff5252;
            }
            
            .emergency-info {
                display: flex;
                flex-direction: column;
                gap: 20px;
                margin-top: 25px;
            }
            
            .emergency-item {
                display: flex;
                gap: 20px;
                align-items: flex-start;
                background: #ffebee;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #c62828;
            }
            
            .emergency-item i {
                color: #c62828;
                font-size: 1.8rem;
                flex-shrink: 0;
            }
            
            .emergency-item h4 {
                margin-bottom: 8px;
                color: var(--text-dark);
            }
            
            .emergency-item p {
                margin: 0;
                color: #5d4037;
            }
            
            .agreement-box {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 8px;
                border: 2px dashed var(--border-color);
                margin-top: 25px;
            }
            
            .agreement-box p {
                color: var(--text-dark);
                font-style: italic;
                line-height: 1.8;
                margin-bottom: 25px;
            }
            
            .agreement-checkbox {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .agreement-checkbox input[type="checkbox"] {
                width: 20px;
                height: 20px;
                cursor: pointer;
            }
            
            .agreement-checkbox label {
                color: var(--text-dark);
                font-weight: 500;
                cursor: pointer;
            }
            
            .confirm-btn {
                width: 100%;
                padding: 15px;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                font-size: 1.1rem;
                cursor: pointer;
                transition: var(--transition);
            }
            
            .confirm-btn:hover:not(:disabled) {
                background: var(--primary-dark);
                transform: translateY(-2px);
            }
            
            .confirm-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            /* Quick Navigation */
            .quick-nav-container {
                background: white;
                border-radius: 12px;
                padding: 25px;
                box-shadow: var(--shadow);
                margin-bottom: 30px;
            }
            
            .quick-nav-title {
                margin-bottom: 20px;
                color: var(--text-dark);
                font-size: 1.3rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .quick-nav-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .quick-nav-item {
                color: var(--text-light);
                text-decoration: none;
                padding: 12px 15px;
                border-radius: 6px;
                transition: var(--transition);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .quick-nav-item:hover {
                background: #f8f9fa;
                color: var(--primary-color);
                padding-left: 20px;
            }
            
            /* Contact Reminder */
            .contact-reminder {
                margin-bottom: 40px;
            }
            
            .contact-card {
                background: linear-gradient(135deg, #34a853 0%, #2e7d32 100%);
                color: white;
                padding: 40px;
                border-radius: 12px;
                text-align: center;
            }
            
            .contact-card h3 {
                font-size: 1.8rem;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
            }
            
            .contact-card p {
                font-size: 1.1rem;
                opacity: 0.9;
                margin-bottom: 30px;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .contact-options {
                display: flex;
                justify-content: center;
                gap: 40px;
                flex-wrap: wrap;
            }
            
            .contact-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }
            
            .contact-option i {
                font-size: 2rem;
                color: rgba(255, 255, 255, 0.8);
            }
            
            .contact-option span {
                font-weight: 500;
            }
            
            /* Developer Information */
            .developer-info {
                padding: 60px 0;
                background: white;
            }
            
            .developer-card-full {
                background: #f8f9fa;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: var(--shadow);
            }
            
            .developer-header {
                background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
                color: white;
                padding: 40px;
                text-align: center;
            }
            
            .developer-header h2 {
                font-size: 2.2rem;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
            }
            
            .developer-header p {
                font-size: 1.1rem;
                opacity: 0.9;
            }
            
            .project-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 40px;
                padding: 40px;
            }
            
            .project-info h3,
            .developers-showcase h3 {
                font-size: 1.5rem;
                margin-bottom: 20px;
                color: var(--text-dark);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .project-info p {
                color: var(--text-light);
                line-height: 1.7;
                margin-bottom: 25px;
            }
            
            .project-features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .feature {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 15px;
                background: white;
                border-radius: 8px;
                border-left: 4px solid var(--primary-color);
            }
            
            .feature i {
                color: var(--primary-color);
                font-size: 1.2rem;
            }
            
            .feature span {
                color: var(--text-dark);
                font-weight: 500;
            }
            
            .developers-showcase p {
                color: var(--text-light);
                margin-bottom: 25px;
            }
            
            .developer-profiles {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .profile-card {
                display: flex;
                gap: 20px;
                align-items: center;
                background: white;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid var(--secondary-color);
            }
            
            .profile-img {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                overflow: hidden;
                border: 3px solid var(--secondary-color);
            }
            
            .profile-img img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .profile-info h4 {
                margin-bottom: 5px;
                color: var(--text-dark);
                font-size: 1.2rem;
            }
            
            .profile-info p {
                margin: 0;
                color: var(--text-light);
                font-size: 0.9rem;
            }
            
            .profile-role {
                color: var(--secondary-color) !important;
                font-weight: 500;
                margin-top: 5px !important;
            }
            
            .project-purpose {
                padding: 40px;
                border-top: 1px solid var(--border-color);
            }
            
            .project-purpose h3 {
                font-size: 1.5rem;
                margin-bottom: 20px;
                color: var(--text-dark);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .purpose-list {
                list-style: none;
                padding: 0;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 15px;
            }
            
            .purpose-list li {
                padding: 15px 15px 15px 45px;
                background: white;
                border-radius: 8px;
                position: relative;
                color: var(--text-light);
                line-height: 1.6;
            }
            
            .purpose-list li:before {
                content: "✓";
                position: absolute;
                left: 15px;
                top: 15px;
                width: 25px;
                height: 25px;
                background: var(--secondary-color);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }
            
            /* Footer Note */
            .footer-note {
                margin-top: 15px;
                font-size: 0.9rem;
                color: #b0b0b0;
                text-align: center;
                font-style: italic;
            }
            
            /* Responsive Design */
            @media (max-width: 992px) {
                .disclaimer-title {
                    font-size: 2.3rem;
                }
                
                .disclaimer-section {
                    flex-direction: column;
                    text-align: center;
                }
                
                .section-icon {
                    margin: 0 auto;
                }
                
                .contact-options {
                    flex-direction: column;
                    gap: 25px;
                }
                
                .project-details {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 768px) {
                .disclaimer-header {
                    padding: 40px 0 30px;
                }
                
                .disclaimer-title {
                    font-size: 2rem;
                }
                
                .disclaimer-section {
                    padding: 30px 25px;
                }
                
                .emergency-item {
                    flex-direction: column;
                    text-align: center;
                }
                
                .developer-header {
                    padding: 30px 20px;
                }
                
                .developer-header h2 {
                    font-size: 1.8rem;
                }
                
                .project-details,
                .project-purpose {
                    padding: 30px 25px;
                }
                
                .profile-card {
                    flex-direction: column;
                    text-align: center;
                }
                
                .purpose-list {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 576px) {
                .disclaimer-title {
                    font-size: 1.8rem;
                }
                
                .disclaimer-subtitle {
                    font-size: 1rem;
                }
                
                .disclaimer-warning {
                    flex-direction: column;
                    text-align: center;
                    gap: 10px;
                }
                
                .contact-card {
                    padding: 30px 20px;
                }
                
                .contact-card h3 {
                    font-size: 1.5rem;
                }
                
                .project-features {
                    grid-template-columns: 1fr;
                }
            }
            
            /* Print Styles */
            @media print {
                .navbar,
                .print-btn,
                .quick-nav-container,
                .confirm-btn,
                .footer {
                    display: none !important;
                }
                
                .disclaimer-header,
                .disclaimer-content,
                .developer-info {
                    padding: 20px 0 !important;
                }
                
                .disclaimer-title {
                    font-size: 2rem !important;
                }
                
                .disclaimer-card {
                    box-shadow: none !important;
                    border: 1px solid #ddd !important;
                }
                
                .disclaimer-section {
                    page-break-inside: avoid;
                }
                
                .contact-card {
                    background: #f5f5f5 !important;
                    color: #333 !important;
                }
                
                .developer-header {
                    background: #f5f5f5 !important;
                    color: #333 !important;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Check for previous acknowledgment on page load
document.addEventListener('DOMContentLoaded', checkPreviousAcknowledgment);