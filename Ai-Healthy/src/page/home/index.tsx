import { Outlet } from 'react-router-dom';
import './index.scss';
import BottomNav from '../../components/Home/Sider';

export default function Home() {
  return (
    <div className="healthyApp">
      <BottomNav />
      <Outlet />
    </div>
  );
}
