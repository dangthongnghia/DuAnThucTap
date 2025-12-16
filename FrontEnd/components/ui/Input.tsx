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
                "flex-row items-center rounded-2xl border border-input bg-background px-4 py-3",
                "focus:border-primary focus:ring-1 focus:ring-primary",
                error && "border-destructive",
                className
            )}>
                {leftIcon && <View className="mr-3 text-muted-foreground">{leftIcon}</View>}
                <TextInput
                    className="flex-1 text-base text-foreground placeholder:text-muted-foreground"
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
