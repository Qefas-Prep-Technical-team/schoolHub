// src/components/Dashboard/ActionButtons.tsx
import React from 'react';
import { ActionButton } from './types';
import Button from './ui/Button';

const ActionButtons: React.FC = () => {
    const buttons: ActionButton[] = [
        {
            label: 'View Full Report Card',
            icon: 'description',
            variant: 'primary',
        },
        {
            label: 'Compare Term Performance',
            icon: 'compare_arrows',
            variant: 'secondary',
        },
    ];

    return (
        <div className="flex flex-wrap items-center justify-start gap-4 pt-4">
            {buttons.map((button, index) => (
                <Button key={index} variant={button.variant} icon={button.icon}>
                    {button.label}
                </Button>
            ))}
        </div>
    );
};

export default ActionButtons;