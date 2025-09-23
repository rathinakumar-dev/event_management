import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/DarkModeToggle";
import { toast } from "sonner";
import axios from "axios";

const UserDashboard = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState(() => {
    return localStorage.getItem("activePath") || "/agentform";
  });

  useEffect(() => {
    localStorage.setItem("activePath", activePath);
  }, [activePath]);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setAuth(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const menuItems = [
    {
      name: "Agent",
      icon: <Users className="w-5 h-5" />,
      children: [
        { name: "Verify Gift Form", path: "/user_dashboard/verify_guest" },
        {
          name: "Verified Gift List",
          path: "/user_dashboard/verify_guest_list",
        },
      ],
    },
  ];

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children?.some((sub) => sub.path === location.pathname)) {
        setOpenMenu(item.name);
      }
    });
  }, [location.pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold text-lg text-gray-900 dark:text-white">
        My Dashboard
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item, idx) =>
          item.children ? (
            <div key={idx} className="mb-1">
              <button
                className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition duration-200 text-gray-700 dark:text-gray-300
                ${
                  openMenu === item.name
                    ? "bg-gray-100 dark:bg-gray-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }
                focus:ring focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700`}
                onClick={() =>
                  setOpenMenu(openMenu === item.name ? null : item.name)
                }
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform text-gray-500 dark:text-gray-400 ${
                    openMenu === item.name ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openMenu === item.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-6 flex flex-col gap-1"
                  >
                    {item.children.map((sub, sIdx) => (
                      <Link
                        key={sIdx}
                        to={sub.path}
                        onClick={() => setMobileOpen(false)}
                        className={`px-3 py-2 text-sm rounded-lg transition duration-200 font-medium
                        hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300
                        ${
                          location.pathname === sub.path
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                            : "text-gray-700 dark:text-gray-300"
                        }
                      `}
                        tabIndex={0}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              key={idx}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200 font-medium
              hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300
              ${
                location.pathname === item.path
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300"
              }
            `}
              tabIndex={0}
            >
              <span className="text-gray-600 dark:text-gray-400">
                {item.icon}
              </span>
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        )}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 px-2 lg:border-r lg:border-gray-200 lg:bg-white dark:lg:border-gray-700 dark:lg:bg-gray-900">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-lg z-50 lg:hidden"
          >
            <div className="flex justify-end items-center p-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 shadow dark:shadow-gray-700/20 px-4 lg:px-6 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <Button onClick={handleLogout}>LogOut</Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
