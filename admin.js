// Admin Dashboard Functionality
let orders = [];
let customers = [];
let messages = [];
let currentOrderFilter = 'all';
let currentDateFilter = '';

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin dashboard loaded');
    loadData();
    updateDashboardStats();
    displayOrders();
    displayCustomers();
    displayMessages();
    displayAnalytics();
    
    console.log('✅ Admin dashboard initialized');
});

function loadData() {
    // Load orders from localStorage
    orders = JSON.parse(localStorage.getItem('luminouscraft_orders')) || [];
    
    // Load messages from localStorage
    messages = JSON.parse(localStorage.getItem('luminouscraft_messages')) || [];
    
    // Extract unique customers from orders
    customers = extractCustomersFromOrders();
    
    console.log('📊 Data loaded:', {
        orders: orders.length,
        customers: customers.length,
        messages: messages.length
    });
}

function extractCustomersFromOrders() {
    const customerMap = new Map();
    
    orders.forEach(order => {
        const customerId = order.customer.email;
        if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
                id: customerId,
                firstName: order.customer.firstName,
                lastName: order.customer.lastName,
                email: order.customer.email,
                phone: order.customer.phone,
                orders: [],
                totalSpent: 0,
                lastOrderDate: null
            });
        }
        
        const customer = customerMap.get(customerId);
        customer.orders.push(order);
        customer.totalSpent += order.pricing.total;
        
        const orderDate = new Date(order.orderDate);
        if (!customer.lastOrderDate || orderDate > customer.lastOrderDate) {
            customer.lastOrderDate = orderDate;
        }
    });
    
    return Array.from(customerMap.values());
}

function updateDashboardStats() {
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalCustomersEl = document.getElementById('totalCustomers');
    const pendingOrdersEl = document.getElementById('pendingOrders');
    const ordersBadgeEl = document.getElementById('ordersBadge');
    const messagesBadgeEl = document.getElementById('messagesBadge');
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const unreadMessages = messages.filter(msg => !msg.read).length;
    
    if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
    if (totalRevenueEl) totalRevenueEl.textContent = `₵${totalRevenue.toFixed(2)}`;
    if (totalCustomersEl) totalCustomersEl.textContent = customers.length;
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
    if (ordersBadgeEl) ordersBadgeEl.textContent = pendingOrders;
    if (messagesBadgeEl) messagesBadgeEl.textContent = unreadMessages;
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from all menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked menu item
    const activeMenuItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`).parentElement;
    activeMenuItem.classList.add('active');
    
    console.log('📄 Switched to section:', sectionName);
}

function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    let filteredOrders = orders;
    
    // Apply status filter
    if (currentOrderFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === currentOrderFilter);
    }
    
    // Apply date filter
    if (currentDateFilter) {
        const filterDate = new Date(currentDateFilter);
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate.toDateString() === filterDate.toDateString();
        });
    }
    
    // Sort by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>No orders found</h3>
                <p>No orders match your current filters.</p>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <div class="order-id">#${order.orderId}</div>
                    <div class="order-date">${formatDate(order.orderDate)}</div>
                </div>
                <div class="order-status status-${order.status}">
                    ${order.status}
                </div>
            </div>
            <div class="order-body">
                <div class="order-summary">
                    <div class="customer-info">
                        <h4>Customer</h4>
                        <p><strong>${order.customer.firstName} ${order.customer.lastName}</strong></p>
                        <p><i class="fas fa-envelope"></i> ${order.customer.email}</p>
                        <p><i class="fas fa-phone"></i> ${order.customer.phone}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${order.delivery.address}, ${order.delivery.city}</p>
                    </div>
                    
                    <div class="order-details">
                        <h4>Order Details</h4>
                        <p><strong>Items:</strong> ${order.items.length} item(s)</p>
                        <p><strong>Payment:</strong> ${getPaymentMethodName(order.payment.method)}</p>
                        <p><strong>Delivery:</strong> ${order.delivery.preferredTime || 'Any time'}</p>
                        ${order.promoCode ? `<p><strong>Promo:</strong> ${order.promoCode}</p>` : ''}
                        
                        <div class="order-items">
                            ${order.items.map(item => `
                                <div class="order-item-detail">
                                    <span>${item.name} × ${item.quantity}</span>
                                    <span>₵${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="order-total">
                        <h4>Total</h4>
                        <div class="total-amount">₵${order.pricing.total.toFixed(2)}</div>
                        
                        <div class="order-actions">
                            <button class="action-btn btn-view" onclick="viewOrderDetails('${order.orderId}')">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button class="action-btn btn-update" onclick="updateOrderStatus('${order.orderId}')">
                                <i class="fas fa-edit"></i> Update Status
                            </button>
                            ${order.status === 'pending' ? `
                                <button class="action-btn btn-cancel" onclick="cancelOrder('${order.orderId}')">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function displayCustomers() {
    const customersList = document.getElementById('customersList');
    if (!customersList) return;
    
    if (customers.length === 0) {
        customersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No customers found</h3>
                <p>No customers have placed orders yet.</p>
            </div>
        `;
        return;
    }
    
    // Sort by total spent (highest first)
    const sortedCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);
    
    customersList.innerHTML = sortedCustomers.map(customer => `
        <div class="customer-item">
            <div class="customer-header">
                <div class="customer-name">${customer.firstName} ${customer.lastName}</div>
                <div class="customer-orders">${customer.orders.length} order(s)</div>
            </div>
            <div class="customer-details">
                <div>
                    <strong>Email:</strong><br>
                    ${customer.email}
                </div>
                <div>
                    <strong>Phone:</strong><br>
                    ${customer.phone}
                </div>
                <div>
                    <strong>Total Spent:</strong><br>
                    ₵${customer.totalSpent.toFixed(2)}
                </div>
                <div>
                    <strong>Last Order:</strong><br>
                    ${customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Never'}
                </div>
            </div>
            <div style="margin-top: 1rem;">
                <button class="action-btn btn-view" onclick="viewCustomerDetails('${customer.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `).join('');
}

function displayMessages() {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;
    
    if (messages.length === 0) {
        messagesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope"></i>
                <h3>No messages found</h3>
                <p>No customer messages received yet.</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sortedMessages = [...messages].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    messagesList.innerHTML = sortedMessages.map(message => `
        <div class="message-item ${!message.read ? 'unread' : ''}">
            <div class="message-header">
                <div class="message-sender">${message.name}</div>
                <div class="message-date">${formatDate(message.date)}</div>
            </div>
            <div class="message-subject">${message.subject}</div>
            <div class="message-preview">${message.message.substring(0, 150)}${message.message.length > 150 ? '...' : ''}</div>
            <div style="margin-top: 1rem;">
                <button class="action-btn btn-view" onclick="viewMessage('${message.date}')">
                    <i class="fas fa-eye"></i> View Message
                </button>
                ${!message.read ? `
                    <button class="action-btn btn-update" onclick="markAsRead('${message.date}')">
                        <i class="fas fa-check"></i> Mark as Read
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function displayAnalytics() {
    displayPopularProducts();
    displayRegionalSales();
}

function displayPopularProducts() {
    const popularProductsEl = document.getElementById('popularProducts');
    if (!popularProductsEl) return;
    
    // Count product sales
    const productSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!productSales[item.name]) {
                productSales[item.name] = 0;
            }
            productSales[item.name] += item.quantity;
        });
    });
    
    // Sort by quantity sold
    const sortedProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    if (sortedProducts.length === 0) {
        popularProductsEl.innerHTML = '<p>No sales data available</p>';
        return;
    }
    
    popularProductsEl.innerHTML = sortedProducts.map(([name, quantity]) => `
        <div class="popular-product">
            <span>${name}</span>
            <span>${quantity} sold</span>
        </div>
    `).join('');
}

function displayRegionalSales() {
    const regionalSalesEl = document.getElementById('regionalSales');
    if (!regionalSalesEl) return;
    
    // Count sales by region
    const regionSales = {};
    orders.forEach(order => {
        const region = order.delivery.region;
        if (!regionSales[region]) {
            regionSales[region] = 0;
        }
        regionSales[region] += order.pricing.total;
    });
    
    // Sort by revenue
    const sortedRegions = Object.entries(regionSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    if (sortedRegions.length === 0) {
        regionalSalesEl.innerHTML = '<p>No regional data available</p>';
        return;
    }
    
    regionalSalesEl.innerHTML = sortedRegions.map(([region, revenue]) => `
        <div class="regional-item">
            <span>${formatRegionName(region)}</span>
            <span>₵${revenue.toFixed(2)}</span>
        </div>
    `).join('');
}

function viewOrderDetails(orderId) {
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;
    
    const modal = document.getElementById('orderModal');
    const modalBody = document.getElementById('orderModalBody');
    const overlay = document.getElementById('modalOverlay');
    
    modalBody.innerHTML = `
        <div class="order-details-grid">
            <div class="detail-section">
                <h4>Customer Information</h4>
                <div class="detail-item">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${order.customer.firstName} ${order.customer.lastName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${order.customer.email}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${order.customer.phone}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Delivery Information</h4>
                <div class="detail-item">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${order.delivery.address}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">City:</span>
                    <span class="detail-value">${order.delivery.city}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Region:</span>
                    <span class="detail-value">${formatRegionName(order.delivery.region)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Preferred Time:</span>
                    <span class="detail-value">${order.delivery.preferredTime || 'Any time'}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h4>Order Items</h4>
            ${order.items.map(item => `
                <div class="detail-item">
                    <span class="detail-label">${item.name} × ${item.quantity}</span>
                    <span class="detail-value">₵${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('')}
        </div>
        
        <div class="detail-section">
            <h4>Payment & Pricing</h4>
            <div class="detail-item">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${getPaymentMethodName(order.payment.method)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Subtotal:</span>
                <span class="detail-value">₵${order.pricing.subtotal.toFixed(2)}</span>
            </div>
            ${order.pricing.discount > 0 ? `
                <div class="detail-item">
                    <span class="detail-label">Discount:</span>
                    <span class="detail-value">-₵${order.pricing.discount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="detail-item">
                <span class="detail-label">Delivery Fee:</span>
                <span class="detail-value">${order.pricing.deliveryFee === 0 ? 'FREE' : '₵' + order.pricing.deliveryFee.toFixed(2)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label"><strong>Total:</strong></span>
                <span class="detail-value"><strong>₵${order.pricing.total.toFixed(2)}</strong></span>
            </div>
        </div>
        
        ${order.notes ? `
            <div class="detail-section">
                <h4>Special Instructions</h4>
                <p>${order.notes}</p>
            </div>
        ` : ''}
        
        <div class="status-update">
            <h4>Update Order Status</h4>
            <select id="newStatus">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
            <button class="update-status-btn" onclick="updateOrderStatusFromModal('${orderId}')">
                Update Status
            </button>
        </div>
    `;
    
    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function updateOrderStatusFromModal(orderId) {
    const newStatus = document.getElementById('newStatus').value;
    const order = orders.find(o => o.orderId === orderId);
    
    if (order) {
        order.status = newStatus;
        localStorage.setItem('luminouscraft_orders', JSON.stringify(orders));
        
        showAdminMessage(`Order #${orderId} status updated to ${newStatus}`, 'success');
        closeModal('orderModal');
        displayOrders();
        updateDashboardStats();
    }
}

function filterOrders() {
    currentOrderFilter = document.getElementById('statusFilter').value;
    currentDateFilter = document.getElementById('dateFilter').value;
    displayOrders();
}

function clearFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('dateFilter').value = '';
    currentOrderFilter = 'all';
    currentDateFilter = '';
    displayOrders();
}

function searchCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const customerItems = document.querySelectorAll('.customer-item');
    
    customerItems.forEach(item => {
        const customerName = item.querySelector('.customer-name').textContent.toLowerCase();
        const customerEmail = item.textContent.toLowerCase();
        
        if (customerName.includes(searchTerm) || customerEmail.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function refreshData() {
    loadData();
    updateDashboardStats();
    displayOrders();
    displayCustomers();
    displayMessages();
    displayAnalytics();
    showAdminMessage('Data refreshed successfully', 'success');
}

function exportOrders() {
    if (orders.length === 0) {
        showAdminMessage('No orders to export', 'error');
        return;
    }
    
    const csvContent = generateOrdersCSV();
    downloadCSV(csvContent, 'luminouscraft-orders.csv');
    showAdminMessage('Orders exported successfully', 'success');
}

function generateOrdersCSV() {
    const headers = [
        'Order ID', 'Date', 'Customer Name', 'Email', 'Phone', 
        'Address', 'City', 'Region', 'Items', 'Total', 'Status', 'Payment Method'
    ];
    
    const rows = orders.map(order => [
        order.orderId,
        formatDate(order.orderDate),
        `${order.customer.firstName} ${order.customer.lastName}`,
        order.customer.email,
        order.customer.phone,
        order.delivery.address,
        order.delivery.city,
        formatRegionName(order.delivery.region),
        order.items.map(item => `${item.name} (${item.quantity})`).join('; '),
        order.pricing.total.toFixed(2),
        order.status,
        getPaymentMethodName(order.payment.method)
    ]);
    
    return [headers, ...rows].map(row => 
        row.map(field => `"${field}"`).join(',')
    ).join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        localStorage.removeItem('luminouscraft_orders');
        localStorage.removeItem('luminouscraft_messages');
        localStorage.removeItem('luminouscraft_cart');
        
        orders = [];
        customers = [];
        messages = [];
        
        updateDashboardStats();
        displayOrders();
        displayCustomers();
        displayMessages();
        displayAnalytics();
        
        showAdminMessage('All data cleared successfully', 'success');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modalOverlay');
    
    modal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function printOrder() {
    window.print();
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatRegionName(region) {
    return region.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function getPaymentMethodName(method) {
    const methods = {
        'cash': 'Cash on Delivery',
        'momo': 'Mobile Money',
        'bank': 'Bank Transfer'
    };
    return methods[method] || method;
}

function showAdminMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.admin-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `admin-message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '100px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.padding = '1rem 1.5rem';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.color = 'white';
    messageDiv.style.fontWeight = '500';
    messageDiv.style.display = 'flex';
    messageDiv.style.alignItems = 'center';
    messageDiv.style.gap = '0.5rem';
    messageDiv.style.minWidth = '300px';
    messageDiv.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#27ae60';
    } else {
        messageDiv.style.backgroundColor = '#e74c3c';
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 4000);
}

// Make functions globally available
window.showSection = showSection;
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatusFromModal = updateOrderStatusFromModal;
window.filterOrders = filterOrders;
window.clearFilters = clearFilters;
window.searchCustomers = searchCustomers;
window.refreshData = refreshData;
window.exportOrders = exportOrders;
window.clearAllData = clearAllData;
window.closeModal = closeModal;
window.printOrder = printOrder;

console.log('✅ Admin dashboard script loaded successfully');