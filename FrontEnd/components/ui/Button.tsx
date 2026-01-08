import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator, View, Text } from 'react-native';
import { cn } from '../../lib/utils';
import { Typography } from './Typography';
import { LinearGradient } from 'expo-linear-gradient';

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

    const baseStyles = "flex-row items-center justify-center rounded-full active:opacity-90 active:scale-95 transition-all overflow-hidden";

    const variants = {
        primary: "shadow-lg shadow-primary/40 border-0", // Color handled by Gradient
        secondary: "bg-secondary border border-transparent",
        outline: "border border-input bg-transparent",
        ghost: "bg-transparent",
        destructive: "bg-destructive shadow-sm",
    };

    const sizes = {
        default: "h-14 px-8",
        sm: "h-10 px-5",
        lg: "h-16 px-10",
        icon: "h-12 w-12",
    };

    const textVariants = {
        primary: "text-white font-bold tracking-wide",
        secondary: "text-secondary-foreground font-semibold",
        outline: "text-foreground font-semibold",
        ghost: "text-foreground font-medium",
        destructive: "text-destructive-foreground font-semibold",
    };

    const content = (
        <>
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
        </>
    );

    if (variant === 'primary' && !disabled && !loading) {
        return (
            <TouchableOpacity
                className={cn(baseStyles, sizes[size], variants[variant], className)}
                disabled={disabled || loading}
                {...props}
            >
                <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']} // Violet 500 -> Violet 600
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="absolute inset-0"
                />
                {content}
            </TouchableOpacity>
        );
    }

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
            {content}
        </TouchableOpacity>
    );
}
