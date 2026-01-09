/**
 * User Profile Module
 * Handles user profile editing functionality
 */

/**
 * Render profile modal HTML
 */
function renderProfileModal() {
    const modalHTML = `
        <div class="modal fade" id="profileModal" tabindex="-1" aria-labelledby="profileModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="profileModalLabel">
                            <i class="bi bi-person-circle"></i> Mi Perfil
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="profileForm">
                            <div class="mb-3">
                                <label for="profileName" class="form-label">Nombre Completo</label>
                                <input type="text" class="form-control" id="profileName" required>
                            </div>
                            <div class="mb-3">
                                <label for="profileEmail" class="form-label">Correo Electrónico</label>
                                <input type="email" class="form-control" id="profileEmail" required>
                            </div>
                            <hr>
                            <p class="text-muted small">Dejar en blanco si no deseas cambiar la contraseña</p>
                            <div class="mb-3">
                                <label for="profilePassword" class="form-label">Nueva Contraseña</label>
                                <input type="password" class="form-control" id="profilePassword">
                                <div class="form-text">Mínimo 4 caracteres</div>
                            </div>
                            <div class="mb-3">
                                <label for="profileConfirmPassword" class="form-label">Confirmar Contraseña</label>
                                <input type="password" class="form-control" id="profileConfirmPassword">
                            </div>
                            <div id="profileError" class="alert alert-danger d-none"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="saveProfile()">
                            <i class="bi bi-save"></i> Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Inject modal if it doesn't exist
    if (!document.getElementById('profileModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

/**
 * Open profile modal and load user data
 */
async function openProfileModal() {
    try {
        showLoader();

        // Render modal if not already rendered
        renderProfileModal();

        // Fetch current user profile
        const userData = await apiGet('/perfil/');

        // Populate form
        document.getElementById('profileName').value = userData.nombre_apellido || '';
        document.getElementById('profileEmail').value = userData.correo_electronico || '';
        document.getElementById('profilePassword').value = '';
        document.getElementById('profileConfirmPassword').value = '';

        // Hide error message
        document.getElementById('profileError').classList.add('d-none');

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('profileModal'));
        modal.show();

    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Error al cargar el perfil', 'danger');
    } finally {
        hideLoader();
    }
}

/**
 * Save profile changes
 */
async function saveProfile() {
    try {
        const name = document.getElementById('profileName').value.trim();
        const email = document.getElementById('profileEmail').value.trim();
        const password = document.getElementById('profilePassword').value;
        const confirmPassword = document.getElementById('profileConfirmPassword').value;
        const errorDiv = document.getElementById('profileError');

        // Reset error
        errorDiv.classList.add('d-none');

        // Validate required fields
        if (!name || !email) {
            errorDiv.textContent = 'El nombre y el correo son obligatorios';
            errorDiv.classList.remove('d-none');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errorDiv.textContent = 'El formato del correo no es válido';
            errorDiv.classList.remove('d-none');
            return;
        }

        // Validate passwords if provided
        if (password || confirmPassword) {
            if (password !== confirmPassword) {
                errorDiv.textContent = 'Las contraseñas no coinciden';
                errorDiv.classList.remove('d-none');
                return;
            }
            if (password.length < 4) {
                errorDiv.textContent = 'La contraseña debe tener al menos 4 caracteres';
                errorDiv.classList.remove('d-none');
                return;
            }
        }

        showLoader();

        // Prepare data
        const data = {
            nombre_apellido: name,
            correo_electronico: email
        };

        // Add password only if provided
        if (password) {
            data.password = password;
            data.confirm_password = confirmPassword;
        }

        // Send PATCH request
        const response = await api.patch('/perfil/', data);

        // Update localStorage
        localStorage.setItem('user_email', response.correo_electronico);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
        modal.hide();

        // Show success message
        showToast('Perfil actualizado correctamente', 'success');

        // Update header with new name
        const userName = response.correo_electronico.split('@')[0];
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => el.textContent = userName);

        // If password was changed, suggest re-login
        if (password) {
            setTimeout(() => {
                if (confirm('Se ha actualizado tu contraseña. ¿Deseas cerrar sesión para iniciar con la nueva contraseña?')) {
                    logout();
                }
            }, 1000);
        }

    } catch (error) {
        console.error('Error saving profile:', error);
        const errorDiv = document.getElementById('profileError');

        if (error.response && error.response.data) {
            // Display backend validation errors
            const errors = error.response.data;
            let errorMessage = '';

            for (const [field, messages] of Object.entries(errors)) {
                if (Array.isArray(messages)) {
                    errorMessage += messages.join(', ') + ' ';
                } else {
                    errorMessage += messages + ' ';
                }
            }

            errorDiv.textContent = errorMessage || 'Error al guardar el perfil';
        } else {
            errorDiv.textContent = 'Error al guardar el perfil';
        }

        errorDiv.classList.remove('d-none');
    } finally {
        hideLoader();
    }
}

/**
 * Close profile modal
 */
function closeProfileModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
    if (modal) {
        modal.hide();
    }
}
