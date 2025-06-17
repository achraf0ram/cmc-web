
import {
  Calendar,
  FileText,
  MapPin,
  Settings,
  Home,
  Shield,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useCurrentUserRole } from "@/hooks/useUserRoles"

// Menu items.
const items = [
  {
    title: "الرئيسية",
    url: "/",
    icon: Home,
  },
  {
    title: "طلب إجازة",
    url: "/vacation-request",
    icon: Calendar,
  },
  {
    title: "شهادة عمل",
    url: "/work-certificate",
    icon: FileText,
  },
  {
    title: "أمر مهمة",
    url: "/mission-order",
    icon: MapPin,
  },
  {
    title: "الإعدادات",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { isAuthenticated } = useAuth()
  const { data: userRoles } = useCurrentUserRole()
  
  const hasAdminAccess = userRoles?.some(r => r.role === 'admin' || r.role === 'hr')

  if (!isAuthenticated) {
    return null
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>نظام الإدارة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {hasAdminAccess && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin">
                      <Shield />
                      <span>لوحة التحكم</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
