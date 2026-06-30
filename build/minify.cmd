@echo off
REM Glint — sürüm senkronu + minify.
REM Sürümü build\version.js'ten değiştir, sonra bunu çalıştır.
REM Derlenen .min dosyaları build\dist\ klasörüne gelir.
node "%~dp0scripts\build.mjs" %*
