import type { ReactNode, ReactElement } from "react";

export interface MenuDataProperties {
    id: string | number,
    title: ReactElement,
    url: string,
    path?: string
}

export interface MenuProperties {
    onClickSection: (item: MenuDataProperties) => void,
    onClickSwitchMenu: (showMenu: boolean) => void,
    showMenu: boolean,
    menuData: Array<MenuDataProperties>,
    menuDataIcons: Array<MenuDataProperties>,
    activeSection: string | number,
    type: string,
    paddingUl: string,
    className: string,
    foldedWidth: string | number,
    statisticsCard?: ReactNode,
    maxWidth: string | number
    minWidth: string | number
}

export { Menu } from './Menu.tsx';
