import { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "Oneiri의 이용약관을 확인하세요.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            이용약관
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="mb-6">
              본 약관은 Oneiri(이하 "Oneiri")가 제공하는 서비스의 이용과
              관련하여 Oneiri와 이용자 간의 권리, 의무 및 책임사항, 이용 조건
              등을 규정합니다.
              <br />
              Oneiri 서비스를 이용하는 경우, 본 약관에 동의한 것으로 간주됩니다.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-purple-200 pb-2">
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-purple-200 pb-2">
                2. 이용 계약의 성립
              </h2>
              <p>
                이용자가 본 약관에 동의하고 회원가입 또는 로그인 등 절차를
                완료한 경우, 이용 계약이 성립됩니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-purple-200 pb-2">
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-purple-200 pb-2">
                4. 이용자의 의무
              </h2>
              <p className="mb-4">
                이용자는 Oneiri 서비스를 사용하는 동안 다음 행위를 하여서는 안
                됩니다:
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
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

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h4 className="font-semibold text-red-800 mb-3">
                    AI 생성 콘텐츠 관련 금지사항
                  </h4>
                  <ul className="list-disc pl-8 space-y-2 text-red-700">
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

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h4 className="font-semibold text-orange-800 mb-3">
                    부적절한 콘텐츠 생성 금지
                  </h4>
                  <ul className="list-disc pl-8 space-y-2 text-orange-700">
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-800 mb-3">
                    AI 생성물 사용 시 준수사항
                  </h4>
                  <ul className="list-disc pl-8 space-y-2 text-blue-700">
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

              <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>⚠️ 중요:</strong> 위 금지사항을 위반할 경우 사전 통지
                  없이 서비스 이용이 제한되거나 계정이 정지될 수 있으며, 법적
                  책임을 질 수 있습니다. AI 생성 콘텐츠의 사용은 개인의 책임
                  하에 이루어져야 합니다.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-purple-200 pb-2">
                5. 회원 계정 관리
              </h2>
              <ul className="list-disc pl-8 space-y-2">
                <li>
                  계정 비밀번호 등 보안 정보는 이용자 본인이 책임지고 관리해야
                  합니다.
                </li>
                <li>
                  계정 도용, 해킹 등의 사고 발생 시 즉시 Oneiri에 통지해야 하며,
                  미통지로 인한 불이익에 대해 Oneiri는 책임을 지지 않습니다.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-purple-200 pb-2">
                6. 콘텐츠의 저작권 및 지적재산권 귀속
              </h2>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    서비스 플랫폼의 지적재산권
                  </h4>
                  <ul className="list-disc pl-8 space-y-2">
                    <li>
                      Oneiri 서비스 플랫폼, 웹사이트, 앱, 소프트웨어, 디자인,
                      로고, 상표 등의 모든 지적재산권은 Oneiri에게 있습니다.
                    </li>
                    <li>
                      이용자는 서비스 이용을 위해 필요한 범위 내에서만 해당
                      콘텐츠를 사용할 수 있습니다.
                    </li>
                    <li>
                      서비스의 역설계, 복제, 변경, 배포는 엄격히 금지됩니다.
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-green-800 mb-3">
                    이용자 입력 콘텐츠의 소유권
                  </h4>
                  <ul className="list-disc pl-8 space-y-2 text-green-700">
                    <li>
                      <strong>원본 소유권:</strong> 이용자가 입력한 꿈 내용,
                      개인 경험담 등의 원본 콘텐츠에 대한 소유권은 이용자에게
                      있습니다.
                    </li>
                    <li>
                      <strong>라이선스 부여:</strong> 이용자는 Oneiri에게 해당
                      콘텐츠를 AI 학습 및 서비스 제공 목적으로 사용할 수 있는
                      비독점적 라이선스를 부여합니다.
                    </li>
                    <li>
                      <strong>사용 범위:</strong> 이 라이선스는 AI 이야기 생성,
                      서비스 개선, 품질 향상에 한정됩니다.
                    </li>
                    <li>
                      <strong>삭제 권리:</strong> 이용자는 언제든지 본인이
                      입력한 콘텐츠의 삭제를 요청할 수 있습니다.
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-800 mb-3">
                    AI 생성 콘텐츠의 소유권
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-purple-700 mb-2">
                        꿈 이야기 및 이미지
                      </h5>
                      <ul className="list-disc pl-8 space-y-1 text-purple-700">
                        <li>
                          <strong>공동 저작물:</strong> AI가 생성한 꿈 이야기와
                          이미지는 이용자의 입력과 Oneiri의 AI 기술이 결합된
                          공동 저작물로 간주됩니다.
                        </li>
                        <li>
                          <strong>이용자 권리:</strong> 이용자는 생성된 콘텐츠를
                          개인적, 비상업적 목적으로 자유롭게 사용할 수 있습니다.
                        </li>
                        <li>
                          <strong>Oneiri 권리:</strong> Oneiri는 서비스 운영,
                          품질 개선, 마케팅 목적으로 생성된 콘텐츠를 사용할 수
                          있습니다.
                        </li>
                        <li>
                          <strong>상업적 이용:</strong> 상업적 이용을 위해서는
                          별도의 라이선스 계약이 필요합니다.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white border border-purple-300 rounded p-4">
                      <p className="text-sm text-purple-600">
                        <strong>중요:</strong> AI 생성물의 저작권은 현행법상
                        명확하지 않은 영역입니다. 관련 법령의 변화에 따라 본
                        조항은 업데이트될 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-800 mb-3">
                    서비스 이용 데이터의 귀속
                  </h4>
                  <ul className="list-disc pl-8 space-y-2 text-blue-700">
                    <li>
                      <strong>사용 통계:</strong> 서비스 이용 패턴, 접속 로그,
                      기능 사용 현황 등의 데이터는 Oneiri에게 귀속됩니다.
                    </li>
                    <li>
                      <strong>익명화된 데이터:</strong> 개인을 식별할 수 없도록
                      처리된 집계 데이터는 Oneiri의 소유입니다.
                    </li>
                    <li>
                      <strong>AI 학습 데이터:</strong> 서비스 개선을 위한 AI
                      학습에 사용되는 데이터는 개인정보를 제거한 후 Oneiri가
                      소유합니다.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    콘텐츠 사용 제한 및 책임
                  </h4>
                  <ul className="list-disc pl-8 space-y-2">
                    <li>
                      이용자가 서비스에 업로드한 콘텐츠에 대한 법적 책임은 해당
                      이용자에게 있습니다.
                    </li>
                    <li>
                      Oneiri는 법령 또는 타인의 권리를 침해하는 콘텐츠에 대해
                      사전 통지 없이 삭제 또는 차단할 수 있습니다.
                    </li>
                    <li>
                      AI가 생성한 꿈 이야기는 창작 콘텐츠로, 사실과 다를 수
                      있으며 이용자의 기대를 충족하지 않을 수 있습니다.
                    </li>
                    <li>
                      제3자의 지적재산권을 침해하는 콘텐츠 생성 시 이용자가 모든
                      책임을 집니다.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-purple-200 pb-2">
                7. 서비스 이용 제한 및 계약 해지
              </h2>
              <p className="mb-3">
                Oneiri는 다음 사유가 발생한 경우 사전 통지 없이 서비스 이용을
                제한하거나 이용 계약을 해지할 수 있습니다:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>약관 또는 법령 위반</li>
                <li>타인의 권리를 침해하거나 반복적 민원 발생</li>
                <li>시스템에 악영향을 끼치는 비정상적인 사용</li>
                <li>서비스 운영을 고의로 방해하는 행위</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-purple-200 pb-2">
                8. 책임의 제한 (면책 조항)
              </h2>
              <p className="mb-3">
                Oneiri는 다음 사항에 대하여 책임을 지지 않습니다:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>천재지변, 시스템 장애, 통신망 불안정 등 불가항력적 사유</li>
                <li>이용자의 귀책사유로 인한 장애 또는 손해</li>
                <li>이용자가 생성·게시한 정보의 신뢰성, 정확성</li>
                <li>
                  AI 생성 콘텐츠로 인해 발생한 부정확성, 불쾌감, 정신적 고통
                </li>
                <li>이용자 간 또는 제3자 간의 분쟁</li>
                <li>서비스 링크를 통해 접속한 외부 웹사이트의 정보, 보안</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-purple-200 pb-2">
                9. 유료 서비스 (해당 시)
              </h2>
              <ul className="list-disc pl-8 space-y-2">
                <li>
                  Oneiri는 일부 유료 기능을 제공할 수 있으며, 해당 이용 요금 및
                  결제 방식은 별도 고지됩니다.
                </li>
                <li>
                  유료 서비스 해지 및 환불은 전자상거래법 등 관련 법령 및 개별
                  약정에 따릅니다.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-purple-200 pb-2">
                10. 분쟁 해결
              </h2>
              <p>
                본 약관과 관련된 분쟁은 당사자 간 협의로 우선 해결하며, 협의가
                이루어지지 않을 경우 Oneiri의 소재지(대한민국 서울특별시 기준)를
                관할하는 법원을 1심 전속관할 법원으로 합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-purple-200 pb-2">
                11. 약관의 변경
              </h2>
              <ul className="list-disc pl-8 space-y-2">
                <li>
                  본 약관은 서비스 운영상 필요에 따라 변경될 수 있으며, 변경 시
                  최소 7일 전 웹사이트를 통해 공지합니다.
                </li>
                <li>
                  변경 약관은 공지한 시점부터 효력이 발생하며, 이용자는 변경
                  이후에도 서비스를 계속 사용할 경우 변경 약관에 동의한 것으로
                  간주됩니다.
                </li>
              </ul>
            </section>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
                📌 면책 고지 (AI 생성 콘텐츠 관련)
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-orange-800">
                <li>
                  Oneiri는 생성형 AI 기술을 기반으로 꿈 이야기를 창작하는
                  서비스로, 생성된 이야기는 실제 사실과 다를 수 있으며,
                  진단·상담·치료의 목적이 아닙니다.
                </li>
                <li>
                  AI 생성물은 심리적, 정서적으로 불편함을 유발할 수 있으며,
                  Oneiri는 이에 따른 정신적, 정서적 피해나 간접적 손해에 대해
                  책임을 지지 않습니다.
                </li>
                <li>
                  Oneiri는 생성된 꿈 이야기가 의학적 또는 심리학적 해석, 조언,
                  진단을 대체하지 않음을 명확히 밝힙니다.
                </li>
                <li>
                  <strong>만 14세 미만 아동:</strong> 만 14세 미만 아동의 서비스
                  이용 시 법정대리인의 동의가 필요하며, 부적절한 콘텐츠 노출
                  방지를 위해 보호자의 지도 감독하에 이용할 것을 권장합니다.
                </li>
                <li>
                  <strong>정신건강 주의사항:</strong> 악몽, 트라우마, 정신적
                  고통과 관련된 꿈 내용 처리 시 전문 상담사나 의료진의 도움을
                  받을 것을 권장합니다.
                </li>
              </ul>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-purple-200 pb-2">
                [부칙]
              </h2>
              <ul className="list-disc pl-8 space-y-1">
                <li>
                  본 약관은 <strong>2025년 6월 8일</strong>부터 적용됩니다.
                </li>
                <li>최초 제정일: 2025년 6월 8일</li>
              </ul>
            </section>

            <div className="text-center pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                문의사항이 있으시면{" "}
                <a
                  href="mailto:relee6203@gmail.com"
                  className="text-purple-600 hover:text-purple-800"
                >
                  relee6203@gmail.com
                </a>
                으로 연락주시기 바랍니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
