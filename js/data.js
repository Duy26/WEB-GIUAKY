// data.js - các hàm đọc file dữ liệu dùng chung cho mọi trang

// Đọc file XML bằng XMLHttpRequest, chuyển thành xmlDoc bằng DOMParser rồi gọi callback(xmlDoc)
// Nếu lỗi thì console.log lỗi và gọi callback(null)
function loadXML(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                // Nếu file XML sai cú pháp, DOMParser sẽ tạo thẻ <parsererror>
                if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                    console.log("Lỗi cú pháp XML trong file: " + url);
                    callback(null);
                } else {
                    callback(xmlDoc);
                }
            } else {
                console.log("Không đọc được file " + url + " (status " + xhr.status + ")");
                callback(null);
            }
        }
    };
    xhr.send();
}

// Đọc file JSON bằng XMLHttpRequest, chuyển thành mảng/đối tượng bằng JSON.parse rồi gọi callback(data)
// Nếu lỗi thì console.log lỗi và gọi callback(null)
function loadJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    callback(data);
                } catch (e) {
                    console.log("Lỗi cú pháp JSON trong file: " + url, e);
                    callback(null);
                }
            } else {
                console.log("Không đọc được file " + url + " (status " + xhr.status + ")");
                callback(null);
            }
        }
    };
    xhr.send();
}
