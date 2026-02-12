import { Outlet } from 'react-router-dom';

const DefaultPageLayout = () => {
    return (
        <div className="pt-20">
            <Outlet />
        </div>
    );
};

export default DefaultPageLayout;