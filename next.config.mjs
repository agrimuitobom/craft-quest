/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Firebase Hosting に置くため、すべてのページを静的HTMLとして out/ に書き出す
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
