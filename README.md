# BW08 - MU Shop

Bài thi thử giữa kỳ môn **Phát triển Web Kinh doanh** - Mã đề **BW08**: mini web bán hàng giả lập, dữ liệu gốc từ [fakestoreapi.com/products](https://fakestoreapi.com/products).

| | |
|---|---|
| Họ tên | **Lê Thanh Bảo Duy** |
| MSSV | **K244161775** |
| Lớp | K24416 |
| Link trang web (GitHub Pages) | _(điền sau)_ |

Công nghệ: HTML5, CSS3, JavaScript thuần (không framework, không thư viện). Dữ liệu đọc bằng `XMLHttpRequest`, XML đọc bằng `DOMParser`. Thao tác của người dùng lưu bằng `localStorage` / `sessionStorage`.

## Tài khoản demo

| Vai trò | Tên đăng nhập | Mật khẩu | Dùng ở đâu |
|---|---|---|---|
| Khách hàng | `nguyenvanan` | `123456` | Khung đăng nhập trong popup Thanh toán (trang chủ) |
| Admin | `admin` | `admin123` | `admin/login.html` (nút "Đăng nhập" trên header, cạnh nút Giỏ hàng) |

Ngoài ra còn 4 khách khác trong `datasets/customers.json` (mật khẩu đều là `123456`) và 2 nhân viên `staff01`, `staff02` (mật khẩu `staff123`).

## Cách chạy

- **Online:** mở link GitHub Pages ở trên (`index.html` là trang chủ).
- **Trên máy:** mở thư mục bằng VS Code → chuột phải `index.html` → **Open with Live Server** (`http://127.0.0.1:5500`). Không mở trực tiếp bằng `file://`, vì trình duyệt sẽ chặn `XMLHttpRequest` đọc file dữ liệu.
- Muốn về dữ liệu ban đầu: F12 → Application → Local Storage → Clear.

## Các câu và file thực hiện

| Câu | Nội dung | File |
|---|---|---|
| 1 | Thiết kế dữ liệu XML/JSON; trang công cụ đọc fakestoreapi, tạo `products.xml` bằng DOM (`createDocument`, `createElement`, `setAttribute`), bổ sung variants (màu/size/tồn kho), tải file về bằng `XMLSerializer` + `Blob` | `tools/build-products.html`, `datasets/products.xml`, `customers.json`, `employees.json`, `carts.xml`, `reviews.xml` |
| 2 | Trang bán hàng dùng thẻ ngữ nghĩa; đọc `products.xml` và render thẻ sản phẩm; form tìm kiếm nâng cao với validation HTML5, `setCustomValidity`, lọc theo tên, giá, màu, rating, danh mục | `index.html`, `js/data.js`, `js/products.js`, `css/main.css` |
| 3 | Bố cục Flexbox (aside + section), lưới CSS Grid 4/2/1 cột theo `@media`, Skeleton Loading có hiệu ứng shimmer bằng `@keyframes` | `css/main.css`, `js/products.js` (`renderSkeleton`) |
| 4 | Event delegation: **1 listener click duy nhất** trên `section#productList`, dùng `closest("[data-action]")` + `dataset` (`data-id`, `data-variant`); popup Xem nhanh | `js/events.js` |
| 5 | Đọc `reviews.xml`, tính sao trung bình theo sản phẩm, chèn `span.avg-rating` lên góc ảnh; popup Rating Detail (tên khách lấy từ `customers.json`) | `js/reviews.js` |
| 6 | Đối tượng `cart` (add, remove, changeQuantity, getTotal, getCount, save, load, render), kiểm tra tồn kho, mini-cart `position: absolute`, lưu `localStorage` | `js/cart.js` |
| 7 | Form thanh toán: đăng nhập khách, Regex số điện thoại VN và email, kiểm tra khi `keyup`/`blur`, phương thức thanh toán; tạo đơn lưu `localStorage`, giảm và lưu tồn kho | `js/checkout.js` |
| 8 | Đăng nhập nhân viên (`sessionStorage`), dashboard: bảng đơn gộp `carts.xml` + đơn web, lọc và đổi trạng thái, chi tiết hóa đơn, thẻ thống kê, bảng sản phẩm bán chạy, biểu đồ cột bằng div + CSS | `admin/login.html`, `admin/dashboard.html`, `js/admin.js`, `css/admin.css` |
| 9 | Đưa lên GitHub Pages: mọi đường dẫn là đường dẫn tương đối, tên file viết thường khớp chính xác; README, `.gitignore` | toàn bộ thư mục, `README.md`, `.gitignore` |

## Dữ liệu lưu trên trình duyệt

| Key | Nơi lưu | Nội dung |
|---|---|---|
| `cart` | localStorage | Giỏ hàng hiện tại |
| `orders` | localStorage | Các đơn đặt trên web (trạng thái ban đầu `Pending`) |
| `stock` | localStorage | Tồn kho đã thay đổi sau khi thanh toán, dạng `{"sku": stock}` |
| `currentCustomer` | localStorage | Khách đang đăng nhập (không lưu mật khẩu) |
| `orderStatus` | localStorage | Trạng thái mới của các đơn trong `carts.xml` do admin đổi |
| `currentEmployee` | sessionStorage | Nhân viên đang đăng nhập trang admin |

## Cấu trúc thư mục

```
index.html                 trang bán hàng (Câu 2-7)
admin/login.html           đăng nhập nhân viên (Câu 8)
admin/dashboard.html       quản lý đơn hàng + thống kê (Câu 8)
tools/build-products.html  công cụ tạo products.xml (Câu 1)
datasets/                  products.xml, carts.xml, reviews.xml, customers.json, employees.json
css/                       main.css (trang bán hàng), admin.css (trang admin)
js/                        data.js, products.js, reviews.js, cart.js, events.js, checkout.js, admin.js
images/                    ảnh (nếu cần)
```

---

Lê Thanh Bảo Duy - K244161775
