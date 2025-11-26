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
            // <div className={className}
            //     style={{ minHeight, ...style }}
            // // style={{
            // //     minHeight: '500px',
            // //     maxHeight: '70vh',
            // //     overflow: 'auto',
            // //     ...style
            // // }}
            // >
            //     <DocViewer
            //         documents={documents}
            //         pluginRenderers={DocViewerRenderers}
            //         config={config}
            //         style={{ width: "100%", minHeight, borderRadius: 8 }}
            //     />
            // </div>

            // // <iframe
            // //     src={fileUrl}
            // //     className={className}
            // //     style={{
            // //         width: '100%',
            // //         minHeight,
            // //         height: '100%',
            // //         border: 'none',
            // //         ...style
            // //     }}
            // // />

        );
    }

    return null;
});

ReusableDocViewer.displayName = 'ReusableDocViewer';

export default ReusableDocViewer;