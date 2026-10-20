// 입찰 창구 404호 — 게임 데이터 (기획: work/design/game-design.md)
// 업체명·인명·주소·등록번호·IP는 모두 가상이다. IP는 가운데를 xx로 가린다.
// 선택 필드(엔진이 안 써도 됨): applicant.brief(결과 화면 한 줄 근거), rules.*.easy(쉬운 말), day.date, day.tender, applicant.tip(튜토리얼 팀장 안내), applicant.clue(5일 폭로용 단서 메모), rules.*.check
window.GAME_DATA = {
  title: "입찰 창구 404호",
  subtitle: "공정하게, 하지만 억울하지 않게",

  rules: {
    paper: {
      law: "국가계약법 시행령 제12조(입찰참가자격)·입찰자격 사실조사",
      tip: "현장 사진·인원·주소를 등록증과 맞춰 봐요",
      name: "페이퍼컴퍼니",
      short: "사무실·직원 없는 서류상 회사",
      easy: "반려 = 서류를 돌려보내 입찰에서 빼는 것",
      check: "현장 사진·근무 인원·주소가 맞는지 본다(공사·물품 모두)",
      reason: "페이퍼컴퍼니 의심 — 서류와 현장이 다름",
      newsBad: "사무실도 직원도 없는 '{company}', {item} 계약 따내",
      why: "공사는 '입찰자격 사실조사'로 사무실·기술자를 현장에서 본다. 물품도 서류가 실제와 다르면 반려.", // 규정집(한 쪽 2개)용 짧은 설명
      ex: "예) 현장 사진이 풀밭인데 상시 인원 5명 → 반려",
      learn: "공사 입찰은 '입찰자격 사실조사'로 낙찰 예정 업체의 사무실·기술자·자본금을 서류와 현장에서 본다. 물품도 등록 서류가 실제와 다르면 반려하고, 2026년 11월부터는 의심 업체에 입찰보증금도 물린다.",
      source: "https://www.heraldk.com/article/2026042819340056096"
    },
    staffdup: {
      law: "건설산업기본법 제10조(건설업 등록기준)",
      tip: "기술인력 이름을 기록판 명부와 대조해요",
      name: "유령 기술인력",
      short: "명부에만 있고 실제론 없는 기술자",
      easy: "명부 = 회사에 일하는 기술자 이름을 적은 표",
      check: "같은 이름이 다른 회사 명부에도 있는지 보고, 비고 칸도 본다",
      reason: "기술인력 기준 미달 의심 — 이중 등재·명의 대여",
      newsBad: "기술자 이름만 빌린 '{company}', {item} 맡아",
      why: "기술자를 실제로 고용해야 등록 기준을 채운다. 다른 회사 명부에도 있는 이름은 인정 안 된다.", // 규정집(한 쪽 2개)용 짧은 설명
      ex: "예) 명부의 기술자가 다른 회사 명부에도 있음 → 반려",
      learn: "건설업체는 정해진 수의 기술자를 실제로 고용해야 한다. 다른 회사에도 이름이 올라 있거나 월급을 안 받는 기술자는 인정되지 않는다.",
      source: "https://www.daeryunlaw.com/newsletter/news/184"
    },
    collusion: {
      law: "공정거래법 제40조(부당한 공동행위 금지)",
      tip: "기록판에서 IP·금액을 앞 업체와 비교해요",
      name: "입찰 담합 징후",
      short: "업체끼리 미리 짜고 값을 맞춤",
      easy: "투찰 IP = 입찰서를 보낸 컴퓨터 주소. 같으면 한 컴퓨터에서 낸 입찰서",
      check: "기록판에서 같은 IP·짠 듯한 금액을 본다",
      reason: "담합 징후 — 공정위 조사 의뢰",
      stampNote: "반려 + 조사 의뢰",
      newsBad: "짜고 친 입찰? 같은 IP의 '{company}', {item} 낙찰",
      why: "짜고 값을 맞추면 나랏돈이 더 든다. 의심되면 공정위에 조사를 맡기고, 확정은 조사가 한다.", // 규정집(한 쪽 2개)용 짧은 설명
      ex: "예) 앞 업체와 투찰 IP가 같음 → 반려 + 조사 의뢰",
      learn: "업체끼리 값을 미리 짜면 나랏돈이 더 든다. 조달청은 입찰 기록을 분석해 담합이 의심되면 공정거래위원회에 조사를 맡긴다. 확정은 조사가 한다.",
      source: "https://m.go.seoul.co.kr/news/2014/11/04/20141104800139"
    },
    banned: {
      law: "국가계약법 제27조(부정당업자 입찰참가자격 제한)",
      tip: "제재 명단의 상호·대표자를 둘 다 대조해요",
      name: "부정당업자 제재",
      short: "규칙을 어겨 입찰이 막힌 업체",
      easy: "부정당업자 = 나라 계약에서 속이거나 약속을 어긴 업체",
      check: "규정집 제재 명단과 업체명·대표자를 대조한다",
      reason: "입찰참가자격 제한 기간 중 — 부정당업자",
      newsBad: "입찰 제한 중인 대표의 '{company}', {item} 따내",
      why: "속이거나 약속을 어긴 업체는 국가계약법 제27조로 최대 2년 입찰 제한.", // 규정집(한 쪽 2개)용 짧은 설명
      ex: "예) 회사 이름은 새것, 대표자는 제재 명단의 사람 → 반려",
      learn: "나라 계약에서 속이거나 약속을 어긴 업체는 국가계약법 제27조에 따라 최대 2년 동안 나라 입찰에 들어올 수 없다.",
      source: "https://www.law.go.kr/법령/국가를당사자로하는계약에관한법률/제27조"
    },
    safety: {
      law: "조달청 다수공급자계약 업무처리규정(2026.7 개정)",
      tip: "공표 기업인지, 다수공급자 신규인지 봐요",
      name: "중대재해 기업",
      short: "중대재해로 노동부가 공표한 회사",
      easy: "다수공급자계약 = '나라 쇼핑몰 입점'. 기관이 여기서 여러 업체 물건을 골라 산다",
      check: "사고 기록만 보고 반려하지 말고, 계약 방식이 다수공급자계약인지·'공표 기업'인지 본다",
      reason: "중대재해 공표 기업 — 다수공급자계약 신규 진입 2년 제한",
      newsBad: "사망사고 공표 기업 '{company}', {item} 새로 등록",
      why: "2026.7 개정: 사망사고 공표 기업은 2년간 다수공급자계약 신규 금지.", // 규정집(한 쪽 2개)용 짧은 설명
      ex: "예) 공표 기업이 다수공급자계약 '신규' → 반려 (사고 기록만으론 통과)",
      learn: "2026년 7월 규정 개정으로, 개정 뒤 일어난 사망사고로 노동부가 공표한 기업은 2년 동안 다수공급자계약에 새로 못 들어온다. 사고 기록만으로 막는 건 아니다.",
      source: "https://www.dailian.co.kr/news/view/1672142/"
    },
    innovexp: {
      law: "혁신제품 지정 제도(지정 뒤 3년 수의계약 특례)",
      tip: "혁신 지정 유효기간을 오늘 날짜와 비교해요",
      name: "혁신제품 기간 만료",
      short: "혁신제품 특례 기간이 끝남",
      easy: "수의계약 특례 = 경쟁입찰 없이 바로 사 주는 혜택",
      check: "혁신제품 지정서의 유효기간을 오늘 날짜와 비교한다",
      reason: "혁신제품 수의계약 특례 기간 지남",
      newsBad: "특례 기간 끝난 혁신제품, '{company}' 경쟁 없이 납품",
      why: "혁신제품은 지정 뒤 3년 동안 경쟁 없이 바로 산다. 기간이 끝나면 특례도 끝.", // 규정집(한 쪽 2개)용 짧은 설명
      ex: "예) 유효기간 2026.10.31인데 오늘은 11.6 → 반려",
      learn: "혁신제품으로 지정되면 3년 동안 경쟁입찰 없이 바로 살 수 있다. 새로 생긴 회사여도 된다. 다만 기간이 끝나면 이 특례를 못 쓴다.",
      source: "https://pps.go.kr/kor/content.do?key=00648"
    }
  },


  // 연수(튜토리얼): 본편 전에 통과 1건·반려 1건. 점수·집계에 안 들어간다
  tutorial: {
    intro: [
      { who: "boss", face: "normal", text: "본 근무 전에 연수부터 해요. 연수용 모의 서류 두 건이고, 점수엔 안 들어가요." },
      { who: "boss", face: "happy", text: "하나는 통과, 하나는 반려예요. 제가 짚는 칸을 직접 눌러 보며 따라와요." }
    ],
    outro: [
      { who: "boss", face: "happy", text: "연수 끝! 순서만 기억해요. 탭을 다 넘기고, 등록증과 현장 확인을 맞춰 보고, 이상한 칸에 동그라미 뒤 반려." },
      { who: "boss", face: "normal", text: "본 근무부터는 시계가 가요. 검사하는 동안만 흐르고, 규정집을 펼치면 멈춰요. 틀리면 무엇을 놓쳤는지 바로 보여 줄게요." }
    ],
    applicants: [
      { id: "t1", brief: "작은 문구점, 주소 같고 2명 근무", sprite: "stationer", face: "normal",
        docs: {
          bid: { company: "행복문구", item: "행복초 학용품 1년 납품", amount: "4,800,000원" },
          reg: { company: "행복문구", rep: "문정희", addr: "행복시 학교앞길 5", opened: "1992.03.02", regno: "107-90-22031" },
          site: { photo: "office", addr: "행복시 학교앞길 5", staff: "2명", note: "문구점 겸 사무실, 2명 근무" }
        },
        flaw: null, aiAlert: null,
        say: { enter: "안녕하세요, 학교 앞 행복문구예요. 30년째 아이들 공책 팔아요.", pass: "고마워요! 새 학기 학용품 꼼꼼히 챙길게요.", reject: "어머, 우리 가게 그대로 있는데요…", caught: "" },
        boss: { correct: "잘했어요. 작고 오래된 가게여도 서류와 현장이 맞으면 통과예요.", wrong: "주소·사진·인원이 다 맞아요. 이상한 칸이 없으면 통과예요." },
        explain: [
          ["등록증", "등록 주소 '행복시 학교앞길 5' — 회사가 있다고 신고한 곳이에요."],
          ["현장 확인", "조사관이 간 주소도 '학교앞길 5'로 같고, 가게가 있고, 상시 인원 2명이 일해요."],
          ["판단", "서류와 현장이 맞아 입찰참가자격을 갖췄어요(국가계약법 시행령 제12조). 그래서 통과예요."],
          ["기억", "작거나 오래된 가게라는 건 반려 사유가 아니에요. 서류와 현장이 맞는지만 봐요."]
        ] },
      { id: "t2", brief: "같은 주소에 가 보니 풀밭, 0명", sprite: "sandman", face: "happy",
        docs: {
          bid: { company: "모래성건설", item: "행복초 담장 보수 공사", amount: "38,000,000원" },
          reg: { company: "모래성건설", rep: "한모래", addr: "행복시 강변로 77", opened: "2026.10.05", regno: "612-81-77012" },
          site: { photo: "emptylot", addr: "행복시 강변로 77", staff: "0명", note: "풀밭, 건물·사람 없음" }
        },
        flaw: { rule: "paper", fields: ["site.photo", "site.staff", "site.note"] }, aiAlert: null,
        say: { enter: "모래성건설입니다. 담장 공사, 저희가 제일 싸게 해 드리죠.", pass: "헤헤, 연수라 다행이네요.", reject: "에이, 서류는 다 맞는데요?", caught: "사, 사무실은… 곧 지을 예정이었어요!" },
        boss: { correct: "정답! 주소는 같아도 그 자리엔 풀밭뿐, 일하는 사람 0명이에요.", wrong: "현장 사진과 상시 인원을 봐요. 풀밭에 0명이에요." },
        explain: [
          ["등록증", "등록 주소 '행복시 강변로 77', 2026년 10월에 문을 연 공사 회사예요. 새 회사인 건 문제가 아니에요."],
          ["현장 확인", "같은 주소에 가 보니 풀밭뿐이고 상시 인원 0명이에요. 공사할 사무실도 사람도 없어요."],
          ["판단", "서류에만 있는 회사(페이퍼컴퍼니) 의심이에요. 입찰자격 사실조사에서 참가자격(국가계약법 시행령 제12조)을 못 채워 반려해요."],
          ["기억", "반려할 땐 근거 칸에 동그라미가 꼭 있어야 해요. 엉뚱한 칸이면 '사유 틀림'으로 점수가 반만 나와요."]
        ] }
    ]
  },

  days: [
    // ───────────────────────── 1일차 ─────────────────────────
    {
      day: 1, sec: 160, date: "2026.11.02 (월)", title: "첫 출근",
      tender: "행복시청 구내식당 새 단장 (공사·물품)",
      newRules: ["paper"], docs: ["bid", "reg", "site"],
      firstTip: "연수 순서대로! 탭을 다 넘기고, 등록증과 현장 확인의 주소·사진·인원을 맞춰 봐요.",
      intro: [
        { who: "boss", face: "normal", text: "어서 와요, 새봄 심사관! 여긴 나라장터 입찰 창구 404호예요." },
        { who: "hero", face: "upset", text: "404호요? 없는 방 아니에요? 인터넷 오류 번호잖아요." },
        { who: "boss", face: "happy", text: "맞아요. 404는 인터넷에서 '찾을 수 없음'이죠. 서류에만 있고 실제론 없는 회사를 찾는 창구라 404호예요." },
        { who: "boss", face: "normal", text: "오늘은 시청 구내식당 새 단장이에요. 공사 업체는 '입찰자격 사실조사'로 사무실·사람이 진짜 있는지 봐요." },
        { who: "boss", face: "normal", text: "수상하면 '반려', 서류를 돌려보내 입찰에서 빼는 거예요. 멀쩡한 곳을 반려하면 감점!" },
        { who: "hero", face: "happy", text: "알겠습니다! 나랏돈, 제가 지킬게요!" }
      ],
      banlist: [],
      applicants: [
        { id: "d1a1", brief: "주소 같고 3명 근무, 낡아도 정상", sprite: "grandpa", face: "normal",
          tip: "위쪽 탭을 눌러 서류 세 장을 다 넘겨 보고, 이상\u00a0없으면 '통과' 도장!",
          docs: {
            bid: { company: "튼튼철물", item: "구내식당 선반 설치 공사", amount: "3,200,000원" },
            reg: { company: "튼튼철물", rep: "강튼튼", addr: "행복시 장터길 8", opened: "1987.04.01", regno: "211-81-30412" },
            site: { pic: "v_hardware", photo: "shop", addr: "행복시 장터길 8", staff: "3명", note: "40년 된 철물점·작업장" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "허허, 새 얼굴이구먼. 선반 고치는 건 우리 집이 최고여.", pass: "고맙네! 식당 선반, 튼튼하게 달아 놓지.", reject: "허… 40년 장사했는데 내가 뭘 잘못했나?", caught: "" },
          boss: { correct: "잘했어요. 주소도 같고 사람도 일하니 문제없어요.", wrong: "사진·주소·인원 다 정상이에요. 이상한 칸이 없으면 통과예요." } },

        { id: "d1a2", brief: "빈 땅 사진에 직원 0명", sprite: "slick", face: "happy",
          tip: "이번엔 이상한 칸을 눌러 빨간 동그라미! 표시한 뒤 '반려' 도장이에요.",
          clue: "등록번호가 404-로 시작",
          docs: {
            bid: { company: "번쩍상사", item: "구내식당 바닥 공사", amount: "52,000,000원" },
            reg: { company: "번쩍상사", rep: "나번쩍", addr: "행복시 구름로 404", opened: "2026.09.30", regno: "404-04-00404" },
            site: { pic: "v_lot404", photo: "emptylot", addr: "행복시 구름로 404", staff: "0명", note: "풀밭뿐, 건물 없음" }
          },
          flaw: { rule: "paper", fields: ["site.photo", "site.staff", "site.note"] }, aiAlert: null,
          say: { enter: "반가워요~ 번쩍상사입니다. 서류는 완벽하죠, 번쩍번쩍!", pass: "역시 신입은 통이 크네~ 다음에 또 봐요!", reject: "쳇, 첫날부터 깐깐하긴.", caught: "푸, 풀밭도 사무실이에요! 자연 친화 사무실!" },
          boss: { correct: "정답! 사진은 빈 땅, 일하는 사람 0명. 서류만 있는 회사예요.", wrong: "현장 사진을 봐요. 빈 땅에 직원 0명이면 페이퍼컴퍼니 의심이에요." } },

        { id: "d1a3", brief: "주소 같고 2명이 매일 생산", trap: "간판이 낡았을 뿐 등록 주소와 확인 주소가 같고 2명이 매일 일해요. 낡음은 반려 사유가 아니에요.", sprite: "granny", face: "normal",
          docs: {
            bid: { company: "두부할매네", item: "구내식당 두부 500모", amount: "1,750,000원" },
            reg: { company: "두부할매네", rep: "오순두", addr: "행복시 장터길 3", opened: "1979.10.15", regno: "315-90-11203" },
            site: { pic: "v_tofu", photo: "kitchen", addr: "행복시 장터길 3", staff: "2명", note: "할머니·손자, 간판 낡음" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "아이고, 젊은 양반. 우리 두부는 새벽 4시에 만들어.", pass: "고마워유! 시청 식당 밥상에 맛난 두부 올라가겄네.", reject: "가게가 낡아서 그런 겨? 두부는 매일 만드는디…", caught: "" },
          boss: { correct: "좋아요! 가게는 낡아도 주소가 같고 두 명이 매일 일해요.", wrong: "겉모습만 보면 안 돼요. 주소 같고 직원 2명이 일하는 정상 업체예요." } },

        { id: "d1a4", brief: "공사 회사인데 근무 0명", sprite: "twinB", face: "normal",
          docs: {
            bid: { company: "구름상사", item: "구내식당 칸막이 공사", amount: "28,400,000원" },
            reg: { company: "구름상사", rep: "나구름", addr: "행복시 바람로 7", opened: "2026.08.11", regno: "520-11-70021" },
            site: { photo: "sharedoffice", addr: "행복시 바람로 7", staff: "0명", note: "우편함만, 사람 없음" }
          },
          flaw: { rule: "paper", fields: ["site.photo", "site.staff", "site.note"] }, aiAlert: null,
          say: { enter: "구름상사요. 칸막이는… 음, 잘 세웁니다.", pass: "휴, 통과다! 형한테 자랑해야지.", reject: "어, 어떻게 알았지?", caught: "직원은… 다들 오늘 쉬는 날이에요." },
          boss: { correct: "정답! 공유 사무실이 문제가 아니라, 우편함만 있고 일하는 사람이 0명이에요.", wrong: "근무 인원을 봐요. 공사 회사인데 일하는 사람이 0명이에요." } },

        { id: "d1a5", brief: "컨테이너여도 4명 근무", sprite: "youngman", face: "normal",
          docs: {
            bid: { company: "코딩두리", item: "구내식당 주문 키오스크", amount: "9,800,000원" },
            reg: { company: "코딩두리", rep: "두리안", addr: "행복시 새싹로 22", opened: "2024.05.20", regno: "622-87-01544" },
            site: { pic: "v_cont4", photo: "container", addr: "행복시 새싹로 22", staff: "4명", note: "컨테이너, 4명 근무" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "안녕하세요! 사무실은 컨테이너지만 실력은 진짜예요.", pass: "앗싸! 줄 안 서는 식당, 키오스크로 만들어 볼게요!", reject: "컨테이너라서요…? 저희 넷이 매일 출근하는데요.", caught: "" },
          boss: { correct: "맞아요. 컨테이너여도 주소 같고 4명이 일하면 진짜 회사예요.", wrong: "사무실이 작거나 허름한 건 죄가 아니에요. 사람이 일하잖아요." } },

        { id: "d1a6", brief: "주소·사진·11명 모두 맞음", sprite: "auntie", face: "happy",
          docs: {
            bid: { company: "반들반들청소", item: "주방 벽 타일 보수 공사", amount: "27,900,000원" },
            reg: { company: "반들반들청소", rep: "윤반들", addr: "행복시 공정로 12", opened: "2015.02.02", regno: "418-82-55010" },
            site: { pic: "v_clean", photo: "office", addr: "행복시 공정로 12", staff: "11명", note: "타일·청소 장비 보관, 9명 현장" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "반들반들청소예요! 우리 팀 열한 명, 손이 아주 빨라요.", pass: "고마워요! 주방 벽 반짝반짝하게 붙여 놓을게요.", reject: "어머, 우리 서류 다 맞는데요?", caught: "" },
          boss: { correct: "정답. 주소·사진·인원 모두 맞아요.", wrong: "어디가 이상했나요? 이 업체는 서류와 현장이 다 맞아요." } },

        { id: "d1a7", brief: "등록 주소 ≠ 현장 주소(남의 창고)", sprite: "twinA", face: "normal",
          docs: {
            bid: { company: "안개무역", item: "구내식당 김 3만 봉", amount: "14,600,000원" },
            reg: { company: "안개무역", rep: "나안개", addr: "행복시 공정로 21", opened: "2026.07.01", regno: "530-12-70032" },
            site: { photo: "warehouse", addr: "행복시 공정로 99", staff: "1명", note: "관리인 1명, 다른 회사 물건" }
          },
          flaw: { rule: "paper", fields: ["reg.addr", "site.addr", "site.note"] }, aiAlert: null,
          say: { enter: "안개무역입니다. 김은… 바삭합니다.", pass: "후, 동생보다 내가 낫네.", reject: "주소 한 글자 갖고 너무하시네.", caught: "아, 그 주소… 이사 가는 중이라서요." },
          boss: { correct: "정답! 창고는 진짜지만 등록 주소(21)와 확인 주소(99)가 달라요. 남의 창고예요.", wrong: "창고·관리인이 있어도 등록증 주소(21)와 현장 주소(99)가 달라요. 두 서류를 맞춰 봐야 보여요." } }
      ],
      outro: [
        { who: "boss", face: "happy", text: "첫날 수고했어요! 공사 업체는 사실조사로, 물품 업체는 서류와 현장이 달라서 걸렀어요.",
          ifMissed: { face: "normal", text: "첫날 수고했어요. 공사 업체는 사실조사로, 물품 업체는 서류와 현장을 맞춰 보며 걸러요." } },
        { who: "hero", face: "normal", text: "할머니 가게가 낡아서 살짝 헷갈렸어요." },
        { who: "boss", face: "normal", text: "그게 오늘의 숙제예요. 낡은 것과 가짜는 달라요." }
      ],
      news: {
        good: "[행복일보] 시청 구내식당 입찰, 서류만 있는 회사 모두 걸러져",
        bad: "[행복일보] 빈 땅 회사가 식당 공사 계약… 공사는 언제 하나"
      },
      learn: "공사는 '입찰자격 사실조사'로 사무실·사람을 현장에서 본다. 물품도 서류가 실제와 다르면 반려, 11월부터 의심 업체엔 입찰보증금. 작고 낡아도 실제로 일하면 정상이다."
    },

    // ───────────────────────── 2일차 ─────────────────────────
    {
      day: 2, sec: 145, date: "2026.11.03 (화)", title: "이름만 있는 기술자",
      firstTip: "새 서류 '기술인력' 탭이 생겼어요. 이름이 다른 회사 명부에도 있는지 '기록판'으로 비교해요.",
      tender: "행복초등학교 체육관 보수 공사",
      newRules: ["staffdup"], docs: ["bid", "reg", "site", "staff"],
      intro: [
        { who: "boss", face: "normal", text: "오늘은 체육관 공사예요. 기술인력 명부가 새로 와요." },
        { who: "boss", face: "normal", text: "공사 회사는 기술자를 실제로 둬야 해요. 이름만 빌리면 안 되고요." },
        { who: "hero", face: "upset", text: "이름만 빌린다고요? 그럼 공사는 누가 해요?" },
        { who: "boss", face: "happy", text: "그러니까 우리가 보는 거죠. 같은 이름이 두 번 나오면 수상해요!" }
      ],
      banlist: [],
      applicants: [
        { id: "d2a1", brief: "기술자 3명 보험 가입 확인", sprite: "builder", face: "happy",
          docs: {
            bid: { company: "튼튼건설", item: "체육관 지붕 보수", amount: "86,500,000원" },
            reg: { company: "튼튼건설", rep: "배튼튼", addr: "행복시 다리로 5", opened: "2008.06.10", regno: "137-81-24680" },
            site: { pic: "v_build_tt", photo: "office", addr: "행복시 다리로 5", staff: "14명", note: "10명 현장, 장비 창고 있음" },
            staff: { p1: "최성실 · 건축기사", p2: "한바름 · 토목기사", p3: "오꼼꼼 · 안전관리자", note: "4대보험 가입 확인" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "튼튼건설입니다! 우리 최성실 기사가 지붕 박사예요.", pass: "좋습니다! 비 새는 체육관, 싹 고쳐 놓죠.", reject: "아니, 우리 기사님들 다 진짜 사람인데요!", caught: "" },
          boss: { correct: "정답. 기술자 세 명 다 보험 가입까지 확인됐어요.", wrong: "명부 비고를 봐요. 보험까지 확인된 진짜 기술자들이에요." } },

        { id: "d2a2", brief: "영양사·조리사 모두 상근", sprite: "chef", face: "normal",
          docs: {
            bid: { company: "냠냠급식", item: "공사 기간 도시락", amount: "6,300,000원" },
            reg: { company: "냠냠급식", rep: "정냠냠", addr: "행복시 맛길 17", opened: "2012.03.05", regno: "214-86-90123" },
            site: { pic: "v_canteen", photo: "kitchen", addr: "행복시 맛길 17", staff: "9명", note: "9명 교대, 지금 조리 2명" },
            staff: { p1: "정맛나 · 영양사", p2: "고소해 · 조리기능사", p3: "-", note: "상근 확인" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "공사하시는 분들 밥은 저희가! 오늘 메뉴는 제육이에요.", pass: "감사합니다! 따끈하게 배달할게요.", reject: "영양사님도 매일 출근하시는데…", caught: "" },
          boss: { correct: "좋아요. 영양사·조리사 모두 상근이에요.", wrong: "명부에 이상이 없어요. 칸이 비어 있는 건 문제가 아니에요." } },

        { id: "d2a3", brief: "엄명의 기사 급여 기록 없음", sprite: "clerk", face: "upset", speaker: "경리",
          docs: {
            bid: { company: "대충전기", item: "체육관 조명 교체", amount: "21,000,000원" },
            reg: { company: "대충전기", rep: "대충해", addr: "행복시 번개로 3", opened: "2021.09.09", regno: "305-81-44120" },
            site: { pic: "v_elec", photo: "office", addr: "행복시 번개로 3", staff: "2명", note: "사장·경리 근무" },
            staff: { p1: "대충해 · 전기기사", p2: "엄명의 · 전기기사", p3: "-", note: "엄명의 급여 기록 없음" }
          },
          flaw: { rule: "staffdup", fields: ["staff.p2", "staff.note"] }, aiAlert: null,
          say: { enter: "저, 저기… 사장님 대신 서류 내러 왔어요.", pass: "휴… 사장님한테 안 혼나겠다.", reject: "역시… 저도 좀 이상하다 싶었어요.", caught: "엄명의 기사님은 한 번도 출근 안 하셨어요…" },
          boss: { correct: "정답. 월급을 안 받는 기술자는 이름만 빌린 거예요.", wrong: "명부 비고를 봐요. 급여 기록이 없는 기술자는 인정 안 돼요." } },

        { id: "d2a4", brief: "한바른≠한바름(다른 사람), 3명 근무", trap: "기술인 '한바른'은 튼튼건설 '한바름'과 한 글자 다른 사람이고 자격도 달라요(정보처리기사·토목기사). 이름은 한 글자까지 대조해요.", sprite: "startup", face: "happy",
          docs: {
            bid: { company: "반디랩", item: "체육관 절전 센서", amount: "12,400,000원" },
            reg: { company: "반디랩", rep: "반지현", addr: "행복시 새싹로 9", opened: "2026.03.02", regno: "758-87-02211" },
            site: { pic: "v_bandi3", photo: "cowork", addr: "행복시 새싹로 9", staff: "3명", note: "공유오피스, 매일 근무" },
            staff: { p1: "반지현 · 전자기사", p2: "한바른 · 정보처리기사", p3: "-", note: "상근 확인" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "반디랩이에요! 생긴 지 여덟 달 된 따끈한 회사예요.", pass: "와! 첫 공공 납품이에요. 엄마한테 전화해야지!", reject: "회사가 새거라서요…? 저희 셋 매일 일하는데.", caught: "" },
          boss: { correct: "맞아요. 새 회사, 공유오피스여도 사람이 일하면 정상이에요.", wrong: "개업이 최근인 건 문제가 아니에요. 3명이 매일 일해요." } },

        { id: "d2a5", brief: "최성실 = 튼튼건설 기사(이중)", sprite: "slick2", face: "happy",
          clue: "등록번호 404-, 대표 '나반짝'",
          docs: {
            bid: { company: "반짝종합건설", item: "체육관 바닥 공사", amount: "79,000,000원" },
            reg: { company: "반짝종합건설", rep: "나반짝", addr: "행복시 구름로 404-1", opened: "2026.10.05", regno: "404-04-01404" },
            site: { pic: "v_banjjak", photo: "office", addr: "행복시 구름로 404-1", staff: "3명", note: "사무실 있음" },
            staff: { p1: "최성실 · 건축기사", p2: "나반짝 · 토목기사", p3: "-", note: "" }
          },
          flaw: { rule: "staffdup", fields: ["staff.p1"] }, aiAlert: null,
          say: { enter: "에헴. 반짝종합건설이오. 콧수염은… 원래 있었소.", pass: "흐흐, 이번엔 통과로군.", reject: "이, 이 콧수염이 안 통하다니!", caught: "최성실? 흔한 이름이잖소! 동명이인이오!" },
          boss: { correct: "날카로워요! 최성실 기사는 아까 튼튼건설 명부에 있었죠.", wrong: "명부 1번 이름, 아까 본 것 같지 않아요? 튼튼건설 기사예요." } },

        { id: "d2a6", brief: "작업장·5명·기사 모두 진짜", trap: "'나'씨 성이 수상한 사람들과 같을 뿐, 주소·인원·기술인 모두 맞아요. 성씨는 반려 사유가 아니에요.", sprite: "farmer", face: "happy",
          docs: {
            bid: { company: "푸른들농장", item: "체육관 옥상 텃밭 흙", amount: "2,900,000원" },
            reg: { company: "푸른들농장", rep: "나농부", addr: "행복시 들녘길 40", opened: "2001.04.05", regno: "402-90-12345" },
            site: { pic: "v_farm", photo: "farm", addr: "행복시 들녘길 40", staff: "5명", note: "흙 포장, 2명은 배송 중" },
            staff: { p1: "나농부 · 유기농업기사", p2: "나새싹 · 조경기능사", p3: "-", note: "상근 확인" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "옥상 텃밭 흙이요! 우리 밭 흙이 아주 포실포실해요.", pass: "고맙습니다! 애들이 상추 키우겠네요.", reject: "흙도 반려가 되나요… 허허.", caught: "" },
          boss: { correct: "정답. 작업장·사람·기사 모두 진짜예요.", wrong: "작업장에 다섯 명이 일해요. 이상한 칸이 없어요." } },

        { id: "d2a7", brief: "빈 창고 0명, 기사 연락 안 됨", sprite: "twinA", face: "normal",
          docs: {
            bid: { company: "물안개건설", item: "체육관 외벽 도색", amount: "33,300,000원" },
            reg: { company: "물안개건설", rep: "나안개", addr: "행복시 강변로 1", opened: "2026.09.01", regno: "530-12-70099" },
            site: { pic: "v_wh_rent", photo: "warehouse", addr: "행복시 강변로 1", staff: "0명", note: "빈 창고, 장비 없음" },
            staff: { p1: "도장훈 · 도장기능사", p2: "-", p3: "-", note: "연락 안 됨" }
          },
          flaw: { rule: "paper", fields: ["site.staff", "site.note", "staff.note", "site.photo"] }, aiAlert: null,
          say: { enter: "물안개건설입니다. 어제 김 회사요? 그건 접었어요.", pass: "오, 이번엔 됐다!", reject: "또야? 어제도 그 얼굴이더니.", caught: "창고가 비어 보이는 건… 다 현장에 나가서요." },
          boss: { correct: "정답! 빈 창고에 0명, 기술자는 연락도 안 돼요.", wrong: "현장 인원 0명에 빈 창고예요. 어제 규칙도 계속 살아 있어요." } }
      ],
      outro: [
        { who: "boss", face: "normal", text: "어제 김 회사 사장이 오늘은 건설사 사장이네요." },
        { who: "hero", face: "upset", text: "그 콧수염 아저씨도 어디서 본 것 같은데요…" },
        { who: "boss", face: "happy", text: "느낌은 메모해 둬요. 증거는 서류가 말해 줄 거예요." }
      ],
      news: {
        good: "[행복일보] 체육관 공사, 진짜 기술자 있는 회사가 맡아",
        bad: "[행복일보] 체육관 공사장에 기술자가 없다? 공사 멈춰"
      },
      learn: "기술자 이름을 빌려 등록 기준만 맞추는 것은 등록기준 위반이다. 다른 회사 명부에도 있거나 월급을 안 받는 기술자는 인정되지 않는다."
    },

    // ───────────────────────── 3일차 ─────────────────────────
    {
      day: 3, sec: 130, date: "2026.11.04 (수)", title: "똑같은 숫자",
      firstTip: "'기록판' 버튼을 누르면 앞 업체들의 입찰금액·투찰 IP를 나란히 볼 수 있어요.",
      tender: "행복초 교실 책걸상 200조 (같은 입찰)",
      newRules: ["collusion"], docs: ["bid", "reg", "site"],
      intro: [
        { who: "boss", face: "normal", text: "오늘은 같은 입찰, 책걸상 200조예요. 기록판에 앞 업체들 금액과 IP가 모여요. IP는 쉽게 말해 입찰서를 보낸 컴퓨터 주소예요." },
        { who: "boss", face: "normal", text: "업체끼리 몰래 값을 짜면 '담합'이에요. 나랏돈이 더 들죠." },
        { who: "hero", face: "normal", text: "어떻게 알아요? 마음을 읽을 수도 없고." },
        { who: "boss", face: "happy", text: "흔적은 남아요. 두 회사 입찰서의 IP가 같다면? 한 컴퓨터에서 나왔다는 뜻이죠. 조사 의뢰!" },
        { who: "boss", face: "upset", text: "그리고 오늘부터는 놓친 부정 업체도 -50점이에요. 하루 시간도 점점 짧아지니 서두르세요!" }
      ],
      banlist: [],
      applicants: [
        { id: "d3a1", brief: "첫 업체, 겹치는 IP·금액 없음", sprite: "grandpa", face: "happy",
          docs: {
            bid: { company: "튼튼철물", item: "교실 책걸상 200조", amount: "49,880,000원", ip: "175.20.xx.8" },
            reg: { company: "튼튼철물", rep: "강튼튼", addr: "행복시 장터길 8", opened: "1987.04.01", regno: "211-81-30412" },
            site: { pic: "v_hardware", photo: "shop", addr: "행복시 장터길 8", staff: "3명", note: "뒷마당 작업장" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "또 왔네! 책상 다리 하나 안 흔들리게 만들지.", pass: "허허, 고맙구먼. 손자 학교 책상이여.", reject: "값을 내가 혼자 정했는디…", caught: "" },
          boss: { correct: "정답. 첫 업체라 비교할 게 없고 다른 문제도 없어요.", wrong: "이상한 칸이 없어요. 첫 업체는 기록판에 비교 대상도 없죠." } },

        { id: "d3a2", brief: "심사 땐 겹치는 IP 없음(뒤에 조사 의뢰)", sprite: "twinA", face: "happy",
          clue: "IP 211.45.xx.17",
          // (w13) 심사 순간엔 정상(통과가 정답)이지만, 뒤에 온 한뜻·깜빡과 IP가 같아 하루 끝엔 함께 조사 의뢰된다.
          // 그래서 반려해도 '억울한 반려 −50'이 아니라 '근거 부족 0점'(멀쩡한 업체 집계에서 뺌)
          noGrounds: true,
          docs: {
            bid: { company: "한마음가구", item: "교실 책걸상 200조", amount: "48,730,000원", ip: "211.45.xx.17" },
            reg: { company: "한마음가구", rep: "나안개", addr: "행복시 강변로 3", opened: "2026.10.01", regno: "530-12-70107" },
            site: { pic: "v_hanmaum", photo: "factory", addr: "행복시 강변로 3", staff: "4명", note: "빌린 공장, 가동 중" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "한마음가구입니다. 이번엔 진짜 공장 있어요!", pass: "됐다! 동생아, 이제 네 차례다.", reject: "공장도 있고 사람도 있는데요?", caught: "" },
          boss: { correct: "지금으로선 정상이에요. 이 IP와 금액은 기록판에 남아요.", wrong: "지금은 반려할 근거가 없어요. 근거 부족, 0점! 이 IP는 기록판에 남겨 둬요." } },

        { id: "d3a3", brief: "금액·IP 아무와도 안 겹침", sprite: "startup", face: "normal",
          docs: {
            bid: { company: "반디랩", item: "교실 책걸상 200조", amount: "46,900,000원", ip: "59.10.xx.3" },
            reg: { company: "반디랩", rep: "반지현", addr: "행복시 새싹로 9", opened: "2026.03.02", regno: "758-87-02211" },
            site: { pic: "v_bandi3", photo: "cowork", addr: "행복시 새싹로 9", staff: "3명", note: "협력 공장과 계약" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "높이가 자라는 책상이에요! 아이 키에 맞춰 쑥쑥.", pass: "야호! 1학년 교실에 먼저 넣을게요.", reject: "값을 싸게 써서 그런가요…?", caught: "" },
          boss: { correct: "정답. 금액도 IP도 다른 업체와 겹치지 않아요.", wrong: "기록판을 봐요. 이 업체는 아무와도 겹치지 않아요." } },

        { id: "d3a4", brief: "IP = 한마음가구, 500원 차이", sprite: "twinB", face: "normal",
          docs: {
            bid: { company: "한뜻가구", item: "교실 책걸상 200조", amount: "48,730,500원", ip: "211.45.xx.17" },
            reg: { company: "한뜻가구", rep: "나구름", addr: "행복시 강변로 4", opened: "2026.10.01", regno: "520-11-70144" },
            site: { pic: "v_hanttuet", photo: "factory", addr: "행복시 강변로 4", staff: "3명", note: "옆 공장과 같은 건물" }
          },
          flaw: { rule: "collusion", fields: ["bid.ip", "bid.amount"] }, aiAlert: null,
          say: { enter: "한뜻가구요. 저희는 한마음가구랑 아무 사이 아니에요.", pass: "형, 됐어! 둘 다 통과야!", reject: "아, 아무 사이 아니라니까요…", caught: "같은 IP요? 그, 그건 와이파이를 같이 써서…" },
          boss: { correct: "정답! 한마음가구와 IP가 같고 금액도 500원 차이예요. 조사 의뢰!", wrong: "기록판을 봐요. 2번 업체와 IP가 같고 금액이 거의 같아요." } },

        { id: "d3a5", brief: "금액만 비슷, IP는 다름", sprite: "clerk", face: "happy", speaker: "직원",
          docs: {
            bid: { company: "바른가구", item: "교실 책걸상 200조", amount: "48,700,000원", ip: "112.7.xx.51" },
            reg: { company: "바른가구", rep: "정바른", addr: "행복시 숲길 15", opened: "2010.11.11", regno: "126-81-77001" },
            site: { pic: "v_bareun", photo: "factory", addr: "행복시 숲길 15", staff: "22명", note: "공장 2개 동, 17명은 2동" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "저 기억하세요? 그 회사 그만두고 바른가구에 왔어요!", pass: "이번엔 떳떳하게 냈어요. 고맙습니다!", reject: "저희는 진짜 혼자 값을 냈는데…", caught: "" },
          boss: { correct: "잘 참았어요! 금액이 비슷한 것만으론 담합이라 못 해요.", wrong: "금액만 비슷하고 IP는 달라요. 단서 하나로 몰면 억울해요." } },

        { id: "d3a6", brief: "같은 IP 세 번째, 금액 비슷", sprite: "slick3", face: "normal",
          clue: "등록번호 404-, IP 211.45.xx.17, 대표 '나깜빡'",
          docs: {
            bid: { company: "깜빡산업", item: "교실 책걸상 200조", amount: "48,731,000원", ip: "211.45.xx.17" },
            reg: { company: "깜빡산업", rep: "나깜빡", addr: "행복시 구름로 404-2", opened: "2026.10.20", regno: "404-04-02404" },
            site: { pic: "v_kkam", photo: "factory", addr: "행복시 구름로 404-2", staff: "2명", note: "공장 있음" }
          },
          flaw: { rule: "collusion", fields: ["bid.ip", "bid.amount"] }, aiAlert: null,
          say: { enter: "(마스크 너머) 깜빡산업… 입니다. 콜록.", pass: "(작게) 흐흐, 세 회사 다 통과다.", reject: "(작게) 마스크까지 썼는데…", caught: "IP가 같다고? 우, 우리 동네 와이파이가 하나라서!" },
          boss: { correct: "정답! 또 211.45.xx.17이에요. 세 회사가 한 곳에서 냈어요.", wrong: "기록판에 같은 IP가 벌써 두 번 있어요. 이번이 세 번째예요." } }
      ],
      outro: [
        { who: "boss", face: "normal", text: "한뜻·깜빡, 그리고 IP를 같이 쓴 한마음가구까지 세 회사 기록을 공정위에 조사 의뢰할게요." },
        { who: "hero", face: "upset", text: "깜빡산업 등록번호도 404-로 시작했어요. 번쩍상사처럼요!" },
        { who: "boss", face: "happy", text: "오, 좋은 눈! 그 단서, 금요일까지 꼭 쥐고 있어요." }
      ],
      news: {
        good: "[행복일보] 책걸상 입찰 담합 징후 포착… 공정위 조사 착수",
        bad: "[행복일보] 짜고 친 책걸상 입찰? 학교 예산 새어 나가"
      },
      learn: "같은 IP 투찰이나 짠 듯한 금액은 담합 '징후'다. 조달청은 이런 기록을 공정위에 조사 의뢰하고, 담합인지는 조사로 확정된다."
    },

    // ───────────────────────── 4일차 ─────────────────────────
    {
      day: 4, sec: 120, date: "2026.11.05 (목)", title: "이름표 바꿔 달기",
      firstTip: "규정집에 제재 명단이 붙었어요. 업체명뿐 아니라 대표자 이름도 대조해요.",
      tender: "행복천 다리 보수·안전 시설",
      newRules: ["banned", "safety"], docs: ["bid", "reg", "site", "safety"],
      intro: [
        { who: "boss", face: "normal", text: "규정집에 제재 명단이 붙었어요. '부정당업자', 나라 계약에서 속이거나 약속을 어겨 입찰이 막힌 회사들이죠." },
        { who: "boss", face: "normal", text: "그리고 안전 확인서! 다수공급자계약은 쉽게 말해 '나라 쇼핑몰 입점'이에요. 기관이 여기서 물건을 골라 사죠." },
        { who: "boss", face: "normal", text: "중대재해로 노동부가 공표한 기업은 2년 동안 여기 새로 못 들어와요. 사고 기록만으로 막는 건 아니고요." },
        { who: "hero", face: "normal", text: "명단이랑 업체명만 맞춰 보면 되죠?" },
        { who: "boss", face: "happy", text: "대표자 이름도요! 회사 이름표만 바꿔 다는 사람도 있거든요." }
      ],
      banlist: [
        { company: "번쩍상사", rep: "나번쩍", from: "2026.11.03", until: "2028.11.02" },
        { company: "구름상사", rep: "나구름", from: "2026.11.03", until: "2027.05.02" },
        { company: "먼지산업", rep: "고먼지", from: "2026.08.01", until: "2027.01.31" }
      ],
      applicants: [
        { id: "d4a1", brief: "사고 없음, 제재 명단에 없음", sprite: "builder", face: "normal",
          docs: {
            bid: { company: "튼튼건설", item: "다리 난간 보수", amount: "112,000,000원", ip: "121.33.xx.40" },
            reg: { company: "튼튼건설", rep: "배튼튼", addr: "행복시 다리로 5", opened: "2008.06.10", regno: "137-81-24680" },
            site: { pic: "v_build_tt", photo: "office", addr: "행복시 다리로 5", staff: "14명", note: "10명 현장, 장비 창고 있음" },
            safety: { record: "없음", action: "매일 아침 안전점검", note: "공표 대상 아님" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "또 뵙네요! 다리 공사는 안전이 먼저죠.", pass: "고맙습니다! 헬멧 끈 꽉 매고 갑니다.", reject: "우린 사고 한 번 없었는데요…", caught: "" },
          boss: { correct: "정답. 사고 기록 없고 매일 점검까지 해요.", wrong: "안전 기록 '없음'이에요. 명단에도 없어요." } },

        { id: "d4a2", brief: "대표 나번쩍 = 제재 명단", sprite: "slick2", face: "happy",
          clue: "대표 '나번쩍' — 1일차 번쩍상사와 같은 대표, 등록번호 404-",
          docs: {
            bid: { company: "새출발건설", item: "다리 기둥 보강", amount: "98,000,000원", ip: "211.45.xx.17" },
            reg: { company: "새출발건설", rep: "나번쩍", addr: "행복시 구름로 404-3", opened: "2026.11.01", regno: "404-04-03404" },
            site: { pic: "v_saechul", photo: "office", addr: "행복시 구름로 404-3", staff: "2명", note: "새 사무실" },
            safety: { record: "없음", action: "-", note: "개업 5일째" }
          },
          flaw: { rule: "banned", fields: ["reg.rep", "bid.ip"] }, aiAlert: null,
          say: { enter: "새출발건설이오! 이름처럼 새 출발한 깨끗한 회사요.", pass: "흐흐흐, 새 이름 최고!", reject: "회사 이름은 새건데!", caught: "나번쩍은… 아주 흔한 이름이오!" },
          boss: { correct: "정답! 회사 이름은 새것이지만 대표가 제재 명단의 나번쩍이에요.", wrong: "대표자 칸을 제재 명단과 대조해 봐요. 나번쩍, 있죠?" } },

        { id: "d4a3", brief: "공표 기업의 다수공급자 신규", sprite: "twinA", face: "upset",
          docs: {
            bid: { company: "단단안전", item: "다리 안전펜스", amount: "45,500,000원", ip: "58.140.xx.9", kind: "다수공급자계약 신규 등록" },
            reg: { company: "단단안전", rep: "나안개", addr: "행복시 강변로 9", opened: "2019.03.02", regno: "530-12-70211" },
            site: { pic: "v_dandan", photo: "factory", addr: "행복시 강변로 9", staff: "8명", note: "펜스 공장, 4명씩 교대" },
            safety: { record: "2026.09 사망사고 1건", action: "재발 방지 계획 제출", note: "노동부 공표 기업(2026.10)" }
          },
          flaw: { rule: "safety", fields: ["safety.note", "safety.record", "bid.kind"] }, aiAlert: null,
          say: { enter: "단단안전입니다. 안전펜스를 조달청 쇼핑몰에 새로 올리고 싶어요.", pass: "후… 그 사고 얘긴 안 물어보네.", reject: "공장도 사람도 다 있는데 왜요?", caught: "공표된 지 한 달… 2년은 못 들어오는군요." },
          boss: { correct: "정답. 9월 사망사고로 공표된 기업이라 다수공급자계약 신규 등록은 2년 동안 안 돼요.", wrong: "안전 확인서를 봐요. 노동부 공표 기업이 다수공급자계약에 새로 들어오려 해요." } },

        { id: "d4a4", brief: "'구름'만 같고 대표·번호 다름", sprite: "youngman", face: "normal",
          docs: {
            bid: { company: "구름코딩", item: "다리 안전 센서 앱", amount: "15,600,000원", ip: "110.12.xx.66" },
            reg: { company: "구름코딩", rep: "두리안", addr: "행복시 새싹로 22", opened: "2024.05.20", regno: "622-87-01544" },
            site: { pic: "v_cont5", photo: "container", addr: "행복시 새싹로 22", staff: "5명", note: "컨테이너, 5명 근무" },
            safety: { record: "없음", action: "사무 업무", note: "공표 대상 아님" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "회사 이름 바꿨어요! 구름코딩. 구름처럼 가벼운 앱!", pass: "다리 흔들림, 앱으로 실시간 알려 드릴게요!", reject: "구름… 상사요? 저희랑 전혀 다른 회사예요!", caught: "" },
          boss: { correct: "잘 봤어요! 이름에 '구름'이 있어도 대표·등록번호가 달라요.", wrong: "명단의 구름상사와 이름만 비슷해요. 대표도 번호도 달라요." } },

        { id: "d4a5", brief: "경상 뒤 조치 완료, 공표 아님", sprite: "grandpa", face: "normal",
          docs: {
            bid: { company: "튼튼철물", item: "다리 난간 볼트", amount: "4,400,000원", ip: "175.20.xx.8" },
            reg: { company: "튼튼철물", rep: "강튼튼", addr: "행복시 장터길 8", opened: "1987.04.01", regno: "211-81-30412" },
            site: { pic: "v_hardware", photo: "shop", addr: "행복시 장터길 8", staff: "3명", note: "40년 된 철물점·작업장" },
            safety: { record: "2024.05 경상 1건", action: "작업대 교체 완료", note: "공표 대상 아님" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "재작년에 내가 손을 좀 다쳤지. 그 뒤로 작업대를 싹 바꿨어.", pass: "고맙네. 볼트 하나도 꼼꼼히 조이지.", reject: "작은 상처 하나로… 서운하구먼.", caught: "" },
          boss: { correct: "맞아요. 가벼운 사고 뒤 조치를 다 했고 공표 대상도 아니에요.", wrong: "사고 기록이 있다고 다 막지 않아요. 공표 대상이 아니고 조치도 했어요." } },

        { id: "d4a6", brief: "구름상사 제재 기간 중", sprite: "twinB", face: "upset",
          docs: {
            bid: { company: "구름상사", item: "다리 청소 용역", amount: "8,800,000원", ip: "118.35.xx.21" },
            reg: { company: "구름상사", rep: "나구름", addr: "행복시 바람로 7", opened: "2026.08.11", regno: "520-11-70021" },
            site: { pic: "v_gureum_cw", photo: "cowork", addr: "행복시 바람로 7", staff: "2명", note: "직원 2명 채용" },
            safety: { record: "없음", action: "-", note: "공표 대상 아님" }
          },
          flaw: { rule: "banned", fields: ["reg.company", "reg.rep"] }, aiAlert: null,
          say: { enter: "구름상사요. 이번엔 직원도 뽑았어요! 진짜로!", pass: "됐다… 근데 이래도 되나?", reject: "역시… 명단에 있구나.", caught: "제재 기간이 아직 남았다고요? 몰랐어요…" },
          boss: { correct: "정답. 직원을 뽑아도 제재 기간 안에는 입찰할 수 없어요.", wrong: "업체명이 그대로 제재 명단에 있어요. 2027년 5월까지예요." } },

        { id: "d4a7", brief: "명단 없음, 안전 기록 깨끗", sprite: "chef", face: "happy",
          docs: {
            bid: { company: "냠냠급식", item: "공사장 새참", amount: "3,100,000원", ip: "183.99.xx.5" },
            reg: { company: "냠냠급식", rep: "정냠냠", addr: "행복시 맛길 17", opened: "2012.03.05", regno: "214-86-90123" },
            site: { pic: "v_canteen", photo: "kitchen", addr: "행복시 맛길 17", staff: "9명", note: "9명 교대, 지금 조리 2명" },
            safety: { record: "없음", action: "주방 미끄럼 매트", note: "공표 대상 아님" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "다리 공사 새참이요! 오늘은 김밥이랑 식혜예요.", pass: "든든하게 챙겨 갈게요!", reject: "김밥이 반려라니… 흑.", caught: "" },
          boss: { correct: "정답. 아무 문제 없어요. 김밥 냄새 좋네요.", wrong: "명단에도 없고 안전 기록도 깨끗해요." } }
      ],
      outro: [
        { who: "hero", face: "upset", text: "팀장님, 번쩍상사·반짝·깜빡·새출발… 등록번호가 다 404-예요!" },
        { who: "boss", face: "normal", text: "그리고 다들 구름로 404번지에 산다고 했죠. 그런 번지는 없어요." },
        { who: "boss", face: "happy", text: "내일은 AI 감시 화면이 와요. 우리가 모은 단서랑 같이 보죠." }
      ],
      news: {
        good: "[행복일보] 이름만 바꾼 제재 업체, 다리 공사 입찰서 걸러져",
        bad: "[행복일보] 제재 중인 대표가 새 회사로 다리 공사 따내"
      },
      learn: "부정당업자는 국가계약법 제27조로 최대 2년 입찰 제한. 중대재해 공표 기업은 2년간 다수공급자계약 신규 금지(사고 기록만으론 안 막음)."
    },

    // ───────────────────────── 5일차 ─────────────────────────
    {
      day: 5, sec: 110, date: "2026.11.06 (금)", title: "AI가 왔다",
      firstTip: "AI 감시는 참고용! 경고가 서류와 맞는지 직접 봐요.",
      tender: "행복시 학교·시청 물품 (혁신제품 포함)",
      newRules: ["innovexp"], docs: ["bid", "reg", "site", "innov"],
      ai: true,
      intro: [
        { who: "boss", face: "happy", text: "짜잔! 오늘부터 AI 감시 화면이 업체마다 경고를 띄워 줘요." },
        { who: "hero", face: "happy", text: "그럼 AI가 다 해 주는 거예요? 저 퇴근해도 돼요?" },
        { who: "boss", face: "normal", text: "AI는 돕는 거고 도장은 사람이 찍어요. AI도 틀릴 수 있거든요." },
        { who: "boss", face: "normal", text: "새 서류는 혁신제품 지정서! 경쟁 없이 바로 사 주는 '수의계약 특례'를 받아요. 유효기간이 지났는지 봐요." }
      ],
      banlist: [
        { company: "번쩍상사", rep: "나번쩍", from: "2026.11.03", until: "2028.11.02" },
        { company: "구름상사", rep: "나구름", from: "2026.11.03", until: "2027.05.02" },
        { company: "먼지산업", rep: "고먼지", from: "2026.08.01", until: "2027.01.31" },
        { company: "반짝종합건설", rep: "나반짝", from: "2026.11.04", until: "2027.11.03" }
      ],
      applicants: [
        { id: "d5a1", brief: "AI 오경보, 주소·2명 정상", sprite: "granny", face: "happy",
          docs: {
            bid: { company: "두부할매네", item: "구내식당 두부 800모", amount: "2,800,000원", ip: "1.240.xx.33" },
            reg: { company: "두부할매네", rep: "오순두", addr: "행복시 장터길 3", opened: "1979.10.15", regno: "315-90-11203" },
            site: { pic: "v_tofu", photo: "kitchen", addr: "행복시 장터길 3", staff: "2명", note: "할머니·손자, 간판 낡음" }
          },
          flaw: null,
          aiAlert: "사진 낡음·오래된 업체 — 페이퍼컴퍼니 의심",
          enterIf: { id: "d1a3", kind: "unfair", text: "젊은 양반, 또 왔어! 월요일엔 서운했는디, 오늘은 서류 다 챙겨 왔어유." },
          say: { enter: "젊은 양반, 또 왔어! 월요일에 통과시켜 줘서 고마워유.", pass: "이거 두부 한 모 먹어. 그리고 내가 본 게 있는디…", reject: "기계가 나더러 가짜래? 아이고…", caught: "" },
          boss: { correct: "잘했어요! AI는 낡은 사진만 보고 틀렸어요. 도장은 사람 몫이죠.", wrong: "AI 경고만 믿었네요. 주소·인원 다 맞는 월요일 그 할머니예요." },
          aiWhy: "사진이 낡고 오래된 업체라는 겉모습만 봄" },

        { id: "d5a2", brief: "혁신제품 2029년까지 유효", sprite: "startup", face: "happy",
          docs: {
            bid: { company: "반디랩", item: "높이 자라는 책상", amount: "18,000,000원", ip: "59.10.xx.3" },
            reg: { company: "반디랩", rep: "반지현", addr: "행복시 새싹로 9", opened: "2026.03.02", regno: "758-87-02211" },
            site: { pic: "v_bandi6", photo: "cowork", addr: "행복시 새싹로 9", staff: "6명", note: "직원 6명으로 늘어" },
            innov: { product: "높이 자라는 책상", no: "혁신-2026-0412", until: "2029.06.30", org: "조달청" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "저희 책상이 혁신제품으로 지정됐어요! 직원도 여섯 명!", pass: "혁신제품이라 바로 납품! 꿈만 같아요.", reject: "지정서도 있는데요…?", caught: "" },
          boss: { correct: "정답! 생긴 지 1년도 안 됐어도 혁신제품이면 바로 살 수 있어요.", wrong: "유효기간이 2029년까지예요. 새 회사라도 혁신제품 특례를 받아요." } },

        { id: "d5a3", brief: "혁신 기간 2026.10.31 지남", sprite: "auntie", face: "normal",
          docs: {
            bid: { company: "반들반들청소", item: "물 안 쓰는 걸레 로봇", amount: "9,600,000원", ip: "14.52.xx.77" },
            reg: { company: "반들반들청소", rep: "윤반들", addr: "행복시 공정로 12", opened: "2015.02.02", regno: "418-82-55010" },
            site: { pic: "v_clean", photo: "office", addr: "행복시 공정로 12", staff: "11명", note: "타일·청소 장비 보관, 9명 현장" },
            innov: { product: "물 안 쓰는 걸레 로봇", no: "혁신-2023-0077", until: "2026.10.31", org: "조달청" }
          },
          flaw: { rule: "innovexp", fields: ["innov.until"] }, aiAlert: null,
          say: { enter: "우리 걸레 로봇이에요! 이거 혁신제품이라 바로 사도 돼요.", pass: "어머 고마워요! …근데 날짜 괜찮았죠?", reject: "어머, 날짜가 지났네! 경쟁입찰로 다시 낼게요.", caught: "어머, 지난달에 끝났네! 내가 달력을 안 봤어." },
          boss: { correct: "정답. AI는 조용했지만 기간이 지났어요. AI도 놓칠 때가 있죠.", wrong: "유효기간 2026.10.31, 오늘은 11월 6일이에요. 특례가 끝났어요." },
          aiWhy: "지정서 날짜는 오늘과 비교하지 않음" },

        { id: "d5a4", brief: "AI 조용, 서류 모두 정상", sprite: "farmer", face: "happy",
          docs: {
            bid: { company: "푸른들농장", item: "구내식당 친환경 쌀", amount: "24,000,000원", ip: "222.101.xx.4" },
            reg: { company: "푸른들농장", rep: "나농부", addr: "행복시 들녘길 40", opened: "2001.04.05", regno: "402-90-12345" },
            site: { pic: "v_farm", photo: "farm", addr: "행복시 들녘길 40", staff: "5명", note: "쌀 포장, 2명은 배송 중" }
          },
          flaw: null, aiAlert: null,
          say: { enter: "올해 햅쌀이요! 반짝반짝 윤기가 나죠.", pass: "고맙습니다! 시청 밥맛 좋아질 거예요.", reject: "쌀이… 왜요?", caught: "" },
          boss: { correct: "정답. AI도 조용하고 서류도 깨끗해요.", wrong: "AI 경고도 없고 서류도 다 맞아요. 반려할 이유가 없어요." } },

        { id: "d5a5", brief: "AI 오경보, 이름만 비슷", sprite: "youngman", face: "happy",
          docs: {
            bid: { company: "구름코딩", item: "급식 알레르기 알림", amount: "11,000,000원", ip: "110.12.xx.66" },
            reg: { company: "구름코딩", rep: "두리안", addr: "행복시 새싹로 22", opened: "2024.05.20", regno: "622-87-01544" },
            site: { pic: "v_cont5", photo: "container", addr: "행복시 새싹로 22", staff: "5명", note: "컨테이너, 5명 근무" },
            innov: { product: "급식 알레르기 알림", no: "혁신-2025-0930", until: "2028.09.30", org: "조달청" }
          },
          flaw: null,
          aiAlert: "이름에 '구름' — 제재 업체 구름상사와 비슷",
          say: { enter: "또 구름 때문에 걸렸어요? 저희 진짜 구름코딩이에요!", pass: "휴! 이름 바꿀까 진지하게 고민했어요.", reject: "이름 때문에 또… 너무 억울해요.", caught: "" },
          boss: { correct: "잘했어요! AI가 이름만 보고 헷갈렸어요. 대표·번호가 달라요.", wrong: "AI가 이름 글자만 보고 짚었어요. 어제 확인했던 그 회사예요." },
          aiWhy: "회사 이름 글자만 비교함" },

        { id: "d5a6", brief: "IP = 3일차 담합 의심 IP", sprite: "twinA", face: "upset",
          docs: {
            bid: { company: "새마음가구", item: "교실 사물함 300칸", amount: "36,370,000원", ip: "211.45.xx.17" },
            reg: { company: "새마음가구", rep: "나안개", addr: "행복시 강변로 3", opened: "2026.11.03", regno: "530-12-70300" },
            site: { pic: "v_saemaum", photo: "factory", addr: "행복시 강변로 3", staff: "4명", note: "빌린 공장, 가동 중" }
          },
          flaw: { rule: "collusion", fields: ["bid.ip"] },
          aiAlert: "IP 211.45.xx.17 — 3일차 담합 IP와 같음",
          say: { enter: "새마음가구입니다… 이번엔 동생 없이 혼자 왔어요.", pass: "후… 큰형님한테 보고해야지.", reject: "역시 그 IP는 안 되는구나.", caught: "그 IP요? 큰형님이 주신 노트북이라…" },
          boss: { correct: "정답. 이번엔 AI 경고가 맞았어요. 3일차(수요일) 담합 IP예요.", wrong: "AI 경고와 3일차 기록이 같은 말을 해요. 그 담합 IP예요." } },

        { id: "d5a7", brief: "빈 땅·404·같은 IP = 나번쩍", sprite: "slick", face: "happy",
          clue: "정체 폭로: 등록번호 404-, 구름로 404, IP 211.45.xx.17 = 나번쩍",
          docs: {
            bid: { company: "정직한상사", item: "새 학기 물품 일괄", amount: "199,000,000원", ip: "211.45.xx.17" },
            reg: { company: "정직한상사", rep: "나정직", addr: "행복시 구름로 404-4", opened: "2026.11.05", regno: "404-04-04404" },
            site: { pic: "v_lot4044", photo: "emptylot", addr: "행복시 구름로 404-4", staff: "0명", note: "풀밭, 건물 없음" }
          },
          flaw: { rule: "paper", fields: ["site.photo", "site.staff", "site.note", "bid.ip", "reg.regno", "reg.addr"] },
          aiAlert: "IP 211.45.xx.17 — 앞 업체와 같음",
          say: { enter: "안녕하십니까~ 정직한상사입니다. 이름부터 정직하죠?", pass: "하하하! 결국 내가 이겼다! 1억 9천9백!", reject: "으아아! 다 된 밥이었는데!", caught: "빈 땅, 404, 그 IP까지… 다 들켰군. 그래, 내가 나번쩍이다!" },
          boss: { correct: "완벽해요! 빈 땅, 404번, 같은 IP. 월요일 그 사람이에요.", wrong: "다시 봐요. 풀밭 사진, 직원 0명, 404 번호, 앞 업체와 같은 IP예요." } }
      ],
      outro: [
        { who: "slick", face: "upset", text: "콧수염, 마스크, 이름표까지 바꿨는데… 어떻게 알았지?" },
        { who: "hero", face: "happy", text: "얼굴은 바꿔도 서류는 못 속여요. 404 번호, 없는 번지, 같은 IP!" },
        { who: "granny", face: "happy", text: "시장에서 저 양반이 쌍둥이한테 노트북 주는 것도 내가 봤어유!" },
        { who: "boss", face: "normal", text: "AI는 할머니를 의심했고, 걸레 로봇 날짜는 놓쳤죠." },
        { who: "boss", face: "happy", text: "AI는 돕고, 결정은 사람이. 이번 주 내내 잘 해냈어요, 새봄 심사관!",
          ifWeekLow: { face: "normal", text: "AI는 돕고, 결정은 사람이. 틀린 서류는 다음 주에 꼭 다시 봐요, 새봄 심사관." },
          // (w13) 억울한 반려가 3곳 이상이면 '잘 해냈어요' 대신
          ifUnfair: { face: "normal", text: "AI는 돕고, 결정은 사람이. 가짜 회사는 잘 막았지만, 억울하게 돌려보낸 {unfairN}곳은 꼭 다시 봐요, 새봄 심사관." } }
      ],
      // 마지막 손님(정직한상사)을 반려하지 못했거나 마감으로 못 봤을 때
      outroMissed: [
        { who: "hero", face: "upset", text: "팀장님, 정직한상사 서류… 등록번호가 404-로 시작하고 IP도 쌍둥이 형과 같았어요." },
        { who: "boss", face: "normal", text: "빈 땅에 직원 0명이었죠. 계약 전에 조사팀에 바로 넘길게요." },
        { who: "boss", face: "normal", text: "AI는 할머니를 의심했고, 걸레 로봇 날짜는 놓쳤죠. {weMissed}" },
        { who: "boss", face: "happy", text: "그래서 도장은 사람이 찍고, 놓친 건 다시 살펴요. 한 주 수고했어요, 새봄 심사관!" }
      ],
      news: {
        good: "[행복일보] 이름 다섯 번 바꾼 '번쩍 사장' 덜미… 신입 심사관의 눈썰미",
        bad: "[행복일보] 빈 땅 회사가 새 학기 물품 2억 원 계약… 조사 착수"
      },
      learn: "혁신제품은 지정 뒤 3년 동안 경쟁 없이 바로 살 수 있다. AI는 수상한 곳을 빨리 짚어 주지만, AI가 틀려도 도장 찍은 사람이 책임진다."
    }
  ],

  // 엔딩: 점수 비율(min)과 부정 업체 적발 비율(catchMin, 반려한 부정 업체/전체 부정 업체)을 둘 다 넘어야 한다.
  // 부정 업체를 절반 이상 놓치면(적발 7곳 이하) 점수와 상관없이 수습 연장.
  endings: [
    { min: 0.85, catchMin: 0.85, key: "best", title: "공정 심사왕",
      text: [
        "{catchLine} {unfairLine}",
        "{villainLine} {grannyLine}",
        "{missedLine}",
        "공팀장: \"공정하게, 하지만 억울하지 않게. 다음 주엔 창구를 맡겨도 되겠어요!\""
      ] },
    { min: 0.6, catchMin: 0.51, key: "good", title: "든든한 신입",
      text: [
        "몇 번 헷갈렸지만, 새봄 심사관은 왜 틀렸는지 하나씩 배웠다. {unfairLine}",
        "{villainLine}",
        "{missedLine}",
        "공팀장: \"낡은 가게와 가짜 회사는 다르다는 것, 이제 알죠? 다음 주도 부탁해요.\""
      ] },
    { min: 0, key: "retry", title: "수습 연장",
      text: [
        "{retryLead} {doneLine}",
        "{missedLine} {unfairLine}",
        "{villainLine}",
        "공팀장: \"{retryBoss}\""
      ] }
  ]
};

if (typeof module !== "undefined") { module.exports = window.GAME_DATA; }
