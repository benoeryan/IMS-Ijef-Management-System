# Perbaikan OpenRouter & Hardcode API Key

User mengalami error "No endpoints found" saat menggunakan OpenRouter dan meminta agar API Key disematkan langsung di dalam kode program untuk memudahkan penggunaan.

## Perubahan yang Diusulkan

### [Component Name] Legal AI Module

#### [MODIFY] [modules-legal.js](file:///C:/Users/Lenovo/StudioProjects/hr-legal-app/modules-legal.js)

1.  **Hardcode API Key**: Menyematkan key OpenRouter user sebagai nilai default jika tidak ada key yang tersimpan di browser.
2.  **Perbaikan Model OpenRouter**: Menggunakan model ID yang lebih stabil (`google/gemini-flash-1.5`) dan menambahkan logika fallback ke model lain jika terjadi error "No endpoints found".
3.  **Refinement `askGemini`**: Memastikan prioritas penggunaan key: Key di localStorage (jika ada) > Key Hardcoded.

## Verification Plan

### Manual Verification
1.  Buka Legal Suite.
2.  Cek apakah AI langsung siap tanpa perlu input key (karena sudah hardcoded).
3.  Kirim pesan "hallo".
4.  Pastikan respon muncul dari OpenRouter tanpa error "No endpoints found".
