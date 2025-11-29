import React from 'react';
import Button from './ui/Button';

const FooterActions: React.FC = () => {
    return (
        <div className="flex justify-end items-center gap-3">
            <Button variant="outline">Finish Later</Button>
            <Button variant="secondary">Save & Add Next</Button>
            <Button variant="primary">Add Question</Button>
        </div>
    );
};

export default FooterActions;