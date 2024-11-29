// vite.config.ts
import { cloudflareDevProxyVitePlugin as remixCloudflareDevProxy, vitePlugin as remixVitePlugin } from "file:///app/node_modules/.pnpm/@remix-run+dev@2.10.0_@remix-run+react@2.10.2_react-dom@18.3.1_react@18.3.1__react@18.3.1_typ_qwyxqdhnwp3srgtibfrlais3ge/node_modules/@remix-run/dev/dist/index.js";
import UnoCSS from "file:///app/node_modules/.pnpm/unocss@0.61.3_postcss@8.4.38_rollup@4.18.0_vite@5.3.1_@types+node@20.14.9_sass@1.77.6_/node_modules/unocss/dist/vite.mjs";
import { defineConfig } from "file:///app/node_modules/.pnpm/vite@5.3.1_@types+node@20.14.9_sass@1.77.6/node_modules/vite/dist/node/index.js";
import { nodePolyfills } from "file:///app/node_modules/.pnpm/vite-plugin-node-polyfills@0.22.0_rollup@4.18.0_vite@5.3.1_@types+node@20.14.9_sass@1.77.6_/node_modules/vite-plugin-node-polyfills/dist/index.js";
import { optimizeCssModules } from "file:///app/node_modules/.pnpm/vite-plugin-optimize-css-modules@1.1.0_vite@5.3.1_@types+node@20.14.9_sass@1.77.6_/node_modules/vite-plugin-optimize-css-modules/dist/index.mjs";
import tsconfigPaths from "file:///app/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.5.2_vite@5.3.1_@types+node@20.14.9_sass@1.77.6_/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig((config) => {
  return {
    build: {
      target: "esnext"
    },
    server: {
      host: "0.0.0.0",
      strictPort: true,
      port: 5173
    },
    plugins: [
      nodePolyfills({
        include: ["path", "buffer"]
      }),
      config.mode !== "test" && remixCloudflareDevProxy(),
      remixVitePlugin({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true
        }
      }),
      UnoCSS(),
      tsconfigPaths(),
      chrome129IssuePlugin(),
      config.mode === "production" && optimizeCssModules({ apply: "build" })
    ]
  };
});
function chrome129IssuePlugin() {
  return {
    name: "chrome129IssuePlugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.headers["user-agent"]?.match(/Chrom(e|ium)\/([0-9]+)\./);
        if (raw) {
          const version = parseInt(raw[2], 10);
          if (version === 129) {
            res.setHeader("content-type", "text/html");
            res.end(
              '<body><h1>Please use Chrome Canary for testing.</h1><p>Chrome 129 has an issue with JavaScript modules & Vite local development, see <a href="https://github.com/stackblitz/bolt.new/issues/86#issuecomment-2395519258">for more information.</a></p><p><b>Note:</b> This only impacts <u>local development</u>. `pnpm run build` and `pnpm run start` will work fine in this browser.</p></body>'
            );
            return;
          }
        }
        next();
      });
    }
  };
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBjbG91ZGZsYXJlRGV2UHJveHlWaXRlUGx1Z2luIGFzIHJlbWl4Q2xvdWRmbGFyZURldlByb3h5LCB2aXRlUGx1Z2luIGFzIHJlbWl4Vml0ZVBsdWdpbiB9IGZyb20gJ0ByZW1peC1ydW4vZGV2JztcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCB0eXBlIFZpdGVEZXZTZXJ2ZXIgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscyc7XG5pbXBvcnQgeyBvcHRpbWl6ZUNzc01vZHVsZXMgfSBmcm9tICd2aXRlLXBsdWdpbi1vcHRpbWl6ZS1jc3MtbW9kdWxlcyc7XG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKChjb25maWcpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBidWlsZDoge1xuICAgICAgdGFyZ2V0OiAnZXNuZXh0JyxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogJzAuMC4wLjAnLFxuICAgICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICAgIHBvcnQ6IDUxNzMsXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbXG4gICAgICBub2RlUG9seWZpbGxzKHtcbiAgICAgICAgaW5jbHVkZTogWydwYXRoJywgJ2J1ZmZlciddLFxuICAgICAgfSksXG4gICAgICBjb25maWcubW9kZSAhPT0gJ3Rlc3QnICYmIHJlbWl4Q2xvdWRmbGFyZURldlByb3h5KCksXG4gICAgICByZW1peFZpdGVQbHVnaW4oe1xuICAgICAgICBmdXR1cmU6IHtcbiAgICAgICAgICB2M19mZXRjaGVyUGVyc2lzdDogdHJ1ZSxcbiAgICAgICAgICB2M19yZWxhdGl2ZVNwbGF0UGF0aDogdHJ1ZSxcbiAgICAgICAgICB2M190aHJvd0Fib3J0UmVhc29uOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICBVbm9DU1MoKSxcbiAgICAgIHRzY29uZmlnUGF0aHMoKSxcbiAgICAgIGNocm9tZTEyOUlzc3VlUGx1Z2luKCksXG4gICAgICBjb25maWcubW9kZSA9PT0gJ3Byb2R1Y3Rpb24nICYmIG9wdGltaXplQ3NzTW9kdWxlcyh7IGFwcGx5OiAnYnVpbGQnIH0pLFxuICAgIF0sXG4gIH07XG59KTtcblxuZnVuY3Rpb24gY2hyb21lMTI5SXNzdWVQbHVnaW4oKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2Nocm9tZTEyOUlzc3VlUGx1Z2luJyxcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBjb25zdCByYXcgPSByZXEuaGVhZGVyc1sndXNlci1hZ2VudCddPy5tYXRjaCgvQ2hyb20oZXxpdW0pXFwvKFswLTldKylcXC4vKTtcblxuICAgICAgICBpZiAocmF3KSB7XG4gICAgICAgICAgY29uc3QgdmVyc2lvbiA9IHBhcnNlSW50KHJhd1syXSwgMTApO1xuXG4gICAgICAgICAgaWYgKHZlcnNpb24gPT09IDEyOSkge1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignY29udGVudC10eXBlJywgJ3RleHQvaHRtbCcpO1xuICAgICAgICAgICAgcmVzLmVuZChcbiAgICAgICAgICAgICAgJzxib2R5PjxoMT5QbGVhc2UgdXNlIENocm9tZSBDYW5hcnkgZm9yIHRlc3RpbmcuPC9oMT48cD5DaHJvbWUgMTI5IGhhcyBhbiBpc3N1ZSB3aXRoIEphdmFTY3JpcHQgbW9kdWxlcyAmIFZpdGUgbG9jYWwgZGV2ZWxvcG1lbnQsIHNlZSA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3N0YWNrYmxpdHovYm9sdC5uZXcvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0yMzk1NTE5MjU4XCI+Zm9yIG1vcmUgaW5mb3JtYXRpb24uPC9hPjwvcD48cD48Yj5Ob3RlOjwvYj4gVGhpcyBvbmx5IGltcGFjdHMgPHU+bG9jYWwgZGV2ZWxvcG1lbnQ8L3U+LiBgcG5wbSBydW4gYnVpbGRgIGFuZCBgcG5wbSBydW4gc3RhcnRgIHdpbGwgd29yayBmaW5lIGluIHRoaXMgYnJvd3Nlci48L3A+PC9ib2R5PicsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbmV4dCgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOEwsU0FBUyxnQ0FBZ0MseUJBQXlCLGNBQWMsdUJBQXVCO0FBQ3JTLE9BQU8sWUFBWTtBQUNuQixTQUFTLG9CQUF3QztBQUNqRCxTQUFTLHFCQUFxQjtBQUM5QixTQUFTLDBCQUEwQjtBQUNuQyxPQUFPLG1CQUFtQjtBQUUxQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxXQUFXO0FBQ3RDLFNBQU87QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxJQUNWO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsY0FBYztBQUFBLFFBQ1osU0FBUyxDQUFDLFFBQVEsUUFBUTtBQUFBLE1BQzVCLENBQUM7QUFBQSxNQUNELE9BQU8sU0FBUyxVQUFVLHdCQUF3QjtBQUFBLE1BQ2xELGdCQUFnQjtBQUFBLFFBQ2QsUUFBUTtBQUFBLFVBQ04sbUJBQW1CO0FBQUEsVUFDbkIsc0JBQXNCO0FBQUEsVUFDdEIscUJBQXFCO0FBQUEsUUFDdkI7QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNELE9BQU87QUFBQSxNQUNQLGNBQWM7QUFBQSxNQUNkLHFCQUFxQjtBQUFBLE1BQ3JCLE9BQU8sU0FBUyxnQkFBZ0IsbUJBQW1CLEVBQUUsT0FBTyxRQUFRLENBQUM7QUFBQSxJQUN2RTtBQUFBLEVBQ0Y7QUFDRixDQUFDO0FBRUQsU0FBUyx1QkFBdUI7QUFDOUIsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sZ0JBQWdCLFFBQXVCO0FBQ3JDLGFBQU8sWUFBWSxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVM7QUFDekMsY0FBTSxNQUFNLElBQUksUUFBUSxZQUFZLEdBQUcsTUFBTSwwQkFBMEI7QUFFdkUsWUFBSSxLQUFLO0FBQ1AsZ0JBQU0sVUFBVSxTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFFbkMsY0FBSSxZQUFZLEtBQUs7QUFDbkIsZ0JBQUksVUFBVSxnQkFBZ0IsV0FBVztBQUN6QyxnQkFBSTtBQUFBLGNBQ0Y7QUFBQSxZQUNGO0FBRUE7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUVBLGFBQUs7QUFBQSxNQUNQLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=
