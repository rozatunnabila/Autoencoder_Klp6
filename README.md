# Jernih

Aplikasi web untuk mengurangi bintik (noise) dan membantu penajaman foto menggunakan Autoencoder berbasis TensorFlow.js. Dibuat sebagai proyek UAS mata kuliah Artificial Intelligence, Kelompok 6.

Model dilatih langsung dari foto yang dipilih pengguna. Tidak diperlukan dataset eksternal atau model terlatih sebelumnya. Pelatihan dan pemrosesan gambar berlangsung di browser; foto tidak dikirim ke server.

## Fitur

- Unggah foto dari perangkat atau gunakan gambar contoh buatan program.
- Analisis sederhana terhadap indikasi noise dan ketajaman untuk menyarankan mode; pengguna dapat menggantinya secara manual.
- Mode **Hilangkan noise** untuk mencoba mengurangi bintik.
- Mode **Perjelas gambar** untuk membantu mempertegas detail yang masih tersedia.
- Tambahkan noise garam dan merica dengan kepadatan 1–15% untuk demonstrasi.
- Atur langkah pelatihan 100–600, dengan nilai awal 300.
- Atur kekuatan perjelas 0,5–2,0, dengan nilai awal 1,0.
- Pantau progres pelatihan dan nilai loss yang diperbarui setiap 10 langkah.
- Bandingkan gambar sebelum dan sesudah dengan penggeser.
- Unduh hasil sebagai `jernih-hasil.png`.

## Teknologi

| Teknologi | Kegunaan |
| --- | --- |
| HTML | Struktur halaman |
| CSS | Tampilan dan tata letak responsif |
| JavaScript | Interaksi, analisis gambar, dan alur pemrosesan |
| TensorFlow.js 4.22.0 | Membangun, melatih, dan menjalankan model |
| Canvas API | Membaca, menampilkan, dan menyimpan gambar |

TensorFlow.js dimuat dari CDN dan font dimuat dari Google Fonts. Internet diperlukan untuk memuat sumber eksternal tersebut. Tidak perlu Node.js, npm, Python ML, API key, atau database untuk menjalankan model.

## Struktur Folder

Letakkan isi folder `jernih` dari ZIP pada root repository:

```text
index.html
css/
  style.css
js/
  app.js
.vscode/
  launch.json
README.md
```

`index.html` berisi halaman Beranda, Cara kerja, Studio, dan Tanya jawab. `css/style.css` mengatur tampilan. `js/app.js` memuat interaksi, pemuatan gambar, deteksi, pembuatan noise, model, pelatihan, dan unduh hasil. `.vscode/launch.json` merupakan konfigurasi debug opsional dan tidak menjalankan server.

## Cara Menjalankan

### Menggunakan VS Code dan Live Server

1. Unduh/clone repository, lalu buka folder yang berisi `index.html` di VS Code.
2. Pasang ekstensi **Live Server** jika belum tersedia.
3. Klik kanan `index.html`, kemudian pilih **Open with Live Server**.
4. Pastikan perangkat terhubung ke internet agar TensorFlow.js dan font berhasil dimuat.

### Alternatif dengan Python

Jika Python sudah terpasang, buka terminal pada folder yang berisi `index.html`, lalu jalankan:

```bash
python -m http.server 8080
```

Buka `http://localhost:8080` di browser. Python pada cara ini hanya menyediakan server file lokal; model tetap berjalan melalui JavaScript di browser. Hentikan server dengan `Ctrl+C`.

## Cara Menggunakan

1. Buka bagian **Studio**.
2. Klik **Pilih foto** atau **Pakai contoh**. Gambar contoh otomatis diberi bintik.
3. Periksa mode yang disarankan sistem. Pilih **Hilangkan noise** atau **Perjelas gambar** sesuai kebutuhan.
4. Jika ingin mencoba noise buatan, atur **Kepadatan bintik**, lalu klik **Tambah bintik**. Penekanan berulang menambah bintik pada gambar yang sedang tampil; muat ulang foto untuk kembali ke awal.
5. Atur **Langkah latih**. **Kekuatan perjelas** hanya berpengaruh pada mode penajaman.
6. Klik **Proses foto** dan tunggu hingga selesai. Waktu bergantung pada ukuran foto, jumlah langkah, browser, dan perangkat.
7. Geser pembatas untuk membandingkan hasil, kemudian klik **Unduh hasil (PNG)**.

## Cara Kerja Model

Foto disesuaikan hingga maksimal 768 piksel pada sisi terpanjang, lalu dimensi dibulatkan ke kelipatan empat. Nilai piksel dinormalisasi ke rentang 0–1. Setiap langkah pelatihan mengambil 16 potongan acak berukuran hingga 64 × 64 piksel dari foto yang sama.

| Mode | Input pelatihan | Target |
| --- | --- | --- |
| Hilangkan noise | Potongan foto dengan tambahan bintik hitam/putih sekitar 6% | Potongan foto awal |
| Perjelas gambar | Potongan foto dengan tambahan blur Gaussian dan noise Gaussian ringan | Potongan foto awal |

Target berasal dari foto pengguna, sehingga belum tentu benar-benar bersih atau tajam. Kepadatan noise latihan denoising tetap sekitar 6%; slider kepadatan bintik mengatur demonstrasi pada foto masukan, bukan parameter noise latihan tersebut.

Arsitektur memakai konvolusi 3 × 3 dengan susunan filter 16 → 32 → 48 → 32 → 16 → 3, dua pooling, dan dua upsampling. Mode denoising menggunakan output sigmoid (37.875 parameter). Mode penajaman memakai skip connection dan output residual/koreksi (42.915 parameter). Koreksi dikalikan kekuatan perjelas dan ditambahkan ke gambar masukan.

| Parameter | Nilai |
| --- | --- |
| Batch | 16 potongan per langkah |
| Langkah | 100–600; default 300 |
| Loss | L1 / mean absolute error |
| Optimizer | Adam |
| Learning rate denoising | 0,003 |
| Learning rate penajaman | 0,002 |
| Blur tambahan untuk latihan penajaman | Gaussian 7 × 7, sigma 1,3 |

L1 menghitung kesalahan antara hasil dan target. Adam memperbarui bobot untuk mengurangi kesalahan tersebut. Setelah pelatihan, model memproses foto penuh. Model dibangun dan dilatih ulang setiap tombol proses dijalankan; bobot tidak disimpan.

## Deteksi Otomatis

Sistem membandingkan nilai abu-abu setiap piksel dengan median delapan tetangganya. Selisih lebih dari 70 dihitung sebagai indikasi bintik. Rasio di atas 1% menyarankan mode denoising. Jika tidak, mode penajaman dipilih; variansi Laplacian di bawah 100 dipakai untuk memberi keterangan bahwa gambar tampak buram. Ini heuristik sederhana, bukan diagnosis pasti terhadap kualitas foto.

## Keterbatasan dan Evaluasi

- Pengurangan bintik dapat ikut menghaluskan tepi, mengurangi tekstur, atau mengubah warna.
- Penajaman tidak menjamin pengembalian detail yang hilang akibat blur berat.
- Lebih banyak langkah pelatihan tidak selalu memberikan hasil lebih baik.
- Hasil dapat berbeda antarproses karena bobot awal, noise, dan potongan latihan bersifat acak.
- Foto besar dan banyak langkah membutuhkan komputasi lebih berat; hasil unduhan mengikuti ukuran pemrosesan.
- Pengujian kualitas pada versi ini dilakukan secara visual. Kode belum menghitung PSNR/SSIM, mencatat waktu otomatis, atau menyediakan filter median sebagai pembanding.
- Ilustrasi sebelum–sesudah pada beranda bersifat dekoratif, bukan bukti keluaran model.

## Anggota Kelompok 6

| Nama | NPM |
| --- | --- |
| Almira Sadida | 2408107010004 |
| Rozatun Nabila | 2408107010010 |
| Illiza Khairamisa | 2408107010017 |
| Hani Huriyah Ahmad | 2408107010020 |
| Dedek Saleha | 2408107010023 |

Program Studi Informatika, Universitas Syiah Kuala.
