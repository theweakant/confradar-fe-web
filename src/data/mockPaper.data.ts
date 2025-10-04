import { Paper, PaperReview } from "@/types/paper.type";

export const mockPaperData: Paper[] = [
  {
    id: "P001",
    title: "Deep Learning Approaches for Natural Language Understanding in Vietnamese",
    authors: ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C"],
    authorEmails: ["nguyenvana@uni.edu.vn", "tranthib@uni.edu.vn", "levanc@uni.edu.vn"],
    abstract: "This paper presents a comprehensive study on applying deep learning techniques to Vietnamese natural language understanding tasks. We propose a novel transformer-based architecture that achieves state-of-the-art results on multiple benchmarks including sentiment analysis, named entity recognition, and question answering. Our experiments demonstrate significant improvements over existing methods with detailed ablation studies.",
    keywords: ["Deep Learning", "NLP", "Vietnamese", "Transformer", "BERT"],
    
    conferenceId: "CONF001",
    conferenceName: "International Conference on AI 2024",
    trackId: "TRACK001",
    trackName: "Natural Language Processing",
    
    status: "under_review",
    submissionDate: "2024-09-15",
    lastModifiedDate: "2024-09-20",
    
    reviewers: ["REV001", "REV002", "REV003"],
    reviewCount: 2,
    averageScore: 7.5,
    
    paperType: "full_paper",
    fileUrl: "/papers/P001.pdf",
    fileSize: "3.2 MB",
    pageCount: 12,
    
    submittedBy: "USER001",
    submitterName: "Nguyễn Văn A",
    submitterEmail: "nguyenvana@uni.edu.vn",
    version: 2,
    isPresenterRegistered: true
  },
  {
    id: "P002",
    title: "Federated Learning for Privacy-Preserving Healthcare Applications",
    authors: ["Phạm Thị D", "Hoàng Văn E"],
    authorEmails: ["phamthid@hospital.vn", "hoangvane@hospital.vn"],
    abstract: "We explore the application of federated learning techniques in healthcare settings where patient privacy is paramount. Our framework enables collaborative model training across multiple hospitals without sharing sensitive patient data. Results show competitive accuracy while maintaining strict privacy guarantees through differential privacy mechanisms.",
    keywords: ["Federated Learning", "Privacy", "Healthcare", "Machine Learning", "Differential Privacy"],
    
    conferenceId: "CONF001",
    conferenceName: "International Conference on AI 2024",
    trackId: "TRACK002",
    trackName: "Machine Learning Applications",
    
    status: "accepted",
    submissionDate: "2024-08-20",
    lastModifiedDate: "2024-09-25",
    
    reviewers: ["REV001", "REV004"],
    reviewCount: 2,
    averageScore: 8.5,
    
    paperType: "full_paper",
    fileUrl: "/papers/P002.pdf",
    fileSize: "2.8 MB",
    pageCount: 10,
    
    submittedBy: "USER002",
    submitterName: "Phạm Thị D",
    submitterEmail: "phamthid@hospital.vn",
    version: 1,
    isPresenterRegistered: true,
    
    finalDecision: "accept",
    decisionDate: "2024-09-28",
    decisionNotes: "Excellent work with strong experimental validation. Minor revisions suggested for camera-ready version."
  },
  {
    id: "P003",
    title: "Real-time Object Detection for Autonomous Driving in Urban Environments",
    authors: ["Đỗ Văn F", "Vũ Thị G", "Bùi Văn H"],
    authorEmails: ["dovanf@tech.vn", "vuthig@tech.vn", "buivanh@tech.vn"],
    abstract: "This short paper introduces an optimized object detection model for autonomous vehicles operating in complex urban settings. Our lightweight architecture achieves 45 FPS on embedded devices while maintaining high accuracy for detecting pedestrians, vehicles, and traffic signs.",
    keywords: ["Computer Vision", "Object Detection", "Autonomous Driving", "Real-time Processing"],
    
    conferenceId: "CONF002",
    conferenceName: "Computer Vision Summit 2024",
    trackId: "TRACK003",
    trackName: "Computer Vision",
    
    status: "revision_required",
    submissionDate: "2024-09-01",
    lastModifiedDate: "2024-09-30",
    
    reviewers: ["REV002", "REV003"],
    reviewCount: 2,
    averageScore: 6.5,
    
    paperType: "short_paper",
    fileUrl: "/papers/P003.pdf",
    fileSize: "1.5 MB",
    pageCount: 6,
    
    submittedBy: "USER003",
    submitterName: "Đỗ Văn F",
    submitterEmail: "dovanf@tech.vn",
    version: 1,
    isPresenterRegistered: false
  },
  {
    id: "P004",
    title: "Quantum Computing Algorithms for Optimization Problems",
    authors: ["Lý Thị I"],
    authorEmails: ["lythii@quantum.edu.vn"],
    abstract: "We present novel quantum algorithms for solving complex optimization problems with applications in logistics and supply chain management. Preliminary results on quantum simulators show promising speedups compared to classical approaches.",
    keywords: ["Quantum Computing", "Optimization", "Algorithms", "QAOA"],
    
    conferenceId: "CONF003",
    conferenceName: "Quantum Computing Conference 2024",
    trackId: "TRACK004",
    trackName: "Quantum Algorithms",
    
    status: "submitted",
    submissionDate: "2024-10-01",
    lastModifiedDate: "2024-10-01",
    
    reviewers: [],
    reviewCount: 0,
    averageScore: 0,
    
    paperType: "full_paper",
    fileUrl: "/papers/P004.pdf",
    fileSize: "2.1 MB",
    pageCount: 9,
    
    submittedBy: "USER004",
    submitterName: "Lý Thị I",
    submitterEmail: "lythii@quantum.edu.vn",
    version: 1,
    isPresenterRegistered: true
  },
  {
    id: "P005",
    title: "Blockchain-based Secure Voting System: A Case Study",
    authors: ["Trương Văn K", "Ngô Thị L"],
    authorEmails: ["truongvank@blockchain.vn", "ngothil@blockchain.vn"],
    abstract: "This poster presents our implementation of a blockchain-based voting system deployed in a local election. We discuss the architecture, security features, and user experience findings from real-world deployment.",
    keywords: ["Blockchain", "Security", "E-Voting", "Distributed Systems"],
    
    conferenceId: "CONF001",
    conferenceName: "International Conference on AI 2024",
    trackId: "TRACK005",
    trackName: "Security and Privacy",
    
    status: "accepted",
    submissionDate: "2024-08-15",
    lastModifiedDate: "2024-08-15",
    
    reviewers: ["REV005"],
    reviewCount: 1,
    averageScore: 7.0,
    
    paperType: "poster",
    fileUrl: "/papers/P005.pdf",
    fileSize: "0.8 MB",
    pageCount: 2,
    
    submittedBy: "USER005",
    submitterName: "Trương Văn K",
    submitterEmail: "truongvank@blockchain.vn",
    version: 1,
    isPresenterRegistered: true,
    
    finalDecision: "accept",
    decisionDate: "2024-09-10",
    decisionNotes: "Good practical contribution. Accepted as poster presentation."
  },
  {
    id: "P006",
    title: "Adversarial Attacks on Medical Image Analysis Systems",
    authors: ["Phan Văn M", "Đinh Thị N", "Mai Văn O"],
    authorEmails: ["phanvanm@med.edu.vn", "dinhthin@med.edu.vn", "maivano@med.edu.vn"],
    abstract: "We investigate the vulnerability of deep learning models used in medical image analysis to adversarial attacks. Our study reveals critical security concerns and proposes robust defense mechanisms to ensure reliable clinical deployment.",
    keywords: ["Adversarial Learning", "Medical Imaging", "Security", "Deep Learning", "Robustness"],
    
    conferenceId: "CONF001",
    conferenceName: "International Conference on AI 2024",
    trackId: "TRACK002",
    trackName: "Machine Learning Applications",
    
    status: "rejected",
    submissionDate: "2024-08-10",
    lastModifiedDate: "2024-08-10",
    
    reviewers: ["REV001", "REV003", "REV004"],
    reviewCount: 3,
    averageScore: 4.3,
    
    paperType: "full_paper",
    fileUrl: "/papers/P006.pdf",
    fileSize: "4.1 MB",
    pageCount: 14,
    
    submittedBy: "USER006",
    submitterName: "Phan Văn M",
    submitterEmail: "phanvanm@med.edu.vn",
    version: 1,
    isPresenterRegistered: false,
    
    finalDecision: "reject",
    decisionDate: "2024-09-15",
    decisionNotes: "Insufficient novelty and limited experimental validation. Reviewers suggest major revisions and resubmission to future conferences."
  },
  {
    id: "P007",
    title: "Explainable AI for Credit Risk Assessment in Banking",
    authors: ["Lâm Thị P", "Đặng Văn Q"],
    authorEmails: ["lamthip@bank.vn", "dangvanq@bank.vn"],
    abstract: "We develop an explainable machine learning framework for credit risk assessment that provides transparent and interpretable predictions. Our approach combines gradient boosting with SHAP values to meet regulatory requirements while maintaining high predictive accuracy.",
    keywords: ["Explainable AI", "Credit Risk", "Banking", "Machine Learning", "SHAP"],
    
    conferenceId: "CONF004",
    conferenceName: "FinTech & AI Conference 2024",
    trackId: "TRACK006",
    trackName: "AI in Finance",
    
    status: "under_review",
    submissionDate: "2024-09-25",
    lastModifiedDate: "2024-09-28",
    
    reviewers: ["REV002", "REV005"],
    reviewCount: 1,
    averageScore: 8.0,
    
    paperType: "full_paper",
    fileUrl: "/papers/P007.pdf",
    fileSize: "2.6 MB",
    pageCount: 11,
    
    submittedBy: "USER007",
    submitterName: "Lâm Thị P",
    submitterEmail: "lamthip@bank.vn",
    version: 1,
    isPresenterRegistered: true
  },
  {
    id: "P008",
    title: "Graph Neural Networks for Social Network Analysis",
    authors: ["Cao Văn R"],
    authorEmails: ["caovanr@social.edu.vn"],
    abstract: "This workshop paper explores the application of graph neural networks to analyze social network dynamics. We present preliminary findings on community detection and influence propagation patterns.",
    keywords: ["Graph Neural Networks", "Social Networks", "Community Detection", "Network Analysis"],
    
    conferenceId: "CONF001",
    conferenceName: "International Conference on AI 2024",
    trackId: "TRACK007",
    trackName: "Graph Machine Learning",
    
    status: "withdrawn",
    submissionDate: "2024-08-25",
    lastModifiedDate: "2024-09-20",
    
    reviewers: ["REV003"],
    reviewCount: 0,
    averageScore: 0,
    
    paperType: "workshop",
    fileUrl: "/papers/P008.pdf",
    fileSize: "1.2 MB",
    pageCount: 4,
    
    submittedBy: "USER008",
    submitterName: "Cao Văn R",
    submitterEmail: "caovanr@social.edu.vn",
    version: 1,
    isPresenterRegistered: false
  }
];

export const mockReviewData: PaperReview[] = [
  {
    id: "REV_P001_001",
    paperId: "P001",
    reviewerId: "REV001",
    reviewerName: "Dr. Nguyễn Văn A",
    score: 8,
    confidence: 4,
    comments: "This paper presents a solid contribution to Vietnamese NLP. The proposed architecture is well-motivated and the experimental results are convincing.",
    strengths: "- Novel approach for Vietnamese language\n- Comprehensive experiments\n- Clear presentation\n- State-of-the-art results",
    weaknesses: "- Limited comparison with recent multilingual models\n- Could benefit from more error analysis\n- Some implementation details are missing",
    recommendedAction: "minor_revision",
    reviewDate: "2024-09-25",
    status: "completed"
  },
  {
    id: "REV_P001_002",
    paperId: "P001",
    reviewerId: "REV002",
    reviewerName: "Prof. Trần Thị B",
    score: 7,
    confidence: 5,
    comments: "Good paper with interesting ideas. However, the novelty is somewhat limited as similar approaches have been explored for other languages.",
    strengths: "- Well-written paper\n- Good experimental setup\n- Useful contribution to Vietnamese NLP community",
    weaknesses: "- Limited novelty in the approach\n- Missing ablation studies on some components\n- Could include more recent baselines",
    recommendedAction: "minor_revision",
    reviewDate: "2024-09-27",
    status: "completed"
  },
  {
    id: "REV_P002_001",
    paperId: "P002",
    reviewerId: "REV001",
    reviewerName: "Dr. Nguyễn Văn A",
    score: 9,
    confidence: 5,
    comments: "Excellent work on an important problem. The privacy-preserving aspects are well-designed and the experimental validation is thorough.",
    strengths: "- Addresses critical healthcare privacy concerns\n- Strong theoretical foundations\n- Comprehensive experiments\n- Clear practical impact",
    weaknesses: "- Could discuss scalability to larger networks\n- Minor presentation issues",
    recommendedAction: "accept",
    reviewDate: "2024-09-20",
    status: "completed"
  },
  {
    id: "REV_P002_002",
    paperId: "P002",
    reviewerId: "REV004",
    reviewerName: "Dr. Lê Văn C",
    score: 8,
    confidence: 4,
    comments: "Strong paper with good motivation and execution. The federated learning framework is well-suited for the healthcare domain.",
    strengths: "- Important application domain\n- Solid technical approach\n- Good evaluation methodology",
    weaknesses: "- Limited discussion of edge cases\n- Could benefit from real-world deployment insights",
    recommendedAction: "accept",
    reviewDate: "2024-09-22",
    status: "completed"
  },
  {
    id: "REV_P003_001",
    paperId: "P003",
    reviewerId: "REV002",
    reviewerName: "Prof. Trần Thị B",
    score: 6,
    confidence: 4,
    comments: "The paper tackles a relevant problem but needs significant improvements. The evaluation is limited and some design choices are not well justified.",
    strengths: "- Relevant application\n- Real-time performance considerations",
    weaknesses: "- Limited evaluation datasets\n- Missing comparisons with recent methods\n- Unclear architectural choices\n- Needs more detailed ablation studies",
    recommendedAction: "major_revision",
    reviewDate: "2024-09-28",
    status: "completed"
  },
  {
    id: "REV_P003_002",
    paperId: "P003",
    reviewerId: "REV003",
    reviewerName: "Dr. Lê Văn C",
    score: 7,
    confidence: 3,
    comments: "Decent work on autonomous driving. The paper would benefit from more extensive experiments and clearer presentation of the methodology.",
    strengths: "- Practical application\n- Good balance between speed and accuracy",
    weaknesses: "- Limited evaluation scenarios\n- Presentation could be improved\n- Missing important baseline comparisons",
    recommendedAction: "minor_revision",
    reviewDate: "2024-09-30",
    status: "completed"
  },
  {
    id: "REV_P005_001",
    paperId: "P005",
    reviewerId: "REV005",
    reviewerName: "Dr. Phạm Thị D",
    score: 7,
    confidence: 4,
    comments: "Interesting practical implementation. Good fit for poster presentation. Would like to see more technical details in the final version.",
    strengths: "- Real-world deployment\n- Addresses important security concerns\n- Good user study",
    weaknesses: "- Limited technical depth (appropriate for poster)\n- Could discuss scalability more",
    recommendedAction: "accept",
    reviewDate: "2024-09-05",
    status: "completed"
  },
  {
    id: "REV_P007_001",
    paperId: "P007",
    reviewerId: "REV002",
    reviewerName: "Prof. Trần Thị B",
    score: 8,
    confidence: 5,
    comments: "Strong paper that addresses an important problem in the banking sector. The explainability aspects are well-handled and meet regulatory requirements.",
    strengths: "- Addresses real business need\n- Strong explainability framework\n- Good balance of accuracy and interpretability\n- Well-written",
    weaknesses: "- Could include more diverse datasets\n- Discussion of limitations could be expanded",
    recommendedAction: "accept",
    reviewDate: "2024-10-02",
    status: "completed"
  }
];