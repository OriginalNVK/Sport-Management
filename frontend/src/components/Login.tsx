import { useState } from "react";
import { Lock, LogIn, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { authService } from "../services/AuthService";

interface LoginProps {
  onLogin: (username: string, role: "customer" | "manager" | "receptionist" | "staff") => void;
  onShowRegister?: () => void;
}

export function Login({ onLogin, onShowRegister }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login({
        tenDangNhap: username,
        matKhau: password,
      });

      // Lưu token và user data vào localStorage
      localStorage.setItem('access_token', response.token);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('user_data', JSON.stringify({
        maNv: response.maNv,
        maKh: response.maKh,
        vaiTro: response.vaiTro,
        tenDangNhap: username
      }));

      // Xác định role dựa trên vaiTro từ backend
      let role: "customer" | "manager" | "receptionist" | "staff" = "customer";
      if (response.vaiTro === "quan_ly" || response.vaiTro === "admin") {
        role = "manager";
      } else if (response.vaiTro === "le_tan") {
        role = "receptionist";
      } else if (response.vaiTro === "nhan_vien") {
        role = "staff";
      }
      onLogin(username, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">Sport Hub</CardTitle>
          <p className="text-gray-600">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700">
                Username
              </Label>
              <div className="relative">
                <Input id="username" type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg" disabled={isLoading}>
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Don't have an account?{" "}
              <button type="button" onClick={onShowRegister} className="text-blue-600 hover:text-blue-700 font-semibold">
                Register now
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
