import React from 'react';
import { Link } from 'react-router-dom';
import type { MenuProperties } from './Menu';
import './Menu.less';

export const Menu = ({
  onClickSection,
  menuData,
  activeSection,
  type = "collapsible",
  paddingUl = "32px 16px 32px 14px",
  className = "",
  foldedWidth = "1px",
  statisticsCard,
  maxWidth,
  minWidth
}: MenuProperties) => {

  const widthSwitch = (width: string | number) => {
    return typeof width === "number" ? `${width}px` : String(width);
  }

  return (
    <>
      {type === "collapsible" &&
        <div
          style={{
            height: "100%",
            '--max-width': widthSwitch(foldedWidth),
            width: '100%'
          } as React.CSSProperties}
          className={`u-collapsible-menu ${className}`}>
          <div
            className="u-collapsible-menu-body"
            style={{
              height: "100%",
              '--max-width-body': widthSwitch(maxWidth)
            } as React.CSSProperties}
          >
              <ul
                className="u-collapsible-menu-list"
                style={{padding: paddingUl, minWidth: widthSwitch(minWidth)}}
              >
                {menuData.map((item, index) => {
                  return (
                    <li
                      key={index}
                      className={activeSection == item.id
                      ? "u-collapsible-menu-list-item u-menu-active"
                      : "u-collapsible-menu-list-item"}
                      id={String(item.id)}
                      onClick={() => onClickSection(item)}
                    >
                        <Link 
                          to={item.url} 
                          className='u-collapsible-menu-list-item-link'
                          style={{fontWeight: 500}}
                        >
                          {item.title}
                        </Link>
                    </li>
                  )
                })}
              </ul>
              {statisticsCard}
          </div>
        </div>
      }
    </>
  );
}

