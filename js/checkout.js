// checkout.js - form thanh toán + regex + localStorage (Câu 7)
// Dùng lại: cart (cart.js), customers (reviews.js), findProductById/findVariant/showToast (events.js),
// formatPrice/renderProducts/filterProducts (products.js)

// Câu 7: Regex tự viết
// SĐT Việt Nam: bắt đầu bằng 0 hoặc +84, sau đó là đầu số di động 3/5/7/8/9, rồi đúng 8 chữ số
// => 0912345678 (10 số) hoặc +84912345678
var PHONE_REGEX = /^(0|\+84)[35789][0-9]{8}$/;

// Email dạng ten@tenmien.duoi: tên gồm chữ, số, dấu . _ -; tên miền gồm chữ, số, dấu -;
// đuôi có ít nhất 2 chữ cái, có thể nhiều đuôi (vd st.uel.edu.vn)
var EMAIL_REGEX = /^[A-Za-z0-9._-]+@[A-Za-z0-9-]+(\.[A-Za-z]{2,})+$/;

// Các ô bắt buộc của form giao hàng (coPayment: ô chọn phương thức thanh toán)
var REQUIRED_FIELDS = ["coName", "coPhone", "coEmail", "coAddress", "coPayment"];

// Các ô được tự điền khi khách đăng nhập
var CUSTOMER_FIELDS = ["coName", "coPhone", "coEmail", "coAddress"];

// Trả về câu báo lỗi của 1 ô (chuỗi rỗng nghĩa là hợp lệ)
function getFieldError(id, value) {
    value = value.trim();

    if (id === "coName") {
        if (value === "") return "Vui lòng nhập họ tên";
        if (value.length < 2) return "Họ tên phải có ít nhất 2 ký tự";
    } else if (id === "coPhone") {
        if (value === "") return "Vui lòng nhập số điện thoại";
        if (PHONE_REGEX.test(value) === false) return "Số điện thoại không hợp lệ (vd: 0912345678 hoặc +84912345678)";
    } else if (id === "coEmail") {
        if (value === "") return "Vui lòng nhập email";
        if (EMAIL_REGEX.test(value) === false) return "Email không hợp lệ (vd: ten@gmail.com)";
    } else if (id === "coAddress") {
        if (value === "") return "Vui lòng nhập địa chỉ";
        if (value.length < 5) return "Địa chỉ quá ngắn (ít nhất 5 ký tự)";
    } else if (id === "coPayment") {
        if (value === "") return "Vui lòng chọn phương thức thanh toán";
    }
    return "";
}

// Kiểm tra tất cả ô bắt buộc (không hiện lỗi), trả về true nếu tất cả hợp lệ
function isCheckoutFormValid() {
    for (var i = 0; i < REQUIRED_FIELDS.length; i++) {
        var input = document.getElementById(REQUIRED_FIELDS[i]);
        if (getFieldError(input.id, input.value) !== "") {
            return false;
        }
    }
    return true;
}

// Nút "Xác nhận thanh toán" chỉ bật khi mọi ô bắt buộc hợp lệ
function updateConfirmButton() {
    document.getElementById("confirmButton").disabled = !isCheckoutFormValid();
}

// Câu 7: kiểm tra 1 ô và hiển thị: sai thì viền đỏ + dòng lỗi, đúng thì viền xanh
function validateField(input) {
    var error = getFieldError(input.id, input.value);
    document.getElementById(input.id + "Error").textContent = error;

    if (error === "") {
        input.classList.remove("invalid");
        input.classList.add("valid");
    } else {
        input.classList.remove("valid");
        input.classList.add("invalid");
    }
    updateConfirmButton();
}

// Xóa trạng thái đỏ/xanh và dòng lỗi của các ô (khi mở lại form)
function clearValidation() {
    for (var i = 0; i < REQUIRED_FIELDS.length; i++) {
        var input = document.getElementById(REQUIRED_FIELDS[i]);
        input.classList.remove("valid");
        input.classList.remove("invalid");
        document.getElementById(input.id + "Error").textContent = "";
    }
}

// ===================== Câu 7: đăng nhập khách hàng =====================

// Lấy khách đang đăng nhập từ localStorage key "currentCustomer" (chưa đăng nhập thì null)
function getCurrentCustomer() {
    var data = localStorage.getItem("currentCustomer");
    if (data === null) {
        return null;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

// Điền thông tin khách vào form giao hàng rồi kiểm tra luôn các ô đó
function fillCustomerInfo(customer) {
    document.getElementById("coName").value = customer.fullname;
    document.getElementById("coPhone").value = customer.phone;
    document.getElementById("coEmail").value = customer.email;
    document.getElementById("coAddress").value = customer.address;
    // chỉ kiểm tra 4 ô vừa điền (ô phương thức thanh toán để khách tự chọn)
    for (var i = 0; i < CUSTOMER_FIELDS.length; i++) {
        validateField(document.getElementById(CUSTOMER_FIELDS[i]));
    }
}

// Hiện form đăng nhập hoặc lời chào tùy theo đã đăng nhập chưa
function showLoginState() {
    var customer = getCurrentCustomer();
    document.getElementById("customerLoginForm").hidden = (customer !== null);
    document.getElementById("customerInfo").hidden = (customer === null);
    if (customer !== null) {
        document.getElementById("customerName").textContent = customer.fullname;
    }
}

// Xử lý đăng nhập: so username/password với danh sách customers (customers.json)
function onCustomerLogin(event) {
    event.preventDefault();
    var username = document.getElementById("loginUsername").value.trim();
    var password = document.getElementById("loginPassword").value;

    var found = null;
    for (var i = 0; i < customers.length; i++) {
        if (customers[i].username === username && customers[i].password === password) {
            found = customers[i];
        }
    }

    if (found === null) {
        document.getElementById("loginError").textContent = "Sai tên đăng nhập hoặc mật khẩu";
        return;
    }

    // Lưu khách đăng nhập (không lưu mật khẩu)
    var info = {
        id: found.id,
        username: found.username,
        fullname: found.fullname,
        phone: found.phone,
        email: found.email,
        address: found.address
    };
    localStorage.setItem("currentCustomer", JSON.stringify(info));

    document.getElementById("loginError").textContent = "";
    document.getElementById("loginPassword").value = "";
    showLoginState();
    fillCustomerInfo(info);
}

// Đăng xuất: xóa currentCustomer, hiện lại form đăng nhập
function onCustomerLogout() {
    localStorage.removeItem("currentCustomer");
    showLoginState();
}

// ===================== Câu 7: mở form & đặt hàng =====================

// Hiện tóm tắt các món trong giỏ và tổng tiền ở đầu form
function renderOrderSummary() {
    var html = "<ul>";
    for (var i = 0; i < cart.items.length; i++) {
        var item = cart.items[i];
        html += "<li>" + item.title + " (" + item.color + " / " + item.size + ") x " + item.quantity +
                " = " + formatPrice(item.price * item.quantity) + "</li>";
    }
    html += "</ul><p><strong>Tổng tiền: " + formatPrice(cart.getTotal()) + "</strong></p>";
    document.getElementById("orderSummary").innerHTML = html;
}

// Câu 7: mở popup thanh toán; giỏ trống thì báo không thể thanh toán
function openCheckout() {
    if (cart.items.length === 0) {
        showToast("Giỏ hàng đang trống, không thể thanh toán!");
        return;
    }
    closeMiniCart();

    document.getElementById("checkoutArea").hidden = false;
    document.getElementById("checkoutSuccess").hidden = true;
    document.getElementById("checkoutForm").reset();
    clearValidation();
    renderOrderSummary();
    showLoginState();

    // Đã đăng nhập từ trước thì tự điền thông tin
    var customer = getCurrentCustomer();
    if (customer !== null) {
        fillCustomerInfo(customer);
    }
    updateConfirmButton();

    document.getElementById("checkout").showModal();
}

// Đổi ngày thành chuỗi yyyy-mm-dd (giống thuộc tính created trong carts.xml)
function formatDate(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return date.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
}

// Đọc mảng đơn hàng từ localStorage key "orders" (chưa có thì mảng rỗng)
function loadOrders() {
    var data = localStorage.getItem("orders");
    if (data === null) {
        return [];
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// Câu 7: lưu tồn kho mới của các variant vừa bán vào localStorage "stock" (dạng {"sku": stock})
// products.js sẽ đọc lại key này khi tải trang (hàm applySavedStock)
function saveChangedStock(items) {
    var saved;
    try {
        saved = JSON.parse(localStorage.getItem("stock")) || {};
    } catch (e) {
        saved = {};
    }
    for (var i = 0; i < items.length; i++) {
        var variant = findVariant(findProductById(items[i].productId), items[i].sku);
        saved[items[i].sku] = variant.stock;
    }
    localStorage.setItem("stock", JSON.stringify(saved));
}

// Câu 7: bấm "Xác nhận thanh toán": tạo đơn, lưu localStorage, giảm tồn kho, xóa giỏ
function placeOrder(event) {
    event.preventDefault();

    // Kiểm tra lại tất cả ô một lần nữa (hiện lỗi nếu có)
    for (var i = 0; i < REQUIRED_FIELDS.length; i++) {
        validateField(document.getElementById(REQUIRED_FIELDS[i]));
    }
    if (isCheckoutFormValid() === false) {
        return;
    }

    // Kiểm tra tồn kho lần cuối trước khi đặt
    for (var j = 0; j < cart.items.length; j++) {
        var check = findVariant(findProductById(cart.items[j].productId), cart.items[j].sku);
        if (check === null || cart.items[j].quantity > check.stock) {
            showToast("Sản phẩm " + cart.items[j].title + " không đủ hàng, vui lòng giảm số lượng");
            return;
        }
    }

    // Tạo đơn hàng (cấu trúc giống 1 <cart> trong carts.xml)
    var now = new Date();
    var current = getCurrentCustomer();
    var items = [];
    for (var k = 0; k < cart.items.length; k++) {
        var it = cart.items[k];
        items.push({
            productId: it.productId,
            sku: it.sku,
            title: it.title,
            color: it.color,
            size: it.size,
            quantity: it.quantity,
            price: it.price
        });
    }

    var order = {
        id: "WEB" + now.getTime(),   // mã đơn = WEB + số mili giây hiện tại
        created: formatDate(now),
        customer: {
            id: (current !== null) ? current.id : "",   // khách vãng lai thì để trống
            fullname: document.getElementById("coName").value.trim(),
            phone: document.getElementById("coPhone").value.trim(),
            email: document.getElementById("coEmail").value.trim(),
            address: document.getElementById("coAddress").value.trim()
        },
        note: document.getElementById("coNote").value.trim(),
        payment_method: document.getElementById("coPayment").value,              // COD / Bank transfer / E-wallet
        shipping_address: document.getElementById("coAddress").value.trim(),     // giống thuộc tính trong carts.xml
        items: items,
        total: Math.round(cart.getTotal() * 100) / 100,
        status: "Pending"
    };

    // Thêm vào mảng orders trong localStorage
    var orders = loadOrders();
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    // Giảm tồn kho trong bộ nhớ (mảng products)
    for (var m = 0; m < items.length; m++) {
        var product = findProductById(items[m].productId);
        var variant = findVariant(product, items[m].sku);
        variant.stock = variant.stock - items[m].quantity;
        product.totalStock = product.totalStock - items[m].quantity;
    }
    saveChangedStock(items); // lưu tồn kho mới vào localStorage "stock"

    // Xóa giỏ và vẽ lại danh sách sản phẩm để thấy tồn kho mới
    cart.items = [];
    cart.save();
    cart.render();
    renderProducts(filterProducts());

    // Hiện thông báo thành công kèm mã đơn
    document.getElementById("checkoutArea").hidden = true;
    var success = document.getElementById("checkoutSuccess");
    success.innerHTML = "<h2>✔ Thanh toán thành công</h2>" +
        "<p>Mã đơn hàng: <strong>" + order.id + "</strong></p>" +
        "<p>Tổng tiền: <strong>" + formatPrice(order.total) + "</strong></p>" +
        "<p>Trạng thái: Pending (chờ xử lý)</p>";
    success.hidden = false;
    showToast("Thanh toán thành công! Mã đơn: " + order.id);
}

// ===================== Câu 7: gắn sự kiện =====================
function setupCheckout() {
    // Kiểm tra ngay khi gõ (keyup) và khi rời ô (blur)
    for (var i = 0; i < REQUIRED_FIELDS.length; i++) {
        var input = document.getElementById(REQUIRED_FIELDS[i]);
        input.addEventListener("keyup", function () { validateField(this); });
        input.addEventListener("blur", function () { validateField(this); });
    }
    // Ô select chọn bằng chuột không có keyup nên kiểm tra thêm khi đổi lựa chọn (change)
    document.getElementById("coPayment").addEventListener("change", function () { validateField(this); });

    document.getElementById("checkoutForm").addEventListener("submit", placeOrder);
    document.getElementById("customerLoginForm").addEventListener("submit", onCustomerLogin);
    document.getElementById("logoutButton").addEventListener("click", onCustomerLogout);

    // Link "Thanh toán" trên menu: không nhảy trang mà mở popup thanh toán
    document.querySelector('nav a[href="#checkout"]').addEventListener("click", function (event) {
        event.preventDefault();
        openCheckout();
    });
}

setupCheckout();
