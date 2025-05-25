// Global variables
let cart = JSON.parse(localStorage.getItem('luminouscraft_cart')) || [];

// Sample products data
const products = [
    {
        id: 1,
        name: "Vintage Table Lamp",
        price: 450,
        image: "/placeholder.svg?height=250&width=250",
        category: "table",
        style: "vintage",
        rating: 5,
        reviews: 24,
        description: "Beautiful handcrafted vintage table lamp with brass base"
    },
    {
        id: 2,
        name: "Modern Floor Lamp",
        price: 680,
        image: "/placeholder.svg?height=250&width=250",
        category: "floor",
        style: "modern",
        rating: 4,
        reviews: 18,
        description: "Sleek modern floor lamp perfect for contemporary spaces"
    },
    {
        id: 3,
        name: "Rustic Pendant Light",
        price: 320,
        image: "/placeholder.svg?height=250&width=250",
        category: "pendant",
        style: "rustic",
        rating: 5,
        reviews: 31,
        description: "Charming rustic pendant light with natural materials"
    },
    {
        id: 4,
        name: "Crystal Chandelier",
        price: 1250,
        image: "/placeholder.svg?height=250&width=250",
        category: "chandelier",
        style: "modern",
        rating: 5,
        reviews: 42,
        description: "Elegant crystal chandelier for luxury spaces"
    },
    {
        id: 5,
        name: "Industrial Wall Sconce",
        price: 280,
        image: "/placeholder.svg?height=250&width=250",
        category: "wall",
        style: "industrial",
        rating: 4,
        reviews: 15,
        description: "Industrial-style wall sconce with metal finish"
    },
    {
        id: 6,
        name: "Art Deco Table Lamp",
        price: 520,
        image: "/placeholder.svg?height=250&width=250",
        category: "table",
        style: "vintage",
        rating: 5,
        reviews: 28,
        description: "Stunning Art Deco inspired table lamp"
    }
];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing application...');
    initializeCart();
    setupAllEventListeners();
    updateCartDisplay();
    updateCartCount();
    setupProductFilters();
});

function initializeCart() {
    console.log('Initializing cart with items:', cart);
    
    // Ensure cart sidebar exists
    if (!document.getElementById('cartSidebar')) {
        console.log('Cart sidebar not found - might be on checkout page');
        return;
    }
    
    console.log('Cart initialized successfully');
}

function setupAllEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    // Cart icon click
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Cart icon clicked');
            toggleCart();
        });
        console.log('✅ Cart icon listener added');
    }

    // Close cart button
    const closeCart = document.querySelector('.close-cart');
    if (closeCart) {
        closeCart.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Close cart clicked');
            closeCartSidebar();
        });
    }

    // Cart overlay
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        cartOverlay.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Cart overlay clicked');
            closeCartSidebar();
        });
    }

    // Enhanced checkout button handling
    setupCheckoutButtons();

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Newsletter forms
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            if (email) {
                showMessage('Thank you for subscribing to our newsletter!', 'success');
                this.reset();
            }
        });
    });

    // Contact form
    setupContactForm();

    // Global click handler for add to cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
            e.preventDefault();
            const button = e.target.classList.contains('add-to-cart-btn') ? e.target : e.target.closest('.add-to-cart-btn');
            console.log('Add to cart button clicked:', button);
            
            const productData = button.getAttribute('data-product');
            if (productData) {
                try {
                    const product = JSON.parse(productData);
                    console.log('Adding product to cart:', product);
                    addToCart(product);
                } catch (error) {
                    console.error('Error parsing product data:', error);
                }
            } else {
                console.error('No product data found on button');
            }
        }
    });

    console.log('✅ All event listeners set up');
}

function setupCheckoutButtons() {
    console.log('🔧 Setting up checkout button handlers...');
    
    // Method 1: Direct event listeners on existing checkout buttons
    const existingCheckoutBtns = document.querySelectorAll('.checkout-btn');
    console.log('🔍 Found', existingCheckoutBtns.length, 'existing checkout buttons');
    
    existingCheckoutBtns.forEach((btn, index) => {
        console.log(`🎯 Adding direct listener to checkout button ${index + 1}:`, btn);
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚀 DIRECT checkout button clicked!');
            goToCheckout();
        });
    });

    // Method 2: Event delegation for dynamically added buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('checkout-btn') || e.target.closest('.checkout-btn')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚀 EVENT DELEGATION checkout button clicked!');
            goToCheckout();
        }
    });

    // Method 3: MutationObserver to watch for dynamically added checkout buttons
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    const checkoutBtns = node.querySelectorAll ? node.querySelectorAll('.checkout-btn') : [];
                    checkoutBtns.forEach(btn => {
                        if (!btn.hasAttribute('data-listener-added')) {
                            console.log('🔧 Adding listener to dynamically added checkout button');
                            btn.addEventListener('click', function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🚀 DYNAMIC checkout button clicked!');
                                goToCheckout();
                            });
                            btn.setAttribute('data-listener-added', 'true');
                        }
                    });
                }
            });
        });
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function setupProductFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    if (filterBtns.length === 0) return; // Not on products page
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active filter button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter products
            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function addToCart(product) {
    console.log('Adding to cart:', product);
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
        console.log('Updated existing item quantity:', existingItem.quantity);
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
        console.log('Added new item to cart');
    }
    
    // Save to localStorage
    localStorage.setItem('luminouscraft_cart', JSON.stringify(cart));
    console.log('Cart saved to localStorage:', cart);
    
    // Update UI
    updateCartCount();
    updateCartDisplay();
    showMessage(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    console.log('Removing from cart:', productId);
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('luminouscraft_cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    showMessage('Item removed from cart', 'info');
}

function updateCartQuantity(productId, newQuantity) {
    console.log('Updating quantity for product:', productId, 'to:', newQuantity);
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            localStorage.setItem('luminouscraft_cart', JSON.stringify(cart));
            updateCartCount();
            updateCartDisplay();
        }
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        console.log('Cart count updated:', totalItems);
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    console.log('Updating cart display...');
    
    if (!cartItems || !cartTotal) {
        console.log('Cart display elements not found - might be on checkout page');
        return;
    }
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p></div>';
        cartTotal.textContent = '0.00';
        console.log('Cart is empty, showing empty message');
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">₵${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = total.toFixed(2);
    console.log('Cart display updated. Total:', total);
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    console.log('Toggling cart...');
    
    if (cartSidebar && cartOverlay) {
        const isOpen = cartSidebar.classList.contains('open');
        
        if (isOpen) {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
            console.log('Cart closed');
        } else {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateCartDisplay(); // Refresh cart display when opening
            console.log('Cart opened');
        }
    } else {
        console.error('Cart elements not found for toggle');
    }
}

function closeCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    console.log('Closing cart sidebar...');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
        console.log('Cart sidebar closed');
    }
}

function goToCheckout() {
    console.log('🚀🚀🚀 GO TO CHECKOUT FUNCTION CALLED! 🚀🚀🚀');
    
    if (cart.length === 0) {
        console.log('❌ Cart is empty, showing error message');
        showMessage('Your cart is empty!', 'error');
        return;
    }
    
    console.log('✅ Cart has items, proceeding to checkout...');
    console.log('📦 Cart contents:', cart);
    
    // Close the cart sidebar first
    closeCartSidebar();
    
    // Determine the correct path based on current page
    const currentPath = window.location.pathname;
    const currentHref = window.location.href;
    
    console.log('🌐 Current path:', currentPath);
    console.log('🌐 Current href:', currentHref);
    
    let checkoutPath = '';
    
    // More robust path detection
    if (currentPath.includes('/pages/') || currentPath.endsWith('.html')) {
        // We're already in a pages subdirectory or viewing an HTML file
        checkoutPath = 'checkout.html';
        console.log('📁 Detected we are in pages directory, using relative path');
    } else if (currentPath === '/' || currentPath === '' || currentPath.includes('index')) {
        // We're in the root directory
        checkoutPath = 'pages/checkout.html';
        console.log('📁 Detected we are in root directory, using pages/ path');
    } else {
        // Fallback - try both paths
        checkoutPath = 'pages/checkout.html';
        console.log('📁 Using fallback path');
    }
    
    console.log('🎯 Final checkout path:', checkoutPath);
    
    // Try multiple redirect methods
    console.log('🔄 Attempting redirect...');
    
    try {
        // Method 1: Direct assignment with delay
        setTimeout(() => {
            console.log('🔄 Redirecting to:', checkoutPath);
            window.location.href = checkoutPath;
        }, 100);
        
    } catch (error) {
        console.error('❌ Error during redirect:', error);
        showMessage('Error redirecting to checkout. Please try again.', 'error');
    }
}

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return; // Not on contact page
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            newsletter: formData.get('newsletter') === 'on',
            date: new Date().toISOString()
        };
        
        // Save contact message (in a real app, this would be sent to a server)
        const messages = JSON.parse(localStorage.getItem('luminouscraft_messages')) || [];
        messages.push(contactData);
        localStorage.setItem('luminouscraft_messages', JSON.stringify(messages));
        
        showMessage('Thank you for your message! We will get back to you soon.', 'success');
        this.reset();
    });
}

function showMessage(message, type) {
    console.log('Showing message:', message, type);
    
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Position the message at the top of the page
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.maxWidth = '300px';
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.color = 'white';
    messageDiv.style.fontWeight = 'bold';
    
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#f44336';
    } else {
        messageDiv.style.backgroundColor = '#2196F3';
    }
    
    document.body.appendChild(messageDiv);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Make functions globally available for onclick handlers
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.goToCheckout = goToCheckout;

// Enhanced debug function
window.debugCart = function() {
    console.log('=== 🔍 ENHANCED CART DEBUG INFO ===');
    console.log('Cart contents:', cart);
    console.log('Cart length:', cart.length);
    console.log('Current page:', window.location.pathname);
    console.log('Current href:', window.location.href);
    console.log('Cart icon:', document.querySelector('.cart-icon'));
    console.log('Cart sidebar:', document.getElementById('cartSidebar'));
    console.log('Cart overlay:', document.getElementById('cartOverlay'));
    console.log('Cart items container:', document.getElementById('cartItems'));
    console.log('Cart total element:', document.getElementById('cartTotal'));
    console.log('Checkout buttons found:', document.querySelectorAll('.checkout-btn'));
    console.log('======================');
};

// Test function to manually trigger checkout
window.testCheckout = function() {
    console.log('🧪 MANUAL CHECKOUT TEST');
    goToCheckout();
};

console.log('✅ Enhanced cart script loaded successfully');