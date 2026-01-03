import React from 'react';

interface HeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
    return (
        <div className="flex justify-between items-center mb-6 px-6 pt-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
                {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}
            </div>
            <div className="flex gap-3">
                {children}
            </div>
        </div>
    );
}
