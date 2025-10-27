import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useTheme } from 'next-themes';
import EachPriceCard from './EachPriceCard';
import { useFetchPricing } from './query';
import { useQueryClient } from '@tanstack/react-query';


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;

}
interface PricingTabProps {
    billingType: 'monthly' | 'yearly';
    setBillingType: (type: 'monthly' | 'yearly') => void;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function PricingTab({ billingType, setBillingType }: PricingTabProps) {
    const queryClient = useQueryClient();
    const { data, isLoading } = useFetchPricing()
    const [value, setValue] = React.useState(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    const { theme, setTheme } = useTheme();
    const [selectedCategory, setSelectedCategory] = React.useState('individuals');
    console.log("Selected Category:", selectedCategory);
    const individuals = data && data?.find(d => d.category === "individuals");
    const schools = data?.find(d => d.category === "schools");
    const teachers = data?.find(d => d.category === "teachers");
    return (
        <Box
            className="container mx-auto flex-col items-center justify-center md:p-4   "
            sx={{ display: 'flex', backgroundColor: theme === "dark" ? "" : '#fff', color: theme === "dark" ? '#fff' : '#000' }}>
            <Box className=" justify-center items-center border-2" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: theme === "dark" ? '#fff' : '#000',
                        },
                        '& .MuiTab-root': {
                            color: theme === "dark" ? '#fff' : '#000',
                        },
                    }}
                    value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab onClick={() => { setSelectedCategory("indviduals"); queryClient.invalidateQueries({ queryKey: ['fetchPricing'] }); }} label="individuals" {...a11yProps(0)} />
                    <Tab onClick={() => { setSelectedCategory("schools"); queryClient.invalidateQueries({ queryKey: ['fetchPricing'] }); }} label="schools" {...a11yProps(1)} />
                    <Tab onClick={() => { setSelectedCategory("teachers"); queryClient.invalidateQueries({ queryKey: ['fetchPricing'] }); }} label="teachers" {...a11yProps(2)} />
                </Tabs>
            </Box>

            <CustomTabPanel value={value} index={0}>
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 px-6 md:px-14">
                    {
                        individuals && individuals.tabs.map((tabs) => {
                            return <EachPriceCard key={tabs.type} {...tabs} />
                        }
                        )
                    }

                </div>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-14">
                    {
                        schools && schools.tabs.map((tabs) => {
                            console.log("Tabs Data:", tabs);
                            return <EachPriceCard key={tabs.type} {...tabs} />
                        }
                        )
                    }

                </div>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 px-14">
                    {
                        teachers && teachers.tabs.map((tabs) => {
                            console.log("Tabs Data:", tabs);
                            return <EachPriceCard key={tabs.type} {...tabs} />
                        }
                        )
                    }

                </div>
            </CustomTabPanel>
        </Box>
    );
}
