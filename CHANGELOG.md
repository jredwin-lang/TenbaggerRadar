# v2.1

- Display precision only (max 2 places; integer Fear & Greed), panel provenance, persistent sector buttons, yellow favorites, compact company tables, no Best50 pin duplicates.
- Radar Investment ordering, company-name labels, YTD/week returns, selection and bottleneck guide.
- Korean default industry watchlists including power, auto, robots, space and defense.
- Common sourced candle/volume/MA chart, no B on watchlist details. Full-series moving averages computed before compacting.
- Monthly SEC collection with explicit failure status and archived records; existing desktop heartbeat extended with monthly source-based company research. Original Investment scores unchanged until supported research.
- Data updates do not increment the version; completed code revisions increment by 0.1.

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
