import React from "react";
import { HolidayGreetingModal } from "./HolidayGreetingModal";
import type { HolidayPopupConfig } from "../../types/popup";
import { getHolidayDefaultTemplate } from "../../data/holidayTemplates";

interface HolidayFestivePopupProps {
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

export const HolidayFestivePopup: React.FC<HolidayFestivePopupProps> = ({
  holiday,
  campaignConfig,
  forceShow = false,
  onClose,
  onOpen,
}) => {
  const autoCloseSec =
    holiday?.autoCloseSeconds ||
    (campaignConfig?.autoCloseMs ? Math.round(campaignConfig.autoCloseMs / 1000) : 30);
  const delaySec = holiday?.delaySeconds || (campaignConfig?.delayMs ? Math.round(campaignConfig.delayMs / 1000) : 3);

  const defaultTpl = getHolidayDefaultTemplate(holiday?.componentKey, holiday?.name);

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
    actionCelebratedText: "Bắn Thêm Pháo Hoa Chúc Mừng 🌸",
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

export default HolidayFestivePopup;
