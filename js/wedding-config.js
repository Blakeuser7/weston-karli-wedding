/*
  EDIT THIS FILE FIRST.
  Most frequently changed wedding details are kept here so you do not have to
  search through the HTML files.

  Dates use ISO format:
  YYYY-MM-DDTHH:MM:SS
*/
window.WEDDING_CONFIG = {
  couple: {
    firstName: "Weston",
    secondName: "Karli"
  },

  wedding: {
    dateTime: "2027-05-15T16:00:00",
    dateDisplay: "May 15, 2027",
    city: "City, Florida",
    ceremonyTime: "4:00 PM",
    cocktailTime: "5:00 PM",
    receptionTime: "6:00 PM",
    venueName: "Venue Name",
    venueLocation: "Venue Address or City, State",
    mapUrl: "https://maps.google.com/"
  },

  rsvp: {
    deadline: "2027-04-01",
    deadlineDisplay: "April 1, 2027",

    /*
      Paste your deployed Google Apps Script Web App URL below.
      It usually begins with:
      https://script.google.com/macros/s/...
    */
    endpoint: "https://script.google.com/macros/s/AKfycbwLrDRvC565U-CAyupoh_x0TfbxRk_Aqmnbz3V_x37eDO56k-X_YkOi3VWQY_FEZCkw/exec"
  },

  travel: {
    hotelName: "Hotel recommendation or room block",
    hotelUrl: "#",
    parkingInfo: "Complimentary parking will be available at the venue.",
    airportInfo: "Add the closest airport and approximate travel time."
  },

  registry: {
    registryOneUrl: "#",
    registryTwoUrl: "#"
  },

  faq: {
    dressCode: "Dress code information will be added here.",
    childrenPolicy: "Please add your children policy here.",
    contactEmail: "wedding@example.com"
  },

  /*
    Change setupMode to false before sharing the site with guests.
    This hides the small image-replacement labels.
  */
  setupMode: true
};
