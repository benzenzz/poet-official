// Blog posts shown as two preview cards on Về chúng tôi and Tình nguyện viên; each has its own detail page under /blog/<id>/.
// Body blocks: {p}, {h} (subheading), {role} (department card: title, en, text, leader?), {list}.
export const blogPosts = [
  {
    id: 'bo-may-poet',
    kicker: 'Con người POET',
    title: 'Bên trong bộ máy POET: 4 phân ban, một nhịp chung',
    excerpt: 'POET hiện có 54 thành viên, gồm 18 nhân sự nòng cốt và 34 tình nguyện viên, cùng vận hành qua 4 phân ban chuyên trách.',
    date: '2026-10-20',
    readTime: '4 phút đọc',
    cover: {id: 'blog-bo-may-poet', w: 2048, h: 1365, pos: '50% 40%', alt: 'Các thành viên POET Mùa 6 mặc áo Young Joy, cùng làm dấu tay tam giác trong buổi gặp mặt.'},
    stats: [['54', 'thành viên'], ['18', 'nhân sự nòng cốt'], ['34', 'tình nguyện viên'], ['4', 'phân ban']],
    body: [
      {p: 'Câu lạc bộ Thiện nguyện POET hiện tại có 54 thành viên, bao gồm 18 nhân sự nòng cốt và 34 tình nguyện viên.'},
      {p: 'Nhằm đảm bảo bộ máy vận hành trơn tru và đạt hiệu quả cao trong công việc, POET được chia thành 4 phân ban chuyên trách, bao gồm: ER (External Relations), OP (Operations), MEDIA, và HR (Human Resources).'},
      {p: 'Trong đó, ER nhận nhiệm vụ kết nối nguồn lực tài trợ và trao đổi cùng đối tác; OP đảm nhận việc xây dựng, phát triển và đánh giá rủi ro cho các chương trình, hoạt động gây quỹ; MEDIA nhận trách nhiệm lan tỏa hình ảnh, thông điệp trước, trong và sau dự án; và cuối cùng, nhưng không kém phần quan trọng, HR nhận nhiệm vụ chăm lo cho nhân sự và quản lý thu – chi.'},
      {p: 'Trong quá trình vận hành, 4 phân ban không hoạt động riêng rẽ mà phối hợp chặt chẽ theo mô hình liên kết đồng đẳng, khép kín. Thông qua trao đổi liên ban, tất cả sẽ cùng nhau tháo gỡ những khúc mắc, và tận dụng tối đa nguồn lực sẵn có. Với tinh thần thiện nguyện và “vui hết mình, làm hết sức”, các phân ban sẽ cùng chung tay mang tới cho các em tại điểm trường Tiểu học & THCS Hoàng Văn Thụ những hỗ trợ thiết thực nhất cho học tập và sinh hoạt.'},
      {h: 'Ban Điều hành và 4 phân ban'},
      {role: {title: 'Ban Điều hành', en: 'Executive Board', text: 'Giữ chức vụ điều hành và quản lý nhân sự, chịu trách nhiệm đảm bảo các hoạt động nội bộ và ngoại bộ được diễn ra hiệu quả nhất. Ban Điều hành hiện bao gồm: Hoài Phương (Chủ nhiệm POET Mùa 6) và Hoàng Linh (Người sáng lập POET).'}},
      {role: {title: 'Phân ban Vận hành', en: 'Operations', text: 'Phân ban phụ trách công tác xây dựng và phát triển các chương trình, hoạt động gây quỹ cho POET Mùa 6. Bên cạnh đó, phân ban còn đảm nhận công tác nhận diện và dự phòng các rủi ro có thể xảy ra trong quá trình tổ chức.', leader: 'Khánh Thy'}},
      {role: {title: 'Phân ban Truyền thông', en: 'Media', text: 'Phân ban phụ trách công tác truyền thông và xây dựng hình ảnh thương hiệu cho POET Mùa 6. Phân ban chia thành 4 phân ban con: Content Writer (phát triển nội dung cho các bài đăng truyền thông), Content Creator (phát triển nội dung cho các video ngắn), Design (phát triển các ấn phẩm thị giác) và Production (quay, chụp và sản xuất).', leader: 'Quỳnh Như'}},
      {role: {title: 'Phân ban Nhân sự', en: 'Human Resources', text: 'Phân ban phụ trách công tác chăm lo và gắn kết các thành viên trong POET, thông qua các hoạt động training và team bonding. Bên cạnh đó, phân ban còn đảm nhận công tác cập nhật và theo dõi các khoản thu – chi của tổ chức, đảm bảo tính rõ ràng, chính xác và minh bạch.', leader: 'Thanh Uyên'}},
      {role: {title: 'Phân ban Đối ngoại', en: 'External Relations', text: 'Phân ban phụ trách công tác tìm kiếm Nhà tài trợ, và bảo đảm kênh thông tin, liên lạc rõ ràng, mạch lạc giữa POET và các Nhà tài trợ. Bên cạnh đó, phân ban còn đảm nhận công tác chuẩn bị và soạn thảo các giấy tờ quan trọng như biên bản ghi nhớ (MOU), hợp đồng hợp tác,…', leader: 'Phương Minh'}}
    ]
  },
  {
    id: 'poet-vnv',
    kicker: 'Cột mốc',
    title: 'POET trở thành thành viên trực thuộc Cộng đồng Tình nguyện Việt Nam (VNV)',
    excerpt: 'Một dấu mốc ý nghĩa sau hành trình từ năm 2022, mở ra thêm cơ hội để POET học hỏi, kết nối và lan tỏa tinh thần tình nguyện.',
    date: '2026-10-20',
    readTime: '3 phút đọc',
    cover: {id: 'blog-poet-vnv', w: 1448, h: 2048, pos: '50% 30%', alt: 'Quyết định số A1110/2026/QĐ-VNV công nhận CLB Thiện nguyện POET là thành viên trực thuộc Cộng đồng Tình nguyện Việt Nam, từ 11/10/2026 đến 11/10/2028.'},
    facts: [['Số quyết định', 'A1110/2026/QĐ-VNV'], ['Hiệu lực', '11/10/2026 – 11/10/2028'], ['Ngày ký', '20/10/2026, Hà Nội']],
    body: [
      {p: 'Từ những ngày đầu tiên vào năm 2022, POET bắt đầu hành trình của mình với mong muốn góp một phần sức trẻ để mang đến những điều tốt đẹp hơn cho cộng đồng. Qua từng chương trình, từng chuyến đi và những lần gặp gỡ, hành trình ấy dần được nối dài bằng những trải nghiệm, những bài học và cả những tình cảm mà chúng mình may mắn nhận được trên đường đi.'},
      {p: 'Nhìn lại chặng đường vừa qua, POET đã có cơ hội đồng hành cùng các em học sinh tại những khu vực còn nhiều khó khăn, góp sức cải thiện điều kiện học tập và mang đến những không gian để các em vui chơi, khám phá. Đồng thời, đây cũng là hành trình để mỗi thành viên được học hỏi, trải nghiệm, trưởng thành và cùng nhau biến những mong muốn ban đầu thành những hành động thiết thực.'},
      {p: 'Để có được những điều ấy, POET biết ơn từng thành viên, tình nguyện viên, nhà tài trợ và tất cả mọi người đã luôn quan tâm, theo dõi và đồng hành cùng chúng mình trên hành trình vừa qua. Mỗi sự đóng góp, mỗi lời động viên đều là một mảnh ghép giúp POET có thêm cơ hội đi xa hơn, kết nối nhiều nguồn lực hơn và vun đắp những giá trị bền vững cho cộng đồng.'},
      {p: 'Trở thành thành viên trực thuộc Cộng đồng Tình nguyện Việt Nam (VNV) là một dấu mốc ý nghĩa, mở ra thêm những cơ hội để POET học hỏi, kết nối và tiếp tục lan tỏa tinh thần tình nguyện. Chúng mình hy vọng sẽ nhận được sự quan tâm, tin tưởng và đồng hành của mọi người trên những chặng đường sắp tới, để cùng mang thêm những cơ hội học tập, những niềm vui và những trải nghiệm ý nghĩa đến với các em học sinh.'}
    ]
  }
];
