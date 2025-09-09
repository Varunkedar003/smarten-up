import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Gamepad2, 
  MessageCircle, 
  BarChart3, 
  Trophy,
  Brain,
  Star
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    description: "Overview & Stats"
  },
  {
    title: "Learning Games",
    url: "/learning",
    icon: Gamepad2,
    description: "Interactive Learning"
  },
  {
    title: "AI Assistant",
    url: "/assistant",
    icon: MessageCircle,
    description: "Get Help & Guidance"
  },
  {
    title: "Progress",
    url: "/progress",
    icon: BarChart3,
    description: "Track Your Journey"
  },
  {
    title: "Achievements",
    url: "/achievements",
    icon: Trophy,
    description: "Badges & Rewards"
  },
  {
    title: "Roadmap / Mind Map",
    url: "/roadmap",
    icon: Brain,
    description: "Generate learning paths"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300`} collapsible="icon">
      <SidebarContent className="bg-sidebar-background border-r border-sidebar-border">
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Brain className="w-8 h-8 text-sidebar-primary" />
              <Star className="w-4 h-4 text-accent absolute -top-1 -right-1" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-sidebar-foreground">
                Learn<span className="text-sidebar-primary">Reinforced</span>
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.title}</div>
                          {!isActive(item.url) && (
                            <div className="text-xs opacity-70 truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats */}
        {!collapsed && (
          <div className="mt-auto p-4 space-y-2">
            <div className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wide">
              Today's Progress
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-sidebar-foreground/80">Games Played</span>
                <span className="text-sidebar-primary font-medium">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-sidebar-foreground/80">Time Spent</span>
                <span className="text-sidebar-primary font-medium">45m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-sidebar-foreground/80">XP Earned</span>
                <span className="text-sidebar-primary font-medium">150</span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}