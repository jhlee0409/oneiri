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
  <desc id="description">보랏빛 밤하늘 아래 달과 산이 겹쳐 보인다. 마지막 기차를 놓친 자리에서, 달이 천천히 플랫폼으로 들어왔다.</desc>
  <defs>
    <linearGradient id="sky" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop stop-color="#201930"/><stop offset="1" stop-color="#5a4470"/>
    </linearGradient>
  </defs>
  <path fill="#fbf2e6" d="M0 0h592v420H0z"/>
  <path fill="url(#sky)" d="M24 24h544v235H24z"/>
  <circle cx="390" cy="112" r="52" fill="#f2d8ac"/>
  <path fill="#725881" d="M24 212l99-55 62 31 92-53 95 68 85-42 111 59v39H24z"/>
  <path fill="#3b304e" d="M24 244l87-32 85 19 104-46 90 56 87-28 91 32v14H24z"/>
  <path stroke="#d6b8dc" stroke-width="2" fill="none" d="M38 251q145-47 290 0m-105 0q152-30 330-13"/>
  <g fill="#fff0d7">
    <circle cx="100" cy="93" r="2"/><circle cx="170" cy="122" r="3"/>
    <circle cx="248" cy="72" r="2"/><circle cx="502" cy="76" r="3"/>
  </g>
  <g fill="#302339" font-family="system-ui, sans-serif">
    <text x="24" y="293" font-size="15" letter-spacing="2">ONEIRI · 꿈 엽서 샘플</text>
    <text x="24" y="338" font-size="34" font-weight="700">달빛 정거장</text>
    <text x="24" y="369" font-size="20">마지막 기차를 놓친 자리에서,</text>
    <text x="24" y="394" font-size="20">달이 천천히 플랫폼으로 들어왔다.</text>
  </g>
</svg>
</body>
</html>`;
