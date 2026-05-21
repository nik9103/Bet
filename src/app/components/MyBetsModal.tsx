import svgPaths from "../../imports/Игра/svg-knj491ymhd";

export interface BetDisplay {
  id: string;
  marketName: string;
  amount: number;
  odds: number;
}

interface MyBetsModalProps {
  open: boolean;
  bets: BetDisplay[];
  potentialWin: number;
  onClose: () => void;
  onCollapse: () => void;
}

const LABEL_COLOR = "rgba(255, 255, 255, 0.3)";
const HEADER_LABEL_COLOR = "rgba(255, 255, 255, 0.5)";
const ACCENT_BLUE = "#1d73ff";

function formatBYN(value: number): string {
  return `${Math.round(value).toLocaleString("ru-RU")} BYN`;
}

function formatOdds(odds: number): string {
  return odds.toFixed(1).replace(".", ",");
}

export default function MyBetsModal({
  open,
  bets,
  potentialWin,
  onClose,
  onCollapse,
}: MyBetsModalProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[55] bg-black/50 pointer-events-auto"
        onClick={onClose}
        aria-hidden={false}
      />

      <div
        className="fixed inset-x-0 top-[16px] z-[60] flex flex-col pointer-events-auto"
        style={{ height: "calc(100dvh - 16px)" }}
      >
        <div className="bg-[#191e28] flex flex-col flex-1 min-h-0 overflow-hidden rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-8px_24px_rgba(0,0,0,0.4)]">
          {/* Header */}
          <div className="px-[16px] pt-[16px] pb-[20px] shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[8px] min-w-0">
                <p className="font-['Ubuntu:Bold',sans-serif] font-bold text-[20px] text-white leading-[24px]">
                  Мои ставки
                </p>
                <div className="bg-[rgba(255,255,255,0.08)] flex items-center justify-center min-w-[24px] h-[24px] px-[6px] rounded-[9999px] shrink-0">
                  <p className="font-['JetBrains_Mono:Bold',sans-serif] font-bold text-[12px] text-white leading-[16px]">
                    {bets.length}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCollapse}
                aria-label="Свернуть"
                className="flex items-center justify-center size-[32px] shrink-0 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] rounded-[4px] transition-colors"
              >
                <div className="overflow-clip relative shrink-0 size-[16px]">
                  <div className="absolute inset-[35.1%_25.1%_34.9%_25.16%]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.96895 3.6">
                      <path d={svgPaths.p28ffb980} fill="white" fillOpacity="0.5" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>

            <p className="font-['Geist_:Regular',sans-serif] text-[12px] leading-[16px] mt-[12px]">
              <span style={{ color: LABEL_COLOR }}>Общий возможный выигрыш: </span>
              <span className="font-['JetBrains_Mono:Bold',sans-serif] font-bold" style={{ color: ACCENT_BLUE }}>
                {formatBYN(potentialWin)}
              </span>
            </p>
          </div>

          {/* Column headers */}
          <div className="flex items-center px-[16px] pb-[8px] gap-[8px] shrink-0">
            <p
              className="flex-[1_0_0] font-['Ubuntu:Bold',sans-serif] font-bold text-[12px] uppercase leading-[12px] min-w-0"
              style={{ color: HEADER_LABEL_COLOR }}
            >
              Рынок
            </p>
            <p
              className="font-['Ubuntu:Bold',sans-serif] font-bold text-[12px] uppercase leading-[12px] text-right w-[40px] shrink-0"
              style={{ color: HEADER_LABEL_COLOR }}
            >
              Коэф
            </p>
            <p
              className="font-['Ubuntu:Bold',sans-serif] font-bold text-[12px] uppercase leading-[12px] text-right w-[88px] shrink-0"
              style={{ color: HEADER_LABEL_COLOR }}
            >
              Ставка
            </p>
          </div>

          {/* Bet list */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="flex flex-col">
              {bets.map((bet) => (
                <div key={bet.id}>
                  <div className="mx-[16px] h-px bg-[rgba(255,255,255,0.08)]" />
                  <div className="px-[16px] py-[12px]">
                    <div className="flex items-start gap-[8px]">
                      <p className="flex-[1_0_0] font-['Geist_:Regular',sans-serif] text-[12px] text-white leading-[16px] min-w-0">
                        {bet.marketName}
                      </p>
                      <p className="font-['Geist_:Bold',sans-serif] font-bold text-[12px] text-white leading-[16px] text-right w-[40px] shrink-0">
                        {formatOdds(bet.odds)}
                      </p>
                      <p className="font-['JetBrains_Mono:Bold',sans-serif] font-bold text-[12px] text-white leading-[16px] text-right w-[88px] shrink-0 whitespace-nowrap">
                        {formatBYN(bet.amount)}
                      </p>
                    </div>
                    <p className="font-['Geist_:Regular',sans-serif] text-[12px] leading-[14px] mt-[4px]" style={{ color: LABEL_COLOR }}>
                      Возможный выигрыш:{" "}
                      <span className="font-['JetBrains_Mono:Bold',sans-serif] font-normal">
                        {formatBYN(bet.amount * bet.odds)}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History button */}
          <div className="px-[16px] pb-[max(16px,env(safe-area-inset-bottom))] pt-[8px] shrink-0">
            <button
              type="button"
              className="bg-white w-full h-[44px] rounded-[9999px] flex items-center justify-center cursor-pointer hover:bg-[rgba(255,255,255,0.9)] active:scale-[0.98] transition-all"
            >
              <p className="font-['Ubuntu:Bold',sans-serif] font-bold text-[12px] text-[#13171f] uppercase leading-[16px] tracking-[0.02em]">
                История ставок
              </p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
