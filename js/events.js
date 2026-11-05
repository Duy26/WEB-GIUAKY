// events.js - event delegation (Câu 4)
// Chỉ gắn listener trên section#productList, các nút bên trong dùng chung listener đó

// Tìm sản phẩm trong mảng products (khai báo ở products.js) theo id
function findProductById(id) {
    for (var i = 0; i < products.length; i++) {
        if (products[i].id === id) {
            return products[i];
        }
    }
    return null;
}

// Tìm variant của sản phẩm theo sku
function findVariant(product, sku) {
    for (var i = 0; i < product.variants.length; i++) {
        if (product.variants[i].sku === sku) {
            return product.variants[i];
        }
    }
    return null;
}

// Hiện thông báo nhỏ ở góc màn hình, tự ẩn sau 2 giây
var toastTimer = null;
function showToast(message) {
    var toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer); // bấm liên tục thì đếm lại từ đầu
    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2000);
}

// Câu 4 + Câu 6: nút "Thêm vào giỏ hàng" - kiểm tra hết hàng rồi gọi cart.add (cart.js)
function handleAdd(id, sku) {
    var product = findProductById(id);
    var variant = findVariant(product, sku);

    // Không cho thêm variant hết hàng
    if (variant === null || variant.stock === 0) {
        showToast("Variant " + sku + " đã hết hàng, không thể thêm vào giỏ");
        return;
    }
    console.log("Thêm vào giỏ: id=" + id + ", variant=" + sku);
    cart.add(id, sku); // Câu 6
}

// Câu 4: nút "Xem nhanh" - điền thông tin sản phẩm vào dialog rồi mở ra
function openQuickView(id, sku) {
    var product = findProductById(id);

    // Bảng các variant và tồn kho; variant đang chọn được tô đậm
    var rows = "";
    for (var i = 0; i < product.variants.length; i++) {
        var v = product.variants[i];
        var rowClass = (v.sku === sku) ? ' class="selected"' : "";
        var stockText = (v.stock === 0) ? "Hết hàng" : v.stock;
        rows += "<tr" + rowClass + "><td>" + v.color + "</td><td>" + v.size +
                "</td><td>" + stockText + "</td></tr>";
    }

    document.getElementById("quickViewContent").innerHTML =
        '<div class="quick-view-body">' +
            '<img src="' + product.image + '" alt="' + product.title + '">' +
            '<div>' +
                '<h2>' + product.title + '</h2>' +
                '<p class="product-price">' + formatPrice(product.price) + '</p>' +
                '<p class="product-category">' + product.category + '</p>' +
                '<p>' + product.description + '</p>' +
                '<table class="variant-table">' +
                    '<thead><tr><th>Màu</th><th>Size</th><th>Tồn kho</th></tr></thead>' +
                    '<tbody>' + rows + '</tbody>' +
                '</table>' +
                '<p><strong>Tổng tồn kho:</strong> ' + product.totalStock + '</p>' +
            '</div>' +
        '</div>';

    // showModal() mở dialog dạng popup, có lớp nền mờ phía sau, phím Esc để đóng
    document.getElementById("quickView").showModal();
}

// Câu 4 + Câu 5: nút "Rating Detail" - mở popup danh sách đánh giá (hàm ở reviews.js)
function handleRating(id, sku) {
    console.log("Rating Detail: id=" + id + ", variant=" + sku);
    openRatingDetail(id);
}

// Câu 4: hàm xử lý click DUY NHẤT cho cả danh sách sản phẩm (event delegation)
// Vì sao chỉ cần 1 listener: khi bấm 1 nút bên trong thẻ sản phẩm, sự kiện click "nổi bọt" (bubble)
// từ nút lên các phần tử cha (article -> section#productList). Listener đặt ở section sẽ nhận được
// mọi cú bấm bên trong; sau đó closest("[data-action]") đi ngược lên từ phần tử bị bấm (event.target)
// để tìm ra đúng nút. Nhờ vậy không cần gắn listener cho từng nút, kể cả nút mới render sau khi lọc.
function onProductListClick(event) {
    var button = event.target.closest("[data-action]");
    if (button === null) {
        return; // bấm vào chỗ không phải nút (ảnh, chữ, ô chọn...) thì bỏ qua
    }

    // Tìm thẻ .product-card chứa nút, đọc variant đang chọn trong ô .variant-select của thẻ đó
    // rồi gán vào data-variant của nút được bấm (thay cho listener "change" trước đây)
    var card = button.closest(".product-card");
    var select = card.querySelector(".variant-select");
    button.dataset.variant = select.value;

    var action = button.dataset.action;   // đọc data-action
    var id = button.dataset.id;           // đọc data-id
    var sku = button.dataset.variant;     // đọc data-variant (vừa cập nhật ở trên)

    if (action === "add") {
        handleAdd(id, sku);               // variant hết hàng thì handleAdd báo lỗi, không thêm vào giỏ
    } else if (action === "quick") {
        openQuickView(id, sku);
    } else if (action === "rating") {
        handleRating(id, sku);
    }
}

// Câu 6: hàm xử lý click DUY NHẤT cho các nút trong mini-cart (+, -, Xóa, Thanh toán)
function onMiniCartClick(event) {
    var button = event.target.closest("[data-action]");
    if (button === null) {
        return;
    }

    var action = button.dataset.action;
    var id = button.dataset.id;
    var sku = button.dataset.variant;

    if (action === "increase") {
        cart.changeQuantity(id, sku, 1);
    } else if (action === "decrease") {
        cart.changeQuantity(id, sku, -1);
    } else if (action === "remove") {
        cart.remove(id, sku);
    } else if (action === "checkout") {
        // Câu 7: mở popup thanh toán (hàm ở checkout.js)
        openCheckout();
    }
}

// Câu 4: gắn DUY NHẤT 1 listener lên section cha (event delegation)
var productListSection = document.getElementById("productList");
productListSection.addEventListener("click", onProductListClick);

// Câu 6: nút giỏ hàng ở header bật/tắt mini-cart; khung mini-cart dùng 1 listener cho mọi nút bên trong
document.getElementById("cartButton").addEventListener("click", toggleMiniCart);
document.getElementById("miniCart").addEventListener("click", onMiniCartClick);

// Link "Giỏ hàng" trên menu: không nhảy trang mà bật/tắt mini-cart
document.querySelector('nav a[href="#cart"]').addEventListener("click", function (event) {
    event.preventDefault();
    toggleMiniCart();
});
