import React from "react";
import { HolidayGreetingModal } from "./HolidayGreetingModal";
import type { HolidayPopupConfig } from "../../types/popup";
import { getHolidayDefaultTemplate } from "../../data/holidayTemplates";

interface NationalDay29PopupProps {
  holiday?: HolidayPopupConfig | null;
  campaignConfig?: {
    enabled?: boolean;
    startDate?: string;
    endDate?: string;
    autoCloseMs?: number;
    delayMs?: number;
  };
  forceShow?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export const NationalDay29Popup: React.FC<NationalDay29PopupProps> = ({
  holiday,
  campaignConfig,
  forceShow = false,
  onClose,
  onOpen,
}) => {
  const autoCloseSec =
    holiday?.autoCloseSeconds ||
    (campaignConfig?.autoCloseMs ? Math.round(campaignConfig.autoCloseMs / 1000) : 25);
  const delaySec = holiday?.delaySeconds || (campaignConfig?.delayMs ? Math.round(campaignConfig.delayMs / 1000) : 3);

  const defaultTpl = getHolidayDefaultTemplate("national_day_29");

  const data = {
    bannerImage: holiday?.bannerImage || defaultTpl.bannerImage,
    bannerAlt: holiday?.bannerAlt || defaultTpl.bannerAlt,
    bannerPosition: holiday?.bannerPosition || defaultTpl.bannerPosition,
    scriptTagline: holiday?.scriptTagline || defaultTpl.scriptTagline,
    mainTitle: holiday?.mainTitle || defaultTpl.mainTitle,
    dateSubtitle: holiday?.dateSubtitle || defaultTpl.dateSubtitle,
    recipientGreeting: holiday?.recipientGreeting || defaultTpl.recipientGreeting,
    wishes: holiday?.wishes && holiday.wishes.length > 0 ? holiday.wishes : defaultTpl.wishes,
    signature: holiday?.signature || defaultTpl.signature,
    actionText: holiday?.actionText || defaultTpl.actionText,
    actionCelebratedText: "Bắn Thêm Pháo Hoa Độc Lập 🇻🇳",
  };

  return (
    <HolidayGreetingModal
      data={data}
      autoCloseSeconds={autoCloseSec}
      delaySeconds={delaySec}
      forceShow={forceShow}
      onClose={onClose}
      onOpen={onOpen}
    />
  );
};

export default NationalDay29Popup;
