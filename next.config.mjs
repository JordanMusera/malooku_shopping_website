/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['fakestoreapi.com','res.cloudinary.com','th.bing.com'], // Allow images from this domain
      },
      experimental: {
        runtime: "nodejs",
      }
};

export default nextConfig;
