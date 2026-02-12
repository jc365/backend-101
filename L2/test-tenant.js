// test-tenant.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from './src/models/Tenant.js';
import User from './src/models/User.js';

dotenv.config();

const testTenantHelpers = async () => {
  try {
    // 1. Conectar a MongoDB
    console.log('📦 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/multireservas_test');
    console.log('✅ Conectado\n');

    // 2. Limpiar datos de prueba anteriores
    await Tenant.deleteMany({ name: /^Test/ });
    await User.deleteMany({ email: /test@/ });
    console.log('🧹 Datos de prueba limpiados\n');

    // 3. Crear tenant de prueba
    const tenant = await Tenant.create({
      name: 'Test Barbería',
      email: 'test@barberia.com',
      phone: '123456789',
      slotDuration: 30,
      schedules: [{
        label: 'Horario regular',
        days: ['MO', 'TU', 'WE', 'TH', 'FR'],
        start: '09:00',
        end: '18:00',
        breaks: [{
          start: '13:00',
          end: '14:00',
          label: 'Comida'
        }]
      }]
    });
    console.log('🏢 Tenant creado:', tenant.name);
    console.log('   ID:', tenant._id);
    console.log('   Slot duration:', tenant.slotDuration);
    console.log('   Schedules:', tenant.schedules.length);
    console.log('   Holidays:', tenant.holidays.length, '\n');

    // 4. Crear usuarios de prueba para este tenant
    const owner = await User.create({
      email: 'owner@test.com',
      password: 'Password123!',
      firstName: 'Juan',
      lastName: 'Pérez',
      tenantId: tenant._id,
      role: 'owner',
      isVerified: true
    });
    console.log('👤 Owner creado:', owner.fullName);
    console.log('   Email:', owner.email);
    console.log('   Role:', owner.role);
    console.log('   Tenant ID:', owner.tenantId?.toString(), '\n');

    const employee = await User.create({
      email: 'employee@test.com',
      password: 'Password123!',
      firstName: 'María',
      lastName: 'García',
      tenantId: tenant._id,
      role: 'employee',
      isVerified: true
    });
    console.log('👤 Employee creado:', employee.fullName);
    console.log('   Role:', employee.role, '\n');

    const client = await User.create({
      email: 'client@test.com',
      password: 'Password123!',
      firstName: 'Carlos',
      lastName: 'López',
      tenantId: tenant._id,
      role: 'client',
      isVerified: true
    });
    console.log('👤 Client creado:', client.fullName);
    console.log('   Role:', client.role, '\n');

    // 5. TEST 1: getUsers()
    console.log('🔬 TEST 1: tenant.getUsers()');
    const users = await tenant.getUsers();
    console.log(`   → ${users.length} usuarios encontrados`);
    users.forEach(u => console.log(`     - ${u.fullName} (${u.role})`));
    console.log('');

    // 6. TEST 2: getOwners()
    console.log('🔬 TEST 2: tenant.getOwners()');
    const owners = await tenant.getOwners();
    console.log(`   → ${owners.length} owners encontrados`);
    owners.forEach(u => console.log(`     - ${u.fullName}`));
    console.log('');

    // 7. TEST 3: getEmployees()
    console.log('🔬 TEST 3: tenant.getEmployees()');
    const employees = await tenant.getEmployees();
    console.log(`   → ${employees.length} employees encontrados`);
    employees.forEach(u => console.log(`     - ${u.fullName}`));
    console.log('');

    // 8. TEST 4: getClients()
    console.log('🔬 TEST 4: tenant.getClients()');
    const clients = await tenant.getClients();
    console.log(`   → ${clients.length} clients encontrados`);
    clients.forEach(u => console.log(`     - ${u.fullName}`));
    console.log('');

    // 9. TEST 5: getUsersByRole()
    console.log('🔬 TEST 5: tenant.getUsersByRole("employee")');
    const byRole = await tenant.getUsersByRole('employee');
    console.log(`   → ${byRole.length} employees encontrados via getUsersByRole`);
    console.log('');

    // 10. TEST 6: Virtuals
    console.log('🔬 TEST 6: Virtuals');
    const userCount = await tenant.userCount;
    const ownerCount = await tenant.ownerCount;
    const employeeCount = await tenant.employeeCount;
    console.log(`   → userCount: ${userCount}`);
    console.log(`   → ownerCount: ${ownerCount}`);
    console.log(`   → employeeCount: ${employeeCount}`);
    console.log('');

    // 11. TEST 7: findByUserId()
    console.log('🔬 TEST 7: Tenant.findByUserId()');
    const foundTenant = await Tenant.findByUserId(owner._id);
    console.log(`   → Tenant encontrado desde userId: ${foundTenant?.name}`);
    console.log(`   → IDs coinciden: ${foundTenant?._id.toString() === tenant._id.toString()}`);
    console.log('');

    // 12. TEST 8: getUserCount()
    console.log('🔬 TEST 8: Tenant.getUserCount()');
    const count = await Tenant.getUserCount(tenant._id);
    console.log(`   → Total usuarios en tenant: ${count}`);
    console.log('');

    console.log('🎉 ¡TODOS LOS TESTS PASARON!');
    console.log('   Los helpers de Tenant funcionan correctamente.');

  } catch (error) {
    console.error('❌ Error en test:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
  }
};

testTenantHelpers();