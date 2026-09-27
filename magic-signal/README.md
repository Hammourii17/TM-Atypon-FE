# Magic Signal

A simple TradingView indicator (`magic_signal.pine`, Pine Script v6). It gives
BUY/SELL signals with a stop-loss sized to the market, never a fixed number.

- **Every signal is shown**, however wide its stop. When the stop is wider than
  4× the reference ATR, the label says **"⚠ wide SL · size down"**. You keep the
  trade and cut the position size instead of skipping it.
- **1h and 4h get wider stops automatically.** The stop is measured in ATR of
  the chart's own candles, and the multiplier grows with the timeframe
  (2.5 on 1h → 3.0 on 4h).
- **Backtested on your chart, live.** A table backtests every stop method on the
  symbol and timeframe you are looking at.

## How it works

**Signal** (kept simple):
- **BUY**: EMA 21 crosses above EMA 55, close is above EMA 200, and ADX > 25.
- **SELL**: the mirror image.

Signals only fire on a closed candle, so they don't repaint.

**Stop-loss**: every method is measured in
`refATR = max(ATR 14, 100-bar average of ATR 14)`, so a quiet patch just before
a signal cannot make the stop dangerously tight.

| Method | Stop distance | Notes |
|---|---|---|
| **Magic** (default) | `k × refATR`, k = 2.5 on 1h, 3.0 on 4h+ | Best all-round in the backtest |
| Learned | learned from this chart: the 80th percentile of how far past *winning* signals moved against entry before reaching +3 refATR, + 0.25 | Adapts per symbol. Uses Magic until 8 winners have been seen |
| Structure | beyond the last 5 candles' low/high + 1 refATR | Classic swing stop |
| Auto | whichever of the three has the best backtested average R on this chart | Needs 20 trades per method, uses Magic until then |

Targets: **TP1 = 1R, TP2 = 2R, TP3 = 3R**, where R is the stop distance.
Hover over a signal label to see entry, SL, TP1–3 and the stop width in ATR.
Alerts: use "Any alert() function call" for messages that include SL and TP
prices, or use the plain *Magic BUY / Magic SELL* conditions.

## Backtest results

The source is `backtest/magic_backtest.py`, which applies the same rules as the
Pine script bar by bar. The data is Bitstamp BTC/USD, 1h candles, June 2013 →
Aug 2017 (about 37k candles). The 4h candles are built from the 1h data. Each
trade is scored at 2R: it closes at the SL, at 2R, or on an opposite signal.
When the SL and the target are inside the same candle, the SL counts first.

**Magic stop (default)**

| | Trades | TP1 hit | TP2 hit | TP3 hit | Win % (2R) | Avg R / trade | Profit factor | Median SL | Widest SL |
|---|---|---|---|---|---|---|---|---|---|
| BTC 1h | 123 | 53% | 39% | 29% | 41% | +0.24 | 1.44 | 2.2% | 19% |
| BTC 4h* | 96 | 50% | 46% | 41% | 46% | +0.43 | 1.89 | 5.7% | 37% |

\*The 4h row pools the four phase-shifted 4h series (candles opening at 00, 01,
02 and 03 h), which gives more trades than one series (about 24 each).

The result held in both halves of the data:

| | 1st half: avg R | 2nd half: avg R |
|---|---|---|
| 1h | +0.21 | +0.26 |
| 4h | +0.32 | +0.52 |

**What the research showed**
1. **The ADX > 25 filter adds accuracy.**
   - 4h without it: 34% win, +0.12 R.
   - 4h with it: 46% win, +0.43 R.
   - It improved 6 of 8 timeframe and data-half splits (1h, 2h, 4h, 8h).
2. **The volatility stop beat the fancier stops.** The Learned (MAE) stop and
   the Structure stop were close to Magic but not better. On 1h, Learned had
   nearly twice Magic's worst losing run (16.9R vs 7.0R).
3. **"Auto" (pick the best recent method) did not help.** Picking whichever
   stop worked best recently chases noise: on 1h it scored +0.14 R versus
   +0.24 R for plain Magic. It is available as an option, but Magic is the
   default.
4. Wide stops are normal on 4h crypto. The median stop is 5.7%, and the widest
   was 37% during the 2013–2014 crashes. Those signals are still shown, with
   the size-down warning.

**Honest limits**
- The data is BTC 2013–2017 only. The EURUSD H1 sample bundled with
  `backtesting` has fewer than 15 signals with the ADX filter, which is too
  few to judge.
- Win rate at 2R is about 40–46%. The edge comes from winners paying 2–3R, not
  from a very high hit rate. TP1 (1R) is reached about 50–55% of the time.
- Results exclude fees, slippage and funding. Past results don't guarantee
  future ones. Check the live table on your own symbol before trusting it.

## Run the backtest

```bash
cd magic-signal/backtest
pip install -r requirements.txt
# any hourly OHLC CSV with Timestamp (unix s), Open, High, Low, Close columns
curl -sSLO https://raw.githubusercontent.com/bukosabino/ta/master/test/data/datas.csv
python magic_backtest.py datas.csv
```

## Install on TradingView

Open the Pine Editor, paste `magic_signal.pine`, click **Add to chart**, then
switch the chart to 1h or 4h.

## Scalp Confluence strategy (`scalp_confluence.pine`)

This is your multi-engine strategy (Accumulation/POC, Asia→London→NY sessions,
Fib golden pocket, and the 4H EMA filter), now with the Magic stop-loss:

- **"SL too wide" no longer skips trades.** Every signal is taken and drawn with
  its stop. A stop wider than 4× refATR (or wider than the warning value in
  $/Pips mode) gets a "⚠ wide SL · size down" line on the label.
- **Auto stop (default)** is `k × refATR`, with k = 2.5 on 1h and below and 3.0
  on 4h. You can switch to your original structure stop, or to "wider of both".
  TP1/TP2/TP3 are 1R/2R/3R of the stop. The old fixed $10/$20/$30 mode is still
  available.
- **Risk sizing (default):** position size = risk $ ÷ stop distance. A wider
  stop means a smaller size, so every trade risks about the same dollars. The
  minimum size is 3 units (so it can split across the 3 TPs), which can push
  the risk above target on very wide stops.
- **Backtest on gold:** it's a `strategy()`, so the TradingView Strategy Tester
  runs it on your XAUUSD data. Compare the stop methods on 1h and 4h there.
  Add your broker's commission and slippage in the strategy's Properties.

**Colors:**

| Color | Meaning |
|---|---|
| Blue background | Asia session |
| Orange background | London session |
| Purple background | New York session |
| Blue box | Asia high/low range |
| Orange box | London range |
| Grey box | Accumulation range |
| Orange dots | POC |
| Yellow box | Fib golden pocket |
