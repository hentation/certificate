import type { TableColumn, TableProps } from './Table.types';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Table as UrFUTable, Tooltip } from 'urfu-ui-kit-react';
import styles from './Table.styles.module.less';
import { colors } from '~/styles/colors';
import { useState } from 'react';
import "./Table.less";

// SVG-компоненты
const NoSortIcon = ({hover}: {hover?: boolean}) => (
  <svg width="14" height="14" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M14.2481 18.9492C13.6958 18.9492 13.2481 18.5015 13.2481 17.9492V6.34279L12.3798 7.20358C11.9876 7.59242 11.3545 7.58969 10.9656 7.19749C10.5768 6.80529 10.5795 6.17213 10.9717 5.78329L13.5379 3.23909C13.9301 2.85025 14.5633 2.85297 14.9521 3.24518L17.5097 5.82491C17.8986 6.21711 17.8959 6.85027 17.5037 7.23911C17.1115 7.62795 16.4783 7.62522 16.0895 7.23302L15.2481 6.38436V17.9492C15.2481 18.5015 14.8004 18.9492 14.2481 18.9492Z" fill={hover ? "#1E4391" : "#9FAECD"}/>
    <path fillRule="evenodd" clipRule="evenodd" d="M6.20803 2.94922C5.65575 2.94922 5.20803 3.39693 5.20803 3.94922V15.5556L4.3398 14.6949C3.9476 14.306 3.31444 14.3087 2.9256 14.7009C2.53676 15.0931 2.53948 15.7263 2.93169 16.1151L5.49789 18.6593C5.89009 19.0482 6.52325 19.0455 6.91209 18.6533L9.4697 16.0735C9.85854 15.6813 9.85582 15.0482 9.46361 14.6593C9.07141 14.2705 8.43825 14.2732 8.04941 14.6654L7.20803 15.5141V3.94922C7.20803 3.39693 6.76032 2.94922 6.20803 2.94922Z" fill={hover ? "#1E4391" : "#9FAECD"}/>
  </svg>
);
const AscIcon = ({hover}: {hover?: boolean}) => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M4.35984 9.87438C4.78412 9.52082 5.41468 9.57814 5.76825 10.0024L10 15.0806L14.2318 10.0024C14.5854 9.57814 15.2159 9.52082 15.6402 9.87438C16.0645 10.2279 16.1218 10.8585 15.7682 11.2828L10.7683 17.2828C10.5783 17.5108 10.2968 17.6426 10 17.6426C9.70326 17.6426 9.42181 17.5108 9.23181 17.2828L4.2318 11.2828C3.87824 10.8585 3.93556 10.2279 4.35984 9.87438Z" fill={hover ? "#1E4391" : "#748AB9"}/>
    <path fillRule="evenodd" clipRule="evenodd" d="M10 15.5C9.44772 15.5 9 15.0523 9 14.5L9 3.5C9 2.94771 9.44771 2.5 10 2.5C10.5523 2.5 11 2.94771 11 3.5L11 14.5C11 15.0523 10.5523 15.5 10 15.5Z" fill={hover ? "#1E4391" : "#748AB9"}/>
  </svg>
);
const DescIcon = ({hover}: {hover?: boolean}) => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M15.6402 10.2682C15.2159 10.6218 14.5853 10.5644 14.2318 10.1402L9.99997 5.06202L5.7682 10.1402C5.41463 10.5644 4.78407 10.6218 4.35979 10.2682C3.93551 9.91463 3.87819 9.28407 4.23175 8.85979L9.23174 2.85979C9.42174 2.6318 9.70318 2.49998 9.99996 2.49998C10.2967 2.49998 10.5782 2.6318 10.7682 2.85979L15.7682 8.85979C16.1218 9.28407 16.0644 9.91463 15.6402 10.2682Z" fill={hover ? "#1E4391" : "#748AB9"}/>
    <path fillRule="evenodd" clipRule="evenodd" d="M10 4.64258C10.5523 4.64258 11 5.09029 11 5.64258L11 16.6426C11 17.1949 10.5523 17.6426 10 17.6426C9.44772 17.6426 9 17.1949 9 16.6426L9 5.64258C9 5.09029 9.44772 4.64258 10 4.64258Z" fill={hover ? "#1E4391" : "#748AB9"}/>
  </svg>
);

export const TablePagination = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  dataLength = 0,
}: {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  dataLength?: number;
}) => {
  if (dataLength === 0 || totalItems <= 10) return null;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 8; // максимум элементов (страницы + троеточия)
    if (totalPages <= maxVisible) {
      // Если страниц 8 или меньше — показываем все
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            className={`u-paginator__pages-num ${i === currentPage ? 'u-paginator__pages-num_active' : ''}`}
            onClick={() => onPageChange(i)}
          >
            {i}
          </button>
        );
      }
    } else {
      // Если страниц больше 8
      // Для 9 и 10 страниц — логика как для 11+, но с учётом границ
      // Для 11+ — особая логика
      const showLeftDots = () => (
        <button key="left-dots">
          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="3" viewBox="0 0 9 3" fill="none">
            <path d="M1.61584 2.07C1.4105 2.07 1.23317 1.99533 1.08384 1.846C0.943836 1.69667 0.873836 1.51467 0.873836 1.3C0.873836 1.076 0.943836 0.894 1.08384 0.754C1.23317 0.614 1.4105 0.544 1.61584 0.544C1.82117 0.544 1.99384 0.614 2.13384 0.754C2.28317 0.894 2.35784 1.076 2.35784 1.3C2.35784 1.51467 2.28317 1.69667 2.13384 1.846C1.99384 1.99533 1.82117 2.07 1.61584 2.07ZM4.58263 2.07C4.3773 2.07 4.19997 1.99533 4.05063 1.846C3.91063 1.69667 3.84063 1.51467 3.84063 1.3C3.84063 1.076 3.91063 0.894 4.05063 0.754C4.19997 0.614 4.3773 0.544 4.58263 0.544C4.78797 0.544 4.96063 0.614 5.10063 0.754C5.24997 0.894 5.32463 1.076 5.32463 1.3C5.32463 1.51467 5.24997 1.69667 5.10063 1.846C4.96063 1.99533 4.78797 2.07 4.58263 2.07ZM7.54943 2.07C7.3441 2.07 7.16676 1.99533 7.01743 1.846C6.87743 1.69667 6.80743 1.51467 6.80743 1.3C6.80743 1.076 6.87743 0.894 7.01743 0.754C7.16676 0.614 7.3441 0.544 7.54943 0.544C7.75476 0.544 7.92743 0.614 8.06743 0.754C8.21676 0.894 8.29143 1.076 8.29143 1.3C8.29143 1.51467 8.21676 1.69667 8.06743 1.846C7.92743 1.99533 7.75476 2.07 7.54943 2.07Z" fill="#545454"/>
          </svg>
        </button>
      );
      const showRightDots = () => (
        <button key="right-dots">
          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="3" viewBox="0 0 9 3" fill="none">
            <path d="M1.61584 2.07C1.4105 2.07 1.23317 1.99533 1.08384 1.846C0.943836 1.69667 0.873836 1.51467 0.873836 1.3C0.873836 1.076 0.943836 0.894 1.08384 0.754C1.23317 0.614 1.4105 0.544 1.61584 0.544C1.82117 0.544 1.99384 0.614 2.13384 0.754C2.28317 0.894 2.35784 1.076 2.35784 1.3C2.35784 1.51467 2.28317 1.69667 2.13384 1.846C1.99384 1.99533 1.82117 2.07 1.61584 2.07ZM4.58263 2.07C4.3773 2.07 4.19997 1.99533 4.05063 1.846C3.91063 1.69667 3.84063 1.51467 3.84063 1.3C3.84063 1.076 3.91063 0.894 4.05063 0.754C4.19997 0.614 4.3773 0.544 4.58263 0.544C4.78797 0.544 4.96063 0.614 5.10063 0.754C5.24997 0.894 5.32463 1.076 5.32463 1.3C5.32463 1.51467 5.24997 1.69667 5.10063 1.846C4.96063 1.99533 4.78797 2.07 4.58263 2.07ZM7.54943 2.07C7.3441 2.07 7.16676 1.99533 7.01743 1.846C6.87743 1.69667 6.80743 1.51467 6.80743 1.3C6.80743 1.076 6.87743 0.894 7.01743 0.754C7.16676 0.614 7.3441 0.544 7.54943 0.544C7.75476 0.544 7.92743 0.614 8.06743 0.754C8.21676 0.894 8.29143 1.076 8.29143 1.3C8.29143 1.51467 8.21676 1.69667 8.06743 1.846C7.92743 1.99533 7.75476 2.07 7.54943 2.07Z" fill="#545454"/>
          </svg>
        </button>
      );
      // 9 и 10 страниц — логика как для 11+, но с учётом границ
      if (totalPages === 9 || totalPages === 10) {
        if (currentPage <= 5) {
          for (let i = 1; i <= 6; i++) {
            pages.push(
              <button key={i} className={`u-paginator__pages-num ${i === currentPage ? 'u-paginator__pages-num_active' : ''}`} onClick={() => onPageChange(i)}>{i}</button>
            );
          }
          pages.push(showRightDots());
          pages.push(
            <button key={totalPages} className={`u-paginator__pages-num ${totalPages === currentPage ? 'u-paginator__pages-num_active' : ''}`} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
          );
        } else if (currentPage >= totalPages - 4) {
          pages.push(
            <button key={1} className={`u-paginator__pages-num ${1 === currentPage ? 'u-paginator__pages-num_active' : ''}`} onClick={() => onPageChange(1)}>{1}</button>
          );
          pages.push(showLeftDots());
          for (let i = totalPages - 5; i <= totalPages; i++) {
            pages.push(
              <button key={i} className={`u-paginator__pages-num ${i === currentPage ? 'u-paginator__pages-num_active' : ''}`} onClick={() => onPageChange(i)}>{i}</button>
            );
          }
        } else {
          for (let i = 1; i <= 6; i++) {
            pages.push(
              <button key={i} className={`u-paginator__pages-num ${i === currentPage ? 'u-paginator__pages-num_active' : ''}`} onClick={() => onPageChange(i)}>{i}</button>
            );
          }
          pages.push(showRightDots());
          pages.push(
            <button key={totalPages} className={`u-paginator__pages-num ${totalPages === currentPage ? 'u-paginator__pages-num_active' : ''}`} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
          );
        }
      } else {
        // 11 и больше страниц
        if (currentPage <= 5) {
          for (let i = 1; i <= 6; i++) {
            pages.push(
              <button key={i} className={`u-paginator__pages-num ${i === currentPage ? 'u-paginator__pages-num_active' : ''}`} onClick={() => onPageChange(i)}>{i}</button>
            );
          }
          pages.push(showRightDots());
          pages.push(
            <button key={totalPages} className={`u-paginator__pages-num ${totalPages === currentPage ? 'u-paginator__pages-num_active' : ''}`} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
          );
        } else if (currentPage > 5 && totalPages - currentPage > 4) {
          pages.push(
            <button key={1} className={`u-paginator__pages-num ${1 === currentPage ? 'u-paginator__pages-num_active' : ''}`} onClick={() => onPageChange(1)}>{1}</button>
          );
          pages.push(showLeftDots());
          for (let i = currentPage - 1; i <= currentPage + 2; i++) {
            pages.push(
              <button key={i} className={`u-paginator__pages-num ${i === currentPage ? 'u-paginator__pages-num_active' : ''}`} onClick={() => onPageChange(i)}>{i}</button>
            );
          }
          pages.push(showRightDots());
          pages.push(
            <button key={totalPages} className={`u-paginator__pages-num ${totalPages === currentPage ? 'u-paginator__pages-num_active' : ''}`} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
          );
        } else {
          pages.push(
            <button key={1} className={`u-paginator__pages-num ${1 === currentPage ? 'u-paginator__pages-num_active' : ''}`} onClick={() => onPageChange(1)}>{1}</button>
          );
          pages.push(showLeftDots());
          for (let i = totalPages - 5; i <= totalPages; i++) {
            pages.push(
              <button key={i} className={`u-paginator__pages-num ${i === currentPage ? 'u-paginator__pages-num_active' : ''}`} onClick={() => onPageChange(i)}>{i}</button>
            );
          }
        }
      }
    }
    return pages;
  };

  return (
    <div className="u-pagination">
      <p className="u-pagination__result">
        Записи с {startItem} по {endItem} из {totalItems}
      </p>
      <div className="u-pagination__limits">
        {totalItems > 10 && (
          <>
            Выводить по
            <div className="u-pagination__limit-wrapper">
              {[10, 20, ...(totalItems > 20 ? [50] : [])].map((size) => (
                <span
                  key={size}
                  className={`u-pagination__limit ${size === pageSize ? 'u-pagination__limit_active' : ''}`}
                  onClick={() => onPageSizeChange(size)}
                >
                  {size}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="u-paginator">
        <button 
          className={`u-paginator__arrow-btn ${currentPage === 1 ? 'u-paginator__arrow-btn_inactive' : ''}`}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        />
        <div className="u-paginator__pages">
          {renderPageNumbers()}
        </div>
        <button 
          className={`u-paginator__arrow-btn u-paginator__arrow-btn-right ${currentPage === totalPages ? 'u-paginator__arrow-btn-right_inactive' : ''}`}
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        />
      </div>
    </div>
  );
};

export const Table = <T,>({ 
    columns, 
    data, 
    cellStyle, 
    tdContentStyle, 
    tdStyle, 
    thStyle,
    messageForEmptyTable = "Данных нет",
    sort,
    sortDir,
    onSortChange,
    isLoading,
    isLoadingPreloader,
    ...rest
}: TableProps<T>) => {

  const thPaddingConstant = "0 12px";

  const contentForMessageForEmptyTable = (value: string) => {
    return (
      <p className={`tt ${styles.contentTable}`}>{value}</p>
    )
  }

  // Добавляем renderHeader для сортируемых колонок
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);
  const enhancedColumns = columns.map((col: TableColumn<T>) => {
    if (!col.sortOn) return {
      ...col,
      renderHeader: () => {
        const content = (
          <div
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              userSelect: 'none', 
              justifyContent: 'space-between', 
              padding: thPaddingConstant, 
              columnGap: 8,
              height: 64,
            }}
          >
            <span>
              {col.title}
              {col.headerIcon && <span style={{ marginLeft: 4 }}>{col.headerIcon}</span>}
            </span>
          </div>
        );
        return col.headerTooltip ? (
          <Tooltip tooltipText={col.headerTooltip} portalOn>
            {content}
          </Tooltip>
        ) : content;
      },
      thStyle: { padding: 0 },
    }
    return {
      ...col,
      renderHeader: () => {
        let icon = <NoSortIcon hover={hoveredCol === col.field} />;
        if (sort === col.field) {
          if (sortDir === 'asc') icon = <AscIcon hover={hoveredCol === col.field} />;
          else if (sortDir === 'desc') icon = <DescIcon hover={hoveredCol === col.field} />;
        }
        const content = (
          <div
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer', 
              userSelect: 'none', 
              justifyContent: 'flex-start', 
              padding: thPaddingConstant, 
              columnGap: 4,
              height: 64,
            }}
            onClick={e => {
              e.stopPropagation();
              if (!onSortChange) return;
              if (sort !== col.field) onSortChange(col.field, 'asc');
              else if (sortDir === 'asc') onSortChange(col.field, 'desc');
              else if (sortDir === 'desc') onSortChange(undefined, undefined);
            }}
            onMouseEnter={() => setHoveredCol(col.field)}
            onMouseLeave={() => setHoveredCol(null)}
          >
            <span>
              {col.title}
              {col.headerIcon && <span style={{ marginLeft: 4 }}>{col.headerIcon}</span>}
            </span>
            <i style={{ display: 'flex', flexShrink: 0 }}>{icon}</i>
          </div>
        );
        return col.headerTooltip ? (
          <Tooltip id="-table-org-committee" tooltipText={col.headerTooltip} portalOn>
            {content}
          </Tooltip>
        ) : content;
      },
      thStyle: { padding: 0 },
    }
  });

  return (
    <UrFUTable
      className={styles.tableStyle}
      cellStyle={cellStyle || { fontSize: "12px" }}
      columns={enhancedColumns}
      data={data}
      borders="horizontal"
      tdStyle={tdStyle || { padding: "23.5px 0" }}
      tdContentStyle={tdContentStyle || { padding: "0 12px" }}
      thStyle={thStyle || {
        padding: thPaddingConstant,
        backgroundColor: "white",
        color: colors.mainPrimary,
        fontSize: "14px",
      }}
      thContentStyle={{ 
        height: 64,
        display: "flex",
        alignItems: "center",
      }}
      messageForEmptyTable={contentForMessageForEmptyTable(messageForEmptyTable)}
      isLoading={isLoading}
      isLoadingPreloader={isLoadingPreloader}
      {...rest}
    />
  );
};
