import React from 'react';
import { View, ViewProps, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '../lib/utils';

interface ScreenWrapperProps extends ViewProps {
    children: React.ReactNode;
    bgClassName?: string;
    safeArea?: boolean;
}

export function ScreenWrapper({
    children,
    className,
    bgClassName,
    safeArea = true,
    ...props
}: ScreenWrapperProps) {
    const Container = safeArea ? SafeAreaView : View;

    return (
        <View className={cn("flex-1 bg-background", bgClassName)}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <Container className={cn("flex-1", className)} {...props}>
                {children}
            </Container>
        </View>
    );
}
