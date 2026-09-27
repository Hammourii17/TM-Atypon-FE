"""
Magic Signal - backtester.

Mirrors ../magic_signal.pine bar by bar, so the numbers printed here describe
what the indicator draws on the chart.

Signal (kept deliberately simple):
    LONG  when EMA(21) crosses above EMA(55), close > EMA(200) and ADX(14) > 25
    SHORT when EMA(21) crosses below EMA(55), close < EMA(200) and ADX(14) > 25

Stop-loss: never a fixed number. Every method is measured in "reference ATR"
    refATR = max(ATR(14), SMA(ATR(14), 100))
so a quiet patch right before the signal cannot make the stop too tight.
Higher timeframes automatically get a wider stop (bigger candles -> bigger ATR,
plus a bigger multiplier). The signal is ALWAYS shown, however wide its stop.

    MAGIC      k * refATR, k = 2.5 on <=1h rising to 3.0 on >=4h        (default)
    LEARNED    k learned from this chart: 80th percentile of how far past
               *winning* signals went against entry (MAE) before they
               reached +3 refATR, + 0.25 buffer. Falls back to MAGIC until
               8 past winners exist.
    STRUCTURE  beyond the extreme of the last 5 candles + 1 refATR buffer
    AUTO       uses whichever of the three has the best backtested
               expectancy on this chart so far (>= 20 closed trades each),
               otherwise MAGIC.

Trade model used for scoring:
    TP1/TP2/TP3 = 1R/2R/3R. A trade is scored at the chosen target (default 2R):
    it closes at SL, at the target, or at the close of an opposite signal.
    If SL and target are both inside one candle the SL is assumed first.

usage: python magic_backtest.py path/to/btc_1h.csv
"""
import sys
from dataclasses import dataclass

import numpy as np
import pandas as pd

METHODS = ["MAGIC", "LEARNED", "STRUCTURE"]


# ---------------------------------------------------------------- indicators
def ema(x, n):
    return x.ewm(span=n, adjust=False).mean()


def rma(x, n):
    return x.ewm(alpha=1.0 / n, adjust=False).mean()


def true_range(d):
    pc = d.close.shift(1)
    tr = pd.concat([d.high - d.low, (d.high - pc).abs(), (d.low - pc).abs()], axis=1).max(axis=1)
    tr.iloc[0] = d.high.iloc[0] - d.low.iloc[0]
    return tr


def adx(d, n):
    up, dn = d.high.diff(), -d.low.diff()
    pdm = pd.Series(np.where((up > dn) & (up > 0), up, 0.0), index=d.index)
    mdm = pd.Series(np.where((dn > up) & (dn > 0), dn, 0.0), index=d.index)
    tr = rma(true_range(d), n)
    pdi, mdi = 100 * rma(pdm, n) / tr, 100 * rma(mdm, n) / tr
    dx = (100 * (pdi - mdi).abs() / (pdi + mdi).replace(0, np.nan)).fillna(0)
    return rma(dx, n)


# ---------------------------------------------------------------- params
@dataclass
class Params:
    fast: int = 21
    slow: int = 55
    trend: int = 200
    adx_len: int = 14
    adx_min: float = 25.0  # 0 disables the strength filter
    atr_len: int = 14
    atr_avg: int = 100
    tf_hours: float = 1.0
    swing_len: int = 5
    learn_move: float = 3.0
    learn_pct: float = 80.0
    learn_min: int = 8
    auto_min: int = 20
    score_r: float = 2.0

    @property
    def k_magic(self):
        # 2.5 at 1h and below, 3.0 at 4h and above, smooth in between
        t = np.clip(np.log2(max(self.tf_hours, 1.0)) / 2.0, 0.0, 1.0)
        return 2.5 + 0.5 * t


def prepare(df, p):
    d = pd.DataFrame({c: df[c].astype(float) for c in ["open", "high", "low", "close"]}, index=df.index)
    d["ema_fast"], d["ema_slow"], d["ema_trend"] = ema(d.close, p.fast), ema(d.close, p.slow), ema(d.close, p.trend)
    a = rma(true_range(d), p.atr_len)
    d["ref"] = np.maximum(a, a.rolling(p.atr_avg, min_periods=1).mean())
    d["adx"] = adx(d, p.adx_len)
    xu = (d.ema_fast > d.ema_slow) & (d.ema_fast.shift(1) <= d.ema_slow.shift(1))
    xd = (d.ema_fast < d.ema_slow) & (d.ema_fast.shift(1) >= d.ema_slow.shift(1))
    strong = d.adx > p.adx_min
    d["sig"] = 0
    d.loc[xu & (d.close > d.ema_trend) & strong, "sig"] = 1
    d.loc[xd & (d.close < d.ema_trend) & strong, "sig"] = -1
    d.iloc[: p.trend, d.columns.get_loc("sig")] = 0  # warm-up
    return d


# ---------------------------------------------------------------- engine
def run(df, p):
    d = prepare(df, p)
    o, h, l, c = (d[x].values for x in ["open", "high", "low", "close"])
    ref, sig = d.ref.values, d.sig.values
    n = len(c)

    trades = []            # every virtual trade (all methods + the shown one)
    open_t = []
    learners = []          # MAE trackers: dict(side, entry, ref, mae)
    learned = []           # MAE/refATR of past winners, in resolve order
    results = {m: [] for m in METHODS}  # closed R per method (for AUTO)

    for i in range(n):
        # ---- manage open trades
        # A trade is scored once (SL / target / opposite signal) but its
        # favourable excursion keeps being tracked until SL or an opposite
        # signal, so TP1/TP2/TP3 hit rates are measured independently.
        keep = []
        for t in open_t:
            s = t["side"]
            hit_sl = l[i] <= t["sl"] if s == 1 else h[i] >= t["sl"]
            opp = sig[i] == -s
            if not hit_sl:
                fav = (h[i] - t["entry"]) if s == 1 else (t["entry"] - l[i])
                t["mfe"] = max(t["mfe"], fav / t["risk"])
            if t.get("r") is None:
                r = None
                if hit_sl:
                    r = -1.0
                elif t["mfe"] >= p.score_r:
                    r = p.score_r
                elif opp:
                    r = s * (c[i] - t["entry"]) / t["risk"]
                if r is not None:
                    t["r"], t["exit"] = r, i
                    if t["method"] in results:
                        results[t["method"]].append(r)
            if not (hit_sl or opp):
                keep.append(t)
        open_t = keep

        # ---- MAE learners
        keep = []
        for m in learners:
            s = m["side"]
            adv = (m["entry"] - l[i]) if s == 1 else (h[i] - m["entry"])
            fav = (h[i] - m["entry"]) if s == 1 else (m["entry"] - l[i])
            m["mae"] = max(m["mae"], adv)
            if fav >= p.learn_move * m["ref"]:
                learned.append(m["mae"] / m["ref"])
            elif sig[i] != -s:
                keep.append(m)
        learners = keep

        # ---- new signal
        s = sig[i]
        if s == 0:
            continue
        e, a = c[i], ref[i]
        k_learn = p.k_magic
        if len(learned) >= p.learn_min:
            k_learn = float(np.clip(np.percentile(learned, p.learn_pct), 1.0, 8.0)) + 0.25
        lo, hi = l[max(0, i - p.swing_len + 1): i + 1].min(), h[max(0, i - p.swing_len + 1): i + 1].max()
        dist = {
            "MAGIC": p.k_magic * a,
            "LEARNED": k_learn * a,
            "STRUCTURE": max((e - lo) if s == 1 else (hi - e), 0.0) + 1.0 * a,
        }
        exp = {m: (np.mean(results[m]) if len(results[m]) >= p.auto_min else None) for m in METHODS}
        auto = "MAGIC"
        if all(v is not None for v in exp.values()):
            auto = max(METHODS, key=lambda m: exp[m])
        for m in METHODS + ["AUTO"]:
            src = auto if m == "AUTO" else m
            risk = dist[src]
            open_t.append(dict(method=m, src=src, side=s, bar=i, entry=e, risk=risk,
                               sl=e - s * risk, mfe=0.0, ref=a))
            trades.append(open_t[-1])
        learners.append(dict(side=s, entry=e, ref=a, mae=0.0))
    return d, pd.DataFrame(trades)


# ---------------------------------------------------------------- reporting
def stats(t):
    t = t.dropna(subset=["r"])
    if t.empty:
        return pd.Series(dtype=float)
    r = t.r.values
    eq = np.cumsum(r)
    streak = mx = 0
    for x in r:
        streak = streak + 1 if x <= 0 else 0
        mx = max(mx, streak)
    gl = -r[r <= 0].sum()
    return pd.Series({
        "trades": len(r),
        "TP1 hit%": 100 * (t.mfe >= 1).mean(),
        "TP2 hit%": 100 * (t.mfe >= 2).mean(),
        "TP3 hit%": 100 * (t.mfe >= 3).mean(),
        "win%@2R": 100 * (r > 0).mean(),
        "avgR": r.mean(),
        "PF": r[r > 0].sum() / gl if gl else np.inf,
        "maxDD_R": (np.maximum.accumulate(eq) - eq).max(),
        "lossStreak": mx,
        "SL% med": 100 * (t.risk / t.entry).median(),
        "SL% max": 100 * (t.risk / t.entry).max(),
    })


def load_btc(path):
    d = pd.read_csv(path)
    d.index = pd.to_datetime(d.Timestamp, unit="s")
    d = d.rename(columns=str.lower)[["open", "high", "low", "close"]]
    d = d[~d.index.duplicated()].loc["2013-06-01":]
    # dataset marks missing hours with 1.7e308 placeholders and has a few bad ticks
    return d[(d.high < 1e6) & (d.low > 0.5 * d.close) & (d.high < 2 * d.close)]


def load_eurusd():
    from backtesting.test import EURUSD  # pip install backtesting
    return EURUSD.rename(columns=str.lower)[["open", "high", "low", "close"]]


def resample(d, hours, offset=0):
    return d.resample(f"{hours}h", offset=f"{offset}h", label="left", closed="left").agg(
        {"open": "first", "high": "max", "low": "min", "close": "last"}).dropna()


def study(name, src, hours, p_over=None):
    """Runs every phase-shifted copy of the timeframe (e.g. 4h candles starting at
    00:00, 01:00, 02:00, 03:00) so higher timeframes get more, independent trades."""
    rows = []
    for off in range(hours):
        df = src if hours == 1 else resample(src, hours, off)
        p = Params(tf_hours=hours, **(p_over or {}))
        _, t = run(df, p)
        cut = df.index[len(df) // 2]
        t["half"] = np.where(df.index[t.bar.values] < cut, "1st", "2nd")
        rows.append(t)
    t = pd.concat(rows)
    out = t.groupby(["method", "half"]).apply(stats, include_groups=False).unstack("half")
    print(f"\n=== {name}  (k_magic={Params(tf_hours=hours).k_magic:.2f})")
    for half in ["1st", "2nd"]:
        tbl = out.xs(half, axis=1, level=1)
        print(f"-- {half} half of the data")
        print(tbl.round(2).to_string())
    if "AUTO" in t.method.values:
        print("AUTO picked:", t[t.method == "AUTO"].src.value_counts().to_dict())
    return t


if __name__ == "__main__":
    btc = load_btc(sys.argv[1] if len(sys.argv) > 1 else "ta_datas.csv")
    pd.set_option("display.width", 220)
    study("BTCUSD 1h", btc, 1)
    study("BTCUSD 4h", btc, 4)
    try:
        eur = load_eurusd()
        study("EURUSD 1h", eur, 1)
        study("EURUSD 4h", eur, 4)
    except ImportError:
        pass
