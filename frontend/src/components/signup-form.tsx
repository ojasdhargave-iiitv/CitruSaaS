import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { api } from "@/services/api"
import { useNavigate } from "react-router-dom"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      const res = await api.post("/users/signup", { username, email, password });
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed. Try again.");
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input id="username" type="text" placeholder="John Doe" value={username} onChange={e => setUsername(e.target.value)} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
            {success && <div style={{ color: "green", marginBottom: 8 }}>{success}</div>}
            <div className="flex flex-col gap-3 pt-2">
              <Button type="submit" className="w-full">
                Create Account
              </Button>
              <Button variant="outline" type="button" className="w-full">
                Sign up with Google
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4 hover:text-primary">
                  Sign In
                </a>
              </p>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

