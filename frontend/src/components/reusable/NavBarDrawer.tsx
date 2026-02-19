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
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import DocumentScannerOutlinedIcon from '@mui/icons-material/DocumentScannerOutlined';
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined';
import EmojiPeopleOutlinedIcon from '@mui/icons-material/EmojiPeopleOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import { mainTab } from '../Types/Nav';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import PhoneCallbackOutlinedIcon from '@mui/icons-material/PhoneCallbackOutlined';
import { LayoutDashboard, Rocket } from 'lucide-react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';


interface NavBarDrawerProps {
    pages: mainTab[];
}
export default function NavBarDrawer(props: NavBarDrawerProps) {
    const { isAuthenticated } = useAuthStore();
    const { theme } = useTheme();
    const { pages } = props;
    const [open, setOpen] = React.useState(false);
    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const handleIcon = (type: string) => {
        if (type === "Features") {
            return <DocumentScannerOutlinedIcon />
        } else if (type === "Pricing") {
            return <CurrencyExchangeOutlinedIcon />
        } else if (type === "About Us") {
            return <EmojiPeopleOutlinedIcon />
        } else {
            return <AdminPanelSettingsOutlinedIcon />
        }

    }
    const DrawerList = (
        <Box sx={{ width: 250, backgroundColor: theme == "dark" ? "black" : "white", flex: 1, color: theme == "dark" ? "white" : "black" }} role="presentation" onClick={toggleDrawer(false)}>
            <Box className='flex items-center flex-row justify-center flex-1 ml-5 mt-4 mb-4'>
                <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, mr: 1 }}>
                    <Image src="/schoolhub.png" alt="school hub logo" width={20} height={20} className='space-x-20' />
                </Box>
                <Typography
                    variant="h5"
                    noWrap
                    component="a"
                    href="/"
                    sx={{
                        mr: 2,
                        display: { xs: 'flex', md: 'none' },
                        flexGrow: 1,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '.3rem',
                        color: 'inherit',
                        textDecoration: 'none',
                    }}
                >
                    SCHOOLHUB
                </Typography>
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
                <Link href={"/signup"} passHref>
                    <ListItem disablePadding>
                        <ListItemButton>
                            <ListItemIcon sx={{ color: theme == "dark" ? "white" : "black" }}>
                                <Rocket />
                            </ListItemIcon>
                            <ListItemText primary={"Get Started"} />
                        </ListItemButton>
                    </ListItem>
                </Link>
                {
                    !isAuthenticated ?
                        <>

                            <Link href={"/login"} passHref>
                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon sx={{ color: theme == "dark" ? "white" : "black" }}>
                                            <LoginOutlinedIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={"Login"} />
                                    </ListItemButton>
                                </ListItem>
                            </Link>
                            <Link href={"/contact"} passHref>
                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon sx={{ color: theme == "dark" ? "white" : "black" }}>
                                            <PhoneCallbackOutlinedIcon />
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
                <MenuIcon />
            </IconButton>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </div>
    );
}
