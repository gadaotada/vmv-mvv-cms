import { useState } from "react";

import { useAuth } from "~/providers/AuthProvider";
import { Input } from "~/ui/input";
import { Button } from "~/ui/button";

export default function Login() {
    const [credentials, setCredentials] = useState({email: "", password: ""});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState({email: false, password: false});
    const { login } = useAuth();

    const validateForm = () => {
        return credentials.email.trim().length > 4 && credentials.password.trim().length > 5
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials((prev) => ({...prev, [e.target.name]: e.target.value}))
    }

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        const res = await login(credentials.email, credentials.password);
        console.log(res)
        setError({email: !res, password: !res});
        setLoading(false);
    }

    return (
        <div className="flex flex-col justify-start items-center gap-8 p-4 min-w-80 max-w-[600px] shadow border">
            <div className="flex flex-col justify-start items-center gap-2">
                <h1 className="text-3xl font-bold text-center max-w-40">
                    CMS v1.0
                </h1>
                <h5 className="text-xl">
                    Вход в системата
                </h5>
            </div>
            <Input 
                id="email"
                name="email"
                placeholder="Имейл"
                type="text"
                value={credentials.email}
                onChange={handleChange}
                onFocus={() => setError({...error, email: false})}
                className={error.email ? "border-red-500 text-red-500" : ""}
            />
            <Input 
                id="password"
                name="password"
                placeholder="Парола"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                onFocus={() => setError({...error, password: false})}
                className={error.password ? "border-red-500 text-red-500" : ""}
            />
            <Button
                variant={"primary"}
                onClick={handleLogin}
                disabled={loading}
                className="min-w-40"
            >
                Влез
            </Button>
        </div>
    )
}