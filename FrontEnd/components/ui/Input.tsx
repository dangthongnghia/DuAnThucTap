import React from 'react';
import { TextInput, View, TextInputProps } from 'react-native';
import { cn } from '../../lib/utils';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerClassName?: string;
}

export function Input({
    label,
    error,
    leftIcon,
    rightIcon,
    className,
    containerClassName,
    ...props
}: InputProps) {
    return (
        <View className={cn("space-y-2", containerClassName)}>
            {label && (
                <Typography variant="caption" className="ml-1 font-medium text-muted-foreground">
                    {label}
                </Typography>
            )}
            <View className={cn(
                "flex-row items-center rounded-3xl border border-transparent bg-secondary px-5 py-4 transition-all",
                "focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20",
                error && "border-destructive bg-destructive/5",
                className
            )}>
                {leftIcon && <View className="mr-3 text-muted-foreground">{leftIcon}</View>}
                <TextInput
                    className="flex-1 text-base text-foreground placeholder:text-muted-foreground font-medium"
                    placeholderTextColor="hsl(var(--muted-foreground))"
                    {...props}
                />
                {rightIcon && <View className="ml-3 text-muted-foreground">{rightIcon}</View>}
            </View>
            {error && (
                <Typography variant="small" className="ml-1 text-destructive">
                    {error}
                </Typography>
            )}
        </View>
    );
}
