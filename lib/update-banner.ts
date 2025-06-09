interface UpdateBannerData {
  version: string;
  dismissed: boolean;
  dismissedAt: string;
}

const COOKIE_NAME = "oneiri-update-banner";
const COOKIE_EXPIRES_DAYS = 365; // 1년

/**
 * 쿠키에서 업데이트 배너 데이터 가져오기
 */
export function getUpdateBannerData(): UpdateBannerData | null {
  if (typeof document === "undefined") return null;

  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!cookieValue) return null;

  try {
    return JSON.parse(decodeURIComponent(cookieValue));
  } catch {
    return null;
  }
}

/**
 * 쿠키에 업데이트 배너 데이터 저장하기
 */
export function setUpdateBannerData(data: UpdateBannerData): void {
  if (typeof document === "undefined") return;

  const expires = new Date();
  expires.setDate(expires.getDate() + COOKIE_EXPIRES_DAYS);

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(data)
  )}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * 버전 비교 함수 (semantic versioning)
 */
export function compareVersions(version1: string, version2: string): number {
  const v1parts = version1.replace(/^v/, "").split(".").map(Number);
  const v2parts = version2.replace(/^v/, "").split(".").map(Number);

  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;

    if (v1part > v2part) return 1;
    if (v1part < v2part) return -1;
  }

  return 0;
}

/**
 * GitHub API에서 최신 릴리즈 정보 가져오기
 */
export async function getLatestRelease() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/jhlee0409/oneiri/releases/latest",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch latest release");
    }

    const release = await response.json();
    return {
      version: release.tag_name,
      name: release.name || release.tag_name,
      body: release.body,
      publishedAt: release.published_at,
      htmlUrl: release.html_url,
    };
  } catch (error) {
    console.error("Error fetching latest release:", error);
    return null;
  }
}

/**
 * 업데이트 배너를 표시해야 하는지 확인
 */
export function shouldShowUpdateBanner(latestVersion: string): boolean {
  const bannerData = getUpdateBannerData();

  // 쿠키가 없으면 표시
  if (!bannerData) return true;

  // 새로운 버전이 있으면 표시
  if (compareVersions(latestVersion, bannerData.version) > 0) return true;

  // 현재 버전이 이미 dismissed되었으면 숨김
  if (bannerData.version === latestVersion && bannerData.dismissed)
    return false;

  return true;
}

/**
 * 업데이트 배너 닫기
 */
export function dismissUpdateBanner(version: string): void {
  setUpdateBannerData({
    version,
    dismissed: true,
    dismissedAt: new Date().toISOString(),
  });
}
