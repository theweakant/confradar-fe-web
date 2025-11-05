"use client";

import {
    MapPin,
    Building,
    Navigation,
    Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Destination } from "@/types/destination.type";

interface DestinationDetailProps {
    destination: Destination;
    onClose: () => void;
}

export function DestinationDetail({ destination, onClose }: DestinationDetailProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {destination.name}
                    </h3>
                </div>
            </div>

            {/* Grid Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location Info */}
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Building className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-700">Tỉnh/Thành phố</p>
                            <p className="text-gray-900">{destination.city}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Map className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-700">Quận/Huyện</p>
                            <p className="text-gray-900">{destination.district}</p>
                        </div>
                    </div>
                </div>

                {/* Address Info */}
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Navigation className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-700">Đường</p>
                            <p className="text-gray-900">{destination.street}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-700">Địa chỉ đầy đủ</p>
                            <p className="text-gray-900">
                                {destination.street}, {destination.district}, {destination.city}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-4 border-t">
                <Button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Đóng
                </Button>
            </div>
        </div>
    );
}