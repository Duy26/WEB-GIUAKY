// admin.js - đăng nhập + dashboard (Câu 8)
// File này dùng chung cho admin/login.html và admin/dashboard.html.
// Trang nào có phần tử nào thì chạy phần của trang đó (xem cuối file).

var STATUSES = ["Pending", "Shipping", "Completed", "Cancelled"];

// Định dạng tiền dạng $109.95
function formatMoney(value) {
    return "$" + value.toFixed(2);
}

// Lấy nhân viên đang đăng nhập từ sessionStorage (chưa đăng nhập thì null)
function getCurrentEmployee() {
    var data = sessionStorage.getItem("currentEmployee");
    if (data === null) {
        return null;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

// Tìm phần tử trong mảng theo id (dùng cho customers, employees)
function findById(list, id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
            return list[i];
        }
    }
    return null;
}

// ======================= Câu 8: TRANG ĐĂNG NHẬP =======================

// Xử lý đăng nhập: đọc employees.json, so username/password
function onAdminLogin(event) {
    event.preventDefault();
    var username = document.getElementById("adminUsername").value.trim();
    var password = document.getElementById("adminPassword").value;
    var errorEl = document.getElementById("adminLoginError");

    loadJSON("../datasets/employees.json", function (employees) {
        if (employees === null) {
            errorEl.textContent = "Không đọc được dữ liệu nhân viên, vui lòng thử lại.";
            return;
        }

        var found = null;
        for (var i = 0; i < employees.length; i++) {
            if (employees[i].username === username && employees[i].password === password) {
                found = employees[i];
            }
        }

        if (found === null) {
            errorEl.textContent = "Sai tên đăng nhập hoặc mật khẩu!";
            return;
        }

        // Đúng: lưu sessionStorage (không lưu mật khẩu) rồi chuyển sang dashboard
        sessionStorage.setItem("currentEmployee", JSON.stringify({
            id: found.id,
            username: found.username,
            fullname: found.fullname,
            role: found.role
        }));
        location.href = "dashboard.html";
    });
}

function setupLoginPage() {
    // Đã đăng nhập rồi thì vào thẳng dashboard
    if (getCurrentEmployee() !== null) {
        location.href = "dashboard.html";
        return;
    }
    document.getElementById("adminLoginForm").addEventListener("submit", onAdminLogin);
    // Gõ lại thì xóa dòng lỗi cũ
    document.getElementById("adminLoginForm").addEventListener("input", function () {
        document.getElementById("adminLoginError").textContent = "";
    });
}

// ======================= Câu 8: TRANG DASHBOARD =======================

var allOrders = [];     // đơn gộp từ carts.xml + localStorage "orders"
var productInfo = {};   // productInfo["1"] = {title, category} đọc từ products.xml
var customerList = [];  // customers.json
var employeeList = [];  // employees.json
var cartsDoc = null;    // xmlDoc của carts.xml
var loadedCount = 0;    // số file dữ liệu đã tải xong (cần đủ 4 file)

// Đọc products.xml thành object tra cứu tên + danh mục theo id
function parseProductInfo(xmlDoc) {
    var nodes = xmlDoc.getElementsByTagName("product");
    for (var i = 0; i < nodes.length; i++) {
        productInfo[nodes[i].getAttribute("id")] = {
            title: nodes[i].getElementsByTagName("title")[0].textContent,
            category: nodes[i].getElementsByTagName("category")[0].textContent
        };
    }
}

// Tên sản phẩm theo id (không có thì hiện "Sản phẩm #id")
function getProductTitle(productId) {
    return productInfo[productId] ? productInfo[productId].title : "Sản phẩm #" + productId;
}

// Đọc mảng đơn đặt trên web từ localStorage "orders"
function loadWebOrders() {
    try {
        return JSON.parse(localStorage.getItem("orders")) || [];
    } catch (e) {
        return [];
    }
}

// Đọc các trạng thái đã đổi của đơn trong carts.xml (không sửa được file XML nên lưu riêng)
// Dạng: {"HD001": "Completed", ...} trong localStorage key "orderStatus"
function loadStatusChanges() {
    try {
        return JSON.parse(localStorage.getItem("orderStatus")) || {};
    } catch (e) {
        return {};
    }
}

// Câu 8: gộp đơn từ carts.xml và localStorage "orders" thành 1 mảng cùng cấu trúc
function buildAllOrders() {
    allOrders = [];
    var statusChanges = loadStatusChanges();

    // 1) Đơn trong carts.xml
    if (cartsDoc !== null) {
        var cartNodes = cartsDoc.getElementsByTagName("cart");
        for (var i = 0; i < cartNodes.length; i++) {
            var node = cartNodes[i];
            var items = [];
            var total = 0;
            var itemNodes = node.getElementsByTagName("item");
            for (var j = 0; j < itemNodes.length; j++) {
                var item = {
                    productId: itemNodes[j].getAttribute("product_id"),
                    sku: itemNodes[j].getAttribute("sku"),
                    color: itemNodes[j].getAttribute("color"),
                    size: itemNodes[j].getAttribute("size"),
                    quantity: Number(itemNodes[j].getAttribute("quantity")),
                    price: Number(itemNodes[j].getAttribute("price"))
                };
                item.title = getProductTitle(item.productId);
                items.push(item);
                total = total + item.quantity * item.price;
            }

            var id = node.getAttribute("id");
            var customer = findById(customerList, node.getAttribute("customer_id"));
            var employee = findById(employeeList, node.getAttribute("employee_id"));

            allOrders.push({
                id: id,
                created: node.getAttribute("created"),
                source: "xml",
                customerKey: node.getAttribute("customer_id"),
                customer: customer || { fullname: node.getAttribute("customer_id"), phone: "", email: "", address: "" },
                employeeName: employee ? employee.fullname : node.getAttribute("employee_id"),
                note: "",
                paymentMethod: node.getAttribute("payment_method") || "",
                shippingAddress: node.getAttribute("shipping_address") || (customer ? customer.address : ""),
                items: items,
                total: Math.round(total * 100) / 100,
                // nếu đã đổi trạng thái thì lấy trạng thái mới
                status: statusChanges[id] || node.getAttribute("status")
            });
        }
    }

    // 2) Đơn đặt trên web (Câu 7)
    var webOrders = loadWebOrders();
    for (var k = 0; k < webOrders.length; k++) {
        var o = webOrders[k];
        allOrders.push({
            id: o.id,
            created: o.created,
            source: "web",
            // khách vãng lai không có id thì dùng số điện thoại để phân biệt
            customerKey: o.customer.id || o.customer.phone,
            customer: o.customer,
            employeeName: "Đơn online",
            note: o.note || "",
            // đơn cũ (đặt trước khi có 2 trường này) thì để trống / lấy địa chỉ khách
            paymentMethod: o.payment_method || "",
            shippingAddress: o.shipping_address || o.customer.address,
            items: o.items,
            total: o.total,
            status: o.status
        });
    }

    // Sắp xếp ngày mới nhất lên đầu
    allOrders.sort(function (a, b) {
        return a.created < b.created ? 1 : -1;
    });
}

// Tổng số lượng sản phẩm trong 1 đơn
function countItems(order) {
    var count = 0;
    for (var i = 0; i < order.items.length; i++) {
        count = count + order.items[i].quantity;
    }
    return count;
}

// Tạo ô select trạng thái cho 1 đơn (chọn sẵn trạng thái hiện tại)
function createStatusSelect(order) {
    var html = '<select class="status-select status-' + order.status + '" data-id="' + order.id + '">';
    for (var i = 0; i < STATUSES.length; i++) {
        var selected = (STATUSES[i] === order.status) ? " selected" : "";
        html += '<option value="' + STATUSES[i] + '"' + selected + '>' + STATUSES[i] + '</option>';
    }
    return html + '</select>';
}

// Câu 8: vẽ bảng đơn hàng theo bộ lọc trạng thái
function renderOrders() {
    var filter = document.getElementById("statusFilter").value;
    var html = "";

    for (var i = 0; i < allOrders.length; i++) {
        var order = allOrders[i];
        if (filter !== "all" && order.status !== filter) {
            continue;
        }
        html += '<tr class="order-row" data-id="' + order.id + '">' +
            '<td><strong>' + order.id + '</strong></td>' +
            '<td class="nowrap">' + order.created + '</td>' +
            '<td>' + order.customer.fullname + '</td>' +
            '<td>' + order.employeeName + '</td>' +
            '<td>' + countItems(order) + '</td>' +
            '<td>' + formatMoney(order.total) + '</td>' +
            '<td>' + createStatusSelect(order) + '</td>' +
        '</tr>';
    }

    if (html === "") {
        html = '<tr><td colspan="7" class="empty">Không có đơn hàng nào</td></tr>';
    }
    document.getElementById("ordersBody").innerHTML = html;
}

// Câu 8: đổi trạng thái 1 đơn và lưu vào localStorage
function changeOrderStatus(orderId, newStatus) {
    var order = findById(allOrders, orderId);
    order.status = newStatus;

    if (order.source === "web") {
        // Đơn web: sửa trực tiếp trong mảng "orders"
        var webOrders = loadWebOrders();
        for (var i = 0; i < webOrders.length; i++) {
            if (webOrders[i].id === orderId) {
                webOrders[i].status = newStatus;
            }
        }
        localStorage.setItem("orders", JSON.stringify(webOrders));
    } else {
        // Đơn trong carts.xml: lưu trạng thái mới vào "orderStatus"
        var changes = loadStatusChanges();
        changes[orderId] = newStatus;
        localStorage.setItem("orderStatus", JSON.stringify(changes));
    }

    renderOrders();
    renderStats(); // trạng thái đổi (vd thành Cancelled) thì số liệu thống kê cũng đổi
}

// Hiện phương thức thanh toán kèm giải thích tiếng Việt
function getPaymentText(method) {
    if (method === "COD") return "COD (thanh toán khi nhận hàng)";
    if (method === "Bank transfer") return "Bank transfer (chuyển khoản ngân hàng)";
    if (method === "E-wallet") return "E-wallet (ví điện tử)";
    return "-";
}

// Câu 8: hiện popup chi tiết hóa đơn
function showOrderDetail(orderId) {
    var order = findById(allOrders, orderId);
    var rows = "";
    for (var i = 0; i < order.items.length; i++) {
        var it = order.items[i];
        rows += '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td>' + it.title + '<br><small>SKU: ' + it.sku + '</small></td>' +
            '<td>' + it.color + ' / ' + it.size + '</td>' +
            '<td>' + it.quantity + '</td>' +
            '<td>' + formatMoney(it.price) + '</td>' +
            '<td>' + formatMoney(it.price * it.quantity) + '</td>' +
        '</tr>';
    }

    var c = order.customer;
    document.getElementById("orderDetailContent").innerHTML =
        '<h2>Hóa đơn ' + order.id + '</h2>' +
        '<div class="invoice-info">' +
            '<p><strong>Ngày tạo:</strong> ' + order.created + '</p>' +
            '<p><strong>Trạng thái:</strong> <span class="badge status-' + order.status + '">' + order.status + '</span></p>' +
            '<p><strong>Khách hàng:</strong> ' + c.fullname + '</p>' +
            '<p><strong>Điện thoại:</strong> ' + (c.phone || "-") + '</p>' +
            '<p><strong>Email:</strong> ' + (c.email || "-") + '</p>' +
            '<p><strong>Địa chỉ khách hàng:</strong> ' + (c.address || "-") + '</p>' +
            '<p><strong>Địa chỉ giao hàng:</strong> ' + (order.shippingAddress || "-") + '</p>' +
            '<p><strong>Phương thức thanh toán:</strong> ' + getPaymentText(order.paymentMethod) + '</p>' +
            '<p><strong>Nhân viên:</strong> ' + order.employeeName + '</p>' +
            '<p><strong>Ghi chú:</strong> ' + (order.note || "-") + '</p>' +
        '</div>' +
        '<div class="table-wrap">' +
            '<table class="admin-table">' +
                '<thead><tr><th>#</th><th>Sản phẩm</th><th>Màu/Size</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
                '<tfoot><tr><td colspan="5">Tổng cộng</td><td>' + formatMoney(order.total) + '</td></tr></tfoot>' +
            '</table>' +
        '</div>';

    document.getElementById("orderDetail").showModal();
}

// Câu 8: tính và vẽ toàn bộ phần thống kê (chỉ tính đơn không bị hủy, trừ "Tổng số đơn")
function renderStats() {
    var revenue = 0;
    var sold = 0;
    var customerKeys = [];   // các khách đã mua (không trùng)
    var soldByProduct = {};  // soldByProduct["1"] = {title, quantity, revenue}
    var revenueByCategory = {};

    for (var i = 0; i < allOrders.length; i++) {
        var order = allOrders[i];

        if (customerKeys.indexOf(order.customerKey) === -1) {
            customerKeys.push(order.customerKey);
        }
        if (order.status === "Cancelled") {
            continue; // đơn hủy không tính doanh thu và số lượng bán
        }

        revenue = revenue + order.total;
        for (var j = 0; j < order.items.length; j++) {
            var it = order.items[j];
            var money = it.price * it.quantity;
            sold = sold + it.quantity;

            if (soldByProduct[it.productId] === undefined) {
                soldByProduct[it.productId] = { title: it.title, quantity: 0, revenue: 0 };
            }
            soldByProduct[it.productId].quantity += it.quantity;
            soldByProduct[it.productId].revenue += money;

            var category = productInfo[it.productId] ? productInfo[it.productId].category : "khác";
            revenueByCategory[category] = (revenueByCategory[category] || 0) + money;
        }
    }

    // Các thẻ số liệu
    document.getElementById("statOrders").textContent = allOrders.length;
    document.getElementById("statRevenue").textContent = formatMoney(revenue);
    document.getElementById("statSold").textContent = sold;
    document.getElementById("statCustomers").textContent = customerKeys.length;

    // Bảng sản phẩm đã bán: chuyển object thành mảng rồi sắp xếp giảm dần theo số lượng (bằng nhau thì theo doanh thu)
    var list = [];
    for (var id in soldByProduct) {
        list.push(soldByProduct[id]);
    }
    list.sort(function (a, b) {
        if (b.quantity !== a.quantity) {
            return b.quantity - a.quantity;
        }
        return b.revenue - a.revenue;
    });

    var html = "";
    for (var k = 0; k < list.length; k++) {
        html += '<tr><td>' + list[k].title + '</td><td>' + list[k].quantity + '</td><td>' + formatMoney(list[k].revenue) + '</td></tr>';
    }
    if (html === "") {
        html = '<tr><td colspan="3" class="empty">Chưa có sản phẩm nào được bán</td></tr>';
    }
    document.getElementById("soldBody").innerHTML = html;

    renderCategoryChart(revenueByCategory);
}

// Câu 8: biểu đồ cột bằng div + CSS: chiều cao mỗi cột = doanh thu / doanh thu lớn nhất * 100%
function renderCategoryChart(data) {
    var max = 0;
    for (var key in data) {
        if (data[key] > max) {
            max = data[key];
        }
    }

    var html = "";
    for (var category in data) {
        var percent = (max === 0) ? 0 : data[category] / max * 100;
        // cột cao nhất thêm class bar-max để tô màu khác (chỉ là giao diện)
        var barClass = (data[category] === max) ? "bar bar-max" : "bar";
        html += '<div class="bar-item">' +
            '<span class="bar-value">' + formatMoney(data[category]) + '</span>' +
            '<div class="' + barClass + '" style="height: ' + percent + '%"></div>' +
            '<span class="bar-label">' + category + '</span>' +
        '</div>';
    }
    if (html === "") {
        html = '<p class="empty">Chưa có doanh thu</p>';
    }
    document.getElementById("categoryChart").innerHTML = html;
}

// Mỗi file dữ liệu tải xong thì gọi hàm này; đủ 4 file mới gộp đơn và vẽ
function onDataLoaded() {
    loadedCount = loadedCount + 1;
    if (loadedCount === 4) {
        buildAllOrders();
        renderOrders();
        renderStats();
    }
}

function setupDashboardPage() {
    // Chưa đăng nhập thì quay về trang đăng nhập
    var employee = getCurrentEmployee();
    if (employee === null) {
        location.href = "login.html";
        return;
    }
    document.getElementById("employeeName").textContent = employee.fullname;
    document.getElementById("employeeRole").textContent = employee.role;

    // Đăng xuất: xóa sessionStorage rồi về trang đăng nhập
    document.getElementById("logoutButton").addEventListener("click", function () {
        sessionStorage.removeItem("currentEmployee");
        location.href = "login.html";
    });

    document.getElementById("statusFilter").addEventListener("change", renderOrders);

    // Event delegation trên tbody: đổi trạng thái (change) và bấm dòng xem chi tiết (click)
    var ordersBody = document.getElementById("ordersBody");
    ordersBody.addEventListener("change", function (event) {
        if (event.target.classList.contains("status-select")) {
            changeOrderStatus(event.target.dataset.id, event.target.value);
        }
    });
    ordersBody.addEventListener("click", function (event) {
        if (event.target.closest("select") !== null) {
            return; // bấm vào ô chọn trạng thái thì không mở chi tiết
        }
        var row = event.target.closest(".order-row");
        if (row !== null) {
            showOrderDetail(row.dataset.id);
        }
    });

    // Tải 4 file dữ liệu (file lỗi vẫn đếm để trang không bị treo)
    loadXML("../datasets/carts.xml", function (xmlDoc) {
        cartsDoc = xmlDoc;
        onDataLoaded();
    });
    loadXML("../datasets/products.xml", function (xmlDoc) {
        if (xmlDoc !== null) {
            parseProductInfo(xmlDoc);
        }
        onDataLoaded();
    });
    loadJSON("../datasets/customers.json", function (data) {
        customerList = data || [];
        onDataLoaded();
    });
    loadJSON("../datasets/employees.json", function (data) {
        employeeList = data || [];
        onDataLoaded();
    });
}

// Trang nào có form/ bảng nào thì chạy phần của trang đó
if (document.getElementById("adminLoginForm") !== null) {
    setupLoginPage();
}
if (document.getElementById("ordersBody") !== null) {
    setupDashboardPage();
}
