// This self-contained artwork never receives a user's dream or account data.
/** 가상의 꿈으로 만든 「꿈 페이지」 견본(A5 한 면). 랜딩과 인쇄 견본이 함께 쓴다. */
export const DREAM_PAGE_SVG = `<svg viewBox="0 0 420 594" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title description">
  <title id="title">달빛 정거장 — 가상의 꿈을 담은 Oneiri 꿈 페이지 견본</title>
  <desc id="description">책의 한 면. 위쪽 그림에는 텅 빈 승강장으로 금빛 달이 들어오고, 아래에는 마지막 기차가 떠난 뒤 달을 기다린 꿈 이야기가 적혀 있다.</desc>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#101227"/><stop offset="1" stop-color="#534669"/>
    </linearGradient>
    <radialGradient id="moonlight">
      <stop stop-color="#f4d799" stop-opacity=".55"/>
      <stop offset="1" stop-color="#f4d799" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gutter" x1="0" x2="1">
      <stop stop-color="#d9cbc4" stop-opacity=".7"/><stop offset=".08" stop-color="#f5ede8" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <path fill="#f5ede8" d="M0 0h420v594H0z"/>
  <path fill="url(#gutter)" d="M0 0h420v594H0z"/>
  <g font-family="Georgia, 'AppleMyungjo', 'Nanum Myeongjo', serif" fill="#6d526e">
    <text x="40" y="44" font-size="12" font-style="italic">Oneiri · 별빛 서재</text>
    <text x="380" y="44" font-size="12" text-anchor="end">꿈 페이지 · 견본</text>
  </g>
  <path d="M40 56h340" stroke="#cbb8c5"/>
  <svg x="40" y="72" width="340" height="214" viewBox="24 24 544 235" preserveAspectRatio="xMidYMid slice">
    <rect x="24" y="24" width="544" height="235" fill="url(#sky)"/>
    <path fill="#9180a5" opacity=".42" d="M24 166l103-27 72 16 87-24 100 17 93-27 89 33v43H24z"/>
    <path fill="#bca8c6" opacity=".2" d="M24 151q142 24 272 2t272-7v29q-137-11-267 5t-277-4z"/>
    <g fill="#e6d5df" opacity=".82">
      <circle cx="190" cy="65" r="1.5"/><circle cx="232" cy="92" r="1"/>
      <circle cx="323" cy="53" r="1.5"/><circle cx="389" cy="76" r="1"/>
      <circle cx="461" cy="59" r="1"/><circle cx="530" cy="91" r="1.5"/>
    </g>
    <circle cx="428" cy="130" r="91" fill="url(#moonlight)"/>
    <circle cx="428" cy="130" r="38" fill="#f3dba9"/>
    <path fill="#dfbd88" opacity=".28" d="M400 114q14-12 22 2t-8 18q-14 1-14-20zm31 26q14-10 22 2t-15 15q-15-2-7-17z"/>
    <path d="M456 169l97 90m-122-88 24 88m-29-68 57 2m-49 11 72 3m-61 12 90 5m-78 15 109 6"
          fill="none" stroke="#26243c" stroke-width="4"/>
    <path d="M456 169l97 90m-122-88 24 88" fill="none" stroke="#b5a1ad" stroke-width="1.5"/>
    <path fill="#29263d" d="M24 221l408-51-102 89H24z"/>
    <path fill="#40384e" d="M24 206l408-36-116 76H24z"/>
    <path d="M29 229l398-57" stroke="#d3b883" stroke-width="2" opacity=".8"/>
    <path fill="#201d33" d="M24 24h166l-49 47L24 123z"/>
    <path d="M111 88v153m52-175v119" stroke="#211f35" stroke-width="6"/>
    <path d="M128 193l64-9m-56 7v19m48-23v15" stroke="#211f35" stroke-width="5"/>
  </svg>
  <g font-family="Georgia, 'AppleMyungjo', 'Nanum Myeongjo', serif" fill="#29243b">
    <text x="40" y="334" font-size="28" font-weight="700">달빛 정거장</text>
    <text x="40" y="358" font-size="12" fill="#6d526e">어느 밤의 꿈</text>
    <g font-size="15">
      <text x="40" y="398">마지막 기차가 떠난 뒤에도</text>
      <text x="40" y="424">나는 승강장을 떠나지 못했다.</text>
      <text x="40" y="450">선로 끝에서 금빛이 번지더니,</text>
      <text x="40" y="476">달이 소리 없이 미끄러져 들어왔다.</text>
      <text x="40" y="510">문이 열리기를 기다리며,</text>
      <text x="40" y="536">나는 표 대신 꿈 한 조각을 쥐었다.</text>
    </g>
    <text x="210" y="572" font-size="12" text-anchor="middle" fill="#6d526e">— 7 —</text>
  </g>
</svg>`;

/** 인쇄용 견본 문서 */
export const DREAM_POSTCARD_SAMPLE = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Oneiri 꿈 페이지 견본 — 달빛 정거장</title>
<style>
  @page { size: 148mm 210mm; margin: 0; }
  html, body { margin: 0; }
  svg { display: block; width: 100%; height: auto; }
  @media print {
    svg { width: 148mm; height: 210mm; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  }
</style>
</head>
<body>
${DREAM_PAGE_SVG}
</body>
</html>`;
