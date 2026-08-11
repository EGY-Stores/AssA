// المتغيرات العامة وإعداد Supabase
const SUPABASE_URL = 'https://gjfanrzylpnwiddevfgx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZmFucnp5bHBud2lkZGV2Zmd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NDY1OTcsImV4cCI6MjEwMjAyMjU5N30.81yaUfV3lXGMMlQQg__-HLtbMv-RKGALy8RW-83eDVw';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. التحقق من المصادقة وحماية الصفحة في البداية
const checkUserAuth = () => {
    const userSession = localStorage.getItem('user');
    if (!userSession) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(userSession).id;
};

const userId = checkUserAuth();

// 2. التحقق من حالة اشتراك المستخدم (تفعيل يدوي)
async function checkSubscription() {
    const { data, error } = await supabaseClient
        .from('subscriptions')
        .select('status')
        .eq('user_id', userId)
        .single();

    if (error || !data || data.status !== 'active') {
        // إذا كان الحساب غير مفعل، يتم توجيهه لصفحة الانتظار أو عرض رسالة
        window.location.href = 'inactive.html';
        return;
    }
}

// تشغيل التحقق والدوال الأساسية أول ما الصفحة تفتح
document.addEventListener('DOMContentLoaded', async () => {
    if (userId) {
        await checkSubscription();
        loadProducts();
    }
});

// 3. دالة حفظ منتج جديد في المخزن
async function saveProduct() {
    const name = document.getElementById('productName').value.trim();
    const barcode = document.getElementById('productBarcode').value.trim();
    const sellPrice = parseFloat(document.getElementById('productSellPrice').value);
    const buyPrice = parseFloat(document.getElementById('productBuyPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);

    if (!name || isNaN(sellPrice) || isNaN(buyPrice) || isNaN(stock)) {
        alert('برجاء إدخال بيانات المنتج بشكل صحيح');
        return;
    }

    const { error } = await supabaseClient.from('products').insert([{
        name: name,
        barcode: barcode || null,
        sell_price: sellPrice,
        buy_price: buyPrice,
        stock: stock,
        user_id: userId
    }]);

    if (error) {
        alert('خطأ في حفظ المنتج: ' + error.message);
    } else {
        alert('تم حفظ المنتج في المخزن بنجاح!');
        // تفريغ الحقول
        document.getElementById('productName').value = '';
        document.getElementById('productBarcode').value = '';
        document.getElementById('productSellPrice').value = '';
        document.getElementById('productBuyPrice').value = '';
        document.getElementById('productStock').value = '';
        
        loadProducts();
    }
}

// 4. جلب المنتجات وعرضها في القائمة المنسدلة وجدول المخزن
let allProducts = [];

async function loadProducts() {
    const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('خطأ في تحميل المنتجات:', error.message);
        return;
    }

    allProducts = data || [];
    populatePOSDropdown();
    renderInventoryTable(allProducts);
}

// تعبئة قائمة نقطة البيع (POS)
function populatePOSDropdown() {
    const select = document.getElementById('posProductSelect');
    if (!select) return;

    select.innerHTML = '<option value="">-- اختر منتج --</option>';
    allProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (متوفر: ${product.stock})`;
        select.appendChild(option);
    });
}

// عرض المخزن في الجدول السفلي
function renderInventoryTable(productsList) {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    productsList.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.name}</td>
            <td>${product.barcode || '-'}</td>
            <td>${product.buy_price}</td>
            <td>${product.sell_price}</td>
            <td>${product.stock}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 5. إتمام عملية البيع (Checkout)
async function checkout() {
    const select = document.getElementById('posProductSelect');
    const quantityInput = document.getElementById('posQuantity');

    const productId = select.value;
    const quantity = parseInt(quantityInput.value);

    if (!productId || isNaN(quantity) || quantity <= 0) {
        alert('برجاء اختيار المنتج وتحديد الكمية بشكل صحيح');
        return;
    }

    // البحث عن المنتج المحدد
    const product = allProducts.find(p => p.id == productId);
    if (!product) {
        alert('المنتج غير موجود');
        return;
    }

    if (product.stock < quantity) {
        alert('الكمية المطلوبة أكبر من المتوفر في المخزن!');
        return;
    }

    const totalAmount = product.sell_price * quantity;
    const totalCost = product.buy_price * quantity;
    const profit = totalAmount - totalCost;

    // أ. حفظ الفاتورة في جدول invoices
    const { error: invError } = await supabaseClient.from('invoices').insert([{
        invoice_number: 'INV-' + Date.now(),
        total_amount: totalAmount,
        paid_amount: totalAmount,
        change_amount: 0,
        profit: profit,
        user_id: userId
    }]);

    if (invError) {
        alert('خطأ في حفظ الفاتورة: ' + invError.message);
        return;
    }

    // ب. تحديث المخزن ونقص الكمية المباعة
    const newStock = product.stock - quantity;
    const { error: updateError } = await supabaseClient
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

    if (updateError) {
        alert('خطأ في تحديث المخزن: ' + updateError.message);
        return;
    }

    alert('تمت عملية البيع وحفظ الفاتورة بنجاح! 🎉');
    quantityInput.value = 1;
    select.value = '';
    loadProducts(); // إعادة تحميل المنتجات لتحديث المخزن في الواجهة
}

// 6. تسجيل الخروج
async function handleLogout() {
    localStorage.removeItem('user');
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
}