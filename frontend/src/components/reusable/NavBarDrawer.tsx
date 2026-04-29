import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { mainTab } from '../Types/Nav';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { 
    LayoutDashboard, 
    Rocket, 
    Menu, 
    FileText, 
    CreditCard, 
    Info, 
    Shield, 
    LogIn, 
    Phone 
} from 'lucide-react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useAuthModalStore } from '@/utils/AuthModalStore';


interface NavBarDrawerProps {
    pages: mainTab[];
}
export default function NavBarDrawer(props: NavBarDrawerProps) {
    const { isAuthenticated } = useAuthStore();
    const { openModal } = useAuthModalStore();
    const { theme } = useTheme();
    const { pages } = props;
    const [open, setOpen] = React.useState(false);
    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const handleIcon = (type: string) => {
        if (type === "Features") {
            return <FileText size={20} />
        } else if (type === "Pricing") {
            return <CreditCard size={20} />
        } else if (type === "About Us") {
            return <Info size={20} />
        } else {
            return <Shield size={20} />
        }
    }
    const DrawerList = (
        <Box sx={{ width: 250, backgroundColor: theme == "dark" ? "black" : "white", flex: 1, color: theme == "dark" ? "white" : "black" }} role="presentation" onClick={toggleDrawer(false)}>
            <Box className='flex items-center gap-3 px-6 py-8'>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-lg shadow-blue-600/10 border border-slate-200 dark:border-slate-800 p-1.5">
                    <img src="/logo/favicon.svg" alt="Qefas Hub" className="h-full w-full object-contain" />
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                    Qefas <span className="text-blue-600">Hub</span>
                </span>
            </Box>
            <Divider className='pt' sx={{ backgroundColor: theme == "dark" ? "white" : "black" }} />
            <List>
                {pages.map((text) => (
                    <Link key={text.name} href={text.href} passHref>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon sx={{ color: theme == "dark" ? "white" : "black" }}>
                                    {handleIcon(text.name)}
                                </ListItemIcon>
                                <ListItemText primary={text.name} />
                            </ListItemButton>
                        </ListItem>
                    </Link>
                ))}
                <Divider className='pt' sx={{ backgroundColor: theme == "dark" ? "white" : "black", mt: 10 }} />
                <ListItem disablePadding onClick={() => openModal('signup-role')}>
                    <ListItemButton>
                        <ListItemIcon sx={{ color: theme == "dark" ? "white" : "black" }}>
                            <Rocket />
                        </ListItemIcon>
                        <ListItemText primary={"Get Started"} />
                    </ListItemButton>
                </ListItem>
                {
                    !isAuthenticated ?
                        <>

                            <ListItem disablePadding onClick={() => openModal('login-role')}>
                                <ListItemButton>
                                    <ListItemIcon sx={{ color: theme == "dark" ? "white" : "black" }}>
                                        <LogIn size={20} />
                                    </ListItemIcon>
                                    <ListItemText primary={"Login"} />
                                </ListItemButton>
                            </ListItem>
                            <Link href={"/contact"} passHref>
                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon sx={{ color: theme == "dark" ? "white" : "black" }}>
                                            <Phone size={20} />
                                        </ListItemIcon>
                                        <ListItemText primary={"Contact Us"} />
                                    </ListItemButton>
                                </ListItem>
                            </Link>
                        </>
                        :
                        <Link href={"/dashboard"} passHref>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon sx={{ color: theme == "dark" ? "white" : "black" }}>
                                        <LayoutDashboard />
                                    </ListItemIcon>
                                    <ListItemText primary={"Dashboard"} />
                                </ListItemButton>
                            </ListItem>
                        </Link>


                }
            </List>
        </Box>
    );

    return (
        <div className={`${theme == "light" ? "bg-white-500 " : "bg-black-500"} `}>
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={toggleDrawer(true)}
                color="inherit"
            >
                <Menu />
            </IconButton>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </div>
    );
}
