/* ============================================
   StreamZone Admin Panel — JavaScript
   ============================================ */

(function () {
    'use strict';

    /* ------------------------------------------
       State
    ------------------------------------------ */
    const state = {
        categories: [],
        settings: { business_name: '', whatsapp_number: '' },
        currentSection: 'dashboard',
        filterCategory: '',
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
        adminPanel: $('#adminPanel'),
        logoutBtn: $('#logoutBtn'),
        hamburgerBtn: $('#hamburgerBtn'),
        sidebar: $('#adminSidebar'),
        navItems: $$('.nav-item'),
        statsGrid: $('#statsGrid'),
        categoriesBody: $('#categoriesBody'),
        productsBody: $('#productsBody'),
        filterCategory: $('#filterCategory'),
        addCategoryBtn: $('#addCategoryBtn'),
        addProductBtn: $('#addProductBtn'),
        saveSettingsBtn: $('#saveSettingsBtn'),
        changePasswordBtn: $('#changePasswordBtn'),
        settingBusinessName: $('#settingBusinessName'),
        settingWhatsapp: $('#settingWhatsapp'),
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
       Auth
    ------------------------------------------ */
    async function checkAuth() {
        try {
            await api('/api/admin/check');
            showAdmin();
            await loadData();
        } catch {
            showLogin();
        }
    }

    function showLogin() {
        dom.loginScreen.style.display = 'flex';
        dom.adminPanel.style.display = 'none';
        dom.loginPassword.value = '';
        dom.loginError.textContent = '';
    }

    function showAdmin() {
        dom.loginScreen.style.display = 'none';
        dom.adminPanel.style.display = 'block';
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
            showAdmin();
            await loadData();
            showToast('Bienvenido al panel de administración', 'success');
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
            // Ignore errors during logout
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
            switchSection(section);
            // Close mobile sidebar
            dom.sidebar.classList.remove('open');
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) overlay.classList.remove('visible');
        });
    });

    function switchSection(section) {
        state.currentSection = section;
        dom.navItems.forEach((b) => b.classList.toggle('active', b.dataset.section === section));
        $$('.section').forEach((s) => (s.style.display = 'none'));
        const target = $(`#section-${section}`);
        if (target) target.style.display = 'block';

        if (section === 'dashboard') renderDashboard();
        if (section === 'categories') renderCategories();
        if (section === 'products') renderProducts();
        if (section === 'settings') renderSettings();
    }

    /* ------------------------------------------
       Hamburger / Mobile Sidebar
    ------------------------------------------ */
    // Create overlay
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
            state.settings = settings || { business_name: '', whatsapp_number: '' };
            renderCurrentSection();
        } catch (err) {
            showToast('Error cargando datos: ' + err.message, 'error');
        }
    }

    function renderCurrentSection() {
        switchSection(state.currentSection);
    }

    /* ------------------------------------------
       Dashboard
    ------------------------------------------ */
    function renderDashboard() {
        const totalCategories = state.categories.length;
        const allProducts = state.categories.flatMap((c) => c.products || []);
        const totalProducts = allProducts.length;
        const totalPlans = allProducts.reduce((sum, p) => sum + (p.plans ? p.plans.length : 0), 0);
        const activeProducts = allProducts.filter((p) => p.active).length;

        const stats = [
            { icon: '📂', number: totalCategories, label: 'Total Categorías' },
            { icon: '📦', number: totalProducts, label: 'Total Productos' },
            { icon: '💰', number: totalPlans, label: 'Total Planes' },
            { icon: '✅', number: activeProducts, label: 'Productos Activos' },
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
       Categories
    ------------------------------------------ */
    function renderCategories() {
        if (state.categories.length === 0) {
            dom.categoriesBody.innerHTML = `<tr><td colspan="5" class="table-empty">No hay categorías. Crea la primera.</td></tr>`;
            return;
        }

        dom.categoriesBody.innerHTML = state.categories
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

    dom.addCategoryBtn.addEventListener('click', () => openCategoryModal());

    function openCategoryModal(category = null) {
        const isEdit = category !== null;
        const title = isEdit ? 'Editar Categoría' : 'Nueva Categoría';

        const bodyHTML = `
            <div class="form-group">
                <label>Nombre</label>
                <input type="text" class="form-input" id="catName" value="${isEdit ? escapeAttr(category.name) : ''}" placeholder="Ej: Streaming de Video">
            </div>
            <div class="form-group">
                <label>Icono (emoji)</label>
                <input type="text" class="form-input" id="catIcon" value="${isEdit ? escapeAttr(category.icon || '') : ''}" placeholder="Ej: 🎬">
            </div>
            <div class="form-group">
                <label>Orden</label>
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

            if (!name) {
                showToast('El nombre es obligatorio', 'error');
                return;
            }

            try {
                if (isEdit) {
                    await api(`/api/admin/categories/${category.id}`, {
                        method: 'PUT',
                        body: { name, icon, sort_order },
                    });
                    showToast('Categoría actualizada', 'success');
                } else {
                    await api('/api/admin/categories', {
                        method: 'POST',
                        body: { name, icon, sort_order },
                    });
                    showToast('Categoría creada', 'success');
                }
                closeModal();
                await loadData();
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
                } catch (err) {
                    showToast(err.message, 'error');
                }
            }
        );
    }

    /* ------------------------------------------
       Products
    ------------------------------------------ */
    function renderProducts() {
        // Populate filter dropdown
        const filterSelect = dom.filterCategory;
        const currentFilter = filterSelect.value;
        filterSelect.innerHTML = '<option value="">Todas las categorías</option>';
        state.categories.forEach((cat) => {
            filterSelect.innerHTML += `<option value="${cat.id}" ${String(cat.id) === currentFilter ? 'selected' : ''}>${escapeHTML(cat.icon || '')} ${escapeHTML(cat.name)}</option>`;
        });

        // Flatten products
        let allProducts = [];
        state.categories.forEach((cat) => {
            (cat.products || []).forEach((p) => {
                allProducts.push({ ...p, categoryName: cat.name, categoryIcon: cat.icon || '' });
            });
        });

        // Filter
        if (state.filterCategory) {
            allProducts = allProducts.filter((p) => String(p.category_id) === String(state.filterCategory));
        }

        if (allProducts.length === 0) {
            dom.productsBody.innerHTML = `<tr><td colspan="6" class="table-empty">No hay productos${state.filterCategory ? ' en esta categoría' : ''}.</td></tr>`;
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

    dom.filterCategory.addEventListener('change', (e) => {
        state.filterCategory = e.target.value;
        renderProducts();
    });

    dom.addProductBtn.addEventListener('click', () => openProductModal());

    function openProductModal(product = null) {
        const isEdit = product !== null;
        const title = isEdit ? 'Editar Producto' : 'Nuevo Producto';

        const categoriesOptions = state.categories
            .map(
                (c) =>
                    `<option value="${c.id}" ${isEdit && product.category_id === c.id ? 'selected' : ''}>${escapeHTML(c.icon || '')} ${escapeHTML(c.name)}</option>`
            )
            .join('');

        const bodyHTML = `
            <div class="form-group">
                <label>Categoría</label>
                <select class="form-input" id="prodCategory" style="cursor:pointer;">
                    <option value="">— Selecciona —</option>
                    ${categoriesOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Nombre</label>
                <input type="text" class="form-input" id="prodName" value="${isEdit ? escapeAttr(product.name) : ''}" placeholder="Ej: Netflix">
            </div>
            <div class="form-group">
                <label>Emoji</label>
                <input type="text" class="form-input" id="prodEmoji" value="${isEdit ? escapeAttr(product.emoji || '') : ''}" placeholder="Ej: 🎬">
            </div>
            <div class="form-group">
                <label>Descripción</label>
                <textarea class="form-input" id="prodDescription" rows="3" placeholder="Descripción del producto...">${isEdit ? escapeHTML(product.description || '') : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Imagen</label>
                <div class="image-upload-area" id="imageUploadArea">
                    <p>📷 Haz clic para subir una imagen</p>
                    <input type="file" id="prodImageFile" accept="image/*" style="display:none;">
                </div>
                <div class="image-preview" id="imagePreview" style="${isEdit && product.image ? '' : 'display:none'}">
                    <img id="imagePreviewImg" src="${isEdit && product.image ? escapeAttr(product.image) : ''}" alt="Preview">
                </div>
                <input type="hidden" id="prodImageUrl" value="${isEdit && product.image ? escapeAttr(product.image) : ''}">
            </div>
            <div class="form-group">
                <label>Orden</label>
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

        // Image upload handlers
        const uploadArea = $('#imageUploadArea');
        const fileInput = $('#prodImageFile');
        const previewDiv = $('#imagePreview');
        const previewImg = $('#imagePreviewImg');
        const imageUrlInput = $('#prodImageUrl');

        uploadArea.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Show local preview
            const reader = new FileReader();
            reader.onload = (ev) => {
                previewImg.src = ev.target.result;
                previewDiv.style.display = 'block';
            };
            reader.readAsDataURL(file);

            // Upload
            try {
                const formData = new FormData();
                formData.append('image', file);
                const result = await api('/api/admin/upload', {
                    method: 'POST',
                    body: formData,
                });
                imageUrlInput.value = result.url;
                previewImg.src = result.url;
                showToast('Imagen subida', 'success');
            } catch (err) {
                showToast('Error subiendo imagen: ' + err.message, 'error');
            }
        });

        // Save handler
        $('#saveProductBtn').addEventListener('click', async () => {
            const category_id = parseInt($('#prodCategory').value);
            const name = $('#prodName').value.trim();
            const emoji = $('#prodEmoji').value.trim();
            const description = $('#prodDescription').value.trim();
            const image = imageUrlInput.value;
            const sort_order = parseInt($('#prodOrder').value) || 0;
            const highlight = $('#prodHighlight').checked;
            const active = $('#prodActive').checked;
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
                } catch (err) {
                    showToast(err.message, 'error');
                }
            }
        );
    }

    /* ------------------------------------------
       Plans Management
    ------------------------------------------ */
    function managePlans(productId) {
        const product = findProduct(productId);
        if (!product) return;

        const plans = product.plans || [];

        const renderPlansTable = () => {
            let tableHTML = '';
            if (plans.length > 0) {
                tableHTML = `
                    <table class="plans-mini-table">
                        <thead><tr><th>Duración</th><th>Precio</th><th>Orden</th><th>Acciones</th></tr></thead>
                        <tbody>
                            ${plans
                                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                                .map(
                                    (plan) => `
                                <tr>
                                    <td>${escapeHTML(plan.duration)}</td>
                                    <td><strong>€${parseFloat(plan.price).toFixed(2)}</strong></td>
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
            const bodyHTML = `
                <div class="plans-section" style="border-top:none; padding-top:0; margin-top:0;">
                    <div id="plansTableArea">${renderPlansTable()}</div>
                    <h4 class="mt-4">Agregar Nuevo Plan</h4>
                    <div class="plan-form-inline">
                        <div class="form-group" style="margin-bottom:0">
                            <label>Duración</label>
                            <input type="text" class="form-input" id="planDuration" placeholder="Ej: 1 Mes">
                        </div>
                        <div class="form-group" style="margin-bottom:0">
                            <label>Precio (€)</label>
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
                    showToast('La duración es obligatoria', 'error');
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

        const bodyHTML = `
            <div class="form-group">
                <label>Duración</label>
                <input type="text" class="form-input" id="editPlanDuration" value="${escapeAttr(plan.duration)}">
            </div>
            <div class="form-group">
                <label>Precio (€)</label>
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
                showToast('La duración es obligatoria', 'error');
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
       Settings
    ------------------------------------------ */
    function renderSettings() {
        dom.settingBusinessName.value = state.settings.business_name || '';
        dom.settingWhatsapp.value = state.settings.whatsapp_number || '';
        dom.currentPassword.value = '';
        dom.newPassword.value = '';
    }

    dom.saveSettingsBtn.addEventListener('click', async () => {
        const business_name = dom.settingBusinessName.value.trim();
        const whatsapp_number = dom.settingWhatsapp.value.trim();

        if (!business_name) {
            showToast('El nombre del negocio es obligatorio', 'error');
            return;
        }

        try {
            await api('/api/admin/settings', {
                method: 'PUT',
                body: { business_name, whatsapp_number },
            });
            state.settings.business_name = business_name;
            state.settings.whatsapp_number = whatsapp_number;
            showToast('Configuración guardada', 'success');
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
