// reviews.js - đọc reviews.xml, tính sao trung bình, Rating Detail (Câu 5)

var reviews = [];      // mảng review: {id, productId, customerId, rating, date, content}
var reviewStats = {};  // thống kê theo product_id, vd reviewStats["1"] = {total: 12, count: 3, average: 4}
var customers = [];    // danh sách khách hàng (customers.json) để lấy tên người đánh giá

// Câu 5: đọc datasets/reviews.xml (loadXML dùng XMLHttpRequest + DOMParser), gom theo product_id
function loadReviews() {
    loadXML("datasets/reviews.xml", function (xmlDoc) {
        if (xmlDoc === null) {
            console.log("Không đọc được reviews.xml");
            return;
        }

        reviews = [];
        reviewStats = {};
        var nodes = xmlDoc.getElementsByTagName("review");

        for (var i = 0; i < nodes.length; i++) {
            var review = {
                id: nodes[i].getAttribute("id"),
                productId: nodes[i].getAttribute("product_id"),
                customerId: nodes[i].getAttribute("customer_id"),
                rating: Number(nodes[i].getAttribute("rating")),
                date: nodes[i].getAttribute("date"),
                content: nodes[i].textContent
            };
            reviews.push(review);

            // Gom theo product_id: cộng dồn tổng sao và đếm số lượt
            if (reviewStats[review.productId] === undefined) {
                reviewStats[review.productId] = { total: 0, count: 0, average: 0 };
            }
            reviewStats[review.productId].total += review.rating;
            reviewStats[review.productId].count += 1;
        }

        // Tính điểm trung bình, làm tròn 1 chữ số thập phân
        for (var productId in reviewStats) {
            var stat = reviewStats[productId];
            stat.average = Math.round(stat.total / stat.count * 10) / 10;
        }

        // Nếu sản phẩm đã render trước khi reviews tải xong thì gắn sao luôn
        showAverageRatings();
    });
}

// Đọc customers.json để biết tên khách theo customer_id
function loadCustomers() {
    loadJSON("datasets/customers.json", function (data) {
        if (data !== null) {
            customers = data;
        }
    });
}

// Lấy điểm trung bình của 1 sản phẩm (chưa có đánh giá thì trả về 0)
function getAverageRating(productId) {
    if (reviewStats[productId] === undefined) {
        return 0;
    }
    return reviewStats[productId].average;
}

// Lấy tên khách theo id; không tìm thấy thì trả về chính id
function getCustomerName(customerId) {
    for (var i = 0; i < customers.length; i++) {
        if (customers[i].id === customerId) {
            return customers[i].fullname;
        }
    }
    return customerId;
}

// Tạo chuỗi sao, vd rating = 4 thì ra "★★★★☆"
function makeStars(rating) {
    var stars = "";
    for (var i = 1; i <= 5; i++) {
        stars += (i <= rating) ? "★" : "☆";
    }
    return stars;
}

// Câu 5: với mỗi thẻ sản phẩm đang hiển thị, tạo span.avg-rating và chèn đè lên góc ảnh
// Được gọi sau mỗi lần renderProducts (kể cả sau khi lọc) và khi reviews vừa tải xong
function showAverageRatings() {
    var cards = document.querySelectorAll("#productList .product-card");

    for (var i = 0; i < cards.length; i++) {
        var imageBox = cards[i].querySelector(".product-image");

        // Xóa span cũ (nếu có) để không bị gắn 2 lần
        var oldSpan = imageBox.querySelector(".avg-rating");
        if (oldSpan !== null) {
            imageBox.removeChild(oldSpan);
        }

        var stat = reviewStats[cards[i].dataset.id];
        var span = document.createElement("span");
        span.className = "avg-rating";
        if (stat === undefined) {
            span.textContent = "Chưa có đánh giá";
        } else {
            span.textContent = "★ " + stat.average.toFixed(1) + " (" + stat.count + ")";
        }
        imageBox.appendChild(span);
    }
}

// Câu 5: mở popup Rating Detail liệt kê các đánh giá của 1 sản phẩm
function openRatingDetail(productId) {
    var product = findProductById(productId);

    // Lấy các review của sản phẩm này
    var list = [];
    for (var i = 0; i < reviews.length; i++) {
        if (reviews[i].productId === productId) {
            list.push(reviews[i]);
        }
    }
    // Sắp xếp ngày mới nhất lên đầu (ngày dạng yyyy-mm-dd nên so sánh chuỗi được)
    list.sort(function (a, b) {
        return a.date < b.date ? 1 : -1;
    });

    var html = '<h2>Đánh giá: ' + product.title + '</h2>';

    if (list.length === 0) {
        html += '<p class="message">Sản phẩm chưa có đánh giá nào.</p>';
    } else {
        var stat = reviewStats[productId];
        html += '<p class="rating-summary"><span class="stars">' + makeStars(Math.round(stat.average)) + '</span> ' +
                stat.average.toFixed(1) + ' / 5 - ' + stat.count + ' lượt đánh giá</p>';
        html += '<ul class="review-list">';
        for (var j = 0; j < list.length; j++) {
            var r = list[j];
            html += '<li>' +
                '<div class="review-head">' +
                    '<strong>' + getCustomerName(r.customerId) + '</strong>' +
                    '<span class="review-date">' + r.date + '</span>' +
                '</div>' +
                '<div class="stars">' + makeStars(r.rating) + '</div>' +
                '<p>' + r.content + '</p>' +
            '</li>';
        }
        html += '</ul>';
    }

    document.getElementById("ratingDetailContent").innerHTML = html;
    document.getElementById("ratingDetail").showModal();
}

// Chạy khi trang được nạp
loadCustomers();
loadReviews();
