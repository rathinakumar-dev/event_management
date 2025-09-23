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
  <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
    <Card className="border-slate-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 rounded-2xl w-full max-w-md bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-gray-800 dark:text-white">
          {editingUser ? "Edit Agent" : "Add Agent"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
          <div className="grid gap-2">
            <Label 
              htmlFor="name"
              className="text-gray-700 dark:text-gray-300 font-medium"
            >
              Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter full name"
              name="name"
              className={`bg-white dark:bg-gray-800 border text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 ${
                errors.name 
                  ? "border-red-500 dark:border-red-400" 
                  : "border-gray-300 dark:border-gray-600"
              }`}
              value={form.name}
              onChange={handleChange}
              required
            />
            {errors.name && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label 
              htmlFor="username"
              className="text-gray-700 dark:text-gray-300 font-medium"
            >
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              name="username"
              className={`bg-white dark:bg-gray-800 border text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 ${
                errors.username 
                  ? "border-red-500 dark:border-red-400" 
                  : "border-gray-300 dark:border-gray-600"
              }`}
              value={form.username}
              onChange={handleChange}
              required
            />
            {errors.username && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.username}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label 
              htmlFor="password"
              className="text-gray-700 dark:text-gray-300 font-medium"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={
                editingUser
                  ? "Leave blank to keep current password"
                  : "Enter password"
              }
              name="password"
              className={`bg-white dark:bg-gray-800 border text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 ${
                errors.password 
                  ? "border-red-500 dark:border-red-400" 
                  : "border-gray-300 dark:border-gray-600"
              }`}
              value={form.password}
              onChange={handleChange}
              required={!editingUser}
            />
            {errors.password && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-2 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
);

}
