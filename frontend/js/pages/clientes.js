/**
 * Clientes Page Logic
 */

let clientes = [];
let currentClienteId = null;

async function loadClientes() {
    try {
        const data = await apiGet('/clientes/');
        clientes = data.results || data;
        renderClientesTable();
    } catch (error) {
        console.error('Error loading clients:', error);
        showToast('Error al cargar clientes', 'danger');
    }
}

function renderClientesTable() {
    const tbody = document.getElementById('clientesTable');

    if (clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay clientes registrados</td></tr>';
        return;
    }

    tbody.innerHTML = clientes.map(cliente => `
        <tr>
            <td>${cliente.nombre_apellido}</td>
            <td>${cliente.cedula_identidad || '-'}</td>
            <td>${cliente.celular || '-'}</td>
            <td>${cliente.correo_electronico || '-'}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-info" onclick="openEditModal(${cliente.id_cliente})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCliente(${cliente.id_cliente})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function openCreateModal() {
    currentClienteId = null;
    document.getElementById('modalTitle').textContent = 'Nuevo Cliente';
    document.getElementById('clienteForm').reset();
    const modal = new bootstrap.Modal(document.getElementById('clienteModal'));
    modal.show();
}

async function openEditModal(id) {
    currentClienteId = id;
    document.getElementById('modalTitle').textContent = 'Editar Cliente';

    try {
        const cliente = await apiGet(`/clientes/${id}/`);
        document.getElementById('clienteId').value = cliente.id_cliente;
        document.getElementById('nombreApellido').value = cliente.nombre_apellido;
        document.getElementById('cedulaIdentidad').value = cliente.cedula_identidad || '';
        document.getElementById('celular').value = cliente.celular || '';
        document.getElementById('correoElectronico').value = cliente.correo_electronico || '';
        document.getElementById('direccion').value = cliente.direccion || '';

        const modal = new bootstrap.Modal(document.getElementById('clienteModal'));
        modal.show();
    } catch (error) {
        showToast('Error al cargar cliente', 'danger');
    }
}

async function saveCliente() {
    const form = document.getElementById('clienteForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const data = {
        nombre_apellido: document.getElementById('nombreApellido').value,
        cedula_identidad: document.getElementById('cedulaIdentidad').value,
        celular: document.getElementById('celular').value,
        correo_electronico: document.getElementById('correoElectronico').value,
        direccion: document.getElementById('direccion').value
    };

    try {
        showLoader();
        if (currentClienteId) {
            await apiPut(`/clientes/${currentClienteId}/`, data);
            showToast('Cliente actualizado correctamente', 'success');
        } else {
            await apiPost('/clientes/', data);
            showToast('Cliente creado correctamente', 'success');
        }
        bootstrap.Modal.getInstance(document.getElementById('clienteModal')).hide();
        await loadClientes();
    } catch (error) {
        showToast('Error al guardar cliente', 'danger');
    } finally {
        hideLoader();
    }
}

async function deleteCliente(id) {
    if (!confirmDelete()) return;
    try {
        showLoader();
        await apiDelete(`/clientes/${id}/`);
        showToast('Cliente eliminado correctamente', 'success');
        await loadClientes();
    } catch (error) {
        showToast('Error al eliminar cliente', 'danger');
    } finally {
        hideLoader();
    }
}
