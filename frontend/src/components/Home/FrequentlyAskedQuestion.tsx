import Box from '@mui/material/Box';
import React, { FC } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from 'next-themes';
import Button from '@mui/material/Button';
import { useFetchFrequentlyAsked } from './query';


const FrequentlyAskedQuestion: FC = () => {
    const { theme, setTheme } = useTheme();
    const { data, isLoading } = useFetchFrequentlyAsked()
    return (
        <Box component={"section"} className='mb=20 text-center items-center justify-center flex-col w-full'>
            <div className=" text-center space-y-10 justify-center items-center mb-8 md:mb-10">
                <h1 className=" text-2xl md:text-4xl text-1xl font-bold">Frequently Asked Questions</h1>
            </div>
            <Box className="mb-10" sx={{ width: { xs: "90%", md: "50%" }, margin: "auto" }}>
                {
                    data && data.map((items, index) => (
                        <Accordion className='p-2' key={index} sx={{ backgroundColor: theme === "dark" ? '#121212' : '#fff', color: theme === "dark" ? '#fff' : '#000' }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ backgroundColor: theme === "dark" ? '#121212' : '#fff', color: theme === "dark" ? '#fff' : '#000' }} />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                            >
                                <Typography component="span">{items.question}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {items.answer}
                            </AccordionDetails>
                        </Accordion>
                    ))
                }
            </Box>
            <Box className="mt-50 justify-center items-center m-auto w-full text-center mb-10">
                <div className=" text-center space-y-10 justify-center items-center w-3/4 m-auto">
                    <h1 className="md:text-4xl text-2xl font-bold"> Ready to Streamline Your School Management?</h1>
                    <p className='md:text-xl sm:text-lg text-center  mx-auto w-2/4 mb-10'>Start your free trial today and experience the power of SchoolHub. No credit
                        card required.</p>
                </div>
                <Button variant='contained' className='mt-30 bg-blue-400'>Get Started for Free</Button>
            </Box>
        </Box>
    );
};

export default FrequentlyAskedQuestion;