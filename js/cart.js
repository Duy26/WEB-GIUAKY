// cart.js - đối tượng giỏ hàng + mini-cart (Câu 6)
// Lưu ý: các hàm findProductById, findVariant, showToast nằm ở events.js và formatPrice ở products.js.
// Chúng chỉ được gọi khi người dùng thao tác (lúc đó mọi file js đã nạp xong) nên thứ tự nạp file không ảnh hưởng.

// Câu 6: đối tượng giỏ hàng
var cart = {
    // mỗi phần tử: {productId, sku, title, color, size, price, quantity, image}
    items: [],

    // Tìm vị trí item cùng productId và cùng sku trong giỏ, không có thì trả về -1
    findIndex: function (productId, sku) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].productId === productId && this.items[i].sku === sku) {
                return i;
            }
        }
        return -1;
    },

    // Thêm 1 sản phẩm (theo variant) vào giỏ; đã có thì tăng số lượng; không cho vượt tồn kho
    add: function (productId, sku) {
        var product = findProductById(productId);
        var variant = (product === null) ? null : findVariant(product, sku);
        if (variant === null) {
            showToast("Không tìm thấy sản phẩm!");
            return false;
        }

        var index = this.findIndex(productId, sku);
        var currentQuantity = (index === -1) ? 0 : this.items[index].quantity;

        // Kiểm tra tồn kho: số lượng trong giỏ + 1 không được lớn hơn stock của variant
        if (currentQuantity + 1 > variant.stock) {
            showToast("Không thể thêm: " + variant.color + " - " + variant.size +
                      " chỉ còn " + variant.stock + " sản phẩm trong kho");
            return false;
        }

        if (index === -1) {
            this.items.push({
                productId: productId,
                sku: sku,
                title: product.title,
                color: variant.color,
                size: variant.size,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        } else {
            this.items[index].quantity = this.items[index].quantity + 1;
        }

        this.save();
        this.render();
        showToast("Đã thêm vào giỏ: " + product.title + " (" + variant.color + " - " + variant.size + ")");
        return true;
    },

    // Xóa 1 item khỏi giỏ
    remove: function (productId, sku) {
        var index = this.findIndex(productId, sku);
        if (index !== -1) {
            this.items.splice(index, 1);
            this.save();
            this.render();
        }
    },

    // Tăng/giảm số lượng 1 item (delta = 1 hoặc -1); về 0 thì xóa; không cho vượt tồn kho
    changeQuantity: function (productId, sku, delta) {
        var index = this.findIndex(productId, sku);
        if (index === -1) {
            return;
        }

        var newQuantity = this.items[index].quantity + delta;
        if (newQuantity <= 0) {
            this.remove(productId, sku);
            return;
        }

        var variant = findVariant(findProductById(productId), sku);
        if (newQuantity > variant.stock) {
            showToast("Không thể tăng: chỉ còn " + variant.stock + " sản phẩm trong kho");
            return;
        }

        this.items[index].quantity = newQuantity;
        this.save();
        this.render();
    },

    // Tính tổng tiền = tổng (giá x số lượng); tính lại mỗi lần gọi nên luôn đúng với giỏ hiện tại
    getTotal: function () {
        var total = 0;
        for (var i = 0; i < this.items.length; i++) {
            total = total + this.items[i].price * this.items[i].quantity;
        }
        return total;
    },

    // Tính tổng số lượng sản phẩm trong giỏ (để hiện trên nút giỏ hàng)
    getCount: function () {
        var count = 0;
        for (var i = 0; i < this.items.length; i++) {
            count = count + this.items[i].quantity;
        }
        return count;
    },

    // Lưu giỏ vào localStorage key "cart" (dạng chuỗi JSON)
    save: function () {
        localStorage.setItem("cart", JSON.stringify(this.items));
    },

    // Đọc giỏ từ localStorage; chưa có hoặc dữ liệu hỏng thì giỏ rỗng
    load: function () {
        var data = localStorage.getItem("cart");
        if (data === null) {
            this.items = [];
            return;
        }
        try {
            this.items = JSON.parse(data);
        } catch (e) {
            console.log("Dữ liệu giỏ hàng trong localStorage bị lỗi", e);
            this.items = [];
        }
    },

    // Vẽ lại số lượng trên nút giỏ hàng, bảng mini-cart và tổng tiền
    render: function () {
        document.getElementById("cartCount").textContent = this.getCount();
        document.getElementById("cartTotal").textContent = formatPrice(this.getTotal());

        var content = document.getElementById("miniCartContent");
        var checkoutButton = document.getElementById("checkoutButton");

        if (this.items.length === 0) {
            content.innerHTML = '<p class="cart-empty">Giỏ hàng đang trống</p>';
            checkoutButton.disabled = true;
            return;
        }
        checkoutButton.disabled = false;

        var rows = "";
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            // các nút đều có data-action, data-id, data-variant để xử lý bằng 1 listener (event delegation)
            var dataAttr = ' data-id="' + item.productId + '" data-variant="' + item.sku + '"';
            rows += '<tr>' +
                '<td><img src="' + item.image + '" alt="' + item.title + '"></td>' +
                '<td class="cart-title">' + item.title + '</td>' +
                '<td>' + item.color + ' / ' + item.size + '</td>' +
                '<td class="cart-quantity">' +
                    '<button type="button" class="qty-btn" data-action="decrease"' + dataAttr + '>-</button>' +
                    '<span>' + item.quantity + '</span>' +
                    '<button type="button" class="qty-btn" data-action="increase"' + dataAttr + '>+</button>' +
                '</td>' +
                '<td>' + formatPrice(item.price * item.quantity) + '</td>' +
                '<td><button type="button" class="remove-btn" data-action="remove"' + dataAttr + ' title="Xóa">✕</button></td>' +
            '</tr>';
        }

        content.innerHTML = '<table class="cart-table">' +
            '<thead><tr><th>Ảnh</th><th>Tên</th><th>Màu/Size</th><th>SL</th><th>Thành tiền</th><th>Xóa</th></tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
        '</table>';
    }
};

// Câu 6: bật/tắt mini-cart khi bấm nút giỏ hàng ở header
function toggleMiniCart() {
    var miniCart = document.getElementById("miniCart");
    var isOpen = miniCart.classList.toggle("open"); // toggle trả về true nếu vừa thêm class
    document.getElementById("cartButton").setAttribute("aria-expanded", isOpen);
}

// Câu 6: đóng mini-cart
function closeMiniCart() {
    document.getElementById("miniCart").classList.remove("open");
    document.getElementById("cartButton").setAttribute("aria-expanded", "false");
}

// Câu 6: khi tải trang, đọc giỏ cũ từ localStorage rồi hiển thị
cart.load();
cart.render();
