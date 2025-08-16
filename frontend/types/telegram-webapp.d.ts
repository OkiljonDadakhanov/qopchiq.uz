declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe?: {
          user?: {
            id: number;
            username?: string;
            first_name?: string;
            last_name?: string;
            language_code?: string;
          };
        };
        expand(): void;
        setHeaderColor?(color: string): void;
        setBackgroundColor?(color: string): void;
        ready(): void;
        close(): void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show(): void;
          hide(): void;
          enable(): void;
          disable(): void;
          onClick(callback: () => void): void;
        };
        BackButton: {
          isVisible: boolean;
          show(): void;
          hide(): void;
          onClick(callback: () => void): void;
        };
        HapticFeedback: {
          impactOccurred(
            style: "light" | "medium" | "heavy" | "rigid" | "soft"
          ): void;
          notificationOccurred(type: "error" | "success" | "warning"): void;
          selectionChanged(): void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        colorScheme: "light" | "dark";
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        platform: string;
        version: string;
        initData: string;
        initDataUnsafe: any;
        sendData(data: string): void;
        switchInlineQuery(query: string, choose_chat_types?: string[]): void;
        openLink(url: string, options?: { try_instant_view?: boolean }): void;
        openTelegramLink(url: string): void;
        openInvoice(url: string, callback?: (status: string) => void): void;
        showPopup(
          params: {
            title?: string;
            message: string;
            buttons?: Array<{
              id?: string;
              type?: "default" | "ok" | "close" | "cancel" | "destructive";
              text: string;
            }>;
          },
          callback?: (buttonId: string) => void
        ): void;
        showAlert(message: string, callback?: () => void): void;
        showConfirm(
          message: string,
          callback?: (confirmed: boolean) => void
        ): void;
        showScanQrPopup(
          params: { text?: string },
          callback?: (data: string) => void
        ): void;
        closeScanQrPopup(): void;
        readTextFromClipboard(callback?: (data: string) => void): void;
        requestWriteAccess(callback?: (access: boolean) => void): void;
        requestContact(callback?: (contact: any) => void): void;
        invokeCustomMethod(
          method: string,
          params: any,
          callback?: (result: any) => void
        ): void;
        isVersionAtLeast(version: string): boolean;
        onEvent(eventType: string, eventHandler: (event: any) => void): void;
        offEvent(eventType: string, eventHandler: (event: any) => void): void;
      };
    };
  }
}

export {};
