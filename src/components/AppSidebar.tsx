
import {
  Calendar,
  FileText,
  MapPin,
  Settings,
  Home,
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
import { Link, useLocation } from "react-router-dom"

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
  const location = useLocation()

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
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
