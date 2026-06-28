/** Copy za portal — profesionalno, bez coaching tonova. */

export const PORTAL_ACCESS_TITLE = "Digitalni servis hotela";
export const PORTAL_ACCESS_LEAD =
  "Siguran ulaz u sistem za stanare, goste i osoblje Vojnog hotela.";
export const PORTAL_LOGIN_LEAD =
  "Izaberite ulogu i prijavite se brojem sobe ili službenim nalogom.";

export function isPresentationMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_SHOW_DEMO === "true" ||
    process.env.NODE_ENV === "development"
  );
}
