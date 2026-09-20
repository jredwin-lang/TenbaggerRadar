# v2.1

- Display precision only (max 2 places; integer Fear & Greed), panel provenance, persistent sector buttons, yellow favorites, compact company tables, no Best50 pin duplicates.
- Radar Investment ordering, company-name labels, YTD/week returns, selection and bottleneck guide.
- Korean default industry watchlists including power, auto, robots, space and defense.
- Common sourced candle/volume/MA chart, no B on watchlist details. Full-series moving averages computed before compacting.
- Monthly SEC collection with explicit failure status and archived records; existing desktop heartbeat extended with monthly source-based company research. Original Investment scores unchanged until supported research.
- Data updates do not increment the version; minor code revisions increment by 0.01.

# v2.2

- Colored spaced timing grades; CNN-shaped segmented gauge and human-readable source links.
- Remove nested vertical sector scrolling; add 21-trading-day return and sourced high/low price range with completed-close marker.
- Balance watch details into candle/volume/MA left column and state/metrics right column. Range periods shorter than 252 bars are explicitly labeled.

# v2.3

- Macro-first navigation and requested index/FX/commodity/crypto cards with completed-bar sparklines.
- Compact dated turnover/volume rankings, industry labels, trailing interest controls and historical snapshots starting with this revision.
- Source-linked issuer summaries, conditional outlooks and recent RSS article metadata. Missing descriptions/news and unreviewed article bodies explicitly labeled.

## v2.4
- 기업 뉴스는 WSJ·Bloomberg·NYT 공개 기사 목록 우선. 확인되지 않는 경우 다른 매체 보완임을 표시. 유료 본문 미검토 명시.

## v2.5
- Reject provider OHLCV rows that violate price/volume invariants and retain their raw values for audit.
- If a ticker cannot be safely refreshed, preserve its last verified bars and mark the source card rather than fail the entire scheduled deployment.
- Show ticker-specific completed-session dates where a fallback was necessary.

## v2.6
- Schedule collections at 06:50 and 21:50 KST to target publication by 07:00 and 22:00, while avoiding top-of-hour GitHub Actions load; actual starts may still be delayed.
- Fix dated HTML title generation during daily refresh; disclose new collection times in UI.

## v2.62
- Synchronize version labels and cache keys across generated HTML and modules.
- Preserve Market Regime after tab changes and sector filtering; reuse the core market fetch.
- Exclude missing sentiment and insufficient trend history from the score denominator.
- Keep mobile macro and regime tiles in three columns.


## v2.64
- 매크로 첫 화면에 실제 시장 수치와 공개 기사 메타데이터를 종합한 미국증시 아침 브리핑 추가
- S&P 500·다우·러셀2000 수집 및 시장 폭·VIX·달러·원자재·섹터 교차 해석
- Fact와 Opinion, 상승·하락 시나리오, 출처와 유료 본문 미검토 범위를 분리 표시
- WSJ·Bloomberg·NYT 우선, 확인 불가 시 Reuters·FT·CNBC로 보완하며 원인 단정 금지


## v2.64
- S&P 500·다우·나스닥·러셀2000을 아침 브리핑에 함께 표시
- 기사 노출을 매체별 1건, 최대 3건으로 균형화하고 기사 수집 범위를 명시
- 동일 버전 브라우저 캐시를 해소해 최신 브리핑 자산을 강제 갱신


## v2.65
- 미국증시 요약을 5문장으로 확장하고 발행시각이 명확한 경제 전문지 기사 카드·관전 포인트·조건부 리스크 추가
- 뉴스 수집을 미국 시장 중심으로 좁히고 최근 24시간과 이전 72시간 참고 기사를 분리
- 시장 → 자금 → 산업 점수 패널 삭제, 섹터 등락 요약을 히트맵 하단에 펼쳐 표시
- 과거 FOMC 고정 문구 제거, 공식 일정 링크와 기사 발행일·사건일 구분


## v2.66
- 9/20 투자 자료를 6개 주제의 검토 기록으로 정리하고 공식 원문·보도·가설·미확인 항목을 구분
- AI 바이오 연구와 임상·매출 성과, 의료기기와 신약 승인, 조건부 토큰화 면제의 범위를 명확히 표시
- 관심 후보를 기존 차트와 연결하고 데이터가 없는 종목은 일봉 미수집으로 표시
- 재검토 날짜와 투자 논리 재검토 조건을 제공. 수동 검토 기록은 자동 시세 갱신과 별도 관리
- 검토 기록은 투자 점수·순위 산식에 반영하지 않음
