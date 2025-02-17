'use client';
import { styled, Container, Box } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Header from "@/app/(DashboardLayout)/layout/header/Header";
import Sidebar from "@/app/(DashboardLayout)/layout/sidebar/Sidebar";

const MainWrapper = styled("div")(() => ({
    display: "flex",
    minHeight: "100vh",
    width: "100%",
}));

const PageWrapper = styled("div")(() => ({
    display: "flex",
    flexGrow: 1,
    paddingBottom: "60px",
    flexDirection: "column",
    zIndex: 1,
    backgroundColor: "transparent",
}));

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [user, setUser] = useState<{ username: string; role: string } | null>(null);

    useEffect(() => {
        // Check if user is logged in and is staff
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/authentication/login');
            return;
        }

        const userData = JSON.parse(userStr);
        if (userData.role !== 'staff') {
            router.push('/unauthorized');
            return;
        }

        setUser(userData);
    }, [router]);

    if (!user) {
        return null; // or a loading spinner
    }

    return (
        <MainWrapper className="mainwrapper">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isMobileSidebarOpen={isMobileSidebarOpen}
                onSidebarClose={() => setMobileSidebarOpen(false)}
            />
            <PageWrapper className="page-wrapper">
                <Header
                    toggleMobileSidebar={() => setMobileSidebarOpen(true)}
                    user={user}
                />
                <Container
                    sx={{
                        paddingTop: "20px",
                        maxWidth: "1200px",
                    }}
                >
                    <Box sx={{ minHeight: "calc(100vh - 170px)" }}>
                        {children}
                    </Box>
                </Container>
            </PageWrapper>
        </MainWrapper>
    );
}
