import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import UniviOrderProcessNodeView from "./UniviOrderProcessNodeView";
import {
  OrderProcessData,
  DEFAULT_ORDER_PROCESS_DATA,
  DEFAULT_ORDER_PROCESS_STEPS,
  normalizeOrderProcessData,
} from "../univisport/order-process/orderProcessData";

export interface UniviOrderProcessOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    univiOrderProcess: {
      /**
       * Chèn component Quy trình đặt hàng Univi (4 bước) vào vị trí con trỏ
       */
      setUniviOrderProcess: (options?: Partial<OrderProcessData>) => ReturnType;
    };
  }
}

export const UniviOrderProcessNode = Node.create<UniviOrderProcessOptions>({
  name: "univiOrderProcess",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      badge: {
        default: DEFAULT_ORDER_PROCESS_DATA.badge,
        parseHTML: (element) => {
          try {
            const propsStr = element.getAttribute("data-props");
            if (propsStr) {
              const p = JSON.parse(propsStr);
              if (p?.badge) return p.badge;
            }
          } catch {}
          return element.getAttribute("data-badge") || DEFAULT_ORDER_PROCESS_DATA.badge;
        },
        renderHTML: (attributes) => ({
          "data-badge": attributes.badge || DEFAULT_ORDER_PROCESS_DATA.badge,
        }),
      },

      title: {
        default: DEFAULT_ORDER_PROCESS_DATA.title,
        parseHTML: (element) => {
          try {
            const propsStr = element.getAttribute("data-props");
            if (propsStr) {
              const p = JSON.parse(propsStr);
              if (p?.title) return p.title;
            }
          } catch {}
          return element.getAttribute("data-title") || DEFAULT_ORDER_PROCESS_DATA.title;
        },
        renderHTML: (attributes) => ({
          "data-title": attributes.title || DEFAULT_ORDER_PROCESS_DATA.title,
        }),
      },

      steps: {
        default: DEFAULT_ORDER_PROCESS_STEPS,
        parseHTML: (element) => {
          try {
            const propsStr = element.getAttribute("data-props");
            if (propsStr) {
              const p = JSON.parse(propsStr);
              if (Array.isArray(p?.steps) && p.steps.length > 0) return p.steps;
            }
          } catch {}

          try {
            const stepsStr = element.getAttribute("data-steps");
            if (stepsStr) {
              const parsed = JSON.parse(stepsStr);
              if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
          } catch {}

          return DEFAULT_ORDER_PROCESS_STEPS;
        },
        renderHTML: (attributes) => ({
          "data-steps": JSON.stringify(attributes.steps || DEFAULT_ORDER_PROCESS_STEPS),
        }),
      },

      footerTitle: {
        default: DEFAULT_ORDER_PROCESS_DATA.footerTitle,
        parseHTML: (element) => {
          try {
            const propsStr = element.getAttribute("data-props");
            if (propsStr) {
              const p = JSON.parse(propsStr);
              if (p?.footerTitle) return p.footerTitle;
            }
          } catch {}
          return (
            element.getAttribute("data-footer-title") ||
            DEFAULT_ORDER_PROCESS_DATA.footerTitle
          );
        },
        renderHTML: (attributes) => ({
          "data-footer-title":
            attributes.footerTitle || DEFAULT_ORDER_PROCESS_DATA.footerTitle,
        }),
      },

      footerText: {
        default: DEFAULT_ORDER_PROCESS_DATA.footerText,
        parseHTML: (element) => {
          try {
            const propsStr = element.getAttribute("data-props");
            if (propsStr) {
              const p = JSON.parse(propsStr);
              if (p?.footerText) return p.footerText;
            }
          } catch {}
          return (
            element.getAttribute("data-footer-text") ||
            DEFAULT_ORDER_PROCESS_DATA.footerText
          );
        },
        renderHTML: (attributes) => ({
          "data-footer-text":
            attributes.footerText || DEFAULT_ORDER_PROCESS_DATA.footerText,
        }),
      },

      ctaText: {
        default: DEFAULT_ORDER_PROCESS_DATA.ctaText,
        parseHTML: (element) => {
          try {
            const propsStr = element.getAttribute("data-props");
            if (propsStr) {
              const p = JSON.parse(propsStr);
              if (p?.ctaText) return p.ctaText;
            }
          } catch {}
          return element.getAttribute("data-cta-text") || DEFAULT_ORDER_PROCESS_DATA.ctaText;
        },
        renderHTML: (attributes) => ({
          "data-cta-text": attributes.ctaText || DEFAULT_ORDER_PROCESS_DATA.ctaText,
        }),
      },

      ctaSubtext: {
        default: DEFAULT_ORDER_PROCESS_DATA.ctaSubtext,
        parseHTML: (element) => {
          try {
            const propsStr = element.getAttribute("data-props");
            if (propsStr) {
              const p = JSON.parse(propsStr);
              if (typeof p?.ctaSubtext === "string") return p.ctaSubtext;
            }
          } catch {}
          return (
            element.getAttribute("data-cta-subtext") ||
            DEFAULT_ORDER_PROCESS_DATA.ctaSubtext
          );
        },
        renderHTML: (attributes) => ({
          "data-cta-subtext":
            attributes.ctaSubtext || DEFAULT_ORDER_PROCESS_DATA.ctaSubtext,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-univi-order-process="true"]',
      },
      {
        tag: 'div[data-component="UniviOrderProcess"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const data: OrderProcessData = normalizeOrderProcessData({
      badge: node.attrs.badge,
      title: node.attrs.title,
      steps: node.attrs.steps,
      footerTitle: node.attrs.footerTitle,
      footerText: node.attrs.footerText,
      ctaText: node.attrs.ctaText,
      ctaSubtext: node.attrs.ctaSubtext,
    });

    const visibleSteps = data.steps.filter((s) => s.isVisible !== false);

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-component": "UniviOrderProcess",
        "data-univi-order-process": "true",
        "data-props": JSON.stringify(data),
        "data-badge": data.badge,
        "data-title": data.title,
        "data-steps": JSON.stringify(data.steps),
        "data-footer-title": data.footerTitle,
        "data-footer-text": data.footerText,
        "data-cta-text": data.ctaText,
        "data-cta-subtext": data.ctaSubtext,
        class: "univi-order-process-embed my-8",
      }),
      // Fallback HTML thân thiện SEO và SSR
      [
        "section",
        {
          class:
            "univi-order-process-seo bg-white border border-slate-200 rounded-2xl p-6 my-6",
        },
        data.badge ? ["div", { class: "text-xs font-bold text-[#105d97] uppercase mb-1" }, data.badge] : "",
        data.title ? ["h3", { class: "text-xl font-bold text-slate-900 mb-4" }, data.title] : "",
        [
          "ol",
          { class: "space-y-4 list-decimal pl-5" },
          ...visibleSteps.map((step) => [
            "li",
            { class: "text-slate-800 font-medium" },
            ["strong", { class: "text-[#105d97]" }, `Bước ${step.stepNumber}: ${step.title}`],
            ["p", { class: "text-sm text-slate-600 mt-1 font-normal" }, step.description],
          ]),
        ],
        [
          "div",
          { class: "mt-6 pt-4 border-t border-slate-200 text-center" },
          [
            "span",
            {
              class:
                "inline-block bg-[#105d97] text-white font-bold text-sm px-6 py-2.5 rounded-xl",
            },
            data.ctaText || "Bắt đầu quy trình đặt may ngay",
          ],
          data.ctaSubtext
            ? ["p", { class: "text-xs text-slate-500 mt-1.5" }, data.ctaSubtext]
            : "",
        ],
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(UniviOrderProcessNodeView);
  },

  addCommands() {
    return {
      setUniviOrderProcess:
        (options = {}) =>
        ({ commands }) => {
          const initialData: OrderProcessData = normalizeOrderProcessData({
            ...DEFAULT_ORDER_PROCESS_DATA,
            ...options,
          });

          return commands.insertContent({
            type: this.name,
            attrs: {
              badge: initialData.badge,
              title: initialData.title,
              steps: initialData.steps,
              footerTitle: initialData.footerTitle,
              footerText: initialData.footerText,
              ctaText: initialData.ctaText,
              ctaSubtext: initialData.ctaSubtext,
            },
          });
        },
    };
  },
});

export default UniviOrderProcessNode;

