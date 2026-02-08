try {
  // Prueba 1: Named import
  console.log('Probando named import...');
  const mod = await import('date-fns-tz');
  console.log('✅ date-fns-tz exports:', Object.keys(mod).join(', '));
  
  // Prueba 2: date-fns
  const dateFns = await import('date-fns');
  console.log('✅ date-fns exports parseISO?', 'parseISO' in dateFns);
  
  console.log('\n🎉 Todo bien!');
} catch (error) {
  console.log('❌ Error:', error.message);
}
