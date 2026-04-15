import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  eng: {
    nav: {
      corpName: "Odisha Tourism Development Corporation Ltd",
      corpSub: "(A Government of Odisha Undertaking)",
      cmTitle: "Hon'ble Chief Minister",
      cmName: "Shri Mohan Charan Majhi",
      home: "Home",
      destinations: "Destinations",
      hotels: "Hotels",
      flights: "Flights",
      bookings: "Bookings",
      packages: "Packages",
      signIn: "Sign In",
      account: "Account"
    },
    hero: {
      badge: "Discover your dream destination",
      title: "Find the",
      titleItalic: "perfect",
      titleEnd: "place to stay.",
      desc: "We provide a variety of the best hotels with the most complete facilities and stunning views to make your vacation perfect.",
      explore: "Explore Now",
      watch: "Watch Video",
      customers: "10k+ Customers",
      satisfied: "Satisfied around world",
      labels: {
        location: "Location",
        dates: "Dates",
        guests: "Guests"
      },
      placeholders: {
        location: "Where are you going?",
        dates: "Check in - Check out",
        guests: "2 Adults, 1 Child"
      },
      search: "Search"
    },
    footer: {
      desc: "We always make our customers happy by providing as many choices as possible.",
      about: "About",
      company: "Company",
      support: "Support",
      rights: "Odisha Tourism Development Corporation. All rights reserved."
    },
    testimonials: {
      badge: "Testimonials",
      title: "Satisfied Customers",
      data: [
        {
          id: 1,
          name: "Biswanath Dash",
          location: "Bhubaneswar, Odisha",
          content: "The Panthanivas stay was excellent. Our family loved the sea view and the authentic Odia breakfast was just like home.",
          avatar: "https://i.pravatar.cc/150?img=11",
          roomImage: "/assets/r1.png"
        },
        {
          id: 2,
          name: "Subhashree Mohanty",
          location: "Puri, Odisha",
          content: "Visiting Satpada was a dream come true. The boat ride to see the dolphins was well-organized by the staff.",
          avatar: "https://i.pravatar.cc/150?img=5",
          roomImage: "/assets/r2.jpg"
        },
        {
          id: 3,
          name: "Manoj Kumar",
          location: "Cuttack, Odisha",
          content: "Highly recommend the Barkul stay. The rooms are clean, and the view of Chilika lake at sunrise is simply majestic.",
          avatar: "https://i.pravatar.cc/150?img=68",
          roomImage: "/assets/r3.jpg"
        },
        {
          id: 4,
          name: "Priyanka Singh",
          location: "Sambalpur, Odisha",
          content: "A truly royal experience. The hospitality at the Taptapani hot springs resort was beyond our expectations.",
          avatar: "https://i.pravatar.cc/150?img=43",
          roomImage: "/assets/r5.jpg"
        }
      ]
    }
  },
  ori: {
    nav: {
      corpName: "ଓଡ଼ିଶା ପର୍ଯ୍ୟଟନ ବିକାଶ ନିଗମ ଲିମିଟେଡ୍",
      corpSub: "(ଓଡ଼ିଶା ସରକାରଙ୍କ ଏକ ଅନୁଷ୍ଠାନ)",
      cmTitle: "ମାନ୍ୟବର ମୁଖ୍ୟମନ୍ତ୍ରୀ",
      cmName: "ଶ୍ରୀ ମୋହନ ଚରଣ ମାଝୀ",
      home: "ମୁଖ୍ୟ ପୃଷ୍ଠା",
      destinations: "ଗନ୍ତବ୍ୟ ସ୍ଥଳ",
      hotels: "ହୋଟେଲ",
      flights: "ବିମାନ",
      bookings: "ବୁକିଂ",
      packages: "ପ୍ୟାକେଜ୍",
      signIn: "ସାଇନ୍ ଇନ୍",
      account: "ମୋ ଆକାଉଣ୍ଟ"
    },
    hero: {
      badge: "ଆପଣଙ୍କ ସ୍ୱପ୍ନର ଗନ୍ତବ୍ୟ ସ୍ଥଳ ଖୋଜନ୍ତୁ",
      title: "ରହିବା ପାଇଁ ଏକ",
      titleItalic: "ଉପଯୁକ୍ତ",
      titleEnd: "ସ୍ଥାନ ଖୋଜନ୍ତୁ",
      desc: "ଆମେ ଆପଣଙ୍କୁ ସର୍ବୋତ୍ତମ ହୋଟେଲ ଏବଂ ସମସ୍ତ ସୁବିଧା ସହିତ ସୁନ୍ଦର ଦୃଶ୍ୟ ପ୍ରଦାନ କରୁଛୁ ଯାହା ଆପଣଙ୍କ ଯାତ୍ରାକୁ ସ୍ମରଣୀୟ କରିବ।",
      explore: "ଏବେ ଦେଖନ୍ତୁ",
      watch: "ଭିଡିଓ ଦେଖନ୍ତୁ",
      customers: "୧୦ହଜାର+ ଅତିଥି",
      satisfied: "ସାରା ବିଶ୍ୱରେ ସନ୍ତୁଷ୍ଟ ଅତିଥି",
      labels: {
        location: "ସ୍ଥାନ",
        dates: "ତାରିଖ",
        guests: "ଅତିଥି"
      },
      placeholders: {
        location: "ଆପଣ କେଉଁଠାକୁ ଯାଉଛନ୍ତି?",
        dates: "ଆସିବା - ଯିବା ତାରିଖ",
        guests: "୨ ବୟସ୍କ, ୧ ଶିଶୁ"
      },
      search: "ଖୋଜନ୍ତୁ"
    },
    footer: {
      desc: "ଆମେ ସର୍ବଦା ଆମର ଅତିଥିମାନଙ୍କୁ ସର୍ବୋତ୍ତମ ସୁବିଧା ଏବଂ ବିକଳ୍ପ ପ୍ରଦାନ କରି ସନ୍ତୁଷ୍ଟ କରିବାକୁ ଚେଷ୍ଟା କରୁଛୁ।",
      about: "ଆମ ବିଷୟରେ",
      company: "କମ୍ପାନୀ",
      support: "ସହାୟତା",
      rights: "ଓଡ଼ିଶା ପର୍ଯ୍ୟଟନ ବିକାଶ ନିଗମ। ସମସ୍ତ ଅଧିକାର ସଂରକ୍ଷିତ।"
    },
    testimonials: {
      badge: "ସମୀକ୍ଷା",
      title: "ସନ୍ତୁଷ୍ଟ ଅତିଥି",
      data: [
        {
          id: 1,
          name: "ବିଶ୍ୱନାଥ ଦାଶ",
          location: "ଭୁବନେଶ୍ୱର, ଓଡ଼ିଶା",
          content: "ପାନ୍ଥନିବାସ ରହଣି ଅତ୍ୟନ୍ତ ଚମତ୍କାର ଥିଲା। ଆମ ପରିବାର ସମୁଦ୍ର କୂଳର ଦୃଶ୍ୟ ଏବଂ ସୁଆଦିଆ ଓଡ଼ିଆ ଜଳଖିଆକୁ ବହୁତ ପସନ୍ଦ କଲେ।",
          avatar: "https://i.pravatar.cc/150?img=11",
          roomImage: "/assets/r1.png"
        },
        {
          id: 2,
          name: "ସୁଭଦ୍ରା ମହାନ୍ତି",
          location: "ପୁରୀ, ଓଡ଼ିଶା",
          content: "ସାତପଡ଼ା ଭ୍ରମଣ ଏକ ସ୍ୱପ୍ନ ପରି ଥିଲା। ଡଲଫିନ ଦେଖିବା ପାଇଁ ବୋଟ୍ ରାଇଡ୍ ର ବ୍ୟବସ୍ଥା କର୍ମଚାରୀଙ୍କ ଦ୍ୱାରା ବହୁତ ଭଲ ଭାବରେ କରାଯାଇଥିଲା।",
          avatar: "https://i.pravatar.cc/150?img=5",
          roomImage: "/assets/r2.jpg"
        },
        {
          id: 3,
          name: "ମନୋଜ କୁମାର",
          location: "କଟକ, ଓଡ଼ିଶା",
          content: "ବରକୁଳ ରହଣି ପାଇଁ ମୁଁ ନିଶ୍ଚିତ ଭାବେ ପରାମର୍ଶ ଦେବି। ରୁମ୍ ଗୁଡିକ ବହୁତ ସଫା ଏବଂ ଚିଲିକା ହ୍ରଦର ସୂର୍ଯ୍ୟୋଦୟ ଦୃଶ୍ୟ ଅତ୍ୟନ୍ତ ମନୋରମ।",
          avatar: "https://i.pravatar.cc/150?img=68",
          roomImage: "/assets/r3.jpg"
        },
        {
          id: 4,
          name: "ପ୍ରିୟଙ୍କା ସିଂ",
          location: "ସମ୍ବଲପୁର, ଓଡ଼ିଶା",
          content: "ପ୍ରକୃତରେ ଏକ ଅଭୁଲା ଅନୁଭୂତି। ତପ୍ତପାଣି ଉଷ୍ଣ ପ୍ରସ୍ରବଣ ରିସର୍ଟର ଆତିଥ୍ୟ ଆମ ଆଶାଠାରୁ ବହୁତ କିଛି ଅଧିକ ଥିଲା।",
          avatar: "https://i.pravatar.cc/150?img=43",
          roomImage: "/assets/r5.jpg"
        }
      ]
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'eng');

  const setLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('preferredLang', newLang);
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
