import { useState, useEffect } from "react";
import { userSchema } from "@/validation/FormValidations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";

export default function AgentAddForm() {
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
  });

  const location = useLocation();
  const navigate = useNavigate();
  const editingUser = location.state?.user || null;

  useEffect(() => {
    if (editingUser) {
      setForm({
        name: editingUser.name || "",
        username: editingUser.username || "",
        password: "",
      });
      setErrors({});
      setError(null);
    }
  }, [editingUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setErrors({});

    try {
      await userSchema.validate(form, { abortEarly: false });

      const token = localStorage.getItem("accessToken");
      if (editingUser) {
        await axios.put(`/api/users/${editingUser._id}`, form, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success(`${editingUser.name} updated successfully!`);
        navigate(-1);
      } else {
        const res = await axios.post("/api/auth/register", form, {
          withCredentials: true,
        });

        toast.success(
          `${res.data?.user?.name || form.name} created successfully!`
        );

        setForm({ name: "", username: "", password: "" });
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        const validationErrors = {};
        err.inner.forEach(({ path, message }) => {
          if (path) validationErrors[path] = message;
        });
        setErrors(validationErrors);
      } else {
        setError(err.response?.data?.message || err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg rounded-2xl w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {editingUser ? "Edit Agent" : "Add Agent"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter full name"
                name="name"
                className={errors.name ? "border-red-500" : "border-gray-500"}
                value={form.name}
                onChange={handleChange}
                required
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                name="username"
                className={
                  errors.username ? "border-red-500" : "border-gray-500"
                }
                value={form.username}
                onChange={handleChange}
                required
              />
              {errors.username && (
                <p className="text-red-600 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={
                  editingUser
                    ? "Leave blank to keep current password"
                    : "Enter password"
                }
                name="password"
                className={
                  errors.password ? "border-red-500" : "border-gray-500"
                }
                value={form.password}
                onChange={handleChange}
                required={!editingUser}
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg p-2 border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full mt-5">
              Save
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
