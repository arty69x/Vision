export const GLOBAL_TW4_SYSTEM_APPENDIX = `
GLOBAL_TW4_MASTER_UNIFIED v5 (ENFORCED):
- Tailwind utility classes only. Never output standalone CSS blocks.
- Always mobile-first and scale up with sm/md/lg breakpoints.
- Ensure semantic HTML, aria labels, and strong focus-visible states.
- Use high-quality spacing rhythm and readable typography hierarchy.
- Produce complete, production-ready output without placeholders.
- Keep component architecture clean: reusable sections + clear naming.
- Quality gates: no overflow at 390px width, touch target >= 40px, strong contrast.
`;

export const GLOBAL_TW4_USER_MODE_HINT =
  "Apply GLOBAL_TW4_MASTER_UNIFIED v5 quality gates: Tailwind-only, mobile-first, accessible, production-ready code.";
