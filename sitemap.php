<?php
// الاتصال بقاعدة البيانات
// require_once 'db_connection.php';

header("Content-Type: application/xml; charset=utf-8");

echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

// 1. جلب المتاجر النشطة من جدول store_settings
// افتراض أن الأعمدة تشمل user_id أو رابط المتجر والاسم[cite: 1, 2]
/*
$stmt = $pdo->query("SELECT user_id, store_name FROM store_settings WHERE is_active = 1");
$stores = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($stores as $store) {
    $storeSlug = $store['store_name']; // أو الحقل المخصص للرابط
    echo '<url>';
    echo '<loc>https://yoursaas.com/store/' . htmlspecialchars($storeSlug) . '</loc>';
    echo '<changefreq>daily</changefreq>';
    echo '<priority>0.8</priority>';
    echo '</url>';

    // 2. جلب منتجات هذا المتجر من جدول products[cite: 1]
    $prodStmt = $pdo->prepare("SELECT id, updated_at FROM products WHERE user_id = ?");
    $prodStmt->execute([$store['user_id']]);
    $products = $prodStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($products as $product) {
        echo '<url>';
        echo '<loc>https://yoursaas.com/store/' . htmlspecialchars($storeSlug) . '/product/' . $product['id'] . '</loc>';
        echo '<changefreq>weekly</changefreq>';
        echo '<priority>0.6</priority>';
        echo '</url>';
    }
}
*/

echo '</urlset>';
?>