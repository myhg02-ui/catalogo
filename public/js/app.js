/* ============================================================
   Fyis Catálogo — Public Application Script
   ============================================================ */

// --- Unicode Helper to prevent character corruption ---
const toMathBold = (str) => {
    return str.split('').map(c => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) { // A-Z
            return String.fromCodePoint(0x1D5D4 + (code - 65));
        }
        return c;
    }).join('');
};

// --- RENIEC Premium Mockup Text Constants ---
const RENIEC_PREMIUM_TEXT = `➣ ${toMathBold('RENIEC')}

${toMathBold('DNI')} ➟ 06256217 - 5
${toMathBold('NOMBRE')} ➟ DINA ERCILIA
${toMathBold('APELLIDO PATERNO')} ➟ BOLUARTE
${toMathBold('APELLIDO MATERNO')} ➟  ZEGARRA
${toMathBold('SEXO')} ➟  FEMENINO

[📅] ${toMathBold('NACIMIENTO')}

${toMathBold('FECHA DE NACIMIENTO')} ➟ 31/05/1962
${toMathBold('DEPARTAMENTO')} ➟ APURIMAC
${toMathBold('PROVINCIA')} ➟ AYMARAES
${toMathBold('DISTRITO')} ➟ CHALHUANCA

[📝] ${toMathBold('INFO')}

${toMathBold('GRADO DE INSTRUCCION')} ➟  SUPERIOR COMPLETA
${toMathBold('ESTADO CIVIL')} ➟ DIVORCIADO
${toMathBold('EDAD')} ➟ 63 AÑOS
${toMathBold('ESTATURA')} ➟ 1.62 MT.
${toMathBold('FECHA DE INSCRIPCION')} ➟  25/01/2023
${toMathBold('FECHA DE EMISION')} ➟ 11/06/2025
${toMathBold('FECHA DE CADUCIDAD')} ➟ 19/07/2029
${toMathBold('RESTRICCION')}: NINGUNA
${toMathBold('DONACION DE ORGANOS')} ➟  NO

[👨‍👨‍👦‍👦] ${toMathBold('PADRES')}

${toMathBold('PADRE')} ➟ NICANOR
${toMathBold('DNI DEL PADRE')} ➟ 
${toMathBold('MADRE')}:  ERCILIA
${toMathBold('DNI DE LA MADRE')} ➟ 

[📍] ${toMathBold('UBICACION')}: 

${toMathBold('DEPARTAMENTO')} ➟ LIMA
${toMathBold('PROVINCIA')} ➟ LIMA
${toMathBold('DISTRITO')} ➟  SURQUILLO
${toMathBold('DIRECCION')} ➟ CALLE LOS HALCONES 326 

[🌐] ${toMathBold('UBIGEO')} : 

${toMathBold('UBIGEO INEI')} ➟ 145751
${toMathBold('UBIGEO RENIEC')} ➟ 145751
${toMathBold('UBIGEO SUNAT')} ➟ 145751`;

// --- Experian / Infocorp Premium Mockup Text Constants ---
const EXPERIAN_PREMIUM_TEXT = `➣ ${toMathBold('REPORTE FINANCIERO EXPERIAN')}
 
${toMathBold('TITULAR')} ➟ BOLUARTE ZEGARRA DINA ERCILIA
${toMathBold('DNI')} ➟ 06256217
${toMathBold('CALIFICACION')} ➟ NORM (100% NORMAL)
${toMathBold('SCORE EXPERIAN')} ➟ 845 / 1000 (RIESGO BAJO)

[📊] ${toMathBold('DEUDAS SBS')}

${toMathBold('CALIFICACION BANCOS')} ➟ NORMAL
${toMathBold('DEUDA TOTAL SBS')} ➟ S/ 0.00
${toMathBold('DEUDA VENCIDA / IMPAGA')} ➟ S/ 0.00
${toMathBold('CANTIDAD DE ENTIDADES')} ➟ 0 bancos

[🚨] ${toMathBold('ALERTAS Y MOROSIDAD')}

${toMathBold('DEUDAS EN INFOCORP')} ➟ S/ 0.00
${toMathBold('DEUDAS TRIBUTARIAS SUNAT')} ➟ S/ 0.00
${toMathBold('LETRAS PROTESTADAS')} ➟ NINGUNA
${toMathBold('JUICIOS Y DEMANDAS')} ➟ NINGUNA

[🏢] ${toMathBold('CONSULTAS DE CREDITO')}

${toMathBold('CONSULTAS ULTIMOS 3 MESES')} ➟ 0
${toMathBold('LINEA CREDITOCALC')} ➟ S/ 0.00 (SIN USO)

[📅] ${toMathBold('FECHA DE CONSULTA')} ➟ 21/05/2026`;

window.copyDoxeoTerminalText = (e) => {
    if (e) e.stopPropagation();
    const pre = document.getElementById('doxeoTerminalPre');
    if (!pre) return;
    const text = pre.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('btnCopyTerminal');
        if (btn) {
            btn.innerHTML = '<span class="copy-icon">✅</span> ¡Copiado!';
            btn.style.background = 'rgba(16, 185, 129, 0.2)';
            btn.style.borderColor = '#10b981';
            btn.style.color = '#10b981';
            setTimeout(() => {
                btn.innerHTML = '<span class="copy-icon">📋</span> Copiar';
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 2000);
        }
    }).catch(err => {
        console.error('Error al copiar:', err);
    });
};


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
    canva: `<svg class="brand-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="url(#canvaGrad)"/><circle cx="50" cy="50" r="22" stroke="white" stroke-width="6" fill="none"/><defs><linearGradient id="canvaGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7C2AE8"/><stop offset="100%" stop-color="#00C4CC"/></linearGradient></defs></svg>`,
    facebook: `<svg class="brand-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="#1877F2"/><path d="M68 50H56V85H42V50H34V38H42V30C42 21 47 16 57 16H67V28H61C56 28 56 30 56 33V38H68L66 50Z" fill="white"/></svg>`,
    instagram: `<svg class="brand-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="url(#igGrad)"/><path d="M50 31C39.5 31 31 39.5 31 50C31 60.5 39.5 69 50 69C60.5 69 69 60.5 69 50C69 39.5 60.5 31 50 31ZM50 62C43.4 62 38 56.6 38 50C38 43.4 43.4 38 50 38C56.6 38 62 43.4 62 50C62 56.6 56.6 62 50 62Z" fill="white"/><circle cx="64" cy="36" r="3" fill="white"/><rect x="22" y="22" width="56" height="56" rx="15" stroke="white" stroke-width="7" fill="none"/><defs><linearGradient id="igGrad" x1="0" y1="100" x2="100" y2="0"><stop offset="0%" stop-color="#f09433"/><stop offset="25%" stop-color="#e6683c"/><stop offset="50%" stop-color="#dc2743"/><stop offset="75%" stop-color="#cc2366"/><stop offset="100%" stop-color="#bc1888"/></linearGradient></defs></svg>`,
    tiktok: `<svg class="brand-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="#000000"/><path d="M59 18v34c0 7.7-6.3 14-14 14s-14-6.3-14-14 6.3-14 14-14v10c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4V18h10c0 7 5 12.8 12 13.8v9.2c-5.8-1-10.8-4.5-14-9.4V18z" fill="#ffffff"/></svg>`
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
    'iptv': '#00f2fe',
    'facebook': '#1877F2',
    'instagram': '#E1306C',
    'tiktok': '#ff0050'
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
const getBrandLogoHtml = (product, productName, catalogType = 'streaming') => {
    // If a custom image is uploaded via the admin panel, use it (for streaming only as main logo)
    if (product.image && catalogType === 'streaming') {
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
    if (name.includes('facebook')) brandsFound.push('facebook');
    if (name.includes('instagram')) brandsFound.push('instagram');
    if (name.includes('tiktok')) brandsFound.push('tiktok');

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
 * Generates a WhatsApp link with a pre-filled message based on specific catalog type.
 */
const buildWhatsAppLink = (settings, productName, duration, price, catalogType) => {
    const whatsappNumber = settings[`whatsapp_number_${catalogType}`] || settings.whatsapp_number || '639631207428';
    const currencySymbol = settings[`currency_symbol_${catalogType}`] || settings.currency_symbol || 'S/';
    
    let messageTemplate = settings[`whatsapp_message_template_${catalogType}`] || settings.whatsapp_message_template || 'Hola! Me interesa *{productName}* por *{duration}* ({currencySymbol}{price}) desde tu Catálogo.';
    
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
const createProductCard = (product, settings, catalogType) => {
    const card = document.createElement('div');
    card.className = 'product-card fade-in' + (product.out_of_stock ? ' out-of-stock' : '');

    const brandColor = getBrandColor(product.name);
    card.style.setProperty('--brand-color', brandColor);

    // Sort plans by sort_order
    const plans = [...product.plans].sort((a, b) => a.sort_order - b.sort_order);
    const defaultPlan = plans[0];

    const whatsappNumber = settings[`whatsapp_number_${catalogType}`] || settings.whatsapp_number || '639631207428';
    const currencySymbol = settings[`currency_symbol_${catalogType}`] || settings.currency_symbol || 'S/';

    // Build inner HTML
    let html = '';

    // Highlight or Out of Stock badge
    if (product.out_of_stock) {
        html += '<span class="out-of-stock-badge">🚫 SIN STOCK</span>';
    } else if (product.highlight === 1) {
        html += '<span class="highlight-badge">🔥 RECOMENDADO</span>';
    }

    // Dynamic brand logo stack or single logo
    html += getBrandLogoHtml(product, product.name, catalogType);

    // Name
    html += `<h3 class="card-name">${product.name}</h3>`;

    // Description
    if (product.description && product.description.trim() !== '') {
        html += `<p class="card-description">${product.description}</p>`;
    } else {
        html += `<p class="card-description">Entrega rápida y garantía completa durante el tiempo contratado.</p>`;
    }

    // Large product mockup preview (especially for Doxeo & Seguidores sample search result)
    if (product.image && catalogType === 'doxeo') {
        const isPdf = product.image.endsWith('.pdf') && !product.image.includes(',');
        
        if (isPdf) {
            // PDF Preview Layout
            const pdfFile = product.image.startsWith('/') ? product.image : `/uploads/${product.image}`;
            html += `
                <div class="product-preview-mockup doxeo-mockup-card pdf-mockup-card" style="border-color: #ef4444 !important;" onclick="event.stopPropagation(); window.openProductImageModal('${pdfFile}', '${product.name}')">
                    <div class="preview-overlay">
                        <span class="preview-badge">📄 Ver Ejemplo PDF</span>
                    </div>
                    <div class="doxeo-card-split" style="height: 100%;">
                        <div class="doxeo-card-photo-frame" style="width: 80px; background: rgba(239, 68, 68, 0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; border-right: 1px solid rgba(255, 255, 255, 0.08); flex-shrink: 0;">
                            <span style="font-size: 2.2rem;">📄</span>
                            <span style="font-size: 0.65rem; color: #ef4444; font-weight: 700; margin-top: 4px; font-family: monospace;">PDF MUESTRA</span>
                        </div>
                        <div class="doxeo-card-terminal" style="display: flex; flex-direction: column; justify-content: center; padding: 15px; text-align: left;">
                            <span style="font-size: 0.95rem; font-weight: 800; color: #fff; margin-bottom: 4px; display: block; font-family: monospace;">DOCUMENTO OFICIAL</span>
                            <span style="font-size: 0.72rem; color: var(--text-secondary); display: block; line-height: 1.4;">Haz clic aquí para abrir y visualizar el reporte real de muestra en formato PDF.</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (product.image.includes(',')) {
            // Multiple Images (Double or Grid)
            const imgs = product.image.split(',').map(s => s.trim().startsWith('/') ? s.trim() : `/uploads/${s.trim()}`);
            if (imgs.length === 2) {
                // Double layout (e.g., C4 form)
                const getBadgeHtml = (imgUrl, direction) => {
                    const urlLower = imgUrl.toLowerCase();
                    const isBlue = urlLower.includes('azul') || urlLower.includes('blue');
                    const isWhite = urlLower.includes('blanco') || urlLower.includes('white') || urlLower.includes('electronico');
                    
                    if (isBlue) {
                        return `<span class="preview-badge" style="font-size: 0.62rem; font-weight: 700; padding: 4px 8px; border-radius: var(--radius-full); background: rgba(0, 100, 255, 0.85); color: #fff; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 2px 10px rgba(0,0,0,0.5);">💙 Zoom ${direction}</span>`;
                    } else if (isWhite) {
                        return `<span class="preview-badge" style="font-size: 0.62rem; font-weight: 700; padding: 4px 8px; border-radius: var(--radius-full); background: rgba(255, 255, 255, 0.9); color: #000; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 2px 10px rgba(0,0,0,0.5);">🤍 Zoom ${direction}</span>`;
                    }
                    
                    if (direction === 'Izq') {
                        return `<span class="preview-badge" style="font-size: 0.62rem; font-weight: 700; padding: 4px 8px; border-radius: var(--radius-full); background: rgba(0, 100, 255, 0.85); color: #fff; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 2px 10px rgba(0,0,0,0.5);">💙 Zoom Izq</span>`;
                    } else {
                        return `<span class="preview-badge" style="font-size: 0.62rem; font-weight: 700; padding: 4px 8px; border-radius: var(--radius-full); background: rgba(255, 255, 255, 0.9); color: #000; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 2px 10px rgba(0,0,0,0.5);">🤍 Zoom Der</span>`;
                    }
                };

                html += `
                    <div class="product-preview-mockup c4-double-preview" style="background: rgba(0, 0, 0, 0.4); padding: 8px; border-radius: var(--radius-md); border: 1px solid var(--border); margin: var(--spacing-sm) 0 var(--spacing-lg) 0; height: 180px; display: flex; gap: 8px; align-items: center; justify-content: center; position: relative; overflow: hidden; box-shadow: inset 0 0 15px rgba(0,0,0,0.6);">
                        <div class="c4-preview-item" style="flex: 1; height: 100%; position: relative; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer;" onclick="event.stopPropagation(); window.openProductImageModal('${imgs[0]}', '${product.name} - Formato 1')">
                            <div class="preview-overlay" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7, 7, 13, 0.1) 50%, rgba(7, 7, 13, 0.85) 100%); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; z-index: 2; opacity: 0.9; transition: all var(--transition-base);">
                                ${getBadgeHtml(imgs[0], 'Izq')}
                            </div>
                            <img src="${imgs[0]}" style="width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform var(--transition-slow);" alt="Muestra Izq">
                        </div>
                        <div class="c4-preview-item" style="flex: 1; height: 100%; position: relative; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer;" onclick="event.stopPropagation(); window.openProductImageModal('${imgs[1]}', '${product.name} - Formato 2')">
                            <div class="preview-overlay" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7, 7, 13, 0.1) 50%, rgba(7, 7, 13, 0.85) 100%); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; z-index: 2; opacity: 0.9; transition: all var(--transition-base);">
                                ${getBadgeHtml(imgs[1], 'Der')}
                            </div>
                            <img src="${imgs[1]}" style="width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform var(--transition-slow);" alt="Muestra Der">
                        </div>
                    </div>
                `;
            } else if (imgs.length === 3) {
                // Triple PDF / Document layout (e.g. Constancia de Estudios)
                const isAllPdf = imgs.every(f => f.toLowerCase().endsWith('.pdf'));
                if (isAllPdf) {
                    html += `
                        <div class="product-preview-mockup triple-pdf-preview" style="background: rgba(0, 0, 0, 0.4); padding: 10px; border-radius: var(--radius-md); border: 1px solid var(--border); margin: var(--spacing-sm) 0 var(--spacing-lg) 0; height: auto; display: flex; flex-direction: column; gap: 8px; box-shadow: inset 0 0 15px rgba(0,0,0,0.6);">
                            <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 2px; font-family: monospace; text-align: left; padding-left: 2px;">📑 MUESTRAS EN PDF (COPIAS ORIGINALES)</div>
                            <div class="triple-pdf-container" style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
                                <button class="btn-view-pdf" style="width: 100%; padding: 10px 14px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); color: #fff; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.78rem; cursor: pointer; transition: all var(--transition-base); display: flex; align-items: center; justify-content: space-between; text-align: left;" onclick="event.stopPropagation(); window.openProductImageModal('${imgs[0]}', '${product.name} - Inicial')">
                                    <span style="display: flex; align-items: center; gap: 8px;">👶 <strong style="color: #fff;">Nivel Inicial</strong> (PDF)</span> <span style="color: #ef4444; font-size: 0.75rem; font-weight: 800; background: rgba(239,68,68,0.1); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(239,68,68,0.2);">👁️ Ver</span>
                                </button>
                                <button class="btn-view-pdf" style="width: 100%; padding: 10px 14px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); color: #fff; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.78rem; cursor: pointer; transition: all var(--transition-base); display: flex; align-items: center; justify-content: space-between; text-align: left;" onclick="event.stopPropagation(); window.openProductImageModal('${imgs[1]}', '${product.name} - Primaria')">
                                    <span style="display: flex; align-items: center; gap: 8px;">👦 <strong style="color: #fff;">Nivel Primaria</strong> (PDF)</span> <span style="color: #ef4444; font-size: 0.75rem; font-weight: 800; background: rgba(239,68,68,0.1); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(239,68,68,0.2);">👁️ Ver</span>
                                </button>
                                <button class="btn-view-pdf" style="width: 100%; padding: 10px 14px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); color: #fff; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.78rem; cursor: pointer; transition: all var(--transition-base); display: flex; align-items: center; justify-content: space-between; text-align: left;" onclick="event.stopPropagation(); window.openProductImageModal('${imgs[2]}', '${product.name} - Secundaria')">
                                    <span style="display: flex; align-items: center; gap: 8px;">🧑 <strong style="color: #fff;">Nivel Secundaria</strong> (PDF)</span> <span style="color: #ef4444; font-size: 0.75rem; font-weight: 800; background: rgba(239,68,68,0.1); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(239,68,68,0.2);">👁️ Ver</span>
                                </button>
                            </div>
                        </div>
                    `;
                } else {
                    // Standard 3-image grid layout
                    html += `
                        <div class="product-preview-mockup triple-image-preview" style="background: rgba(0, 0, 0, 0.4); padding: 8px; border-radius: var(--radius-md); border: 1px solid var(--border); margin: var(--spacing-sm) 0 var(--spacing-lg) 0; height: 120px; display: flex; gap: 6px; align-items: center; justify-content: center; position: relative; overflow: hidden; box-shadow: inset 0 0 15px rgba(0,0,0,0.6);">
                            ${imgs.map((img, i) => `
                                <div class="triple-preview-item" style="flex: 1; height: 100%; position: relative; border-radius: 4px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer;" onclick="event.stopPropagation(); window.openProductImageModal('${img}', '${product.name} - Muestra ${i+1}')">
                                    <div class="preview-overlay" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7, 7, 13, 0.05) 60%, rgba(7, 7, 13, 0.8) 100%); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; z-index: 2; opacity: 0.85; transition: all var(--transition-base);">
                                        <span class="preview-badge" style="font-size: 0.55rem; padding: 2px 6px; border-radius: var(--radius-full); background: rgba(0,0,0,0.7); color: #fff; border: 1px solid rgba(255,255,255,0.05);">🔎 Ver</span>
                                    </div>
                                    <img src="${img}" style="width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform var(--transition-slow);" alt="Muestra ${i+1}">
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
            } else if (imgs.length >= 4) {
                // Grid 2x2 layout (e.g. Doxeo Completo)
                const gridPdf = imgs.find(f => f.endsWith('.pdf')) || '';
                html += `
                    <div class="product-preview-mockup doxeo-completo-preview" style="background: rgba(0, 0, 0, 0.4); padding: 8px; border-radius: var(--radius-md); border: 1px solid var(--border); margin: var(--spacing-sm) 0 var(--spacing-lg) 0; height: auto; display: flex; flex-direction: column; gap: 8px; position: relative; overflow: hidden; box-shadow: inset 0 0 15px rgba(0,0,0,0.6);">
                        <div class="doxeo-completo-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; height: 160px; width: 100%;">
                            <div class="doxeo-completo-item" style="position: relative; border-radius: 4px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer;" onclick="event.stopPropagation(); window.openProductImageModal('${imgs[0]}', '${product.name} - Muestra 1')">
                                <div class="preview-overlay" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7, 7, 13, 0.05) 60%, rgba(7, 7, 13, 0.8) 100%); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; z-index: 2; opacity: 0.85; transition: all var(--transition-base);">
                                    <span class="preview-badge" style="font-size: 0.55rem; padding: 2px 6px; border-radius: var(--radius-full); background: rgba(0,0,0,0.7); color: #fff; border: 1px solid rgba(255,255,255,0.05);">🔎 Foto 1</span>
                                </div>
                                <img src="${imgs[0]}" style="width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform var(--transition-slow);" alt="Muestra 1">
                            </div>
                            <div class="doxeo-completo-item" style="position: relative; border-radius: 4px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer;" onclick="event.stopPropagation(); window.openProductImageModal('${imgs[1]}', '${product.name} - Muestra 2')">
                                <div class="preview-overlay" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7, 7, 13, 0.05) 60%, rgba(7, 7, 13, 0.8) 100%); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; z-index: 2; opacity: 0.85; transition: all var(--transition-base);">
                                    <span class="preview-badge" style="font-size: 0.55rem; padding: 2px 6px; border-radius: var(--radius-full); background: rgba(0,0,0,0.7); color: #fff; border: 1px solid rgba(255,255,255,0.05);">🔎 Foto 2</span>
                                </div>
                                <img src="${imgs[1]}" style="width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform var(--transition-slow);" alt="Muestra 2">
                            </div>
                            <div class="doxeo-completo-item" style="position: relative; border-radius: 4px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer;" onclick="event.stopPropagation(); window.openProductImageModal('${imgs[2]}', '${product.name} - Muestra 3')">
                                <div class="preview-overlay" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7, 7, 13, 0.05) 60%, rgba(7, 7, 13, 0.8) 100%); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; z-index: 2; opacity: 0.85; transition: all var(--transition-base);">
                                    <span class="preview-badge" style="font-size: 0.55rem; padding: 2px 6px; border-radius: var(--radius-full); background: rgba(0,0,0,0.7); color: #fff; border: 1px solid rgba(255,255,255,0.05);">🔎 Foto 3</span>
                                </div>
                                <img src="${imgs[2]}" style="width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform var(--transition-slow);" alt="Muestra 3">
                            </div>
                            <div class="doxeo-completo-item" style="position: relative; border-radius: 4px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer;" onclick="event.stopPropagation(); window.openProductImageModal('${imgs[3]}', '${product.name} - Muestra 4')">
                                <div class="preview-overlay" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7, 7, 13, 0.05) 60%, rgba(7, 7, 13, 0.8) 100%); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; z-index: 2; opacity: 0.85; transition: all var(--transition-base);">
                                    <span class="preview-badge" style="font-size: 0.55rem; padding: 2px 6px; border-radius: var(--radius-full); background: rgba(0,0,0,0.7); color: #fff; border: 1px solid rgba(255,255,255,0.05);">🔎 Foto 4</span>
                                </div>
                                <img src="${imgs[3]}" style="width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform var(--transition-slow);" alt="Muestra 4">
                            </div>
                        </div>
                        ${gridPdf ? `
                            <button class="btn-view-pdf" style="width: 100%; padding: 10px 12px; background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #ef4444; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: all var(--transition-base); display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="event.stopPropagation(); window.openProductImageModal('${gridPdf}', '${product.name} - Reporte Muestra')">
                                📄 Ver Reporte Muestra Completo (PDF)
                            </button>
                        ` : ''}
                    </div>
                `;
            }
        } else if (product.description && (product.description.includes('pre class="example-box"') || product.description.includes('doxeo-terminal-text-mini') || product.description.includes('doxeo-card-terminal') || product.name.includes('Consulta') || product.name.includes('EXPERIAN'))) {
            // Split Terminal Layout (Photo on left, terminal preview on right)
            const imgSrc = product.image.startsWith('/') ? product.image : `/uploads/${product.image}`;
            const isExperian = product.name.toLowerCase().includes('experian') || product.name.toLowerCase().includes('financiero');
            const borderCol = isExperian ? '#10b981' : '#00f2fe';
            const textCol = isExperian ? '#38bdf8' : '#00ff66';
            const labelText = isExperian ? 'CALIFICACIÓN' : 'FOTO DNI';
            
            html += `
                <div class="product-preview-mockup doxeo-mockup-card" style="border-color: ${borderCol} !important;" onclick="event.stopPropagation(); window.openProductImageModal('${imgSrc}', '${product.name}', ${isExperian})">
                    <div class="preview-overlay">
                        <span class="preview-badge">👁️ Ver Ejemplo (Zoom)</span>
                    </div>
                    <div class="doxeo-card-split">
                        <div class="doxeo-card-photo-frame" ${isExperian ? 'style="width: 120px; background: rgba(16, 185, 129, 0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; text-align: center; border-right: 1px solid rgba(255, 255, 255, 0.08);"' : ''}>
                            <div class="doxeo-photo-label" ${isExperian ? 'style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: none; width: 100%; margin-bottom: 8px;"' : ''}>${labelText}</div>
                            ${isExperian ? `
                                <div style="font-size: 2.2rem; margin: 4px 0;">🟢</div>
                                <div style="font-size: 0.95rem; font-weight: 800; color: #10b981; font-family: monospace;">NORMAL</div>
                                <div style="font-size: 0.65rem; color: var(--text-secondary); margin-top: 4px;">Score: <strong style="color: #fff;">845</strong></div>
                            ` : `<img src="${imgSrc}" class="doxeo-card-photo" alt="Muestra">`}
                        </div>
                        <div class="doxeo-card-terminal">
                            ${isExperian ? `
                                <pre class="doxeo-terminal-text-mini" style="color: ${textCol};">➣ REPORTE FINANCIERO\n \nTITULAR ➟ BOLUARTE ZEGARRA DINA ERCILIA\nDNI ➟ 06256217\nSCORE ➟ 845 / 1000\nRIESGO ➟ BAJO (VERDE)\nDEUDAS SBS ➟ S/ 0.00\nMORAS ➟ NINGUNA (S/ 0.00)</pre>
                            ` : `
                                <pre class="doxeo-terminal-text-mini">➣ RENIEC\n\nDNI ➟ 06256217 - 5\nNOMBRE ➟ DINA ERCILIA\nAPELLIDO PATERNO ➟ BOLUARTE\nAPELLIDO MATERNO ➟  ZEGARRA\nSEXO ➟  FEMENINO\n\n[📅] NACIMIENTO\n\nFECHA DE NACIMIENTO ➟ 31/05/1962\nDEPARTAMENTO ➟ APURIMAC...</pre>
                            `}
                        </div>
                    </div>
                </div>
            `;
        } else if (product.image) {
            // Standard single image zoom layout
            const imgSrc = product.image.startsWith('/') ? product.image : `/uploads/${product.image}`;
            html += `
                <div class="product-preview-mockup" onclick="event.stopPropagation(); window.openProductImageModal('${imgSrc}', '${product.name}')">
                    <div class="preview-overlay">
                        <span class="preview-badge">👁️ Ver Ejemplo (Zoom)</span>
                    </div>
                    <img src="${imgSrc}" class="preview-img" alt="Muestra de ${product.name}">
                </div>
            `;
        }
    }

    // Card footer wrap to push bottom elements down
    html += '<div class="card-footer-wrap" style="margin-top: auto; display: flex; flex-direction: column;">';

    // Plan Selection (Dropdown for many, or just single if only 1 plan)
    if (plans.length > 1) {
        html += '<div class="custom-select-wrapper" style="margin-bottom: var(--spacing-lg); position: relative;">';
        html += '<select class="duration-select" style="width: 100%; padding: 12px 16px; background: rgba(12, 16, 30, 0.9); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); font-family: var(--font-main); font-size: 0.9rem; font-weight: 600; cursor: pointer; outline: none; appearance: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">';
        plans.forEach((plan, index) => {
            html += `<option value="${index}" data-plan-id="${plan.id}" data-price="${plan.price}" data-duration="${plan.duration}">${plan.duration}</option>`;
        });
        html += '</select>';
        // Custom arrow icon
        html += '<div style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-secondary);">▼</div>';
        html += '</div>';
    } else if (plans.length === 1) {
        html += `<div style="margin-bottom: var(--spacing-lg); text-align: center; color: var(--text-secondary); font-size: 0.9rem;">${plans[0].duration}</div>`;
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
            const whatsappLink = buildWhatsAppLink(settings, product.name, defaultPlan.duration, defaultPlan.price, catalogType);
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

    html += '</div>'; // End of card footer wrap

    card.innerHTML = html;

    // --- Event Listeners ---

    // Dropdown change event
    const durationSelect = card.querySelector('.duration-select');
    const priceAmount = card.querySelector('.price-amount');
    const priceDuration = card.querySelector('.price-duration');
    const buyBtn = card.querySelector('.btn-buy');

    if (durationSelect) {
        durationSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const price = selectedOption.dataset.price;
            const duration = selectedOption.dataset.duration;

            if (priceAmount) {
                priceAmount.innerHTML = `<span class="price-currency">${currencySymbol}</span>${price}`;
            }
            if (priceDuration) {
                priceDuration.textContent = duration;
            }

            // Update buy button link
            if (buyBtn && buyBtn.tagName === 'A') {
                buyBtn.href = buildWhatsAppLink(settings, product.name, duration, price, catalogType);
            }
        });
    }

    return card;
};

/**
 * Renders the full catalog from categories data.
 */
const renderCatalog = (categories, settings, catalogType = 'streaming') => {
    let targetId = 'catalog';
    if (catalogType === 'doxeo') targetId = 'doxeoCatalog';
    if (catalogType === 'seguidores') targetId = 'seguidoresCatalog';

    const catalog = document.getElementById(targetId);
    if (!catalog) return;
    catalog.innerHTML = ''; // Clear prior content

    // Filter categories by type
    const filteredCategories = categories.filter(cat => {
        const type = cat.type || 'streaming';
        return type === catalogType;
    });

    // Sort categories by sort_order
    const sorted = [...filteredCategories].sort((a, b) => a.sort_order - b.sort_order);

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
            const card = createProductCard(product, settings, catalogType);
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
const renderNavigation = (categories, catalogType = 'streaming') => {
    let scrollId = 'navScroll';
    if (catalogType === 'doxeo') scrollId = 'doxeoNavScroll';
    if (catalogType === 'seguidores') scrollId = 'seguidoresNavScroll';

    const navScroll = document.getElementById(scrollId);
    if (!navScroll) return;
    navScroll.innerHTML = ''; // Clear prior content

    // Filter categories by type
    const filteredCategories = categories.filter(cat => {
        const type = cat.type || 'streaming';
        return type === catalogType;
    });

    const sorted = [...filteredCategories].sort((a, b) => a.sort_order - b.sort_order);

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
            navScroll.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));
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
const setupSearch = (catalogType = 'streaming') => {
    let searchId = 'platformSearch';
    let navId = 'categoryNav';
    let catalogId = 'catalog';
    if (catalogType === 'doxeo') {
        searchId = 'doxeoSearch';
        navId = 'doxeoCategoryNav';
        catalogId = 'doxeoCatalog';
    } else if (catalogType === 'seguidores') {
        searchId = 'seguidoresSearch';
        navId = 'seguidoresCategoryNav';
        catalogId = 'seguidoresCatalog';
    }

    const searchInput = document.getElementById(searchId);
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const catalogContainer = document.getElementById(catalogId);
        if (!catalogContainer) return;

        const sections = catalogContainer.querySelectorAll('.catalog-section');

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
        const categoryNav = document.getElementById(navId);
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
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    };

    btn.addEventListener('click', openModal);
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtnFooter) closeBtnFooter.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
};

/**
 * Sets up Product Image preview modal open/close functionality.
 */
const setupProductImageModal = () => {
    const modal = document.getElementById('productImageModal');
    const closeBtn = document.getElementById('closeProductImageModal');
    const closeBtnFooter = document.getElementById('closeProductImageModalBtn');
    const modalImg = document.getElementById('productImageModalImg');
    const modalTitle = document.getElementById('productImageModalTitle');
    const modalIframe = document.getElementById('productImageModalIframe');

    if (!modal) return;

    window.openProductImageModal = (imgSrc, productName) => {
        const customDiv = document.getElementById('productImageModalCustom');
        
        // Remove any existing pdf link
        const existingLink = document.getElementById('pdfFullOpenLink');
        if (existingLink) existingLink.remove();

        const isPdf = imgSrc.endsWith('.pdf');

        if (isPdf) {
            if (modalImg) modalImg.style.display = 'none';
            if (customDiv) customDiv.style.display = 'none';
            if (modalIframe) {
                modalIframe.style.display = 'block';
                modalIframe.src = imgSrc;
            }
            if (modalTitle) {
                modalTitle.textContent = `Documento Muestra: ${productName}`;
                
                // Add "🔗 Abrir completo" button next to the title
                const link = document.createElement('a');
                link.id = 'pdfFullOpenLink';
                link.href = imgSrc;
                link.target = '_blank';
                link.rel = 'noopener';
                link.innerHTML = '🔗 Abrir completo';
                link.style.cssText = 'font-size: 0.8rem; background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #ef4444; padding: 4px 10px; border-radius: 6px; text-decoration: none; margin-left: 12px; font-weight: 700; transition: all 0.2s ease; display: inline-block; vertical-align: middle;';
                
                link.onmouseover = () => {
                    link.style.background = '#ef4444';
                    link.style.color = '#fff';
                };
                link.onmouseout = () => {
                    link.style.background = 'rgba(239, 68, 68, 0.15)';
                    link.style.color = '#ef4444';
                };
                modalTitle.parentElement.appendChild(link);
            }
        } else if (productName === 'Consulta Basica') {
            if (modalIframe) {
                modalIframe.style.display = 'none';
                modalIframe.src = '';
            }
            if (modalImg) modalImg.style.display = 'none';
            if (customDiv) {
                customDiv.style.display = 'block';
                customDiv.innerHTML = `
                    <div class="modal-doxeo-layout">
                        <div class="doxeo-modal-photo-col">
                            <div class="doxeo-photo-header">
                                <span class="doxeo-radar-dot"></span> REGISTRO FOTOGRÁFICO RENIEC
                            </div>
                            <div class="doxeo-photo-container">
                                <img src="${imgSrc}" class="doxeo-photo-img" alt="Foto de Identidad">
                                <div class="doxeo-photo-overlay-grid"></div>
                                <div class="doxeo-scan-bar"></div>
                            </div>
                            <div class="doxeo-photo-footer">
                                <span>DNI CONSULTADO</span>
                                <strong class="doxeo-id-highlight">06256217 - 5</strong>
                            </div>
                        </div>
                        <div class="doxeo-modal-text-col">
                            <div class="doxeo-terminal-header">
                                <div class="terminal-dots">
                                    <span class="dot red"></span>
                                    <span class="dot yellow"></span>
                                    <span class="dot green"></span>
                                </div>
                                <span class="terminal-title">🪪 Consulta RENIEC</span>
                                <button class="btn-copy-terminal" id="btnCopyTerminal" onclick="window.copyDoxeoTerminalText(event)">
                                    <span class="copy-icon">📋</span> Copiar
                                </button>
                            </div>
                            <div class="doxeo-terminal-body">
                                <pre id="doxeoTerminalPre" class="doxeo-terminal-pre">${RENIEC_PREMIUM_TEXT}</pre>
                            </div>
                        </div>
                    </div>
                `;
            }
            if (modalTitle) modalTitle.textContent = `Resultado Muestra: ${productName}`;
        } else if (productName === 'REPORTE FINANCIERO EXPERIAN (INFOCORP)') {
            if (modalIframe) {
                modalIframe.style.display = 'none';
                modalIframe.src = '';
            }
            if (modalImg) modalImg.style.display = 'none';
            if (customDiv) {
                customDiv.style.display = 'block';
                customDiv.innerHTML = `
                    <div class="modal-doxeo-layout">
                        <div class="doxeo-modal-photo-col" style="width: 280px; background: rgba(16, 185, 129, 0.02); border-color: rgba(16, 185, 129, 0.2); flex-shrink: 0;">
                            <div class="doxeo-photo-header">
                                <span class="doxeo-radar-dot" style="background: #10b981; box-shadow: 0 0 8px #10b981;"></span> INDICADORES EXPERIAN
                            </div>
                            
                            <!-- Financial Gauge Visual -->
                            <div style="background: rgba(0, 0, 0, 0.4); border-radius: var(--radius-md); padding: 15px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.05); margin-top: 10px;">
                                <div style="font-size: 0.72rem; color: var(--text-secondary); margin-bottom: 8px; font-weight: 700; letter-spacing: 0.05em;">HISTORIAL CREDITICIO</div>
                                
                                <div style="position: relative; width: 140px; height: 75px; margin: 0 auto 10px auto; overflow: hidden;">
                                    <div style="position: absolute; width: 140px; height: 140px; border-radius: 50%; border: 12px solid rgba(255, 255, 255, 0.05); border-bottom-color: #10b981; border-left-color: #10b981; transform: rotate(45deg); box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);"></div>
                                    <div style="position: absolute; top: 38px; left: 0; right: 0; text-align: center;">
                                        <span style="font-size: 1.6rem; font-weight: 900; color: #fff; font-family: monospace;">845</span>
                                        <div style="font-size: 0.55rem; color: var(--text-secondary); font-weight: 600; margin-top: -2px;">EXCELENTE</div>
                                    </div>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; font-size: 0.62rem; color: var(--text-secondary); font-family: monospace; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 8px;">
                                    <span>Rango: 0 - 1000</span>
                                    <span style="color: #10b981; font-weight: bold;">Riesgo: 1.8%</span>
                                </div>
                            </div>

                            <!-- Financial Status Indicators -->
                            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
                                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 10px; display: flex; align-items: center; gap: 10px;">
                                    <span style="font-size: 1.25rem;">✅</span>
                                    <div style="text-align: left;">
                                        <div style="font-size: 0.72rem; font-weight: 700; color: #fff;">Calificación SBS</div>
                                        <div style="font-size: 0.65rem; color: #10b981; font-weight: 600;">100% Normal</div>
                                    </div>
                                </div>
                                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 10px; display: flex; align-items: center; gap: 10px;">
                                    <span style="font-size: 1.25rem;">🛡️</span>
                                    <div style="text-align: left;">
                                        <div style="font-size: 0.72rem; font-weight: 700; color: #fff;">Deudas Infocorp</div>
                                        <div style="font-size: 0.65rem; color: #10b981; font-weight: 600;">Sin Reportes (S/ 0)</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="doxeo-modal-text-col">
                            <div class="doxeo-terminal-header">
                                <div class="terminal-dots">
                                    <span class="dot red"></span>
                                    <span class="dot yellow"></span>
                                    <span class="dot green"></span>
                                </div>
                                <span class="terminal-title">💳 Reporte Experian (Infocorp)</span>
                                <button class="btn-copy-terminal" id="btnCopyTerminal" onclick="window.copyDoxeoTerminalText(event)">
                                    <span class="copy-icon">📋</span> Copiar
                                </button>
                            </div>
                            <div class="doxeo-terminal-body">
                                <pre id="doxeoTerminalPre" class="doxeo-terminal-pre" style="color: #38bdf8;">${EXPERIAN_PREMIUM_TEXT}</pre>
                            </div>
                        </div>
                    </div>
                `;
            }
            if (modalTitle) modalTitle.textContent = `Resultado Muestra: ${productName}`;
        } else {
            if (modalIframe) {
                modalIframe.style.display = 'none';
                modalIframe.src = '';
            }
            if (customDiv) customDiv.style.display = 'none';
            if (modalImg) {
                modalImg.style.display = 'block';
                modalImg.src = imgSrc;
            }
            if (modalTitle) modalTitle.textContent = `Muestra: ${productName}`;
        }
        
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            if (modalIframe) {
                modalIframe.src = '';
                modalIframe.style.display = 'none';
            }
            const existingLink = document.getElementById('pdfFullOpenLink');
            if (existingLink) existingLink.remove();
        }, 300);
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtnFooter) closeBtnFooter.addEventListener('click', closeModal);

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
    const doxeoSpinner = document.getElementById('doxeoLoadingSpinner');
    const seguidoresSpinner = document.getElementById('seguidoresLoadingSpinner');

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
        
        let settings = {};
        if (settingsRes.ok) {
            settings = await settingsRes.json();
        }

        // Global whatsapp fallback
        const whatsappNumber = settings.whatsapp_number_streaming || settings.whatsapp_number || '639631207428';

        // Hide loading spinners
        if (spinner) spinner.classList.add('hidden');
        if (doxeoSpinner) doxeoSpinner.classList.add('hidden');
        if (seguidoresSpinner) seguidoresSpinner.classList.add('hidden');

        // Set up WhatsApp float and footer link
        const whatsappFloat = document.getElementById('whatsappFloat');
        if (whatsappFloat) {
            whatsappFloat.href = `https://wa.me/${whatsappNumber}?text=Hola%20Fyis!%20Vengo%20de%20tu%20Catálogo...`;
        }

        const footerWhatsApp = document.getElementById('footerWhatsApp');
        if (footerWhatsApp) {
            footerWhatsApp.href = `https://wa.me/${whatsappNumber}?text=Hola%20Fyis!%20Vengo%20de%20tu%20Catálogo...`;
        }

        // Render contents for all three catalogs dynamically passing catalogType
        renderNavigation(categories, 'streaming');
        renderCatalog(categories, settings, 'streaming');

        renderNavigation(categories, 'doxeo');
        renderCatalog(categories, settings, 'doxeo');

        renderNavigation(categories, 'seguidores');
        renderCatalog(categories, settings, 'seguidores');

        // Set up interactions
        setupMainTabs();
        setupSearch('streaming');
        setupSearch('doxeo');
        setupSearch('seguidores');
        setupNavHighlighting();
        setupScrollAnimations();
        setupNetflixModal();
        setupProductImageModal();

    } catch (error) {
        console.error('Fyis Catálogo init error:', error);
        showError(error.message || 'No se pudo conectar con el servidor.');
    }
};

// --- Boot ---
document.addEventListener('DOMContentLoaded', init);
