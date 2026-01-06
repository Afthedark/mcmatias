const sequelize = require('../config/database');
const { Role, Categoria, Sucursal, Usuario } = require('../models');

async function seed() {
    try {
        // Sincronización normal (no borra datos)
        await sequelize.sync();

        // 1. Roles
        const roles = ['cajero', 'tecnico', 'cajero+tecnico', 'administrador'];
        let rolesDb = {}; // Para guardar mapeo nombre -> id

        for (const r of roles) {
            const [rol, created] = await Role.findOrCreate({ where: { nombre_rol: r } });
            rolesDb[r] = rol.id_rol;
        }

        // 2. Sucursal Principal
        const [sucursal, sucursalCreated] = await Sucursal.findOrCreate({
            where: { nombre: 'Casa Matriz' },
            defaults: {
                nombre: 'Casa Matriz',
                direccion: 'Dirección Principal',
                activo: true
            }
        });

        // 3. Usuario Administrador
        // Verificamos si existe usuario con ese correo
        const adminEmail = 'admin@multicentromatias.com';
        const adminExistente = await Usuario.findOne({ where: { correo_electronico: adminEmail } });

        if (!adminExistente) {
            await Usuario.create({
                nombre_apellido: 'Administrador Principal',
                correo_electronico: adminEmail,
                contraseña: 'admin123', // El hook de beforeCreate lo hasheará
                id_rol: rolesDb['administrador'],
                id_sucursal: sucursal.id_sucursal,
                activo: true
            });
            console.log('Usuario Administrador creado: admin@multicentromatias.com / admin123');
        } else {
            console.log('Usuario Administrador ya existe.');
        }

        // 4. Categorias
        const categorias = [
            { nombre_categoria: 'Electrónicos', tipo: 'producto' },
            { nombre_categoria: 'Hogar', tipo: 'producto' },
            { nombre_categoria: 'Juguetes', tipo: 'producto' },
            { nombre_categoria: 'Reparación Celulares', tipo: 'servicio' },
            { nombre_categoria: 'Reparación Laptops', tipo: 'servicio' },
            { nombre_categoria: 'Mantenimiento General', tipo: 'servicio' },
        ];

        for (const c of categorias) {
            await Categoria.findOrCreate({ where: { nombre_categoria: c.nombre_categoria }, defaults: c });
        }

        console.log('Seed finalizado con éxito (Esquema completo con Admin y Sucursal).');
        process.exit(0);
    } catch (error) {
        console.error('Error en el seed:', error);
        process.exit(1);
    }
}

seed();
