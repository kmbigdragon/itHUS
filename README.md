<p align="center">
  <img src="public/itHUS_LOGO.webp" alt="itHUS" width="280" />
</p>

<p align="center">
  Ghi chép các môn học Toán – Tin, Khoa Toán – Cơ – Tin học, Trường ĐH Khoa học Tự nhiên, ĐHQG Hà Nội.
</p>

<p align="center">
  <a href="https://ithus.bigdragon.info.vn">Trang web</a> ·
  <a href="https://github.com/kmbigdragon/itHUS/issues/new">Báo lỗi / Góp ý</a> ·
  <a href="LICENSE">Giấy phép MIT</a>
</p>

---

itHUS là dự án mã nguồn mở. Tài liệu này hướng dẫn cách chạy dự án, cách đặt tên và tổ chức file, cách viết một bài bằng MDX và cách gửi đóng góp.

## Mục lục

- [Bạn có thể đóng góp gì](#bạn-có-thể-đóng-góp-gì)
- [Sửa nhanh ngay trên GitHub](#sửa-nhanh-ngay-trên-github)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Chạy dự án ở máy](#chạy-dự-án-ở-máy)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Tổ chức nội dung](#tổ-chức-nội-dung)
- [Đặt tên file và thư mục](#đặt-tên-file-và-thư-mục)
- [Viết bài bằng MDX](#viết-bài-bằng-mdx)
- [Thêm môn học mới](#thêm-môn-học-mới)
- [Gửi Pull Request](#gửi-pull-request)

## Bạn có thể đóng góp gì

- Sửa chỗ sai: công thức, lỗi chính tả, ví dụ tính nhầm.
- Viết thêm bài cho môn đã có.
- Viết môn mới (các môn ở mục "Đang cập nhật").
- Thêm đề thi, tài liệu PDF. Chỉ đăng tài liệu bạn được phép chia sẻ.
- Cải thiện giao diện hoặc code.

Không quen Git? Bạn có thể [mở một issue](https://github.com/kmbigdragon/itHUS/issues/new) để báo lỗi hoặc gợi ý bài mới.

## Sửa nhanh ngay trên GitHub

Với lỗi nhỏ như sai chính tả hay sai dấu, bạn không cần cài gì:

1. Mở file bài viết trong thư mục [`content/`](content) trên GitHub.
2. Bấm biểu tượng bút chì (**Edit this file**).
3. Sửa, rồi bấm **Commit changes…** → **Propose changes**.
4. GitHub sẽ tự tạo bản fork và mở Pull Request cho bạn.

Với thay đổi lớn hơn (bài mới, hình minh hoạ, code), hãy chạy dự án ở máy để xem trước.

## Công nghệ sử dụng

| Thư viện | Dùng để |
| --- | --- |
| [Next.js 16](https://nextjs.org) (App Router, Turbopack) | Khung web, sinh trang tĩnh từ thư mục `content/` |
| [React 19](https://react.dev) + React Compiler | Giao diện |
| [TypeScript](https://www.typescriptlang.org) | Kiểu dữ liệu cho code |
| [Tailwind CSS 4](https://tailwindcss.com) + `@tailwindcss/typography` | Định dạng giao diện |
| [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) | Đọc và hiển thị file `.mdx` |
| [remark-gfm](https://github.com/remarkjs/remark-gfm) | Bảng, gạch ngang chữ, danh sách việc kiểu GitHub |
| [remark-math](https://github.com/remarkjs/remark-math) + [rehype-katex](https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex) + [KaTeX](https://katex.org) | Hiển thị công thức toán |
| [gray-matter](https://github.com/jonschlinkert/gray-matter) | Đọc phần thông tin đầu bài (frontmatter) |
| [react-icons](https://react-icons.github.io/react-icons) | Biểu tượng |
| [pnpm](https://pnpm.io) | Quản lý thư viện |

## Chạy dự án ở máy

**Cần có:** [Node.js](https://nodejs.org) 20.9 trở lên, [Git](https://git-scm.com) và pnpm (cài bằng `npm install -g pnpm`).

```bash
# 1. Fork kho mã trên GitHub, rồi lấy bản fork về máy
git clone https://github.com/<tên-bạn>/itHUS.git
cd itHUS

# 2. Cài thư viện
pnpm install

# 3. Chạy trang ở chế độ phát triển
pnpm dev
```

Mở <http://localhost:3000>. Khi bạn lưu file `.mdx`, trang tự cập nhật.

| Lệnh | Tác dụng |
| --- | --- |
| `pnpm dev` | Chạy trang ở chế độ phát triển |
| `pnpm build` | Build bản chính thức, kiểm tra mọi trang đều dựng được |
| `pnpm start` | Chạy bản đã build |
| `pnpm lint` | Kiểm tra code bằng ESLint |

> [!WARNING]
> Tắt `pnpm dev` (Ctrl + C) trước khi chạy `pnpm build`. Nếu build khi dev server đang chạy, dev server sẽ hỏng và báo lỗi *"Jest worker encountered 2 child process exceptions"*. Gặp lỗi này thì tắt hẳn dev server rồi chạy lại `pnpm dev`.

## Cấu trúc dự án

```text
itHUS/
├── app/
│   ├── page.tsx              # Trang chủ
│   ├── subjects/             # Danh sách môn, trang chương, trang bài học
│   └── api/                  # Chỉ mục tìm kiếm, trả file PDF
├── components/
│   ├── mdx/                  # Component dùng được trong file .mdx (Formula, SimplexTable...)
│   └── ...                   # Navbar, Sidebar, SearchBar...
├── content/                  # TOÀN BỘ BÀI VIẾT nằm ở đây (.mdx, .pdf)
├── public/
│   ├── content/              # Hình minh hoạ cho bài viết
│   ├── sitemap.xml
│   └── robots.txt
└── utils/
    ├── slug.ts               # Tạo đường dẫn từ tên file, đọc nội dung
    ├── tree.ts               # Dựng cây mục lục từ thư mục content/
    └── subjects.ts           # Mã môn, danh sách môn đã hoàn thành
```

Phần lớn đóng góp chỉ cần đụng tới `content/` và `public/content/`.

## Tổ chức nội dung

Trang web tự dựng mục lục, thanh bên và nút "Bài trước / Bài sau" từ cấu trúc thư mục. Bạn không cần khai báo bài mới ở đâu khác.

```text
content/
└── MAT3323-–-Tối-ưu-rời-rạc/                    ← môn học
    ├── Chương-0-–-Lời-nói-đầu.mdx               ← giới thiệu môn
    ├── Chương-1-–-Độ-phức-tạp-tính-toán/         ← chương
    │   ├── 1.-Thuật-toán-hữu-hiệu.mdx            ← bài
    │   └── 2.-Ký-hiệu-tiệm-cận.mdx
    └── Chương-3-–-Cây-bao-trùm-nhỏ-nhất/
        ├── 1.-Lát-cắt-và-cây-bao-trùm.mdx
        └── 3.-Thuật-toán-Prim.mdx

public/
└── content/
    └── MAT3323/
        └── C3/                                   ← hình của chương 3
            └── mst-graph.svg
```

- Cấp 1 là **môn**, cấp 2 thường là **chương**, bên trong là **bài**. Có thể lồng thêm thư mục nếu cần, ví dụ `Đề-thi-các-năm/`.
- Mỗi môn nên có `Chương-0-–-Lời-nói-đầu.mdx` ở ngay thư mục môn: giới thiệu môn, tài liệu tham khảo, nguồn.
- Trong `content/` chỉ file `.mdx` và `.pdf` được hiển thị, các file khác bị bỏ qua.
- Hình minh hoạ để ở `public/content/<MÃ-MÔN>/C<số chương>/`, không để trong `content/`.

## Đặt tên file và thư mục

Tên file chính là tiêu đề hiện trên trang và là nguồn để tạo đường dẫn, nên cần đặt theo quy tắc sau.

**1. Dùng `-` thay cho khoảng trắng.** Trên trang, mọi dấu `-` hiện thành khoảng trắng.

| Tên file | Hiện trên trang |
| --- | --- |
| `3.-Thuật-toán-Prim.mdx` | 3. Thuật toán Prim |
| `Chương-3-–-Cây-bao-trùm-nhỏ-nhất` | Chương 3 – Cây bao trùm nhỏ nhất |

Vì vậy tên không giữ được dấu gạch nối thật (`A-Priori` sẽ hiện là "A Priori"). Nếu cần gạch ngang, dùng gạch dài `–`.

**2. Ngăn cách mã môn hoặc số chương với tên bằng `-–-`** (gạch dài `–`, Unicode U+2013, ở giữa hai gạch nối):

```text
MAT3323-–-Tối-ưu-rời-rạc
Chương-3-–-Cây-bao-trùm-nhỏ-nhất
```

Mã môn (`MAT3323`) phải đứng đầu tên thư mục môn. Trang dựa vào đó để hiện mã môn, tách tên môn và gắn dấu tích "Đã hoàn thành".

**3. Đánh số ở đầu tên để giữ thứ tự**: `Chương-1-…`, `1.-…`, `2.-…`. Trang sắp xếp theo tiếng Việt và hiểu số, nên `Chương-10` tự đứng sau `Chương-9`, không cần viết `Chương-09`.

**4. Đường dẫn được tạo tự động từ tên**: bỏ dấu, `đ` → `d`, chữ thường, bỏ ký tự đặc biệt như `( ) . ,`.

```text
content/MAT3323-–-Tối-ưu-rời-rạc/Chương-3-–-Cây-bao-trùm-nhỏ-nhất/3.-Thuật-toán-Prim.mdx
→ /subjects/mat3323-toi-uu-roi-rac/chuong-3-cay-bao-trum-nho-nhat/3-thuat-toan-prim
```

- Hai file trong cùng thư mục không được cho ra cùng một đường dẫn, ví dụ hai tên chỉ khác nhau ở dấu.
- Đổi tên file là đổi đường dẫn, link cũ sẽ hỏng. Hạn chế đổi tên bài đã đăng.

**5. Đặt tên rõ nghĩa.** Ô tìm kiếm tìm theo tên môn, tên chương và tên bài, không tìm trong nội dung bài.

**6. Tên hình minh hoạ** viết thường, không dấu, nối bằng `-`, ví dụ `public/content/MAT3323/C3/mst-graph.svg`.

## Viết bài bằng MDX

MDX là Markdown cho phép chèn thêm thẻ HTML và component React. Nếu bạn đã viết Markdown thì gần như không phải học thêm gì.

### Khung một bài

```mdx
---
title: "3. Thuật toán Prim"
author: "Tên của bạn"
---

**Ý tưởng:** Nuôi một cây từ một đỉnh. Mỗi lần thêm cạnh rẻ nhất nối cây với phần còn lại.

**▸ THUẬT TOÁN**

- **Bước 1:** Khởi tạo $S$ gồm một đỉnh bất kỳ, $T = \varnothing$.
- **Bước 2:** Lặp $n - 1$ lần: thêm cạnh rẻ nhất có đúng một đầu thuộc $S$.

**▸ VÍ DỤ**

![Đồ thị 6 đỉnh có trọng số](/content/MAT3323/C3/mst-graph.svg)

**▸ ⚠️ LƯU Ý**

Kết quả bước 3 khác slide vì ...
```

- **Tiêu đề trang lấy từ tên file.** `title` trong frontmatter được dùng cho nút "Bài trước / Bài sau", nên ghi giống tên file.
- **Không viết `# Tiêu đề`** vì trang đã tự hiện tiêu đề. Chia mục bằng `**▸ TÊN MỤC**` như các bài hiện có, ví dụ `ĐỊNH NGHĨA`, `THUẬT TOÁN`, `VÍ DỤ`, `MINH HỌA TỪNG BƯỚC`, `⚠️ LƯU Ý`.
- **Văn phong:** viết như ghi chép của sinh viên, câu ngắn: định nghĩa, các bước, ví dụ có lời giải. Tránh giải thích dài dòng.
- Bài tham khảo từ sách hay slide thì ghi nguồn trong Lời nói đầu hoặc cuối bài.

### Công thức toán

Dùng cú pháp LaTeX, trang hiển thị bằng [KaTeX](https://katex.org/docs/supported.html).

```mdx
Công thức trong dòng: $f(x) = x^2 + 1$.

Công thức riêng một khối (để dòng trống trước và sau):

$$
\min_{x \in \mathbb{R}^n} \; c^T x \quad \text{s.t.} \quad Ax \le b
$$
```

Tránh viết chữ có dấu trong `\text{...}` vì KaTeX không có font cho chữ tiếng Việt. Hãy để chữ ra ngoài công thức.

### Những ký tự cần chú ý trong MDX

Bên **ngoài** công thức `$...$`, MDX hiểu một số ký tự theo nghĩa riêng:

| Muốn viết | Viết thế này | Lý do |
| --- | --- | --- |
| `{` `}` | `\{` `\}` | `{}` là biểu thức JavaScript |
| `<` | `&lt;` | `<` mở một thẻ HTML |
| Chú thích ẩn | `{/* ghi chú */}` | MDX không nhận `<!-- -->` |

Bên trong `$...$` và `$$...$$` thì viết LaTeX bình thường, không cần đổi gì.

### Bảng

Bảng đơn giản thì dùng cú pháp Markdown:

```mdx
| Thuật toán | Độ phức tạp |
| --- | --- |
| Prim (heap nhị phân) | $O(m \log n)$ |
| Kruskal | $O(m \log m)$ |
```

Bảng cần gộp ô hay tô màu thì dùng HTML, chép mẫu từ bài có sẵn (ví dụ [Thuật toán Prim](content/MAT3323-–-Tối-ưu-rời-rạc/Chương-3-–-Cây-bao-trùm-nhỏ-nhất/3.-Thuật-toán-Prim.mdx)). Trong MDX dùng `className` thay cho `class`.

```mdx
<div className="overflow-x-auto my-6">
  <table className="border-collapse text-sm w-full">
    <thead>
      <tr className="bg-primary/10">
        <th className="border border-primary/20 px-4 py-2 text-center font-semibold">Bước</th>
        <th className="border border-primary/20 px-4 py-2 text-center font-semibold">Cạnh chọn</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="border border-primary/20 px-4 py-2 text-center">1</td>
        <td className="border border-primary/20 px-4 py-2 text-center">$AC$</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Code

Ghi tên ngôn ngữ sau dấu ` ``` ` để khung code hiện nhãn và biểu tượng:

````mdx
```python
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a
```
````

Các tên hiện được nhãn: `c`, `cpp`, `js`, `ts`, `python`, `go`, `java`, `html`, `css`, `rust`, `bash`, `sh`, `sql`.

### Hình minh hoạ

```mdx
![Mô tả ngắn cho hình](/content/MAT3323/C3/mst-graph.svg)
```

- Đường dẫn bắt đầu bằng `/content/...`, tương ứng với thư mục `public/content/...`.
- Dùng được SVG, PNG, GIF, WebP. Nên dùng SVG cho sơ đồ, đồ thị.
- Với hình thuật toán, nên vẽ từng bước và lấy số liệu từ việc chạy thuật toán thật.
- File SVG phải là XML hợp lệ: chữ `<` hoặc `&` trong nhãn phải viết `&lt;`, `&amp;`. Nếu không, hình sẽ không hiện dù đường dẫn đúng.

### Component có sẵn

| Component | Dùng để |
| --- | --- |
| `<Formula title="...">` | Khung làm nổi bật công thức quan trọng |
| `<SimplexTable ... />` | Bảng đơn hình tương tác (môn MAT2407) |
| `<SimplexSolver />` | Công cụ giải bằng thuật toán đơn hình 1 pha |
| `<TwoPhaseSimplexSolver />` | Công cụ giải bằng thuật toán đơn hình 2 pha |

`Formula` cần dòng trống sau thẻ mở và trước thẻ đóng thì công thức bên trong mới hiện đúng:

```mdx
<Formula title="Bất đẳng thức Cauchy – Schwarz">

$$
|\langle u, v \rangle| \le \|u\| \, \|v\|
$$

</Formula>
```

`SimplexTable` nhận dữ liệu dạng chuỗi JSON, hàng cuối là hàng hàm mục tiêu:

```mdx
<SimplexTable
  vars='["x1","x2","s1","s2"]'
  basis='["s1","s2"]'
  data='[[1,2,1,0,4],[3,1,0,1,6],[2,3,0,0,0]]'
  pivotColSeparator={1}
/>
```

`pivotColSeparator` là chỉ số cột (đếm từ 0) sẽ có vạch đậm bên phải. Ở ví dụ trên, vạch nằm giữa biến gốc `x2` và biến bù `s1`.

Muốn thêm component mới: tạo file trong `components/mdx/`, rồi khai báo nó trong `components={{ ... }}` của `MDXRemote` ở [`app/subjects/[...slug]/page.tsx`](app/subjects/%5B...slug%5D/page.tsx).

### File PDF

- Đặt file `.pdf` vào thư mục chương như một bài bình thường. Trang sẽ hiện trình xem PDF kèm nút "Mở tab mới" và "Tải xuống".
- Nén file dưới khoảng 5 MB. File lớn tải rất chậm, nhất là trên điện thoại.
- Chỉ đăng tài liệu bạn được phép chia sẻ.

## Thêm môn học mới

1. Tạo thư mục `content/<MÃ-MÔN>-–-<Tên-môn>/`, ví dụ `content/MAT3533-–-Học-máy/`.
2. Viết `Chương-0-–-Lời-nói-đầu.mdx`: giới thiệu môn, tài liệu tham khảo, nguồn. Nếu môn không có tài liệu chính thức mà bạn viết từ sách hoặc tài liệu thư viện, hãy ghi rõ ở đây.
3. Thêm các thư mục chương và bài.
4. Thêm đường dẫn môn vào `public/sitemap.xml`:

   ```xml
   <url>
     <loc>https://ithus.bigdragon.info.vn/subjects/mat3533-hoc-may/</loc>
     <lastmod>2026-11-26</lastmod>
     <changefreq>monthly</changefreq>
     <priority>0.8</priority>
   </url>
   ```

5. Thêm một dòng vào `public/robots.txt`:

   ```text
   Allow: /subjects/mat3533-hoc-may
   ```

Git không lưu thư mục rỗng. Muốn môn hiện ở mục "Đang cập nhật" khi chưa có bài, đặt một file `.gitkeep` vào thư mục môn.

Dấu tích "Đã hoàn thành" do người quản lý dự án gắn, qua danh sách `COMPLETED_SUBJECTS` trong [`utils/subjects.ts`](utils/subjects.ts).

## Gửi Pull Request

1. Tạo nhánh mới từ `main`:

   ```bash
   git checkout -b them-bai-thuat-toan-prim
   ```

2. Viết hoặc sửa bài, mở trang ở <http://localhost:3000> để xem lại.
3. Trước khi gửi, kiểm tra:
   - [ ] Trang hiện đúng: công thức, bảng, hình đều hiển thị.
   - [ ] Tên file đúng quy tắc, hình nằm trong `public/content/<MÃ-MÔN>/C<số>/`.
   - [ ] `pnpm lint` không báo lỗi mới.
   - [ ] Tắt `pnpm dev`, chạy `pnpm build` thành công. Lỗi cú pháp MDX ở những trang bạn chưa mở sẽ lộ ra ở bước này.
4. Commit với lời nhắn ngắn, bắt đầu bằng loại thay đổi:

   ```bash
   git commit -m "feat: thêm bài Thuật toán Prim"
   git commit -m "fix: sửa dấu sai trong MAT2407 chương 2.2"
   ```

   `feat` là thêm mới, `fix` là sửa lỗi.

5. Push lên bản fork của bạn và mở Pull Request vào nhánh `main` của [kmbigdragon/itHUS](https://github.com/kmbigdragon/itHUS). Ghi ngắn gọn bạn thêm hoặc sửa gì. Nếu đổi giao diện thì kèm ảnh chụp.

Cảm ơn bạn đã đóng góp!

## Giấy phép

Mã nguồn phát hành theo [giấy phép MIT](LICENSE).
