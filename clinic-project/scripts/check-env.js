// scripts/check-env.js
require('dotenv').config({ path: '../.env.local' });

console.log('SMSIR_API_KEY:', process.env.SMSIR_API_KEY || '❌ خالی');
console.log('SMSIR_LINE_NUMBER:', process.env.SMSIR_LINE_NUMBER || '❌ خالی');