import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Button, Preloader, Message } from 'urfu-ui-kit-react';
import { Title } from '~/components/Title/Title';
import { Card } from '~/components/Card/Card';
import { Table } from '~/components/Table/Table';
import { Pagination } from '~/components/Pagination/Pagination';
import { useGetMyCertificatesQuery, useDeleteCertificateMutation } from '~/http/certificates';
import { makeCertificatesTableColumns } from './CertificatesMainTableColumns';
import { useNotificationService } from '~/hooks/notificationService';
import { CertificateDetailModal } from '../CertificateDetailModal/CertificateDetailModal';
import paths from '~/routing/paths';
import type { CertificateRequest } from '~/models/certificates';

const CertificatesMain = () => {
    const navigate = useNavigate();
    const { showMessage } = useNotificationService();

    const { data, isLoading, error } = useGetMyCertificatesQuery();
    const [deleteCertificate] = useDeleteCertificateMutation();

    const [selected, setSelected] = useState<CertificateRequest | null>(null);
    const [page, setPage]         = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const handleDelete = async (id: string) => {
        try {
            await deleteCertificate(id).unwrap();
            showMessage('Заявка успешно отменена');
        } catch {
            showMessage('Не удалось отменить заявку', 'fail');
        }
    };

    const allRows = useMemo(
        () => (data ?? []).map((item, index) => ({ ...item, number: index + 1 })),
        [data],
    );

    const pageRows = useMemo(
        () => allRows.slice((page - 1) * pageSize, page * pageSize),
        [allRows, page, pageSize],
    );

    const columns = makeCertificatesTableColumns(handleDelete, setSelected);

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title>Мои заявки на справки</Title>
                <Button icon="plus" size="small" onClick={() => navigate(paths.certificates.creating)}>
                    Заказать справку
                </Button>
            </div>

            {isLoading && <Preloader variant="large-primary" />}

            {error && (
                <Message variant="fail">Ошибка при загрузке заявок. Попробуйте обновить страницу.</Message>
            )}

            {!isLoading && !error && (
                <Card>
                    <Table<CertificateRequest & { number: number }>
                        data={pageRows}
                        columns={columns}
                        messageForEmptyTable="У вас пока нет заявок на справки. Нажмите «Заказать справку», чтобы создать первую."
                    />
                    <Pagination
                        page={page}
                        pageSize={pageSize}
                        total={allRows.length}
                        onChange={setPage}
                        onPageSizeChange={size => { setPageSize(size); setPage(1); }}
                    />
                </Card>
            )}

            {selected && (
                <CertificateDetailModal
                    certificate={selected}
                    onClose={() => setSelected(null)}
                    isAdmin={false}
                />
            )}
        </>
    );
};

export default CertificatesMain;
