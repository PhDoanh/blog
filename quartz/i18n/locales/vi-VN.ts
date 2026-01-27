import { Translation } from "./definition"

export default {
  propertyDefaults: {
    title: "Không có tiêu đề",
    description: "Không có mô tả được cung cấp",
  },
  components: {
    callout: {
      note: "Ghi Chú",
      abstract: "Tóm Tắt",
      info: "Thông tin",
      todo: "Cần Làm",
      tip: "Gợi Ý",
      success: "Thành Công",
      question: "Nghi Vấn",
      warning: "Cảnh Báo",
      failure: "Thất Bại",
      danger: "Nguy Hiểm",
      bug: "Lỗi",
      example: "Ví Dụ",
      quote: "Trích Dẫn",
    },
    backlinks: {
      title: "Liên Kết Ngược",
      noBacklinksFound: "Không có liên kết ngược được tìm thấy",
    },
    bookmark: {
      title: "Đánh dấu trang",
      tooltip: "",
    },
    mediaShare: {
      title: "Chia sẻ",
      tooltip: "",
      copyLink: "Sao chép link",
      linkCopied: "Đã sao chép!",
    },
    translate: {
      title: "Dịch thuật",
      tooltip: "",
    },
    editThisPage: {
      title: "Sửa bài viết",
      tooltip: "",
    },
    themeToggle: {
      lightMode: "Sáng",
      darkMode: "Tối",
    },
    readerMode: {
      title: "Chế độ đọc",
      tooltip: "",
    },
    explorer: {
      title: "Khám phá",
    },
    footer: {
      createdWith: "Được tạo bởi",
    },
    graph: {
      title: "Biểu Đồ",
      tooltip: "",
    },
    recentNotes: {
      title: "Bài viết gần đây",
      seeRemainingMore: ({ remaining }) => `Xem ${remaining} thêm ...`,
    },
    transcludes: {
      transcludeOf: ({ targetSlug }) => `Bao gồm ${targetSlug}`,
      linkToOriginal: "Liên Kết Gốc",
    },
    search: {
      title: "Tìm Kiếm",
      searchBarPlaceholder: "Tìm kiếm từ khóa hoặc #thẻ",
    },
    tableOfContents: {
      title: "Mục lục",
    },
    contentMeta: {
      readingTime: ({ minutes }) => `đọc ${minutes} phút`,
    },
  },
  pages: {
    rss: {
      recentNotes: "Các bài viết gần đây",
      lastFewNotes: ({ count }) => `${count} bài gần đây`,
    },
    error: {
      title: "Không tìm thấy trang!",
      notFound: "Trang này được bảo mật hoặc không tồn tại.",
      home: "Trở về trang chủ",
    },
    translation: {
      title: "Bản dịch không có sẵn!",
      translationRequest: "Nếu muốn, bạn có thể tham gia đóng góp bản dịch.",
      seeGuide: "Xem hướng dẫn đóng góp",
      preTranslation: "Quay lại bản dịch trước đó.",
    },
    offlineFallback: {
      title: "Không có Internet!",
      description: "Vui lòng kiểm tra kết nối mạng và thử lại. Hoặc đọc các trang đã đánh dấu trong lúc ngoại tuyến.",
      home: "Trở về trang chủ",
    },
    bookmarks: {
      title: "Các trang được đánh dấu",
    },
    folderContent: {
      folder: "Thư Mục",
      itemsUnderFolder: ({ count }) =>
        count === 1 ? "1 mục trong thư mục này." : `${count} mục trong thư mục này.`,
    },
    tagContent: {
      tag: "Thẻ",
      tagIndex: "Thẻ Mục Lục",
      itemsUnderTag: ({ count }) =>
        count === 1 ? "1 mục gắn thẻ này." : `${count} mục gắn thẻ này.`,
      showingFirst: ({ count }) => `Hiển thị trước ${count} thẻ.`,
      totalTags: ({ count }) => `Tìm thấy ${count} thẻ tổng cộng.`,
    },
  },
} as const satisfies Translation
