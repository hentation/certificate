
import type { TableColumn } from "~/components/Table/Table.types";
import type { Article } from "~/models/application";

// interface Column {
//   field: string;
//   title: string;
//   width: number;
//   render?: (rowData: Article) => React.ReactNode;
// }



export const ArticlesTableColumns: TableColumn<Article>[] = [
    {
      field: 'externalId',
      title: 'Scopus id/WoS id',
      width: 125
    },
    {
      field: 'articleTitle',
      title: 'Название публикации',
      width: 151
    },
    {
      field: 'journalTitle',
      title: 'Название журнала',
      width: 151
    },
    {
      field: 'pubYear',
      title: 'Год публикации',
      width: 85,
      render: (rowData) => <div style={{textAlign: 'center'}}>{rowData.pubYear}</div>
    },
    {
      field: 'category',
      title: 'Категория публикации',
      width: 88,
      render: (rowData) => <div style={{textAlign: 'center'}}>{rowData.category}</div>
    },
    {
      field: 'link',
      title: 'Ссылка на Pure',
      width: 60,
      render: (rowData) => <a target="_blank" style={{fontWeight: '600'}} className='u-link' href={rowData.link}>Ссылка</a>
    }
  ]
