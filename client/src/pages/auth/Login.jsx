import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Lock, Loader2, User } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { loginSchema } from "@/validation/FormValidations";

export default function Login() {
  const { setAuth } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear individual field error
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setError(null);
    setMessage(null);

    try {
      await loginSchema.validate(form, { abortEarly: false });

      setLoading(true);

      const res = await axios.post("/api/auth/login", form, {
        withCredentials: true,
      });

      const data = res.data;
     // console.log(data);

      if (!data?.accessToken || !data?.user) {
        throw new Error("Invalid response from server");
      }

      setAuth({
        accessToken: data.accessToken,
        role: data.user.role,
        username: data.user.username,
      });

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("accessToken", data.accessToken);
      storage.setItem("role", data.user.role);
      storage.setItem("username", data.user.username);
      storage.setItem("userId", data.user.id);

      toast.success("Login successful!");
      setMessage("Login successful! Redirecting...");

      if (data.user.role === "admin") {
        navigate("/admin_dashboard");
      } else {
        navigate("/user_dashboard");
      }

      setForm({ username: "", password: "" });
    } catch (err) {
      if (err.name === "ValidationError") {
        // Yup validation errors
        const validationErrors = {};
        err.inner.forEach(({ path, message }) => {
          if (path) validationErrors[path] = message;
        });
        setErrors(validationErrors);
        // toast.error(err.inner[0]?.message || "Validation failed");
      } else {
        // API / network errors
        const apiError = err.response?.data?.message || err.message;
        setError(apiError);
        // toast.error(apiError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-gray-900 dark:text-gray-100">
              Moon Live Gifts
            </CardTitle>
            <CardDescription className="text-center text-gray-700 dark:text-gray-300">
              Sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="johndoe_123"
                    value={form.username}
                    onChange={handleChange}
                    className={`pl-9 border ${
                      errors.username ? "border-red-500" : "border-gray-500"
                    } dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200`}
                    autoComplete="username"
                    required
                  />
                </div>
                {errors.username && (
                  <p className="text-red-600 dark:text-red-500 text-sm mt-1">
                    {errors.username}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className={`pl-9 pr-10 border ${
                      errors.password ? "border-red-500" : "border-gray-500"
                    } dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200`}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 dark:text-red-500 text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center mt-2 gap-2">
                  <Checkbox
                    id="remember"
                    className="border-gray-500 dark:border-gray-600"
                    checked={remember}
                    onCheckedChange={(v) => setRemember(Boolean(v))}
                  />
                  <Label
                    htmlFor="remember"
                    className="font-normal text-gray-700 dark:text-gray-300"
                  >
                    Remember me
                  </Label>
                </div>
              </div>

              {message && (
                <div className="text-sm text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full mx-auto"
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
