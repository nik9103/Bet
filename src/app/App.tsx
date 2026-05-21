import { useState, useEffect, useRef } from "react";
import svgPaths from "../imports/Игра/svg-knj491ymhd";
import imgRectangle from "../imports/Игра/4721e1b2db6c165e7575e8064fc0fc40bca5338f.png";
import MyBetsModal from "./components/MyBetsModal";

interface Bet {
  id: string;
  amount: number;
  odds: number;
  marketName: string;
}

const BET_UNIT = 100;
const LABEL_COLOR = "rgba(255, 255, 255, 0.3)";
const ACCEPTED_TEXT_COLOR = "rgba(255, 255, 255, 0.2)";
const TIMER_TOTAL_TICKS = 1000; // 10.00 seconds in centiseconds
const MS_PER_TICK = 10;

const BET_MARKETS: Record<string, { marketName: string; odds: number }> = {
  "match-player1": { marketName: "Игрок 1 победит в матче", odds: 2.3 },
  "match-player2": { marketName: "Игрок 2 победит в матче", odds: 1.3 },
  "frame-player1": { marketName: "Игрок 1 победит в 1 фрейме", odds: 1.23 },
  "frame-draw": { marketName: "Ничья в 1 фрейме", odds: 4.16 },
  "frame-player2": { marketName: "Игрок 2 победит в 1 фрейме", odds: 1.3 },
};

export default function App() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_TOTAL_TICKS);
  const [highlightWin, setHighlightWin] = useState(false);
  const [betsAccepted, setBetsAccepted] = useState(false);
  const [winAmountHighlighted, setWinAmountHighlighted] = useState(false);
  const [isBetsModalOpen, setIsBetsModalOpen] = useState(false);
  const [isBetsModalExpanded, setIsBetsModalExpanded] = useState(true);
  const [timerSession, setTimerSession] = useState(0);
  const winHighlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightWinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timestamp-based countdown via rAF — reliable on mobile (setInterval(10ms) is throttled)
  useEffect(() => {
    if (betsAccepted) return;

    let rafId = 0;
    let cancelled = false;
    const endAt = performance.now() + TIMER_TOTAL_TICKS * MS_PER_TICK;

    const tick = () => {
      if (cancelled) return;

      const remainingMs = Math.max(0, endAt - performance.now());
      const nextTicks = Math.ceil(remainingMs / MS_PER_TICK);

      setTimeLeft((prev) => (prev === nextTicks ? prev : nextTicks));

      if (nextTicks <= 0) {
        setBetsAccepted(true);
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && !cancelled) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [betsAccepted, timerSession]);

  useEffect(() => {
    if (betsAccepted) {
      setIsBetsModalOpen(false);
    }
  }, [betsAccepted]);

  useEffect(() => {
    if (winHighlightTimerRef.current) {
      clearTimeout(winHighlightTimerRef.current);
    }

    if (bets.length === 0) {
      setWinAmountHighlighted(false);
      return;
    }

    setWinAmountHighlighted(true);
    winHighlightTimerRef.current = setTimeout(() => {
      setWinAmountHighlighted(false);
    }, 1000);

    return () => {
      if (winHighlightTimerRef.current) {
        clearTimeout(winHighlightTimerRef.current);
      }
    };
  }, [bets]);

  const handleBetClick = (id: string) => {
    if (betsAccepted) return; // Don't allow betting when bets are accepted

    const market = BET_MARKETS[id];
    if (!market) return;

    const betAmount = BET_UNIT;
    const existingBet = bets.find((b) => b.id === id);

    if (existingBet) {
      setHighlightWin(true);
      if (highlightWinTimerRef.current) clearTimeout(highlightWinTimerRef.current);
      highlightWinTimerRef.current = setTimeout(() => setHighlightWin(false), 300);
      setBets((prev) =>
        prev.map((b) => (b.id === id ? { ...b, amount: b.amount + betAmount } : b))
      );
    } else {
      setBets((prev) => [
        ...prev,
        { id, amount: betAmount, odds: market.odds, marketName: market.marketName },
      ]);
    }
  };

  const handleOpenBetsModal = () => {
    if (bets.length === 0) return;
    setIsBetsModalOpen(true);
    setIsBetsModalExpanded(true);
  };

  const handleCloseBetsModal = () => {
    setIsBetsModalOpen(false);
    setIsBetsModalExpanded(true);
  };

  const handleCollapseBetsModal = () => {
    setIsBetsModalOpen(false);
    setIsBetsModalExpanded(true);
  };

  const handleUndo = () => {
    if (betsAccepted || bets.length === 0) return;
    setBets((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (betsAccepted) return;
    setBets([]);
  };

  const handleDouble = () => {
    if (betsAccepted || bets.length === 0) return;
    setBets((prev) => prev.map((b) => ({ ...b, amount: b.amount * 2 })));
  };

  const handleRestart = () => {
    setBets([]);
    setTimeLeft(TIMER_TOTAL_TICKS);
    setBetsAccepted(false);
    setHighlightWin(false);
    setWinAmountHighlighted(false);
    setIsBetsModalOpen(false);
    setIsBetsModalExpanded(true);
    setTimerSession((s) => s + 1);
  };

  const totalBets = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const potentialWin = bets.reduce((sum, bet) => sum + bet.amount * bet.odds, 0);
  const getBetAmount = (id: string) => bets.find((b) => b.id === id)?.amount;
  const betbarActionsEnabled = bets.length > 0 && !betsAccepted;
  const getProgressBarColor = () => {
    if (betsAccepted) return "rgba(255, 255, 255, 0.2)";
    if (timeLeft <= 300) return "#fb2c36"; // <=3 seconds
    if (timeLeft <= 500) return "#ffc107"; // <=5 seconds
    return "#00c950";
  };

  const getTimerTextColor = () => {
    if (betsAccepted) return "rgba(255, 255, 255, 0.2)";
    if (timeLeft <= 300) return "#fb2c36"; // <=3 seconds
    if (timeLeft <= 500) return "#ffc107"; // <=5 seconds
    return "#00c950";
  };

  const getBackgroundBarColor = () => {
    if (betsAccepted) return "rgba(255, 255, 255, 0.1)";
    if (timeLeft <= 300) return "rgba(251, 44, 54, 0.1)"; // red with 10% opacity
    if (timeLeft <= 500) return "rgba(255, 193, 7, 0.1)"; // yellow with 10% opacity
    return "rgba(0, 201, 80, 0.1)"; // green with 10% opacity
  };

  const formatTime = () => {
    const seconds = Math.floor(timeLeft / 100);
    const centiseconds = timeLeft % 100;
    return `${seconds.toString().padStart(2, "0")}:${centiseconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-[#13171f] content-stretch flex flex-col items-start relative size-full min-h-dvh h-dvh overflow-hidden touch-manipulation">
      <div className="content-stretch flex flex-col items-start overflow-clip relative flex-1 w-full pb-[125px]">
        {/* Header */}
        <div className="bg-[#191e28] content-stretch drop-shadow-[0px_0.5px_0px_rgba(77,88,109,0.3)] flex h-[52px] items-center justify-between px-[16px] relative shrink-0 w-full">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
            <div className="content-stretch flex items-center relative rounded-[9999px] shrink-0">
              <div className="bg-[rgba(255,255,255,0.03)] content-stretch flex items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 size-[28px]">
                <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[16px]">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                    <path d={svgPaths.p37ac3c00} fill="white" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-[67px]">
              <div className="bg-[rgba(255,255,255,0.03)] content-stretch flex gap-[6px] h-[28px] items-center justify-center p-[8px] relative rounded-[9999px] shrink-0">
                <div className="[word-break:break-word] flex flex-col font-['Geist_:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white uppercase whitespace-nowrap">
                  <p className="leading-[12px]">все игры</p>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
            <div className="bg-[rgba(255,255,255,0.03)] content-stretch flex items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 size-[28px]">
              <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[16px]">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                  <path d={svgPaths.p32506100} fill="white" />
                </svg>
                <div className="absolute bg-[#fb2c36] bottom-[-6px] right-[-6px] rounded-[46px] size-[8px]" />
              </div>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] content-stretch flex items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 size-[28px]">
              <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[16px]">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                  <path d={svgPaths.p1aede100} fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Video Stream */}
        <div className="bg-[#0b0b0b] h-[202.5px] overflow-clip relative shrink-0 w-full">
          <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Ubuntu:Bold',sans-serif] justify-center leading-[0] left-1/2 -translate-x-1/2 not-italic text-white top-1/2 whitespace-nowrap">
            <p className="leading-[20px] text-[14px]">Видео стрим</p>
          </div>
          <button
            onClick={handleRestart}
            className="-translate-x-1/2 absolute bg-[rgba(255,255,255,0.08)] content-stretch cursor-pointer flex gap-[6px] items-center justify-center left-1/2 px-[12px] py-[6px] rounded-[6px] top-[calc(50%+24px)] hover:bg-[rgba(255,255,255,0.12)] transition-colors"
          >
            <div className="relative shrink-0 size-[14px]">
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <path d={svgPaths.p3377db00} fill="white" />
              </svg>
            </div>
            <p className="font-['Ubuntu:Bold',sans-serif] leading-[16px] text-[11px] text-white">Повторить</p>
          </button>
        </div>

        {/* Market Panel */}
        <div className="flex-1 relative w-full overflow-y-auto">
          <div className="overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex flex-col gap-[8px] items-start px-[12px] py-[8px] relative size-full">
              {/* Tabs */}
              <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
                <div className="content-stretch flex gap-[16px] h-[28px] items-start px-[12px] relative rounded-[8px] shrink-0">
                  <div className="content-stretch flex h-[28px] items-center justify-center py-[8px] relative shrink-0">
                    <div aria-hidden="true" className="absolute border-[#1d73ff] border-b-2 border-solid inset-0 pointer-events-none" />
                    <div className="[word-break:break-word] flex flex-col font-['Ubuntu:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap">
                      <p className="leading-[12px]">Все</p>
                    </div>
                  </div>
                  <div className="content-stretch flex h-[28px] items-center justify-center py-[8px] relative shrink-0">
                    <div className="[word-break:break-word] flex flex-col font-['Ubuntu:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.5)] uppercase whitespace-nowrap">
                      <p className="leading-[12px]">ФРЕЙМ</p>
                    </div>
                  </div>
                  <div className="content-stretch flex h-[28px] items-center justify-center py-[8px] relative shrink-0">
                    <div className="[word-break:break-word] flex flex-col font-['Ubuntu:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.5)] uppercase whitespace-nowrap">
                      <p className="leading-[12px]">МАТЧ</p>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex items-center justify-center px-[2px] py-[8px] relative rounded-[9999px] shrink-0 size-[20px]">
                  <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[16px]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                      <path d={svgPaths.p3377db00} fill="white" fillOpacity="0.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Market Groups */}
              <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                {/* Победитель матча */}
                <button className="bg-[#191e28] content-stretch cursor-pointer flex flex-col items-center overflow-clip relative rounded-[8px] shadow-[0px_0px_16px_-1px_rgba(0,0,0,0.05)] shrink-0 w-full">
                  <div className="h-[32px] relative shrink-0 w-full">
                    <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.05)] border-b border-solid inset-0 pointer-events-none" />
                    <div className="flex flex-row items-center justify-center size-full">
                      <div className="content-stretch flex gap-[4px] items-start justify-start p-[8px] relative size-full">
                        <div className="overflow-clip relative shrink-0 size-[12px]">
                          <div className="absolute inset-[35.1%_25.1%_34.9%_25.16%]">
                            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.96895 3.6">
                              <path d={svgPaths.p28ffb980} fill="white" fillOpacity="0.5" />
                            </svg>
                          </div>
                        </div>
                        <div className="[word-break:break-word] flex flex-col font-['Ubuntu:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white uppercase whitespace-nowrap">
                          <p className="leading-[12px]">Победитель матча</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative shrink-0 w-full">
                    <div className="content-stretch flex flex-col gap-[12px] items-start p-[8px] relative size-full">
                      <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
                        <div
                          onClick={() => handleBetClick("match-player1")}
                          className="bg-[#222733] drop-shadow-[0px_0px_8px_rgba(0,0,0,0.05)] flex-[1_0_0] h-[40px] min-w-px relative rounded-[4px] cursor-pointer hover:bg-[#2a3040] transition-all duration-300 ease-in-out"
                        >
                          <div className="flex flex-row items-center justify-center size-full">
                            <div className="content-stretch flex items-center justify-between px-[8px] py-[10px] relative size-full">
                              <div className="[word-break:break-word] flex flex-col font-['Geist_:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.7)] whitespace-nowrap">
                                <p className="leading-[12px]">Игрок 1</p>
                              </div>
                              {bets.find((b) => b.id === "match-player1") ? (
                                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[28px]">
                                  <div className="content-stretch flex items-start relative shrink-0 w-full">
                                    <div className="bg-[#00c950] h-[18px] relative rounded-[2px] shrink-0 w-[28px] animate-[scale-in_0.2s_ease-out] [transform:translateZ(0)]">
                                      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                                        <div className="content-stretch flex items-center justify-center relative size-full">
                                          <div className="[word-break:break-word] flex flex-col font-['JetBrains_Mono:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
                                            <p className="leading-[12px]">{getBetAmount("match-player1")}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(255,255,255,0.3)] border-solid inset-0 pointer-events-none rounded-[2px] shadow-[0px_0px_20px_0px_rgba(66,227,82,0.4)]" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="[word-break:break-word] flex flex-col font-['Geist_:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1d73ff] text-[12px] text-right whitespace-nowrap">
                                  <p className="leading-[16px]">2.30</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div
                          onClick={() => handleBetClick("match-player2")}
                          className="bg-[#222733] drop-shadow-[0px_0px_8px_rgba(0,0,0,0.05)] flex-[1_0_0] h-[40px] min-w-px relative rounded-[4px] cursor-pointer hover:bg-[#2a3040] transition-all duration-300 ease-in-out"
                        >
                          <div className="flex flex-row items-center justify-center size-full">
                            <div className="content-stretch flex items-center justify-between px-[8px] py-[10px] relative size-full">
                              <div className="[word-break:break-word] flex flex-col font-['Geist_:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.7)] whitespace-nowrap">
                                <p className="leading-[12px]">Игрок 2</p>
                              </div>
                              {bets.find((b) => b.id === "match-player2") ? (
                                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[28px]">
                                  <div className="content-stretch flex items-start relative shrink-0 w-full">
                                    <div className="bg-[#00c950] h-[18px] relative rounded-[2px] shrink-0 w-[28px] animate-[scale-in_0.2s_ease-out] [transform:translateZ(0)]">
                                      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                                        <div className="content-stretch flex items-center justify-center relative size-full">
                                          <div className="[word-break:break-word] flex flex-col font-['JetBrains_Mono:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
                                            <p className="leading-[12px]">{getBetAmount("match-player2")}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(255,255,255,0.3)] border-solid inset-0 pointer-events-none rounded-[2px] shadow-[0px_0px_20px_0px_rgba(66,227,82,0.4)]" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="[word-break:break-word] flex flex-col font-['Geist_:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1d73ff] text-[12px] text-right whitespace-nowrap">
                                  <p className="leading-[16px]">1.30</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Победитель 1 фрейма */}
                <button className="bg-[#191e28] content-stretch cursor-pointer flex flex-col items-center overflow-clip relative rounded-[8px] shadow-[0px_0px_16px_-1px_rgba(0,0,0,0.05)] shrink-0 w-full">
                  <div className="h-[32px] relative shrink-0 w-full">
                    <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.05)] border-b border-solid inset-0 pointer-events-none" />
                    <div className="flex flex-row items-center justify-center size-full">
                      <div className="content-stretch flex gap-[4px] items-start justify-start p-[8px] relative size-full">
                        <div className="overflow-clip relative shrink-0 size-[12px]">
                          <div className="absolute inset-[35.1%_25.1%_34.9%_25.16%]">
                            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.96895 3.6">
                              <path d={svgPaths.p28ffb980} fill="white" fillOpacity="0.5" />
                            </svg>
                          </div>
                        </div>
                        <div className="[word-break:break-word] flex flex-col font-['Ubuntu:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white uppercase whitespace-nowrap">
                          <p className="leading-[12px]">Победитель 1 фрейма</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative shrink-0 w-full">
                    <div className="content-stretch flex flex-col gap-[12px] items-start p-[8px] relative size-full">
                      <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
                        <div
                          onClick={() => handleBetClick("frame-player1")}
                          className="bg-[rgba(255,255,255,0.05)] flex-[1_0_0] h-[40px] min-w-px relative rounded-[4px] cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300 ease-in-out"
                        >
                          <div className="flex flex-row items-center justify-center size-full">
                            <div className="content-stretch flex items-center justify-between px-[8px] py-[10px] relative size-full">
                              <div className="[word-break:break-word] flex flex-col font-['Ubuntu:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.7)] whitespace-nowrap">
                                <p className="leading-[12px]">Игрок 1</p>
                              </div>
                              {bets.find((b) => b.id === "frame-player1") ? (
                                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[28px]">
                                  <div className="content-stretch flex items-start relative shrink-0 w-full">
                                    <div className="bg-[#00c950] h-[18px] relative rounded-[2px] shrink-0 w-[28px] animate-[scale-in_0.2s_ease-out] [transform:translateZ(0)]">
                                      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                                        <div className="content-stretch flex items-center justify-center relative size-full">
                                          <div className="[word-break:break-word] flex flex-col font-['JetBrains_Mono:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
                                            <p className="leading-[12px]">{getBetAmount("frame-player1")}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(255,255,255,0.3)] border-solid inset-0 pointer-events-none rounded-[2px] shadow-[0px_0px_20px_0px_rgba(66,227,82,0.4)]" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="[word-break:break-word] flex flex-col font-['Ubuntu:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1d73ff] text-[12px] text-right whitespace-nowrap">
                                  <p className="leading-[16px]">1.23</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div
                          onClick={() => handleBetClick("frame-draw")}
                          className="bg-[rgba(255,255,255,0.05)] flex-[1_0_0] h-[40px] min-w-px relative rounded-[4px] cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300 ease-in-out"
                        >
                          <div className="flex flex-row items-center justify-center size-full">
                            <div className="content-stretch flex items-center justify-between px-[8px] py-[10px] relative size-full">
                              <div className="[word-break:break-word] flex flex-col font-['Ubuntu:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.7)] whitespace-nowrap">
                                <p className="leading-[12px]">Ничья</p>
                              </div>
                              {bets.find((b) => b.id === "frame-draw") ? (
                                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[28px]">
                                  <div className="content-stretch flex items-start relative shrink-0 w-full">
                                    <div className="bg-[#00c950] h-[18px] relative rounded-[2px] shrink-0 w-[28px] animate-[scale-in_0.2s_ease-out] [transform:translateZ(0)]">
                                      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                                        <div className="content-stretch flex items-center justify-center relative size-full">
                                          <div className="[word-break:break-word] flex flex-col font-['JetBrains_Mono:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
                                            <p className="leading-[12px]">{getBetAmount("frame-draw")}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(255,255,255,0.3)] border-solid inset-0 pointer-events-none rounded-[2px] shadow-[0px_0px_20px_0px_rgba(66,227,82,0.4)]" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="[word-break:break-word] flex flex-col font-['Ubuntu:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1d73ff] text-[12px] text-right whitespace-nowrap">
                                  <p className="leading-[16px]">4.16</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div
                          onClick={() => handleBetClick("frame-player2")}
                          className="bg-[rgba(255,255,255,0.05)] flex-[1_0_0] h-[40px] min-w-px relative rounded-[4px] cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300 ease-in-out"
                        >
                          <div className="flex flex-row items-center justify-center size-full">
                            <div className="content-stretch flex items-center justify-between px-[8px] py-[10px] relative size-full">
                              <div className="[word-break:break-word] flex flex-col font-['Ubuntu:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.7)] whitespace-nowrap">
                                <p className="leading-[12px]">Игрок 2</p>
                              </div>
                              {bets.find((b) => b.id === "frame-player2") ? (
                                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[28px]">
                                  <div className="content-stretch flex items-start relative shrink-0 w-full">
                                    <div className="bg-[#00c950] h-[18px] relative rounded-[2px] shrink-0 w-[28px] animate-[scale-in_0.2s_ease-out] [transform:translateZ(0)]">
                                      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                                        <div className="content-stretch flex items-center justify-center relative size-full">
                                          <div className="[word-break:break-word] flex flex-col font-['JetBrains_Mono:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
                                            <p className="leading-[12px]">{getBetAmount("frame-player2")}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(255,255,255,0.3)] border-solid inset-0 pointer-events-none rounded-[2px] shadow-[0px_0px_20px_0px_rgba(66,227,82,0.4)]" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="[word-break:break-word] flex flex-col font-['Ubuntu:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1d73ff] text-[12px] text-right whitespace-nowrap">
                                  <p className="leading-[16px]">1.30</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Betbar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 h-[99px]">
            <div className="absolute content-stretch drop-shadow-[0px_-4px_10px_rgba(0,0,0,0.1)] flex flex-col isolate items-center inset-0">
            {/* Main buttons */}
            <div className="relative shrink-0 w-full z-[2]">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                <div className="h-[59px] relative shrink-0 w-full">
                  <div
                    className={`bg-clip-padding border-0 border-[transparent] border-solid relative size-full ${
                      betsAccepted ? "pointer-events-none" : ""
                    }`}
                  >
                    <div className="absolute bg-[#13171f] content-stretch flex inset-[18.64%_0_0_0] items-center overflow-clip rounded-tl-[8px] rounded-tr-[8px]">
                      <div className="content-stretch flex flex-[1_0_0] items-center min-w-px relative">
                        <button
                          onClick={handleClear}
                          disabled={!betbarActionsEnabled}
                          className={`bg-[#191e28] content-stretch flex flex-[1_0_0] h-[48px] items-center justify-center min-w-px relative rounded-tl-[8px] transition-all ${
                            betbarActionsEnabled ? "cursor-pointer hover:bg-[#222833]" : "cursor-not-allowed"
                          }`}
                        >
                          <div aria-hidden="true" className="absolute border border-[#13171f] border-solid inset-0 pointer-events-none rounded-tl-[8px]" />
                          <div className="relative shrink-0 size-[16px]">
                            <div className="-translate-y-1/2 absolute aspect-[7.9586029052734375/7.9586029052734375] left-[25.15%] right-[25.1%] top-1/2">
                              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.9586 7.9586">
                                <path d={svgPaths.p2c56c780} fill="white" fillOpacity={betbarActionsEnabled ? 1 : 0.1} />
                              </svg>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={handleUndo}
                          disabled={!betbarActionsEnabled}
                          className={`bg-[#191e28] content-stretch flex flex-[1_0_0] h-[48px] items-center justify-center min-w-px relative rounded-br-[8px] transition-all ${
                            betbarActionsEnabled ? "cursor-pointer hover:bg-[#222833]" : "cursor-not-allowed"
                          }`}
                        >
                          <div aria-hidden="true" className="absolute border-[#13171f] border-b border-r-[1.5px] border-solid border-t inset-0 pointer-events-none rounded-br-[8px]" />
                          <div className="relative shrink-0 size-[16px]">
                            <div className="-translate-y-1/2 absolute aspect-[9.90583324432373/9.105833053588867] left-[20.09%] right-[18%] top-[calc(50%-0.43px)]">
                              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.90583 9.10583">
                                <path d={svgPaths.p1dee7800} fill="white" fillOpacity={betbarActionsEnabled ? 1 : 0.1} />
                              </svg>
                            </div>
                          </div>
                        </button>
                      </div>
                      <div className="h-[48px] relative shrink-0 w-[159px]" />
                      <div className="content-stretch flex flex-[1_0_0] items-center min-w-px relative">
                        <button
                          disabled={true}
                          className="bg-[#191e28] content-stretch flex flex-[1_0_0] h-[48px] items-center justify-center min-w-px relative rounded-bl-[8px] cursor-not-allowed transition-all"
                        >
                          <div aria-hidden="true" className="absolute border-[#13171f] border-b border-l-[1.5px] border-solid border-t inset-0 pointer-events-none rounded-bl-[8px]" />
                          <div className="relative shrink-0 size-[16px]">
                            <div className="-translate-y-1/2 absolute aspect-[13.034666061401367/10.033500671386719] left-[9.27%] right-[9.26%] top-[calc(50%+0.01px)]">
                              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.0347 10.0335">
                                <path d={svgPaths.p13f1fe00} fill="white" fillOpacity="0.1" />
                              </svg>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={handleDouble}
                          disabled={!betbarActionsEnabled}
                          className={`bg-[#191e28] content-stretch flex flex-[1_0_0] h-[48px] items-center justify-center min-w-px relative rounded-tr-[8px] transition-all ${
                            betbarActionsEnabled ? "cursor-pointer hover:bg-[#222833]" : "cursor-not-allowed"
                          }`}
                        >
                          <div aria-hidden="true" className="absolute border border-[#13171f] border-solid inset-0 pointer-events-none rounded-tr-[8px]" />
                          <div className="relative shrink-0 size-[16px]">
                            <div className="-translate-y-1/2 absolute aspect-[10.009626388549805/6.400000095367432] left-[17.94%] right-[19.5%] top-1/2">
                              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.0096 6.4">
                                <path d={svgPaths.p11f8e580} fill="white" fillOpacity={betbarActionsEnabled ? 1 : 0.1} />
                              </svg>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                    <div className="-translate-x-1/2 absolute bottom-0 h-[59px] left-1/2 w-[160px]">
                      <div className="absolute h-[60px] left-[-15px] right-[-15px] top-0">
                        <div className="absolute h-[58px] left-0 right-0 top-px">
                          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 190 58">
                            <path
                              d={svgPaths.p13b08600}
                              fill="#191E28"
                              stroke="url(#paint0_linear_1_4618)"
                              strokeWidth="0.5"
                            />
                            <defs>
                              <linearGradient
                                gradientUnits="userSpaceOnUse"
                                id="paint0_linear_1_4618"
                                x1="95"
                                x2="95"
                                y1="57.5"
                                y2="3.68689e-07"
                              >
                                <stop stopColor="#191E28" />
                                <stop offset="1" stopColor="#222733" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="-translate-x-1/2 absolute bottom-[18.33%] left-1/2 top-[18.33%] w-[56px]">
                          <div className="absolute content-stretch flex flex-col items-start left-0 top-0 w-[56px]">
                            <div className="content-stretch flex items-start relative shrink-0 w-full">
                              <div className="bg-[#00c950] h-[38px] relative rounded-[4px] shrink-0 w-[56px]">
                                <div className="content-stretch flex items-center justify-center overflow-clip px-[14px] py-[10px] relative rounded-[inherit] size-full">
                                  <div className="[word-break:break-word] flex flex-col font-['JetBrains_Mono:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
                                    <p className="leading-[20px]">2</p>
                                  </div>
                                </div>
                                <div
                                  aria-hidden="true"
                                  className="absolute border-[0.5px] border-[rgba(255,255,255,0.3)] border-solid inset-0 pointer-events-none rounded-[4px]"
                                  style={{
                                    boxShadow: betsAccepted
                                      ? "none"
                                      : "0px 0px 20px 0px rgba(66,227,82,0.4)",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Betbar */}
            <div className="bg-[#191e28] h-[40px] relative shrink-0 w-full z-[1]">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                <div className="-translate-x-1/2 absolute bottom-0 h-[44px] left-1/2 w-[190px]">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 190 44">
                    <path d={svgPaths.pd1e5970} fill="#191E28" />
                  </svg>
                </div>
                {/* Timer Progress Bar */}
                <div className="absolute bottom-0 h-[40px] left-0 overflow-clip right-0">
                  <div className="absolute bottom-[-15px] h-[55px] left-0 overflow-clip right-0">
                    <div className="absolute inset-[36px_0_15px_0] transition-opacity duration-300" style={{ opacity: 1 }}>
                      <div
                        className="absolute inset-0 transition-colors duration-300"
                        style={{ backgroundColor: getBackgroundBarColor() }}
                      />
                    </div>
                    {/* Single progress bar — shrinks from both sides toward center */}
                    <div
                      className={`absolute bottom-[15px] h-[4px] left-1/2 -translate-x-1/2 will-change-[width] ${
                        betsAccepted ? "transition-[width] duration-500 ease-in-out" : ""
                      }`}
                      style={{
                        backgroundColor: getProgressBarColor(),
                        boxShadow: `0px 0px 20px 0px ${getProgressBarColor()}`,
                        width: betsAccepted ? "100%" : `${(timeLeft / TIMER_TOTAL_TICKS) * 100}%`,
                        transition: betsAccepted ? undefined : "none",
                      }}
                    />
                    <div
                      className="-translate-x-1/2 absolute left-1/2 transition-all duration-500 ease-in-out"
                      style={{ top: bets.length > 0 ? "5px" : "12px" }}
                    >
                      <div
                        className="[word-break:break-word] relative font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[0] text-center uppercase"
                        style={{ height: bets.length > 0 ? "28px" : "12px", width: "max-content" }}
                      >
                        {bets.length > 0 && (
                          <div
                            className="absolute left-1/2 flex gap-[2px] items-start text-[8px] whitespace-nowrap transition-[transform,color,font-size] duration-500 ease-in-out will-change-transform"
                            style={{
                              transform: `translate(-50%, ${betsAccepted ? "14px" : "0px"})`,
                            }}
                          >
                            <div
                              className="flex flex-col justify-center relative shrink-0 text-[8px] whitespace-nowrap transition-colors duration-500"
                              style={{
                                color: betsAccepted ? ACCEPTED_TEXT_COLOR : LABEL_COLOR,
                              }}
                            >
                              <p className="leading-[12px]">возможный выигрыш:</p>
                            </div>
                            <div
                              className="flex flex-col justify-center relative shrink-0 whitespace-nowrap transition-all duration-500"
                              style={{
                                fontSize: highlightWin && !betsAccepted ? "9px" : "8px",
                                color: betsAccepted
                                  ? ACCEPTED_TEXT_COLOR
                                  : winAmountHighlighted
                                    ? "white"
                                    : LABEL_COLOR,
                              }}
                            >
                              <p className="leading-[12px]">
                                {Math.round(potentialWin).toLocaleString("ru-RU")} BYN
                              </p>
                            </div>
                          </div>
                        )}
                        <div
                          className="absolute left-1/2 flex flex-col justify-center whitespace-nowrap transition-[transform,color,font-size] duration-500 ease-in-out will-change-transform"
                          style={{
                            transform: `translate(-50%, ${bets.length > 0 ? (betsAccepted ? "0px" : "14px") : "0px"})`,
                            color: getTimerTextColor(),
                            fontSize: betsAccepted || bets.length === 0 ? "10px" : "8px",
                          }}
                        >
                          <p className="leading-[12px]">
                            {betsAccepted ? "ставки приняты" : `${formatTime()} Делайте ставки`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute content-stretch flex gap-[4px] items-center pr-[12px] pt-[10px] right-0 top-0">
                  <div className="[word-break:break-word] flex flex-col font-['JetBrains_Mono:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[10px] text-right text-white uppercase whitespace-nowrap">
                    <p className="leading-[12px]">9 900 BYN</p>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.03)] content-stretch flex items-center relative rounded-[100px] shrink-0">
                    <div className="overflow-clip relative rounded-[50px] shrink-0 size-[16px]">
                      <div className="-translate-y-1/2 absolute aspect-[8.880499839782715/8.880499839782715] left-[22.25%] right-[22.25%] top-1/2">
                        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.8805 8.8805">
                          <path d={svgPaths.p33d13300} fill="white" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute content-stretch flex gap-[4px] items-center left-0 pl-[12px] pt-[10px] top-0">
                  <button
                    type="button"
                    onClick={handleOpenBetsModal}
                    disabled={bets.length === 0}
                    aria-label="Мои ставки"
                    className={`content-stretch flex items-center justify-center min-w-[16px] px-[4px] relative rounded-[46px] shrink-0 size-[16px] transition-all duration-300 ease-in-out ${
                      bets.length > 0 ? "cursor-pointer hover:opacity-80" : "cursor-default"
                    }`}
                    style={{
                      backgroundColor: bets.length > 0 ? "#1d73ff" : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <p className="[word-break:break-word] flex-[1_0_0] font-['JetBrains_Mono:Bold',sans-serif] font-bold leading-[12px] min-w-px relative text-[8px] text-center text-white transition-all duration-200">
                      {bets.length}
                    </p>
                  </button>
                  <div className="[word-break:break-word] flex flex-col font-['JetBrains_Mono:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap pointer-events-none">
                    <p className="leading-[12px] transition-all duration-300">
                      {bets.length > 0
                        ? `${Math.round(totalBets).toLocaleString("ru-RU")} BYN`
                        : "Ставок"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MyBetsModal
          open={isBetsModalOpen}
          expanded={isBetsModalExpanded}
          bets={bets}
          totalBets={totalBets}
          potentialWin={potentialWin}
          onClose={handleCloseBetsModal}
          onCollapse={handleCollapseBetsModal}
        />
      </div>

      <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0) translateZ(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) translateZ(0);
          }
          100% {
            transform: scale(1) translateZ(0);
            opacity: 1;
          }
        }

        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
}
