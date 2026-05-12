# 🚀 QuizAI — Hướng dẫn Deploy từng bước

## Tổng quan
Ứng dụng tạo bài trắc nghiệm từ tài liệu bằng Gemini AI.
Tech stack: Next.js · Tailwind CSS · Supabase · Gemini 2.5 Flash

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


## Câu hỏi?

Chụp màn hình lỗi và hỏi Claude để được hỗ trợ tiếp.
