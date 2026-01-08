import React from 'react';
import { View, ViewProps, Platform } from 'react-native';
import { cn } from '../../lib/utils';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps extends ViewProps {
    children: React.ReactNode;
    className?: string;
    intensity?: number;
}

export function GlassCard({
    children,
    className,
    intensity = 40,
    ...props
}: GlassCardProps) {
    return (
        <View className={cn("overflow-hidden rounded-3xl border border-white/20", className)} {...props}>
            <LinearGradient
                colors={['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />
            {/* Note: Real backdrop blur on Android requires expo-blur which can be heavy. 
                 Using semi-transparent gradient + border for "glass" look which is performant. 
                 On iOS we could use BlurView but this keeps it consistent. */}
            <View className="p-6 z-10">
                {children}
            </View>
        </View>
    );
}
