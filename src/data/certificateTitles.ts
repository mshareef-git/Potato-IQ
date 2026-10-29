export const REGULAR_CERTIFICATE_TITLES: string[] = [
  "The Human Equivalent of an Empty Cabbage",
  "Professional Button Presser Potato",
  "Room-Temperature Braincell",
  "Bachelor of Potato Engineering",
  "Dogesh's Least Favourite Vegetable 🥔",
  "Certified Wi-Fi Potato",
  "A Single Pea Running on Windows 98",
  "The Last Braincell in Dogesh's Dog Bowl",
  "Professional Tail Chaser",
  "The Human Equivalent of an Empty Folder",
  "Certified Barking Broccoli",
  "The IQ of a Wet Dog Biscuit"
];

export const ALL_SKIPPED_TITLES: string[] = [
  "Professional Button Presser",
  "The Human Equivalent of an Empty Folder"
];

export const FINALE_DIALOGUE = [
  "HAHAHAHA! YOU ACTUALLY EXPECTED KING DOGESH TO BE CAPABLE OF TAKING AN IQ TEST?!",
  "BRO, I EAT MY HOMEWORK AND BARK AT MY OWN REFLECTION!",
  "MY IQ HAS BEEN AT ROOM-TEMPERATURE SINCE BIRTH!",
  "AND YOU LET ME JUDGE YOUR INTELLIGENCE. WE'RE BOTH COOKED."
];

export function getCertificateTitle(isAllSkipped: boolean): { title: string; extraRoast?: string; stamp?: string } {
  if (isAllSkipped) {
    const title = ALL_SKIPPED_TITLES[Math.floor(Math.random() * ALL_SKIPPED_TITLES.length)];
    return {
      title,
      extraRoast: "You skipped EVERYTHING. That's not a strategy, that's a lifestyle.",
      stamp: "PERFECT ATTENDANCE — ZERO PARTICIPATION"
    };
  }

  const title = REGULAR_CERTIFICATE_TITLES[Math.floor(Math.random() * REGULAR_CERTIFICATE_TITLES.length)];
  return { title };
}
