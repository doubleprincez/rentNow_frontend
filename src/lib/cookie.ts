export const getCookie = (name: string): string | null => {
  if (typeof document !== "undefined") {
    // for client side rendering
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      const separatorIndex = cookie.indexOf("=");
      if (separatorIndex !== -1) {
        const cookieName = cookie.substring(0, separatorIndex);
        if (cookieName === name) {
          return cookie.substring(separatorIndex + 1);
        }
      }
    }
  }
  return null;
};

export const setCookie = (cname: string, cvalue: string) => {
  if (typeof document !== "undefined") {
    // for client side rendering
    const d = new Date();
    d.setTime(d.getTime() + 2 * 60 * 60 * 1000); // 2 hours
    const expires = "expires=" + d.toUTCString();

    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
};

export const deleteCookie = (cname: string) => {
  if (typeof document !== "undefined") {
    // for client side rendering
    document.cookie = cname + "=" + "" + ";max-age=0path=/";
  }
};
