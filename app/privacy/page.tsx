import { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "Oneiri의 개인정보처리방침을 확인하세요.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen oneiri-bg-primary py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="oneiri-bg-secondary rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold oneiri-text-primary mb-8 text-center">
            개인정보처리방침
          </h1>

          <div className="prose prose-lg max-w-none oneiri-text-primary/90 leading-relaxed">
            <p className="mb-6">
              Oneiri(이하 "Oneiri"라 합니다)는 이용자의 개인정보를 중요하게
              생각하며, 『개인정보 보호법』 등 관련 법령을 준수하여 안전하게
              관리하고 있습니다. 본 개인정보처리방침은 Oneiri가 수집하는
              개인정보 항목, 이용 목적, 보유 및 이용 기간, 제3자 제공, 처리
              위탁, 이용자의 권리와 그 행사 방법, 파기 절차 및 방법, 개인정보
              보호책임자에 대한 내용을 포함합니다.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                1. 수집하는 개인정보 항목 및 수집 방법
              </h2>

              <div className="mb-4">
                <h3 className="text-xl font-semibold oneiri-text-primary mb-3">
                  [1] 수집 항목
                </h3>
                <div className="pl-4">
                  <h4 className="font-semibold oneiri-text-primary mb-2">
                    • 필수 정보
                  </h4>
                  <p className="mb-3 pl-4">
                    이메일 주소: 회원 가입, 로그인, 계정 관리, 본인 확인
                  </p>

                  <h4 className="font-semibold oneiri-text-primary mb-2">
                    • Google 계정 연동 시 수집 정보
                  </h4>
                  <div className="pl-4 mb-3">
                    <p className="mb-1">
                      - 이메일 주소: 계정 식별 및 본인 확인
                    </p>
                    <p className="mb-1">
                      - Google 계정 고유 ID: 계정 연동 및 중복 가입 방지
                    </p>
                    <p className="mb-1">
                      - 프로필 정보 (선택사항): 이름, 프로필 사진 등
                    </p>
                    <p className="text-sm oneiri-text-secondary">
                      ※ Google에서 제공하는 정보만 수집되며, Oneiri가 직접
                      Google 계정에 접근하지 않습니다.
                    </p>
                  </div>

                  <h4 className="font-semibold oneiri-text-primary mb-2">
                    • 자동 수집 정보
                  </h4>
                  <p className="mb-3 pl-4">
                    IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 브라우저 및 OS
                    정보: 보안 강화, 서비스 개선, 이용자 통계 분석 등
                  </p>
                </div>
                <p className="text-sm oneiri-text-secondary italic">
                  ※ 현재 선택 정보는 수집하지 않으나, 추후 서비스 확장 시
                  최소한의 항목만 별도 동의 후 수집할 수 있습니다.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold oneiri-text-primary mb-3">
                  [2] 수집 방법
                </h3>
                <ul className="list-disc pl-8 space-y-1">
                  <li>회원가입 및 서비스 이용 시 이용자가 직접 입력</li>
                  <li>
                    Google OAuth 2.0을 통한 계정 연동 시 Google로부터 제공받는
                    정보
                  </li>
                  <li>
                    웹사이트 이용 중 자동으로 생성되거나 수집되는 정보 (예:
                    쿠키)
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                2. 개인정보의 이용 목적
              </h2>
              <p className="mb-3">
                Oneiri는 수집한 개인정보를 아래의 목적에 한해 이용합니다.
              </p>
              <ul className="list-disc pl-8 space-y-1">
                <li>회원 관리: 가입, 로그인, 본인 확인, 이용자 식별</li>
                <li>
                  서비스 제공: 꿈 이야기 생성, 꿈 일기 저장, 맞춤 콘텐츠 제공
                </li>
                <li>
                  서비스 개선 및 운영: 통계 분석, 기능 개선, 이용자 피드백 반영
                </li>
                <li>고객 응대: 문의 처리 및 문제 해결</li>
                <li>법적 의무 이행: 법령 위반 또는 악용 방지, 분쟁 대응</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                3. 개인정보의 보유 및 이용 기간
              </h2>
              <p className="mb-3">
                Oneiri는 개인정보의 수집 및 이용 목적이 달성된 후에는 원칙적으로
                해당 정보를 지체 없이 파기합니다. 단, 다음의 경우에는 명시된
                기간 동안 보존합니다.
              </p>
              <ul className="list-disc pl-8 space-y-1">
                <li>
                  회원 탈퇴 후 재가입 방지를 위한 이메일 기록: 탈퇴 후 30일간
                </li>
                <li>분쟁 발생 시 증거 확보: 분쟁 해결 시까지</li>
                <li>관련 법령에 따른 보존: 아래 예시 참조</li>
                <li className="pl-4">
                  「전자상거래법」에 따른 계약 및 결제 기록: 5년
                </li>
                <li className="pl-4">
                  「통신비밀보호법」에 따른 로그 기록: 3개월
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                4. 개인정보의 제3자 제공
              </h2>
              <p className="mb-3">
                Oneiri는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지
                않습니다. 다만, 아래의 경우는 예외입니다.
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>이용자가 사전 동의한 경우</li>
                <li>법령에 근거하여 수사기관, 법원 등에서 요구한 경우</li>
                <li>
                  <strong>Google 계정 연동 관련:</strong>
                  <br />
                  - Google OAuth 인증 과정에서 Google과 최소한의 정보 교환
                  <br />
                  - Google의 개인정보처리방침에 따라 처리됨
                  <br />- 이용자는 언제든지 Google 계정 설정에서 연동을 해제할
                  수 있음
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                5. 개인정보 처리 위탁
              </h2>
              <p className="mb-4">
                Oneiri는 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를
                위탁하고 있습니다.
              </p>

              <div className="oneiri-bg-primary border border-text-secondary/20 rounded-lg p-6">
                <h4 className="font-semibold oneiri-text-primary mb-3">
                  위탁 업체: Supabase Inc.
                </h4>
                <div className="space-y-2 text-sm oneiri-text-secondary">
                  <div>
                    <strong>위탁 업무:</strong>
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                      <li>데이터베이스 호스팅 및 관리</li>
                      <li>사용자 인증 서비스 (Google OAuth 포함)</li>
                      <li>파일 저장소 서비스</li>
                      <li>서버리스 함수 실행 환경 제공</li>
                    </ul>
                  </div>
                  <div>
                    <strong>위탁 개인정보 항목:</strong> 이메일 주소, 계정 정보,
                    서비스 이용 기록
                  </div>
                  <div>
                    <strong>위탁 기간:</strong> 서비스 이용 계약 기간 동안
                  </div>
                  <div>
                    <strong>수탁업체 소재지:</strong> 미국
                  </div>
                  <div>
                    <strong>수탁업체 개인정보보호 정책:</strong>
                    <a
                      href="https://supabase.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="oneiri-accent underline hover:text-accent-primary/80"
                    >
                      https://supabase.com/privacy
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>국외 이전 고지:</strong> 위탁된 개인정보는 미국에
                  소재한 Supabase의 서버에 저장됩니다. Supabase는 SOC 2 Type 2,
                  ISO 27001 등의 보안 인증을 보유하고 있으며, 적절한
                  기술적·관리적 보호조치를 통해 개인정보를 안전하게 처리합니다.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  위탁 업체: Google LLC (Gemini API)
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>
                    <strong>위탁 업무:</strong>
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                      <li>AI 기반 꿈 이야기 생성</li>
                      <li>AI 기반 이미지 생성</li>
                    </ul>
                  </div>
                  <div>
                    <strong>위탁 개인정보 항목:</strong> 이용자가 입력한 꿈 내용
                    (개인정보 제외)
                  </div>
                  <div>
                    <strong>위탁 기간:</strong> API 호출 시점에서 처리 완료까지
                  </div>
                  <div>
                    <strong>수탁업체 소재지:</strong> 미국
                  </div>
                  <div>
                    <strong>수탁업체 개인정보보호 정책:</strong>
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 underline ml-1"
                    >
                      https://policies.google.com/privacy
                    </a>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-800">
                    <strong>참고:</strong> 꿈 내용 처리 시 개인을 식별할 수 있는
                    정보는 제거한 후 전송되며, Google은 API 정책에 따라 해당
                    데이터를 저장하지 않습니다.
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                향후 추가 위탁이 발생할 경우, 위탁 내용 및 수탁 업체에 대한
                정보를 본 방침을 통해 사전 고지하겠습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                6. 이용자의 권리와 행사 방법
              </h2>
              <p className="mb-3">
                이용자는 언제든지 다음과 같은 개인정보 보호 관련 권리를 행사할
                수 있습니다.
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>
                  <strong>개인정보 열람권:</strong> 본인의 개인정보 처리 현황을
                  확인할 권리
                </li>
                <li>
                  <strong>정정·삭제권:</strong> 개인정보의 오류에 대한 정정 또는
                  삭제를 요구할 권리
                </li>
                <li>
                  <strong>처리정지권:</strong> 개인정보의 처리를 정지하도록
                  요구할 권리
                </li>
                <li>
                  <strong>손해배상청구권:</strong> 개인정보의 오·남용으로 인한
                  손해의 배상을 요구할 권리
                </li>
              </ul>
              <p className="mt-4 text-sm oneiri-text-secondary">
                권리 행사 방법: 개인정보보호법 시행령 제41조에 따라 서면, 전화,
                전자우편 등을 통하여 하실 수 있으며, Oneiri는 이에 대해 지체
                없이 조치하겠습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                7. 개인정보의 파기
              </h2>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold oneiri-text-primary mb-2">
                    파기 절차
                  </h4>
                  <p>
                    이용자가 입력한 정보는 목적 달성 후 별도의 DB에
                    옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련
                    법령에 따라 일정 기간 저장된 후 혹은 즉시 파기됩니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold oneiri-text-primary mb-2">
                    파기 방법
                  </h4>
                  <ul className="list-disc pl-8 space-y-1">
                    <li>
                      전자적 파일 형태: 기록을 재생할 수 없도록 안전한 방법으로
                      삭제
                    </li>
                    <li>
                      종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각하여 파기
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                8. 개인정보의 안전성 확보 조치
              </h2>
              <p className="mb-3">
                Oneiri는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에
                필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>
                  <strong>개인정보 취급 담당자의 최소화 및 교육:</strong>{" "}
                  개인정보를 취급하는 담당자를 지정하고 최소화하여 개인정보를
                  관리하는 대책을 시행하고 있습니다.
                </li>
                <li>
                  <strong>정기적인 자체 감사:</strong> 개인정보 취급 관련 안정성
                  확보를 위해 정기적(분기 1회 이상)으로 자체 감사를 실시하고
                  있습니다.
                </li>
                <li>
                  <strong>개인정보의 암호화:</strong> 이용자의 개인정보는
                  비밀번호는 암호화되어 저장 및 관리되고 있어, 본인만이 알 수
                  있으며 중요한 데이터는 파일 및 전송 데이터를 암호화하거나 파일
                  잠금 기능을 사용하는 등의 별도 보안기능을 사용하고 있습니다.
                </li>
                <li>
                  <strong>해킹 등에 대비한 기술적 대책:</strong> Oneiri는
                  해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을
                  막기 위하여 보안프로그램을 설치하고 주기적인 갱신·점검을 하며
                  외부로부터 접근이 통제된 구역에 시스템을 설치하고
                  기술적/물리적으로 감시 및 차단하고 있습니다.
                </li>
                <li>
                  <strong>개인정보에 대한 접근 제한:</strong> 개인정보를
                  처리하는 데이터베이스시스템에 대한 접근권한의 부여, 변경,
                  말소를 통하여 개인정보에 대한 접근통제를 위하여 필요한 조치를
                  하고 있으며 침입차단시스템을 이용하여 외부로부터의 무단 접근을
                  통제하고 있습니다.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                9. 개인정보 보호책임자
              </h2>
              <div className="oneiri-bg-primary border border-text-secondary/20 rounded-lg p-6">
                <p className="mb-4 oneiri-text-primary">
                  Oneiri는 개인정보 처리에 관한 업무를 총괄해서 책임지고,
                  개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을
                  위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                </p>
                <div className="space-y-2 text-sm oneiri-text-secondary">
                  <div>
                    <strong>개인정보 보호책임자:</strong> Oneiri 개발팀
                  </div>
                  <div>
                    <strong>연락처:</strong> relee6203@gmail.com
                  </div>
                  <div>
                    <strong>처리 시간:</strong> 평일 09:00~18:00 (주말 및 공휴일
                    제외)
                  </div>
                </div>
                <p className="mt-4 text-sm oneiri-text-secondary">
                  정보주체께서는 Oneiri의 서비스를 이용하시면서 발생한 모든
                  개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을
                  개인정보 보호책임자에게 문의하실 수 있습니다. Oneiri는
                  정보주체의 문의에 대해 지체 없이 답변 및 처리해드릴 것입니다.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                10. 개인정보 처리방침 변경
              </h2>
              <p className="mb-3">
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른
                변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행
                7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>

            <div className="mt-8 p-6 bg-accent-primary/10 border border-accent-primary/20 rounded-lg text-center">
              <p className="oneiri-text-primary font-medium">
                본 개인정보처리방침은 2025년 6월 8일부터 시행됩니다.
              </p>
              <p className="text-sm oneiri-text-secondary mt-2">
                개인정보 보호 관련 문의사항이 있으시면 언제든지 연락해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
