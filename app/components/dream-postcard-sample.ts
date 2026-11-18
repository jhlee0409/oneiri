// This self-contained print document never receives a user's dream or account data.
export const DREAM_POSTCARD_SAMPLE = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Oneiri 꿈 엽서 샘플 — 달빛 정거장</title>
<style>
  @page { size: 148mm 105mm; margin: 0; }
  html, body { margin: 0; }
  svg { display: block; width: 100%; height: auto; }
  @media print {
    svg { width: 148mm; height: 105mm; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  }
</style>
</head>
<body>
<svg viewBox="0 0 592 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title description">
  <title id="title">달빛 정거장 — 가상의 꿈을 담은 Oneiri 엽서</title>
  <desc id="description">텅 빈 승강장 너머 선로 위로 금빛 달이 기차처럼 들어온다. 마지막 기차가 떠난 뒤, 달이 소리 없이 승강장으로 들어왔다.</desc>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#101227"/><stop offset="1" stop-color="#534669"/>
    </linearGradient>
    <radialGradient id="moonlight">
      <stop stop-color="#f4d799" stop-opacity=".55"/>
      <stop offset="1" stop-color="#f4d799" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="window"><rect x="24" y="24" width="544" height="235"/></clipPath>
  </defs>
  <path fill="#f5ede8" d="M0 0h592v420H0z"/>
  <g clip-path="url(#window)">
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
    <path d="M24 24h544v235H24z" fill="none" stroke="#a991af" stroke-opacity=".55"/>
  </g>
  <g fill="#29243b" font-family="Georgia, 'AppleMyungjo', 'Nanum Myeongjo', serif">
    <text x="24" y="294" font-size="24" font-style="italic" fill="#6d526e">Oneiri</text>
    <text x="568" y="291" text-anchor="end" font-size="17" fill="#6d526e">꿈 엽서 · 견본</text>
    <path d="M24 305h544" stroke="#cbb8c5"/>
    <text x="24" y="344" font-size="34" font-weight="700">달빛 정거장</text>
    <text x="24" y="374" font-size="20">마지막 기차가 떠난 뒤,</text>
    <text x="24" y="400" font-size="20">달이 소리 없이 승강장으로 들어왔다.</text>
  </g>
</svg>
</body>
</html>`;
