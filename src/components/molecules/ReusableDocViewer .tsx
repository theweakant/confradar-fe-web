import { memo, useEffect, useMemo, useState } from 'react';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import { isValidUrl } from "@/helper/paper";

interface ReusableDocViewerProps {
    fileUrl: string;
    minHeight?: number | string;
    style?: React.CSSProperties;
    checkUrlBeforeRender?: boolean;
    showLoadingState?: boolean;
    showErrorState?: boolean;
    className?: string;
}

const ReusableDocViewer = memo<ReusableDocViewerProps>(({
    fileUrl,
    minHeight = 400,
    style,
    checkUrlBeforeRender = true,
    showLoadingState = true,
    showErrorState = true,
    className = ""
}) => {
    const [urlStatus, setUrlStatus] = useState<'checking' | 'valid' | 'invalid' | null>(
        checkUrlBeforeRender ? 'checking' : null
    );

    // Memoize documents array
    const documents = useMemo(() => [
        {
            uri: fileUrl,
            fileType: fileUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : undefined
        }
    ], [fileUrl]);

    // Memoize config
    const config = useMemo(() => ({
        header: { disableHeader: true },
        pdfVerticalScrollByDefault: true,
    }), []);

    // Check URL validity before rendering
    useEffect(() => {
        if (!checkUrlBeforeRender) {
            setUrlStatus('valid');
            return;
        }

        if (!fileUrl || !isValidUrl(fileUrl)) {
            setUrlStatus('invalid');
            return;
        }

        setUrlStatus('checking');

        fetch(fileUrl, { method: "HEAD" })
            .then((res) => {
                setUrlStatus(res.ok ? 'valid' : 'invalid');
            })
            .catch(() => {
                setUrlStatus('invalid');
            });
    }, [fileUrl, checkUrlBeforeRender]);

    // Loading state
    if (urlStatus === 'checking' && showLoadingState) {
        return (
            <div
                className={`flex items-center justify-center ${className}`}
                style={{ minHeight, ...style }}
            >
                <div className="text-gray-500 text-sm">Đang kiểm tra file...</div>
            </div>
        );
    }

    // Error state
    if (urlStatus === 'invalid' && showErrorState) {
        return (
            <div
                className={`flex items-center justify-center p-4 border border-red-300 rounded bg-red-50 ${className}`}
                style={{ minHeight, ...style }}
            >
                <div className="text-red-700 text-sm text-center">
                    File không tồn tại hoặc URL không hợp lệ
                </div>
            </div>
        );
    }

    // Render DocViewer when URL is valid
    if (urlStatus === 'valid' || !checkUrlBeforeRender) {
        const ext = fileUrl.split('.').pop()?.toLowerCase();

        // PDF: dùng iframe
        if (ext === 'pdf') {
            return (
                <iframe
                    src={fileUrl}
                    className={className}
                    style={{
                        width: '100%',
                        minHeight,
                        height: '100%',
                        border: 'none',
                        borderRadius: 8,
                        ...style
                    }}
                />
            );
        }

        // DOC/DOCX: dùng <iframe> với Google Docs Viewer hoặc <object> fallback
        if (ext === 'doc' || ext === 'docx') {
            const isPublicUrl = fileUrl.startsWith('http');
            const viewerUrl = isPublicUrl
                ? `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`
                : fileUrl;

            return (
                <iframe
                    src={viewerUrl}
                    className={className}
                    style={{
                        width: '100%',
                        minHeight,
                        height: '100%',
                        border: 'none',
                        borderRadius: 8,
                        ...style
                    }}
                />
            );
        }

        // Fallback: không hỗ trợ, show link download
        return (
            <div
                className={`flex flex-col items-center justify-center p-4 border border-gray-300 rounded bg-gray-50 ${className}`}
                style={{ minHeight, ...style }}
            >
                <div className="text-gray-700 text-sm text-center mb-2">
                    Không thể hiển thị file này
                </div>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Tải file
                </a>
            </div>
        );
        // if (urlStatus === 'valid' || !checkUrlBeforeRender) {
        //     return (
        //         <iframe
        //             src={fileUrl}
        //             className={className}
        //             style={{
        //                 width: '100%',
        //                 minHeight,
        //                 height: '100%',
        //                 border: 'none',
        //                 borderRadius: 8,
        //                 ...style
        //             }}
        //         />
        //         // <div className={className}
        //         //     style={{ minHeight, ...style }}
        //         // // style={{
        //         // //     minHeight: '500px',
        //         // //     maxHeight: '70vh',
        //         // //     overflow: 'auto',
        //         // //     ...style
        //         // // }}
        //         // >
        //         //     <DocViewer
        //         //         documents={documents}
        //         //         pluginRenderers={DocViewerRenderers}
        //         //         config={config}
        //         //         style={{ width: "100%", minHeight, borderRadius: 8 }}
        //         //     />
        //         // </div>

        //         // // <iframe
        //         // //     src={fileUrl}
        //         // //     className={className}
        //         // //     style={{
        //         // //         width: '100%',
        //         // //         minHeight,
        //         // //         height: '100%',
        //         // //         border: 'none',
        //         // //         ...style
        //         // //     }}
        //         // // />

        //     );
    }

    return null;
});

ReusableDocViewer.displayName = 'ReusableDocViewer';

export default ReusableDocViewer;