<?php
// افتراض أنك قمت بجلب بيانات المنتج بناءً على الـ ID من جدول products و product_reviews
// $product يحتوي على: product_name, sell_price, images, stock, rating, reviews_count[cite: 1]
?>

<!-- Meta Tags الأساسية لمحركات البحث -->
<title><?php echo htmlspecialchars($product['product_name']); ?> - متجر <?php echo htmlspecialchars($store_name); ?></title>
<meta name="description" content="اشترِ <?php echo htmlspecialchars($product['product_name']); ?> الآن بأفضل سعر من متجر <?php echo htmlspecialchars($store_name); ?>. متوفر في المخزون وبخدمة توصيل سريعة.">

<!-- Google Schema.org (Product Structured Data) لظهور السعر والتقييمات في جوجل -->
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "<?php echo htmlspecialchars($product['product_name']); ?>",
  "image": "<?php echo htmlspecialchars($product['images']); ?>",
  "description": "<?php echo htmlspecialchars($product['product_name']); ?> متوفر الآن في المتجر.",
  "offers": {
    "@type": "Offer",
    "url": "<?php echo "https://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]"; ?>",
    "priceCurrency": "EGP", 
    "price": "<?php echo $product['sell_price']; ?>",
    "availability": "<?php echo ($product['stock'] > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'; ?>"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "<?php echo $product['rating'] ?? 5; ?>",
    "reviewCount": "<?php echo $product['reviews_count'] ?? 1; ?>"
  }
}
</script>