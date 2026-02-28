import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useMessages } from '@/hooks/useMessages';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Building2,
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Settings,
  LogIn,
  LogOut,
  ChevronUp,
  Phone,
  MapPin,
  Shield,
  
  Instagram,
  Facebook,
  Youtube,
  Mail,
  CloudSun,
  Database,
  Landmark,
  Receipt,
  BookOpen,
  
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const topItems = [
  { title: 'Magic', url: '/', icon: LayoutDashboard },
];

const buildingItems = [
  { title: 'Building Contracts', url: '/projects', icon: FileText },
  { title: 'Claims Papi', url: '/claims', icon: Receipt },
  { title: 'Claims Ledger', url: '/claims/ledger', icon: BookOpen },
  
];

const developmentItems = [
  { title: 'Development', url: '/development', icon: Landmark },
];

const adminItems = [
  { title: 'Team', url: '/team', icon: Users },
  { title: 'Calendar', url: '/calendar', icon: Calendar },
  { title: 'Inbox', url: '/inbox', icon: Mail },
  { title: 'Weather', url: '/weather', icon: CloudSun },
  { title: 'Source Data', url: '/source-data', icon: Database },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/lanconqld/', label: 'Instagram' },
  { icon: Facebook, href: 'https://www.facebook.com/lanconqld', label: 'Facebook' },
  { icon: Youtube, href: 'https://www.youtube.com/channel/UC-_gfZawuqAMgUvot4yYeIQ', label: 'YouTube' },
];

export function AppSidebar() {
  const { user, profile, signOut } = useAuth();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { unreadCount } = useMessages();
  const isCollapsed = state === 'collapsed';

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar collapsible="icon">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-md">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground">LanCon Qld</span>
              <span className="text-xs text-sidebar-foreground/60">Metrics Dashboard</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {topItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end className="flex items-center gap-2" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Building */}
        <SidebarGroup>
          <SidebarGroupLabel>Building Contracts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {buildingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className="flex items-center gap-2" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Development */}
        <SidebarGroup>
          <SidebarGroupLabel>Development</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {developmentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className="flex items-center gap-2" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Administration */}
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className="flex items-center gap-2" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.title === 'Inbox' && unreadCount > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1.5 text-[10px] font-semibold text-sidebar-primary-foreground">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Contact & Social */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Contact</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 space-y-2 text-xs text-sidebar-foreground/70">
              {!isCollapsed && (
                <>
                  <a href="tel:1300699442" className="flex items-center gap-2 hover:text-sidebar-foreground transition-colors">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>1300 699 442</span>
                  </a>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                    <span>21/8 Metroplex Ave, Murarrie QLD 4172</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 shrink-0" />
                    <span>QBCC #1172942</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
                        aria-label={social.label}
                      >
                        <social.icon className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </div>
                </>
              )}
              {isCollapsed && (
                <div className="flex flex-col items-center gap-1">
                  <a href="tel:1300699442" className="p-1.5 rounded-md hover:bg-sidebar-accent" aria-label="Phone">
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-sidebar-accent"
                      aria-label={social.label}
                    >
                      <social.icon className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Auth */}
      <SidebarFooter className="border-t border-sidebar-border">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="w-full data-[state=open]:bg-sidebar-accent"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="flex flex-1 flex-col text-left text-sm">
                      <span className="truncate font-medium">
                        {profile?.display_name || 'User'}
                      </span>
                      <span className="truncate text-xs text-sidebar-foreground/60">
                        {user.email}
                      </span>
                    </div>
                    <ChevronUp className="h-4 w-4 shrink-0 text-sidebar-foreground/60" />
                  </>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-56"
            >
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{profile?.display_name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Sign in"
                className="w-full"
              >
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/auth')}
                >
                  <LogIn className="h-4 w-4" />
                  {!isCollapsed && <span>Sign in</span>}
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
