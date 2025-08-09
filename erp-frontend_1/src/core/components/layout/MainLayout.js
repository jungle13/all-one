import React, { useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header>
      {user && <span>{user.email}</span>}
      <button onClick={logout}>Logout</button>
    </header>
  );
};

const Sidebar = () => {
  return (
    <aside>
      <nav>
        <ul>
          <li><a href="/">Empresas</a></li>
        </ul>
      </nav>
    </aside>
  );
};

const MainLayout = ({ children }) => {
  return (
    <div>
      <Header />
      <Sidebar />
      <main>{children}</main>
    </div>
  );
};

export default MainLayout;