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
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { api } from "@/services/api"

export function LoginForm({ ...props }: React.ComponentProps<typeof Card>) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await api.post("/users/login", { username, password })
            localStorage.setItem("token", res.data.token)
            navigate("/dashboard")
        } catch (error) {
            console.error("Login failed:", error)
            alert("Invalid credentials")
        }
    }

    return (
        <Card {...props}>
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                    Enter your username and password below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="username">Username</FieldLabel>
                            <Input
                                id="username"
                                type="text"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Field>
                        <div className="flex flex-col gap-3 pt-2">
                            <Button type="submit" className="w-full">
                                Sign In
                            </Button>
                            <p className="text-center text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <Link to="/signup" className="underline underline-offset-4 hover:text-primary">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
