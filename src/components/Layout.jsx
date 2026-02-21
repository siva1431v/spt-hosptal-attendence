import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="app-main">
                <Topbar />
                <div className="app-content animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
