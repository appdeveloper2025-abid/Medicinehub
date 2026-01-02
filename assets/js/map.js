// PHARMADICES - Medical Stores Map Functionality
// Handles Google Maps integration and store locations

document.addEventListener('DOMContentLoaded', function() {
    // Initialize map and stores functionality
    initMedicalStores();
    
    // Add styles for stores page
    addStoresPageStyles();
});

// Global variables
let map;
let markers = [];
let storesData = [];
let currentCity = 'all';
let userLocation = null;

// Initialize medical stores functionality
function initMedicalStores() {
    // Setup event listeners
    setupEventListeners();
    
    // Load stores data
    loadStoresData();
    
    // Initialize map (will be called by Google Maps API)
    window.initMap = initMap;
}

// Initialize Google Map
function initMap() {
    // Default center (Pakistan)
    const defaultCenter = { lat: 30.3753, lng: 69.3451 };
    
    // Create map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: defaultCenter,
        mapTypeId: 'roadmap',
        styles: [
            {
                "featureType": "poi.medical",
                "elementType": "labels",
                "stylers": [{ "visibility": "on" }]
            }
        ]
    });
    
    // Hide loading state
    hideMapLoading();
    
    // Add markers for all stores
    addAllStoreMarkers();
}

// Load stores data
async function loadStoresData() {
    try {
        showStoresLoading(true);
        
        // For now, we'll use sample data
        // In a real implementation, this would load from a JSON file
        storesData = getSampleStoresData();
        
        // Update stores count
        updateStoresCount(storesData.length);
        
        // Display stores list
        displayStoresList(storesData);
        
        showStoresLoading(false);
        
    } catch (error) {
        console.error('Error loading stores data:', error);
        showStoresLoading(false);
        showNoStores(true, 'Failed to load stores data. Please try again later.');
    }
}

// Get sample stores data
function getSampleStoresData() {
    return [
        // Lakki Marwat Stores
        {
            id: 1,
            name: "Al-Shifa Medical Store",
            type: "store",
            city: "lakki-marwat",
            address: "Main Bazaar, Lakki Marwat",
            phone: "0966-123456",
            timing: "9:00 AM - 11:00 PM",
            emergency: false,
            lat: 32.6071,
            lng: 70.9129,
            services: ["Prescription Medicines", "OTC Drugs", "Medical Equipment"],
            description: "One of the oldest medical stores in Lakki Marwat, providing quality medicines and healthcare products."
        },
        {
            id: 2,
            name: "Marwat Pharmacy",
            type: "pharmacy",
            city: "lakki-marwat",
            address: "City Center, Lakki Marwat",
            phone: "0966-234567",
            timing: "24/7",
            emergency: true,
            lat: 32.6050,
            lng: 70.9150,
            services: ["24/7 Service", "Emergency Medicines", "Prescription", "First Aid"],
            description: "24/7 pharmacy providing emergency medical services in Lakki Marwat."
        },
        {
            id: 3,
            name: "Lakki Medical Store",
            type: "store",
            city: "lakki-marwat",
            address: "Hospital Road, Lakki Marwat",
            phone: "0966-345678",
            timing: "8:00 AM - 10:00 PM",
            emergency: false,
            lat: 32.6080,
            lng: 70.9100,
            services: ["All Medicines", "Surgical Items", "Baby Care"],
            description: "Complete medical store with wide range of healthcare products."
        },
        
        // Islamabad Stores
        {
            id: 4,
            name: "Islamabad Medical Center",
            type: "hospital",
            city: "islamabad",
            address: "Blue Area, Islamabad",
            phone: "051-1234567",
            timing: "24/7",
            emergency: true,
            lat: 33.6844,
            lng: 73.0479,
            services: ["Hospital Pharmacy", "Emergency", "Specialized Medicines"],
            description: "Hospital pharmacy with complete range of medicines and emergency services."
        },
        {
            id: 5,
            name: "F-10 Pharmacy",
            type: "pharmacy",
            city: "islamabad",
            address: "F-10 Markaz, Islamabad",
            phone: "051-2345678",
            timing: "8:00 AM - 12:00 AM",
            emergency: true,
            lat: 33.6900,
            lng: 73.0500,
            services: ["Prescription", "OTC", "Health Supplements"],
            description: "Modern pharmacy with trained pharmacists."
        },
        
        // Rawalpindi Stores
        {
            id: 6,
            name: "Raja Bazaar Medical Store",
            type: "store",
            city: "rawalpindi",
            address: "Raja Bazaar, Rawalpindi",
            phone: "051-3456789",
            timing: "9:00 AM - 11:00 PM",
            emergency: false,
            lat: 33.6007,
            lng: 73.0679,
            services: ["All Medicines", "Surgical", "Equipment"],
            description: "Large medical store in busy commercial area."
        },
        
        // Lahore Stores
        {
            id: 7,
            name: "Shalimar Pharmacy",
            type: "pharmacy",
            city: "lahore",
            address: "Shalimar Link Road, Lahore",
            phone: "042-1234567",
            timing: "24/7",
            emergency: true,
            lat: 31.5497,
            lng: 74.3436,
            services: ["24/7", "Emergency", "Home Delivery"],
            description: "24-hour pharmacy with emergency services."
        },
        
        // Karachi Stores
        {
            id: 8,
            name: "Karachi Medical Store",
            type: "store",
            city: "karachi",
            address: "Tariq Road, Karachi",
            phone: "021-1234567",
            timing: "9:00 AM - 11:00 PM",
            emergency: false,
            lat: 24.8607,
            lng: 67.0011,
            services: ["Imported Medicines", "Surgical", "Equipment"],
            description: "Well-stocked medical store with imported medicines."
        },
        
        // Peshawar Stores
        {
            id: 9,
            name: "Peshawar Pharmacy",
            type: "pharmacy",
            city: "peshawar",
            address: "University Road, Peshawar",
            phone: "091-1234567",
            timing: "24/7",
            emergency: true,
            lat: 34.0151,
            lng: 71.5249,
            services: ["Emergency", "Prescription", "Consultation"],
            description: "24/7 pharmacy with pharmacist consultation."
        },
        
        // Quetta Stores
        {
            id: 10,
            name: "Quetta Medical Center",
            type: "hospital",
            city: "quetta",
            address: "Jinnah Road, Quetta",
            phone: "081-1234567",
            timing: "24/7",
            emergency: true,
            lat: 30.1798,
            lng: 66.9750,
            services: ["Hospital Pharmacy", "Emergency", "Special Care"],
            description: "Hospital-based pharmacy with emergency services."
        },
        
        // Multan Stores
        {
            id: 11,
            name: "Multan Medical Store",
            type: "store",
            city: "multan",
            address: "Bosan Road, Multan",
            phone: "061-1234567",
            timing: "8:00 AM - 10:00 PM",
            emergency: false,
            lat: 30.1575,
            lng: 71.5249,
            services: ["All Medicines", "Surgical", "Healthcare"],
            description: "Complete medical store serving Multan area."
        },
        
        // Faisalabad Stores
        {
            id: 12,
            name: "Faisalabad Pharmacy",
            type: "pharmacy",
            city: "faisalabad",
            address: "Kohinoor City, Faisalabad",
            phone: "041-1234567",
            timing: "24/7",
            emergency: true,
            lat: 31.4504,
            lng: 73.1350,
            services: ["24/7", "Emergency", "Delivery"],
            description: "24-hour pharmacy with delivery service."
        }
    ];
}

// Setup event listeners
function setupEventListeners() {
    // City filter change
    const citySelect = document.getElementById('city-select');
    const findStoresBtn = document.getElementById('find-stores');
    const useLocationBtn = document.getElementById('use-location');
    
    if (citySelect) {
        citySelect.addEventListener('change', function() {
            currentCity = this.value;
        });
    }
    
    if (findStoresBtn) {
        findStoresBtn.addEventListener('click', filterStoresByCity);
    }
    
    if (useLocationBtn) {
        useLocationBtn.addEventListener('click', getUserLocation);
    }
    
    // Map controls
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetMapBtn = document.getElementById('reset-map');
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
            if (map) {
                map.setZoom(map.getZoom() + 1);
            }
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            if (map) {
                map.setZoom(map.getZoom() - 1);
            }
        });
    }
    
    if (resetMapBtn) {
        resetMapBtn.addEventListener('click', function() {
            if (map) {
                map.setCenter({ lat: 30.3753, lng: 69.3451 });
                map.setZoom(6);
            }
        });
    }
    
    // Store modal close
    const closeModalBtn = document.querySelector('.store-modal-close');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeStoreModal);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('store-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeStoreModal();
            }
        });
    }
}

// Filter stores by selected city
function filterStoresByCity() {
    let filteredStores;
    
    if (currentCity === 'all') {
        filteredStores = storesData;
    } else {
        filteredStores = storesData.filter(store => store.city === currentCity);
    }
    
    // Update stores count
    updateStoresCount(filteredStores.length);
    
    // Display filtered stores
    displayStoresList(filteredStores);
    
    // Update map markers
    updateMapMarkers(filteredStores);
    
    // Center map on selected city
    centerMapOnCity(currentCity);
}

// Center map on selected city
function centerMapOnCity(city) {
    if (!map) return;
    
    const cityCenters = {
        'lakki-marwat': { lat: 32.6071, lng: 70.9129, zoom: 13 },
        'islamabad': { lat: 33.6844, lng: 73.0479, zoom: 12 },
        'rawalpindi': { lat: 33.6007, lng: 73.0679, zoom: 12 },
        'lahore': { lat: 31.5497, lng: 74.3436, zoom: 12 },
        'karachi': { lat: 24.8607, lng: 67.0011, zoom: 12 },
        'peshawar': { lat: 34.0151, lng: 71.5249, zoom: 12 },
        'quetta': { lat: 30.1798, lng: 66.9750, zoom: 12 },
        'multan': { lat: 30.1575, lng: 71.5249, zoom: 12 },
        'faisalabad': { lat: 31.4504, lng: 73.1350, zoom: 12 },
        'all': { lat: 30.3753, lng: 69.3451, zoom: 6 }
    };
    
    const center = cityCenters[city] || cityCenters.all;
    
    map.setCenter(center);
    map.setZoom(center.zoom);
}

// Get user's location
function getUserLocation() {
    if (!navigator.geolocation) {
        window.PHARMADICES.utils.showNotification('Geolocation is not supported by your browser', 'error');
        return;
    }
    
    window.PHARMADICES.utils.showNotification('Getting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // Center map on user location
            if (map) {
                map.setCenter(userLocation);
                map.setZoom(14);
                
                // Add user marker
                addUserMarker();
                
                // Find nearest stores
                findNearestStores(userLocation);
            }
            
            window.PHARMADICES.utils.showNotification('Location found! Showing nearby stores.', 'success');
        },
        function(error) {
            console.error('Error getting location:', error);
            window.PHARMADICES.utils.showNotification('Unable to get your location. Please enable location services.', 'error');
        }
    );
}

// Find nearest stores to user location
function findNearestStores(userLocation) {
    if (!userLocation || storesData.length === 0) return;
    
    // Calculate distances and sort
    const storesWithDistance = storesData.map(store => {
        const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            store.lat,
            store.lng
        );
        return { ...store, distance };
    });
    
    // Sort by distance
    storesWithDistance.sort((a, b) => a.distance - b.distance);
    
    // Take top 5 nearest stores
    const nearestStores = storesWithDistance.slice(0, 5);
    
    // Update display
    updateStoresCount(nearestStores.length);
    displayStoresList(nearestStores);
    updateMapMarkers(nearestStores);
}

// Calculate distance between two coordinates (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Add all store markers to map
function addAllStoreMarkers() {
    if (!map || storesData.length === 0) return;
    
    clearMarkers();
    
    storesData.forEach(store => {
        addStoreMarker(store);
    });
}

// Add a single store marker
function addStoreMarker(store) {
    if (!map) return;
    
    // Choose icon based on store type
    let iconUrl;
    switch(store.type) {
        case 'pharmacy':
            iconUrl = 'https://maps.google.com/mapfiles/ms/icons/pharmacy.png';
            break;
        case 'hospital':
            iconUrl = 'https://maps.google.com/mapfiles/ms/icons/hospitals.png';
            break;
        case 'store':
        default:
            iconUrl = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    }
    
    const marker = new google.maps.Marker({
        position: { lat: store.lat, lng: store.lng },
        map: map,
        title: store.name,
        icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(40, 40)
        }
    });
    
    // Add click event
    marker.addListener('click', function() {
        showStoreDetails(store);
    });
    
    markers.push(marker);
}

// Add user marker
function addUserMarker() {
    if (!map || !userLocation) return;
    
    const userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new google.maps.Size(40, 40)
        }
    });
    
    markers.push(userMarker);
}

// Clear all markers
function clearMarkers() {
    markers.forEach(marker => {
        marker.setMap(null);
    });
    markers = [];
}

// Update map markers based on filtered stores
function updateMapMarkers(filteredStores) {
    if (!map) return;
    
    clearMarkers();
    
    filteredStores.forEach(store => {
        addStoreMarker(store);
    });
}

// Display stores list
function displayStoresList(stores) {
    const storesGrid = document.getElementById('stores-grid');
    const noStores = document.getElementById('no-stores');
    
    if (!storesGrid) return;
    
    // Clear existing stores
    storesGrid.innerHTML = '';
    
    // Check if there are stores to display
    if (stores.length === 0) {
        showNoStores(true);
        return;
    }
    
    showNoStores(false);
    
    // Create store cards
    stores.forEach(store => {
        const storeCard = createStoreCard(store);
        storesGrid.appendChild(storeCard);
    });
}

// Create a store card
function createStoreCard(store) {
    const card = document.createElement('div');
    card.className = 'store-card';
    card.dataset.id = store.id;
    
    // Get store type icon
    const typeIcon = getStoreTypeIcon(store.type);
    const typeLabel = getStoreTypeLabel(store.type);
    
    card.innerHTML = `
        <div class="store-card-header">
            <div class="store-type ${store.type}">
                <i class="fas ${typeIcon}"></i>
                <span>${typeLabel}</span>
            </div>
            ${store.emergency ? '<span class="emergency-badge">24/7</span>' : ''}
        </div>
        
        <div class="store-card-body">
            <h3 class="store-name">${store.name}</h3>
            <div class="store-address">
                <i class="fas fa-map-marker-alt"></i>
                <span>${store.address}</span>
            </div>
            <div class="store-city">
                <i class="fas fa-city"></i>
                <span>${formatCityName(store.city)}</span>
            </div>
            <div class="store-timing">
                <i class="fas fa-clock"></i>
                <span>${store.timing}</span>
            </div>
            <div class="store-phone">
                <i class="fas fa-phone"></i>
                <span>${store.phone || 'Not available'}</span>
            </div>
        </div>
        
        <div class="store-card-footer">
            <button class="view-store-btn" data-id="${store.id}">
                <i class="fas fa-info-circle"></i> View Details
            </button>
            <button class="directions-btn" data-id="${store.id}">
                <i class="fas fa-directions"></i> Directions
            </button>
        </div>
    `;
    
    // Add click events
    const viewBtn = card.querySelector('.view-store-btn');
    const directionsBtn = card.querySelector('.directions-btn');
    
    viewBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showStoreDetails(store);
    });
    
    directionsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openDirections(store);
    });
    
    // Make entire card clickable
    card.addEventListener('click', function() {
        showStoreDetails(store);
    });
    
    return card;
}

// Show store details in modal
function showStoreDetails(store) {
    const modalTitle = document.getElementById('store-modal-title');
    const modalBody = document.getElementById('store-modal-body');
    
    modalTitle.textContent = store.name;
    
    const typeIcon = getStoreTypeIcon(store.type);
    const typeLabel = getStoreTypeLabel(store.type);
    
    modalBody.innerHTML = `
        <div class="store-detail-header">
            <div class="store-detail-type ${store.type}">
                <i class="fas ${typeIcon}"></i>
                <span>${typeLabel}</span>
            </div>
            ${store.emergency ? '<span class="emergency-badge large">24/7 Emergency</span>' : ''}
        </div>
        
        <div class="store-detail-info">
            <div class="detail-row">
                <div class="detail-col">
                    <h4><i class="fas fa-map-marker-alt"></i> Address</h4>
                    <p>${store.address}</p>
                </div>
                <div class="detail-col">
                    <h4><i class="fas fa-city"></i> City</h4>
                    <p>${formatCityName(store.city)}</p>
                </div>
            </div>
            
            <div class="detail-row">
                <div class="detail-col">
                    <h4><i class="fas fa-phone"></i> Phone</h4>
                    <p>${store.phone || 'Not available'}</p>
                </div>
                <div class="detail-col">
                    <h4><i class="fas fa-clock"></i> Timing</h4>
                    <p>${store.timing}</p>
                </div>
            </div>
            
            <div class="store-detail-section">
                <h3><i class="fas fa-info-circle"></i> Description</h3>
                <p>${store.description}</p>
            </div>
            
            <div class="store-detail-section">
                <h3><i class="fas fa-concierge-bell"></i> Services</h3>
                <div class="services-list">
                    ${store.services.map(service => `
                        <span class="service-tag">${service}</span>
                    `).join('')}
                </div>
            </div>
            
            <div class="store-detail-section">
                <h3><i class="fas fa-map-pin"></i> Location</h3>
                <div class="location-map-small" id="small-map-${store.id}">
                    <!-- Small map will be loaded here -->
                </div>
            </div>
        </div>
        
        <div class="store-detail-actions">
            <button class="action-btn get-directions" data-id="${store.id}">
                <i class="fas fa-directions"></i> Get Directions
            </button>
            <button class="action-btn call-store" onclick="window.location.href='tel:${store.phone}'" ${!store.phone ? 'disabled' : ''}>
                <i class="fas fa-phone"></i> Call Store
            </button>
        </div>
    `;
    
    // Show modal
    const modal = document.getElementById('store-modal');
    modal.style.display = 'block';
    
    // Initialize small map
    setTimeout(() => {
        initSmallMap(`small-map-${store.id}`, store);
    }, 100);
    
    // Add event listener for directions button
    const directionsBtn = modalBody.querySelector('.get-directions');
    if (directionsBtn) {
        directionsBtn.addEventListener('click', function() {
            openDirections(store);
        });
    }
}

// Initialize small map in modal
function initSmallMap(containerId, store) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const mapOptions = {
        zoom: 15,
        center: { lat: store.lat, lng: store.lng },
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        }
    };
    
    const smallMap = new google.maps.Map(container, mapOptions);
    
    // Add marker
    new google.maps.Marker({
        position: { lat: store.lat, lng: store.lng },
        map: smallMap,
        title: store.name
    });
}

// Open directions to store
function openDirections(store) {
    if (!store || !store.lat || !store.lng) {
        window.PHARMADICES.utils.showNotification('Location data not available for this store.', 'error');
        return;
    }
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
    window.open(url, '_blank');
}

// Close store modal
function closeStoreModal() {
    const modal = document.getElementById('store-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Get store type icon
function getStoreTypeIcon(type) {
    const iconMap = {
        'pharmacy': 'fa-prescription-bottle-alt',
        'hospital': 'fa-hospital',
        'store': 'fa-store'
    };
    
    return iconMap[type] || 'fa-store';
}

// Get store type label
function getStoreTypeLabel(type) {
    const labelMap = {
        'pharmacy': 'Pharmacy',
        'hospital': 'Hospital Pharmacy',
        'store': 'Medical Store'
    };
    
    return labelMap[type] || 'Medical Store';
}

// Format city name for display
function formatCityName(city) {
    const cityNames = {
        'lakki-marwat': 'Lakki Marwat',
        'islamabad': 'Islamabad',
        'rawalpindi': 'Rawalpindi',
        'lahore': 'Lahore',
        'karachi': 'Karachi',
        'peshawar': 'Peshawar',
        'quetta': 'Quetta',
        'multan': 'Multan',
        'faisalabad': 'Faisalabad'
    };
    
    return cityNames[city] || city;
}

// Update stores count display
function updateStoresCount(count) {
    const countElement = document.getElementById('stores-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Show/hide map loading
function hideMapLoading() {
    const mapLoading = document.getElementById('map-loading');
    if (mapLoading) {
        mapLoading.style.display = 'none';
    }
    
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.style.display = 'block';
    }
}

// Show/hide stores loading
function showStoresLoading(show) {
    const storesLoading = document.getElementById('stores-loading');
    const storesGrid = document.getElementById('stores-grid');
    
    if (storesLoading) {
        storesLoading.style.display = show ? 'flex' : 'none';
    }
    
    if (storesGrid && !show) {
        storesGrid.style.display = 'grid';
    }
}

// Show/hide no stores message
function showNoStores(show, customMessage) {
    const noStores = document.getElementById('no-stores');
    const storesGrid = document.getElementById('stores-grid');
    
    if (noStores) {
        if (show) {
            noStores.style.display = 'flex';
            if (customMessage && noStores.querySelector('p')) {
                noStores.querySelector('p').textContent = customMessage;
            }
            if (storesGrid) {
                storesGrid.style.display = 'none';
            }
        } else {
            noStores.style.display = 'none';
            if (storesGrid) {
                storesGrid.style.display = 'grid';
            }
        }
    }
}

// Add CSS styles for stores page
function addStoresPageStyles() {
    if (!document.querySelector('#stores-styles')) {
        const styles = document.createElement('style');
        styles.id = 'stores-styles';
        styles.textContent = `
            /* Stores Header */
            .stores-header {
                background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
                color: white;
                padding: 60px 0 40px;
            }
            
            .stores-title {
                font-size: 2.5rem;
                margin-bottom: 10px;
                text-align: center;
            }
            
            .stores-subtitle {
                text-align: center;
                font-size: 1.1rem;
                opacity: 0.9;
                margin-bottom: 30px;
                max-width: 800px;
                margin-left: auto;
                margin-right: auto;
            }
            
            /* City Filter */
            .city-filter {
                max-width: 800px;
                margin: 0 auto;
            }
            
            .filter-container {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .filter-input {
                flex: 1;
                min-width: 250px;
                display: flex;
                align-items: center;
                background: white;
                border-radius: 8px;
                padding: 0 15px;
            }
            
            .filter-input i {
                color: var(--text-light);
                margin-right: 10px;
            }
            
            .filter-input select {
                flex: 1;
                padding: 15px 10px;
                border: none;
                outline: none;
                background: transparent;
                font-size: 1rem;
                color: var(--text-dark);
                cursor: pointer;
            }
            
            .find-btn, .location-btn {
                padding: 15px 25px;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 1rem;
            }
            
            .find-btn {
                background: var(--secondary-color);
                color: white;
            }
            
            .find-btn:hover {
                background: #2e7d32;
            }
            
            .location-btn {
                background: white;
                color: var(--primary-color);
                border: 2px solid var(--primary-color);
            }
            
            .location-btn:hover {
                background: #f0f7ff;
            }
            
            .filter-hint {
                text-align: center;
                margin-top: 15px;
                font-size: 0.9rem;
                opacity: 0.8;
            }
            
            .filter-hint i {
                margin-right: 5px;
            }
            
            /* Map Section */
            .map-section {
                padding: 40px 0;
                background: var(--bg-light);
            }
            
            .map-container {
                position: relative;
                height: 500px;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: var(--shadow);
                margin-bottom: 20px;
            }
            
            .map {
                width: 100%;
                height: 100%;
                display: none;
            }
            
            .map-loading {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.9);
                z-index: 10;
            }
            
            .map-loading .loading-spinner {
                font-size: 3rem;
                color: var(--primary-color);
                margin-bottom: 20px;
            }
            
            .map-controls {
                position: absolute;
                bottom: 20px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 100;
            }
            
            .map-control-btn {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: white;
                border: 1px solid var(--border-color);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: var(--transition);
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .map-control-btn:hover {
                background: #f8f9fa;
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }
            
            .map-legend {
                display: flex;
                justify-content: center;
                gap: 30px;
                flex-wrap: wrap;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--text-light);
                font-size: 0.9rem;
            }
            
            .legend-icon {
                width: 20px;
                height: 20px;
                border-radius: 50%;
            }
            
            .legend-icon.pharmacy {
                background: #34a853;
            }
            
            .legend-icon.store {
                background: #4285f4;
            }
            
            .legend-icon.hospital {
                background: #ea4335;
            }
            
            /* Stores List */
            .stores-list-section {
                padding: 60px 0;
                background: white;
            }
            
            .stores-list-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .stores-count {
                background: #f1f3f4;
                padding: 8px 20px;
                border-radius: 20px;
                font-weight: 500;
                color: var(--text-dark);
            }
            
            .stores-count span {
                color: var(--primary-color);
                font-weight: 600;
            }
            
            .stores-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 25px;
                margin-bottom: 40px;
            }
            
            .store-card {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: var(--shadow);
                transition: var(--transition);
                cursor: pointer;
                border-top: 4px solid var(--primary-color);
            }
            
            .store-card:hover {
                transform: translateY(-5px);
                box-shadow: var(--shadow-hover);
            }
            
            .store-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: #f8f9fa;
                border-bottom: 1px solid var(--border-color);
            }
            
            .store-type {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 500;
            }
            
            .store-type.pharmacy {
                background: #e8f5e9;
                color: #2e7d32;
            }
            
            .store-type.hospital {
                background: #ffebee;
                color: #c62828;
            }
            
            .store-type.store {
                background: #e3f2fd;
                color: #1565c0;
            }
            
            .emergency-badge {
                background: #ff5252;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 500;
            }
            
            .emergency-badge.large {
                padding: 8px 16px;
                font-size: 0.9rem;
            }
            
            .store-card-body {
                padding: 20px;
            }
            
            .store-name {
                font-size: 1.3rem;
                margin-bottom: 15px;
                color: var(--text-dark);
            }
            
            .store-address,
            .store-city,
            .store-timing,
            .store-phone {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 10px;
                color: var(--text-light);
                font-size: 0.95rem;
            }
            
            .store-card-footer {
                padding: 15px 20px;
                border-top: 1px solid var(--border-color);
                background: #f8f9fa;
                display: flex;
                gap: 10px;
            }
            
            .view-store-btn,
            .directions-btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 0.95rem;
            }
            
            .view-store-btn {
                background: var(--primary-color);
                color: white;
            }
            
            .view-store-btn:hover {
                background: var(--primary-dark);
            }
            
            .directions-btn {
                background: white;
                color: var(--text-dark);
                border: 1px solid var(--border-color);
            }
            
            .directions-btn:hover {
                background: #f8f9fa;
            }
            
            /* Emergency Section */
            .emergency-section {
                margin-top: 40px;
            }
            
            .emergency-card {
                display: flex;
                align-items: center;
                gap: 25px;
                background: #fff8e1;
                padding: 25px;
                border-radius: 10px;
                border-left: 5px solid #ff9800;
            }
            
            .emergency-icon {
                font-size: 3rem;
                color: #ff9800;
                flex-shrink: 0;
            }
            
            .emergency-content h3 {
                margin-bottom: 10px;
                color: var(--text-dark);
            }
            
            .emergency-content p {
                color: #5d4037;
                line-height: 1.6;
            }
            
            /* City Information */
            .city-info {
                padding: 60px 0;
                background: var(--bg-light);
            }
            
            .cities-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 25px;
                margin-top: 40px;
            }
            
            .city-card {
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: var(--shadow);
                transition: var(--transition);
            }
            
            .city-card:hover {
                transform: translateY(-5px);
                box-shadow: var(--shadow-hover);
            }
            
            .city-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
                color: white;
            }
            
            .city-header h3 {
                margin: 0;
                font-size: 1.2rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .store-count {
                background: rgba(255, 255, 255, 0.2);
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.85rem;
            }
            
            .city-body {
                padding: 20px;
            }
            
            .city-body p {
                color: var(--text-light);
                line-height: 1.6;
                margin: 0;
            }
            
            /* Important Notice */
            .important-notice {
                padding: 40px 0;
                background: white;
            }
            
            .notice-content {
                display: flex;
                align-items: center;
                gap: 25px;
                background: #f8f9fa;
                padding: 30px;
                border-radius: 10px;
                max-width: 1000px;
                margin: 0 auto;
            }
            
            .notice-icon {
                font-size: 3rem;
                color: var(--primary-color);
                flex-shrink: 0;
            }
            
            .notice-text h3 {
                margin-bottom: 10px;
                color: var(--text-dark);
            }
            
            .notice-text p {
                color: var(--text-light);
                line-height: 1.6;
                margin: 0;
            }
            
            /* Store Modal */
            .store-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                z-index: 1000;
                overflow-y: auto;
                padding: 20px;
            }
            
            .store-modal-content {
                background: white;
                border-radius: 12px;
                max-width: 700px;
                margin: 40px auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: modalFadeIn 0.3s ease;
            }
            
            .store-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 25px 30px;
                border-bottom: 1px solid var(--border-color);
            }
            
            .store-modal-header h2 {
                margin: 0;
                color: var(--text-dark);
                font-size: 1.8rem;
            }
            
            .store-modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: var(--text-light);
                cursor: pointer;
                transition: var(--transition);
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            
            .store-modal-close:hover {
                background: #f1f3f4;
                color: var(--text-dark);
            }
            
            .store-modal-body {
                padding: 30px;
                max-height: 70vh;
                overflow-y: auto;
            }
            
            /* Store Detail Styles */
            .store-detail-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid var(--border-color);
            }
            
            .store-detail-type {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 20px;
                border-radius: 20px;
                font-weight: 500;
            }
            
            .store-detail-info {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }
            
            .detail-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 25px;
            }
            
            .detail-col h4 {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
                color: var(--text-dark);
                font-size: 1.1rem;
            }
            
            .detail-col p {
                color: var(--text-light);
                line-height: 1.6;
                padding-left: 28px;
            }
            
            .store-detail-section {
                margin-top: 25px;
            }
            
            .store-detail-section h3 {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
                color: var(--text-dark);
                font-size: 1.2rem;
            }
            
            .store-detail-section p {
                color: var(--text-light);
                line-height: 1.7;
            }
            
            .services-list {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 15px;
            }
            
            .service-tag {
                background: #e3f2fd;
                color: #1565c0;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .location-map-small {
                height: 200px;
                border-radius: 8px;
                overflow: hidden;
                margin-top: 15px;
                border: 1px solid var(--border-color);
            }
            
            .store-detail-actions {
                display: flex;
                gap: 15px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid var(--border-color);
            }
            
            .action-btn {
                flex: 1;
                padding: 15px;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .action-btn.get-directions {
                background: var(--primary-color);
                color: white;
            }
            
            .action-btn.get-directions:hover {
                background: var(--primary-dark);
            }
            
            .action-btn.call-store {
                background: #f1f3f4;
                color: var(--text-dark);
                border: 1px solid var(--border-color);
            }
            
            .action-btn.call-store:hover:not(:disabled) {
                background: #e8eaed;
            }
            
            .action-btn.call-store:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .stores-title {
                    font-size: 2rem;
                }
                
                .filter-container {
                    flex-direction: column;
                }
                
                .filter-input {
                    min-width: 100%;
                }
                
                .map-container {
                    height: 400px;
                }
                
                .stores-grid {
                    grid-template-columns: 1fr;
                }
                
                .emergency-card {
                    flex-direction: column;
                    text-align: center;
                }
                
                .notice-content {
                    flex-direction: column;
                    text-align: center;
                }
                
                .store-detail-actions {
                    flex-direction: column;
                }
            }
            
            @media (max-width: 576px) {
                .stores-header {
                    padding: 40px 0 30px;
                }
                
                .stores-title {
                    font-size: 1.8rem;
                }
                
                .map-container {
                    height: 300px;
                }
                
                .city-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }
                
                .store-modal-content {
                    margin: 20px auto;
                }
                
                .store-modal-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 15px;
                }
                
                .detail-row {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}