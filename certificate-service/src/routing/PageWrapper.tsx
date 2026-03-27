import type { ReactNode } from 'react';
import { useState, useEffect, useCallback } from 'react';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { NotificationProvider } from 'urfu-ui-kit-react';
// import { Footer } from "~/components/Footer/Footer";
import paths from "./paths";
import { useLocation } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
import styles from './PageWrapper.styles.module.less';
import type { MenuDataProperties } from '~/components/Menu/Menu';
import { Menu } from '~/components/Menu/Menu';
import type { UserRoles } from '~/models/user';
import { PROJECT_NAME } from '~/constants/baseConstants';

interface PageWrapperProps {
  children: ReactNode;
  navigate: NavigateFunction;
  roles?: UserRoles;
}

export const PageWrapper = ({ children, roles }: PageWrapperProps) => {
  const location = useLocation();

  // menuItems теперь внутри компонента, чтобы paths были актуальными
  const menuItems = [
    { icon: 'icon-document',    label: 'Мои справки',      path: paths.certificates.main },
    { icon: 'icon-documents',   label: 'Реестр заявок',    path: paths.certificates.admin },
    { icon: 'icon-audit',       label: 'Журнал аудита',    path: paths.audit.main },
    { icon: 'icon-document',    label: 'Мои заявки',       path: paths.myApplications.main },
    { icon: 'icon-like',        label: 'Экспертиза',       path: paths.evaluation.main },
    { icon: 'icon-people',      label: 'Оргкомитет',       path: paths.orgCommittee.main },
    { icon: 'icon-clock',       label: 'Журнал логов',     path: paths.audition.main },
  ];

  // Фильтрация пунктов меню по ролям (по label)
  const filteredMenuItems = menuItems.filter(item => {
    if (!roles) return false;
    if (item.label === 'Мои справки')    return !!roles.isCertificateUser;
    if (item.label === 'Реестр заявок')  return !!roles.isModerator;
    if (item.label === 'Журнал аудита')  return !!roles.isSystemAdmin;
    if (item.label === 'Мои заявки')     return roles.isParticipant;
    if (item.label === 'Экспертиза')     return roles.isExpert;
    if (item.label === 'Оргкомитет')     return roles.isOrganizer;
    if (item.label === 'Журнал логов')   return roles.isAuditor;
    return false;
  });

  // Показывать меню, если доступно хотя бы 2 раздела
  const shouldShowMenu = filteredMenuItems.length > 1;

  const menuDataFiltered = () =>
    filteredMenuItems.map((item, i) => ({
      title: (
        <div className='udf ucg10 uaic'>
          <i style={{ fontSize: 20 }} className={`u-icon ${item.icon} upb2`}></i>
          <span>{item.label}</span>
        </div>
      ),
      path: item.path,
      url: item.path,
      display: true,
      id: i,
    }));

  const menuItemsData = menuDataFiltered();

  const findActiveSection = useCallback(() => {
    const currentPath = location.pathname;
    let activeItem = menuItemsData.find(item => currentPath === item.path);
    if (activeItem) return activeItem.id;
    activeItem = menuItemsData.find(item => currentPath.startsWith(item.path));
    return activeItem ? activeItem.id : 0;
  }, [location.pathname, menuItemsData]);

  const [activeSection, setActiveSection] = useState<number>(findActiveSection());
  const [showMenu, setShowMenu] = useState<boolean>(false);

  useEffect(() => {
    setActiveSection(findActiveSection());
  }, [location.pathname, findActiveSection])

  const mainSections = ['org-committee', 'moderation', 'audition', 'my-applications', 'certificates', 'admin', 'audit'];
  const getCurrentRoute = () => {
    const currentPath = location.pathname;
    if (currentPath === paths.notSection.noAccess) {
      return 'no-access';
    }
    // /admin/... — реестр справок администратора
    if (currentPath.includes('/admin/') || currentPath.endsWith('/admin')) {
      return 'admin';
    }
    const segments = currentPath.split('/').filter(Boolean);
    if (
      segments[0] === PROJECT_NAME &&
      segments.length === 2 &&
      mainSections.includes(segments[1])
    ) {
      return segments[1];
    }
    if (segments.length === 1 && mainSections.includes(segments[0])) {
      return segments[0];
    }
    return 'main';
  }

  return (
    <NotificationProvider>
      <div className={`${styles.pageWrapperStyles} child-shell-height`}> {/* child-shell-height нужен для позиционирования в оболочке Интеграционной Платформы */}
        {shouldShowMenu && (
          <Menu
            maxWidth={250}
            minWidth={250}
            foldedWidth={0}
            showMenu={showMenu}
            menuData={menuItemsData}
            menuDataIcons={[]}
            type="collapsible"
            paddingUl="32px 16px 32px 14px"
            className=""
            activeSection={activeSection}
            onClickSection={(item: MenuDataProperties) => {
              setActiveSection(item.id as number);
            }}
            onClickSwitchMenu={(e: boolean) => setShowMenu(!e)}
          />
        )}
        <div className={styles.contentWrapper}>
          <div className={styles.contentStyles} data-route={getCurrentRoute()}>
            <div className={styles.children}>
              {children}
            </div>
            {/* <Footer /> */}
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
};
