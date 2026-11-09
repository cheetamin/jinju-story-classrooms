# 공용 전시관 별도 배포

- 기존 진주 사이트는 유지합니다.
- 공용 Worker: `our-region-lanterns`
- 독립 D1: `our-region-lanterns-db`
- 배포 브랜치: `codex/regional-exhibition-20261108`
- Node 24 / `npm run build:external`
- 배포 명령: `npx wrangler deploy --config dist/server/wrangler.json`
- 새 DB 스키마 적용 완료. 실제 운영 데이터는 복사하지 않았습니다.
- 공용 예시는 학급 교사 비밀번호로 읽기 전용 입장하며 고정된 공통 비밀번호를 사용하지 않습니다.
- 2026-11-09: 자동 테스트·타입 검사·외부 빌드 통과. 별도 앱 연결 완료 후 운영 배포와 화면 검증을 진행합니다.
