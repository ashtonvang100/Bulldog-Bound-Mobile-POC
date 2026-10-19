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
  {
    title: "News",
    url: "https://fresnosandbox-prod.modolabs.net/default/news_module/index",
  },
  {
    title: "Student",
    url: "https://cas.csufresno.edu/login?service=https%3A%2F%2Fshib-idp.its.csufresno.edu%2Fidp%2FAuthn%2FExternal%3Fconversation%3De1s1&entityId=https%3A%2F%2Fcmsweb.fresnostate.edu%2FCFRPRD",
  },
  { title: "Course Catalog", url: "https://catalog.fresnostate.edu/" },
  {
    title: "Student Cupboard",
    url: "https://studentaffairs.fresnostate.edu/foodsecurity/student-cupboard.html",
  },
  {
    title: "Campus Map",
    url: "https://fresnosandbox-prod.modolabs.net/default/map/index",
  },
  { title: "Athletics", url: "https://gobulldogs.com/" },
  {
    title: "Events",
    url: "https://fresnosandbox-prod.modolabs.net/default/calendar_module/index",
  },
  { title: "Directory", url: "https://directory.fresnostate.edu/" },
  {
    title: "Emergency",
    url: "https://fresnosandbox-prod.modolabs.net/default/emergency_contacts/index",
  },
  { title: "Library", url: "https://library.fresnostate.edu/" },
  {
    title: "Links",
    url: "https://fresnosandbox-prod.modolabs.net/default/links/index",
  },
  {
    title: "Social",
    url: "https://fresnosandbox-prod.modolabs.net/default/social_module/index",
  },
  {
    title: "Campus Dining Hours",
    url: "https://auxiliary.fresnostate.edu/association/dining/hours.html",
  },
  {
    title: "Graduate Net",
    url: "https://academics.fresnostate.edu/drgs/gssc?_kgourl_type=external&_kgourl_externalbrowser=1&_kgourl_targetnewwindow=1",
  },
  {
    title: "Hire Fresno State",
    url: "http://careercenter.fresnostate.edu/hirefresnostate.html",
  },
  { title: "BullDog Genie", url: "https://bulldoggenie.fresnostate.ai/" },
  {
    title: "Bulldog Bound",
    url: "https://fresnosandbox-prod.modolabs.net/default/dashboardtesting/_/bb_guest_dash",
  },
];
export const userItems = [
  "My favorites",
  "Sign in",
  "Messages",
  "Location and Persona",
];
