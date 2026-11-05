// products.js - render danh sách, skeleton, lọc tìm kiếm (Câu 2, 3)

// Mảng chứa tất cả sản phẩm (mỗi phần tử là 1 object), dùng chung cho các file js khác
var products = [];

// Lấy nội dung chữ của thẻ con đầu tiên có tên tagName trong phần tử element
function getText(element, tagName) {
    return element.getElementsByTagName(tagName)[0].textContent;
}

// Câu 2: chuyển xmlDoc (products.xml) thành mảng object sản phẩm
function parseProducts(xmlDoc) {
    var list = [];
    var productNodes = xmlDoc.getElementsByTagName("product");

    for (var i = 0; i < productNodes.length; i++) {
        var node = productNodes[i];
        var ratingNode = node.getElementsByTagName("rating")[0];
        var variantNodes = node.getElementsByTagName("variant");

        // Đọc danh sách variant và tính tổng tồn kho
        var variants = [];
        var totalStock = 0;
        for (var j = 0; j < variantNodes.length; j++) {
            var v = {
                sku: variantNodes[j].getAttribute("sku"),
                color: variantNodes[j].getAttribute("color"),
                size: variantNodes[j].getAttribute("size"),
                stock: Number(variantNodes[j].getAttribute("stock"))
            };
            variants.push(v);
            totalStock = totalStock + v.stock;
        }

        list.push({
            id: node.getAttribute("id"),
            title: getText(node, "title"),
            price: Number(getText(node, "price")),
            category: getText(node, "category"),
            description: getText(node, "description"),
            image: getText(node, "image"),
            rate: Number(ratingNode.getAttribute("rate")),
            count: Number(ratingNode.getAttribute("count")),
            variants: variants,
            totalStock: totalStock
        });
    }
    return list;
}

// Định dạng giá dạng $109.95
function formatPrice(price) {
    return "$" + price.toFixed(2);
}

// Tìm variant đầu tiên còn hàng của sản phẩm (để làm data-variant mặc định)
function getFirstInStockVariant(product) {
    for (var i = 0; i < product.variants.length; i++) {
        if (product.variants[i].stock > 0) {
            return product.variants[i];
        }
    }
    return product.variants[0];
}

// Tạo các thẻ <option> cho ô chọn variant; variant hết hàng thì ghi thêm "(hết hàng)"
// (Câu 4: nếu bấm Thêm vào giỏ với variant hết hàng thì handleAdd trong events.js sẽ báo lỗi)
function createVariantOptions(product, selectedSku) {
    var html = "";
    for (var i = 0; i < product.variants.length; i++) {
        var v = product.variants[i];
        var text = v.color + " - " + v.size;
        var extra = "";
        if (v.stock === 0) {
            text = text + " (hết hàng)";
        }
        if (v.sku === selectedSku) {
            extra = " selected";
        }
        html += '<option value="' + v.sku + '"' + extra + '>' + text + '</option>';
    }
    return html;
}

// Câu 2: tạo HTML của 1 thẻ article.product-card
function createProductCard(product) {
    var sku = getFirstInStockVariant(product).sku;

    return '<article class="product-card" data-id="' + product.id + '">' +
        '<div class="product-image">' +
            '<img src="' + product.image + '" alt="' + product.title + '" loading="lazy">' +
        '</div>' +
        '<div class="product-info">' +
            '<h3 class="product-title">' + product.title + '</h3>' +
            '<p class="product-price">' + formatPrice(product.price) + '</p>' +
            '<p class="product-category">' + product.category + '</p>' +
            '<label class="variant-label">Màu - Size:' +
                '<select class="variant-select" data-id="' + product.id + '">' +
                    createVariantOptions(product, sku) +
                '</select>' +
            '</label>' +
            '<div class="product-actions">' +
                '<button type="button" class="btn btn-primary" data-action="add" data-id="' + product.id + '" data-variant="' + sku + '">Thêm vào giỏ hàng</button>' +
                '<button type="button" class="btn" data-action="quick" data-id="' + product.id + '" data-variant="' + sku + '">Xem nhanh</button>' +
                '<button type="button" class="btn" data-action="rating" data-id="' + product.id + '" data-variant="' + sku + '">Rating Detail</button>' +
            '</div>' +
        '</div>' +
    '</article>';
}

// Câu 2: render danh sách sản phẩm vào section#productList
function renderProducts(list) {
    var section = document.getElementById("productList");

    if (list.length === 0) {
        section.innerHTML = '<p class="message">Không tìm thấy sản phẩm phù hợp</p>';
        return;
    }

    var html = "";
    for (var i = 0; i < list.length; i++) {
        html += createProductCard(list[i]);
    }
    section.innerHTML = html;

    // Câu 5: gắn sao trung bình (reviews.js) lên ảnh các thẻ vừa render
    showAverageRatings();
}

// Thêm các option vào select; values là mảng chuỗi
function addOptions(select, values) {
    for (var i = 0; i < values.length; i++) {
        var option = document.createElement("option");
        option.value = values[i];
        option.textContent = values[i];
        select.appendChild(option);
    }
}

// Câu 2: lấy danh sách danh mục và màu (không trùng) từ mảng products, đưa vào 2 ô select
function fillSearchSelects() {
    var categories = [];
    var colors = [];

    for (var i = 0; i < products.length; i++) {
        if (categories.indexOf(products[i].category) === -1) {
            categories.push(products[i].category);
        }
        for (var j = 0; j < products[i].variants.length; j++) {
            var color = products[i].variants[j].color;
            if (colors.indexOf(color) === -1) {
                colors.push(color);
            }
        }
    }

    categories.sort();
    colors.sort();
    addOptions(document.getElementById("searchCategory"), categories);
    addOptions(document.getElementById("searchColor"), colors);
}

// Câu 3: render count thẻ skeleton (khung xám giả ảnh + dòng chữ) trong lúc chờ dữ liệu
function renderSkeleton(count) {
    var html = "";
    for (var i = 0; i < count; i++) {
        html += '<article class="skeleton-card" aria-hidden="true">' +
            '<div class="skeleton-image"></div>' +
            '<div class="skeleton-body">' +
                '<div class="skeleton-line"></div>' +
                '<div class="skeleton-line medium"></div>' +
                '<div class="skeleton-line short"></div>' +
            '</div>' +
        '</article>';
    }
    document.getElementById("productList").innerHTML = html;
}

// Câu 7: áp dụng tồn kho đã lưu trong localStorage "stock" (dạng {"sku": stock})
// để sau khi thanh toán, tải lại trang tồn kho vẫn giữ giá trị mới; tính lại tổng tồn kho
function applySavedStock(list) {
    var saved;
    try {
        saved = JSON.parse(localStorage.getItem("stock")) || {};
    } catch (e) {
        saved = {};
    }

    for (var i = 0; i < list.length; i++) {
        var total = 0;
        for (var j = 0; j < list[i].variants.length; j++) {
            var v = list[i].variants[j];
            if (saved[v.sku] !== undefined) {
                v.stock = Number(saved[v.sku]);
            }
            total = total + v.stock;
        }
        list[i].totalStock = total;
    }
}

// Câu 2: đọc datasets/products.xml, lưu vào mảng products rồi render
function loadProducts() {
    // Câu 3: hiện 8 thẻ skeleton trước khi dữ liệu tải xong
    renderSkeleton(8);

    loadXML("datasets/products.xml", function (xmlDoc) {
        if (xmlDoc === null) {
            document.getElementById("productList").innerHTML =
                '<p class="message">Không tải được dữ liệu sản phẩm.</p>';
            return;
        }
        // Câu 3: ĐỘ TRỄ GIẢ LẬP 1,5 giây để kịp thấy skeleton khi chụp test case
        // (file local tải quá nhanh nên nếu không có dòng này sẽ không thấy skeleton)
        setTimeout(function () {
            products = parseProducts(xmlDoc);
            applySavedStock(products); // Câu 7: dùng tồn kho đã lưu (nếu có) trước khi render
            fillSearchSelects();
            renderProducts(products);
        }, 1500);
    });
}

// ===================== Câu 2: form tìm kiếm nâng cao =====================

// Hiện thông báo lỗi của 1 ô ngay dưới ô đó (ô lỗi có id = id ô nhập + "Error")
function showFieldError(input) {
    var errorEl = document.getElementById(input.id + "Error");
    var message = input.validationMessage;
    // Lỗi sai pattern thì hiện nội dung title cho dễ hiểu
    if (input.validity.patternMismatch) {
        message = input.title;
    }
    errorEl.textContent = message;
}

// Kiểm tra "giá từ" không được lớn hơn "giá đến", dùng setCustomValidity để báo lỗi
function checkPriceRange() {
    var priceFrom = document.getElementById("priceFrom");
    var priceTo = document.getElementById("priceTo");

    if (priceFrom.value !== "" && priceTo.value !== "" &&
        Number(priceFrom.value) > Number(priceTo.value)) {
        priceTo.setCustomValidity("Giá đến phải lớn hơn hoặc bằng giá từ");
    } else {
        priceTo.setCustomValidity("");
    }
    showFieldError(priceTo);
}

// Kiểm tra sản phẩm có variant màu color không
function hasColor(product, color) {
    for (var i = 0; i < product.variants.length; i++) {
        if (product.variants[i].color === color) {
            return true;
        }
    }
    return false;
}

// Câu 2: lọc mảng products theo các điều kiện trong form, trả về mảng kết quả
function filterProducts() {
    var name = document.getElementById("searchName").value.trim().toLowerCase();
    var priceFrom = Number(document.getElementById("priceFrom").value);
    var priceTo = Number(document.getElementById("priceTo").value);
    var color = document.getElementById("searchColor").value;
    var minRating = Number(document.getElementById("minRating").value);
    var category = document.getElementById("searchCategory").value;

    var result = [];
    for (var i = 0; i < products.length; i++) {
        var p = products[i];
        var ok = true;

        if (name !== "" && p.title.toLowerCase().indexOf(name) === -1) ok = false;
        if (p.price < priceFrom || p.price > priceTo) ok = false;
        if (color !== "all" && hasColor(p, color) === false) ok = false;
        // Câu 5: lọc theo sao trung bình tính từ reviews.xml (không dùng rating gốc của fakestoreapi)
        if (getAverageRating(p.id) < minRating) ok = false;
        if (category !== "all" && p.category !== category) ok = false;

        if (ok) {
            result.push(p);
        }
    }
    return result;
}

// Xử lý khi bấm "Tìm kiếm": chặn tải lại trang, kiểm tra hợp lệ rồi lọc và render
function onSearchSubmit(event) {
    event.preventDefault();
    checkPriceRange();

    var form = document.getElementById("searchForm");
    // reportValidity() trả về false nếu còn ô sai, đồng thời trình duyệt hiện bong bóng lỗi
    if (form.reportValidity() === false) {
        return;
    }
    renderProducts(filterProducts());
}

// Xử lý khi bấm "Xóa lọc": xóa lỗi, đưa rating về 1 và hiện lại tất cả sản phẩm
function onSearchReset() {
    document.getElementById("priceTo").setCustomValidity("");
    document.getElementById("searchNameError").textContent = "";
    document.getElementById("priceFromError").textContent = "";
    document.getElementById("priceToError").textContent = "";
    document.getElementById("ratingValue").textContent = "1";
    renderProducts(products);
}

// Gắn sự kiện cho form tìm kiếm
function setupSearchForm() {
    var form = document.getElementById("searchForm");
    var searchName = document.getElementById("searchName");
    var priceFrom = document.getElementById("priceFrom");
    var priceTo = document.getElementById("priceTo");
    var minRating = document.getElementById("minRating");

    form.addEventListener("submit", onSearchSubmit);
    form.addEventListener("reset", onSearchReset);

    // Gõ tới đâu kiểm tra tới đó, lỗi hiện ngay dưới ô
    searchName.addEventListener("input", function () { showFieldError(searchName); });
    priceFrom.addEventListener("input", function () { showFieldError(priceFrom); checkPriceRange(); });
    priceTo.addEventListener("input", checkPriceRange);

    // Sự kiện invalid xảy ra khi trình duyệt kiểm tra thấy ô sai (lúc bấm submit)
    searchName.addEventListener("invalid", function () { showFieldError(searchName); });
    priceFrom.addEventListener("invalid", function () { showFieldError(priceFrom); });
    priceTo.addEventListener("invalid", function () { showFieldError(priceTo); });

    // Hiển thị giá trị rating đang chọn khi kéo thanh trượt
    minRating.addEventListener("input", function () {
        document.getElementById("ratingValue").textContent = minRating.value;
    });
}

// Chạy khi trang được nạp
setupSearchForm();
loadProducts();
