// Edit seasonal facts here, then run: node tools/build-site.mjs.
// Sources: Website Flow (17 Oct 2026); campaign dossier, pages noted below.
export const pending = 'Đang cần cập nhật';
// Home visual reference only. These are NOT verified campaign/API figures.
// Keep separate from season's confirmed facts and never feed payment reporting.
export const homepageFundraisingPreview = Object.freeze({
  source: 'Original prototype supplied 20 October 2026',
  raised: 78450000, individuals: 248, businesses: 14
});
export const season = {
  id: 'season-6', name: 'Mùa 6', year: '2026–2027', title: 'Công Viên Niềm Vui',
  art: 'season-6/lettering/cong-vien-niem-vui.webp',
  location: 'Ea Kiết, Đắk Lắk', beneficiaries: 300, targetAmount: 121950000,
  timeframe: '09/2026 – 01/2027', trip: '22–24/01/2027',
  // UI-018 (projects): campaign block. Dates drive the countdown; numbers come from the home fundraising source.
  park: 'Công viên Niềm vui', spirit: 'Niềm vui đơn thuần', spiritLine: 'chơi vui, chơi khoẻ ngay trong sân trường.',
  campaignSummary: 'Bên cạnh việc học, sức khoẻ tinh thần của các em nhỏ vùng khó khăn cũng cần được nuôi dưỡng đúng cách. Mùa này, POET mang một “công viên” nhỏ đến điểm trường để các em được chơi thật vui và thật khoẻ.',
  scale: {value: '300 học sinh cấp 1', detail: 'Đa số là con em đồng bào H’Mông'},
  // UI-020 (projects): plan block. Stations and the two-day schedule shown on the projects page.
  plan: {
    title: 'Kế hoạch xây dựng<br>Công viên Niềm vui',
    lead: 'Không chỉ mang đến những phần quà ý nghĩa, POET sẽ tổ chức một ngày hội chạy trạm ngay tại sân trường. Các em được khám phá, vui chơi an toàn và mở rộng thế giới quan.',
    stations: [
      {tone: 'coral', icon: 'briefcase', name: 'Trạm hướng nghiệp & thực tế',
       text: 'Giới thiệu và hướng dẫn các em tìm hiểu về các nhóm ngành nghề trong xã hội qua bài giảng sinh động kết hợp thực hành trực tiếp.'},
      {tone: 'yellow', icon: 'smile', name: 'Trạm trò chơi gắn kết',
       text: 'Không gian vui nhộn với những trò chơi dân gian và hiện đại, giúp các em làm quen bạn mới, thoả sức cười đùa và lưu giữ kỷ niệm tuổi thơ.'},
      {tone: 'blue', icon: 'flag', name: 'Trạm vận động & thể lực',
       text: 'Nơi các em chạy nhảy, rèn luyện thể lực vừa sức và cổ vũ đồng đội trong không khí hào hứng, năng động.'},
      {tone: 'green', icon: 'gift', name: 'Trạm đổi quà yêu thương',
       text: 'Hoàn thành thử thách ở các trạm, mỗi em nhận phiếu để đổi những món quà nhỏ xinh bất ngờ mà mình yêu thích.'},
      {tone: 'coral', icon: 'clapperboard', name: 'Trạm chiếu phim thiếu nhi',
       text: 'Rạp chiếu phim mini giữa núi rừng Tây Nguyên, để các em vừa thư giãn vừa thưởng thức những câu chuyện nhân văn giàu cảm xúc.'},
      {tone: 'yellow', icon: 'book-open', name: 'Thư viện ước mơ',
       text: 'Góc đọc sách yên bình với hàng trăm đầu truyện tranh, sách khoa học thường thức được POET chọn riêng cho lứa tuổi cấp 1.'}
    ],
    schedule: [
      {day: 'Ngày 1', title: 'Hoạt động chính & lửa trại', items: [
        {time: '04:00 – 07:00', text: 'Đến điểm trường, vận chuyển đồ đạc và tập kết quà'},
        {time: '08:00 – 11:00', text: 'Lắp đặt 17 quạt lớp học, trang trí sân khấu và dựng trạm'},
        {time: '14:30 – 15:30', text: 'Lễ trao quà: 300 phần học phẩm, đồng phục và văn nghệ thiếu nhi', kind: 'key'},
        {time: '15:30 – 17:00', text: 'Mở 6 – 8 trạm vui chơi ngoài trời, chiếu phim và thư viện', kind: 'key'},
        {time: '21:00 – 22:30', text: 'Đốt lửa trại và diễn kịch truyền cảm hứng cùng các em', kind: 'night'}
      ]},
      {day: 'Ngày 2', title: 'Tổng kết & bàn giao', items: [
        {time: '07:30 – 10:00', text: 'Hoàn thiện góc trò chơi sân trường và bàn giao lớp học mới'},
        {time: '10:00 – 11:00', text: 'Lễ ký kết bàn giao cho Ban Giám hiệu nhà trường', kind: 'key'},
        {time: '12:00', text: 'Đoàn tình nguyện viên lên đường trở về TP. Hồ Chí Minh'}
      ]}
    ]
  },
  prepStart: '2026-08-21', tripStart: '2027-01-22', tripEnd: '2027-01-24',
  headline: 'Trao nụ cười, dựng sân\u00a0chơi',
  summary: 'Cùng tạo thêm không gian vui chơi, vận động và học hỏi cho 300 em học sinh tại điểm trường thuộc Trường Tiểu học & Trung học cơ sở Hoàng Văn Thụ, xã Ea Kiết, tỉnh Đắk Lắk.',
  narrative: [
    'Sau một thời gian chuẩn bị cho mùa hoạt động mới, POET chính thức lựa chọn Điểm trường thuộc Trường Tiểu học & Trung học cơ sở Hoàng Văn Thụ, xã Ea Kiết, tỉnh Đắk Lắk làm điểm đến cho mùa POET 2026–2027.',
    'Cũng qua chuyến tiền trạm ấy, POET nhận ra rằng điều kiện cơ sở vật chất, không gian để các em vui chơi, vận động vẫn còn khá hạn chế. Vì vậy, POET dự định tổ chức “Công viên niềm vui” tại điểm trường — các góc vui chơi, trải nghiệm và vận động; đồng thời cải thiện không gian sinh hoạt tại trường, để mỗi ngày đến trường của các em có thêm nhiều niềm vui và những kỷ niệm đáng nhớ.',
    'Hành trình gây quỹ của POET được xây dựng qua chuỗi hoạt động xuyên suốt, bao gồm quỹ Big Joy Little Joy, bộ sưu tập Young Joy Collection, không gian trải nghiệm Big Joy Pop-up (dự kiến diễn ra vào cuối tháng 12), cùng các chương trình kêu gọi tài trợ và quyên góp từ cộng đồng. Khép lại chuỗi sự kiện gây quỹ, POET sẽ thực hiện chuyến đi thực tế Final Trip đến điểm trường để trực tiếp trao tặng những món quà ý nghĩa và cùng các em nhỏ hòa mình vào các hoạt động giao lưu đầy thú vị tại sân chơi.'
  ],
  destinationPhotos: [], // Add only approved, identified Mùa 6 school photos.
  school: 'Trường Tiểu học & Trung học cơ sở Hoàng Văn Thụ',
  schoolNote: 'Điểm trường Tiểu học Mạc Thị Bưởi cũ',
  schoolContext: [
    'Điểm trường đón các em học sinh tiểu học, đa số là người H’Mông. Sân rải đá trở nên lầy, trơn vào mùa mưa; thiết bị vui chơi hiện có đã hư hỏng.',
    'Trường đã được hỗ trợ thêm lớp học, điện mặt trời và nước lọc. POET muốn góp tiếp một phần để việc học và giờ ra chơi của các em an toàn hơn.'
  ],
  // The existing donation API is global. No campaign-scoped progress is supplied.
  raised: null, individuals: null, businesses: null,
  budgetIntro: {
    title: 'Ngân sách<br>gây quỹ Mùa 6',
    lead: 'Mỗi khoản dưới đây được tính từ khảo sát nhu cầu thực tế tại điểm trường Ea Kiết. POET công khai từng khoản để mọi người và nhà&nbsp;tài&nbsp;trợ cùng theo dõi.'
  },
  // Thành tiền = qty × price. Tổng phải bằng targetAmount (build-site kiểm tra).
  budget: [
    {name:'Quạt treo tường cho các phòng học', note:'Làm mát lớp học những ngày nắng gắt Tây Nguyên', qty:17, unit:'cái', price:350000, color:'#f4b3a9'},
    {name:'Xe đạp mới cho học sinh ở xa, hoàn cảnh đặc biệt', note:'Giúp các em rút ngắn quãng đường vượt đồi đến trường', qty:6, unit:'chiếc', price:2000000, color:'#5fb08a'},
    {name:'Dụng cụ học tập: bút gel, bút chì, gôm, thước kẻ', note:'Đủ trang bị cho 300 em học sinh cấp 1', qty:300, unit:'phần', price:70000, color:'#6aa7bf'},
    {name:'Vở trắng 5 ô ly: 10 quyển, định lượng 120 gsm', note:'Giấy chống loá, dùng được cả năm học', qty:300, unit:'phần', price:100000, color:'#f7bc3c'},
    {name:'Áo đồng phục mới: áo có cổ, ấm áp, chỉn chu', note:'Tạo cảm giác gắn kết và giữ ấm cho các em', qty:300, unit:'áo', price:150000, color:'#ef8a7d'},
    {name:'Góc trò chơi sân trường: cầu tuột & đồ chơi vận động', note:'Thay cầu tuột đã gãy hỏng, tạo sân chơi an toàn', qty:2, unit:'gói', price:1500000, color:'#a5cbd9'},
    {name:'Tổ chức hoạt động tại trường: trạm trò chơi, văn nghệ, chiếu phim', note:'Vật phẩm trò chơi, quà thưởng, rạp phim mini và lửa trại', qty:1, unit:'gói', price:5000000, color:'#fad57f'}
  ]
};
// Thẻ "Hành trình Mùa 6" dùng chung cho trang chủ và trang Dự án. **đậm** được render thành <strong>.
export const campaignStory = {
  eyebrow: 'Điểm trường Ea Kiết · Đắk Lắk',
  intro: [
    `Bước vào mùa hoạt động mới, **POET 2026 - 2027** chính thức chọn dừng chân tại **Điểm trường thuộc ${season.school}, xã Ea Kiết, tỉnh Đắk Lắk**.`,
    'Nhận thấy rằng điều kiện cơ sở vật chất, không gian để các em vui chơi, vận động vẫn còn khá hạn chế, POET khởi động hoạt động gây quỹ đầu tiên mang tên **Big Joy Little Joy**. Hành trình gây quỹ của POET được xây dựng qua chuỗi hoạt động xuyên suốt (Tháng 10/2026 - Tháng 01/2027) bao gồm:'
  ],
  activities: [
    'Quỹ **Big Joy Little Joy**',
    'Kêu gọi tài trợ và kêu gọi quyên góp từ cộng đồng',
    'Bộ sưu tập **Young Joy Collection** (Đang trong quá trình thực hiện)',
    'Không gian trải nghiệm **Big Joy Pop-up** (Dự kiến: Cuối tháng 12/2026)',
    'Chuyến đi cuối cùng đến điểm trường (Dự kiến: Tháng 01/2027)'
  ]
};

// Dossier p10. Planned dates. start = ngày bắt đầu chặng, dùng để tính bé Hoa đang ở đâu (UI-011)
export const journeyIntro = {
  eyebrow: 'Lộ trình Big Joy Little Joy',
  title: 'Bốn chặng,<br>cùng một điểm đến.',
  text: 'Kế hoạch 4 giai đoạn từ 09/2026 đến 01/2027, đi cùng các Little Joy từ ngày đầu tới chuyến trao quà.',
  nowLabel: 'Bé Hoa đang ở'
};
export const journey = [
  { name: 'Onboard', date: '09/2026', start: '2026-09-01', note: 'Little Joy tham gia cùng POET, trở thành một phần của hành trình tạo nên Big Joy.' },
  { name: 'Collect The Little Joys', date: '10–12/2026', start: '2026-10-01', note: 'Little Joy đóng góp một phần doanh thu và cùng POET lan tỏa Little Joy đến cộng đồng.' },
  { name: 'Big Joy Pop Up', date: '20–22/12/2026', start: '2026-12-20', note: 'Little Joy mang sản phẩm đến Pop-up bán hàng, giao lưu & kết nối cùng cộng đồng.' },
  { name: 'Joy, Delivered', date: season.trip, start: '2027-01-22', note: 'Những đóng góp nhỏ cùng nhau tạo thành Big Joy: Công viên Niềm Vui dành cho cộng đồng.' }
];
export const activities = [
  {title:`POET ${season.year}`,tag:season.name,description:`Cùng xây ${season.title} cho ${season.beneficiaries} em học sinh tại Ea Kiết.`,art:'season',photo:'playground-joy',focus:'50% 42%',href:'du-an/#dang-thuc-hien',meta:season.timeframe},
  {title:'Big Joy Little Joy',tag:'Thương hiệu đồng hành',description:'Những đóng góp nhỏ, từ công việc mỗi ngày, cùng tạo nên niềm vui lớn.',art:'bjl-j',photo:'big-joy-little-joy',focus:'50% 55%',href:'dong-hanh/#doanh-nghiep',meta:'10 cột mốc đồng hành'},
  {title:'Young Joy Collection',tag:'Sắp được bật mí',description:'Bộ sưu tập merchandise gây quỹ cùng POET. Sản phẩm và thông tin mở bán sẽ được công bố sau.',art:'collection',photo:'community-day',focus:'50% 50%',href:'dong-hanh/#collection',meta:'Chưa mở bán'},
  {title:'Big Joy Pop-up',tag:'Sắp được bật mí',description:'Không gian trải nghiệm và hội chợ cộng đồng kết nối các Little Joy, dự kiến vào cuối tháng 12.',art:'popup',photo:'big-joy-pop-up',focus:'50% 45%',href:'dong-hanh/#pop-up',meta:'Chưa mở bán vé'}
];
// One project collection powers Home, the completed-project tab and detail routes.
// Volunteer tab notice (UI-014). open=false: Mùa 6 đã đóng đơn, mời theo dõi Facebook.
export const recruitment = {
  open: false,
  seasonLabel: 'Mùa 7',
  closedLabel: 'Mùa 6 · đã đóng đơn',
  applicationUrl: null,
  deadline: null,
  // POET TikTok videos (@poet.npo), id only. Thumbnails use existing photos: TikTok oEmbed no longer returns thumbnail_url.
  // TikTok videos on @poet.npo. title, views, likes, duration are optional; fill them from the TikTok app (empty ones are hidden).
  videos: [
    {id: '7691974748988869895', photo: 'community-day', title: null, views: null, likes: null, duration: null},
    {id: '7692724969809120530', photo: 'school-friends', title: null, views: null, likes: null, duration: null},
    {id: '7692340261279616274', photo: 'playground-joy', title: null, views: null, likes: null, duration: null},
    {id: '7696858799683964167', photo: 'big-joy-little-joy', title: null, views: null, likes: null, duration: null}
  ],
  notice: {
    kicker: 'Thông báo tuyển quân',
    closed: {
      title: 'Hẹn bạn<br><span>ở mùa sau nhé!</span>',
      text: 'Đơn tuyển tình nguyện viên Mùa 6 đã đóng mất rồi. POET vẫn luôn chờ những đồng đội mới cho hành trình Mùa 7. Theo dõi Facebook POET để nhận thông tin tuyển quân sớm nhất nha!',
      cta: 'Theo dõi Facebook POET'
    },
    open: {
      title: 'Đăng ký làm<br><span>tình nguyện viên POET</span>',
      text: 'Đơn tuyển tình nguyện viên đang mở. Đọc kỹ thông tin và gửi đơn trước hạn nhé!',
      cta: 'Đăng ký ngay'
    }
  }
};
// Approved previews: POET WEBSITE_ĐẶC BIỆT ĐỌC KĨ.md, image 34.
// The 42.2m fundraising total belongs to Mùa 5, not to the concert alone.
export const highlights = [
  {id:'vet-nut',title:'Đêm nhạc acoustic gây quỹ “Vết Nứt”',tag:'Mùa 5 · TP. Hồ Chí Minh',description:'Với sự tham gia của 120 khán giả và 5 nhà tài trợ, chương trình đã lan tỏa thông điệp tích cực về sức khỏe tinh thần, tạo sân chơi cho các nghệ sĩ trẻ và góp quỹ cải thiện chất lượng học tập tại Trường Tiểu học Mỹ Thạnh Bắc (Đức Huệ, Long An).',metrics:['120 khán giả','5 nhà tài trợ'],source:'Nội dung hoạt động do POET cung cấp; Tiền Phong, 19/07/2022',pending:'Bài viết chi tiết và ảnh chọn lọc đang chờ hoàn thiện.'},
  {id:'go-ngai',title:'Chương trình thiện nguyện tại Trường Tiểu học Mỹ Thạnh Bắc',tag:'Mùa 5 · Mỹ Thạnh Bắc, Long An',description:'POET trao tặng 30 suất đồ dùng học tập, 10 suất học bổng, 5 xe đạp, 3 quạt treo tường và 3 tủ nhôm đựng tài liệu cho 3 lớp học tại điểm trường. Các em còn cùng tham gia hoạt động vui chơi chạy trạm với chủ đề bảo vệ môi trường.',metrics:['30 suất đồ dùng học tập','10 suất học bổng','5 xe đạp'],source:'Nội dung hoạt động do POET cung cấp; Hồ sơ POET, trang 4',pending:'Bài viết chi tiết và ảnh chọn lọc đang chờ hoàn thiện.'}
];
export const projectStories = highlights.map(item=>({...item,season:'Mùa 5',status:'completed',year:item.id==='vet-nut'?2022:null,
  href:`du-an/${item.id}/`,cover:`story-${item.id}`,gallery:[`story-${item.id}`],
  photoCaption:item.id==='vet-nut'?'Các bạn tham gia đêm nhạc — ảnh từ album Vết Nứt của POET.':'Các thành viên tại chuyến đi — ảnh từ album Final Trip của POET.',
  paragraphs:[item.description],
  sources:item.id==='vet-nut'?[{title:'Tiền Phong · 19/07/2022',url:'https://tienphong.vn/ban-tre-gap-sao-huong-ung-dem-nhac-chua-lanh-gay-quy-thien-nguyen-post1454826.tpo'}]:[],
  album:item.id==='vet-nut'?'https://drive.google.com/drive/folders/1E4uZ1FYLX3H3x6YzxEtiGgbcaRdO0iSv':'https://drive.google.com/drive/folders/1qQuLoEB6SYtZSqAtHzARUNReY_G2mLXl'
}));
export const impact = [ // Season 5 only, dossier p4; never cumulative totals.
  [42200000,'đồng gây quỹ'],[35,'thành viên'],[30,'người thụ hưởng'],[5,'nguồn lực đồng hành']
];
// About intro stats (UI-006): cumulative across seasons. The KOL/KOC count is illustrative until POET confirms it.
export const reach = [
  {value:300, suffix:'K+', title:'Lượt tiếp cận',     text:'trên mạng xã hội',   tone:'coral'},
  {value:60,  suffix:'K+', title:'Lượt tương tác',    text:'từ cộng đồng',       tone:'green'},
  {value:20,  suffix:'+',  title:'KOL/KOC đồng hành', text:'cùng lan toả dự án', tone:'blue'} // TODO: số minh hoạ, thay bằng số thật từ POET
];

// About “Sứ mệnh của POET”: card copy approved in the ABOUT-002 brief/prototype; photos user-supplied (ASSET_STATUS.md).
export const mission = {
  title:'Sứ mệnh của POET',
  items:[
    {number:'01',audience:'Cho các em',tone:'coral',title:'Học đủ đầy, cả vật chất lẫn tinh thần',points:['Sửa chữa, bổ sung cơ sở vật chất thiết yếu cho trường','Tặng dụng cụ học tập, xe đạp cho học sinh khó khăn','Hoạt động “học là chơi, chơi là học” để các em vui và hiểu mình hơn'],image:'mission-children',position:'50% 38%',alt:'Các em nhỏ cười, giơ tay hình chữ V trong một hoạt động của POET.'},
    {number:'02',audience:'Cho tình nguyện viên',tone:'green',title:'Sân chơi để học hỏi và lớn lên',text:'Được định hướng rõ, giao việc đúng thế mạnh và đủ nguồn lực, để vừa làm tốt vừa học thêm qua mỗi chuyến đi.',image:'mission-volunteers',position:'50% 50%',alt:'Tay các tình nguyện viên POET cùng cầm những tấm thiệp giấy kraft vẽ tay trên bàn.'},
    {number:'03',audience:'Cho cộng đồng',tone:'blue',title:'Lan toả giá trị tích cực',text:'Chỉn chu, công khai, minh bạch và kết nối mọi người cùng góp sức.',image:'mission-community',position:'50% 30%',alt:'Ảnh tập thể thành viên POET mặc áo “(dân) YOUNG (chơi) JOY”, cùng làm hình trái tim bằng tay.'}
  ]
};

export const media = [ // Original titles/dates from the URLs explicitly supplied by Flow.
  {publication:'Tiền Phong',date:'2022-07-19',title:'Bạn trẻ gấp sao, hưởng ứng đêm nhạc ‘chữa lành’ gây quỹ thiện nguyện',description:'Bài viết về đêm nhạc “Vết Nứt” và hoạt động gấp sao gây quỹ của POET.',url:'https://tienphong.vn/ban-tre-gap-sao-huong-ung-dem-nhac-chua-lanh-gay-quy-thien-nguyen-post1454826.tpo'},
  {publication:'Tiền Phong',date:'2022-12-17',title:'Sáng tạo để lan tỏa nhiệt huyết tận hiến',description:'Câu chuyện về cách các bạn trẻ thiết kế những hoạt động cộng đồng, trong đó có POET.',url:'https://tienphong.vn/sang-tao-de-lan-toa-nhiet-huyet-tan-hien-post1494246.tpo'},
  {publication:'Hoa Học Trò',date:'2022-12-13',title:'Những “thủ lĩnh” Gen Z năng nổ sáng tạo hoạt động Đoàn, lan tỏa nhiệt huyết tận hiến',description:'Góc nhìn về các dự án thiện nguyện do người trẻ khởi xướng và phát triển.',url:'https://hoahoctro.tienphong.vn/nhung-thu-linh-gen-z-nang-no-sang-tao-hoat-dong-doan-lan-toa-nhiet-huyet-tan-hien-post1494482.tpo'}
];
export const pressLogos = [
  {name:'Hoa Học Trò',image:'press/hoa-hoc-tro.png',width:172,height:111,displayWidth:56,href:media[2].url},
  {name:'Báo Tiền Phong',image:'press/tien-phong.png',width:390,height:83,displayWidth:108,href:media[0].url}
];
export const contacts = {email:'poet.npo@gmail.com',people:[
  {name:'Đỗ Hoài Phương',role:'Chủ nhiệm Câu lạc bộ',phone:'0903872278'},
  {name:'Lê Phương Minh',role:'Trưởng Ban Đối ngoại',phone:'0815852427'}
]};
export const socials = [
  ['Facebook','https://www.facebook.com/poetorganization'],['Instagram','https://www.instagram.com/poet.npo/'],
  ['Threads','https://www.threads.com/@poet.npo'],['TikTok','https://www.tiktok.com/@poet.npo']
];
// Incremental benefits, not a claim that any KOC/brand has already committed.
// Dossier pp13–20, reconciled with the benefits URL explicitly selected by Flow.
// Explicit terms in that higher-priority reference override differing dossier rows.
// Neither source establishes an actual KOC/brand commitment. Updated PDF is pending.
export const tiers = [
  {amount:1,name:'BABY STEP',tagline:'Bước đầu tiên để thương hiệu có mặt trong hành trình.',booth:null,popTickets:0,tripTickets:0,phases:[
    ['Bài công bố chung sự tham gia của Little Joy trên Facebook và Instagram theo từng tuần.','Sử dụng ảnh tiền trạm trong 12 tháng, theo phạm vi hai bên thống nhất.','Cập nhật tiến độ gây quỹ và quyền lợi.'],
    ['Phát voucher của Little Joy kèm vé tham dự Pop Up.'],
    ['Chứng nhận đồng hành sau khi hoàn tất nghĩa vụ.','Ưu tiên đối tác CSR và ưu đãi gói đồng hành chương trình tiếp theo.','Cơ hội đồng sáng tạo hoạt động cộng đồng cùng POET.']]},
  {amount:3,name:'SPARK',tagline:'Có mặt tại Pop Up và trong bài recap chung.',booth:null,popTickets:1,tripTickets:0,phases:[['Được nhắc trong bình luận các bài cập nhật cột mốc 30, 50 và 100 triệu đồng.'],['1 vé tham dự Pop Up miễn phí.','Xuất hiện trong bài recap chung Pop Up trên Facebook và Instagram.','Sử dụng bộ ảnh Pop Up trong 12 tháng từ khi nhận, theo phạm vi thống nhất.'],[]]},
  {amount:5,name:'GROW',tagline:'Có quầy hàng riêng và video giới thiệu sản phẩm.',booth:'5m²',popTickets:1,tripTickets:0,phases:[['1 video UGC 20–30 giây do team POET thực hiện, đăng trên kênh Creator team POET.'],['Không gian quầy hàng 5 m².','Xuất hiện 5 giây trong video recap Pop Up chung.'],[]]},
  {amount:10,name:'RISE',tagline:'Bài công bố riêng và bộ nội dung sản phẩm đầy đủ hơn.',booth:'5m²',popTickets:2,tripTickets:0,phases:[['Bài công bố riêng trên Facebook và Instagram; 1 bài giới thiệu nổi bật trên Facebook POET.','1 video TikTok 30 giây có nhắc đến Little Joy.','3 video unboxing túi quà của Creator POET, đăng trên kênh Creator.','Bộ 10 ảnh sản phẩm và trải nghiệm; địa điểm chụp trong TP. Hồ Chí Minh.'],['Tổng 2 vé Pop Up; logo bằng 1/5 logo POET trên ấn phẩm tại sự kiện.','1 video UGC dưới 30 giây trên kênh Creator team POET.'],['Xuất hiện trong bài recap chung chuyến đi trên Facebook và Instagram POET.']]},
  {amount:15,name:'SHINE',tagline:'Thêm unboxing trên kênh POET và quyền dùng ảnh chuyến đi.',booth:'5m²',popTickets:2,tripTickets:0,phases:[['1 video POET unboxing túi quà, đăng trên kênh POET.'],['Tổng 10 giây trong video recap Pop Up chung.','1 story nhắc Little Joy chung trên Instagram POET.'],['Sử dụng ảnh và video chuyến đi trong 12 tháng từ khi nhận, theo phạm vi thống nhất.']]},
  {amount:20,name:'TURNING POINT',tagline:'Bắt đầu có KOC và bài recap riêng sau chuyến đi.',booth:'5m²',popTickets:2,tripTickets:0,phases:[['1 video dưới 60 giây do KOC thực hiện và đăng trên kênh KOC.','Tổng 3 video lồng ghép sản phẩm, 20–30 giây/video, trên kênh Creator team POET.'],['1 story riêng trên Instagram POET.'],['1 bài recap riêng chuyến đi trên Facebook và Instagram POET.']]},
  {amount:25,name:'THRIVE',tagline:'Quầy rộng hơn, logo lớn hơn, recap Pop Up riêng.',booth:'8m²',popTickets:3,tripTickets:0,phases:[['Tổng 2 video TikTok 30 giây có nhắc đến Little Joy.'],['Quầy hàng 8 m²; tổng 3 vé tham dự Pop Up.','Logo bằng 1/2 logo POET trên ấn phẩm sự kiện.','1 bài recap Pop Up riêng trên Instagram và 1 video recap Little Joy 30 giây.'],['Xuất hiện 5 giây trong video recap chuyến đi.']]},
  {amount:30,name:'SPREAD',tagline:'Đại diện thương hiệu cùng lên đường trao quà.',booth:'8m²',popTickets:3,tripTickets:1,phases:[['Tổng 2 video do KOC thực hiện và đăng trên kênh KOC.'],['Ưu tiên lựa chọn vị trí quầy; tổng 2 story riêng.','Thêm 1 video UGC dưới 30 giây trên kênh Creator team POET.'],['1 vé tham gia chuyến đi, gồm ăn uống, di chuyển và ở.','Đại diện chia sẻ 2 phút và tham gia trao tặng, bàn giao.','1 story riêng chuyến đi; bộ 10 ảnh thương hiệu tại chuyến đi.']]},
  {amount:35,name:'AMPLIFY',tagline:'Khuếch đại trải nghiệm trực tiếp và thêm một người cùng lên đường.',booth:'8m²',popTickets:3,tripTickets:2,phases:[[],[],['Tổng 2 vé tham gia chuyến đi, gồm ăn uống, di chuyển và ở.']]},
  {amount:40,name:'TRIUMPH',tagline:'Độc quyền ngành hàng và hiện diện đầy đủ nhất.',booth:'8m²',popTickets:4,tripTickets:3,phases:[['Tổng 3 video TikTok POET; tổng 5 video KOC.','Tổng 5 video lồng ghép sản phẩm trên kênh Creator team POET.'],['Ưu tiên độc quyền ngành hàng.','Hỗ trợ quầy tiêu chuẩn với ngân sách dưới 1 triệu đồng; phần thiết kế riêng ngoài phạm vi hỗ trợ do thương hiệu chi trả.','Tổng 4 vé Pop Up; logo bằng kích thước logo POET.','Tổng 3 story riêng; thêm 3 video Pop Up trên kênh Creator team POET.'],['Tổng 3 vé chuyến đi, gồm ăn uống, di chuyển và ở.','Cơ hội người thụ hưởng trải nghiệm sản phẩm trong chương trình.','1 video recap riêng Little Joy.']]}
];
// Partner page, tier section (UI-012)
export const tierIntro = {
  eyebrow: 'Mức đồng hành Little Joy',
  title: 'Hành trình niềm vui<br><span>bắt đầu.</span>',
  text: 'Hành trình đồng hành linh hoạt với <b>10 cột mốc từ 1.000.000 đến 40.000.000 VNĐ</b>.',
  phases: [
    ['01 / Trước sự kiện', 'Lan toả trên mạng xã hội'],
    ['02 / Pop Up · 20–22.12.2026', 'Chạm nhau ngoài đời'],
    ['03 / Chuyến đi · ' + season.trip.replace(/\//g, '.'), 'Để niềm vui đi xa']
  ]
};
// Quyền lợi cũ được một mốc cao hơn thay thế (vd 1 vé → tổng 2 vé), để danh sách cộng dồn không mâu thuẫn.
// Key: "chỉ số mốc.chỉ số chặng.chỉ số dòng" trong tiers. Value: chỉ số mốc thay thế.
export const tierReplaced = {
  '1.1.0':3, '2.1.0':6, '2.1.1':4, '3.1.0':6, '3.0.1':6, '3.2.0':5, '5.0.0':7, '5.1.0':7,
  '6.0.0':9, '7.0.0':9, '5.0.1':9, '6.1.0':9, '6.1.1':9, '7.2.0':8, '8.2.0':9
};
// Partner page, sponsor panel + contact (UI-013)
export const sponsorIntro = {
  eyebrow: 'Nhà tài trợ',
  title: 'Cùng tạo điều kiện<br><span>cho những giờ ra chơi.</span>',
  text: 'Hỗ trợ hiện kim hoặc nguồn lực thiết thực cho Công viên niềm vui. POET trao đổi từng đề xuất theo nhu cầu điểm trường và khả năng của đơn vị.',
  cash: { title: 'Tài trợ hiện kim', text: 'Góp sức cho dự toán Mùa 6: vật phẩm học tập, đồng phục, góc trò chơi và hoạt động tại trường.', figureLabel: 'Dự toán Mùa 6' },
  kind: { title: 'Tài trợ hiện vật', text: 'Những nhu cầu đang có trong kế hoạch của điểm trường:', items: ['Quạt treo tường', 'Xe đạp', 'Dụng cụ học tập', 'Vở', 'Áo đồng phục', 'Góc trò chơi'] },
  cta: 'Trao đổi cơ hội tài trợ',
  stepsTitle: 'Bắt đầu như thế nào?',
  steps: [
    ['Chia sẻ đề xuất', 'Nguồn lực, ngân sách hoặc ý tưởng của đơn vị.'],
    ['Cùng đối chiếu', 'POET đối chiếu nhu cầu điểm trường, thống nhất phạm vi và cách tiếp nhận.'],
    ['Ghi nhận & tổng kết', 'Thống nhất cách cập nhật, ghi nhận và tổng kết phù hợp.']
  ],
  note: 'Hình thức ghi nhận, quyền lợi và quy trình cụ thể được hai bên xác nhận trước khi thực hiện.'
};
export const contactIntro = {
  eyebrow: 'Liên hệ trực tiếp',
  title: 'Đồng hành <span>cùng POET</span>',
  text: 'Chia sẻ ý tưởng, sản phẩm hoặc cách bạn muốn đồng hành. Ban Đối ngoại sẽ phản hồi và cùng bạn chọn phương án phù hợp.',
  formTitle: 'Gửi lời nhắn kết nối',
  formText: 'Xem lại bản nháp trước khi gửi. POET chỉ nhận khi bạn chủ động gửi email.',
  privacy: 'Thông tin chỉ dùng để soạn email trên máy bạn, không được lưu lại.'
};
// UI-022 (projects): "Chọn cách bạn cùng POET gieo mầm". Individual cards reuse individualWays; business and volunteer cards are below.
export const projectWays = {
  eyebrow: 'Mỗi hành động đều có ý nghĩa',
  // Non-breaking space keeps “cười” from ending up alone on the last line.
  title: 'Cùng POET viết tiếp câu chuyện trao nụ cười',
  business: [
    {icon: 'store', title: 'Thương hiệu đồng hành',
     text: 'Trở thành một “Little Joy” trong chiến dịch Big Joy Little Joy: góp một phần doanh thu sản phẩm để cùng xây Công viên Niềm vui.',
     cta: 'Tìm hiểu Big Joy Little Joy', href: 'dong-hanh/#doanh-nghiep'},
    {icon: 'handshake', title: 'Nhà tài trợ',
     text: 'Hỗ trợ hiện kim hoặc nguồn lực thiết thực cho Công viên Niềm vui. POET trao đổi từng đề xuất theo nhu cầu điểm trường và khả năng của đơn vị.',
     cta: 'Trao đổi cơ hội tài trợ', href: 'dong-hanh/#doanh-nghiep'}
  ],
  volunteer: [
    {icon: 'megaphone', status: 'Hẹn bạn mùa sau', title: 'Tuyển quân Mùa 7',
     text: 'Đơn tuyển tình nguyện viên Mùa 6 đã đóng. Theo dõi Facebook POET để nhận thông tin tuyển quân Mùa 7 sớm nhất nha!',
     cta: 'Theo dõi Facebook POET', href: 'social:facebook'}
  ]
};
// UI-023 (projects): "Một khoảng sân" story. Text is Demi's copy; [brackets] mark the highlighted phrase (rendered as <mark>).
export const projectStory = {
  title: ['Một khoảng sân.', 'Để niềm vui có chỗ lớn lên.'],
  place: `${season.school} · ${season.location}`,
  hero: {id: 'du-an-hero', alt: 'Các em học sinh cười đùa cùng nhau trên sân trường.'},
  heroDone: {id: 'du-an-da-hoan-thanh'},
  steps: [
    {photo: 'story-ngoai-cua-lop', alt: 'Cặp sách và áo các em để ngoài cửa lớp của điểm trường.', crop: 'c0',
     text: 'Ở điểm trường Ea Kiết, ngoài cửa lớp…'},
    {photo: 'story-thiet-bi-hu', alt: 'Bộ thiết bị vui chơi cũ trên khoảng sân đất của điểm trường.', crop: 'c0', hl: 'coral',
     text: '…khoảng sân vẫn [lầy trơn mỗi mùa mưa], những thiết bị vui chơi đã hư hỏng.'},
    {photo: 'cau-truot-mua-6', alt: 'Các em nhỏ cười trong ống chui của cầu trượt.', crop: 'c3', hl: 'yellow', long: true,
     text: 'POET muốn góp tiếp một phần nhỏ vào câu chuyện ấy: [một khoảng sân an toàn hơn], để sau tiếng trống tan tiết, các em được chạy nhảy, được chơi cùng bạn.'},
    {photo: 'story-lon-len', alt: 'Hai em nhỏ chơi cùng nhau giữa giờ ra chơi.', crop: 'c0', hl: 'mint', long: true,
     text: 'Bởi có những điều lớn lên trong giờ học và cũng có những điều [lớn lên khi một đứa trẻ được vui chơi].'}
  ]
};
// UI-024 (projects): detail pages of the two completed Mùa 5 projects. Keyed by the project id; photos are provisional until Demi sends the right ones. Copy is Demi's, unedited.
export const projectDetails = {
  'vet-nut': {
    meta: {place: 'TP. Hồ Chí Minh', date: '16.07.2022'},
    hero: {photo: 'vn-hero', pos: '50% 40%'},
    lead: 'Với sự tham gia của 120 khán giả và 5 nhà tài trợ, chương trình đã thành công lan tỏa thông điệp tích cực về sức khỏe tinh thần đến cộng đồng, đêm nhạc cũng đã tạo nên một sân chơi để các nghệ sĩ trẻ thể hiện đam mê âm nhạc của mình. Ý nghĩa hơn cả, đây còn là hoạt động gây quỹ cho Dự án cải thiện chất lượng học tập tại Trường tiểu học Mỹ Thạnh Bắc (Đức Huệ, Long An).',
    stats: [
      {value: '120', label: 'khán giả', tone: 'coral'},
      {value: '5', label: 'nhà tài trợ', tone: 'yellow'},
      {value: '2 tháng', label: 'chuẩn bị', tone: 'green'},
      {value: '30tr+', label: 'từ nhà hảo tâm', tone: 'blue'}
    ],
    quote: {
      photo: 'vn-quote',
      text: '…dùng âm nhạc để chạm tới đứa trẻ bên trong của mỗi người, đặc biệt là những bạn trẻ ở độ tuổi vừa trưởng thành với nhiều tâm sự khó giãi bày.',
      name: 'Lê Phương Minh',
      role: 'Trưởng Ban tổ chức đêm nhạc, giải thích cho chủ đề “Vết Nứt”'
    },
    steps: [
      {when: '2 tháng chuẩn bị', photo: 'vn-khan-gia',
       text: '“Vết Nứt” là đêm nhạc gây quỹ diễn ra trong khuôn khổ của POET 2022. Sau 2 tháng dày công chuẩn bị, từ khâu liên hệ nhà tài trợ tới thuê địa điểm và lên bài truyền thông, “Vết Nứt” đã thành công diễn ra vào ngày 16/07/2022.'},
      {when: 'Trên sân khấu', photo: 'vn-san-khau',
       text: 'Đêm nhạc có sự xuất hiện của các nghệ sĩ trẻ, với phong cách đa dạng như Nguyên Đán, Helen, Minh Trung, Nhữ Thùy Dương,... Ngoài ra, còn có sự góp mặt của nghệ sĩ Mer, tác giả của bài hát mang giai điệu vui tươi “Giấc mơ rất thơ”.',
       chips: ['Nguyên Đán', 'Helen', 'Minh Trung', 'Nhữ Thùy Dương', 'Mer'], chipIcon: 'music'},
      {when: 'Những ngôi sao giấy', photo: 'vn-ngoi-sao',
       text: 'Cũng trong khuôn khổ của “Vết Nứt”, các bạn khán giả đã cùng nhau tham gia hoạt động xếp sao giấy. Những ngôi sao sau khi xếp xong, sẽ được bỏ ngay ngắn vào trong một hũ thuỷ tinh, và được chuyển đến tận tay các em nhỏ trong chuyến đi cuối của dự án.'},
      {when: 'Về tới điểm trường', photo: '3348058578846830',
       text: 'Toàn bộ lợi nhuận của đêm nhạc cùng với số tiền hơn 30 triệu đồng nhận được từ các nhà hảo tâm đã được dùng vào Dự án cải thiện điều kiện học tập của em ở trường tiểu học Mỹ Thạnh Bắc (Đức Huệ, Long An).'}
    ],
    gallery: ['3348058835513471', '3348058678846820', '3348058328846855', '3348058605513494', '3348057892180232'],
    hideGallery: true, // tạm ẩn phần Khoảnh khắc theo yêu cầu của chị Demi
    next: 'go-ngai'
  },
  'go-ngai': {
    meta: {place: 'Mỹ Thạnh Bắc, Long An', date: '25 – 26.07.2022'},
    tagline: '“Mùa Hè Yêu Thương”',
    hero: {photo: 'mtb-hero', pos: '50% 50%'},
    lead: 'POET đã có cơ hội trao tặng 30 suất đồ dùng học tập, 10 suất học bổng, 5 xe đạp, 3 quạt treo tường và 3 tủ nhôm đựng tài liệu cho 3 lớp học tại điểm trường. Bên cạnh đó, POET còn tổ chức hoạt động vui chơi chạy trạm với chủ đề bảo vệ môi trường nhằm giúp đỡ các em học sinh có thêm những kiến thức bổ ích trong cuộc sống.',
    stats: null,
    steps: [
      {when: '25 – 26.07.2022', photo: 'mtb-1',
       text: 'Từ 25 – 26/07/2022, POET đã thành công tổ chức chặng cuối cùng của Dự án cải thiện điều kiện học tập của em ở trường tiểu học Mỹ Thạnh Bắc (Đức Huệ, Long An), mang tên “Mùa Hè Yêu Thương”.'},
      {when: 'Từ đâu có quỹ', photo: 'mtb-2',
       text: 'Dự án được hiện thực hóa thông qua hai hình thức gây quỹ chính là 1. Dự án Quyên góp – “Thư viện bỏ hoang”, và 2. Đêm nhạc “Vết Nứt”, cùng với hiện kim từ nhà tài trợ chương trình.'},
      {when: 'Cùng thầy cô', photo: 'mtb-3',
       text: 'Bên cạnh đó, những đóng góp thiết thực của tập thể giáo viên tại điểm trường tiểu học Mỹ Thạnh Bắc đã giúp POET 2022 hoàn thành tốt nhất những mục tiêu được đề ra.'},
      {when: 'Quà đến tay các em', photo: 'mtb-4',
       text: 'Các vật phẩm được trao đến cho các em học sinh bao gồm:',
       chips: ['Sách vở và tập trắng', 'Dụng cụ học tập (bút màu, thước kẻ,…)', 'Tủ sách', 'Học bổng và xe đạp dành cho các em có hoàn cảnh đặc biệt khó khăn'], chipIcon: 'check'},
      {when: 'Chạy trạm', photo: 'mtb-5',
       text: 'POET còn tổ chức hoạt động vui chơi chạy trạm với chủ đề bảo vệ môi trường nhằm giúp đỡ các em học sinh có thêm những kiến thức bổ ích trong cuộc sống.'}
    ],
    gallery: ['mtb-g1', 'mtb-g2', 'mtb-g3', 'mtb-g4', 'mtb-g5', 'mtb-g6', 'mtb-g7', 'mtb-g8'],
    next: 'vet-nut'
  }
};
// Partner page, individual tab (UI-008)
export const individualWays = {
  title: 'Góp một phần,<br>theo cách của bạn.',
  open: {
    icon: 'qr-code',
    title: 'Chuyển khoản trực tiếp qua VietQR',
    text: 'Ủng hộ tự nguyện, tuỳ tâm vào số tài khoản thiện nguyện chính thức của CLB.',
    checks: ['Mọi đóng góp đều có sao kê để đối chiếu', 'Quét mã bằng app ngân hàng, không cần tạo tài khoản'],
    cta: 'Nhận mã QR chuyển khoản',
    note: 'Từ 10.000 đ'
  },
  soon: [
    {id:'pop-up',     icon:'ticket',       tone:'yellow', status:'Sắp mở bán vé',   title:'Vé tham dự Big Joy Pop Up',  text:'Hội chợ cộng đồng, nơi các thương hiệu đồng hành mang sản phẩm đến giao lưu. Tiền vé góp vào quỹ chương trình.', cta:'Mua vé Big Joy Pop Up'},
    {id:'collection', icon:'shopping-bag', tone:'blue',   status:'Sắp được bật mí', title:'Merch Young Joy Collection', text:'Bộ sưu tập merch của POET. Toàn bộ doanh thu góp vào quỹ chung.', cta:'Mua merch, góp vào quỹ'}
  ]
};
// Partner page, message wall (UI-009)
export const messageWall = {
  eyebrow: 'Những lời nhắn gửi',
  title: 'Tường lời nhắn yêu thương',
  sub: 'Nơi những câu chuyện được lan toả, niềm vui được sẻ chia.',
  boardSign: 'POET Community',
  writeCta: 'Viết lời nhắn', closeCta: 'Đóng khung viết',
  formTitle: 'Viết lời nhắn lên giấy nhắn POET',
  sendCta: 'Dán lên tường',
  formNote: 'Lời nhắn sẽ được POET xem qua trước khi hiện trên tường. Vui lòng không ghi số điện thoại, địa chỉ cụ thể.',
  searchPlaceholder: 'Tìm theo tên…',
  sortNew: 'Mới nhất', sortAmount: 'Ủng hộ nhiều nhất',
  empty: 'Chưa có lời nhắn công khai. Bạn có thể gửi lời nhắn cùng lượt ủng hộ của mình.',
  noMatch: 'Chưa thấy lời nhắn nào khớp tên này.',
  loadError: 'Chưa tải được tường lời nhắn. Bạn thử lại nhé.',
  soonNote: 'Tính năng gửi lời nhắn tự do sắp mở. Bạn có thể gửi lời nhắn kèm lượt ủng hộ ở mục phía trên nhé.',
  soonLink: 'Tới mục ủng hộ',
  // Order matters: saved notes pick a paper and icon by hash index.
  papers: [['yellow','Giấy vàng'],['mint','Giấy xanh bạc hà'],['peach','Giấy cam đào'],['blue','Giấy xanh dương'],['pink','Giấy hồng']],
  // Hand-drawn Công viên Niềm vui icons, assets/icons/hand-drawn/<id>.webp
  glyphs: [['xe-rua','Xe rùa'],['cap-sach','Cặp sách'],['cau-tuot','Cầu tuột'],['dep-lao','Dép lào']]
};
// Free-form wall notes have no backend yet (UI-009); false removes the composer from the page.
export const WALL_COMPOSER_ENABLED = true;
// Partner page, business tab intro (UI-010)
export const businessIntro = {
  eyebrow: 'Doanh nghiệp cùng POET · Mùa 6',
  title: 'Chiến dịch gây quỹ<br>Big Joy Little Joy',
  text: 'Thương hiệu và doanh nghiệp có thể đồng hành cùng POET theo hai cách: trở thành <b>Thương hiệu đồng hành</b> (Little Joy) góp một phần doanh thu, hoặc <b>Nhà tài trợ</b> cho chương trình.',
  quote: 'Vì POET tin rằng, những niềm vui nhỏ khi được trao đi cùng nhau, sẽ trở thành một niềm vui thật lớn.',
  switchLabel: 'Chọn hình thức:'
};
