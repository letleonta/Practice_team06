import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-[#0f1117] text-white">
            <Navbar />
                <main className="pt-20">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
