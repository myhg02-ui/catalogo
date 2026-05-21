/* ============================================================
   Fyis Catálogo — Public Application Script
   ============================================================ */

// --- SVGs for Official Brand Icons ---
const BRAND_ICONS = {
    netflix: `<svg class="brand-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="#0c0d14"/><path d="M28 15V85H39V49L61 85H72V15H61V51L39 15H28Z" fill="#E50914"/></svg>`,
    disney: `<svg class="brand-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="url(#disneyGrad)"/><path d="M50 20C40 20 30 34 30 48C30 62 40 76 50 76C60 76 70 62 70 48C70 34 60 20 50 20ZM50 68C45 68 39 59 39 48C39 37 45 28 50 28C55 28 61 37 61 48C61 59 55 68 50 68Z" fill="white"/><path d="M30 48C40 43 60 43 70 48" stroke="white" stroke-width="4" stroke-linecap="round"/><defs><linearGradient id="disneyGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#020a30"/><stop offset="100%" stop-color="#0083e2"/></linearGradient></defs></svg>`,
    disney_std: `<svg class="brand-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="url(#disneyStdGrad)"/><path d="M50 20C40 20 30 34 30 48C30 62 40 76 50 76C60 76 70 62 70 48C70 34 60 20 50 20ZM50 68C45 68 39 59 39 48C39 37 45 28 50 28C55 28 61 37 61 48C61 59 55 68 50 68Z" fill="white"/><path d="M30 48C40 43 60 43 70 48" stroke="white" stroke-width="4" stroke-linecap="round"/><defs><linearGradient id="disneyStdGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#08285c"/><stop offset="100%" stop-color="#09a6a8"/></linearGradient></defs></svg>`,
    hbo: `<svg class="brand-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="url(#hboGrad)"/><circle cx="50" cy="50" r="24" stroke="white" stroke-width="8" fill="none"/><circle cx="50" cy="50" r="10" fill="white"/><defs><linearGradient id="hboGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4600a3"/><stop offset="100%" stop-color="#001875"/></linearGradient></defs></svg>`,
    prime: `<svg class="brand-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="#00A8E1"/><path d="M25 45C35 48 55 48 65 45" stroke="white" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M60 40L67 47L58 52" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M32 58C36 68 64 68 68 58" stroke="#FF9900" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M64 54L69 60L62 65" stroke="#FF9900" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
    paramount: `<svg class="brand-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="#0064FF"/><path d="M50 28L32 66H68L50 28Z" fill="white"/><circle cx="50" cy="50" r="32" stroke="white" stroke-width="3" stroke-dasharray="10,6" fill="none"/></svg>`,
    crunchyroll: `<svg class="brand-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="#F47521"/><circle cx="53" cy="50" r="28" fill="white"/><circle cx="48" cy="50" r="18" fill="#F47521"/><circle cx="44" cy="50" r="10" fill="white"/><circle cx="41" cy="50" r="5" fill="#F47521"/></svg>`,
    spotify: `<svg class="brand-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="#1DB954"/><path d="M26 38C44 28 68 28 84 38" stroke="white" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M30 51C45 43 63 43 76 51" stroke="white" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M34 64C45 58 59 58 70 64" stroke="white" stroke-width="4.2" stroke-linecap="round" fill="none"/></svg>`,
    chatgpt: `<svg class="brand-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="#10A37F"/><path d="M50 22C41 22 36 29 36 37C36 42 42 47 50 47C58 47 64 42 64 37C64 29 59 22 50 22Z" fill="white"/><path d="M36 47C26 47 21 54 21 62C21 67 27 72 36 72C45 72 50 67 50 62C50 54 45 47 36 47Z" fill="white"/><path d="M64 47C55 47 50 54 50 62C50 67 55 72 64 72C73 72 79 67 79 62C79 54 73 47 64 47Z" fill="white"/></svg>`,
    canva: `<svg class="brand-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="url(#canvaGrad)"/><circle cx="50" cy="50" r="22" stroke="white" stroke-width="6" fill="none"/><defs><linearGradient id="canvaGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7C2AE8"/><stop offset="100%" stop-color="#00C4CC"/></linearGradient></defs></svg>`
};

// --- Brand Colors mapping for highlights ---
const BRAND_COLORS = {
    'netflix': '#E50914',
    'disney premium': '#1A6DFF',
    'disney estándar': '#09a6a8',
    'disney': '#1A6DFF',
    'hbo': '#B01DCD',
    'prime': '#00A8E1',
    'paramount': '#0064FF',
    'crunchyroll': '#F47521',
    'spotify': '#1DB954',
    'chatgpt': '#10A37F',
    'canva': '#00C4CC',
    'iptv': '#00f2fe'
};

// Scroll flags
let isScrolling = false;
let scrollTimeout;

/**
 * Returns the brand color for a product based on its name.
 */
const getBrandColor = (productName) => {
    const name = productName.toLowerCase();
    for (const [brand, color] of Object.entries(BRAND_COLORS)) {
        if (name.includes(brand)) return color;
    }
    return '#a8d0fc'; // Fallback to Fyis Blue
};

/**
 * Automatically parses a product name to determine which brands it contains
 * and returns the appropriate circular brand logo stack or single logo.
 */
const getBrandLogoHtml = (product, productName) => {
    // If a custom image is uploaded via the admin panel, use it
    if (product.image) {
        const imgSrc = product.image.startsWith('/') ? product.image : `/uploads/${product.image}`;
        return `<div class="card-logo-container"><img src="${imgSrc}" class="card-brand-logo-img" alt="${productName}"></div>`;
    }

    const name = productName.toLowerCase();
    const brandsFound = [];

    // Find all brands in the product name
    if (name.includes('netflix')) brandsFound.push('netflix');
    if (name.includes('disney premium')) {
        brandsFound.push('disney');
    } else if (name.includes('disney estándar') || name.includes('disney estandar') || name.includes('disney standar')) {
        brandsFound.push('disney_std');
    } else if (name.includes('disney')) {
        brandsFound.push('disney');
    }
    
    if (name.includes('hbo') || name.includes('max')) brandsFound.push('hbo');
    if (name.includes('prime')) brandsFound.push('prime');
    if (name.includes('paramount')) brandsFound.push('paramount');
    if (name.includes('crunchyroll')) brandsFound.push('crunchyroll');
    if (name.includes('spotify')) brandsFound.push('spotify');
    if (name.includes('chatgpt')) brandsFound.push('chatgpt');
    if (name.includes('canva')) brandsFound.push('canva');

    // Remove duplicates
    const uniqueBrands = [...new Set(brandsFound)];

    // Exact user upload mapping
    const BRAND_IMAGE_FILES = {
        netflix: 'netflixlogo.png',
        disney: 'disney.png',
        disney_std: 'disney.png',
        hbo: 'hbomax.png',
        prime: 'prime-video.png',
        paramount: 'paramount.png',
        crunchyroll: 'crunchryroll.png',
        spotify: 'spotify.png',
        chatgpt: 'chatgpt.png',
        canva: 'canva.png'
    };

    if (uniqueBrands.length === 0) {
        // Fallback to emoji if no specific brand matched
        return `<div class="card-logo-container"><span class="card-emoji">${product.emoji || '📺'}</span></div>`;
    }

    if (uniqueBrands.length === 1) {
        // Single logo representation - try custom PNG first, fallback to SVG
        const brandKey = uniqueBrands[0];
        const fileName = BRAND_IMAGE_FILES[brandKey] || `${brandKey}.png`;
        return `
            <div class="card-logo-container">
                <img src="/images/${fileName}" class="card-brand-logo-img" alt="${productName}" style="display:none;" onload="this.style.display='block'; if(this.nextElementSibling) this.nextElementSibling.style.display='none';" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';">
                <div class="fallback-svg" style="display:block; width:100%; height:100%;">${BRAND_ICONS[brandKey]}</div>
            </div>
        `;
    }

    // Multiple logos! Return an overlapping stack row
    let stackHtml = '<div class="logo-stack">';
    uniqueBrands.forEach(brandKey => {
        const fileName = BRAND_IMAGE_FILES[brandKey] || `${brandKey}.png`;
        stackHtml += `
            <div class="logo-stack-item" title="${brandKey.replace('_', ' ').toUpperCase()}">
                <img src="/images/${fileName}" class="card-brand-logo-img" alt="${brandKey}" style="display:none; border-radius:50%; width:100%; height:100%; object-fit:cover;" onload="this.style.display='block'; if(this.nextElementSibling) this.nextElementSibling.style.display='none';" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';">
                <div class="fallback-svg" style="display:block; width:100%; height:100%;">${BRAND_ICONS[brandKey]}</div>
            </div>
        `;
    });
    stackHtml += '</div>';
    return stackHtml;
};


/**
 * Generates a WhatsApp link with a pre-filled message.
 */
const buildWhatsAppLink = (settings, productName, duration, price) => {
    const whatsappNumber = settings.whatsapp_number || '639631207428';
    const currencySymbol = settings.currency_symbol || 'S/';
    
    let messageTemplate = settings.whatsapp_message_template || 'Hola! Me interesa *{productName}* por *{duration}* ({currencySymbol}{price}) desde tu Catálogo.';
    
    const message = messageTemplate
        .replace(/{productName}/g, productName)
        .replace(/{duration}/g, duration)
        .replace(/{price}/g, price)
        .replace(/{currencySymbol}/g, currencySymbol);

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

/**
 * Creates a single product card DOM element.
 */
const createProductCard = (product, settings) => {
    const card = document.createElement('div');
    card.className = 'product-card fade-in' + (product.out_of_stock ? ' out-of-stock' : '');

    const brandColor = getBrandColor(product.name);
    card.style.setProperty('--brand-color', brandColor);

    // Sort plans by sort_order
    const plans = [...product.plans].sort((a, b) => a.sort_order - b.sort_order);
    const defaultPlan = plans[0];

    const whatsappNumber = settings.whatsapp_number || '639631207428';
    const currencySymbol = settings.currency_symbol || 'S/';

    // Build inner HTML
    let html = '';

    // Highlight or Out of Stock badge
    if (product.out_of_stock) {
        html += '<span class="out-of-stock-badge">🚫 SIN STOCK</span>';
    } else if (product.highlight === 1) {
        html += '<span class="highlight-badge">🔥 RECOMENDADO</span>';
    }

    // Dynamic brand logo stack or single logo
    html += getBrandLogoHtml(product, product.name);

    // Name
    html += `<h3 class="card-name">${product.name}</h3>`;

    // Description
    if (product.description && product.description.trim() !== '') {
        html += `<p class="card-description">${product.description}</p>`;
    } else {
        html += `<p class="card-description">Entrega rápida y garantía completa durante el tiempo contratado.</p>`;
    }

    // Duration pills
    if (plans.length > 0) {
        html += '<div class="duration-pills">';
        plans.forEach((plan, index) => {
            const activeClass = index === 0 ? ' active' : '';
            html += `<button class="duration-pill${activeClass}" data-plan-id="${plan.id}" data-price="${plan.price}" data-duration="${plan.duration}">${plan.duration}</button>`;
        });
        html += '</div>';
    }

    // Price display
    if (defaultPlan) {
        html += `
            <div class="price-display">
                <span class="price-amount"><span class="price-currency">${currencySymbol}</span>${defaultPlan.price}</span>
                <span class="price-duration">${defaultPlan.duration}</span>
            </div>
        `;
    }

    // Buy button
    if (defaultPlan) {
        if (product.out_of_stock) {
            html += `<button class="btn-buy btn-out-of-stock" disabled>Agotado / Sin Stock</button>`;
        } else {
            const whatsappLink = buildWhatsAppLink(settings, product.name, defaultPlan.duration, defaultPlan.price);
            html += `<a class="btn-buy" href="${whatsappLink}" target="_blank" rel="noopener">Comprar por WhatsApp</a>`;
        }
    }

    // Free Trial button for IPTV
    if (product.name.toLowerCase().includes('iptv')) {
        if (product.out_of_stock) {
            html += `<button class="btn-trial btn-out-of-stock" disabled>Prueba no disponible</button>`;
        } else {
            const trialMsg = `Hola! Me interesa solicitar la *Prueba Gratuita de 12 Horas* para *${product.name}* desde tu Catálogo. 📺`;
            const trialLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(trialMsg)}`;
            html += `<a class="btn-trial" href="${trialLink}" target="_blank" rel="noopener">🎁 Solicitar Prueba Gratis 12h</a>`;
        }
    }

    card.innerHTML = html;

    // --- Event Listeners ---

    // Duration pill click
    const pills = card.querySelectorAll('.duration-pill');
    const priceAmount = card.querySelector('.price-amount');
    const priceDuration = card.querySelector('.price-duration');
    const buyBtn = card.querySelector('.btn-buy');

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Update active state
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            // Update price
            const price = pill.dataset.price;
            const duration = pill.dataset.duration;

            if (priceAmount) {
                priceAmount.innerHTML = `<span class="price-currency">${currencySymbol}</span>${price}`;
            }
            if (priceDuration) {
                priceDuration.textContent = duration;
            }

            // Update buy button link
            if (buyBtn && buyBtn.tagName === 'A') {
                buyBtn.href = buildWhatsAppLink(settings, product.name, duration, price);
            }
        });
    });

    return card;
};

/**
 * Renders the full catalog from categories data.
 */
const renderCatalog = (categories, settings) => {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = ''; // Clear prior loading

    // Sort categories by sort_order
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);

    sorted.forEach(category => {
        // Filter only active products
        const activeProducts = category.products
            .filter(p => p.active == 1)
            .sort((a, b) => a.sort_order - b.sort_order);

        if (activeProducts.length === 0) return;

        // Section
        const section = document.createElement('section');
        section.className = 'catalog-section';
        section.id = `cat-${category.id}`;

        // Section header
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <span class="section-icon">${category.icon || '📂'}</span>
            <h2 class="section-title">${category.name}</h2>
        `;
        section.appendChild(header);

        // Products grid
        const grid = document.createElement('div');
        grid.className = 'products-grid';

        activeProducts.forEach((product, index) => {
            const card = createProductCard(product, settings);
            // Stagger animation delay
            card.style.transitionDelay = `${index * 0.05}s`;
            grid.appendChild(card);
        });

        section.appendChild(grid);
        catalog.appendChild(section);
    });
};

/**
 * Renders the category navigation pills.
 */
const renderNavigation = (categories) => {
    const navScroll = document.getElementById('navScroll');
    if (!navScroll) return;
    navScroll.innerHTML = ''; // Clear prior content

    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);

    sorted.forEach(category => {
        // Only show categories that have active products
        const hasActive = category.products.some(p => p.active == 1);
        if (!hasActive) return;

        const pill = document.createElement('button');
        pill.className = 'nav-pill';
        pill.textContent = `${category.icon || '📂'} ${category.name}`;
        pill.dataset.categoryId = category.id;

        pill.addEventListener('click', (e) => {
            e.preventDefault();
            isScrolling = true;
            clearTimeout(scrollTimeout);

            // Highlight pill immediately
            document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const target = document.getElementById(`cat-${category.id}`);
            if (target) {
                // Fixed offset to keep target perfectly centered and fully visible under sticky header
                const offset = 150; // Total height of sticky headers + margins
                const bodyRect = document.body.getBoundingClientRect().top;
                const targetRect = target.getBoundingClientRect().top;
                const targetPosition = targetRect - bodyRect - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }

            // Release scroll observer block after 800ms
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 800);
        });

        navScroll.appendChild(pill);
    });
};

/**
 * Sets up IntersectionObserver to highlight active nav pill on scroll.
 */
const setupNavHighlighting = () => {
    const sections = document.querySelectorAll('.catalog-section');
    const pills = document.querySelectorAll('.nav-pill');

    if (sections.length === 0 || pills.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        // Skip observer highlighting if smooth scroll is in progress
        if (isScrolling) return;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                const categoryId = sectionId.replace('cat-', '');

                pills.forEach(pill => {
                    if (pill.dataset.categoryId === categoryId) {
                        pill.classList.add('active');
                        // Scroll the active pill into view in the nav bar
                        pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    } else {
                        pill.classList.remove('active');
                    }
                });
            }
        });
    }, {
        root: null,
        rootMargin: '-25% 0px -55% 0px',
        threshold: 0
    });

    sections.forEach(section => observer.observe(section));
};

/**
 * Sets up IntersectionObserver for card fade-in animations.
 */
const setupScrollAnimations = () => {
    const cards = document.querySelectorAll('.fade-in');

    if (cards.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -30px 0px',
        threshold: 0.05
    });

    cards.forEach(card => observer.observe(card));
};

/**
 * Sets up the search bar to filter products and hide empty categories dynamically.
 */
const setupSearch = () => {
    const searchInput = document.getElementById('platformSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const sections = document.querySelectorAll('.catalog-section');

        sections.forEach(section => {
            const cards = section.querySelectorAll('.product-card');
            let hasVisibleCards = false;

            cards.forEach(card => {
                const name = card.querySelector('.card-name').textContent.toLowerCase();
                const desc = card.querySelector('.card-description') ? card.querySelector('.card-description').textContent.toLowerCase() : '';
                
                // Show card if name or description matches query
                if (name.includes(query) || desc.includes(query)) {
                    card.style.display = '';
                    card.classList.remove('hidden-card');
                    hasVisibleCards = true;
                } else {
                    card.style.display = 'none';
                    card.classList.add('hidden-card');
                }
            });

            // Hide the entire category section if it has no matching products
            if (hasVisibleCards) {
                section.style.display = '';
            } else {
                section.style.display = 'none';
            }
        });

        // Toggle category navigation visibility if search is active
        const categoryNav = document.getElementById('categoryNav');
        if (categoryNav) {
            if (query !== '') {
                categoryNav.style.opacity = '0.5';
                categoryNav.style.pointerEvents = 'none';
            } else {
                categoryNav.style.opacity = '1';
                categoryNav.style.pointerEvents = 'all';
            }
        }
    });
};

/**
 * Sets up the main navigation buttons (Streaming, Doxeo, Seguidores)
 */
const setupMainTabs = () => {
    const tabs = document.querySelectorAll('.section-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const sectionName = tab.dataset.section;

            // Hide all views
            document.querySelectorAll('.section-view').forEach(view => {
                view.classList.remove('active');
            });

            // Show active view
            const activeView = document.getElementById(`${sectionName}-view`);
            if (activeView) {
                activeView.classList.add('active');
                
                // Trigger animation reset
                const soonCards = activeView.querySelectorAll('.soon-card');
                soonCards.forEach(card => {
                    card.classList.remove('visible');
                    setTimeout(() => card.classList.add('visible'), 50);
                });
            }
        });
    });
};

/**
 * Shows an error message in the catalog area.
 */
const showError = (message) => {
    const catalog = document.getElementById('catalog');
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.add('hidden');

    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'text-align:center; padding:3rem 1rem; color:#ef4444;';
    errorDiv.innerHTML = `
        <p style="font-size:2rem; margin-bottom:1rem;">😕</p>
        <p style="font-size:1.1rem; font-weight:600; margin-bottom:0.5rem;">Error al cargar el catálogo</p>
        <p style="font-size:0.9rem; color:#8b8fa3;">${message}</p>
        <button onclick="location.reload()" style="margin-top:1.5rem; padding:10px 24px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(168,208,252,0.2); color:#fff; cursor:pointer; font-family:inherit; font-size:0.9rem;">Reintentar</button>
    `;
    catalog.appendChild(errorDiv);
};

/**
 * Sets up Netflix guide modal open/close functionality.
 */
const setupNetflixModal = () => {
    const modal = document.getElementById('netflixGuideModal');
    const btn = document.getElementById('btnNetflixGuide');
    const closeBtn = document.getElementById('closeNetflixGuide');
    const closeBtnFooter = document.getElementById('closeNetflixGuideBtn');

    if (!modal || !btn) return;

    const openModal = () => {
        modal.style.display = 'flex';
        // Allow DOM to register display: flex before adding active class for animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeModal = () => {
        modal.classList.remove('active');
        // Wait for transition before hiding display
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    };

    btn.addEventListener('click', openModal);
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtnFooter) closeBtnFooter.addEventListener('click', closeModal);

    // Close when clicking outside of modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
};

/**
 * Main initialization function.
 */
const init = async () => {
    const spinner = document.getElementById('loadingSpinner');

    try {
        // Fetch categories and settings in parallel
        const [categoriesRes, settingsRes] = await Promise.all([
            fetch('/api/categories'),
            fetch('/api/settings')
        ]);

        if (!categoriesRes.ok) {
            throw new Error(`Error al obtener categorías (${categoriesRes.status})`);
        }

        const categories = await categoriesRes.json();
        let whatsappNumber = '639631207428'; // Default fallback
        let settings = { whatsapp_number: whatsappNumber, currency_symbol: 'S/' };

        if (settingsRes.ok) {
            const fetchedSettings = await settingsRes.json();
            settings = Object.assign(settings, fetchedSettings);
            whatsappNumber = settings.whatsapp_number || whatsappNumber;
        }

        // Hide loading spinner
        if (spinner) spinner.classList.add('hidden');

        // Set up WhatsApp float and footer link
        const whatsappFloat = document.getElementById('whatsappFloat');
        if (whatsappFloat) {
            whatsappFloat.href = `https://wa.me/${whatsappNumber}?text=Hola%20Fyis!%20Vengo%20de%20tu%20Catálogo...`;
        }

        const footerWhatsApp = document.getElementById('footerWhatsApp');
        if (footerWhatsApp) {
            footerWhatsApp.href = `https://wa.me/${whatsappNumber}?text=Hola%20Fyis!%20Vengo%20de%20tu%20Catálogo...`;
        }

        // Render contents
        renderNavigation(categories);
        renderCatalog(categories, settings);

        // Set up interactions
        setupMainTabs();
        setupSearch();
        setupNavHighlighting();
        setupScrollAnimations();
        setupNetflixModal();

    } catch (error) {
        console.error('Fyis Catálogo init error:', error);
        showError(error.message || 'No se pudo conectar con el servidor.');
    }
};

// --- Boot ---
document.addEventListener('DOMContentLoaded', init);
