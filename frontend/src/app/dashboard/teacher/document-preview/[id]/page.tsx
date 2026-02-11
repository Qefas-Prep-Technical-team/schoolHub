import DocumentPreview from "../components/DocumentPreview";


export default function DocumentPreviewPage() {
    const doc = {
        id: 1,
        title: 'Student Progress Report Q1.pdf',
        fileType: 'PDF' as const,
        fileSize: '2.4 MB',
        uploadedBy: 'You',
        dateAdded: 'Oct 26, 2023',
        isSharedWithParents: true,
        downloadUrl: 'https://frsc.gov.ng/wp-content/uploads/2021/08/Harmonization-and-Digitization-of-the-Nigerian-Drivers-Licence.pdf',
        previewUrl: 'https://frsc.gov.ng/wp-content/uploads/2021/08/Harmonization-and-Digitization-of-the-Nigerian-Drivers-Licence.pdf'
    };

    const breadcrumbs = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Documents', href: '/documents' },
        { label: doc.title, isCurrent: true, href: '#' }
    ];

    return (
        <DocumentPreview
            document={doc}
            breadcrumbs={breadcrumbs}
        />
    );
}