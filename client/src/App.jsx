import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import Login from "@/pages/auth/Login";
import UserDashboard from "@/pages/agent/UserDashboard";
import VerifyGuest from "@/pages/agent/verifyGuest/VerifyGuest";
import VerifyGuestList from "@/pages/agent/verifyGuest/VerifyGuestList";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import PrivateRoute from "@/components/PrivateRoute";
import GiftAddForm from "./pages/admin/Giftadd/GiftAddForm";
import GiftAddList from "./pages/admin/Giftadd/GiftAddList";
import GiftEditForm from "./pages/admin/Giftadd/GiftEditForm";
import AgentAddForm from "./pages/admin/agentadd/AgentAddForm";
import AgentAddList from "./pages/admin/agentadd/AgentAddList";
import EventAddForm from "./pages/admin/eventadd/EventAddForm";
import EventAddedList from "./pages/admin/eventadd/EventAddList";
import GuestForm from "./pages/guest/GuestForm";
import EventStatus from "./components/EventStatus";



export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />
          <Route path="/guest_form/:eventId" element={<GuestForm />} />
          <Route path="*" element={<EventStatus />} /> 

          {/* Agent routes */}
          <Route element={<PrivateRoute allowedRoles={["agent"]} />}>
            <Route path="/user_dashboard" element={<UserDashboard />}>
              <Route index element={<Navigate to="verify_guest" replace />} />
              <Route path="verify_guest" element={<VerifyGuest />} />
              <Route path="verify_guest_list" element={<VerifyGuestList />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin_dashboard" element={<AdminDashboard />}>
              <Route path="giftaddform" element={<GiftAddForm />} />
              <Route path="giftaddlist" element={<GiftAddList />} />
              <Route path="edit-gift/:id" element={<GiftEditForm />} />
              <Route path="agentaddform" element={<AgentAddForm />} />
              <Route path="agentaddlist" element={<AgentAddList />} />
              <Route path="eventaddform" element={<EventAddForm />} />
              <Route path="eventaddlist" element={<EventAddedList />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
