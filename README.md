# 🚀 QuizAI — Hướng dẫn Deploy từng bước

## Tổng quan
Ứng dụng tạo bài trắc nghiệm từ tài liệu bằng Gemini AI.
Tech stack: Next.js · Tailwind CSS · Supabase · Gemini 1.5 Flash

---

## BƯỚC 1 — Lấy Gemini API Key (miễn phí)

1. Vào https://aistudio.google.com
2. Đăng nhập bằng Google
3. Bấm **Get API Key** → **Create API key**
4. Copy key (dạng: AIzaSy...)
5. Lưu lại, dùng ở Bước 4

---

## BƯỚC 2 — Tạo Database trên Supabase (miễn phí)

1. Vào https://supabase.com → Sign up
2. Bấm **New project** → đặt tên (vd: quizai) → chọn region Singapore → đặt password → Create
3. Chờ ~2 phút cho project khởi động
4. Vào **SQL Editor** (menu trái) → **New query**
5. Copy toàn bộ nội dung file `supabase_schema.sql` → paste vào → bấm **Run**
6. Vào **Project Settings** → **API**:
   - Copy **Project URL** (dạng: https://xxx.supabase.co)
   - Copy **anon public** key
   - Copy **service_role** key (bấm Reveal)
7. Lưu lại 3 giá trị trên

### Bật Email Auth:
- Vào **Authentication** → **Providers** → **Email** → bật **Enable Email provider** → Save

---

## BƯỚC 3 — Đưa code lên GitHub

1. Vào https://github.com → Sign up / Login
2. Bấm **+** → **New repository**
3. Đặt tên: `quizai` → bấm **Create repository**
4. Tải GitHub Desktop: https://desktop.github.com
5. Cài xong → Clone repo vừa tạo về máy
6. Copy toàn bộ thư mục code vào folder vừa clone
7. Trong GitHub Desktop → bấm **Commit to main** → **Push origin**

---

## BƯỚC 4 — Deploy lên Vercel (miễn phí)

1. Vào https://vercel.com → Sign up bằng GitHub
2. Bấm **Add New Project** → Import repo `quizai`
3. **QUAN TRỌNG**: Trước khi bấm Deploy, vào **Environment Variables** và thêm 4 biến sau:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL từ Supabase (bước 2) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key từ Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key từ Supabase |
| `GEMINI_API_KEY` | API key từ Google AI Studio |

4. Bấm **Deploy**
5. Chờ ~2 phút → Vercel sẽ cấp link web dạng: `https://quizai-xxx.vercel.app`

---

## BƯỚC 5 — Test thử

1. Mở link Vercel vừa tạo
2. Đăng ký tài khoản bằng email
3. Check email → bấm link xác nhận
4. Đăng nhập → Upload file PDF/ảnh thử
5. Chọn loại câu hỏi → Tạo quiz

---

## Cấu trúc file

```
quizai/
├── pages/
│   ├── index.js          # Trang chính
│   ├── history.js        # Lịch sử bài làm
│   └── api/
│       ├── generate.js   # API tạo câu hỏi
│       └── save-session.js # API lưu kết quả
├── components/
│   ├── Auth.js           # Đăng nhập / đăng ký
│   ├── UploadStep.js     # Upload file + cấu hình
│   ├── MultipleChoice.js # Bài trắc nghiệm
│   ├── Essay.js          # Bài tự luận
│   ├── Flashcard.js      # Flashcard
│   └── ResultScreen.js   # Kết quả + tiếp tục
├── lib/
│   ├── gemini.js         # Kết nối Gemini API
│   ├── supabase.js       # Kết nối Supabase
│   └── extractText.js    # Đọc nội dung file
├── styles/globals.css
├── supabase_schema.sql   # SQL tạo database
└── .env.local.example    # Mẫu biến môi trường
```

---

## Nếu gặp lỗi

- **Lỗi "Cannot find module"**: Chạy `npm install` trong thư mục project
- **Lỗi API key**: Kiểm tra lại Environment Variables trên Vercel
- **Lỗi database**: Kiểm tra đã chạy SQL schema chưa
- **Lỗi file quá lớn**: Giới hạn Vercel free tier là 4.5MB/request — nếu cần 20MB, nâng lên Vercel Pro

---

## Câu hỏi?

Chụp màn hình lỗi và hỏi Claude để được hỗ trợ tiếp.
