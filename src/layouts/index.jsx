import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Breadcrumb,
  Divider,
  Avatar,
  Dropdown,
  Button,
} from 'antd';
import {
  SettingOutlined,
  UserOutlined,
  CloudServerOutlined,
  FundOutlined,
} from '@ant-design/icons';
import { Link, request, history } from 'umi';
import Cookies from 'js-cookie';
import { decode } from 'jsonwebtoken';
import { ReactComponent as Logo } from '../public/logo-white.svg';

import '../global.css';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

const rootSubmenuKeys = ['config', 'service', 'setting'];

export default function BasicLayout({
  children,
  location,
  route,
  history,
  match,
}) {
  const [key, setKey] = useState(['my']);
  const [openKeys, setOpenKeys] = useState(['config']);
  const [user, setUser] = useState({});
  const [role, setRole] = useState('guest');

  useEffect(() => {
    const temp = location.pathname.split('/')?.[2] || [];
    setKey(temp.length ? [temp] : ['my']);

    const userInfo = decode(Cookies.get('jwt'), 'jwt') || {};
    if (userInfo.id) {
      getUserById(userInfo.id);
      getRoleByUser(userInfo.id);
    } else {
      window.location.assign('/signin');
    }
  }, [location.pathname]);

  const getUserById = async (id) => {
    const res = await request(`/api/v1/users/${id}`, {
      method: 'get',
    });
    setUser(res);
    history.push({
      state: res,
    });
  };

  const signout = async () => {
    const res = await request('/api/v1/users/signout', {
      method: 'post',
    });
    window.location.assign('/signin');
  };

  const getRoleByUser = async (id) => {
    const res = await request(`/api/v1/users/${id}/roles`, {
      method: 'get',
    });
    setRole(res[0] || 'guest');
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="0"
        style={{
          pointerEvents: 'none',
        }}
      >
        {user.name || user.id || 'Admin'}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="profile">
        <Button
          type="text"
          onClick={() => history.push(`/profile/${user.id}`)}
          style={{
            padding: 0,
            height: 'auto',
          }}
        >
          Your Profile
        </Button>
      </Menu.Item>
      <Menu.Item key="sign_out">
        <Button
          type="text"
          onClick={() => signout()}
          style={{
            padding: 0,
            height: 'auto',
          }}
        >
          Sign Out
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout>
      <Header className="header">
        <div className="left-info">
          <Logo style={{ width: 90, height: 22 }} />
          {/* <div className="logo" /> */}
          {/* <Divider
            type="vertical"
            style={{
              color: '#ffffff',
              borderColor: '#ffffff',
            }}
          />
          Dragonfly */}
        </div>
        <Dropdown overlay={menu} trigger={['click', 'hover']} placement="bottomRight">
          <Avatar
            style={{
              // backgroundColor: '#23B066',
              verticalAlign: 'middle',
              cursor: 'pointer',
            }}
            icon={<UserOutlined />}
            size="small"
            gap={4}
          >
            {user.name || user.id || 'Admin'}
          </Avatar>
        </Dropdown>
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            selectedKeys={key}
            // openKeys={openKeys}
            // 全展开
            defaultOpenKeys={rootSubmenuKeys}
            style={{ height: '100%', borderRight: 0 }}
            onClick={(item) => {
              setKey([item.key]);
              // window.location.assign(`/${v.key}`);
            }}
            // onOpenChange={(keys) => {
            //   const rootSubmenuKeys = ['config', 'service', 'setting'];

            //   const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
            //   console.log(latestOpenKey, keys);
            //   if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
            //     setOpenKeys(keys);
            //   } else {
            //     setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
            //   }
            // }}
          >
            {/* TODO 根据路由自动生成 */}
            <SubMenu key="config" icon={<FundOutlined />} title="Configuration">
              <Menu.Item key="scheduler-cluster">
                <Link to="/configuration/scheduler-cluster">
                  Scheduler Cluster
                </Link>
              </Menu.Item>
              <Menu.Item key="seed-peer-cluster">
                <Link to="/configuration/seed-peer-cluster">Seed Peer Cluster</Link>
              </Menu.Item>
              {/* <Menu.Item key="application">
                <Link to="/configuration/application">Application</Link>
              </Menu.Item> */}
              <Menu.Item key="security">
                <Link to="/configuration/security">Security</Link>
              </Menu.Item>
            </SubMenu>
            <SubMenu
              key="service"
              icon={<CloudServerOutlined />}
              title="Service"
            >
              <Menu.Item key="task">
                <Link to="/service/task">Task</Link>
              </Menu.Item>
            </SubMenu>
            <SubMenu key="setting" icon={<SettingOutlined />} title="Setting">
              {role === 'root' ? (
                <Menu.Item key="permission">
                  <Link to="/setting/permission">Permission</Link>
                </Menu.Item>
              ) : null}
              {role === 'root' ? (
                <Menu.Item key="user">
                  <Link to="/setting/user">User</Link>
                </Menu.Item>
              ) : null}
              <Menu.Item key="oauth">
                <Link to="/setting/oauth">OAuth</Link>
              </Menu.Item>
            </SubMenu>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item key="bread_0">
              {location.pathname
                .split('/')?.[1]
                .replace(/^\S/, (s) => s.toUpperCase())}
            </Breadcrumb.Item>
            <Breadcrumb.Item key="bread_1">
              {
                key[0]
                .split('-')
                .map((e) => e.replace(/^\S/, (s) => s.toUpperCase()))
                .join(' ')
              }
            </Breadcrumb.Item>
          </Breadcrumb>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
