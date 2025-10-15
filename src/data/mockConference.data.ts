import { Conference } from "@/types/conference.type";

export const mockConferences: Conference[] = [
  {
    conferenceId: "1",
    conferenceName: "Hội thảo Trí tuệ Nhân tạo 2025",
    description: "Hội thảo quốc tế về AI và Machine Learning, tập hợp các chuyên gia hàng đầu trong lĩnh vực công nghệ AI.",
    startDate: "2025-11-15T08:00:00Z",
    endDate: "2025-11-17T18:00:00Z",
    capacity: 500,
    address: "Trung tâm Hội nghị Quốc gia, Quận 1",
    bannerImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
    createdAt: "2025-01-15T10:30:00Z",
    isInternalHosted: true,
    
    conferenceRankingId: {
      conferenceRankingId: "rank-1",
      name: "IEEE",
      description: "Institute of Electrical and Electronics Engineers",
      referenceUrl: "https://ieee.org",
      fileUrl: "https://ieee.org/rankings.pdf",
      rankingCategoryId: {
        rankingCategoryId: "cat-1",
        rankName: "A*",
        rankDescription: "Top tier conference"
      }
    },
    
    userId: "user-123",
    
    locationId: {
      city: "Hồ Chí Minh",
      country: "Việt Nam"
    },
    
    conferenceCategoryId: "cat-tech-001",
    
    conferenceTypeId: {
      conferenceTypeId: "type-1",
      conferenceTypeName: "Technology Conference"
    },
    
    globalStatusId: "open",
    isActive: true
  },
  
  {
    conferenceId: "2",
    conferenceName: "Vietnam Research Conference 2025",
    description: "Hội thảo nghiên cứu khoa học Việt Nam, trình bày các công trình nghiên cứu xuất sắc trong năm.",
    startDate: "2025-10-20T09:00:00Z",
    endDate: "2025-10-22T17:00:00Z",
    capacity: 300,
    address: "Đại học Quốc gia Hà Nội, Thanh Xuân",
    bannerImageUrl: "https://images.unsplash.com/photo-1591115765373-5207764f72e7",
    createdAt: "2025-02-20T14:00:00Z",
    isInternalHosted: false,
    
    conferenceRankingId: {
      conferenceRankingId: "rank-2",
      name: "ACM",
      description: "Association for Computing Machinery",
      referenceUrl: "https://acm.org",
      fileUrl: "https://acm.org/rankings.pdf",
      rankingCategoryId: {
        rankingCategoryId: "cat-2",
        rankName: "A",
        rankDescription: "High quality conference"
      }
    },
    
    userId: "user-456",
    
    locationId: {
      city: "Hà Nội",
      country: "Việt Nam"
    },
    
    conferenceCategoryId: "cat-research-002",
    
    conferenceTypeId: {
      conferenceTypeId: "type-2",
      conferenceTypeName: "Research Conference"
    },
    
    globalStatusId: "ongoing",
    isActive: true
  },
  
  {
    conferenceId: "3",
    conferenceName: "Digital Marketing Summit 2025",
    description: "Hội nghị thượng đỉnh về Marketing số, chia sẻ xu hướng và chiến lược marketing mới nhất.",
    startDate: "2025-09-10T08:30:00Z",
    endDate: "2025-09-11T16:30:00Z",
    capacity: 400,
    address: "Furama Resort, Ngũ Hành Sơn",
    bannerImageUrl: "https://images.unsplash.com/photo-1559223607-a43c990c2e9d",
    createdAt: "2024-12-10T11:00:00Z",
    isInternalHosted: true,
    
    conferenceRankingId: {
      conferenceRankingId: "rank-3",
      name: "Springer",
      description: "Springer Conference Rankings",
      referenceUrl: "https://springer.com",
      rankingCategoryId: {
        rankingCategoryId: "cat-3",
        rankName: "B",
        rankDescription: "Quality conference"
      }
    },
    
    userId: "user-789",
    
    locationId: {
      city: "Đà Nẵng",
      country: "Việt Nam"
    },
    
    conferenceCategoryId: "cat-business-003",
    
    conferenceTypeId: {
      conferenceTypeId: "type-3",
      conferenceTypeName: "Business Summit"
    },
    
    globalStatusId: "completed",
    isActive: true
  },
  
  {
    conferenceId: "4",
    conferenceName: "Hội thảo Đổi mới Giáo dục",
    description: "Hội thảo về đổi mới phương pháp giảng dạy và học tập trong kỷ nguyên số.",
    startDate: "2025-12-05T08:00:00Z",
    endDate: "2025-12-06T17:00:00Z",
    capacity: 200,
    address: "Đại học Cần Thơ, Ninh Kiều",
    bannerImageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
    createdAt: "2025-03-01T09:00:00Z",
    isInternalHosted: false,
    
    conferenceRankingId: {
      conferenceRankingId: "rank-4",
      name: "Scopus",
      description: "Scopus Indexed Conferences",
      referenceUrl: "https://scopus.com",
      rankingCategoryId: {
        rankingCategoryId: "cat-4",
        rankName: "C",
        rankDescription: "Recognized conference"
      }
    },
    
    userId: "user-101",
    
    locationId: {
      city: "Cần Thơ",
      country: "Việt Nam"
    },
    
    conferenceCategoryId: "cat-education-004",
    
    conferenceTypeId: {
      conferenceTypeId: "type-4",
      conferenceTypeName: "Education Workshop"
    },
    
    globalStatusId: "open",
    isActive: true
  }
];