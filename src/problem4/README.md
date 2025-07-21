# CRUD Resource API (Express + TypeScript + Prisma)

## 📦 Yêu cầu
- Node.js >= 16
- PostgreSQL (Docker khuyến nghị, xem db.docker-compose.yml)

## 🚀 Cài đặt

```bash
npm install
```

## 🗄️ Khởi tạo database với Docker

```bash
docker compose -f db.docker-compose.yml up -d
```

## 🛠️ Migrate database

```bash
npx prisma migrate dev --name init
```

## ▶️ Chạy server

```bash
npm run dev
```

## 📚 API Endpoints

- `POST   /api/resources`         : Tạo resource mới
- `GET    /api/resources`         : Lấy tất cả resource
- `GET    /api/resources/:id`     : Lấy resource theo id
- `PUT    /api/resources/:id`     : Cập nhật resource
- `DELETE /api/resources/:id`     : Xóa resource
- `POST   /api/resources/postmain`: Nạp nhiều resource từ body (bulk import)

## 🧩 Sử dụng Postman để kiểm thử và nạp dữ liệu hàng loạt

1. Mở Postman và import file `documents/resource.postman.exmaple.json` vào Postman (File > Import > chọn file này).
2. Trong collection sẽ có sẵn các request mẫu cho CRUD và bulk import.
3. Để nạp nhiều resource:
   - Chọn request `POST /api/resources/postmain` trong collection.
   - Vào tab `Body`, chọn `raw` và `JSON`.
   - Dán hoặc chỉnh sửa mảng JSON, ví dụ:
     ```json
     [
       { "name": "Resource Docker 1", "type": "docker-type1" },
       { "name": "Resource Docker 2", "type": "docker-type2" }
     ]
     ```
   - Nhấn `Send` để nạp dữ liệu.

## 🧪 Test

```bash
npm test
```

Các test sẽ kiểm tra toàn bộ route, bao gồm cả nạp nhiều resource từ body hoặc file.
