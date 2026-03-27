import type { CertificateRequest, CreateCertificateDto, FileAttachment, UpdateCertificateDto } from '~/models/certificates';
import { api } from './api';

const certificatesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getMyCertificates: builder.query<CertificateRequest[], void>({
            query: () => '/certificates/my',
            providesTags: ['CERTIFICATES'],
        }),
        getCertificateById: builder.query<CertificateRequest, string>({
            query: (id) => `/certificates/my/${id}`,
        }),
        createCertificate: builder.mutation<CertificateRequest, CreateCertificateDto>({
            query: (body) => ({ url: '/certificates', method: 'POST', body }),
            invalidatesTags: ['CERTIFICATES'],
        }),
        updateCertificate: builder.mutation<CertificateRequest, { id: string; body: UpdateCertificateDto }>({
            query: ({ id, body }) => ({ url: `/certificates/my/${id}`, method: 'PUT', body }),
            invalidatesTags: ['CERTIFICATES', 'CERTIFICATES_ADMIN'],
        }),
        deleteCertificate: builder.mutation<void, string>({
            query: (id) => ({ url: `/certificates/my/${id}`, method: 'DELETE' }),
            invalidatesTags: ['CERTIFICATES', 'CERTIFICATES_ADMIN'],
        }),
        getAllCertificates: builder.query<CertificateRequest[], void>({
            query: () => '/admin/certificates',
            providesTags: ['CERTIFICATES_ADMIN'],
        }),
        updateCertificateStatus: builder.mutation<CertificateRequest, { id: string; status: string; adminComment?: string }>({
            query: ({ id, ...body }) => ({ url: `/admin/certificates/${id}/status`, method: 'PUT', body }),
            invalidatesTags: ['CERTIFICATES_ADMIN'],
        }),
        uploadCertificateFile: builder.mutation<FileAttachment, FormData>({
            query: (formData) => ({
                url: '/certificates/upload',
                method: 'POST',
                body: formData,
            }),
        }),
        deleteAdminCertificate: builder.mutation<void, string>({
            query: (id) => ({ url: `/admin/certificates/${id}`, method: 'DELETE' }),
            invalidatesTags: ['CERTIFICATES_ADMIN'],
        }),
    }),
});

export const {
    useGetMyCertificatesQuery,
    useGetCertificateByIdQuery,
    useCreateCertificateMutation,
    useUpdateCertificateMutation,
    useDeleteCertificateMutation,
    useGetAllCertificatesQuery,
    useUpdateCertificateStatusMutation,
    useUploadCertificateFileMutation,
    useDeleteAdminCertificateMutation,
} = certificatesApi;
