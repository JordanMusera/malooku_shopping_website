/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['fakestoreapi.com','res.cloudinary.com','th.bing.com'], // Allow images from this domain
      },
      experimental: {
        runtime: "nodejs",
      },
      env: {
        JWT_SECRET: process.env.JWT_SECRET,
      },
};

export default nextConfig;
