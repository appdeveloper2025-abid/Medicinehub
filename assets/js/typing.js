// PHARMADICES - Typing Animation Script
// Handles the typing effect on the homepage

document.addEventListener('DOMContentLoaded', function() {
    const typedTextElement = document.getElementById('typed-text');
    
    if (typedTextElement) {
        initTypingAnimation(typedTextElement);
    }
});

function initTypingAnimation(element) {
    const textArray = [
        "Medicines Instantly",
        "Complete Medicine Information",
        "Your Daily Medicine Guide",
        "Drug Interactions",
        "Side Effects & Precautions",
        "Dosage Guidelines"
    ];
    
    let textArrayIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const currentText = textArray[textArrayIndex];
        
        if (isDeleting) {
            element.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            element.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let typeSpeed = isDeleting ? 50 : 100;
        
        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textArrayIndex = (textArrayIndex + 1) % textArray.length;
            typeSpeed = 500;
        }
        
        setTimeout(type, typeSpeed);
    }
    
    type();
}





document.addEventListener('DOMContentLoaded', function() {
    const typedTextElement = document.getElementById('typed-text');
    
    if (typedTextElement) {
        initTypingAnimation(typedTextElement);
    }
});

// Optional: Add typing sound effect (disabled by default)
function addTypingSound() {
    // Create audio context for typing sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Function to play a typing sound
    function playTypingSound() {
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800 + Math.random() * 400;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('Audio not supported or user interaction required');
        }
    }
    
    // Return function to play sound
    return playTypingSound;
}

window.PHARMADICES = window.PHARMADICES || {};
window.PHARMADICES.typing = {
    initTypingAnimation
};