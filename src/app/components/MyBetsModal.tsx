import svgPaths from "../../imports/Игра/svg-knj491ymhd";

export interface BetDisplay {
  id: string;
  marketName: string;
  amount: number;
  odds: number;
}

interface MyBetsModalProps {
  open: boolean;
  expanded: boolean;
  bets: BetDisplay[];
  totalBets: number;
  potentialWin: number;
  onClose: () => void;
  onCollapse: () => void;
}

const LABEL_COLOR = "rgba(255, 255, 255, 0.3)";

function formatBYN(value: number): string {
  return `${Math.round(value).toLocaleString("ru-RU")} BYN`;
}

function formatOdds(odds: number): string {
  return odds.toFixed(1).replace(".", ",");
}

export default function MyBetsModal({
  open,
  expanded,
  bets,
  totalBets,
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

      <div className="fixed bottom-0 left-0 right-0 z-[60] flex flex-col max-h-[calc(100vh-52px)]">
        <div className="bg-[#191e28] flex flex-col min-h-0 max-h-[inherit] overflow-hidden rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-8px_24px_rgba(0,0,0,0.4)]">
          {/* Header */}
          <button
            type="button"
            onClick={onCollapse}
            className="flex items-center justify-between px-[16px] py-[14px] shrink-0 w-full cursor-pointer hover:bg-[rgba(255,255,255,0.03)] transition-colors"
          >
            <p className="font-['Ubuntu:Bold',sans-serif] font-bold text-[20px] text-white leading-[16px]">
              Мои ставки
            </p>
            <div
              className={`overflow-clip relative shrink-0 size-[16px] transition-transform duration-300 ${
                expanded ? "rotate-0" : "rotate-180"
              }`}
            >
              <div className="absolute inset-[35.1%_25.1%_34.9%_25.16%]">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.96895 3.6">
                  <path d={svgPaths.p28ffb980} fill="white" fillOpacity="0.5" />
                </svg>
              </div>
            </div>
          </button>

          {/* Expandable content */}
          <div
            className="overflow-hidden transition-[max-height] duration-300 ease-out min-h-0"
            style={{ maxHeight: expanded ? "520px" : "0px" }}
          >
            <div className="flex flex-col overflow-y-auto">
              {/* Column headers */}
              <div className="flex items-center px-[16px] pb-[8px] gap-[8px]">
                <p className="flex-[1_0_0] font-['Ubuntu:Bold',sans-serif] font-bold text-[12px] text-[rgba(255,255,255,0.5)] uppercase leading-[12px]">
                  Рынок
                </p>
                <p className="font-['Ubuntu:Bold',sans-serif] font-bold text-[12px] text-[rgba(255,255,255,0.5)] uppercase leading-[12px] text-right w-[36px] shrink-0">
                  Коэф
                </p>
                <p className="font-['Ubuntu:Bold',sans-serif] font-bold text-[12px] text-[rgba(255,255,255,0.5)] uppercase leading-[12px] text-right w-[72px] shrink-0">
                  Ставка
                </p>
              </div>

              {/* Bet rows */}
              <div className="flex flex-col">
                {bets.map((bet) => (
                  <div key={bet.id}>
                    <div className="mx-[16px] h-px bg-[rgba(255,255,255,0.08)]" />
                    <div className="px-[16px] py-[12px]">
                      <div className="flex items-start gap-[8px]">
                        <p className="flex-[1_0_0] font-['Geist_:Regular',sans-serif] text-[12px] text-white leading-[16px] min-w-0">
                          {bet.marketName}
                        </p>
                        <p className="font-['Geist_:Bold',sans-serif] font-bold text-[12px] text-white leading-[16px] text-right w-[36px] shrink-0">
                          {formatOdds(bet.odds)}
                        </p>
                        <p className="font-['JetBrains_Mono:Bold',sans-serif] font-bold text-[12px] text-white leading-[16px] text-right w-[72px] shrink-0 whitespace-nowrap">
                          {formatBYN(bet.amount)}
                        </p>
                      </div>
                      <p className="font-['Geist_:Regular',sans-serif] text-[10px] leading-[14px] mt-[4px]" style={{ color: LABEL_COLOR }}>
                        Возможный выигрыш:{" "}
                        <span className="font-['JetBrains_Mono:Bold',sans-serif]">
                          {formatBYN(bet.amount * bet.odds)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="mx-[16px] h-px bg-[rgba(255,255,255,0.08)]" />

              {/* ИТОГО */}
              <div className="px-[16px] py-[12px] flex flex-col gap-[8px]">
                <p className="font-['Ubuntu:Bold',sans-serif] font-bold text-[12px] text-[rgba(255,255,255,0.5)] uppercase leading-[12px]">
                  Итого
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-['Geist_:Regular',sans-serif] text-[12px] text-[rgba(255,255,255,0.3)] leading-[16px]">
                    Ставок:
                  </p>
                  <p className="font-['JetBrains_Mono:Bold',sans-serif] font-bold text-[12px] text-white leading-[16px]">
                    {bets.length}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-['Geist_:Regular',sans-serif] text-[12px] text-[rgba(255,255,255,0.3)] leading-[16px]">
                    Сумма ставок:
                  </p>
                  <p className="font-['JetBrains_Mono:Bold',sans-serif] font-bold text-[12px] text-white leading-[16px]">
                    {formatBYN(totalBets)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-['Geist_:Regular',sans-serif] text-[12px] text-[rgba(255,255,255,0.3)] leading-[16px]">
                    Возможный выигрыш:
                  </p>
                  <p className="font-['JetBrains_Mono:Bold',sans-serif] font-bold text-[12px] text-white leading-[16px]">
                    {formatBYN(potentialWin)}
                  </p>
                </div>
              </div>

              {/* History button */}
              <div className="px-[16px] pb-[16px] pt-[4px]">
                <button
                  type="button"
                  className="bg-white w-full h-[44px] rounded-[9999px] flex items-center justify-center cursor-pointer hover:bg-[rgba(255,255,255,0.9)] transition-colors"
                >
                  <p className="font-['Ubuntu:Bold',sans-serif] text-[12px] text-[#13171f] uppercase leading-[16px]">
                    История ставок
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
