import React from 'react';
import { Outlet } from 'react-router';
import AppSidebar from './AppSidebar.jsx';
import Footer from '../layouts/Footer.jsx';
import { SidebarProvider } from '@/components/ui/sidebar.jsx';
import Header from '@/layouts/Header.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';

const Layout = () => {
    return (
        <React.Fragment>
            <div className="flex min-h-dvh w-full">
                <SidebarProvider>
                    <AppSidebar />

                    <div className="flex min-h-screen w-full flex-col bg-background">
                        {/* Header to'liq kenglikni egallashi uchun */}
                        <Header />

                        {/* Main - max-w-7xl olib tashlandi va w-full berildi */}
                        <main className="w-full flex-1 p-4 sm:p-6">
                            <Card className="min-h-[calc(100vh-140px)] w-full">
                                <CardContent className="p-6">
                                    <div className="w-full rounded-md">
                                        <Outlet />
                                    </div>
                                </CardContent>
                            </Card>
                        </main>

                        {/* Footer */}
                        <footer className="bg-card w-full border-t py-3 px-4 sm:px-6">
                            <Footer />
                        </footer>
                    </div>
                </SidebarProvider>
            </div>
        </React.Fragment>
    );
};

export default Layout;
