/* ============================================
   Fyis Catálogo Admin Panel — JavaScript
   ============================================ */

(function () {
    'use strict';

    /* ------------------------------------------
       State
    ------------------------------------------ */
    const state = {
        categories: [],
        settings: {},
        currentSection: 'dashboard',
        activeCatalog: '', // Selected catalog post-login ('streaming', 'doxeo', 'seguidores')
        filterCatalogCategory: '',
    };

    /* ------------------------------------------
       DOM References
    ------------------------------------------ */
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const dom = {
        loginScreen: $('#loginScreen'),
        loginForm: $('#loginForm'),
        loginPassword: $('#loginPassword'),
        loginError: $('#loginError'),
        loginBtn: $('#loginBtn'),
        portalSelector: $('#portalSelector'),
        adminPanel: $('#adminPanel'),
        logoutBtn: $('#logoutBtn'),
        hamburgerBtn: $('#hamburgerBtn'),
        sidebar: $('#adminSidebar'),
        navItems: $$('.nav-item'),
        statsGrid: $('#statsGrid'),
        categoriesBody: $('#catalogCategoriesBody'),
        productsBody: $('#catalogProductsBody'),
        filterCategory: $('#catalogFilterCategory'),
        catalogAddCategoryBtn: $('#catalogAddCategoryBtn'),
        catalogAddProductBtn: $('#catalogAddProductBtn'),
        saveSettingsBtn: $('#saveSettingsBtn'),
        changePasswordBtn: $('#changePasswordBtn'),
        settingBusinessName: $('#settingBusinessName'),
        settingWhatsapp: $('#settingWhatsapp'),
        settingCurrency: $('#settingCurrency'),
        settingWhatsappTemplate: $('#settingWhatsappTemplate'),
        settingDoxeoTokenGroup: $('#settingDoxeoTokenGroup'),
        settingDoxeoToken: $('#settingDoxeoToken'),
        currentPassword: $('#currentPassword'),
        newPassword: $('#newPassword'),
        modalOverlay: $('#modalOverlay'),
        modal: $('#modal'),
        modalTitle: $('#modalTitle'),
        modalBody: $('#modalBody'),
        modalFooter: $('#modalFooter'),
        modalClose: $('#modalClose'),
        toastContainer: $('#toastContainer'),
    };

    /* ------------------------------------------
       API Helper
    ------------------------------------------ */
    async function api(url, options = {}) {
        const defaults = {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
        };

        if (options.body instanceof FormData) {
            const merged = { ...defaults, ...options };
            delete merged.headers['Content-Type'];
            const res = await fetch(url, merged);
            if (res.status === 401) {
                showLogin();
                throw new Error('No autorizado');
            }
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
                throw new Error(err.error || `Error ${res.status}`);
            }
            return res.json();
        }

        const merged = {
            ...defaults,
            ...options,
            headers: { ...defaults.headers, ...(options.headers || {}) },
        };
        if (merged.body && typeof merged.body === 'object' && !(merged.body instanceof FormData)) {
            merged.body = JSON.stringify(merged.body);
        }

        const res = await fetch(url, merged);
        if (res.status === 401) {
            showLogin();
            throw new Error('No autorizado');
        }
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
            throw new Error(err.error || `Error ${res.status}`);
        }
        return res.json();
    }

    /* ------------------------------------------
       Toast System
    ------------------------------------------ */
    function showToast(message, type = 'info') {
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${escapeHTML(message)}</span>`;
        dom.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    }

    /* ------------------------------------------
       Modal System
    ------------------------------------------ */
    function openModal(title, bodyHTML, footerHTML = '') {
        dom.modalTitle.textContent = title;
        dom.modalBody.innerHTML = bodyHTML;
        dom.modalFooter.innerHTML = footerHTML;
        dom.modalOverlay.style.display = 'flex';
        dom.modalOverlay.classList.remove('closing');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        dom.modalOverlay.classList.add('closing');
        setTimeout(() => {
            dom.modalOverlay.style.display = 'none';
            dom.modalOverlay.classList.remove('closing');
            dom.modalBody.innerHTML = '';
            dom.modalFooter.innerHTML = '';
            document.body.style.overflow = '';
        }, 200);
    }

    dom.modalClose.addEventListener('click', closeModal);
    dom.modalOverlay.addEventListener('click', (e) => {
        if (e.target === dom.modalOverlay) closeModal();
    });

    /* ------------------------------------------
       Adaptive Terminology Helper
    ------------------------------------------ */
    function getPlanLabel(catalogType) {
        if (catalogType === 'doxeo') return 'Detalle / Consulta';
        if (catalogType === 'seguidores') return 'Cantidad / Paquete';
        return 'Duración';
    }

    function getPlanPlaceholder(catalogType) {
        if (catalogType === 'doxeo') return 'Ej: Consulta Básica, RUC, etc.';
        if (catalogType === 'seguidores') return 'Ej: 1000 Seguidores, 500 Likes';
        return 'Ej: 1 mes, 30 días, 12 horas';
    }

    function getCurrencySymbol() {
        return state.settings[`currency_symbol_${state.activeCatalog}`] || 'S/';
    }

    /* ------------------------------------------
       Auth Lifecycle & Portal Selection
    ------------------------------------------ */
    async function checkAuth() {
        try {
            await api('/api/admin/check');
            await loadData();
            showPortalSelector();
        } catch {
            showLogin();
        }
    }

    function showLogin() {
        dom.loginScreen.style.display = 'flex';
        if (dom.portalSelector) dom.portalSelector.style.display = 'none';
        dom.adminPanel.style.display = 'none';
        dom.loginPassword.value = '';
        dom.loginError.textContent = '';
    }

    function showPortalSelector() {
        dom.loginScreen.style.display = 'none';
        if (dom.portalSelector) dom.portalSelector.style.display = 'flex';
        dom.adminPanel.style.display = 'none';
        state.activeCatalog = '';
    }

    function showAdmin() {
        dom.loginScreen.style.display = 'none';
        if (dom.portalSelector) dom.portalSelector.style.display = 'none';
        dom.adminPanel.style.display = 'block';
    }

    // Attach click events to portal cards
    $$('.portal-card').forEach((card) => {
        card.addEventListener('click', () => {
            const catalog = card.dataset.portalCatalog;
            selectCatalogPanel(catalog);
        });
    });

    function selectCatalogPanel(catalog) {
        state.activeCatalog = catalog;
        
        // Show panel badge in header
        const activeCatalogName = catalog === 'streaming' ? '🎬 Streaming' 
                                : (catalog === 'doxeo' ? '🔍 Doxeo' : '👥 Seguidores');
        const badge = $('#headerPanelBadge');
        if (badge) {
            badge.textContent = activeCatalogName;
            
            // Dynamic badge color matching the catalog styling
            if (catalog === 'streaming') {
                badge.style.borderColor = '#7c3aed';
                badge.style.color = '#7c3aed';
            } else if (catalog === 'doxeo') {
                badge.style.borderColor = '#a8d0fc';
                badge.style.color = '#a8d0fc';
            } else {
                badge.style.borderColor = '#faabbd';
                badge.style.color = '#faabbd';
            }
        }

        // Update Products Table Header terminology based on activeCatalog
        const productsTableHeader = $('#productsTableHeader');
        if (productsTableHeader) {
            const label = getPlanLabel(catalog);
            productsTableHeader.innerHTML = `<th>Emoji</th><th>Nombre</th><th>Categoría</th><th>${label} (Planes)</th><th>Estado</th><th>Acciones</th>`;
        }

        showAdmin();
        switchSection('dashboard');
        showToast(`Ingresaste al ${activeCatalogName}`, 'success');
    }

    const btnBackToPortal = $('#btnBackToPortal');
    if (btnBackToPortal) {
        btnBackToPortal.addEventListener('click', () => {
            showPortalSelector();
            showToast('Regresaste al selector de paneles', 'info');
        });
    }

    dom.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        dom.loginError.textContent = '';
        dom.loginBtn.disabled = true;
        dom.loginBtn.textContent = 'Ingresando...';

        try {
            await api('/api/login', {
                method: 'POST',
                body: { password: dom.loginPassword.value },
            });
            await loadData();
            showPortalSelector();
            showToast('Sesión iniciada correctamente', 'success');
        } catch (err) {
            dom.loginError.textContent = err.message || 'Contraseña incorrecta';
        } finally {
            dom.loginBtn.disabled = false;
            dom.loginBtn.textContent = 'Ingresar';
        }
    });

    dom.logoutBtn.addEventListener('click', async () => {
        try {
            await api('/api/logout', { method: 'POST' });
        } catch {
            // Ignore logout errors
        }
        showLogin();
        showToast('Sesión cerrada', 'info');
    });

    /* ------------------------------------------
       Navigation
    ------------------------------------------ */
    dom.navItems.forEach((btn) => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            if (!section) return; // Skip back to portal button
            switchSection(section);
            // Close mobile sidebar
            dom.sidebar.classList.remove('open');
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) overlay.classList.remove('visible');
        });
    });

    function switchSection(section) {
        state.currentSection = section;
        dom.navItems.forEach((b) => {
            b.classList.toggle('active', b.dataset.section === section);
        });
        
        $$('.section').forEach((s) => (s.style.display = 'none'));
        const target = $(`#section-${section}`);
        if (target) target.style.display = 'block';

        if (section === 'dashboard') renderDashboard();
        if (section === 'categories') renderCatalogCategories();
        if (section === 'products') renderCatalogProducts();
        if (section === 'settings') renderSettings();
    }

    /* ------------------------------------------
       Hamburger / Mobile Sidebar
    ------------------------------------------ */
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);

    dom.hamburgerBtn.addEventListener('click', () => {
        dom.sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('visible', dom.sidebar.classList.contains('open'));
    });

    sidebarOverlay.addEventListener('click', () => {
        dom.sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('visible');
    });

    /* ------------------------------------------
       Load Data
    ------------------------------------------ */
    async function loadData() {
        try {
            const [categories, settings] = await Promise.all([
                api('/api/admin/categories'),
                api('/api/settings'),
            ]);
            state.categories = Array.isArray(categories) ? categories : [];
            state.settings = settings || {};
        } catch (err) {
            showToast('Error cargando datos: ' + err.message, 'error');
        }
    }

    function renderCurrentSection() {
        switchSection(state.currentSection);
    }

    /* ------------------------------------------
       Dashboard (Scoped to Active Catalog)
    ------------------------------------------ */
    function renderDashboard() {
        const filteredCats = state.categories.filter((c) => c.type === state.activeCatalog);
        const totalCategories = filteredCats.length;
        const allProducts = filteredCats.flatMap((c) => c.products || []);
        const totalProducts = allProducts.length;
        const totalPlans = allProducts.reduce((sum, p) => sum + (p.plans ? p.plans.length : 0), 0);
        const activeProducts = allProducts.filter((p) => p.active).length;

        const stats = [
            { icon: '📂', number: totalCategories, label: 'Categorías' },
            { icon: '📦', number: totalProducts, label: 'Productos' },
            { icon: '💰', number: totalPlans, label: 'Planes' },
            { icon: '✅', number: activeProducts, label: 'Activos' },
        ];

        dom.statsGrid.innerHTML = stats
            .map(
                (s) => `
            <div class="stat-card">
                <div class="stat-icon">${s.icon}</div>
                <div class="stat-number">${s.number}</div>
                <div class="stat-label">${s.label}</div>
            </div>`
            )
            .join('');
    }

    /* ------------------------------------------
       Categories Table Renderer & Operations
    ------------------------------------------ */
    function renderCatalogCategories() {
        const filteredCats = state.categories.filter((c) => c.type === state.activeCatalog);

        if (filteredCats.length === 0) {
            dom.categoriesBody.innerHTML = `<tr><td colspan="5" class="table-empty">No hay categorías en este catálogo. Crea una nueva.</td></tr>`;
            return;
        }

        dom.categoriesBody.innerHTML = filteredCats
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(
                (cat) => `
            <tr>
                <td>${cat.sort_order || 0}</td>
                <td style="font-size:1.4rem">${escapeHTML(cat.icon || '')}</td>
                <td><strong>${escapeHTML(cat.name)}</strong></td>
                <td>${(cat.products || []).length}</td>
                <td>
                     <div class="table-actions">
                          <button class="btn btn-outline btn-sm" onclick="AdminApp.editCategory(${cat.id})">✏️ Editar</button>
                          <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteCategory(${cat.id})">🗑️</button>
                     </div>
                </td>
            </tr>`
            )
            .join('');
    }

    function openCategoryModal(category = null) {
        const isEdit = category !== null;
        const title = isEdit ? 'Editar Categoría' : 'Nueva Categoría';

        const activeCatalogName = state.activeCatalog === 'streaming' ? '🎬 Streaming' 
                                : (state.activeCatalog === 'doxeo' ? '🔍 Doxeo' : '👥 Seguidores');

        const bodyHTML = `
            <div class="form-group">
                <label>Catálogo Destino</label>
                <div style="background: rgba(255,255,255,0.05); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); font-weight: 600; display: inline-flex; align-items: center; gap: 8px; color: #f0f0f5;">
                    ${activeCatalogName}
                </div>
            </div>
            <div class="form-group">
                <label>Nombre de la Categoría</label>
                <input type="text" class="form-input" id="catName" value="${isEdit ? escapeAttr(category.name) : ''}" placeholder="Ej: Herramientas IA">
            </div>
            <div class="form-group">
                <label>Icono (emoji)</label>
                <input type="text" class="form-input" id="catIcon" value="${isEdit ? escapeAttr(category.icon || '') : ''}" placeholder="Ej: 🧠">
            </div>
            <div class="form-group">
                <label>Orden de Visualización</label>
                <input type="number" class="form-input" id="catOrder" value="${isEdit ? category.sort_order || 0 : 0}" min="0">
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-outline" onclick="AdminApp.closeModal()">Cancelar</button>
            <button class="btn btn-primary" id="saveCategoryBtn">${isEdit ? 'Guardar Cambios' : 'Crear Categoría'}</button>
        `;

        openModal(title, bodyHTML, footerHTML);

        $('#saveCategoryBtn').addEventListener('click', async () => {
            const name = $('#catName').value.trim();
            const icon = $('#catIcon').value.trim();
            const sort_order = parseInt($('#catOrder').value) || 0;
            const type = state.activeCatalog;

            if (!name) {
                showToast('El nombre es obligatorio', 'error');
                return;
            }

            try {
                if (isEdit) {
                    await api(`/api/admin/categories/${category.id}`, {
                        method: 'PUT',
                        body: { name, icon, sort_order, type },
                    });
                    showToast('Categoría actualizada', 'success');
                } else {
                    await api('/api/admin/categories', {
                        method: 'POST',
                        body: { name, icon, sort_order, type },
                    });
                    showToast('Categoría creada', 'success');
                }
                closeModal();
                await loadData();
                renderCatalogCategories();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    function editCategory(id) {
        const cat = state.categories.find((c) => c.id === id);
        if (cat) openCategoryModal(cat);
    }

    async function deleteCategory(id) {
        const cat = state.categories.find((c) => c.id === id);
        if (!cat) return;

        openConfirmModal(
            'Eliminar Categoría',
            `¿Estás seguro de que quieres eliminar la categoría "<strong>${escapeHTML(cat.name)}</strong>"? Esta acción eliminará también todos sus productos y planes.`,
            async () => {
                try {
                    await api(`/api/admin/categories/${id}`, { method: 'DELETE' });
                    showToast('Categoría eliminada', 'success');
                    closeModal();
                    await loadData();
                    renderCatalogCategories();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            }
        );
    }

    if (dom.catalogAddCategoryBtn) {
        dom.catalogAddCategoryBtn.addEventListener('click', () => openCategoryModal());
    }

    /* ------------------------------------------
       Products Table Renderer & Operations
    ------------------------------------------ */
    function renderCatalogProducts() {
        const filterSelect = dom.filterCategory;
        const currentFilter = state.filterCatalogCategory;
        
        const activeCats = state.categories.filter((c) => c.type === state.activeCatalog);
        
        filterSelect.innerHTML = '<option value="">Todas las categorías</option>';
        activeCats.forEach((cat) => {
            filterSelect.innerHTML += `<option value="${cat.id}" ${String(cat.id) === currentFilter ? 'selected' : ''}>${escapeHTML(cat.icon || '')} ${escapeHTML(cat.name)}</option>`;
        });

        let allProducts = [];
        activeCats.forEach((cat) => {
            (cat.products || []).forEach((p) => {
                allProducts.push({ ...p, categoryName: cat.name, categoryIcon: cat.icon || '' });
            });
        });

        // Filter by category
        if (state.filterCatalogCategory) {
            allProducts = allProducts.filter((p) => String(p.category_id) === String(state.filterCatalogCategory));
        }

        if (allProducts.length === 0) {
            dom.productsBody.innerHTML = `<tr><td colspan="6" class="table-empty">No hay productos${state.filterCatalogCategory ? ' en esta categoría' : ''}.</td></tr>`;
            return;
        }

        dom.productsBody.innerHTML = allProducts
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(
                (p) => `
            <tr>
                <td style="font-size:1.4rem">${escapeHTML(p.emoji || '')}</td>
                <td>
                    <strong>${escapeHTML(p.name)}</strong>
                    ${p.highlight ? '<span class="badge badge-active" style="margin-left:6px">⭐</span>' : ''}
                </td>
                <td>${escapeHTML(p.categoryIcon)} ${escapeHTML(p.categoryName)}</td>
                <td>${(p.plans || []).length}</td>
                <td>
                    <span class="badge ${p.active ? 'badge-active' : 'badge-inactive'}">
                        ${p.active ? 'Activo' : 'Inactivo'}
                    </span>
                    ${p.out_of_stock ? '<span class="badge badge-inactive" style="background:#ef4444; color:white; border:none; margin-left:4px">Sin Stock</span>' : ''}
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-outline btn-sm" onclick="AdminApp.editProduct(${p.id})">✏️</button>
                        <button class="btn btn-outline btn-sm" onclick="AdminApp.managePlans(${p.id})">💰 Planes</button>
                        <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteProduct(${p.id})">🗑️</button>
                    </div>
                </td>
            </tr>`
            )
            .join('');
    }

    if (dom.filterCategory) {
        dom.filterCategory.addEventListener('change', (e) => {
            state.filterCatalogCategory = e.target.value;
            renderCatalogProducts();
        });
    }

    if (dom.catalogAddProductBtn) {
        dom.catalogAddProductBtn.addEventListener('click', () => openProductModal());
    }

    function openProductModal(product = null) {
        const isEdit = product !== null;
        const title = isEdit ? 'Editar Producto' : 'Nuevo Producto';

        const activeCats = state.categories.filter((c) => c.type === state.activeCatalog);
        
        if (activeCats.length === 0) {
            showToast('Primero debes crear al menos una categoría en este catálogo', 'error');
            return;
        }

        const categoriesOptions = activeCats
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(
                (c) => `<option value="${c.id}" ${isEdit && product.category_id === c.id ? 'selected' : ''}>${escapeHTML(c.icon || '')} ${escapeHTML(c.name)}</option>`
            )
            .join('');

        const bodyHTML = `
            <div class="form-group">
                <label>Categoría</label>
                <select class="form-input" id="prodCategory" style="cursor:pointer;">
                    ${categoriesOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Nombre del Producto</label>
                <input type="text" class="form-input" id="prodName" value="${isEdit ? escapeAttr(product.name) : ''}" placeholder="Ej: Netflix Premium">
            </div>
            <div class="form-group">
                <label>Emoji del Producto</label>
                <input type="text" class="form-input" id="prodEmoji" value="${isEdit ? escapeAttr(product.emoji || '') : ''}" placeholder="Ej: 🎬">
            </div>
            <div class="form-group">
                <label>Descripción</label>
                <textarea class="form-input" id="prodDescription" rows="3" placeholder="Descripción del producto...">${isEdit ? escapeHTML(product.description || '') : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Imagen o PDF Muestra (Subir archivo o pegar enlace URL)</label>
                <input type="text" class="form-input" id="prodImageUrl" value="${isEdit && product.image ? escapeAttr(product.image) : ''}" placeholder="Pega el enlace de la imagen/PDF o sube uno abajo..." style="margin-bottom: 8px;">
                <div class="image-upload-area" id="imageUploadArea">
                    <p>📷 Haz clic para subir una imagen o PDF</p>
                    <input type="file" id="prodImageFile" accept="image/*,.pdf" style="display:none;">
                </div>
                <div class="image-preview" id="imagePreview" style="${isEdit && product.image && !product.image.endsWith('.pdf') ? '' : 'display:none'}">
                    <img id="imagePreviewImg" src="${isEdit && product.image && !product.image.endsWith('.pdf') ? escapeAttr(product.image) : ''}" alt="Preview">
                </div>
                <div class="pdf-preview-box" id="pdfPreviewBox" style="${isEdit && product.image && product.image.endsWith('.pdf') ? 'display:flex' : 'display:none'}; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:15px; background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.15); border-radius:8px; margin-top:8px;">
                    <span style="font-size:2.5rem; margin-bottom:8px;">📄</span>
                    <strong id="pdfPreviewName" style="font-size:0.85rem; color:#fff; word-break:break-all;">${isEdit && product.image && product.image.endsWith('.pdf') ? escapeHTML(product.image.split('/').pop()) : 'documento.pdf'}</strong>
                </div>
            </div>
            <div class="form-group">
                <label>Orden de Visualización</label>
                <input type="number" class="form-input" id="prodOrder" value="${isEdit ? product.sort_order || 0 : 0}" min="0">
            </div>
            <div class="form-group">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prodHighlight" ${isEdit && product.highlight ? 'checked' : ''}>
                    <label for="prodHighlight">Destacar producto (⭐)</label>
                </div>
            </div>
            <div class="form-group">
                <div class="toggle-wrapper">
                    <label class="toggle">
                        <input type="checkbox" id="prodActive" ${isEdit ? (product.active ? 'checked' : '') : 'checked'}>
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label">Producto activo</span>
                </div>
            </div>
            <div class="form-group">
                <div class="toggle-wrapper">
                    <label class="toggle">
                        <input type="checkbox" id="prodOutOfStock" ${isEdit && product.out_of_stock ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label" style="color: #ef4444; font-weight: 600;">⚠️ Agotado / Sin Stock</span>
                </div>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-outline" onclick="AdminApp.closeModal()">Cancelar</button>
            <button class="btn btn-primary" id="saveProductBtn">${isEdit ? 'Guardar Cambios' : 'Crear Producto'}</button>
        `;

        openModal(title, bodyHTML, footerHTML);

        const uploadArea = $('#imageUploadArea');
        const fileInput = $('#prodImageFile');
        const previewDiv = $('#imagePreview');
        const previewImg = $('#imagePreviewImg');
        const imageUrlInput = $('#prodImageUrl');

        uploadArea.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

            if (isPdf) {
                previewDiv.style.display = 'none';
                const pdfBox = $('#pdfPreviewBox');
                const pdfName = $('#pdfPreviewName');
                if (pdfBox) pdfBox.style.display = 'flex';
                if (pdfName) pdfName.textContent = file.name;
            } else {
                const pdfBox = $('#pdfPreviewBox');
                if (pdfBox) pdfBox.style.display = 'none';
                
                const reader = new FileReader();
                reader.onload = (ev) => {
                    previewImg.src = ev.target.result;
                    previewDiv.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }

            try {
                const formData = new FormData();
                formData.append('image', file);
                const result = await api(`/api/admin/upload?catalog=${state.activeCatalog}`, {
                    method: 'POST',
                    body: formData,
                });
                imageUrlInput.value = result.url;
                if (!isPdf) {
                    previewImg.src = result.url;
                }
                showToast(`${isPdf ? 'PDF' : 'Imagen'} subido exitosamente al catálogo de ${state.activeCatalog}`, 'success');
            } catch (err) {
                showToast('Error subiendo archivo: ' + err.message, 'error');
            }
        });

        $('#saveProductBtn').addEventListener('click', async () => {
            const category_id = parseInt($('#prodCategory').value);
            const name = $('#prodName').value.trim();
            const emoji = $('#prodEmoji').value.trim();
            const description = $('#prodDescription').value.trim();
            const image = imageUrlInput.value;
            const sort_order = parseInt($('#prodOrder').value) || 0;
            const highlight = $('#prodHighlight').checked ? 1 : 0;
            const active = $('#prodActive').checked ? 1 : 0;
            const out_of_stock = $('#prodOutOfStock').checked;

            if (!category_id) {
                showToast('Selecciona una categoría', 'error');
                return;
            }
            if (!name) {
                showToast('El nombre es obligatorio', 'error');
                return;
            }

            const body = { category_id, name, emoji, description, image, highlight, sort_order, active, out_of_stock };

            try {
                if (isEdit) {
                    await api(`/api/admin/products/${product.id}`, { method: 'PUT', body });
                    showToast('Producto actualizado', 'success');
                } else {
                    await api('/api/admin/products', { method: 'POST', body });
                    showToast('Producto creado', 'success');
                }
                closeModal();
                await loadData();
                renderCatalogProducts();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    function findProduct(id) {
        for (const cat of state.categories) {
            for (const p of cat.products || []) {
                if (p.id === id) return p;
            }
        }
        return null;
    }

    function editProduct(id) {
        const product = findProduct(id);
        if (product) openProductModal(product);
    }

    async function deleteProduct(id) {
        const product = findProduct(id);
        if (!product) return;

        openConfirmModal(
            'Eliminar Producto',
            `¿Estás seguro de que quieres eliminar "<strong>${escapeHTML(product.name)}</strong>"? Se eliminarán también todos sus planes.`,
            async () => {
                try {
                    await api(`/api/admin/products/${id}`, { method: 'DELETE' });
                    showToast('Producto eliminado', 'success');
                    closeModal();
                    await loadData();
                    renderCatalogProducts();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            }
        );
    }

    /* ------------------------------------------
       Plans Management (Adaptive labels)
    ------------------------------------------ */
    function managePlans(productId) {
        const product = findProduct(productId);
        if (!product) return;

        const plans = product.plans || [];
        const planLabel = getPlanLabel(state.activeCatalog);
        const planPlaceholder = getPlanPlaceholder(state.activeCatalog);

        const renderPlansTable = () => {
            let tableHTML = '';
            if (plans.length > 0) {
                const currencySymbol = getCurrencySymbol();
                tableHTML = `
                    <table class="plans-mini-table">
                        <thead><tr><th>${planLabel}</th><th>Precio</th><th>Orden</th><th>Acciones</th></tr></thead>
                        <tbody>
                            ${plans
                                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                                .map(
                                    (plan) => `
                                <tr>
                                    <td>${escapeHTML(plan.duration)}</td>
                                    <td><strong>${currencySymbol}${parseFloat(plan.price).toFixed(2)}</strong></td>
                                    <td>${plan.sort_order || 0}</td>
                                    <td>
                                        <div class="table-actions">
                                            <button class="btn btn-outline btn-sm" data-edit-plan="${plan.id}">✏️</button>
                                            <button class="btn btn-danger btn-sm" data-delete-plan="${plan.id}">🗑️</button>
                                        </div>
                                    </td>
                                </tr>`
                                )
                                .join('')}
                        </tbody>
                    </table>
                `;
            } else {
                tableHTML = '<p class="text-muted text-center mb-4">No hay planes para este producto.</p>';
            }
            return tableHTML;
        };

        const renderModal = () => {
            const currencySymbol = getCurrencySymbol();
            const bodyHTML = `
                <div class="plans-section" style="border-top:none; padding-top:0; margin-top:0;">
                    <div id="plansTableArea">${renderPlansTable()}</div>
                    <h4 class="mt-4">Agregar Nuevo Plan</h4>
                    <div class="plan-form-inline">
                        <div class="form-group" style="margin-bottom:0">
                            <label>${planLabel}</label>
                            <input type="text" class="form-input" id="planDuration" placeholder="${planPlaceholder}">
                        </div>
                        <div class="form-group" style="margin-bottom:0">
                            <label>Precio (${currencySymbol})</label>
                            <input type="number" class="form-input" id="planPrice" placeholder="0.00" step="0.01" min="0">
                        </div>
                        <div class="form-group" style="margin-bottom:0">
                            <label>Orden</label>
                            <input type="number" class="form-input" id="planOrder" value="0" min="0" style="width:70px">
                        </div>
                        <button class="btn btn-success btn-sm" id="addPlanBtn" style="align-self:end; margin-bottom:1px;">+ Agregar</button>
                    </div>
                </div>
            `;

            const footerHTML = `<button class="btn btn-outline" onclick="AdminApp.closeModal()">Cerrar</button>`;

            openModal(`Planes — ${product.emoji || ''} ${product.name}`, bodyHTML, footerHTML);

            // Add plan
            $('#addPlanBtn').addEventListener('click', async () => {
                const duration = $('#planDuration').value.trim();
                const price = parseFloat($('#planPrice').value);
                const sort_order = parseInt($('#planOrder').value) || 0;

                if (!duration) {
                    showToast(`El valor de ${planLabel} es obligatorio`, 'error');
                    return;
                }
                if (isNaN(price) || price < 0) {
                    showToast('Ingresa un precio válido', 'error');
                    return;
                }

                try {
                    const created = await api(`/api/admin/products/${productId}/plans`, {
                        method: 'POST',
                        body: { price, duration, sort_order },
                    });
                    plans.push(created);
                    showToast('Plan creado', 'success');
                    closeModal();
                    await loadData();
                    managePlans(productId);
                } catch (err) {
                    showToast(err.message, 'error');
                }
            });

            // Edit plan buttons
            dom.modalBody.querySelectorAll('[data-edit-plan]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const planId = parseInt(btn.dataset.editPlan);
                    editPlan(planId, productId);
                });
            });

            // Delete plan buttons
            dom.modalBody.querySelectorAll('[data-delete-plan]').forEach((btn) => {
                btn.addEventListener('click', async () => {
                    const planId = parseInt(btn.dataset.deletePlan);
                    if (!confirm('¿Eliminar este plan?')) return;
                    try {
                        await api(`/api/admin/plans/${planId}`, { method: 'DELETE' });
                        showToast('Plan eliminado', 'success');
                        closeModal();
                        await loadData();
                        managePlans(productId);
                    } catch (err) {
                        showToast(err.message, 'error');
                    }
                });
            });
        };

        renderModal();
    }

    function editPlan(planId, productId) {
        const product = findProduct(productId);
        if (!product) return;
        const plan = (product.plans || []).find((p) => p.id === planId);
        if (!plan) return;

        const currencySymbol = getCurrencySymbol();
        const planLabel = getPlanLabel(state.activeCatalog);
        const bodyHTML = `
            <div class="form-group">
                <label>${planLabel}</label>
                <input type="text" class="form-input" id="editPlanDuration" value="${escapeAttr(plan.duration)}">
            </div>
            <div class="form-group">
                <label>Precio (${currencySymbol})</label>
                <input type="number" class="form-input" id="editPlanPrice" value="${plan.price}" step="0.01" min="0">
            </div>
            <div class="form-group">
                <label>Orden</label>
                <input type="number" class="form-input" id="editPlanOrder" value="${plan.sort_order || 0}" min="0">
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-outline" onclick="AdminApp.managePlans(${productId})">Cancelar</button>
            <button class="btn btn-primary" id="savePlanBtn">Guardar</button>
        `;

        openModal(`Editar Plan — ${plan.duration}`, bodyHTML, footerHTML);

        $('#savePlanBtn').addEventListener('click', async () => {
            const duration = $('#editPlanDuration').value.trim();
            const price = parseFloat($('#editPlanPrice').value);
            const sort_order = parseInt($('#editPlanOrder').value) || 0;

            if (!duration) {
                showToast(`El valor de ${planLabel} es obligatorio`, 'error');
                return;
            }
            if (isNaN(price) || price < 0) {
                showToast('Ingresa un precio válido', 'error');
                return;
            }

            try {
                await api(`/api/admin/plans/${planId}`, {
                    method: 'PUT',
                    body: { price, duration, sort_order },
                });
                showToast('Plan actualizado', 'success');
                closeModal();
                await loadData();
                managePlans(productId);
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    /* ------------------------------------------
       Settings (Catalog-specific keys saving)
    ------------------------------------------ */
    function renderSettings() {
        const cat = state.activeCatalog;
        dom.settingBusinessName.value = state.settings[`business_name_${cat}`] || '';
        dom.settingWhatsapp.value = state.settings[`whatsapp_number_${cat}`] || '';
        dom.settingCurrency.value = state.settings[`currency_symbol_${cat}`] || 'S/';
        dom.settingWhatsappTemplate.value = state.settings[`whatsapp_message_template_${cat}`] || '';
        
        if (cat === 'doxeo') {
            dom.settingDoxeoTokenGroup.style.display = 'block';
            dom.settingDoxeoToken.value = state.settings.doxeo_token || '';
        } else {
            dom.settingDoxeoTokenGroup.style.display = 'none';
            dom.settingDoxeoToken.value = '';
        }

        dom.currentPassword.value = '';
        dom.newPassword.value = '';
    }

    dom.saveSettingsBtn.addEventListener('click', async () => {
        const cat = state.activeCatalog;
        const business_name = dom.settingBusinessName.value.trim();
        const whatsapp_number = dom.settingWhatsapp.value.trim();
        const currency_symbol = dom.settingCurrency.value.trim() || 'S/';
        const whatsapp_message_template = dom.settingWhatsappTemplate.value.trim();

        if (!business_name) {
            showToast('El nombre del negocio es obligatorio', 'error');
            return;
        }

        const body = {};
        body[`business_name_${cat}`] = business_name;
        body[`whatsapp_number_${cat}`] = whatsapp_number;
        body[`currency_symbol_${cat}`] = currency_symbol;
        body[`whatsapp_message_template_${cat}`] = whatsapp_message_template;
        
        if (cat === 'doxeo') {
            const doxeo_token = dom.settingDoxeoToken.value.trim();
            body.doxeo_token = doxeo_token;
        }

        try {
            await api('/api/admin/settings', {
                method: 'PUT',
                body: body,
            });
            state.settings[`business_name_${cat}`] = business_name;
            state.settings[`whatsapp_number_${cat}`] = whatsapp_number;
            state.settings[`currency_symbol_${cat}`] = currency_symbol;
            state.settings[`whatsapp_message_template_${cat}`] = whatsapp_message_template;
            
            if (cat === 'doxeo') {
                state.settings.doxeo_token = body.doxeo_token;
            }

            showToast('Configuración guardada para este panel', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    dom.changePasswordBtn.addEventListener('click', async () => {
        const currentPassword = dom.currentPassword.value;
        const newPassword = dom.newPassword.value;

        if (!currentPassword || !newPassword) {
            showToast('Completa ambos campos de contraseña', 'error');
            return;
        }
        if (newPassword.length < 4) {
            showToast('La nueva contraseña debe tener al menos 4 caracteres', 'error');
            return;
        }

        try {
            await api('/api/admin/password', {
                method: 'PUT',
                body: { currentPassword, newPassword },
            });
            dom.currentPassword.value = '';
            dom.newPassword.value = '';
            showToast('Contraseña cambiada exitosamente', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    /* ------------------------------------------
       Confirm Modal
    ------------------------------------------ */
    function openConfirmModal(title, message, onConfirm) {
        const bodyHTML = `<p>${message}</p>`;
        const footerHTML = `
            <button class="btn btn-outline" onclick="AdminApp.closeModal()">Cancelar</button>
            <button class="btn btn-danger" id="confirmActionBtn">Eliminar</button>
        `;

        openModal(title, bodyHTML, footerHTML);

        $('#confirmActionBtn').addEventListener('click', onConfirm);
    }

    /* ------------------------------------------
       Utility Functions
    ------------------------------------------ */
    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /* ------------------------------------------
       Keyboard Shortcuts
    ------------------------------------------ */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (dom.modalOverlay.style.display !== 'none') {
                closeModal();
            }
        }
    });

    /* ------------------------------------------
       Public API (for inline onclick handlers)
    ------------------------------------------ */
    window.AdminApp = {
        editCategory,
        deleteCategory,
        editProduct,
        deleteProduct,
        managePlans,
        closeModal,
    };

    /* ------------------------------------------
       Init
    ------------------------------------------ */
    checkAuth();
})();
