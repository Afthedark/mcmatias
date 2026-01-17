/**
 * Users Management Module
 * Handles CRUD operations for Users with foreign key relationships (Rol, Sucursal)
 */

let currentPage = 1;
let totalPages = 1;
const ITEMS_PER_PAGE = 10;
let rolesCache = [];
let sucursalesCache = [];

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // initializePage is called in HTML
    loadInitialData();
});

/**
 * Load initial data (Roles and Sucursales catalogs first, then Users)
 */
async function loadInitialData() {
    showLoading();
    try {
        // Load catalogs concurrently
        const [rolesRes, sucursalesRes] = await Promise.all([
            apiGet('/roles/'),
            apiGet('/sucursales/')
        ]);

        // Handle pagination results if present in catalogs
        rolesCache = Array.isArray(rolesRes) ? rolesRes : (rolesRes.results || []);
        sucursalesCache = Array.isArray(sucursalesRes) ? sucursalesRes : (sucursalesRes.results || []);

        // Populate modal selects
        populateSelects();

        // Now load users
        loadUsuarios();

    } catch (error) {
        console.error('Error loading catalogs:', error);
        showToast('Error al cargar datos iniciales. Verifique su conexión.', 'error');
    }
}

/**
 * Load Users from API with pagination
 * @param {number} page - Page number to load
 */
async function loadUsuarios(page = 1) {
    // showLoading(); // Already managed by loadInitialData on first run, but good for pagination
    if (page !== currentPage) showLoadingTable(); // Use a lighter loading indicator for pagination if preferred

    try {
        const response = await apiGet(`/usuarios/?page=${page}&page_size=${ITEMS_PER_PAGE}`);

        // Handle DRF pagination
        const results = response.results ? response.results : response;
        const count = response.count ? response.count : results.length;

        totalPages = Math.ceil(count / ITEMS_PER_PAGE);
        currentPage = page;

        renderTable(results);
        renderPagination(count);

    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Error al cargar usuarios', 'error');
        document.querySelector('#usuariosTableBody').innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">Error al cargar datos.</td>
            </tr>
        `;
    } finally {
        hideLoading();
    }
}

/**
 * Render Users Table
 * @param {Array} users - List of users
 */

/**
 * Render Users Table
 * @param {Array} users - List of users
 */
function renderTable(users) {
    const tbody = document.getElementById('usuariosTableBody');
    if (!users || users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No hay usuarios registrados</td>
            </tr>
        `;
        return;
    }

    // Get current user role
    const currentUserRole = parseInt(localStorage.getItem('user_numero_rol'));

    // Filter out Super Users if current user is not Super User
    let displayUsers = users;
    if (currentUserRole !== 1) {
        displayUsers = users.filter(user => user.id_rol !== 1);
    }

    if (displayUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No hay usuarios visibles</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = displayUsers.map(user => {
        // Find names in cache
        const rol = rolesCache.find(r => r.id_rol === user.id_rol);
        const sucursal = sucursalesCache.find(s => s.id_sucursal === user.id_sucursal);

        return `
            <tr>
                <td>${user.nombre_apellido}</td>
                <td>${user.correo_electronico}</td>
                <td><span class="badge bg-info text-dark">${rol ? rol.nombre_rol : 'N/A'}</span></td>
                <td>${sucursal ? sucursal.nombre : 'N/A'}</td>
                <td>
                    ${user.activo
                ? '<span class="badge bg-success">Activo</span>'
                : '<span class="badge bg-secondary">Inactivo</span>'}
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" 
                            onclick="openEditModal(${user.id_usuario})"
                            title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="confirmDelete(${user.id_usuario}, '${user.nombre_apellido}')"
                            title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Populate Role and Sucursal Selects
 */
function populateSelects() {
    const rolSelect = document.getElementById('idRol');
    const sucursalSelect = document.getElementById('idSucursal');

    // Reset
    rolSelect.innerHTML = '<option value="">Seleccione...</option>';
    sucursalSelect.innerHTML = '<option value="">Seleccione...</option>';

    // Get current user role
    const currentUserRole = parseInt(localStorage.getItem('user_numero_rol'));

    rolesCache.forEach(rol => {
        // Hide Super Admin role option if current user is not Super Admin
        if (currentUserRole !== 1 && rol.id_rol === 1) {
            return;
        }
        rolSelect.innerHTML += `<option value="${rol.id_rol}">${rol.nombre_rol}</option>`;
    });

    sucursalesCache.forEach(suc => {
        sucursalSelect.innerHTML += `<option value="${suc.id_sucursal}">${suc.nombre}</option>`;
    });
}

/**
 * Render Pagination Controls
 */
function renderPagination(totalItems) {
    const container = document.getElementById('paginationContainer');
    const infoContainer = document.getElementById('paginationInfo');

    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
    infoContainer.innerText = `Mostrando ${start} a ${end} de ${totalItems} usuarios`;

    let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="loadUsuarios(${currentPage - 1})">Anterior</a>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="loadUsuarios(${i})">${i}</a>
            </li>
        `;
    }

    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="loadUsuarios(${currentPage + 1})">Siguiente</a>
        </li>
    `;

    container.innerHTML = paginationHTML;
}

/**
 * Open Modal for Creating or Editing
 * @param {number|null} id - User ID (null for create)
 */
async function openEditModal(id = null) {
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('usuarioForm');
    const passwordHelp = document.getElementById('passwordHelp');
    const passwordInput = document.getElementById('password'); // Needed for 'required' toggle

    form.reset();
    form.classList.remove('was-validated');
    document.getElementById('confirmPassword').classList.remove('is-invalid');
    document.getElementById('confirmPassword').value = '';

    if (id) {
        // Edit Mode
        modalTitle.innerText = 'Editar Usuario';
        document.getElementById('usuarioId').value = id;
        passwordHelp.classList.remove('d-none'); // Show "Leave blank to keep current"
        passwordInput.removeAttribute('required'); // Password not required on edit

        // Get fresh user data to populate form
        try {
            const user = await apiGet(`/usuarios/${id}/`);
            document.getElementById('nombreApellido').value = user.nombre_apellido;
            document.getElementById('correoElectronico').value = user.correo_electronico;
            document.getElementById('idRol').value = user.id_rol;
            document.getElementById('idSucursal').value = user.id_sucursal;
            document.getElementById('activo').checked = user.activo;
        } catch (error) {
            console.error('Error fetching user details:', error);
            showToast('Error al cargar datos del usuario', 'error');
            return;
        }

    } else {
        // Create Mode
        modalTitle.innerText = 'Nuevo Usuario';
        document.getElementById('usuarioId').value = '';
        passwordHelp.classList.add('d-none');
        passwordInput.setAttribute('required', 'true'); // Password required on create
        document.getElementById('activo').checked = true; // Default active
    }

    const modal = new bootstrap.Modal(document.getElementById('usuarioModal'));
    modal.show();
}

/**
 * Save User (Create or Update)
 */
async function saveUsuario() {
    const form = document.getElementById('usuarioForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const id = document.getElementById('usuarioId').value;
    const data = {
        nombre_apellido: document.getElementById('nombreApellido').value,
        correo_electronico: document.getElementById('correoElectronico').value,
        id_rol: document.getElementById('idRol').value,
        id_sucursal: document.getElementById('idSucursal').value,
        activo: document.getElementById('activo').checked
    };

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password) {
        if (password !== confirmPassword) {
            document.getElementById('confirmPassword').classList.add('is-invalid');
            showToast('Las contraseñas no coinciden', 'warning');
            return;
        }
        data.password = password;
        // UserProfileSerializer might expect confirm_password if we used that, 
        // but standard UsuarioSerializer just takes 'password'. 
        // We validate on frontend here.
    } else if (!id) {
        // Should catch by validation, but double check
        showToast('La contraseña es obligatoria para nuevos usuarios', 'warning');
        return;
    }

    const btnSave = document.getElementById('btnSave');
    const originalText = btnSave.innerText;
    btnSave.disabled = true;
    btnSave.innerText = 'Guardando...';

    try {
        if (id) {
            // Update (PATCH)
            await apiPatch(`/usuarios/${id}/`, data);
            showToast('Usuario actualizado correctamente');
        } else {
            // Create (POST)
            await apiPost('/usuarios/', data);
            showToast('Usuario creado correctamente');
        }

        // Close modal and reload
        const modalElement = document.getElementById('usuarioModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        loadUsuarios(currentPage);

    } catch (error) {
        console.error('Error saving user:', error);
        // Handle field specific errors from Django
        if (error.response && error.response.data) {
            const errData = error.response.data;
            if (errData.correo_electronico) showToast(`Error email: ${errData.correo_electronico}`, 'error');
            else showToast('Error al guardar el usuario', 'error');
        } else {
            showToast('Error al guardar el usuario', 'error');
        }
    } finally {
        btnSave.disabled = false;
        btnSave.innerText = originalText;
    }
}

/**
 * Confirm Delete
 */
function confirmDelete(id, name) {
    if (confirm(`¿Está seguro que desea eliminar al usuario "${name}"?`)) {
        deleteUsuario(id);
    }
}

/**
 * Execute Delete
 */
async function deleteUsuario(id) {
    try {
        await apiDelete(`/usuarios/${id}/`);
        showToast('Usuario eliminado correctamente');
        loadUsuarios(currentPage);
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Error al eliminar usuario', 'error');
    }
}

function showLoading() {
    // Only used for initial load usually
}

function showLoadingTable() {
    document.querySelector('#usuariosTableBody').innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="spinner-border text-primary" role="status"></div>
            </td>
        </tr>
    `;
}

function hideLoading() {
    //
}
