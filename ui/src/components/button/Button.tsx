import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    href?: never;
}

interface AnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
}

type Props = (ButtonProps | AnchorProps) & {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'medium' | 'large';
};

export function Button(props: Props) {
    const {
        variant = 'secondary',
        size = 'medium',
        children,
        className = '',
    } = props;

    const classNames = `btn btn--${variant} btn--${size} ${className}`.trim();

    if (props.href !== undefined) {
        const { href, ...rest } = props;
        return (
            <a
                target="_blank"
                rel="noopener noreferrer"
                {...rest}
                href={href}
                className={classNames}
            >
                {children}
            </a>
        );
    } else {
        const { href: _href, ...rest } = props;
        return (
            <button type="button" {...rest} className={classNames}>
                {children}
            </button>
        );
    }
}
