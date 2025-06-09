import { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "Oneiri의 이용약관을 확인하세요.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen oneiri-bg-primary py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="oneiri-bg-secondary rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold oneiri-text-primary mb-8 text-center">
            이용약관
          </h1>

          <div className="prose prose-lg max-w-none oneiri-text-primary/90 leading-relaxed">
            <p className="mb-6">
              본 약관은 Oneiri(이하 "Oneiri")가 제공하는 서비스의 이용과
              관련하여 Oneiri와 이용자 간의 권리, 의무 및 책임사항, 이용 조건
              등을 규정합니다.
              <br />
              Oneiri 서비스를 이용하는 경우, 본 약관에 동의한 것으로 간주됩니다.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                1. 용어의 정의
              </h2>
              <ul className="list-disc pl-8 space-y-2">
                <li>
                  <strong>"이용자"</strong>란 Oneiri가 제공하는 서비스를
                  이용하는 모든 자를 말합니다.
                </li>
                <li>
                  <strong>"콘텐츠"</strong>란 텍스트, 이미지, 영상 등 Oneiri에서
                  제공하거나 이용자가 생성/게시하는 모든 정보를 의미합니다.
                </li>
                <li>
                  <strong>"꿈 이야기"</strong>란 이용자가 입력한 꿈의 조각들을
                  바탕으로 AI가 생성한 이야기 콘텐츠를 의미합니다.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                2. 이용 계약의 성립
              </h2>
              <p>
                이용자가 본 약관에 동의하고 회원가입 또는 로그인 등 절차를
                완료한 경우, 이용 계약이 성립됩니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                3. 서비스의 제공 및 변경
              </h2>
              <ul className="list-disc pl-8 space-y-2">
                <li>
                  Oneiri는 꿈 이야기 생성, 꿈 일기 저장, 커뮤니티 기능(제공되는
                  경우) 등 다양한 콘텐츠를 제공합니다.
                </li>
                <li>
                  Oneiri는 서비스의 전부 또는 일부를 개선하거나 변경할 수
                  있으며, 중요한 변경 사항은 사전에 공지합니다.
                </li>
                <li>
                  부득이한 사유로 서비스의 일부 또는 전체를 일시적 또는
                  영구적으로 중단할 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                4. 이용자의 의무
              </h2>
              <p className="mb-4">
                이용자는 Oneiri 서비스를 사용하는 동안 다음 행위를 하여서는 안
                됩니다:
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold oneiri-text-primary mb-3">
                    일반적 금지사항
                  </h4>
                  <ul className="list-disc pl-8 space-y-2">
                    <li>법령 및 본 약관을 위반하는 행위</li>
                    <li>타인의 권리 침해(지식재산권, 명예훼손 등)</li>
                    <li>
                      해킹, 악성 코드 배포, 비정상적인 자동화 등 서비스 운영
                      방해
                    </li>
                    <li>타인의 개인정보를 무단 수집하거나 사용하는 행위</li>
                    <li>
                      합리적인 범위를 초과한 과도한 AI 요청 또는 리소스 사용
                    </li>
                    <li>기타 Oneiri가 부적절하다고 판단하는 행위</li>
                  </ul>
                </div>

                <div className="bg-oneiri-garnet/10 border border-oneiri-garnet/20 rounded-lg p-6">
                  <h4 className="font-semibold text-oneiri-garnet mb-3">
                    AI 생성 콘텐츠 관련 금지사항
                  </h4>
                  <ul className="list-disc pl-8 space-y-2 text-oneiri-garnet/90">
                    <li>
                      <strong>상업적 이용 금지:</strong> AI가 생성한 꿈 이야기
                      및 이미지를 판매, 라이선싱, 상업적 목적으로 사용하는 행위
                    </li>
                    <li>
                      <strong>무단 재배포 금지:</strong> 생성된 콘텐츠를 다른
                      플랫폼, SNS, 출판물 등에 무단으로 재배포하는 행위
                    </li>
                    <li>
                      <strong>2차 창작물 제한:</strong> AI 생성물을 기반으로 한
                      파생 작품을 상업적으로 제작·판매하는 행위
                    </li>
                    <li>
                      <strong>허위 저작권 주장:</strong> AI 생성 콘텐츠에 대해
                      본인이 창작자라고 허위로 주장하는 행위
                    </li>
                    <li>
                      <strong>저작권 침해 콘텐츠 생성:</strong> 기존 저작물의
                      복제나 표절을 목적으로 AI를 사용하는 행위
                    </li>
                  </ul>
                </div>

                <div className="bg-oneiri-forest/10 border border-oneiri-forest/20 rounded-lg p-6">
                  <h4 className="font-semibold text-oneiri-forest mb-3">
                    부적절한 콘텐츠 생성 금지
                  </h4>
                  <ul className="list-disc pl-8 space-y-2 text-oneiri-forest/90">
                    <li>
                      <strong>불법 콘텐츠:</strong> 폭력, 혐오, 음란물, 불법
                      약물 등과 관련된 콘텐츠 생성 요청
                    </li>
                    <li>
                      <strong>개인정보 포함:</strong> 실명, 주소, 전화번호 등
                      개인정보가 포함된 꿈 내용 입력
                    </li>
                    <li>
                      <strong>타인 비방:</strong> 특정 개인이나 단체를
                      비방하거나 명예를 훼손하는 콘텐츠 생성
                    </li>
                    <li>
                      <strong>허위정보 유포:</strong> 거짓 정보나 오해의 소지가
                      있는 내용을 사실인 것처럼 유포하는 행위
                    </li>
                    <li>
                      <strong>사기/기만:</strong> AI 생성물을 이용하여 타인을
                      속이거나 사기를 치는 행위
                    </li>
                  </ul>
                </div>

                <div className="bg-oneiri-violet/10 border border-oneiri-violet/20 rounded-lg p-6">
                  <h4 className="font-semibold text-oneiri-violet mb-3">
                    AI 생성물 사용 시 준수사항
                  </h4>
                  <ul className="list-disc pl-8 space-y-2 text-oneiri-violet/90">
                    <li>
                      <strong>출처 표기:</strong> AI 생성 콘텐츠를 공유 시
                      "Oneiri AI로 생성됨" 표기 권장
                    </li>
                    <li>
                      <strong>개인적 사용:</strong> 생성된 콘텐츠는 개인적 감상
                      및 비상업적 목적으로만 사용
                    </li>
                    <li>
                      <strong>사실 확인:</strong> AI 생성 내용을 사실로
                      받아들이지 말고 창작물로 인식
                    </li>
                    <li>
                      <strong>책임 인식:</strong> AI 생성물 사용으로 인한 모든
                      결과에 대해 이용자가 책임
                    </li>
                    <li>
                      <strong>저작권 존중:</strong> 기존 저작물과 유사한 콘텐츠
                      생성 시 저작권 침해 가능성 인지
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 oneiri-bg-primary border border-text-secondary/20 rounded-lg">
                <p className="text-sm oneiri-text-secondary">
                  <strong>⚠️ 중요:</strong> 위 금지사항을 위반할 경우 사전 통지
                  없이 서비스 이용이 제한되거나 계정이 정지될 수 있으며, 법적
                  책임을 질 수 있습니다. AI 생성 콘텐츠의 사용은 개인의 책임
                  하에 이루어져야 합니다.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                5. 저작권 및 지적재산권
              </h2>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold oneiri-text-primary mb-2">
                    Oneiri 서비스 저작권
                  </h4>
                  <p>
                    Oneiri 서비스의 디자인, 소프트웨어, 로고, 서비스명 등은
                    Oneiri의 지적재산권으로 보호됩니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold oneiri-text-primary mb-2">
                    AI 생성 콘텐츠 권리
                  </h4>
                  <p>
                    AI가 생성한 꿈 이야기 및 관련 콘텐츠는 이용자가 개인적,
                    비상업적 목적으로 사용할 수 있습니다. 상업적 이용을 원할
                    경우 별도 문의가 필요합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                6. 서비스 이용 제한
              </h2>
              <p className="mb-4">
                Oneiri는 다음의 경우 사전 통지 없이 서비스 이용을 제한하거나
                계정을 정지할 수 있습니다:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>본 약관을 위반한 경우</li>
                <li>서비스의 정상적인 운영을 방해한 경우</li>
                <li>법령에 위반되는 행위를 한 경우</li>
                <li>기타 Oneiri가 부적절하다고 판단하는 행위를 한 경우</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                7. 면책사항
              </h2>
              <ul className="list-disc pl-8 space-y-2">
                <li>
                  Oneiri는 천재지변, 전쟁, 사이버 공격 등 불가항력으로 인한
                  서비스 중단에 대해 책임지지 않습니다.
                </li>
                <li>
                  이용자가 AI 생성 콘텐츠를 사용하여 발생하는 모든 결과에 대한
                  책임은 이용자에게 있습니다.
                </li>
                <li>
                  무료 서비스의 특성상 지속적인 서비스 제공을 보장하지 않으며,
                  서비스 변경이나 중단에 대해 별도의 보상을 제공하지 않습니다.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                8. 분쟁 해결
              </h2>
              <p>
                본 약관과 관련하여 분쟁이 발생한 경우, 당사자 간 협의를 통해
                해결하며, 협의가 이루어지지 않을 경우 관련 법령 및 관할법원의
                기준에 따릅니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                9. 약관의 변경
              </h2>
              <p>
                Oneiri는 필요에 따라 본 약관을 변경할 수 있으며, 변경된 약관은
                서비스 내 공지를 통해 알려드립니다. 변경된 약관에 동의하지 않는
                경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold oneiri-text-primary mb-4 border-b-2 border-accent-primary/30 pb-2">
                10. 기타
              </h2>
              <ul className="list-disc pl-8 space-y-2">
                <li>본 약관은 한국법에 의거하여 해석됩니다.</li>
                <li>
                  본 약관에서 정하지 않은 사항은 관련 법령 및 일반적인 관례에
                  따릅니다.
                </li>
              </ul>
            </section>

            <div className="mt-8 p-6 bg-accent-primary/10 border border-accent-primary/20 rounded-lg text-center">
              <p className="oneiri-text-primary font-medium">
                본 이용약관은 2025년 6월 8일부터 시행됩니다.
              </p>
              <p className="text-sm oneiri-text-secondary mt-2">
                문의사항이 있으시면 언제든지 연락해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
