import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { nextRuntime, webpack }) {
    if (nextRuntime === "edge") {
      config.plugins.push(
        new webpack.DefinePlugin({ __dirname: JSON.stringify("/") })
      );
    }
    return config;
  },
};

export default nextConfig;
