import Script from "next/script";

export function ThemeScript() {
  return (
    <Script id="theme-init" strategy="beforeInteractive">
      {`(function(){try{var theme=localStorage.getItem("neuroblog-theme");var prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;if(theme==="dark"||(!theme&&prefersDark)){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch{}})();`}
    </Script>
  );
}
