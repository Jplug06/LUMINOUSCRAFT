// Checkout page functionality
let cart = JSON.parse(localStorage.getItem('luminouscraft_cart')) || [];
let deliveryFee = 25.00;
let discountAmount = 0;
let appliedPromoCode = null;

// Promo codes
const promoCodes = {
    'WELCOME10': { discount: 10, type: 'percentage', description: '10% off your first order' },
    'SAVE50': { discount: 50, type: 'fixed', description: '₵50 off your order' },
    'FREESHIP': { discount: 0, type: 'free_shipping', description: 'Free shipping' },
    'LIGHTING20': { discount: 20, type: 'percentage', description: '20% off lighting fixtures' }
};

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Checkout page loaded');
    
    // Check if cart is empty
    if (cart.length === 0) {
        console.log('❌ Cart is empty, redirecting to products page');
        showMessage('Your cart is empty. Redirecting to products page...', 'info');
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 2000);
        return;
    }
    
    displayDetailedOrderSummary();
    setupCheckoutForm();
    updateDeliveryFee();
    updateItemsCount();
    
    console.log('✅ Checkout page initialized successfully');
});

function displayDetailedOrderSummary() {
    const orderItemsDetailed = document.getElementById('orderItemsDetailed');
    const orderSubtotal = document.getElementById('orderSubtotal');
    const orderTotal = document.getElementById('orderTotal');
    
    if (!orderItemsDetailed || !orderSubtotal || !orderTotal) {
        console.error('Order summary elements not found');
        return;
    }
    
    let subtotal = 0;
    orderItemsDetailed.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const orderItemDetailed = document.createElement('div');
        orderItemDetailed.className = 'order-item-detailed';
        orderItemDetailed.innerHTML = `
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h4 class="item-name">${item.name}</h4>
                <div class="item-meta">
                    <span class="item-price">₵${item.price.toFixed(2)} each</span>
                    <span class="item-quantity">Qty: ${item.quantity}</span>
                </div>
                <div class="item-total">₵${itemTotal.toFixed(2)}</div>
            </div>
            <div class="item-actions">
                <button class="quantity-btn" onclick="updateCheckoutQuantity(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateCheckoutQuantity(${item.id}, ${item.quantity + 1})">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="remove-btn" onclick="removeFromCheckout(${item.id})" title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        orderItemsDetailed.appendChild(orderItemDetailed);
    });
    
    // Calculate totals
    calculateOrderTotals(subtotal);
    
    console.log('Detailed order summary displayed. Subtotal:', subtotal);
}

function calculateOrderTotals(subtotal) {
    const orderSubtotal = document.getElementById('orderSubtotal');
    const orderTotal = document.getElementById('orderTotal');
    const deliveryFeeElement = document.getElementById('deliveryFee');
    const discountRow = document.getElementById('discountRow');
    const discountAmountElement = document.getElementById('discountAmount');
    
    // Apply discount
    let finalSubtotal = subtotal;
    discountAmount = 0;
    
    if (appliedPromoCode) {
        const promo = promoCodes[appliedPromoCode];
        if (promo.type === 'percentage') {
            discountAmount = (subtotal * promo.discount) / 100;
        } else if (promo.type === 'fixed') {
            discountAmount = Math.min(promo.discount, subtotal);
        }
        finalSubtotal = subtotal - discountAmount;
    }
    
    // Apply free shipping if applicable
    let finalDeliveryFee = deliveryFee;
    if (appliedPromoCode && promoCodes[appliedPromoCode].type === 'free_shipping') {
        finalDeliveryFee = 0;
    } else if (subtotal >= 1000) {
        finalDeliveryFee = 0; // Free delivery on orders over ₵1,000
    }
    
    const total = finalSubtotal + finalDeliveryFee;
    
    // Update display
    orderSubtotal.textContent = `₵${subtotal.toFixed(2)}`;
    deliveryFeeElement.textContent = finalDeliveryFee === 0 ? 'FREE' : `₵${finalDeliveryFee.toFixed(2)}`;
    orderTotal.textContent = `₵${total.toFixed(2)}`;
    
    // Show/hide discount row
    if (discountAmount > 0) {
        discountRow.style.display = 'flex';
        discountAmountElement.textContent = `-₵${discountAmount.toFixed(2)}`;
    } else {
        discountRow.style.display = 'none';
    }
    
    // Update delivery fee variable for form processing
    deliveryFee = finalDeliveryFee;
}

function updateItemsCount() {
    const itemsCount = document.getElementById('itemsCount');
    const totalItemsCount = document.getElementById('totalItemsCount');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const itemText = totalItems === 1 ? 'item' : 'items';
    
    if (itemsCount) {
        itemsCount.textContent = `${totalItems} ${itemText} in your cart`;
    }
    
    if (totalItemsCount) {
        totalItemsCount.textContent = totalItems;
    }
}

function updateCheckoutQuantity(productId, newQuantity) {
    console.log('Updating checkout quantity for product:', productId, 'to:', newQuantity);
    
    if (newQuantity <= 0) {
        removeFromCheckout(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('luminouscraft_cart', JSON.stringify(cart));
        displayDetailedOrderSummary();
        updateItemsCount();
        showMessage('Quantity updated', 'success');
    }
}

function removeFromCheckout(productId) {
    console.log('Removing from checkout:', productId);
    
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('luminouscraft_cart', JSON.stringify(cart));
    
    if (cart.length === 0) {
        showMessage('Cart is empty. Redirecting to products page...', 'info');
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 2000);
        return;
    }
    
    displayDetailedOrderSummary();
    updateItemsCount();
    showMessage('Item removed from cart', 'info');
}

function applyPromoCode() {
    const promoCodeInput = document.getElementById('promoCode');
    const promoMessage = document.getElementById('promoMessage');
    const applyBtn = document.getElementById('applyPromoBtn');
    
    const code = promoCodeInput.value.trim().toUpperCase();
    
    if (!code) {
        showPromoMessage('Please enter a promo code', 'error');
        return;
    }
    
    // Show loading state
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    applyBtn.disabled = true;
    
    setTimeout(() => {
        if (promoCodes[code]) {
            appliedPromoCode = code;
            const promo = promoCodes[code];
            showPromoMessage(`✓ ${promo.description} applied!`, 'success');
            promoCodeInput.value = '';
            applyBtn.innerHTML = 'Applied';
            applyBtn.disabled = true;
            applyBtn.style.background = '#27ae60';
            
            // Recalculate totals
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            calculateOrderTotals(subtotal);
            
        } else {
            showPromoMessage('Invalid promo code', 'error');
            applyBtn.innerHTML = 'Apply';
            applyBtn.disabled = false;
        }
    }, 1000);
}

function showPromoMessage(message, type) {
    const promoMessage = document.getElementById('promoMessage');
    promoMessage.textContent = message;
    promoMessage.className = `promo-message ${type}`;
    promoMessage.style.display = 'block';
    
    if (type === 'error') {
        setTimeout(() => {
            promoMessage.style.display = 'none';
        }, 3000);
    }
}

function updateDeliveryFee() {
    const regionSelect = document.getElementById('region');
    
    if (!regionSelect) return;
    
    regionSelect.addEventListener('change', function() {
        const selectedRegion = this.value;
        let newDeliveryFee = 25.00;
        
        // Adjust delivery fee based on region
        switch (selectedRegion) {
            case 'greater-accra':
                newDeliveryFee = 25.00;
                break;
            case 'ashanti':
            case 'western':
            case 'central':
            case 'eastern':
                newDeliveryFee = 35.00;
                break;
            case 'volta':
            case 'northern':
            case 'upper-east':
            case 'upper-west':
            case 'brong-ahafo':
                newDeliveryFee = 50.00;
                break;
            default:
                newDeliveryFee = 25.00;
        }
        
        deliveryFee = newDeliveryFee;
        
        // Recalculate totals
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        calculateOrderTotals(subtotal);
        
        console.log('Delivery fee updated for region:', selectedRegion, 'Fee:', newDeliveryFee);
    });
}

function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkoutForm');
    
    if (!checkoutForm) {
        console.error('Checkout form not found');
        return;
    }
    
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('🚀 Checkout form submitted');
        
        // Validate form
        if (!validateForm()) {
            console.log('❌ Form validation failed');
            return;
        }
        
        // Process order
        processOrder();
    });
}

function validateForm() {
    const requiredFields = [
        'firstName',
        'lastName',
        'email',
        'phone',
        'address',
        'city',
        'region'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!field || !field.value.trim()) {
            isValid = false;
            if (field) {
                field.style.borderColor = '#e74c3c';
                field.addEventListener('input', function() {
                    this.style.borderColor = '#dee2e6';
                }, { once: true });
            }
            console.log('❌ Required field missing:', fieldName);
        }
    });
    
    // Validate email format
    const email = document.getElementById('email');
    if (email && email.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            isValid = false;
            email.style.borderColor = '#e74c3c';
            showMessage('Please enter a valid email address', 'error');
        }
    }
    
    // Validate phone format
    const phone = document.getElementById('phone');
    if (phone && phone.value) {
        const phoneRegex = /^[\+]?[0-9\s\-$$$$]{10,}$/;
        if (!phoneRegex.test(phone.value)) {
            isValid = false;
            phone.style.borderColor = '#e74c3c';
            showMessage('Please enter a valid phone number', 'error');
        }
    }
    
    if (!isValid) {
        showMessage('Please fill in all required fields correctly', 'error');
    }
    
    return isValid;
}

function processOrder() {
    console.log('🔄 Processing order...');
    
    // Show loading state
    const submitBtn = document.querySelector('.place-order-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Collect form data
    const formData = new FormData(document.getElementById('checkoutForm'));
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalSubtotal = subtotal - discountAmount;
    const total = finalSubtotal + deliveryFee;
    
    const orderData = {
        orderId: generateOrderId(),
        customer: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone')
        },
        delivery: {
            address: formData.get('address'),
            city: formData.get('city'),
            region: formData.get('region'),
            preferredTime: formData.get('deliveryTime')
        },
        payment: {
            method: formData.get('paymentMethod')
        },
        items: [...cart],
        pricing: {
            subtotal: subtotal,
            discount: discountAmount,
            deliveryFee: deliveryFee,
            total: total
        },
        promoCode: appliedPromoCode,
        notes: formData.get('notes'),
        orderDate: new Date().toISOString(),
        status: 'pending'
    };
    
    // Simulate order processing delay
    setTimeout(() => {
        try {
            // Save order to localStorage (in a real app, this would be sent to a server)
            const orders = JSON.parse(localStorage.getItem('luminouscraft_orders')) || [];
            orders.push(orderData);
            localStorage.setItem('luminouscraft_orders', JSON.stringify(orders));
            
            // Clear cart
            cart = [];
            localStorage.removeItem('luminouscraft_cart');
            
            console.log('✅ Order processed successfully:', orderData);
            
            // Show confirmation modal
            showOrderConfirmation(orderData);
            
            // Reset form
            document.getElementById('checkoutForm').reset();
            
        } catch (error) {
            console.error('❌ Error processing order:', error);
            showMessage('Error processing your order. Please try again.', 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }, 2000);
}

function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `LC${timestamp}${random}`;
}

function showOrderConfirmation(orderData) {
    const modal = document.getElementById('confirmationModal');
    const overlay = document.getElementById('modalOverlay');
    const orderNumber = document.getElementById('orderNumber');
    const confirmationTotal = document.getElementById('confirmationTotal');
    const confirmationPayment = document.getElementById('confirmationPayment');
    const estimatedDelivery = document.getElementById('estimatedDelivery');
    const orderItemsSummary = document.getElementById('orderItemsSummary');
    
    if (!modal || !overlay) {
        console.error('Confirmation modal elements not found');
        return;
    }
    
    // Populate modal with order details
    if (orderNumber) orderNumber.textContent = orderData.orderId;
    if (confirmationTotal) confirmationTotal.textContent = `₵${orderData.pricing.total.toFixed(2)}`;
    if (confirmationPayment) {
        const paymentMethods = {
            'cash': 'Cash on Delivery',
            'momo': 'Mobile Money',
            'bank': 'Bank Transfer'
        };
        confirmationPayment.textContent = paymentMethods[orderData.payment.method] || orderData.payment.method;
    }
    
    // Calculate estimated delivery date
    if (estimatedDelivery) {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from now
        estimatedDelivery.textContent = deliveryDate.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Populate order items summary
    if (orderItemsSummary) {
        orderItemsSummary.innerHTML = `
            <h4>Order Items:</h4>
            <div class="confirmation-items">
                ${orderData.items.map(item => `
                    <div class="confirmation-item">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>₵${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Show modal
    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    console.log('✅ Order confirmation modal displayed');
    
    // Send confirmation email (simulate)
    sendConfirmationEmail(orderData);
}

function printOrderDetails() {
    window.print();
}

function sendConfirmationEmail(orderData) {
    // In a real application, this would send an actual email
    console.log('📧 Sending confirmation email to:', orderData.customer.email);
    console.log('Order details:', orderData);
    
    // Simulate email sending delay
    setTimeout(() => {
        console.log('✅ Confirmation email sent successfully');
    }, 1000);
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

// Close modal functionality
document.addEventListener('click', function(e) {
    const modal = document.getElementById('confirmationModal');
    const overlay = document.getElementById('modalOverlay');
    
    if (e.target === overlay) {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Make functions globally available
window.updateCheckoutQuantity = updateCheckoutQuantity;
window.removeFromCheckout = removeFromCheckout;
window.applyPromoCode = applyPromoCode;
window.printOrderDetails = printOrderDetails;

// Debug function for checkout
window.debugCheckout = function() {
    console.log('=== 🔍 CHECKOUT DEBUG INFO ===');
    console.log('Cart contents:', cart);
    console.log('Cart length:', cart.length);
    console.log('Applied promo code:', appliedPromoCode);
    console.log('Discount amount:', discountAmount);
    console.log('Delivery fee:', deliveryFee);
    console.log('======================');
};

console.log('✅ Enhanced checkout script loaded successfully');