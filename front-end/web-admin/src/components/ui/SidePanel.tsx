"use client";
import React, { useEffect, useRef } from 'react';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    disableClickOutside?: boolean;
}

export default function SidePanel({ isOpen, onClose, title, children, disableClickOutside }: SidePanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (disableClickOutside) return;
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose, disableClickOutside]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (disableClickOutside) return;
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, disableClickOutside]);

    // Prevent body scroll when panel is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(2px)',
                    zIndex: 9998,
                }}
            />
            {/* Panel Container */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    pointerEvents: 'none',
                    zIndex: 9999,
                }}
            >
                <div
                    ref={panelRef}
                    style={{
                        width: '100%',
                        maxWidth: '48rem',
                        backgroundColor: 'white',
                        height: '100%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        pointerEvents: 'auto',
                        animation: 'slideIn 0.3s ease-out',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid #e5e7eb',
                            background: 'linear-gradient(to right, #f9fafb, white)',
                        }}
                    >
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>{title}</h2>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: 'transparent',
                                color: '#6b7280',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                                e.currentTarget.style.color = '#374151';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#6b7280';
                            }}
                            aria-label="Close panel"
                        >
                            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1.5rem',
                            backgroundColor: '#f9fafb',
                        }}
                    >
                        <div style={{ maxWidth: '100%' }}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </>
    );
}
