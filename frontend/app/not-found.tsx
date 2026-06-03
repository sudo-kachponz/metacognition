export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Halaman tidak ditemukan.</p>
      <a href="/" className="text-primary underline">
        Kembali ke beranda
      </a>
    </div>
  );
}
