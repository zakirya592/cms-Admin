import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button, Card, Input, InputGroup, Label, TextField } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useOffice } from "@/office";

export function RegisterPage() {
  const { user, register } = useOffice();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await register(name, email, password);
      toast.success(result.message || "Account created");
      navigate(result.signedIn ? "/" : "/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout>
      <Card className="glass-card rounded-3xl p-3 sm:p-5 shadow-[0_20px_50px_-10px_rgba(28,25,20,0.1)]">
        <Card.Header className="pb-2">
          <Card.Title className="font-serif text-3xl text-ink">Create an account</Card.Title>
          <Card.Description className="text-stone-500 text-sm mt-1">Name, email, and a password for the office.</Card.Description>
        </Card.Header>
        <Card.Content className="pt-2">
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <TextField value={name} onChange={setName} isRequired>
              <Label className="text-xs font-medium text-stone-700">Name</Label>
              <Input autoComplete="name" placeholder="John Doe" />
            </TextField>
            <TextField value={email} onChange={setEmail} isRequired>
              <Label className="text-xs font-medium text-stone-700">Email</Label>
              <Input type="email" autoComplete="email" placeholder="name@company.com" />
            </TextField>
            <TextField value={password} onChange={setPassword} isRequired minLength={8}>
              <Label className="text-xs font-medium text-stone-700">Password</Label>
              <InputGroup>
                <InputGroup.Input type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} placeholder="At least 8 characters" />
                <InputGroup.Suffix className="px-1.5">
                  <Button
                    isIconOnly
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="hover:bg-white/60 text-stone-600 rounded-lg"
                    onPress={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </Button>
                </InputGroup.Suffix>
              </InputGroup>
            </TextField>
            <Button type="submit" variant="primary" className="glass-btn-primary rounded-xl py-2.5 font-medium mt-1 cursor-pointer" isPending={pending}>
              Create account
            </Button>
          </form>
          <p className="mt-5 text-center text-xs text-stone-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-amber-800 hover:text-amber-900 hover:underline">
              Sign in
            </Link>
          </p>
        </Card.Content>
      </Card>
    </AuthLayout>
  );
}
