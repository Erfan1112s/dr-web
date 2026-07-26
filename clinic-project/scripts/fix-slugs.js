// scripts/fix-slugs-cjs.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSlugs() {
  try {
    const articles = await prisma.article.findMany();
    
    if (articles.length === 0) {
      console.log('⚠️ هیچ مقاله‌ای در دیتابیس یافت نشد.');
      return;
    }

    console.log(`📚 ${articles.length} مقاله پیدا شد.`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const article of articles) {
      try {
        if (!article.slug || article.slug.trim() === '') {
          const slug = article.title
            .trim()
            .toLowerCase()
            .replace(/[^\w\sآ-ی]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');

          const finalSlug = slug || `article-${article.id}`;

          await prisma.article.update({
            where: { id: article.id },
            data: { slug: finalSlug },
          });

          console.log(`✅ اسلاگ برای "${article.title}" ساخته شد: ${finalSlug}`);
          updatedCount++;
        } else {
          console.log(`⏩ "${article.title}" از قبل اسلاگ دارد: ${article.slug}`);
        }
      } catch (err) {
        console.error(`❌ خطا برای مقاله "${article.title}":`, err.message);
        errorCount++;
      }
    }

    console.log('\n📊 خلاصه:');
    console.log(`   ✅ ${updatedCount} مقاله به‌روزرسانی شد.`);
    console.log(`   ⏩ ${articles.length - updatedCount - errorCount} مقاله از قبل اسلاگ داشتند.`);
    if (errorCount > 0) {
      console.log(`   ❌ ${errorCount} مقاله با خطا مواجه شد.`);
    }

  } catch (error) {
    console.error('❌ خطا در اتصال به دیتابیس:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixSlugs();