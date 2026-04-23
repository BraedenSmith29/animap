import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'medium' | 'large';
    className?: string;
    href?: string;
    children: React.ReactNode;
}

export function Button({
    variant = 'secondary',
    size = 'medium',
    href,
    children,
    className = '',
    ...props
}: ButtonProps) {
    const sizeClass = `${size}-btn`;
    const classNames = `btn btn--${variant} ${sizeClass} ${className}`.trim();

    if (href) {
        return (
            <a
                href={href}
                className={classNames}
                target="_blank"
                rel="noopener noreferrer"
                {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
            >
                {children}
            </a>
        );
    }

    return (
        <button className={classNames} {...props}>
            {children}
        </button>
    );
}
