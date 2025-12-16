import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '../../lib/utils';

interface CardProps extends ViewProps {
    variant?: 'default' | 'glass' | 'outlined';
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
    const variants = {
        default: "bg-card shadow-sm border border-border/50",
        glass: "bg-white/80 dark:bg-black/80 backdrop-blur-md border border-white/20",
        outlined: "bg-transparent border border-border",
    };

    return (
        <View
            className={cn("rounded-3xl p-5", variants[variant], className)}
            {...props}
        />
    );
}
