export const getStatusLabel = (isActive: boolean): string => {
    return isActive ? "Hoạt động" : "Tạm ngưng";
};

export const getStatusVariant = (status: boolean): "success" | "danger" | "warning" | "info" => {
    return status ? "success" : "danger";
};