"use client";

// A page failing inside the signed-in area keeps the sidebar; the root
// boundary still catches the layout itself (the API unreachable on sign-in).
export { default } from "../error";
