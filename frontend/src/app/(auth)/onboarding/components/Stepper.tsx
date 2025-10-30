import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

const steps = [
  'Select master blaster campaign settings',
  'Create an ad group',
  'Create an ad',
];

export default function StepperMain() {
  return (
    <Box sx={{ width: '100%',display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",marginTop:5 }}>
    <Box sx={{ width: '80%',alignItems:"center",justifyContent:"center",display:"flex"}}>
      <Stepper activeStep={1} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
    </Box>

  );
}
