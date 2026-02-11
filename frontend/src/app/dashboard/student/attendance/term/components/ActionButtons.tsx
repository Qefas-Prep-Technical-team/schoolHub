// src/components/Header/ActionButtons.tsx
import React from 'react';
import Button from './ui/Button';

const ActionButtons: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="primary" icon="download">
        Download PDF
      </Button>
      <Button variant="secondary" icon="share">
        Share with Parent
      </Button>
    </div>
  );
};

export default ActionButtons;