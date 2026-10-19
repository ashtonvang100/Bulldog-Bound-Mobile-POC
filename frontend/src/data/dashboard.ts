import type { ImageSourcePropType } from "react-native";
export const introduction =
  "Bulldog Bound is Fresno State’s guaranteed admissions program. It means that high school students from partnering school districts who meet the minimum California State University requirements are guaranteed a spot at Fresno State after they graduate.";
export type Preview = {
  title: string;
  description?: string;
  image?: ImageSourcePropType;
};
export const grades = [
  {
    title: "9th",
    image: require("../../assets/dashboard/grade9.png"),
    url: "https://fresnosandbox-prod.modolabs.net/default/dashboardtesting/_/bb_program_info9",
  },
  {
    title: "10th",
    image: require("../../assets/dashboard/grade10.png"),
    url: "https://fresnosandbox-prod.modolabs.net/default/dashboardtesting/_/bb_program_info10",
  },
  {
    title: "11th",
    image: require("../../assets/dashboard/grade11.png"),
    url: "https://fresnosandbox-prod.modolabs.net/default/dashboardtesting/_/bb_program_info11",
  },
  {
    title: "12th",
    image: require("../../assets/dashboard/grade12.png"),
    url: "https://fresnosandbox-prod.modolabs.net/default/dashboardtesting/_/bb_program_info12",
  },
] as const;
export const navigationItems = [
  "News",
  "Student",
  "Course Catalog",
  "Student Cupboard",
  "Campus Map",
  "Athletics",
  "Events",
  "Directory",
  "Emergency",
  "Library",
  "Links",
  "Social",
  "Campus Dining Hours",
  "Graduate Net",
  "Hire Fresno State",
  "BullDog Genie",
  "Bulldog Bound",
];
export const userItems = [
  "My favorites",
  "Sign in",
  "Messages",
  "Location and Persona",
];
