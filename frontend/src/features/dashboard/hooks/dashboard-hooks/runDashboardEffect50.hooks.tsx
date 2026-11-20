"use client";

export function runDashboardEffect50(getCtrl: () => any) {
  const triggerRefresh = () => {
    const fn = getCtrl()?.refreshLiveDashboard;
    if (typeof fn === "function") {
      fn();
    }
  };

  triggerRefresh();

  window.addEventListener("storage", triggerRefresh);
  window.addEventListener("saampark_company_switched", triggerRefresh);
  window.addEventListener("saampark_branch_switched", triggerRefresh);
  window.addEventListener("saampark_sub_branch_switched", triggerRefresh);
  window.addEventListener("saampark_subbranch_switched", triggerRefresh);

  return () => {
    window.removeEventListener("storage", triggerRefresh);
    window.removeEventListener("saampark_company_switched", triggerRefresh);
    window.removeEventListener("saampark_branch_switched", triggerRefresh);
    window.removeEventListener("saampark_sub_branch_switched", triggerRefresh);
    window.removeEventListener("saampark_subbranch_switched", triggerRefresh);
  };
}
