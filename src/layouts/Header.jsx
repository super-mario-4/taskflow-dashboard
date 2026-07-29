import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.jsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
    Sun,
    MoonIcon,
    LogOutIcon,
    SettingsIcon,
    UserIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/authSlice';
import { useNavigate, useLocation, Link } from 'react-router';

const Header = () => {
    const { theme, setTheme } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // ---------------- Dinamik Breadcrumb Yo'nalishlari ----------------
    const pathnames = location.pathname.split('/').filter((x) => x);

    const formatBreadcrumbText = (text) => {
        return text
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    return (
        <React.Fragment>
            <header className="bg-card sticky top-0 z-50 border-b w-full">
                <div className="flex w-full items-center justify-between gap-6 px-4 py-2 sm:px-6">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="[&_svg]:size-5!" />
                        <Separator
                            orientation="vertical"
                            className="hidden h-4 data-vertical:self-center sm:block"
                        />

                        {/* ---------------- Dinamik Breadcrumb ---------------- */}
                        <Breadcrumb className="hidden sm:block">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <Link
                                        to="/dashboard"
                                        className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                                    >
                                        Home
                                    </Link>
                                </BreadcrumbItem>

                                {pathnames.map((value, index) => {
                                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                    const isLast =
                                        index === pathnames.length - 1;

                                    return (
                                        <React.Fragment key={to}>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                {isLast ? (
                                                    <BreadcrumbPage>
                                                        {formatBreadcrumbText(
                                                            value
                                                        )}
                                                    </BreadcrumbPage>
                                                ) : (
                                                    <Link
                                                        to={to}
                                                        className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                                                    >
                                                        {formatBreadcrumbText(
                                                            value
                                                        )}
                                                    </Link>
                                                )}
                                            </BreadcrumbItem>
                                        </React.Fragment>
                                    );
                                })}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    {/* ---------------- O'ng Tomon (Theme & User Profile) ---------------- */}
                    <div className="flex items-center gap-2">
                        <Button
                            className="cursor-pointer"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                setTheme(theme === 'dark' ? 'light' : 'dark')
                            }
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <MoonIcon className="h-5 w-5" />
                            )}
                        </Button>

                        {/* Dropdown Menu - Avatar o'zi Trigger sifatida */}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="cursor-pointer outline-none rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <Avatar className="size-9 border">
                                            {user?.avatar ? (
                                                <AvatarImage
                                                    src={user.avatar}
                                                    alt={user.name}
                                                />
                                            ) : (
                                                <AvatarFallback>
                                                    {user?.name
                                                        ? user.name
                                                              .charAt(0)
                                                              .toUpperCase()
                                                        : 'U'}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                    </Button>
                                }
                            />

                            <DropdownMenuContent className="w-80" align="end">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="flex items-center gap-4 px-4 py-2.5 font-normal">
                                        <div className="relative">
                                            <Avatar className="size-10">
                                                {user?.avatar ? (
                                                    <AvatarImage
                                                        src={user.avatar}
                                                        alt={user.name}
                                                    />
                                                ) : (
                                                    <AvatarFallback>
                                                        {user?.name
                                                            ? user.name
                                                                  .charAt(0)
                                                                  .toUpperCase()
                                                            : 'U'}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <span className="ring-card absolute right-0 bottom-0 block size-2.5 rounded-full bg-green-600 ring-2" />
                                        </div>
                                        <div className="flex flex-1 flex-col items-start overflow-hidden">
                                            <span className="text-foreground truncate text-sm font-semibold w-full">
                                                {user?.name || 'User'}
                                            </span>
                                            <span className="text-muted-foreground truncate text-xs w-full">
                                                {user?.email ||
                                                    'user@example.com'}
                                            </span>
                                        </div>
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="gap-2 px-4 py-2.5 cursor-pointer">
                                        <UserIcon className="text-foreground size-4" />
                                        <span>My account</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2 px-4 py-2.5 cursor-pointer">
                                        <SettingsIcon className="text-foreground size-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="gap-2 px-4 py-2.5 cursor-pointer text-destructive focus:bg-destructive/10"
                                        onClick={handleLogout}
                                    >
                                        <LogOutIcon className="size-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>
        </React.Fragment>
    );
};

export default Header;
