import Link from "next/link";

import { logout } from "@/lib/auth";

type NavBarProps = {
  user: any;
  onLogout: () => void;
};

export const NavBar = (props: NavBarProps) => {
  const { user, onLogout } = props;

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const loggedIn = Boolean(user);
  return (
    <nav className="navbar">
      <div className="navbar-start">
        <Link className="navbar-item" href="/">
          Home
        </Link>
      </div>
      {loggedIn ? (
        <div className="navbar-end">
          <span className="navbar-item has-text-grey">{user.email}</span>
          <Link className="navbar-item" href="/jobs/new">
            Post Job
          </Link>
          <a className="navbar-item" onClick={handleLogout}>
            Logout
          </a>
        </div>
      ) : (
        <div className="navbar-end">
          <Link className="navbar-item" href="/login">
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};
