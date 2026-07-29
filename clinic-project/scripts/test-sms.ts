// scripts/test-sms.ts
import path from 'path';
import dotenv from 'dotenv';
import { testSMS } from '../lib/sms';

// بارگذاری صریح .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
  console.log('🔍 بررسی متغیرهای محیطی (از test-sms.ts):');
  console.log('  SMSIR_API_KEY:', process.env.SMSIR_API_KEY ? '✅ تنظیم شده' : '❌ تنظیم نشده');
  console.log('  SMSIR_LINE_NUMBER:', process.env.SMSIR_LINE_NUMBER ? '✅ تنظیم شده' : '❌ تنظیم نشده');

  const result = await testSMS('09123456789');
  if (result.success) {
    console.log('✅ پیامک تست ارسال شد');
  } else {
    console.error('❌ خطا:', result.error);
  }
}

test();