"use client";

export const save_cookie = (name: string, data: string) => {
   document.cookie = `${name}=${data}; path=/; max-age=${60 * 60 * 24 * 7}`; // Expires in 7 days
};

export const get_cookie = (key: string) => {
  const cookies = document.cookie.split("; ");

  
  for (let cookie of cookies) {
     const [cookieKey, cookieValue] = cookie.split("=");
    if (key === cookieKey) {
       return cookieValue;
    }
  }
  return null;
};
export const delete_cookie = (name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
  };