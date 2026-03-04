(() => {
  "use strict";

  const APP_CONFIG = window.__AID_APP_CONFIG__ && typeof window.__AID_APP_CONFIG__ === "object" ? window.__AID_APP_CONFIG__ : {};
  const cloudStore = window.aidCloudStore && typeof window.aidCloudStore === "object" ? window.aidCloudStore : null;
  const ROUTES = ["projects", "company", "search", "partners", "contact", "inquiry", "admin"];
  const STORAGE_KEYS = {
    listings: "aid_listings_v2",
    inquiries: "aid_inquiries_v2",
    siteSettings: "aid_site_settings_v1",
    analytics: "aid_analytics_v1",
    theme: "aid_theme_v1",
    language: "aid_language_v1"
  };
  const SESSION_KEYS = {
    adminAuth: "aid_admin_auth_v1",
    adminSecret: "aid_admin_secret_v1"
  };
  const PROJECT_WHEEL_THRESHOLD = 320;
  const PROJECT_WHEEL_DAMPING = 0.58;
  const ADMIN_PASSWORD = String(APP_CONFIG.adminPassword || "aidadmin");
  const INQUIRY_STAGES = ["new", "contacted", "meeting", "active", "closed", "hold"];
  const INQUIRY_STAGE_LABELS = {
    new: "신규",
    contacted: "1차 연락",
    meeting: "미팅 예정",
    active: "진행 중",
    closed: "계약 완료",
    hold: "보류"
  };

  // Set this for production alert integration.
  const ALERT_WEBHOOK_URL = String(APP_CONFIG.alertWebhookUrl || "");

  const number = new Intl.NumberFormat("en-US");
  const DEFAULT_SITE_SETTINGS = {
    logoText: "AID",
    logoImage: ""
  };
  const DEFAULT_ANALYTICS = {
    events: []
  };
  const DEFAULT_THEME = {
    tone: "white",
    bg: "#ffffff",
    glowRgb: "255, 255, 255"
  };
  const LAMP_THEMES = [
    { tone: "white", bg: "#ffffff", glowRgb: "255, 255, 255" },
    { tone: "cloud", bg: "#eceae5", glowRgb: "236, 234, 229" },
    { tone: "sand", bg: "#e9e2d4", glowRgb: "233, 226, 212" },
    { tone: "sage", bg: "#e2e7df", glowRgb: "226, 231, 223" },
    { tone: "mist", bg: "#e3e8ef", glowRgb: "227, 232, 239" },
    { tone: "rose", bg: "#ece3df", glowRgb: "236, 227, 223" }
  ];
  const LANGUAGE_LIST = ["ko", "en", "jp", "ch"];
  const LANGUAGE_META = {
    ko: { code: "KO", htmlLang: "ko" },
    en: { code: "EN", htmlLang: "en" },
    jp: { code: "JP", htmlLang: "ja" },
    ch: { code: "CH", htmlLang: "zh" }
  };
  const STATIC_NAV_LABELS = {
    projects: "HOME",
    company: "COMPANY",
    search: "SEARCH",
    partners: "PARTNERS",
    contact: "LOCATION"
  };
  const STATIC_HERO_TITLE = "Where visibility becomes value";
  const I18N = {
    ko: {
      nav: { projects: "HOME", company: "COMPANY", search: "SEARCH", partners: "PARTNERS", contact: "LOCATION" },
      ui: { languageMenu: "언어 선택", admin: "관리자" },
      hero: { title: "Where visibility becomes value", tagline: "공간의 인상을 설계하고 브랜드의 가치를 높입니다." },
      project: { viewDetail: "VIEW DETAIL", parking: "Parking" },
      company: {
        eyebrow: "회사 소개",
        title: "단순 중개가 아닌 공간 전략을 설계합니다.",
        copy: "AID는 브랜드에 맞는 입지를 찾고, 사옥 개발 전략을 설계하며, 인플루언서 기반 자산 운영 모델까지 연결합니다.",
        bullets: ["브랜드 가시성 중심의 입지 기획", "사옥 개발 및 운영 모델 설계", "인플루언서/IP 기반 공간 자산 관리"],
        signEyebrow: "대표 서명",
        signBox: "서명",
        meta: [
          "<strong>회사명</strong>부동산 중개법인 에이드청담",
          "<strong>대표자</strong>홍길동",
          "<strong>주소</strong>서울 강남구 강남대로 126길 76, 1~3층",
          "<strong>대표번호</strong>02-0000-0000",
          "<strong>사업자번호</strong>000-00-00000"
        ],
        socials: ["인스타그램", "유튜브"]
      },
      search: {
        eyebrow: "매물 검색",
        title: "조건 기반 매물 검색",
        typeLabel: "매물 유형",
        types: ["오피스", "리테일", "주거", "빌딩"],
        filters: ["지역", "카테고리", "최소 면적 (m²)", "최대 면적 (m²)", "최대 보증금 (백만원)", "최대 월세 (백만원)", "최대 권리금 (백만원)", "최소 층수", "최소 주차대수", "정렬"],
        categoryPlaceholder: "뷰티, F&B",
        sort: { new: "최신순", monthlyAsc: "월세 낮은순", depositAsc: "보증금 낮은순", areaDesc: "면적 큰순" },
        apply: "필터 적용",
        reset: "초기화",
        modes: { list: "목록", map: "지도" },
        emptyTitle: "현재 조건에 맞는 매물이 없습니다.",
        emptyDesc: "조건을 완화하거나 오프마켓 추천을 요청해보세요.",
        emptyCta: "추천 요청하기",
        result: "{count}개 결과"
      },
      partners: { eyebrow: "파트너", title: "파트너사 전용 소개 영역입니다.", slots: ["파트너 슬롯 01", "파트너 슬롯 02", "파트너 슬롯 03", "파트너 슬롯 04"] },
      location: {
        eyebrow: "위치",
        title: "AID 본사 위치 안내",
        officeTitle: "본사",
        lines: ["부동산 중개법인 에이드청담", "서울 강남구 강남대로 126길 76, 1~3층", "02-0000-0000"],
        transitTitle: "방문 안내",
        transits: ["지하철 2호선 역삼역 3번 출구 도보 5분", "방문 주차는 사전 예약 시 가능합니다", "운영시간: 평일 09:30-18:30 (KST)"],
        mapLink: "지도에서 보기",
        mapTitle: "AID 본사 위치"
      },
      contact: {
        eyebrow: "문의",
        title: "문의 접수",
        fields: ["문의 유형", "이름", "연락처", "이메일", "문의 내용"],
        inquiryOptions: ["선택", "입지 컨설팅", "사옥 개발", "자산 운영", "매물 문의"],
        consent: "문의 응답을 위한 개인정보 수집 및 이용에 동의합니다.",
        submit: "문의 접수",
        call: "전화 문의",
        status: "문의가 접수되면 관리자 페이지에서 즉시 확인할 수 있습니다.",
        checklistTitle: "운영 체크리스트",
        checklist: ["관리자 페이지에서 매물 등록 및 수정", "문의 데이터 저장 및 웹훅 연동", "모바일 대응 레이아웃", "기본 SEO 메타 태그 적용", "과도한 애니메이션 배제"],
        submitOkWebhook: "문의가 접수되었고 웹훅 알림이 전송되었습니다.",
        submitOkLocal: "문의가 접수되었습니다. 현재는 로컬에 저장되며, 웹훅 URL 설정 시 외부 알림이 전송됩니다."
      },
      misc: {
        allRegions: "전체 지역",
        noListingData: "등록된 매물이 없습니다.",
        openDetailAria: "{title} 상세 열기",
        deposit: "보증금",
        monthly: "월세",
        premium: "권리금",
        area: "면적",
        parking: "주차",
        detailEyebrow: "상세 정보",
        detail: { region: "지역", address: "주소", type: "유형", area: "면적", terms: "조건", floorParking: "층/주차" },
        cta: { call: "전화 문의", form: "온라인 문의" }
      },
      footer: {
        company: "부동산 중개법인 에이드청담",
        address: "서울 강남구 강남대로 126길 76, 1~3층",
        phone: "02-0000-0000",
        admin: "ADMIN"
      }
    },
    en: {
      nav: { projects: "HOME", company: "COMPANY", search: "SEARCH", partners: "PARTNERS", contact: "LOCATION" },
      ui: { languageMenu: "Language", admin: "ADMIN" },
      hero: { title: "Where visibility becomes value", tagline: "We design the impression of space and elevate brand value." },
      project: { viewDetail: "VIEW DETAIL", parking: "Parking" },
      company: {
        eyebrow: "COMPANY",
        title: "A space strategy company beyond brokerage.",
        copy: "AID finds brand-fit locations, designs headquarters development strategy, and links influencer-based asset operations.",
        bullets: ["Visibility-led location planning", "Headquarters development and operation modeling", "Influencer/IP-based space asset management"],
        signEyebrow: "CEO Signature",
        signBox: "Signature",
        meta: [
          "<strong>Company</strong>부동산 중개법인 에이드청담",
          "<strong>Representative</strong>Hong Gil-dong",
          "<strong>Address</strong>1-3F, 76, Gangnam-daero 126-gil, Gangnam-gu, Seoul",
          "<strong>Phone</strong>02-0000-0000",
          "<strong>Business No.</strong>000-00-00000"
        ],
        socials: ["Instagram", "YouTube"]
      },
      search: {
        eyebrow: "SEARCH",
        title: "Filter-based listing search",
        typeLabel: "Property Type",
        types: ["Office", "Retail", "Residential", "Building"],
        filters: ["Region", "Category", "Area Min (m²)", "Area Max (m²)", "Deposit Max (M KRW)", "Monthly Max (M KRW)", "Premium Max (M KRW)", "Floor Min", "Parking Min", "Sort"],
        categoryPlaceholder: "Beauty, F&B",
        sort: { new: "Newest", monthlyAsc: "Monthly Low", depositAsc: "Deposit Low", areaDesc: "Area Large" },
        apply: "Apply Filter",
        reset: "Reset",
        modes: { list: "List", map: "Map" },
        emptyTitle: "No listing matched your conditions.",
        emptyDesc: "Try wider ranges or request off-market recommendations.",
        emptyCta: "Request Recommendation",
        result: "{count} results"
      },
      partners: { eyebrow: "PARTNERS", title: "Reserved area for partner assets.", slots: ["Partner Slot 01", "Partner Slot 02", "Partner Slot 03", "Partner Slot 04"] },
      location: {
        eyebrow: "LOCATION",
        title: "AID Office Location",
        officeTitle: "Head Office",
        lines: ["부동산 중개법인 에이드청담", "1-3F, 76, Gangnam-daero 126-gil, Gangnam-gu, Seoul", "02-0000-0000"],
        transitTitle: "How to Reach",
        transits: ["5 min walk from Yeoksam Station, Exit 3", "Visitor parking available upon reservation", "Hours: Mon-Fri 09:30-18:30 (KST)"],
        mapLink: "Open in map",
        mapTitle: "AID Office Map"
      },
      contact: {
        eyebrow: "CONTACT",
        title: "Inquiry",
        fields: ["Inquiry Type", "Name", "Phone", "Email", "Message"],
        inquiryOptions: ["Select", "Location Consultation", "HQ Development", "Asset Management", "Listing Inquiry"],
        consent: "I agree to the collection and use of personal information for inquiry response.",
        submit: "Submit Inquiry",
        call: "Call",
        status: "Submitted inquiries are immediately visible in admin.",
        checklistTitle: "Operations Checklist",
        checklist: ["Register and update listings in admin", "Save inquiries and connect webhook alerts", "Mobile responsive layout", "Basic SEO metadata", "No heavy animation"],
        submitOkWebhook: "Inquiry submitted and webhook alert sent.",
        submitOkLocal: "Inquiry submitted. Saved locally. Add webhook URL for external alerts."
      },
      misc: {
        allRegions: "All Regions",
        noListingData: "No listing data.",
        openDetailAria: "Open details for {title}",
        deposit: "Deposit",
        monthly: "Monthly",
        premium: "Premium",
        area: "Area",
        parking: "Parking",
        detailEyebrow: "DETAIL",
        detail: { region: "Region", address: "Address", type: "Type", area: "Area", terms: "Terms", floorParking: "Floor/Parking" },
        cta: { call: "Call", form: "Online Inquiry" }
      },
      footer: {
        company: "부동산 중개법인 에이드청담",
        address: "1-3F, 76, Gangnam-daero 126-gil, Gangnam-gu, Seoul",
        phone: "02-0000-0000",
        admin: "ADMIN"
      }
    },
    jp: {
      nav: { projects: "HOME", company: "COMPANY", search: "SEARCH", partners: "PARTNERS", contact: "LOCATION" },
      ui: { languageMenu: "言語", admin: "管理者" },
      hero: { title: "Where visibility becomes value", tagline: "空間の印象を設計し、ブランド?値を高めます。" },
      project: { viewDetail: "詳細を見る", parking: "駐車" },
      company: {
        eyebrow: "?社情報",
        title: "?なる仲介ではなく、空間?略を設計します。",
        copy: "AIDはブランドに合う立地を選定し、本社開??略を設計し、インフルエンサ?資産運用モデルまで連携します。",
        bullets: ["可視性重視の立地企?", "本社開??運用モデル設計", "インフルエンサ?/IP基盤の空間資産管理"],
        signEyebrow: "代表署名",
        signBox: "署名",
        meta: [
          "<strong>?社名</strong>부동산 중개법인 에이드청담",
          "<strong>代表者</strong>Hong Gil-dong",
          "<strong>住所</strong>ソウル特別市 江南? 江南大路126キル 76 1~3階",
          "<strong>電話</strong>02-0000-0000",
          "<strong>事業者番?</strong>000-00-00000"
        ],
        socials: ["Instagram", "YouTube"]
      },
      search: {
        eyebrow: "?索",
        title: "?件別物件?索",
        typeLabel: "物件タイプ",
        types: ["オフィス", "リテ?ル", "住居", "ビル"],
        filters: ["地域", "カテゴリ", "最小面積 (m²)", "最大面積 (m²)", "最大保?金 (百万KRW)", "最大月賃料 (百万KRW)", "最大?利金 (百万KRW)", "最小階?", "最小駐車台?", "?び替え"],
        categoryPlaceholder: "ビュ?ティ?, F&B",
        sort: { new: "新着順", monthlyAsc: "賃料の安い順", depositAsc: "保?金の安い順", areaDesc: "面積の大きい順" },
        apply: "適用",
        reset: "リセット",
        modes: { list: "リスト", map: "地?" },
        emptyTitle: "?件に一致する物件がありません。",
        emptyDesc: "?件を?げるか、オフマ?ケット推薦をご依?ください。",
        emptyCta: "推薦を依?",
        result: "{count}件"
      },
      partners: { eyebrow: "パ?トナ?", title: "パ?トナ?紹介エリアです。", slots: ["パ?トナ?? 01", "パ?トナ?? 02", "パ?トナ?? 03", "パ?トナ?? 04"] },
      location: {
        eyebrow: "所在地",
        title: "AID 本社アクセス",
        officeTitle: "本社",
        lines: ["부동산 중개법인 에이드청담", "ソウル特別市 江南? 江南大路126キル 76 1~3階", "02-0000-0000"],
        transitTitle: "アクセス案?",
        transits: ["地下?2?線 ?三? 3番出口 徒?5分", "?客駐車は事前予約でご利用いただけます", "?業時間: 平日 09:30-18:30 (KST)"],
        mapLink: "地?で見る",
        mapTitle: "AID 本社地?"
      },
      contact: {
        eyebrow: "お問い合わせ",
        title: "お問い合わせ受付",
        fields: ["お問い合わせ種別", "お名前", "電話番?", "メ?ル", "?容"],
        inquiryOptions: ["選?", "立地コンサル", "本社開?", "資産運用", "物件問い合わせ"],
        consent: "お問い合わせ??のための個人情報?集?利用に同意します。",
        submit: "送信",
        call: "電話問い合わせ",
        status: "お問い合わせは管理?面で?時確認できます。",
        checklistTitle: "運用チェックリスト",
        checklist: ["管理?面で物件登??修正", "問い合わせ保存とWebhook連携", "モバイル??レイアウト", "基本SEOメタタグ適用", "過度なアニメ?ションを排除"],
        submitOkWebhook: "お問い合わせが送信され、Webhook通知が送信されました。",
        submitOkLocal: "お問い合わせが送信されました。現在ロ?カル保存中です。"
      },
      misc: {
        allRegions: "全地域",
        noListingData: "登?された物件がありません。",
        openDetailAria: "{title} の詳細を開く",
        deposit: "保?金",
        monthly: "月賃料",
        premium: "?利金",
        area: "面積",
        parking: "駐車",
        detailEyebrow: "詳細情報",
        detail: { region: "地域", address: "住所", type: "タイプ", area: "面積", terms: "?件", floorParking: "階/駐車" },
        cta: { call: "電話問い合わせ", form: "オンライン問い合わせ" }
      },
      footer: {
        company: "부동산 중개법인 에이드청담",
        address: "ソウル特別市 江南? 江南大路126キル 76 1~3階",
        phone: "02-0000-0000",
        admin: "ADMIN"
      }
    },
    ch: {
      nav: { projects: "HOME", company: "COMPANY", search: "SEARCH", partners: "PARTNERS", contact: "LOCATION" },
      ui: { languageMenu: "?言", admin: "管理?" },
      hero: { title: "Where visibility becomes value", tagline: "我???空?印象，提升品牌价?。" },
      project: { viewDetail: "?看?情", parking: "停?" },
      company: {
        eyebrow: "公司介?",
        title: "我?不?做中介，更做空??略。",
        copy: "AID?品牌??匹配?址，???部??策略，??接??????模型。",
        bullets: ["以可?性?核心的?址??", "?部?????模型??", "基于??/IP的空???管理"],
        signEyebrow: "代表?名",
        signBox: "?名",
        meta: [
          "<strong>公司</strong>부동산 중개법인 에이드청담",
          "<strong>代表</strong>Hong Gil-dong",
          "<strong>地址</strong>首?市 江南? 江南大路126街 76? 1~3?",
          "<strong>??</strong>02-0000-0000",
          "<strong>???照?</strong>000-00-00000"
        ],
        socials: ["Instagram", "YouTube"]
      },
      search: {
        eyebrow: "搜索",
        title: "按?件??房源",
        typeLabel: "房源?型",
        types: ["?公", "零?", "住宅", "整??"],
        filters: ["?域", "??", "最小面? (m²)", "最大面? (m²)", "最高保?金 (百万?元)", "最高月租 (百万?元)", "最高??? (百万?元)", "最小??", "最小?位", "排序"],
        categoryPlaceholder: "美?, 餐?",
        sort: { new: "最新", monthlyAsc: "月租?低到高", depositAsc: "保?金?低到高", areaDesc: "面??大到小" },
        apply: "?用??",
        reset: "重置",
        modes: { list: "列表", map: "地?" },
        emptyTitle: "?有符合?件的房源。",
        emptyDesc: "?放??件或申??下推?。",
        emptyCta: "申?推?",
        result: "{count}??果"
      },
      partners: { eyebrow: "合作?伴", title: "合作?伴展示?域。", slots: ["合作位 01", "合作位 02", "合作位 03", "合作位 04"] },
      location: {
        eyebrow: "位置",
        title: "AID ?部位置",
        officeTitle: "?部",
        lines: ["부동산 중개법인 에이드청담", "首?市 江南? 江南大路126街 76? 1~3?", "02-0000-0000"],
        transitTitle: "到?指引",
        transits: ["地?2???三站3?出口步行?5分?", "?客停?需提前??", "????: 工作日 09:30-18:30 (KST)"],
        mapLink: "在地?中打?",
        mapTitle: "AID ?部地?"
      },
      contact: {
        eyebrow: "咨?",
        title: "咨?提交",
        fields: ["咨??型", "姓名", "??", "?箱", "?容"],
        inquiryOptions: ["??", "?址咨?", "?部??", "????", "房源咨?"],
        consent: "我同意?回?咨?而收集和使用?人信息。",
        submit: "提交咨?",
        call: "??咨?",
        status: "提交后可在管理??面???看。",
        checklistTitle: "????",
        checklist: ["在管理??面新增/修改房源", "咨??据保存及Webhook??", "移?端适配布局", "基?SEO元??", "避免?度??效果"],
        submitOkWebhook: "咨?已提交，Webhook提醒已?送。",
        submitOkLocal: "咨?已提交，?前?保存到本地。"
      },
      misc: {
        allRegions: "全部?域",
        noListingData: "?无房源?据。",
        openDetailAria: "?看 {title} ?情",
        deposit: "保?金",
        monthly: "月租",
        premium: "???",
        area: "面?",
        parking: "停?",
        detailEyebrow: "?情",
        detail: { region: "?域", address: "地址", type: "?型", area: "面?", terms: "?件", floorParking: "??/停?" },
        cta: { call: "??咨?", form: "在?咨?" }
      },
      footer: {
        company: "부동산 중개법인 에이드청담",
        address: "首?市 江南? 江南大路126街 76? 1~3?",
        phone: "02-0000-0000",
        admin: "ADMIN"
      }
    }
  };

  const DEFAULT_LISTINGS = [
    {
      id: 1,
      title: "Seongsu Brand Retail Building",
      type: "Retail",
      region: "Seongsu",
      category: "Beauty",
      area: 412,
      deposit: 200,
      monthly: 12,
      premium: 0,
      floor: 4,
      parking: 6,
      address: "24 Achasan-ro, Seongdong-gu, Seoul",
      lat: 37.5453,
      lng: 127.0569,
      summary: "Visibility-first positioning for high-traffic beauty retail conversion.",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
      featured: true,
      createdAt: "2026-02-18"
    },
    {
      id: 2,
      title: "Cheongdam Beauty HQ Development",
      type: "Building",
      region: "Cheongdam",
      category: "HQ",
      area: 960,
      deposit: 0,
      monthly: 0,
      premium: 0,
      floor: 5,
      parking: 10,
      address: "53 Dosan-daero 81-gil, Gangnam-gu, Seoul",
      lat: 37.5246,
      lng: 127.0411,
      summary: "Headquarters development model linked to creator IP strategy.",
      image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80",
      featured: true,
      createdAt: "2026-02-19"
    },
    {
      id: 3,
      title: "Yeonnam Flagship Repositioning",
      type: "Retail",
      region: "Yeonnam",
      category: "F&B",
      area: 288,
      deposit: 120,
      monthly: 7,
      premium: 70,
      floor: 2,
      parking: 2,
      address: "46 Donggyo-ro 38-gil, Mapo-gu, Seoul",
      lat: 37.5636,
      lng: 126.9238,
      summary: "Flagship relocation strategy to increase visibility and visit intent.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
      featured: true,
      createdAt: "2026-02-20"
    },
    {
      id: 4,
      title: "Seocho Office Rebranding",
      type: "Office",
      region: "Seocho",
      category: "Office",
      area: 520,
      deposit: 300,
      monthly: 14,
      premium: 0,
      floor: 7,
      parking: 12,
      address: "17 Seocho-daero 74-gil, Seocho-gu, Seoul",
      lat: 37.4948,
      lng: 127.0262,
      summary: "Tenant mix redesign to stabilize occupancy and improve circulation.",
      image: "https://images.unsplash.com/photo-1486718448742-163732cd1544?auto=format&fit=crop&w=1400&q=80",
      featured: false,
      createdAt: "2026-02-17"
    },
    {
      id: 5,
      title: "Hannam Mixed-Use Residence",
      type: "Residential",
      region: "Hannam",
      category: "Residence",
      area: 610,
      deposit: 280,
      monthly: 10,
      premium: 0,
      floor: 3,
      parking: 4,
      address: "30 Dokseodang-ro, Yongsan-gu, Seoul",
      lat: 37.5343,
      lng: 127.0076,
      summary: "Long-stay residential asset model for premium brand use.",
      image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
      featured: false,
      createdAt: "2026-02-16"
    },
    {
      id: 6,
      title: "Yeouido Work Hub Setup",
      type: "Office",
      region: "Yeouido",
      category: "Office",
      area: 730,
      deposit: 400,
      monthly: 19,
      premium: 0,
      floor: 12,
      parking: 16,
      address: "12 Yeoui-daebang-ro, Yeongdeungpo-gu, Seoul",
      lat: 37.5255,
      lng: 126.9242,
      summary: "Large-team workplace setup with zone and flow optimization.",
      image: "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=1400&q=80",
      featured: false,
      createdAt: "2026-02-21"
    },
    {
      id: 7,
      title: "Jamsil Commercial Core Building",
      type: "Building",
      region: "Jamsil",
      category: "Retail",
      area: 1100,
      deposit: 500,
      monthly: 23,
      premium: 100,
      floor: 8,
      parking: 18,
      address: "240 Olympic-ro, Songpa-gu, Seoul",
      lat: 37.513,
      lng: 127.1029,
      summary: "Commercial redevelopment around expansion-ready retail categories.",
      image: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1400&q=80",
      featured: false,
      createdAt: "2026-02-22"
    },
    {
      id: 8,
      title: "Itaewon Creator Studio House",
      type: "Residential",
      region: "Itaewon",
      category: "Creator",
      area: 420,
      deposit: 220,
      monthly: 9,
      premium: 20,
      floor: 3,
      parking: 3,
      address: "38 Noksapyeong-daero 40-gil, Yongsan-gu, Seoul",
      lat: 37.5346,
      lng: 126.991,
      summary: "Live-work studio model for creator-led asset operation.",
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80",
      featured: false,
      createdAt: "2026-02-23"
    }
  ];

  const state = {
    listings: loadListings(),
    siteSettings: loadSiteSettings(),
    analytics: loadAnalytics(),
    theme: structuredClone(DEFAULT_THEME),
    language: loadLanguage(),
    cloudEnabled: Boolean(cloudStore && typeof cloudStore.isEnabled === "function" && cloudStore.isEnabled()),
    adminCredential: sessionStorage.getItem(SESSION_KEYS.adminSecret) || "",
    filtered: [],
    selectedId: null,
    mode: "list",
    currentRoute: "projects",
    adminPanel: "overview",
    sessionSource: detectTrafficSource(),
    isAdminAuthenticated: sessionStorage.getItem(SESSION_KEYS.adminAuth) === "1",
    projectLoopWidth: 0,
    projectX: 0,
    projectVelocity: 0,
    projectWheelCarry: 0,
    projectLandingPlayed: false,
    projectRafId: 0,
    projectSnapRafId: 0,
    projectStepWidth: 0,
    projectSnapTargetX: 0,
    projectTrackReady: false,
    projectDragPointerId: null,
    projectDragStartX: 0,
    projectDragStartProjectX: 0,
    projectDragMoved: false,
    projectDragPendingX: 0,
    projectDragRafId: 0,
    projectSuppressClickOnce: false,
    map: null,
    markerLayer: null
  };

  const el = {
    routes: Array.from(document.querySelectorAll("[data-route]")),
    logoText: document.getElementById("logoText"),
    logoImage: document.getElementById("logoImage"),
    pages: Array.from(document.querySelectorAll(".page")),
    projectPage: document.querySelector('.page[data-page="projects"]'),
    projectStage: document.getElementById("projectStage"),
    projectViewport: document.getElementById("projectViewport"),
    projectGrid: document.getElementById("projectGrid"),
    langTrigger: document.getElementById("langTrigger"),
    langCurrent: document.getElementById("langCurrent"),
    langOptions: Array.from(document.querySelectorAll("[data-lang]")),
    filterForm: document.getElementById("filterForm"),
    filterRegion: document.getElementById("filterRegion"),
    resetFilters: document.getElementById("resetFilters"),
    resultCount: document.getElementById("resultCount"),
    modeButtons: Array.from(document.querySelectorAll("[data-mode]")),
    layout: document.getElementById("searchLayout"),
    listPane: document.getElementById("listPane"),
    mapPane: document.getElementById("mapPane"),
    mapCanvas: document.getElementById("mapCanvas"),
    detailPane: document.getElementById("detailPane"),
    emptyState: document.getElementById("emptyState"),
    contactForm: document.getElementById("contactForm"),
    contactStatus: document.getElementById("contactStatus"),
    adminForm: document.getElementById("adminForm"),
    adminReset: document.getElementById("adminReset"),
    adminStatus: document.getElementById("adminStatus"),
    adminList: document.getElementById("adminList"),
    restoreDefaults: document.getElementById("restoreDefaults"),
    inquiryList: document.getElementById("inquiryList"),
    clearInquiries: document.getElementById("clearInquiries"),
    logoTextInput: document.getElementById("logoTextInput"),
    logoFileInput: document.getElementById("logoFileInput"),
    saveAssets: document.getElementById("saveAssets"),
    resetAssets: document.getElementById("resetAssets"),
    assetStatus: document.getElementById("assetStatus"),
    adminLoginLink: document.getElementById("adminLoginLink"),
    adminLogout: document.getElementById("adminLogout"),
    adminAuthModal: document.getElementById("adminAuthModal"),
    adminAuthForm: document.getElementById("adminAuthForm"),
    adminAuthInput: document.getElementById("adminAuthInput"),
    adminAuthStatus: document.getElementById("adminAuthStatus"),
    adminAuthCancel: document.getElementById("adminAuthCancel"),
    adminPanelButtons: Array.from(document.querySelectorAll("[data-admin-panel-target]")),
    adminPanels: Array.from(document.querySelectorAll("[data-admin-panel]")),
    adminJumpButtons: Array.from(document.querySelectorAll("[data-admin-jump]")),
    adminOverviewStats: document.getElementById("adminOverviewStats"),
    adminAlertList: document.getElementById("adminAlertList"),
    inquiryStageFilter: document.getElementById("inquiryStageFilter"),
    refreshAnalytics: document.getElementById("refreshAnalytics"),
    analyticsSummary: document.getElementById("analyticsSummary"),
    sourceStats: document.getElementById("sourceStats"),
    routeStats: document.getElementById("routeStats"),
    listingStats: document.getElementById("listingStats"),
    seoStats: document.getElementById("seoStats")
  };

  init();

  function init() {
    if (!Array.isArray(state.listings) || state.listings.length === 0) {
      state.listings = structuredClone(DEFAULT_LISTINGS);
      saveListings(state.listings);
    }

    if (state.cloudEnabled && state.adminCredential && cloudStore && typeof cloudStore.setAdminPassword === "function") {
      cloudStore.setAdminPassword(state.adminCredential);
    }

    applyLanguage(false);
    bindEvents();
    applyTheme(state.theme);
    refreshRegionOptions();
    applyFilters();
    renderAdminList();
    migrateInquiries();
    renderInquiryList();
    applySiteSettings();
    syncAssetForm();
    setAdminPanel(state.adminPanel);
    trackEvent("session_start", {
      source: state.sessionSource,
      landing: resolveRoute(location.hash || "#projects")
    });
    const firstRoute = resolveRoute(location.hash);
    const changed = setRoute(firstRoute, false);
    if (!changed) {
      trackEvent("route_view", { routeTarget: state.currentRoute, initial: true });
    }
    renderAnalytics();
    renderAdminOverview();
    void hydrateCloudBootstrap();
    if (state.isAdminAuthenticated && state.adminCredential) {
      void syncAdminDataFromCloud();
    }
  }

  function bindEvents() {
    window.addEventListener("hashchange", () => {
      setRoute(resolveRoute(location.hash), false);
    });

    el.routes.forEach((link) => {
      link.addEventListener("click", (event) => {
        const route = link.dataset.route;
        if (!route) return;
        event.preventDefault();
        setRoute(route, true);
      });
    });

    el.projectGrid.addEventListener("click", (event) => {
      if (state.projectSuppressClickOnce) {
        return;
      }
      const target = event.target.closest("[data-open-search-id]");
      if (!target) return;
      const id = Number(target.dataset.openSearchId);
      if (Number.isFinite(id)) {
        const listing = state.listings.find((item) => item.id === id);
        trackEvent("project_card_click", {
          listingId: id,
          listingTitle: listing ? listing.title : ""
        });
        state.selectedId = id;
        setRoute("search", true);
        renderSearch();
      }
    });

    if (el.projectViewport) {
      el.projectViewport.addEventListener(
        "wheel",
        (event) => {
          if (state.currentRoute !== "projects") return;
          if (Math.abs(event.deltaY) < 2) return;
          event.preventDefault();
          handleProjectWheel(-event.deltaY);
        },
        { passive: false }
      );

      el.projectViewport.addEventListener("pointerdown", onProjectPointerDown);
      window.addEventListener("pointermove", onProjectPointerMove);
      window.addEventListener("pointerup", onProjectPointerUp);
      window.addEventListener("pointercancel", onProjectPointerUp);
    }

    window.addEventListener(
      "resize",
      debounce(() => {
        if (state.currentRoute !== "projects") return;
        measureProjectLoop();
      }, 120)
    );

    el.filterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      applyFilters();
    });

    el.filterForm.addEventListener("change", applyFilters);
    el.filterForm.addEventListener("input", debounce(applyFilters, 120));

    el.resetFilters.addEventListener("click", () => {
      el.filterForm.reset();
      Array.from(el.filterForm.querySelectorAll('input[name="type"]')).forEach((checkbox) => {
        checkbox.checked = true;
      });
      applyFilters();
    });

    el.listPane.addEventListener("click", (event) => {
      const card = event.target.closest("[data-id]");
      if (!card) return;
      selectListing(Number(card.dataset.id));
    });

    el.listPane.addEventListener("keydown", (event) => {
      const card = event.target.closest("[data-id]");
      if (!card) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectListing(Number(card.dataset.id));
    });

    el.modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setMode(button.dataset.mode);
      });
    });

    el.contactForm.addEventListener("submit", onContactSubmit);
    el.adminForm.addEventListener("submit", onAdminSubmit);
    el.adminReset.addEventListener("click", clearAdminForm);

    el.adminList.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-action]");
      if (!btn) return;
      const id = Number(btn.dataset.id);
      if (btn.dataset.action === "edit") {
        startEditListing(id);
      } else if (btn.dataset.action === "delete") {
        deleteListing(id);
      }
    });

    el.restoreDefaults.addEventListener("click", () => {
      if (!window.confirm("샘플 매물을 복원할까요? 현재 저장된 매물은 덮어쓰기 됩니다.")) {
        return;
      }

      state.listings = structuredClone(DEFAULT_LISTINGS);
      saveListings(state.listings);
      refreshRegionOptions();
      applyFilters();
      renderProjectPage();
      renderAdminList();
      setStatus(el.adminStatus, "샘플 매물을 복원했습니다.", "ok");
      renderAdminOverview();
    });

    if (el.inquiryList) {
      el.inquiryList.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-inquiry-action]");
        if (!button) return;
        const id = String(button.dataset.id || "");
        if (!id) return;

        if (button.dataset.inquiryAction === "advance") {
          advanceInquiryStage(id);
        } else if (button.dataset.inquiryAction === "delete") {
          deleteInquiry(id);
        }
      });

      el.inquiryList.addEventListener("change", (event) => {
        const select = event.target.closest("select[data-inquiry-stage]");
        if (!select) return;
        const id = String(select.dataset.id || "");
        const stage = String(select.value || "");
        if (!id || !stage) return;
        updateInquiryStage(id, stage);
      });
    }

    if (el.clearInquiries) {
      el.clearInquiries.addEventListener("click", clearAllInquiries);
    }

    if (el.inquiryStageFilter) {
      el.inquiryStageFilter.addEventListener("change", renderInquiryList);
    }

    if (el.saveAssets) {
      el.saveAssets.addEventListener("click", onSaveAssets);
    }

    if (el.resetAssets) {
      el.resetAssets.addEventListener("click", onResetAssets);
    }

    if (el.adminLoginLink) {
      el.adminLoginLink.addEventListener("click", (event) => {
        event.preventDefault();
        if (ensureAdminAccess(true)) {
          setRoute("admin", true);
        }
      });
    }

    if (el.adminAuthForm) {
      el.adminAuthForm.addEventListener("submit", onAdminAuthSubmit);
    }

    if (el.adminAuthCancel) {
      el.adminAuthCancel.addEventListener("click", () => {
        closeAdminAuthModal();
      });
    }

    if (el.adminAuthModal) {
      el.adminAuthModal.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.matches("[data-auth-close]")) {
          closeAdminAuthModal();
        }
      });
    }

    if (el.adminLogout) {
      el.adminLogout.addEventListener("click", () => {
        state.isAdminAuthenticated = false;
        state.adminCredential = "";
        sessionStorage.removeItem(SESSION_KEYS.adminAuth);
        sessionStorage.removeItem(SESSION_KEYS.adminSecret);
        if (state.cloudEnabled && cloudStore && typeof cloudStore.clearAdminPassword === "function") {
          cloudStore.clearAdminPassword();
        }
        closeAdminAuthModal();
        setRoute("projects", true);
      });
    }

    if (el.adminPanelButtons.length) {
      el.adminPanelButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const panel = String(button.dataset.adminPanelTarget || "").trim();
          if (!panel) return;
          setAdminPanel(panel);
        });
      });
    }

    if (el.adminJumpButtons.length) {
      el.adminJumpButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const panel = String(button.dataset.adminJump || "").trim();
          if (!panel) return;
          setAdminPanel(panel);
        });
      });
    }

    if (el.refreshAnalytics) {
      el.refreshAnalytics.addEventListener("click", renderAnalytics);
    }

    if (el.langOptions.length) {
      el.langOptions.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          const lang = String(button.dataset.lang || "");
          if (!lang) return;
          setLanguage(lang);
        });
      });
    }

    if (el.projectPage) {
      el.projectPage.addEventListener("click", (event) => {
        if (state.currentRoute !== "projects") return;
        if (state.projectSuppressClickOnce) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.closest("#projectStage")) return;
        if (target.closest("a, button, input, select, textarea, label, [data-open-search-id]")) return;
        cycleThemeFromBackground();
      });
    }

    document.addEventListener("click", (event) => {
      const telLink = event.target.closest('a[href^="tel:"]');
      if (!telLink) return;
      trackEvent("cta_call_click", {
        target: String(telLink.getAttribute("href") || ""),
        label: String(telLink.textContent || "").trim()
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!el.adminAuthModal || el.adminAuthModal.classList.contains("is-hidden")) return;
      closeAdminAuthModal();
    });
  }

  function resolveRoute(hashText) {
    const raw = String(hashText || "").replace(/^#/, "").trim().toLowerCase();
    if (ROUTES.includes(raw)) return raw;
    return "projects";
  }

  function cycleThemeFromBackground() {
    const next = getNextTheme(state.theme.tone);
    applyTheme(next);
    trackEvent("theme_change", { tone: state.theme.tone, source: "background" });
  }

  function onProjectPointerDown(event) {
    if (!el.projectViewport) return;
    if (state.currentRoute !== "projects" || !state.projectTrackReady) return;
    if (event.button !== 0) return;
    if (!(event.target instanceof Element)) return;
    if (!event.target.closest(".project-card")) return;

    stopProjectFlow();
    state.projectDragPointerId = event.pointerId;
    state.projectDragStartX = event.clientX;
    state.projectDragStartProjectX = state.projectX;
    state.projectDragMoved = false;
    state.projectDragPendingX = state.projectX;

    el.projectViewport.classList.add("is-dragging");
    setProjectGridAnimating(true);
    if (typeof el.projectViewport.setPointerCapture === "function") {
      try {
        el.projectViewport.setPointerCapture(event.pointerId);
      } catch (_err) {
        // no-op
      }
    }
  }

  function onProjectPointerMove(event) {
    if (state.projectDragPointerId !== event.pointerId) return;
    if (!state.projectTrackReady) return;

    const deltaX = event.clientX - state.projectDragStartX;
    if (Math.abs(deltaX) > 6) {
      state.projectDragMoved = true;
    }

    state.projectDragPendingX = normalizeProjectX(state.projectDragStartProjectX + deltaX);
    if (!state.projectDragRafId) {
      state.projectDragRafId = window.requestAnimationFrame(() => {
        state.projectDragRafId = 0;
        state.projectX = state.projectDragPendingX;
        applyProjectTransform();
      });
    }

    if (state.projectDragMoved) {
      event.preventDefault();
    }
  }

  function onProjectPointerUp(event) {
    if (!el.projectViewport) return;
    if (state.projectDragPointerId !== event.pointerId) return;

    if (state.projectDragRafId) {
      window.cancelAnimationFrame(state.projectDragRafId);
      state.projectDragRafId = 0;
      state.projectX = state.projectDragPendingX;
      applyProjectTransform();
    }

    const moved = state.projectDragMoved;

    if (typeof el.projectViewport.releasePointerCapture === "function") {
      try {
        if (el.projectViewport.hasPointerCapture(event.pointerId)) {
          el.projectViewport.releasePointerCapture(event.pointerId);
        }
      } catch (_err) {
        // no-op
      }
    }

    state.projectDragPointerId = null;
    state.projectDragStartX = 0;
    state.projectDragStartProjectX = state.projectX;
    state.projectDragMoved = false;
    el.projectViewport.classList.remove("is-dragging");

    if (!moved) {
      setProjectGridAnimating(false);
      return;
    }

    state.projectSuppressClickOnce = true;
    window.setTimeout(() => {
      state.projectSuppressClickOnce = false;
    }, 240);
    state.projectWheelCarry = 0;
    state.projectSnapTargetX = getNearestProjectSnapTarget(state.projectX);
    startProjectSnap(true);
  }

  function ensureAdminAccess(showPrompt) {
    if (state.isAdminAuthenticated) return true;
    if (showPrompt) {
      openAdminAuthModal();
    }
    return false;
  }

  function openAdminAuthModal() {
    if (!el.adminAuthModal) return;
    el.adminAuthModal.classList.remove("is-hidden");
    el.adminAuthModal.setAttribute("aria-hidden", "false");
    setStatus(el.adminAuthStatus, "관리자 비밀번호를 입력하세요.", "");
    window.setTimeout(() => {
      if (el.adminAuthInput) {
        el.adminAuthInput.focus();
      }
    }, 0);
  }

  function closeAdminAuthModal() {
    if (!el.adminAuthModal) return;
    el.adminAuthModal.classList.add("is-hidden");
    el.adminAuthModal.setAttribute("aria-hidden", "true");
    if (el.adminAuthForm) {
      el.adminAuthForm.reset();
    }
    setStatus(el.adminAuthStatus, "관리자 비밀번호를 입력하세요.", "");
  }

  async function onAdminAuthSubmit(event) {
    event.preventDefault();
    const input = String(el.adminAuthInput ? el.adminAuthInput.value : "").trim();
    const authorized = await verifyAdminCredential(input);
    if (!authorized) {
      setStatus(el.adminAuthStatus, "비밀번호가 올바르지 않습니다.", "error");
      if (el.adminAuthInput) {
        el.adminAuthInput.focus();
        el.adminAuthInput.select();
      }
      return;
    }

    state.isAdminAuthenticated = true;
    state.adminCredential = input;
    sessionStorage.setItem(SESSION_KEYS.adminAuth, "1");
    sessionStorage.setItem(SESSION_KEYS.adminSecret, input);
    if (state.cloudEnabled && cloudStore && typeof cloudStore.setAdminPassword === "function") {
      cloudStore.setAdminPassword(input);
    }
    closeAdminAuthModal();
    setRoute("admin", true);
    if (state.cloudEnabled) {
      void syncAdminDataFromCloud();
    }
  }

  async function verifyAdminCredential(input) {
    const password = String(input || "").trim();
    if (!password) return false;

    if (state.cloudEnabled && cloudStore && typeof cloudStore.verifyAdmin === "function") {
      try {
        return Boolean(await cloudStore.verifyAdmin(password));
      } catch (_err) {
        return false;
      }
    }

    return password === ADMIN_PASSWORD;
  }

  function canUseCloudPublic() {
    return Boolean(state.cloudEnabled && cloudStore);
  }

  function canUseCloudAdmin() {
    return Boolean(canUseCloudPublic() && state.isAdminAuthenticated && state.adminCredential);
  }

  async function hydrateCloudBootstrap() {
    if (!canUseCloudPublic() || typeof cloudStore.getBootstrap !== "function") return;

    try {
      const remote = await cloudStore.getBootstrap();
      if (!remote || typeof remote !== "object") return;

      let changed = false;

      if (remote.hasListingsDoc && Array.isArray(remote.listings)) {
        state.listings = [...remote.listings];
        saveListingsLocal(state.listings);
        changed = true;
      }

      if (remote.siteSettings && typeof remote.siteSettings === "object") {
        state.siteSettings = {
          logoText: String(remote.siteSettings.logoText || DEFAULT_SITE_SETTINGS.logoText),
          logoImage: String(remote.siteSettings.logoImage || "")
        };
        saveSiteSettingsLocal(state.siteSettings);
        applySiteSettings();
        syncAssetForm();
        changed = true;
      }

      if (!changed) return;

      refreshRegionOptions();
      applyFilters();
      renderProjectPage();
      renderAdminList();
      renderAdminOverview();
    } catch (_err) {
      // Keep local fallback silently.
    }
  }

  async function syncAdminDataFromCloud() {
    if (!canUseCloudAdmin()) return;

    if (typeof cloudStore.setAdminPassword === "function") {
      cloudStore.setAdminPassword(state.adminCredential);
    }

    try {
      if (typeof cloudStore.getInquiries === "function") {
        const inquiries = await cloudStore.getInquiries();
        if (Array.isArray(inquiries)) {
          saveInquiriesLocal(inquiries.map((item) => normalizeInquiry(item)));
          renderInquiryList();
          renderAdminOverview();
          renderAnalytics();
        }
      }
    } catch (_err) {
      // Keep local data when cloud fetch fails.
    }
  }

  function setRoute(route, updateHash) {
    const previousRoute = state.currentRoute;
    let nextRoute = ROUTES.includes(route) ? route : "projects";

    if (nextRoute === "admin" && !ensureAdminAccess(updateHash)) {
      if (!updateHash && String(location.hash || "").toLowerCase() === "#admin") {
        location.hash = `#${previousRoute || "projects"}`;
      }
      return false;
    }

    state.currentRoute = nextRoute;
    const isProjectRoute = state.currentRoute === "projects";
    document.body.classList.toggle("route-projects", isProjectRoute);
    document.documentElement.classList.toggle("route-projects", isProjectRoute);
    applyRootScrollLock(isProjectRoute);

    el.pages.forEach((page) => {
      page.classList.toggle("is-active", page.dataset.page === state.currentRoute);
    });

    el.routes.forEach((link) => {
      const active = link.dataset.route === state.currentRoute;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (updateHash) {
      const targetHash = `#${state.currentRoute}`;
      if (location.hash !== targetHash) {
        location.hash = targetHash;
      }
    }

    if (state.currentRoute === "projects") {
      renderProjectPage();
    } else {
      stopProjectFlow();
    }

    if (state.currentRoute === "search" && state.mode === "map") {
      ensureMap();
      if (state.map) {
        window.setTimeout(() => {
          state.map.invalidateSize();
          renderMap();
        }, 40);
      }
    }

    if (state.currentRoute === "admin") {
      renderAdminList();
      renderInquiryList();
      renderAnalytics();
      renderAdminOverview();
      setAdminPanel(state.adminPanel);
      if (state.cloudEnabled) {
        void syncAdminDataFromCloud();
      }
    }

    if (previousRoute !== state.currentRoute) {
      trackEvent("route_view", { routeTarget: state.currentRoute });
      if (state.currentRoute === "admin") {
        renderAnalytics();
      }
    }

    return previousRoute !== state.currentRoute;
  }

  function applyRootScrollLock(locked) {
    if (locked) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      return;
    }

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  function normalizeLanguage(value) {
    const key = String(value || "").trim().toLowerCase();
    return LANGUAGE_LIST.includes(key) ? key : "ko";
  }

  function getLocale() {
    const key = normalizeLanguage(state.language);
    return I18N[key] || I18N.ko;
  }

  function setNodeText(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function setNodeTexts(selector, values) {
    const nodes = Array.from(document.querySelectorAll(selector));
    nodes.forEach((node, index) => {
      if (index < values.length) {
        node.textContent = values[index];
      }
    });
  }

  function setCheckboxLabel(label, text) {
    if (!label) return;
    const input = label.querySelector("input");
    if (!input) return;
    label.textContent = "";
    label.append(input);
    label.append(document.createTextNode(text));
  }

  function applyLanguage(shouldPersist) {
    const persist = shouldPersist !== false;
    state.language = normalizeLanguage(state.language);
    const locale = getLocale();
    const meta = LANGUAGE_META[state.language] || LANGUAGE_META.ko;

    document.documentElement.lang = meta.htmlLang;

    if (el.langCurrent) {
      el.langCurrent.textContent = meta.code;
    }
    if (el.langTrigger) {
      const languageLabel = locale.ui && locale.ui.languageMenu ? locale.ui.languageMenu : "Language";
      el.langTrigger.setAttribute("data-label", meta.code);
      el.langTrigger.setAttribute("aria-label", `${languageLabel}: ${meta.code}`);
    }
    if (el.langOptions.length) {
      el.langOptions.forEach((button) => {
        const active = String(button.dataset.lang || "") === state.language;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    const navMap = STATIC_NAV_LABELS;
    const navRoutes = ["projects", "company", "search", "partners", "contact"];
    navRoutes.forEach((route) => {
      const link = document.querySelector(`.main-nav a[data-route="${route}"]`);
      if (!link) return;
      const label = navMap[route] || "";
      const span = link.querySelector("span");
      if (span) span.textContent = label;
      link.dataset.label = label;
    });

    setNodeText("#page-projects-title", STATIC_HERO_TITLE);
    setNodeText(".project-tagline", locale.hero.tagline);

    setNodeText('.page[data-page="company"] .page-head .eyebrow', locale.company.eyebrow);
    setNodeText("#page-company-title", locale.company.title);
    setNodeText('.page[data-page="company"] .copy', locale.company.copy);
    setNodeTexts('.page[data-page="company"] .plain-list li', locale.company.bullets);
    setNodeText('.page[data-page="company"] .card-block:nth-child(2) .eyebrow', locale.company.signEyebrow);
    setNodeText('.page[data-page="company"] .signature-box', locale.company.signBox);
    const companyMetaItems = Array.from(document.querySelectorAll('.page[data-page="company"] .meta-list li'));
    companyMetaItems.forEach((item, index) => {
      if (index < locale.company.meta.length) {
        item.innerHTML = locale.company.meta[index];
      }
    });
    setNodeTexts('.page[data-page="company"] .social-row a', locale.company.socials);

    setNodeText('.page[data-page="search"] .page-head .eyebrow', locale.search.eyebrow);
    setNodeText("#page-search-title", locale.search.title);
    setNodeText('.page[data-page="search"] .field-label', locale.search.typeLabel);
    const typeLabels = Array.from(document.querySelectorAll('.page[data-page="search"] .type-row label'));
    typeLabels.forEach((label, index) => setCheckboxLabel(label, locale.search.types[index] || ""));
    setNodeTexts('.page[data-page="search"] .filter-grid label > span', locale.search.filters);
    const categoryInput = document.querySelector('.page[data-page="search"] input[name="category"]');
    if (categoryInput) {
      categoryInput.placeholder = locale.search.categoryPlaceholder;
    }
    const sortSelect = document.querySelector('.page[data-page="search"] select[name="sort"]');
    if (sortSelect) {
      const sortMap = locale.search.sort;
      Array.from(sortSelect.options).forEach((option) => {
        if (sortMap[option.value]) option.textContent = sortMap[option.value];
      });
    }
    setNodeText('.page[data-page="search"] button[type="submit"]', locale.search.apply);
    if (el.resetFilters) el.resetFilters.textContent = locale.search.reset;
    const listModeBtn = document.querySelector('.page[data-page="search"] [data-mode="list"]');
    const mapModeBtn = document.querySelector('.page[data-page="search"] [data-mode="map"]');
    if (listModeBtn) listModeBtn.textContent = locale.search.modes.list;
    if (mapModeBtn) mapModeBtn.textContent = locale.search.modes.map;
    setNodeText("#emptyState h3", locale.search.emptyTitle);
    setNodeText("#emptyState p", locale.search.emptyDesc);
    setNodeText("#emptyState a", locale.search.emptyCta);

    setNodeText('.page[data-page="partners"] .page-head .eyebrow', locale.partners.eyebrow);
    setNodeText("#page-partners-title", locale.partners.title);
    setNodeTexts('.page[data-page="partners"] .partner-grid article', locale.partners.slots);

    const locationLocale = locale.location || I18N.en.location;
    setNodeText('.page[data-page="contact"] .page-head .eyebrow', locationLocale.eyebrow);
    setNodeText("#page-contact-title", locationLocale.title);
    setNodeText("#locationOfficeTitle", locationLocale.officeTitle);
    setNodeText("#locationLine1", locationLocale.lines[0] || "");
    setNodeText("#locationLine2", locationLocale.lines[1] || "");
    setNodeText("#locationLine3", locationLocale.lines[2] || "");
    setNodeText("#locationTransitTitle", locationLocale.transitTitle);
    setNodeText("#locationTransitItem1", locationLocale.transits[0] || "");
    setNodeText("#locationTransitItem2", locationLocale.transits[1] || "");
    setNodeText("#locationTransitItem3", locationLocale.transits[2] || "");
    const locationMapLink = document.getElementById("locationMapLink");
    if (locationMapLink) locationMapLink.textContent = locationLocale.mapLink;
    const locationMapFrame = document.getElementById("locationMapFrame");
    if (locationMapFrame) locationMapFrame.title = locationLocale.mapTitle;

    setNodeText('.page[data-page="inquiry"] .page-head .eyebrow', locale.contact.eyebrow);
    setNodeText("#page-inquiry-title", locale.contact.title);
    setNodeTexts('#contactForm label > span', locale.contact.fields);
    const inquiryTypeSelect = document.querySelector('#contactForm select[name="inquiryType"]');
    if (inquiryTypeSelect) {
      const options = Array.from(inquiryTypeSelect.options);
      options.forEach((option, index) => {
        if (index < locale.contact.inquiryOptions.length) {
          option.textContent = locale.contact.inquiryOptions[index];
        }
      });
    }
    const consentLabel = document.querySelector("#contactForm .agree");
    if (consentLabel) {
      const checkbox = consentLabel.querySelector('input[name="consent"]');
      consentLabel.textContent = "";
      if (checkbox) {
        consentLabel.append(checkbox);
      }
      consentLabel.append(document.createTextNode(locale.contact.consent));
    }
    const contactSubmitBtn = document.querySelector('#contactForm button[type="submit"]');
    if (contactSubmitBtn) contactSubmitBtn.textContent = locale.contact.submit;
    const telLink = document.querySelector("#contactForm .tel-link");
    if (telLink) telLink.textContent = locale.contact.call;
    setNodeText("#contactStatus", locale.contact.status);
    setNodeText('.page[data-page="inquiry"] .card-block h3', locale.contact.checklistTitle);
    setNodeTexts('.page[data-page="inquiry"] .card-block .plain-list li', locale.contact.checklist);

    if (locale.footer) {
      setNodeText("#footerCompanyName", locale.footer.company);
      setNodeText("#footerAddress", locale.footer.address);
      setNodeText("#footerPhone", locale.footer.phone);
      if (el.adminLoginLink) {
        el.adminLoginLink.textContent = locale.footer.admin;
      }
    }

    if (persist) {
      saveLanguage(state.language);
    }
  }

  function setLanguage(nextLanguage) {
    const normalized = normalizeLanguage(nextLanguage);
    if (normalized === state.language) return;
    state.language = normalized;
    applyLanguage(true);
    refreshRegionOptions();
    applyFilters();
    renderInquiryList();
    renderAdminOverview();
    renderAnalytics();
  }

  function setAdminPanel(panelName) {
    if (!el.adminPanels.length || !el.adminPanelButtons.length) return;
    const target = String(panelName || "").trim();
    const hasTarget = el.adminPanels.some((panel) => panel.dataset.adminPanel === target);
    if (!hasTarget) return;

    state.adminPanel = target;

    el.adminPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.adminPanel === target);
    });

    el.adminPanelButtons.forEach((button) => {
      const active = button.dataset.adminPanelTarget === target;
      button.classList.toggle("is-active", active);
      if (active) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    if (target === "overview") {
      renderAdminOverview();
    } else if (target === "analytics") {
      renderAnalytics();
    } else if (target === "inquiry") {
      renderInquiryList();
    } else if (target === "listing") {
      renderAdminList();
    }
  }

  function renderProjectPage() {
    const locale = getLocale();
    const source = getProjectShowcaseSource();
    if (el.projectPage && !state.projectLandingPlayed) {
      el.projectPage.classList.add("is-prelanding");
    }
    if (!source.length) {
      el.projectGrid.innerHTML = `<p>${escapeHtml(locale.misc.noListingData)}</p>`;
      state.projectTrackReady = false;
      return;
    }

    stopProjectFlow();
    state.projectX = 0;
    state.projectSnapTargetX = 0;
    el.projectGrid.style.transform = "translate3d(0, 0, 0)";

    const loopCopies = 3;
    const rows = [];

    for (let copyIndex = 0; copyIndex < loopCopies; copyIndex += 1) {
      source.forEach((item, itemIndex) => {
        const entryStyle = copyIndex === 1 ? ` style="--entry-index:${itemIndex}"` : "";
        rows.push(`
          <article class="project-item" data-loop-copy="${copyIndex}"${entryStyle}>
            <p class="project-index">${String(itemIndex + 1).padStart(2, "0")}</p>
            <button class="project-card" type="button" data-open-search-id="${item.id}">
              <img class="project-thumb" src="${escapeHtml(item.image || fallbackImage())}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='${fallbackImage()}'" />
              <div class="project-meta">
                <p>${escapeHtml(item.title)}</p>
                <span class="project-brief">${escapeHtml(item.category)} · ${number.format(item.area)} m² · ${escapeHtml(locale.project.parking)} ${number.format(item.parking)}</span>
              </div>
            </button>
          </article>
        `);
      });
    }

    el.projectGrid.innerHTML = rows.join("");
    window.requestAnimationFrame(() => {
      measureProjectLoop();
      window.requestAnimationFrame(() => {
        if (state.currentRoute === "projects") {
          measureProjectLoop();
          playProjectLandingIntro();
        }
      });
    });
  }

  function playProjectLandingIntro() {
    if (state.projectLandingPlayed) return;
    if (!el.projectGrid || !el.projectGrid.children.length || !el.projectPage) return;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (state.currentRoute !== "projects") return;
        el.projectPage.classList.remove("is-landing");
        void el.projectPage.offsetWidth;
        el.projectPage.classList.add("is-landing");
        el.projectPage.classList.remove("is-prelanding");
        state.projectLandingPlayed = true;

        window.setTimeout(() => {
          el.projectPage.classList.remove("is-landing");
        }, 1680);
      });
    });
  }

  function measureProjectLoop() {
    const first = el.projectGrid.querySelector('.project-item[data-loop-copy="0"]');
    const second = el.projectGrid.querySelector('.project-item[data-loop-copy="1"]');
    const copyZeroItems = Array.from(el.projectGrid.querySelectorAll('.project-item[data-loop-copy="0"]'));

    if (!first || !second) {
      state.projectTrackReady = false;
      return;
    }

    const firstLoopRect = first.getBoundingClientRect();
    const secondLoopRect = second.getBoundingClientRect();
    state.projectLoopWidth = secondLoopRect.left - firstLoopRect.left;
    if (!(state.projectLoopWidth > 0)) {
      state.projectTrackReady = false;
      return;
    }

    state.projectTrackReady = true;
    state.projectVelocity = 0;
    state.projectWheelCarry = 0;
    if (copyZeroItems.length >= 2) {
      const firstRect = copyZeroItems[0].getBoundingClientRect();
      const secondRect = copyZeroItems[1].getBoundingClientRect();
      state.projectStepWidth = secondRect.left - firstRect.left;
    } else {
      state.projectStepWidth = state.projectLoopWidth;
    }
    state.projectStepWidth = Math.max(1, state.projectStepWidth);
    state.projectX = normalizeProjectX(-state.projectLoopWidth);
    state.projectX = getNearestProjectSnapTarget(state.projectX);
    state.projectSnapTargetX = state.projectX;
    stopProjectSnap();
    applyProjectTransform();
  }

  function handleProjectWheel(deltaY) {
    if (!state.projectTrackReady) return;

    state.projectWheelCarry += deltaY * PROJECT_WHEEL_DAMPING;
    const direction = Math.sign(state.projectWheelCarry);
    if (!direction) return;

    const magnitude = Math.abs(state.projectWheelCarry);
    if (magnitude < PROJECT_WHEEL_THRESHOLD) return;

    const steps = 1;
    state.projectWheelCarry -= direction * PROJECT_WHEEL_THRESHOLD;

    const base = state.projectSnapRafId ? state.projectSnapTargetX : getNearestProjectSnapTarget(state.projectX);
    stopProjectSnap();
    state.projectSnapTargetX = normalizeProjectX(base + direction * steps * state.projectStepWidth);
    startProjectSnap(true);
  }

  function startProjectFlow() {
    if (state.projectRafId) return;

    const tick = () => {
      if (state.currentRoute !== "projects" || !state.projectTrackReady) {
        state.projectRafId = 0;
        return;
      }

      state.projectX += state.projectVelocity;
      state.projectVelocity *= 0.92;
      wrapProjectPosition();
      applyProjectTransform();

      if (Math.abs(state.projectVelocity) > 0.05) {
        state.projectRafId = window.requestAnimationFrame(tick);
      } else {
        state.projectVelocity = 0;
        state.projectRafId = 0;
        startProjectSnap();
      }
    };

    state.projectRafId = window.requestAnimationFrame(tick);
  }

  function stopProjectFlow() {
    if (state.projectRafId) {
      window.cancelAnimationFrame(state.projectRafId);
      state.projectRafId = 0;
    }
    state.projectVelocity = 0;
    state.projectWheelCarry = 0;
    state.projectDragPointerId = null;
    state.projectDragMoved = false;
    state.projectDragPendingX = state.projectX;
    if (state.projectDragRafId) {
      window.cancelAnimationFrame(state.projectDragRafId);
      state.projectDragRafId = 0;
    }
    if (el.projectViewport) {
      el.projectViewport.classList.remove("is-dragging");
    }
    setProjectGridAnimating(false);
    stopProjectSnap();
  }

  function stopProjectSnap() {
    if (state.projectSnapRafId) {
      window.cancelAnimationFrame(state.projectSnapRafId);
      state.projectSnapRafId = 0;
    }
  }

  function getNearestProjectSnapTarget(rawX) {
    const loop = state.projectLoopWidth;
    const step = state.projectStepWidth;
    if (!(loop > 0) || !(step > 0)) return rawX;

    let x = rawX;
    while (x > 0) {
      x -= loop;
    }
    while (x <= -2 * loop) {
      x += loop;
    }

    const normalized = x + loop;
    const snappedIndex = Math.round(normalized / step);
    return -loop + snappedIndex * step;
  }

  function startProjectSnap(useExistingTarget = false) {
    if (state.projectSnapRafId || !state.projectTrackReady) return;
    setProjectGridAnimating(true);

    if (!useExistingTarget) {
      state.projectSnapTargetX = getNearestProjectSnapTarget(state.projectX);
    }

    const animate = () => {
      if (state.currentRoute !== "projects" || !state.projectTrackReady) {
        state.projectSnapRafId = 0;
        return;
      }

      const loop = state.projectLoopWidth;
      let target = state.projectSnapTargetX;

      while (target - state.projectX > loop / 2) {
        target -= loop;
      }
      while (target - state.projectX < -loop / 2) {
        target += loop;
      }

      const diff = target - state.projectX;
      const easing = Math.abs(diff) > 42 ? 0.055 : 0.08;
      state.projectX += diff * easing;
      wrapProjectPosition();
      applyProjectTransform();

      if (Math.abs(diff) < 0.12) {
        state.projectX = target;
        wrapProjectPosition();
        applyProjectTransform();
        state.projectSnapRafId = 0;
        setProjectGridAnimating(false);
        return;
      }

      state.projectSnapRafId = window.requestAnimationFrame(animate);
    };

    state.projectSnapRafId = window.requestAnimationFrame(animate);
  }

  function wrapProjectPosition() {
    const loop = state.projectLoopWidth;
    if (!(loop > 0)) return;

    state.projectX = normalizeProjectX(state.projectX);
  }

  function normalizeProjectX(value) {
    const loop = state.projectLoopWidth;
    if (!(loop > 0)) return value;

    let x = value;
    while (x > 0) {
      x -= loop;
    }
    while (x <= -2 * loop) {
      x += loop;
    }
    return x;
  }

  function applyProjectTransform() {
    el.projectGrid.style.transform = `translate3d(${state.projectX.toFixed(3)}px, 0, 0)`;
  }

  function setProjectGridAnimating(active) {
    if (!el.projectGrid) return;
    el.projectGrid.classList.toggle("is-animating", Boolean(active));
  }

  function getProjectShowcaseSource() {
    const featured = state.listings.filter((item) => item.featured);
    const normal = state.listings.filter((item) => !item.featured);
    return [...featured, ...normal];
  }

  function applyFilters() {
    const filters = readFilters();

    let filtered = state.listings.filter((item) => {
      const hasType = filters.types.has(item.type);
      const matchRegion = !filters.region || item.region.toLowerCase() === filters.region;
      const matchCategory = !filters.category || item.category.toLowerCase().includes(filters.category);
      const matchAreaMin = filters.areaMin === null || item.area >= filters.areaMin;
      const matchAreaMax = filters.areaMax === null || item.area <= filters.areaMax;
      const matchDeposit = filters.depositMax === null || item.deposit <= filters.depositMax;
      const matchMonthly = filters.monthlyMax === null || item.monthly <= filters.monthlyMax;
      const matchPremium = filters.premiumMax === null || item.premium <= filters.premiumMax;
      const matchFloor = filters.floorMin === null || item.floor >= filters.floorMin;
      const matchParking = filters.parkingMin === null || item.parking >= filters.parkingMin;

      return (
        hasType &&
        matchRegion &&
        matchCategory &&
        matchAreaMin &&
        matchAreaMax &&
        matchDeposit &&
        matchMonthly &&
        matchPremium &&
        matchFloor &&
        matchParking
      );
    });

    filtered = sortListings(filtered, filters.sort);

    state.filtered = filtered;
    if (!filtered.some((item) => item.id === state.selectedId)) {
      state.selectedId = filtered.length ? filtered[0].id : null;
    }

    renderSearch();
    renderAdminList();
    renderProjectPage();
  }

  function renderSearch() {
    const locale = getLocale();
    const list = state.filtered;
    const hasData = list.length > 0;

    el.resultCount.textContent = locale.search.result.replace("{count}", number.format(list.length));
    el.emptyState.classList.toggle("is-hidden", hasData);
    el.layout.classList.toggle("is-hidden", !hasData);

    if (!hasData) {
      el.listPane.innerHTML = "";
      el.detailPane.innerHTML = "";
      clearMapMarkers();
      return;
    }

    el.listPane.innerHTML = list
      .map((item) => {
        const active = item.id === state.selectedId ? "is-active" : "";
        const ariaLabel = locale.misc.openDetailAria.replace("{title}", item.title);
        return `
          <article class="list-card ${active}" data-id="${item.id}" role="button" tabindex="0" aria-label="${escapeHtml(ariaLabel)}">
            <img class="list-thumb" src="${escapeHtml(item.image || fallbackImage())}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='${fallbackImage()}'" />
            <div class="list-body">
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.region)} | ${escapeHtml(item.category)} | ${escapeHtml(item.type)}</p>
              <p>${escapeHtml(item.summary)}</p>
              <div class="list-tags">
                <span>${number.format(item.area)} m²</span>
                <span>${escapeHtml(locale.misc.deposit)} ${number.format(item.deposit)}M</span>
                <span>${escapeHtml(locale.misc.monthly)} ${number.format(item.monthly)}M</span>
                <span>${escapeHtml(locale.misc.parking)} ${number.format(item.parking)}</span>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    renderDetail();
    renderMap();
  }

  function renderDetail() {
    const locale = getLocale();
    const item = state.filtered.find((entry) => entry.id === state.selectedId);
    if (!item) {
      el.detailPane.innerHTML = "";
      return;
    }

    el.detailPane.innerHTML = `
      <p class="eyebrow">${escapeHtml(locale.misc.detailEyebrow)}</p>
      <h3>${escapeHtml(item.title)}</h3>
      <img class="detail-image" src="${escapeHtml(item.image || fallbackImage())}" alt="${escapeHtml(item.title)}" onerror="this.src='${fallbackImage()}'" />
      <ul class="detail-meta">
        <li><strong>${escapeHtml(locale.misc.detail.region)}</strong>${escapeHtml(item.region)}</li>
        <li><strong>${escapeHtml(locale.misc.detail.address)}</strong>${escapeHtml(item.address)}</li>
        <li><strong>${escapeHtml(locale.misc.detail.type)}</strong>${escapeHtml(formatTypeLabel(item.type))} / ${escapeHtml(item.category)}</li>
        <li><strong>${escapeHtml(locale.misc.detail.area)}</strong>${number.format(item.area)} m²</li>
        <li><strong>${escapeHtml(locale.misc.detail.terms)}</strong>${escapeHtml(locale.misc.deposit)} ${number.format(item.deposit)}M | ${escapeHtml(locale.misc.monthly)} ${number.format(item.monthly)}M | ${escapeHtml(locale.misc.premium)} ${number.format(item.premium)}M</li>
        <li><strong>${escapeHtml(locale.misc.detail.floorParking)}</strong>${number.format(item.floor)}F | ${escapeHtml(locale.misc.parking)} ${number.format(item.parking)}</li>
      </ul>
      <div class="detail-actions">
        <a href="tel:02-0000-0000">${escapeHtml(locale.misc.cta.call)}</a>
        <a href="#inquiry" data-route="inquiry">${escapeHtml(locale.misc.cta.form)}</a>
      </div>
    `;

    const contactLink = el.detailPane.querySelector('a[data-route="contact"]');
    if (contactLink) {
      contactLink.addEventListener("click", (event) => {
        event.preventDefault();
        setRoute("inquiry", true);
      });
    }
  }

  function setMode(mode) {
    state.mode = mode === "map" ? "map" : "list";

    el.modeButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.mode === state.mode);
    });

    el.listPane.classList.toggle("is-hidden", state.mode === "map");
    el.mapPane.classList.toggle("is-hidden", state.mode === "list");

    if (state.mode === "map") {
      ensureMap();
      if (state.map) {
        window.setTimeout(() => {
          state.map.invalidateSize();
          renderMap();
        }, 30);
      }
    }
  }

  function ensureMap() {
    if (state.map || typeof L === "undefined") return;

    state.map = L.map(el.mapCanvas, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([37.534, 127.02], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(state.map);

    state.markerLayer = L.layerGroup().addTo(state.map);
  }

  function renderMap() {
    ensureMap();
    if (!state.map || !state.markerLayer || !state.filtered.length) {
      clearMapMarkers();
      return;
    }

    clearMapMarkers();

    const markers = state.filtered.map((item) => {
      const marker = L.marker([item.lat, item.lng])
        .bindPopup(`<strong>${escapeHtml(item.title)}</strong><br/>${escapeHtml(item.region)} | ${escapeHtml(formatTypeLabel(item.type))}`)
        .on("click", () => {
          selectListing(item.id);
        });
      state.markerLayer.addLayer(marker);
      return marker;
    });

    const group = L.featureGroup(markers);
    state.map.fitBounds(group.getBounds(), { padding: [24, 24], maxZoom: 14 });
  }

  function clearMapMarkers() {
    if (!state.markerLayer) return;
    state.markerLayer.clearLayers();
  }

  function selectListing(id) {
    const listing = state.listings.find((item) => item.id === id);
    trackEvent("listing_detail_view", {
      listingId: id,
      listingTitle: listing ? listing.title : ""
    });
    state.selectedId = id;
    renderSearch();
  }

  async function onContactSubmit(event) {
    const locale = getLocale();
    event.preventDefault();
    const formData = new FormData(el.contactForm);

    const payload = {
      id: createInquiryId(),
      inquiryType: String(formData.get("inquiryType") || ""),
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      message: String(formData.get("message") || ""),
      submittedAt: new Date().toISOString(),
      status: "new"
    };

    if (canUseCloudPublic() && typeof cloudStore.createInquiry === "function") {
      try {
        const remoteInquiry = await cloudStore.createInquiry(payload);
        if (remoteInquiry && typeof remoteInquiry === "object") {
          Object.assign(payload, remoteInquiry);
        }
      } catch (_err) {
        // Keep local fallback.
      }
    }

    const inquiries = loadInquiries().map((item) => normalizeInquiry(item));
    inquiries.push(normalizeInquiry(payload));
    saveInquiriesLocal(inquiries);
    renderInquiryList();
    renderAdminOverview();
    trackEvent("inquiry_submit", {
      inquiryType: payload.inquiryType || locale.misc.cta.form
    });

    const sent = await relayWebhook(payload);
    el.contactForm.reset();

    if (sent) {
      setStatus(el.contactStatus, locale.contact.submitOkWebhook, "ok");
    } else {
      setStatus(el.contactStatus, locale.contact.submitOkLocal, "ok");
    }
  }

  async function relayWebhook(payload) {
    if (!ALERT_WEBHOOK_URL) return false;

    try {
      const res = await fetch(ALERT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (_err) {
      return false;
    }
  }

  async function onAdminSubmit(event) {
    event.preventDefault();

    const formData = new FormData(el.adminForm);
    const idRaw = String(formData.get("id") || "").trim();
    const isEdit = idRaw.length > 0;
    const imageFile = formData.get("imageFile");
    let imageValue = String(formData.get("image") || "").trim();

    if (imageFile instanceof File && imageFile.size > 0) {
      try {
        imageValue = await readFileAsDataUrl(imageFile);
      } catch (_err) {
        setStatus(el.adminStatus, "이미지 업로드에 실패했습니다. 다른 파일로 다시 시도하세요.", "error");
        return;
      }
    }

    const record = {
      id: isEdit ? Number(idRaw) : nextId(state.listings),
      title: String(formData.get("title") || "").trim(),
      type: String(formData.get("type") || "Office"),
      region: String(formData.get("region") || "").trim(),
      category: String(formData.get("category") || "").trim(),
      area: Number(formData.get("area") || 0),
      deposit: Number(formData.get("deposit") || 0),
      monthly: Number(formData.get("monthly") || 0),
      premium: Number(formData.get("premium") || 0),
      floor: Number(formData.get("floor") || 0),
      parking: Number(formData.get("parking") || 0),
      address: String(formData.get("address") || "").trim(),
      lat: Number(formData.get("lat") || 0),
      lng: Number(formData.get("lng") || 0),
      image: imageValue || fallbackImage(),
      summary: String(formData.get("summary") || "").trim(),
      featured: formData.get("featured") === "on",
      createdAt: new Date().toISOString().slice(0, 10)
    };

    if (!isValidListing(record)) {
      setStatus(el.adminStatus, "필수값을 확인하세요. 면적, 좌표, 텍스트 항목이 모두 유효해야 합니다.", "error");
      return;
    }

    if (isEdit) {
      state.listings = state.listings.map((item) => {
        if (item.id !== record.id) return item;
        return { ...item, ...record, createdAt: item.createdAt };
      });
      setStatus(el.adminStatus, `매물 #${record.id} 수정 완료`, "ok");
      trackEvent("listing_update", { listingId: record.id });
    } else {
      state.listings = [record, ...state.listings];
      setStatus(el.adminStatus, `매물 #${record.id} 등록 완료`, "ok");
      trackEvent("listing_create", { listingId: record.id });
    }

    saveListings(state.listings);
    clearAdminForm();
    refreshRegionOptions();
    applyFilters();
    renderProjectPage();
    renderAdminOverview();
  }

  function startEditListing(id) {
    const item = state.listings.find((entry) => entry.id === id);
    if (!item) return;

    setAdminField("id", item.id);
    setAdminField("title", item.title);
    setAdminField("type", item.type);
    setAdminField("region", item.region);
    setAdminField("category", item.category);
    setAdminField("area", item.area);
    setAdminField("deposit", item.deposit);
    setAdminField("monthly", item.monthly);
    setAdminField("premium", item.premium);
    setAdminField("floor", item.floor);
    setAdminField("parking", item.parking);
    setAdminField("address", item.address);
    setAdminField("lat", item.lat);
    setAdminField("lng", item.lng);
    setAdminField("image", item.image);
    setAdminField("summary", item.summary);
    const imageFile = el.adminForm.elements.namedItem("imageFile");
    if (imageFile) imageFile.value = "";

    const featured = el.adminForm.elements.namedItem("featured");
    if (featured) featured.checked = Boolean(item.featured);

    setRoute("admin", true);
    setAdminPanel("listing");
    setStatus(el.adminStatus, `매물 #${item.id} 수정 모드`, "ok");
  }

  function deleteListing(id) {
    const item = state.listings.find((entry) => entry.id === id);
    if (!item) return;

    if (!window.confirm(`매물 #${id} (${item.title})을 삭제할까요?`)) {
      return;
    }

    state.listings = state.listings.filter((entry) => entry.id !== id);
    saveListings(state.listings);
    refreshRegionOptions();
    applyFilters();
    renderProjectPage();
    setStatus(el.adminStatus, `매물 #${id} 삭제 완료`, "ok");
    renderAdminOverview();
  }

  function renderAdminList() {
    if (!state.listings.length) {
      el.adminList.innerHTML = "<p>등록된 매물이 없습니다.</p>";
      return;
    }

    const rows = [...state.listings].sort((a, b) => b.id - a.id);

    el.adminList.innerHTML = rows
      .map((item) => {
        return `
          <article class="admin-item">
            <h4>#${item.id} ${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.region)} | ${escapeHtml(formatTypeLabel(item.type))} | ${escapeHtml(item.category)} | ${number.format(item.area)} m²</p>
            <p>보증금 ${number.format(item.deposit)}M | 월세 ${number.format(item.monthly)}M | 권리금 ${number.format(item.premium)}M</p>
            <div class="admin-actions">
              <button type="button" data-action="edit" data-id="${item.id}">수정</button>
              <button type="button" data-action="delete" data-id="${item.id}">삭제</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderInquiryList() {
    if (!el.inquiryList) return;

    const allInquiries = [...loadInquiries()]
      .map((item) => normalizeInquiry(item))
      .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
    const filterStage = String(el.inquiryStageFilter ? el.inquiryStageFilter.value : "all");
    const inquiries = filterStage === "all" ? allInquiries : allInquiries.filter((item) => item.stage === filterStage);

    if (!allInquiries.length) {
      el.inquiryList.innerHTML = "<p>접수된 문의가 없습니다.</p>";
      return;
    }

    if (!inquiries.length) {
      el.inquiryList.innerHTML = "<p>선택한 단계의 문의가 없습니다.</p>";
      return;
    }

    el.inquiryList.innerHTML = inquiries
      .map((item) => {
        const submittedLabel = formatDateTime(item.submittedAt);
        const firstTouched = item.firstTouchedAt ? formatDateTime(item.firstTouchedAt) : "미기록";
        const nextLabel = getNextInquiryStageLabel(item.stage);

        return `
          <article class="admin-item inquiry-item ${item.stage === "closed" ? "is-done" : ""}">
            <h4>${escapeHtml(formatInquiryTypeLabel(item.inquiryType))} | ${escapeHtml(item.name || "이름 없음")}</h4>
            <p>${escapeHtml(item.phone || "-")} | ${escapeHtml(item.email || "-")}</p>
            <p>${escapeHtml(item.message || "")}</p>
            <p>접수일 ${escapeHtml(submittedLabel)}</p>
            <p>최초 응답 ${escapeHtml(firstTouched)}</p>
            <div class="admin-actions">
              <span class="stage-badge">${escapeHtml(formatInquiryStageLabel(item.stage))}</span>
              <select class="inquiry-stage-select" data-inquiry-stage data-id="${escapeHtml(item.id)}">
                ${INQUIRY_STAGES.map((stage) => {
                  const selected = stage === item.stage ? "selected" : "";
                  return `<option value="${stage}" ${selected}>${escapeHtml(formatInquiryStageLabel(stage))}</option>`;
                }).join("")}
              </select>
              <button type="button" data-inquiry-action="advance" data-id="${escapeHtml(item.id)}" ${item.stage === "closed" ? "disabled" : ""}>${escapeHtml(nextLabel)}</button>
              <button type="button" data-inquiry-action="delete" data-id="${escapeHtml(item.id)}">삭제</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function migrateInquiries() {
    const current = loadInquiries();
    let changed = false;

    const migrated = current.map((item) => {
      const next = normalizeInquiry(item);
      if (JSON.stringify(next) !== JSON.stringify(item)) {
        changed = true;
      }
      return next;
    });

    if (changed) {
      saveInquiries(migrated);
    }
  }

  function normalizeInquiry(item) {
    const source = item && typeof item === "object" ? item : {};
    const legacyStatus = source.status === "done" ? "closed" : "new";
    const rawStage = String(source.stage || legacyStatus).trim().toLowerCase();
    const stage = INQUIRY_STAGES.includes(rawStage) ? rawStage : "new";

    return {
      id: String(source.id || createInquiryId()),
      inquiryType: String(source.inquiryType || ""),
      name: String(source.name || ""),
      phone: String(source.phone || ""),
      email: String(source.email || ""),
      message: String(source.message || ""),
      submittedAt: String(source.submittedAt || new Date().toISOString()),
      stage,
      firstTouchedAt: source.firstTouchedAt ? String(source.firstTouchedAt) : ""
    };
  }

  function advanceInquiryStage(id) {
    const targetId = String(id);
    const inquiries = loadInquiries().map((item) => normalizeInquiry(item));
    const next = inquiries.map((item) => {
      const normalized = normalizeInquiry(item);
      if (normalized.id !== targetId) return normalized;

      const currentIndex = INQUIRY_STAGES.indexOf(normalized.stage);
      const nextStage = currentIndex >= 0 && currentIndex < INQUIRY_STAGES.length - 1 ? INQUIRY_STAGES[currentIndex + 1] : normalized.stage;
      const now = new Date().toISOString();
      return {
        ...normalized,
        stage: nextStage,
        firstTouchedAt: !normalized.firstTouchedAt && nextStage !== "new" ? now : normalized.firstTouchedAt
      };
    });
    saveInquiries(next);
    renderInquiryList();
    renderAdminOverview();
    renderAnalytics();
    trackEvent("inquiry_stage_update", { inquiryId: targetId });
  }

  function updateInquiryStage(id, stage) {
    const targetId = String(id);
    const nextStage = String(stage || "").trim().toLowerCase();
    if (!INQUIRY_STAGES.includes(nextStage)) return;

    const inquiries = loadInquiries().map((item) => normalizeInquiry(item));
    const next = inquiries.map((item) => {
      if (item.id !== targetId) return item;
      const now = new Date().toISOString();
      return {
        ...item,
        stage: nextStage,
        firstTouchedAt: !item.firstTouchedAt && nextStage !== "new" ? now : item.firstTouchedAt
      };
    });

    saveInquiries(next);
    renderInquiryList();
    renderAdminOverview();
    renderAnalytics();
    trackEvent("inquiry_stage_update", { inquiryId: targetId, stage: nextStage });
  }

  function deleteInquiry(id) {
    const targetId = String(id);
    const inquiries = loadInquiries().map((item) => normalizeInquiry(item));
    const target = inquiries.find((item) => item.id === targetId);
    if (!target) return;

    if (!window.confirm(`${target.name || "이름 없음"}님의 문의를 삭제할까요?`)) {
      return;
    }

    const next = inquiries.filter((item) => item.id !== targetId);
    saveInquiries(next);
    renderInquiryList();
    renderAdminOverview();
    renderAnalytics();
  }

  function clearAllInquiries() {
    if (!window.confirm("문의 데이터를 전체 삭제할까요?")) {
      return;
    }
    saveInquiries([]);
    renderInquiryList();
    renderAdminOverview();
    renderAnalytics();
  }

  function applySiteSettings() {
    const logoText = String(state.siteSettings.logoText || DEFAULT_SITE_SETTINGS.logoText).trim() || "AID";
    const logoImage = String(state.siteSettings.logoImage || "").trim();

    if (el.logoText) {
      el.logoText.textContent = logoText;
    }

    if (el.logoImage) {
      if (logoImage) {
        el.logoImage.src = logoImage;
        el.logoImage.classList.remove("is-hidden");
        if (el.logoText) el.logoText.classList.add("is-hidden");
      } else {
        el.logoImage.removeAttribute("src");
        el.logoImage.classList.add("is-hidden");
        if (el.logoText) el.logoText.classList.remove("is-hidden");
      }
    }
  }

  function syncAssetForm() {
    if (el.logoTextInput) {
      el.logoTextInput.value = String(state.siteSettings.logoText || "AID");
    }
    if (el.logoFileInput) {
      el.logoFileInput.value = "";
    }
  }

  async function onSaveAssets() {
    const next = {
      logoText: String(el.logoTextInput ? el.logoTextInput.value : "").trim() || "AID",
      logoImage: String(state.siteSettings.logoImage || "")
    };

    const file = el.logoFileInput && el.logoFileInput.files ? el.logoFileInput.files[0] : null;

    if (file && file.size > 0) {
      try {
        next.logoImage = await readFileAsDataUrl(file);
      } catch (_err) {
        setStatus(el.assetStatus, "로고 업로드에 실패했습니다. 다른 파일로 시도하세요.", "error");
        return;
      }
    } else if (next.logoText) {
      next.logoImage = "";
    }

    state.siteSettings = next;
    saveSiteSettings(state.siteSettings);
    applySiteSettings();
    syncAssetForm();
    setStatus(el.assetStatus, "로고 설정을 저장했습니다.", "ok");
  }

  function onResetAssets() {
    state.siteSettings = structuredClone(DEFAULT_SITE_SETTINGS);
    saveSiteSettings(state.siteSettings);
    applySiteSettings();
    syncAssetForm();
    setStatus(el.assetStatus, "로고를 기본값으로 복원했습니다.", "ok");
  }

  function clearAdminForm() {
    el.adminForm.reset();
    setAdminField("id", "");
    const imageFile = el.adminForm.elements.namedItem("imageFile");
    if (imageFile) imageFile.value = "";
    setStatus(el.adminStatus, "대기 중", "");
  }

  function setAdminField(name, value) {
    const node = el.adminForm.elements.namedItem(name);
    if (!node) return;
    node.value = String(value);
  }

  function refreshRegionOptions() {
    const locale = getLocale();
    const current = String(el.filterRegion.value || "");

    const regions = [...new Set(state.listings.map((item) => item.region.trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );

    el.filterRegion.innerHTML = `<option value="">${escapeHtml(locale.misc.allRegions)}</option>${regions
      .map((region) => `<option value="${escapeHtml(region.toLowerCase())}">${escapeHtml(region)}</option>`)
      .join("")}`;

    if (current && regions.some((region) => region.toLowerCase() === current)) {
      el.filterRegion.value = current;
    }
  }

  function readFilters() {
    const data = new FormData(el.filterForm);
    const types = new Set(data.getAll("type"));

    if (types.size === 0) {
      types.add("Office");
      types.add("Retail");
      types.add("Residential");
      types.add("Building");
    }

    return {
      types,
      region: String(data.get("region") || "").trim().toLowerCase(),
      category: String(data.get("category") || "").trim().toLowerCase(),
      areaMin: toNumber(data.get("areaMin")),
      areaMax: toNumber(data.get("areaMax")),
      depositMax: toNumber(data.get("depositMax")),
      monthlyMax: toNumber(data.get("monthlyMax")),
      premiumMax: toNumber(data.get("premiumMax")),
      floorMin: toNumber(data.get("floorMin")),
      parkingMin: toNumber(data.get("parkingMin")),
      sort: String(data.get("sort") || "new")
    };
  }

  function sortListings(items, mode) {
    const sorted = [...items];

    if (mode === "monthlyAsc") {
      sorted.sort((a, b) => a.monthly - b.monthly);
    } else if (mode === "depositAsc") {
      sorted.sort((a, b) => a.deposit - b.deposit);
    } else if (mode === "areaDesc") {
      sorted.sort((a, b) => b.area - a.area);
    } else {
      sorted.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    }

    return sorted;
  }

  function isValidListing(item) {
    const hasText =
      item.title.length > 0 &&
      item.region.length > 0 &&
      item.category.length > 0 &&
      item.address.length > 0 &&
      item.summary.length > 0;

    const hasNumbers =
      Number.isFinite(item.area) &&
      Number.isFinite(item.deposit) &&
      Number.isFinite(item.monthly) &&
      Number.isFinite(item.premium) &&
      Number.isFinite(item.floor) &&
      Number.isFinite(item.parking) &&
      Number.isFinite(item.lat) &&
      Number.isFinite(item.lng);

    return hasText && hasNumbers && Math.abs(item.lat) > 0.1 && Math.abs(item.lng) > 0.1;
  }

  function setStatus(target, message, type) {
    if (!target) return;
    target.textContent = message;
    target.classList.remove("ok", "error");
    if (type) target.classList.add(type);
  }

  function trackEvent(type, payload = {}) {
    const event = {
      id: `evt_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      type: String(type || "unknown"),
      route: String(state.currentRoute || "projects"),
      source: String(payload.source || state.sessionSource || "direct"),
      at: new Date().toISOString(),
      ...payload
    };

    state.analytics.events.push(event);
    if (state.analytics.events.length > 4000) {
      state.analytics.events = state.analytics.events.slice(-4000);
    }
    saveAnalytics(state.analytics);
    if (canUseCloudPublic() && typeof cloudStore.pushEvent === "function") {
      cloudStore.pushEvent(event).catch(() => {
        // Ignore remote analytics failures.
      });
    }

    if (state.currentRoute === "admin") {
      renderAnalytics();
    }
  }

  function renderAnalytics() {
    if (!el.analyticsSummary || !el.sourceStats || !el.routeStats || !el.listingStats || !el.seoStats) {
      return;
    }

    const events = Array.isArray(state.analytics.events) ? state.analytics.events : [];
    const sessionEvents = events.filter((item) => item.type === "session_start");
    const routeEvents = events.filter((item) => item.type === "route_view");
    const inquiryEvents = events.filter((item) => item.type === "inquiry_submit");
    const callEvents = events.filter((item) => item.type === "cta_call_click");
    const listingEvents = events.filter((item) => item.type === "project_card_click" || item.type === "listing_detail_view");

    const sessions = sessionEvents.length;
    const pageViews = routeEvents.length;
    const inquiries = inquiryEvents.length;
    const calls = callEvents.length;
    const conversion = sessions ? ((inquiries / sessions) * 100).toFixed(1) : "0.0";
    const inquiryMetrics = getInquiryMetrics();
    const avgResponse = formatResponseTime(inquiryMetrics.avgFirstResponseHours);

    el.analyticsSummary.innerHTML = [
      analyticsCard("세션", number.format(sessions)),
      analyticsCard("페이지뷰", number.format(pageViews)),
      analyticsCard("문의 접수", number.format(inquiries)),
      analyticsCard("전화 클릭", number.format(calls)),
      analyticsCard("문의 전환율", `${conversion}%`),
      analyticsCard("평균 1차 응답", avgResponse)
    ].join("");

    const sourceCounts = countByKey(sessionEvents, (item) => formatSourceLabel(String(item.source || "direct")));
    const routeCounts = countByKey(routeEvents, (item) => formatRouteLabel(String(item.routeTarget || item.route || "projects")));
    const listingCounts = countByKey(listingEvents, (item) => String(item.listingTitle || `매물 #${item.listingId || "-"}`));

    el.sourceStats.innerHTML = renderCountRows(sourceCounts);
    el.routeStats.innerHTML = renderCountRows(routeCounts);
    el.listingStats.innerHTML = renderCountRows(listingCounts);
    el.seoStats.innerHTML = renderSeoRows(getSeoHealthChecks());
  }

  function analyticsCard(label, value) {
    return `
      <article class="analytics-card">
        <p class="label">${escapeHtml(label)}</p>
        <p class="value">${escapeHtml(String(value))}</p>
      </article>
    `;
  }

  function countByKey(items, resolver) {
    const map = new Map();
    items.forEach((item) => {
      const key = String(resolver(item) || "-").trim() || "-";
      map.set(key, (map.get(key) || 0) + 1);
    });

    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }

  function renderCountRows(rows) {
    if (!rows.length) {
      return '<p class="analytics-row"><span>데이터 없음</span><span class="value">-</span></p>';
    }

    return rows
      .map(([label, value]) => {
        return `<p class="analytics-row"><strong>${escapeHtml(label)}</strong><span class="value">${number.format(value)}</span></p>`;
      })
      .join("");
  }

  function getSeoHealthChecks() {
    const titleText = String(document.querySelector("title")?.textContent || "").trim();
    const descriptionText = String(document.querySelector('meta[name="description"]')?.getAttribute("content") || "").trim();
    const ogTitle = Boolean(document.querySelector('meta[property="og:title"]')?.getAttribute("content"));
    const ogDescription = Boolean(document.querySelector('meta[property="og:description"]')?.getAttribute("content"));
    const ogImage = Boolean(document.querySelector('meta[property="og:image"]')?.getAttribute("content"));
    const canonical = Boolean(document.querySelector('link[rel="canonical"]')?.getAttribute("href"));
    const h1Count = document.querySelectorAll("h1").length;
    const images = [...document.querySelectorAll("img")];
    const withAlt = images.filter((img) => String(img.getAttribute("alt") || "").trim().length > 0).length;
    const altRatio = images.length ? Math.round((withAlt / images.length) * 100) : 100;

    return [
      {
        label: "타이틀 길이",
        value: `${titleText.length}자`,
        status: titleText.length >= 30 && titleText.length <= 60 ? "ok" : "warn"
      },
      {
        label: "메타 설명 길이",
        value: `${descriptionText.length}자`,
        status: descriptionText.length >= 70 && descriptionText.length <= 160 ? "ok" : "warn"
      },
      {
        label: "OG 태그",
        value: ogTitle && ogDescription && ogImage ? "정상" : "누락",
        status: ogTitle && ogDescription && ogImage ? "ok" : "warn"
      },
      {
        label: "캐노니컬",
        value: canonical ? "설정됨" : "미설정",
        status: canonical ? "ok" : "warn"
      },
      {
        label: "H1 개수",
        value: String(h1Count),
        status: h1Count >= 1 ? "ok" : "warn"
      },
      {
        label: "이미지 ALT 비율",
        value: `${altRatio}%`,
        status: altRatio >= 95 ? "ok" : "warn"
      }
    ];
  }

  function renderSeoRows(rows) {
    if (!rows.length) {
      return '<p class="analytics-row"><span>데이터 없음</span><span class="value">-</span></p>';
    }

    return rows
      .map((row) => {
        const cls = row.status === "ok" ? "seo-ok" : "seo-warn";
        return `<p class="analytics-row"><strong>${escapeHtml(row.label)}</strong><span class="value ${cls}">${escapeHtml(row.value)}</span></p>`;
      })
      .join("");
  }

  function renderAdminOverview() {
    if (!el.adminOverviewStats || !el.adminAlertList) return;

    const inquiryMetrics = getInquiryMetrics();
    const totalListings = state.listings.length;
    const closeRate = inquiryMetrics.total ? ((inquiryMetrics.closed / inquiryMetrics.total) * 100).toFixed(1) : "0.0";

    el.adminOverviewStats.innerHTML = [
      analyticsCard("총 매물", number.format(totalListings)),
      analyticsCard("신규 문의", number.format(inquiryMetrics.newCount)),
      analyticsCard("오늘 문의", number.format(inquiryMetrics.todayCount)),
      analyticsCard("계약 완료", `${number.format(inquiryMetrics.closed)} (${closeRate}%)`),
      analyticsCard("평균 1차 응답", formatResponseTime(inquiryMetrics.avgFirstResponseHours))
    ].join("");

    const alerts = [];
    if (inquiryMetrics.staleNewCount > 0) {
      alerts.push({ label: "24시간 이상 미응답", value: `${number.format(inquiryMetrics.staleNewCount)}건` });
    }
    if (inquiryMetrics.holdCount > 0) {
      alerts.push({ label: "보류 상태 문의", value: `${number.format(inquiryMetrics.holdCount)}건` });
    }
    if (inquiryMetrics.newCount === 0) {
      alerts.push({ label: "신규 문의", value: "현재 없음" });
    }
    if (totalListings < 4) {
      alerts.push({ label: "권장 매물 수", value: `메인 노출용 최소 4개 권장 (현재 ${number.format(totalListings)}개)` });
    }
    if (!alerts.length) {
      alerts.push({ label: "운영 상태", value: "확인 필요 항목 없음" });
    }

    el.adminAlertList.innerHTML = alerts
      .map((item) => `<p class="analytics-row"><strong>${escapeHtml(item.label)}</strong><span class="value">${escapeHtml(item.value)}</span></p>`)
      .join("");
  }

  function getInquiryMetrics() {
    const inquiries = loadInquiries().map((item) => normalizeInquiry(item));
    const now = Date.now();
    const todayKey = new Date().toISOString().slice(0, 10);
    const firstResponseHours = [];
    let staleNewCount = 0;

    inquiries.forEach((item) => {
      if (item.stage === "new") {
        const ageHours = (now - new Date(item.submittedAt).getTime()) / (1000 * 60 * 60);
        if (Number.isFinite(ageHours) && ageHours >= 24) {
          staleNewCount += 1;
        }
      }

      if (item.firstTouchedAt) {
        const elapsed = (new Date(item.firstTouchedAt).getTime() - new Date(item.submittedAt).getTime()) / (1000 * 60 * 60);
        if (Number.isFinite(elapsed) && elapsed >= 0) {
          firstResponseHours.push(elapsed);
        }
      }
    });

    const avgFirstResponseHours =
      firstResponseHours.length > 0 ? firstResponseHours.reduce((sum, value) => sum + value, 0) / firstResponseHours.length : null;

    return {
      total: inquiries.length,
      newCount: inquiries.filter((item) => item.stage === "new").length,
      contactedCount: inquiries.filter((item) => item.stage === "contacted").length,
      meetingCount: inquiries.filter((item) => item.stage === "meeting").length,
      activeCount: inquiries.filter((item) => item.stage === "active").length,
      closed: inquiries.filter((item) => item.stage === "closed").length,
      holdCount: inquiries.filter((item) => item.stage === "hold").length,
      todayCount: inquiries.filter((item) => String(item.submittedAt || "").slice(0, 10) === todayKey).length,
      staleNewCount,
      avgFirstResponseHours
    };
  }

  function formatResponseTime(hours) {
    if (hours === null || !Number.isFinite(hours)) return "데이터 없음";
    if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}분`;
    if (hours < 24) return `${hours.toFixed(1)}시간`;
    return `${(hours / 24).toFixed(1)}일`;
  }

  function formatSourceLabel(source) {
    const normalized = String(source || "").toLowerCase();
    if (normalized.startsWith("utm:")) return `UTM (${normalized.replace("utm:", "").toUpperCase()})`;
    if (normalized === "direct") return "직접 유입";
    if (normalized === "search") return "검색 유입";
    if (normalized === "social") return "소셜 유입";
    if (normalized === "referral") return "추천 유입";
    return source || "-";
  }

  function formatRouteLabel(route) {
    const map = {
      projects: STATIC_NAV_LABELS.projects,
      company: STATIC_NAV_LABELS.company,
      search: STATIC_NAV_LABELS.search,
      partners: STATIC_NAV_LABELS.partners,
      contact: STATIC_NAV_LABELS.contact,
      inquiry: "INQUIRY",
      admin: "ADMIN"
    };
    return map[String(route || "").toLowerCase()] || route || "-";
  }

  function formatTypeLabel(type) {
    const locale = getLocale();
    const labels = Array.isArray(locale.search && locale.search.types) ? locale.search.types : [];
    const map = {
      office: labels[0] || "Office",
      retail: labels[1] || "Retail",
      residential: labels[2] || "Residential",
      building: labels[3] || "Building"
    };
    return map[String(type || "").toLowerCase()] || String(type || "-");
  }

  function formatInquiryStageLabel(stage) {
    const key = String(stage || "").trim().toLowerCase();
    return INQUIRY_STAGE_LABELS[key] || "신규";
  }

  function formatInquiryTypeLabel(type) {
    const map = {
      "location consultation": "입지 컨설팅",
      "hq development": "HQ 개발",
      "asset management": "자산 운영",
      "listing inquiry": "매물 문의",
      "general inquiry": "일반 문의",
      general: "일반 문의"
    };
    const key = String(type || "").trim().toLowerCase();
    return map[key] || String(type || "일반 문의");
  }

  function getNextInquiryStageLabel(stage) {
    const key = String(stage || "").trim().toLowerCase();
    const index = INQUIRY_STAGES.indexOf(key);
    if (index < 0 || index >= INQUIRY_STAGES.length - 1) return "완료";
    return `${formatInquiryStageLabel(INQUIRY_STAGES[index + 1])}로 이동`;
  }

  function applyTheme(themeInput) {
    const matched = getThemeByTone(themeInput && themeInput.tone ? themeInput.tone : "");
    const next = {
      tone: String(matched ? matched.tone : themeInput && themeInput.tone ? themeInput.tone : DEFAULT_THEME.tone),
      bg: String(matched ? matched.bg : themeInput && themeInput.bg ? themeInput.bg : DEFAULT_THEME.bg),
      glowRgb:
        normalizeGlowRgb(matched ? matched.glowRgb : themeInput && themeInput.glowRgb ? themeInput.glowRgb : "") ||
        hexToRgb(matched ? matched.bg : themeInput && themeInput.bg ? themeInput.bg : DEFAULT_THEME.bg)
    };

    state.theme = next;
    document.documentElement.style.setProperty("--content-bg", next.bg);
    document.documentElement.style.setProperty("--lamp-glow-rgb", next.glowRgb);
    saveTheme(next);
  }

  function loadTheme() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.theme);
      if (!raw) return structuredClone(DEFAULT_THEME);
      const parsed = JSON.parse(raw);
      const matched = getThemeByTone(parsed.tone);
      return {
        tone: String(matched ? matched.tone : parsed.tone || DEFAULT_THEME.tone),
        bg: String(matched ? matched.bg : parsed.bg || DEFAULT_THEME.bg),
        glowRgb: normalizeGlowRgb(String(matched ? matched.glowRgb : parsed.glowRgb || "")) || hexToRgb(String(matched ? matched.bg : parsed.bg || DEFAULT_THEME.bg))
      };
    } catch (_err) {
      return structuredClone(DEFAULT_THEME);
    }
  }

  function loadLanguage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.language);
      return normalizeLanguage(raw);
    } catch (_err) {
      return "ko";
    }
  }

  function getThemeByTone(tone) {
    const key = String(tone || "").trim().toLowerCase();
    return LAMP_THEMES.find((item) => item.tone === key) || null;
  }

  function getNextTheme(currentTone) {
    const current = getThemeByTone(currentTone) || DEFAULT_THEME;
    const currentIndex = LAMP_THEMES.findIndex((item) => item.tone === current.tone);
    if (currentIndex < 0) return structuredClone(LAMP_THEMES[0]);
    const nextIndex = (currentIndex + 1) % LAMP_THEMES.length;
    return structuredClone(LAMP_THEMES[nextIndex]);
  }

  function saveTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
  }

  function saveLanguage(language) {
    try {
      localStorage.setItem(STORAGE_KEYS.language, normalizeLanguage(language));
    } catch (_err) {
      // no-op
    }
  }

  function normalizeGlowRgb(value) {
    const text = String(value || "").trim();
    const matched = text.match(/^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/);
    if (!matched) return "";
    const r = clamp(Number(matched[1]), 0, 255);
    const g = clamp(Number(matched[2]), 0, 255);
    const b = clamp(Number(matched[3]), 0, 255);
    return `${r}, ${g}, ${b}`;
  }

  function hexToRgb(value) {
    const raw = String(value || "").trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(raw)) return DEFAULT_THEME.glowRgb;
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }

  function debounce(fn, wait) {
    let timer = null;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), wait);
    };
  }

  function loadListings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.listings);
      if (!raw) return structuredClone(DEFAULT_LISTINGS);
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : structuredClone(DEFAULT_LISTINGS);
    } catch (_err) {
      return structuredClone(DEFAULT_LISTINGS);
    }
  }

  function saveListings(listings) {
    saveListingsLocal(listings);
    if (!canUseCloudAdmin() || typeof cloudStore.setListings !== "function") return;
    cloudStore
      .setListings(listings)
      .then((ok) => {
        if (!ok) {
          // Keep local data if remote save fails.
        }
      })
      .catch(() => {
        // Ignore remote failure and keep local fallback.
      });
  }

  function saveListingsLocal(listings) {
    localStorage.setItem(STORAGE_KEYS.listings, JSON.stringify(listings));
  }

  function loadInquiries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.inquiries);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function saveInquiries(inquiries) {
    saveInquiriesLocal(inquiries);
    if (!canUseCloudAdmin() || typeof cloudStore.setInquiries !== "function") return;
    cloudStore
      .setInquiries(inquiries)
      .then((ok) => {
        if (!ok) {
          // Keep local data if remote save fails.
        }
      })
      .catch(() => {
        // Ignore remote failure and keep local fallback.
      });
  }

  function saveInquiriesLocal(inquiries) {
    localStorage.setItem(STORAGE_KEYS.inquiries, JSON.stringify(inquiries));
  }

  function loadAnalytics() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.analytics);
      if (!raw) return structuredClone(DEFAULT_ANALYTICS);
      const parsed = JSON.parse(raw);
      return {
        events: Array.isArray(parsed.events) ? parsed.events : []
      };
    } catch (_err) {
      return structuredClone(DEFAULT_ANALYTICS);
    }
  }

  function saveAnalytics(analytics) {
    saveAnalyticsLocal(analytics);
  }

  function saveAnalyticsLocal(analytics) {
    localStorage.setItem(STORAGE_KEYS.analytics, JSON.stringify(analytics));
  }

  function detectTrafficSource() {
    const params = new URLSearchParams(location.search);
    const utmSource = String(params.get("utm_source") || "").trim().toLowerCase();
    if (utmSource) {
      return `utm:${utmSource}`;
    }

    const ref = String(document.referrer || "").toLowerCase();
    if (!ref) return "direct";

    const searchEngines = ["google.", "bing.", "naver.", "daum.", "yahoo.", "duckduckgo."];
    if (searchEngines.some((item) => ref.includes(item))) return "search";

    const socials = ["instagram.", "facebook.", "t.co", "twitter.", "linkedin.", "youtube.", "reddit."];
    if (socials.some((item) => ref.includes(item))) return "social";

    return "referral";
  }

  function loadSiteSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.siteSettings);
      if (!raw) return structuredClone(DEFAULT_SITE_SETTINGS);
      const parsed = JSON.parse(raw);
      return {
        logoText: String(parsed.logoText || DEFAULT_SITE_SETTINGS.logoText),
        logoImage: String(parsed.logoImage || "")
      };
    } catch (_err) {
      return structuredClone(DEFAULT_SITE_SETTINGS);
    }
  }

  function saveSiteSettings(settings) {
    saveSiteSettingsLocal(settings);
    if (!canUseCloudAdmin() || typeof cloudStore.setSiteSettings !== "function") return;
    cloudStore
      .setSiteSettings(settings)
      .then((ok) => {
        if (!ok) {
          // Keep local settings if remote save fails.
        }
      })
      .catch(() => {
        // Ignore remote failure and keep local fallback.
      });
  }

  function saveSiteSettingsLocal(settings) {
    localStorage.setItem(STORAGE_KEYS.siteSettings, JSON.stringify(settings));
  }

  function createInquiryId() {
    return `inq_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  }

  function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value || "-");
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("file-read-failed"));
      reader.readAsDataURL(file);
    });
  }

  function nextId(items) {
    return items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function toNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function fallbackImage() {
    return "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80";
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
})();







