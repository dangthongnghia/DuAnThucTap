import { Text, TextProps } from 'react-native';
import { cn } from '../../lib/utils';

interface TypographyProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'small';
    className?: string;
}

export function Typography({ variant = 'body', className, ...props }: TypographyProps) {
    const baseStyles = "text-foreground font-app";

    const variants = {
        h1: "text-4xl font-heading font-bold tracking-tight",
        h2: "text-3xl font-heading font-bold tracking-tight",
        h3: "text-2xl font-heading font-semibold tracking-tight",
        h4: "text-xl font-heading font-semibold tracking-tight",
        body: "text-base font-body",
        caption: "text-sm font-body text-muted-foreground",
        small: "text-xs font-body font-medium leading-none",
    };

    return (
        <Text
            className={cn(baseStyles, variants[variant], className)}
            {...props}
        />
    );
}
