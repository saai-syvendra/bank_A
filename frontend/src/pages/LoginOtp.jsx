// src/Login.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authenticateUser, login, loginOtp } from "../api/UserApi";
import OtpForm from "../forms/otpForm";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import LoadingButton from "../components/LoadingButton";

const LoginOtp = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        // call autheticate in an async function
        const authenticate = async () => {
            try {
                await authenticateUser();
                navigate("/dashboard");
            } catch (error) {
                // console.error("User not logged in");
            }
        };

        authenticate();
    }, [otpVerified, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await login(username, password);

            if (response.message === "OTP Sent") {
                setOtpSent(true);
                toast.success("OTP sent to your email!");
            }
        } catch (error) {
            console.error("Error:", error.message);
            toast.error(error.message);
        }
    };

    const handleOtpSubmit = async (otp) => {
        try {
            const response = await loginOtp(otp);
            localStorage.setItem("role", response.role);
            setOtpVerified(true);
            navigate("/dashboard");
            toast.success("Login successful!");
        } catch (error) {
            console.error("Error:", error.message, error);
            if (incorrectCount >= 2) {
                toast.error("OTP verification failed 3 times!\nLogin again!");
                setUsername("");
                setPassword("");
                setIncorrectCount(0);
                setOtpSent(false);
            } else if (error.message === "OTP incorrect") {
                setIncorrectCount(incorrectCount + 1);
                toast.error("OTP incorrect! Try again!");
            } else if (error.message === "OTP not found") {
                toast.error("Internal error! Try again!");
            } else {
                toast.error(error.message);
            }
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            {otpSent ? (
                <OtpForm onSubmit={handleOtpSubmit} />
            ) : (
                <Card className="w-80 bg-white shadow-md rounded">
                    <form onSubmit={handleLogin}>
                        <CardHeader className="p-6">
                            <h2 className="text-2xl font-bold mb-6 text-center">
                                Login
                            </h2>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-2 mb-4 border rounded"
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 mb-6 border rounded"
                            />
                        </CardContent>
                        <CardFooter className="p-6">
                            <Button
                                type="submit"
                                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Login
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}
        </div>
    );
};

export default LoginOtp;
