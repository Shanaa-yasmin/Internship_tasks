// ============================================
// PORTFOLIO JAVASCRIPT
// Mobile-first interactive features
// ============================================

// ============================================
// MOBILE NAVIGATION TOGGLE
// ============================================
const initMobileNav = () => {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!mobileToggle) return;
    
    // Toggle mobile menu
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('mobile-active');
    });
    
    // Close mobile menu when clicking a link
    const navLinkElements = document.querySelectorAll('.nav-link');
    navLinkElements.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('mobile-active');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('mobile-active');
        }
    });
};

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
const initNavbarScroll = () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add shadow when scrolled
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
};

// ============================================
// ACTIVE NAV LINK HIGHLIGHTING
// Using Intersection Observer for better performance
// ============================================
const initActiveNavLinks = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length === 0) return;
    
    // Create intersection observer
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };
    
    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to corresponding nav link
                const activeLink = document.querySelector(`.nav-link[href*="${entry.target.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
};

// ============================================
// SMOOTH SCROLLING FOR ANCHOR LINKS
// ============================================
const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignore empty anchors
            if (href === '#' || !href) return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
};

// ============================================
// FORM VALIDATION
// ============================================
const initFormValidation = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Validation functions
    const validateName = () => {
        const nameError = document.getElementById('name-error');
        const value = nameInput.value.trim();
        
        if (!value) {
            nameInput.classList.add('error');
            nameError.textContent = 'Name is required';
            return false;
        }
        
        if (value.length < 2) {
            nameInput.classList.add('error');
            nameError.textContent = 'Name must be at least 2 characters';
            return false;
        }
        
        nameInput.classList.remove('error');
        nameError.textContent = '';
        return true;
    };
    
    const validateEmail = () => {
        const emailError = document.getElementById('email-error');
        const value = emailInput.value.trim();
        
        if (!value) {
            emailInput.classList.add('error');
            emailError.textContent = 'Email is required';
            return false;
        }
        
        if (!emailRegex.test(value)) {
            emailInput.classList.add('error');
            emailError.textContent = 'Please enter a valid email address';
            return false;
        }
        
        emailInput.classList.remove('error');
        emailError.textContent = '';
        return true;
    };
    
    const validateMessage = () => {
        const messageError = document.getElementById('message-error');
        const value = messageInput.value.trim();
        
        if (!value) {
            messageInput.classList.add('error');
            messageError.textContent = 'Message is required';
            return false;
        }
        
        if (value.length < 10) {
            messageInput.classList.add('error');
            messageError.textContent = 'Message must be at least 10 characters';
            return false;
        }
        
        messageInput.classList.remove('error');
        messageError.textContent = '';
        return true;
    };
    
    // Real-time validation on blur
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    messageInput.addEventListener('blur', validateMessage);
    
    // Clear error on input
    nameInput.addEventListener('input', () => {
        if (nameInput.classList.contains('error')) {
            validateName();
        }
    });
    
    emailInput.addEventListener('input', () => {
        if (emailInput.classList.contains('error')) {
            validateEmail();
        }
    });
    
    messageInput.addEventListener('input', () => {
        if (messageInput.classList.contains('error')) {
            validateMessage();
        }
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate all fields
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isMessageValid = validateMessage();
        
        // If all valid, show success message
        if (isNameValid && isEmailValid && isMessageValid) {
            // Get form data (for demonstration)
            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                message: messageInput.value.trim()
            };
            
            // Log to console (in real app, this would be sent to server)
            console.log('Form submitted:', formData);
            
            // Show success message
            showSuccessMessage();
            
            // Reset form
            form.reset();
        } else {
            // Focus on first invalid field
            if (!isNameValid) nameInput.focus();
            else if (!isEmailValid) emailInput.focus();
            else if (!isMessageValid) messageInput.focus();
        }
    });
    
    // Success message handling
    const showSuccessMessage = () => {
        const successMessage = document.getElementById('successMessage');
        const formWrapper = form;
        
        if (successMessage) {
            formWrapper.style.display = 'none';
            successMessage.classList.add('active');
            
            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
    
    // "Send Another Message" button
    const sendAnotherBtn = document.getElementById('sendAnother');
    if (sendAnotherBtn) {
        sendAnotherBtn.addEventListener('click', () => {
            const successMessage = document.getElementById('successMessage');
            const formWrapper = form;
            
            successMessage.classList.remove('active');
            formWrapper.style.display = 'block';
            
            // Clear any existing errors
            document.querySelectorAll('.form-input').forEach(input => {
                input.classList.remove('error');
            });
            document.querySelectorAll('.form-error').forEach(error => {
                error.textContent = '';
            });
            
            // Focus on name input
            nameInput.focus();
        });
    }
};

// ============================================
// ANIMATE ON SCROLL (AOS)
// Simple implementation using Intersection Observer
// ============================================
const initAOS = () => {
    const elements = document.querySelectorAll('[data-aos]');
    if (elements.length === 0) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Get delay from data attribute
                const delay = entry.target.dataset.aosDelay || 0;
                
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, delay);
                
                // Optionally unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    elements.forEach(element => {
        observer.observe(element);
    });
};

// ============================================
// ACCESSIBILITY: KEYBOARD NAVIGATION
// ============================================
const initA11yFeatures = () => {
    // Skip to main content link
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.querySelector('main') || document.querySelector('.hero');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
            }
        });
    }
    
    // Trap focus in mobile menu when open
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    
    if (navbar && navLinks) {
        document.addEventListener('keydown', (e) => {
            // If mobile menu is open and Escape is pressed, close it
            if (e.key === 'Escape' && navLinks.classList.contains('mobile-active')) {
                const mobileToggle = document.querySelector('.mobile-toggle');
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('mobile-active');
                mobileToggle.focus();
            }
        });
    }
};


// ============================================
// CURRENT PAGE HIGHLIGHT
// For multi-page navigation
// ============================================
const initCurrentPageHighlight = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        
        // Check if link matches current page
        if (linkPage === currentPage || 
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage === 'index.html' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
};

// ============================================
// INITIALIZE ALL FEATURES
// ============================================
const init = () => {
    // Initialize all features when DOM is ready
    initMobileNav();
    initNavbarScroll();
    initActiveNavLinks();
    initSmoothScroll();
    initFormValidation();
    initAOS();
    initA11yFeatures();
    
    console.log('✨ Portfolio initialized successfully!');
};

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
