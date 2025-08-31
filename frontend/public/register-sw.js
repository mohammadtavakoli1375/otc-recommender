// frontend/app/register-sw.ts
if (typeof window !== "undefined") {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  } else if ("serviceWorker" in navigator) {
    // Dev: همیشه SWهای قبلی را از ثبت خارج کن
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
  }
}