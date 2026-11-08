# 공용 전시관 검증 기록

- 원본: ../candidate 참조만 사용. 기존 배포 및 운영 DB 변경 없음.
- `node scripts/test-all.mjs`: 단위 테스트 47개 통과, 통합 시나리오 전부 통과.
- `node node_modules/typescript/bin/tsc --noEmit`: 종료 0, 오류 없음.
- `node scripts/build-external.mjs`: 종료 0, 독립 Worker 번들 생성 완료.
- `node scripts/check-independent-deploy.mjs`: 통과. 새 Worker/DB 이름 확인, 기존 DB/R2/기존 프록시 환경 연결 없음.
- 별도 로컬 DB 마이그레이션 0000~0005: 적용 성공. 운영 DB에는 적용하지 않음.
- 접근 코드·기존 관리 비밀번호의 소스 내 하드코딩 검사: 해당 값 없음.
- 최종 독립 코드 검토 완료. 지역명 이중 치환, 지역 설정 충돌 후 재열기, 이전 지역의 미저장 자료가 새 지역으로 잘못 저장되는 문제를 수정하고 회귀 검증.
- 현재 브라우저 Cloudflare 상태: 로그인 필요.
- 로컬 화면 QA: 실행 환경의 서버 연결 제한으로 미완료. 임시 미리보기 프로세스는 종료함.
- 실제 배포/신규 운영 DB 생성/운영 화면 확인: 아직 미실행. 공개 주소는 아직 없음.

## 배포 시 이어서 할 일
1. 로그인된 Cloudflare 계정의 무료 플랜 확인.
2. 기존 진주 Worker와 별도로 our-region-lanterns / our-region-lanterns-db 생성.
3. 새 DB ID만 구성에 반영. 새 관리자 인증 및 암호화 Secret 설정.
4. 새 DB 마이그레이션, 재빌드 및 별도 Worker 배포.
5. 진주/타 지역 가상 학급으로 실제 화면에서 지역 설정, 제작·제출·승인, 로그아웃 검증.
6. 공용 버전의 실제 확인된 공개 주소 안내. 기존 진주 주소는 보존.
