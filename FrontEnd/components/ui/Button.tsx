import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator, View } from 'react-native';
import { cn } from '../../lib/utils';
import { Typography } from './Typography';

interface ButtonProps extends TouchableOpacityProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    loading?: boolean;
    label?: string;
    className?: string;
    textClassName?: string;
    children?: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'default',
    loading = false,
    label,
    className,
    textClassName,
    children,
    disabled,
    ...props
}: ButtonProps) {

    const baseStyles = "flex-row items-center justify-center rounded-2xl active:opacity-80";

    const variants = {
        primary: "bg-primary shadow-lg shadow-primary/30",
        secondary: "bg-secondary",
        outline: "border border-input bg-background",
        ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive shadow-sm",
    };

    const sizes = {
        default: "h-14 px-6 py-3",
        sm: "h-10 rounded-xl px-4",
        lg: "h-16 rounded-3xl px-8",
        icon: "h-12 w-12",
    };

    const textVariants = {
        primary: "text-primary-foreground font-semibold",
        secondary: "text-secondary-foreground font-medium",
        outline: "text-foreground font-medium",
        ghost: "text-foreground font-medium",
        destructive: "text-destructive-foreground font-semibold",
    };

    return (
        <TouchableOpacity
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                (disabled || loading) && "opacity-50",
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? 'black' : 'white'} />
            ) : (
                <>
                    {label ? (
                        <Typography
                            variant={size === 'lg' ? 'h4' : 'body'}
                            className={cn(textVariants[variant], textClassName)}
                        >
                            {label}
                        </Typography>
                    ) : children}
                </>
            )}
        </TouchableOpacity>
    );
}
