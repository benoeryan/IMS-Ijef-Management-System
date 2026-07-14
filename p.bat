@echo off
echo [1/4] Mengambil update terbaru dari GitHub...
git pull origin main --rebase

echo [2/4] Menyiapkan file...
git add .

echo [3/4] Membuat catatan perubahan (commit)...
git commit -m "Auto-update: Fitur Drafting, Header, Footer & Upload Gambar"

echo [4/4] Mengirim ke GitHub...
git push

echo.
echo ====================================================
echo SELESAI! Perubahan sudah dikirim.
echo Tunggu 1 menit lalu lakukan Hard Refresh (Ctrl+F5) di browser.
echo ====================================================
pause