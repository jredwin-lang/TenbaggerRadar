# Tenbagger Radar v2

실제 미국 주식 일별 가격과 거래량으로 기술적 지표를 계산한 정적 HTML 대시보드입니다.

## 데이터 기준

- 분석 기준: 2026-09-14 KST. 출처: HTML의 분석 기준 표시.
- 정규장 종가 기준: 2026-09-11 미국 동부시각. 출처: Yahoo Finance 응답과 HTML의 종가 교차 확인 링크.
- 실시간 자동 갱신이 아닙니다. 원자료 출처와 저장시각은 대시보드에 포함되어 있습니다.
- Investment Score는 기존 HTML에서 승계한 평가 의견입니다.
- Timing Score와 AI 종합점수는 공개된 규칙에 따른 계산값이며 수익 확률이나 학습 모델의 예측값이 아닙니다.
- 확인되지 않은 데이터는 ‘확인 불가’로 표시합니다.

## GitHub Pages 게시

저장소 루트에 `index.html`과 `.nojekyll`을 올린 다음 **Settings → Pages → Build and deployment**에서 **Deploy from a branch**, 기본 브랜치, **/(root)**를 선택하고 저장합니다.

공식 설정 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

게시용 파일에는 Sites 계정 설정이나 인증 정보가 포함되어 있지 않습니다. 대시보드와 내장 시세 데이터는 공개 게시 시 누구나 볼 수 있습니다.

갱신 방식과 기록 범위: [갱신 안내](UPDATE-SCHEDULE.md). 현재 화면 버전 v2.3은 매크로를 첫 화면으로 표시하고 날짜별 거래대금·거래량 랭킹을 제공합니다.

예약 갱신에서 공급자의 일부 OHLCV 행이 잘못되면 해당 행을 제외하고 기록합니다. 안전한 새 일봉이 부족한 종목은 직전 검증 일봉을 유지하며 출처 카드에 표시합니다.
