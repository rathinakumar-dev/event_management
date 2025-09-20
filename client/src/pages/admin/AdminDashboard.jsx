import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Calendar, ChevronDown, Menu, X, Gift, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import DarkModeToggle from "@/components/DarkModeToggle";
import axios from "axios";
import { toast } from "sonner";


const AdminDashboard = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();

  const [activePath, setActivePath] = useState(() => {
    return localStorage.getItem("activePath") || "/giftaddform";
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
    // {
    //   name: "Agent",
    //   icon: <Users className="w-5 h-5" />,
    //   children: [
    //     { name: "Verify Gift Form", path: "/dashboard/agentform" },
    //     { name: "Verified Gift List", path: "/dashboard/agentlist" },
    //   ],
    // },
    {
      name: "Gift Management",
      icon: <Gift className="w-5 h-5" />,
      children: [
        { name: "Add Gift Form", path: "/admin_dashboard/giftaddform" },
        { name: "Added Gift List", path: "/admin_dashboard/giftaddlist" },
      ],
    },
    {
      name: "Agent User ",
      icon: <UserPlus className="w-5 h-5" />,
      children: [
        { name: "Add Agent Form", path: "/admin_dashboard/agentaddform" },
        { name: "Added Agent List", path: "/admin_dashboard/agentaddlist" },
      ],
    },
    {
      name: "Event Management",
      icon: <Calendar className="w-5 h-5" />,
      children: [
        { name: "Add Event Form", path: "/admin_dashboard/eventaddform" },
        { name: "Added Event List", path: "/admin_dashboard/eventaddlist" },
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
      <div className="p-4 border-b font-bold text-lg">My Dashboard</div>
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item, idx) =>
          item.children ? (
            <div key={idx} className="mb-1">
              <button
                className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition duration-200
            ${openMenu === item.name ? "bg-gray-100" : "hover:bg-gray-50"}
            focus:ring focus:outline-none`}
                onClick={() =>
                  setOpenMenu(openMenu === item.name ? null : item.name)
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
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
                        className={`px-3 py-2 text-sm rounded-lg transition duration-200
                    hover:bg-indigo-100 hover:text-indigo-700 font-medium
                    ${
                      location.pathname === sub.path
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700"
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
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200
          hover:bg-indigo-100 hover:text-indigo-700 font-medium
          ${
            location.pathname === item.path
              ? "bg-indigo-100 text-indigo-700 "
              : "text-gray-700"
          }
        `}
              tabIndex={0}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        )}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 px-2 lg:border-r lg:border-gray-200 lg:bg-white">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 lg:hidden"
          >
            <div className="flex justify-end items-center p-4">
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 bg-white shadow px-4 lg:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-4">
             <DarkModeToggle></DarkModeToggle>
            <Button onClick={handleLogout}>LogOut</Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 overflow-y-auto">
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

export default AdminDashboard;
