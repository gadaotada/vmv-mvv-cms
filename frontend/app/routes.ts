import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), 
    layout("routes/dashboard/layout.tsx", [
      route("dashboard", "routes/dashboard/dashboard.tsx"),
      route("dashboard/settings", "routes/dashboard/settings.tsx"),
      route("dashboard/monitor", "routes/dashboard/monitor/monitor.tsx"),
    ]),
] satisfies RouteConfig;
