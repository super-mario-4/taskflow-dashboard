import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SquareCheck } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.jsx';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '@/store/authSlice';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router';

// Validation schema using Zod
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        dispatch(loginStart());

        try {
            // Call the auth service to login
            const response = await authService.login(data.email, data.password);

            // Dispatch success action with user data
            dispatch(loginSuccess(response));

            // Redirect to dashboard after successful login
            navigate('/dashboard');
        } catch (err) {
            // Dispatch failure action with error message
            dispatch(loginFailure(err.message || 'Login failed'));
        }
    };

    return (
        <React.Fragment>
            <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <div className="flex items-center gap-2 self-center font-medium">
                        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <SquareCheck className="size-4" />
                        </div>
                        Taskflow
                    </div>
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="text-xl">
                                    Hey there!
                                </CardTitle>
                                <CardDescription>
                                    Login with your credentials
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="email">
                                                Email
                                            </FieldLabel>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Email address"
                                                {...register('email')}
                                                aria-invalid={!!errors.email}
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="password">
                                                Password
                                            </FieldLabel>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={
                                                        showPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    placeholder="Password"
                                                    {...register('password')}
                                                    aria-invalid={
                                                        !!errors.password
                                                    }
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    aria-label={
                                                        showPassword
                                                            ? 'Hide password'
                                                            : 'Show password'
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="size-4" />
                                                    ) : (
                                                        <Eye className="size-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    {errors.password.message}
                                                </p>
                                            )}
                                        </Field>
                                        {error && (
                                            <div className="text-sm text-destructive">
                                                {error}
                                            </div>
                                        )}
                                        <Field>
                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="sr-only">
                                                            Loading...
                                                        </span>
                                                        <span>
                                                            Signing in...
                                                        </span>
                                                    </>
                                                ) : (
                                                    'Login'
                                                )}
                                            </Button>
                                        </Field>
                                    </FieldGroup>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Login;
