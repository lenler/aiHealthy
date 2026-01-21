import { HomeOutlined, MessageOutlined, CameraOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './index.scss'
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
type MenuItem = Required<MenuProps>['items'][number];
const navItems:MenuItem[] = [
  { key: '/', label: '首页', icon: <HomeOutlined /> },
  { key: '/chat', label: '咨询', icon: <MessageOutlined /> },
  { key: '/analysis', label: '分析', icon: <CameraOutlined /> },
  { key: '/user', label: '我的',  icon: <UserOutlined /> },
];
export default function BottomNav() {
  const navigate = useNavigate();
  const handleClick: MenuProps['onClick'] = (e) => {
    navigate(e.key)
  };
  return (
    <Menu
      className="bottom-nav"
      defaultOpenKeys={['/']}
      mode="inline"
      items={navItems}
      onClick={handleClick}
    />
  )
}
