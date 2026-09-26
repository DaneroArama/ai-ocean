export type RegistrationCategory = "draft" | "submitted" | "verified" | "rejected";

export const CATEGORY_LABEL: Record<RegistrationCategory, string> = {
  draft: "Draft",
  submitted: "Submitted",
  verified: "Verified",
  rejected: "Rejected",
};

export const CATEGORY_STYLE: Record<RegistrationCategory, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-sky-100 text-sky-700",
  verified: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

/**
 * One bucket per buildathon registration. Payment outcome wins over the
 * submission state: verified/rejected are final, otherwise a submitted form
 * is waiting on payment verification and everything else is still a draft.
 */
export function registrationCategory(reg: {
  state: string;
  paymentStatus?: string;
}): RegistrationCategory {
  if (reg.paymentStatus === "verified") return "verified";
  if (reg.paymentStatus === "rejected") return "rejected";
  if (reg.state === "submitted") return "submitted";
  return "draft";
}
