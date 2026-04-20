"use client"
import React, { useEffect } from 'react';
import useSidebar from 'apps/seller-ui/src/hooks/useSidebar';
import { usePathname } from 'next/navigation';
import { useSeller } from 'apps/seller-ui/src/hooks/useSeller';
import Box from '../box';
import Link from 'next/link';
import { Body, Header } from './sidebar.styles';
import SidebarItem from './sidebar.item';
import HomeIcon from 'apps/seller-ui/src/assets/icons/home';
import { ListOrdered, PackageSearch, SquarePlus, Mail, Settings, BellRing, TicketPercent, LogOut } from 'lucide-react';
import SidebarMenu from './sidebar.menu';
import PaymentIcon from 'apps/seller-ui/src/assets/icons/payment';

const Sidebar = () => {
    const { activeSidebar, setActiveSidebar } = useSidebar();
    const pathName = usePathname();
    const { seller } = useSeller();

    console.log(seller);

    useEffect(() => {
        setActiveSidebar(pathName);
    }, [pathName, setActiveSidebar]);

    const getIconColor = (route: string) =>
        activeSidebar === route ? '#0085ff' : '#4a4a4a';

    return (
        <Box
            className='sidebar-wrapper'
            css={{
                height: '100vh',
                zIndex: 100,
                position: 'sticky',
                top: 0,
                overflowY: 'scroll',
                scrollbarWidth: 'none',
                backgroundColor: '#0a0a0a',
                borderRight: '1px solid #1f1f1f',
                width: '240px',
                padding: '0',
            }}
        >
            {/* Header */}
            <Header>
                <Link href='/' className='flex items-center gap-3 w-full'>
                    {/* Shop avatar dot */}
                    <div className='w-8 h-8 rounded-md bg-[#0f3158] flex items-center justify-center flex-shrink-0'>
                        <span className='text-[#0085ff] text-sm font-bold'>
                            {seller?.shop?.name?.[0]?.toUpperCase() ?? 'S'}
                        </span>
                    </div>
                    <div className='flex flex-col overflow-hidden'>
                        <h3 className='text-[#e8e8e8] text-sm font-semibold truncate leading-tight'>
                            {seller?.shop?.name ?? 'My Shop'}
                        </h3>
                        <p className='text-[#4a4a4a] text-xs truncate leading-tight mt-0.5'>
                            {seller?.shop?.address ?? ''}
                        </p>
                    </div>
                </Link>
            </Header>

            {/* Body */}
            <div className='flex flex-col px-2 pb-4 mt-1'>
                <Body>
                    {/* Dashboard — standalone */}
                    <SidebarItem
                        title='Dashboard'
                        isActive={activeSidebar === '/dashboard'}
                        icon={<HomeIcon fill={getIconColor('/dashboard')} />}
                        href='/dashboard'
                    />

                    <SidebarMenu title='Main Menu'>
                        <SidebarItem
                            title='Orders'
                            isActive={activeSidebar === '/dashboard/orders'}
                            icon={<ListOrdered size={16} color={getIconColor('/dashboard/orders')} />}
                            href='/dashboard/orders'
                        />
                        <SidebarItem
                            title='Payment'
                            isActive={activeSidebar === '/dashboard/payments'}
                            icon={<PaymentIcon fill={getIconColor('/dashboard/payments')} />}
                            href='/dashboard/payments'
                        />
                    </SidebarMenu>

                    <SidebarMenu title='Products'>
                        <SidebarItem
                            title='Create Product'
                            isActive={activeSidebar === '/dashboard/create-product'}
                            icon={<SquarePlus size={16} color={getIconColor('/dashboard/create-product')} />}
                            href='/dashboard/create-product'
                        />
                        <SidebarItem
                            title='All Products'
                            isActive={activeSidebar === '/dashboard/all-products'}
                            icon={<PackageSearch size={16} color={getIconColor('/dashboard/all-products')} />}
                            href='/dashboard/all-products'
                        />
                    </SidebarMenu>

                    <SidebarMenu title='Events'>
                        <SidebarItem
                            title='Create Event'
                            isActive={activeSidebar === '/dashboard/create-event'}
                            icon={<SquarePlus size={16} color={getIconColor('/dashboard/create-event')} />}
                            href='/dashboard/create-event'
                        />
                        <SidebarItem
                            title='All Events'
                            isActive={activeSidebar === '/dashboard/all-events'}
                            icon={<PackageSearch size={16} color={getIconColor('/dashboard/all-events')} />}
                            href='/dashboard/all-events'
                        />
                    </SidebarMenu>

                    <SidebarMenu title='Controllers'>
                        <SidebarItem
                            title='Inbox'
                            isActive={activeSidebar === '/dashboard/inbox'}
                            icon={<Mail size={16} color={getIconColor('/dashboard/inbox')} />}
                            href='/dashboard/inbox'
                        />
                        <SidebarItem
                            title='Settings'
                            isActive={activeSidebar === '/dashboard/settings'}
                            icon={<Settings size={16} color={getIconColor('/dashboard/settings')} />}
                            href='/dashboard/settings'
                        />
                        <SidebarItem
                            title='Notifications'
                            isActive={activeSidebar === '/dashboard/notifications'}
                            icon={<BellRing size={16} color={getIconColor('/dashboard/notifications')} />}
                            href='/dashboard/notifications'
                        />
                    </SidebarMenu>

                    <SidebarMenu title='Extras'>
                        <SidebarItem
                            title='Discount Codes'
                            isActive={activeSidebar === '/dashboard/discount-codes'}
                            icon={<TicketPercent size={16} color={getIconColor('/dashboard/discount-codes')} />}
                            href='/dashboard/discount-codes'
                        />
                        <SidebarItem
                            title='Logout'
                            isActive={activeSidebar === '/logout'}
                            icon={<LogOut size={16} color={getIconColor('/logout')} />}
                            href='/logout'
                        />
                    </SidebarMenu>
                </Body>
            </div>
        </Box>
    );
};

export default Sidebar;