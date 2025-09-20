import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AgentAddList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/users?page=1&role=agent", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else {
        toast.error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  fetchAgents();
}, [token, setLoading, setUsers]);  

  const handleEdit = (user) => {
    navigate("/admin_dashboard/agentaddform", { state: { user } });
  };

  const handleDelete = async (userId) => {
    const userToDelete = users.find((u) => u._id === userId);

    if (!userToDelete) {
      toast.error("User not found");
      return;
    }
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await axios.delete(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200 || res.data.success) {
          setUsers((prev) => prev.filter((u) => u._id !== userId));
          toast.success(`${userToDelete.name} deleted successfully`);
        } else {
          toast.error(res.data.message || "Error deleting user");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error deleting user");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4 sm:p-6">
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg rounded-2xl w-full max-w-6xl mb-auto md:mb-0">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-800">
            Agent List
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full max-w-xl mx-auto items-center border-collapse text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-2 py-3 text-start">Name</th>
                  <th className="px-2 py-3 text-center">Username</th>
                  <th className="px-2 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-200">
                      <td className="py-2 px-4">{user.name}</td>
                      <td className="py-2 px-4 text-center">{user.username}</td>
                      <td className="py-2 px-4 flex justify-center gap-2 items-center">
                        <Button
                          size="sm"
                          className={"bg-blue-500 text-white"}
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
